import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { settleTransaction, signatureError, PendingTransaction, TransactionFailure } from './transactionLifecycle';
import { TransactionStatus, TransactionHashVariant } from 'genlayer-js/types';
import type { HealthTip, ReviewRecord, CreateTipInput, SubmitChallengeInput, Category, ReviewStatus, EvidenceSource, TipReport } from '../types/tip';
import type { ITipService, TipFilterOptions } from './tipService';
import { getWalletAddress, getWriteClient } from './wallet';

type Client = ReturnType<typeof createClient>;

interface RawReview {
  status: ReviewStatus;
  reviewed_at: string;
  evaluator: string;
  reasoning: string;
  sources: EvidenceSource[];
}

interface RawChallenge {
  challenger: string;
  created_at: string;
  reason: string;
  evidence_url: string;
  status: string;
}

interface RawReport {
  reporter: string;
  reason: string;
  reported_at: string;
}

interface RawTip {
  id: string;
  title: string;
  content: string;
  category: Category;
  region: string;
  submitter: string;
  submitted_at: string;
  status: ReviewStatus;
  review: RawReview | null;
  reviews: RawReview[];
  challenges: RawChallenge[];
  supporting_sources: string[];
  flag_count: number;
  reports?: RawReport[];
  safety_alert?: boolean;
  safety_notice?: string;
}

export class GenLayerTipService implements ITipService {
  private address = import.meta.env.VITE_GENLAYER_CONTRACT_ADDRESS as `0x${string}` | undefined;
  private client = createClient({ chain: studionet, endpoint: import.meta.env.VITE_GENLAYER_RPC_URL || undefined });
  private versionChecked = false;

  public isConfigured() {
    return Boolean(this.address && /^0x[0-9a-fA-F]{40}$/.test(this.address));
  }

  public getContractAddress() {
    return this.address || null;
  }

  private async ready() {
    if (!this.isConfigured()) {
      throw new Error('Set VITE_GENLAYER_CONTRACT_ADDRESS to the deployed v3 contract address.');
    }
    if (!this.versionChecked) {
      try {
        const version = await this.client.readContract({
          address: this.address!,
          functionName: 'get_version',
          args: [], transactionHashVariant: TransactionHashVariant.LATEST_FINAL
        });
        if (version !== '3') {
          throw new Error('This frontend requires the YourHealthTip v3 contract. Deploy the updated contract first.');
        }
        const expected = import.meta.env.VITE_GENLAYER_SOURCE_SHA256;
        if (!expected || !/^[a-f0-9]{64}$/.test(expected)) throw new Error('Configure VITE_GENLAYER_SOURCE_SHA256 from the verified deployment manifest.');
        const source = await this.client.getContractCode(this.address!);
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
        const fingerprint = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
        if (fingerprint !== expected) throw new Error('Deployed contract source fingerprint does not match the reviewed source.');
        this.versionChecked = true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('v3 contract')) throw err;
        throw new Error(`Failed to connect to contract at ${this.address}. RPC response: ${msg}`);
      }
    }
  }

  private transactionKey(id: string) {
    return `yht:${studionet.id}:${this.address}:${id}:transactions`;
  }

  private transactions(id: string): Record<string, string> {
    try {
      return JSON.parse(localStorage.getItem(this.transactionKey(id)) || '{}');
    } catch {
      return {};
    }
  }

  private async write(id: string, functionName: string, args: Parameters<Client['writeContract']>[0]['args']) {
    await this.ready();
    const previousHash = this.transactions(id)[`pending_${functionName}`] || (functionName === 'submit_tip' ? this.transactions(id).submit_tip : undefined);
    let hash: Parameters<Client['waitForTransactionReceipt']>[0]['hash'];
    if (previousHash) {
      hash = previousHash as typeof hash;
    } else {
      const writer = await getWriteClient();
      try {
        hash = await writer.writeContract({address: this.address!, functionName, args, value: 0n});
      } catch (err: unknown) { throw signatureError(err); }
    }

    // Persist pending hash before waiting so state is never lost
    try {
      localStorage.setItem(
        this.transactionKey(id),
        JSON.stringify({ ...this.transactions(id), [`pending_${functionName}`]: hash })
      );
    } catch {
      /* optional local cache */
    }

    try {
      const receipt = await settleTransaction(String(hash), () => this.client.waitForTransactionReceipt({
        hash, status: TransactionStatus.FINALIZED, retries: 120, interval: 3000
      }));
      try {
        localStorage.setItem(`${this.transactionKey(id)}:${hash}:receipt`, JSON.stringify(receipt, (_, value) => typeof value === 'bigint' ? value.toString() : value));
      } catch { /* optional evidence cache */ }

      try {
        const tx = this.transactions(id);
        delete tx[`pending_${functionName}`];
        localStorage.setItem(this.transactionKey(id), JSON.stringify({ ...tx, [functionName]: hash }));
      } catch {
        /* optional local receipt cache */
      }
      return hash;
    } catch (err: unknown) {
      if (err instanceof PendingTransaction) throw err;
      if (err instanceof TransactionFailure) {
        try {
          const tx = this.transactions(id); delete tx[`pending_${functionName}`];
          localStorage.setItem(this.transactionKey(id), JSON.stringify({...tx, [`failed_${functionName}`]: hash}));
        } catch { /* optional cache */ }
      }
      // An explicit failed receipt is a failure, never a pending success.
      throw err;
    }
  }

  private mapRawTip(raw: RawTip): HealthTip {
    const tx = this.transactions(raw.id);
    const mapReview = (r: RawReview): ReviewRecord => ({
      status: r.status,
      reviewedAt: r.reviewed_at,
      evaluator: r.evaluator,
      reasoning: r.reasoning,
      sourcesConsulted: (r.sources || []).map(s => ({
        url: s.url,
        title: s.title || s.url,
        organization: s.organization || (s.url.startsWith('https://') ? s.url.slice(8).split('/')[0] : s.url),
        excerpt: s.excerpt || '',
        finding: s.finding || 'insufficient', justification: s.justification || ''
      })),
      contractTransactionRef: `Contract: ${this.address}`
    });

    const reports: TipReport[] = (raw.reports || []).map(rep => ({
      reporter: rep.reporter,
      reason: rep.reason,
      reportedAt: rep.reported_at
    }));

    return {
      id: raw.id,
      title: raw.title,
      content: raw.content,
      summary: raw.content.slice(0, 140) + (raw.content.length > 140 ? '...' : ''),
      category: raw.category,
      region: raw.region,
      submittedBy: raw.submitter,
      submittedAt: raw.submitted_at,
      status: raw.status,
      isSampleData: false,
      isCurrentUserSubmission: raw.submitter.toLowerCase() === getWalletAddress()?.toLowerCase(),
      supportingSources: raw.supporting_sources,
      flagCount: raw.flag_count,
      reports,
      safetyAlert: raw.safety_alert || raw.flag_count >= 3,
      safetyNotice: raw.safety_notice || (raw.flag_count >= 3 ? 'This health tip has received multiple independent community safety reports. Historical review records remain preserved below.' : undefined),
      review: raw.review
        ? {
            ...mapReview(raw.review),
            contractTransactionRef: tx.review_tip || `Contract: ${this.address}`
          }
        : undefined,
      reviewHistory: (raw.reviews || []).map(mapReview),
      transactions: tx,
      challenges: (raw.challenges || []).map((c, index) => ({
        id: `${raw.id}-${index}`,
        tipId: raw.id,
        createdAt: c.created_at,
        challengerName: c.challenger,
        reason: c.reason,
        evidenceUrl: c.evidence_url,
        status: c.status === 'resolved' ? 'resolved' : 'under-review'
      }))
    };
  }

  // Scalable, bounded reads: uses get_tips_paged to retrieve records efficiently in 1 call
  async listTips(options: TipFilterOptions = {}) {
    await this.ready();

    let tips: HealthTip[] = [];

    const pagedJson = await this.client.readContract({
      address: this.address!, functionName: 'get_tips_paged',
      args: [options.offset || 0, Math.min(options.limit || 25, 25)], transactionHashVariant: TransactionHashVariant.LATEST_FINAL
    }) as string;
    const rawTips = JSON.parse(pagedJson) as RawTip[];
    tips = rawTips.map(r => this.mapRawTip(r));

    return tips
      .filter(
        t =>
          (!options.currentUserOnly || t.isCurrentUserSubmission) &&
          (!options.category || options.category === 'all' || t.category === options.category) &&
          (!options.status || options.status === 'all' || t.status === options.status) &&
          (!options.searchQuery ||
            `${t.title} ${t.content} ${t.region}`.toLowerCase().includes(options.searchQuery.trim().toLowerCase()))
      )
      .sort((a, b) =>
        options.sortBy === 'oldest'
          ? Date.parse(a.submittedAt) - Date.parse(b.submittedAt)
          : options.sortBy === 'recently-reviewed'
          ? (Date.parse(b.review?.reviewedAt || '') || 0) - (Date.parse(a.review?.reviewedAt || '') || 0)
          : Date.parse(b.submittedAt) - Date.parse(a.submittedAt)
      );
  }

  async getTip(id: string): Promise<HealthTip | null> {
    await this.ready();
    const raw = JSON.parse(
      (await this.client.readContract({
        address: this.address!,
        functionName: 'get_tip',
        args: [id], transactionHashVariant: TransactionHashVariant.LATEST_FINAL
      })) as string
    ) as RawTip;

    return this.mapRawTip(raw);
  }

  async submitTip(input: CreateTipInput) {
    if (!input.generalHealthAcknowledgement) {
      throw new Error('Confirm the general health educational acknowledgement.');
    }
    // Recover the same submission after a timeout instead of creating a duplicate tip.
    const payload = new TextEncoder().encode(JSON.stringify(input));
    const digest = await crypto.subtle.digest('SHA-256', payload);
    const draftKey = `yht:${this.address}:${getWalletAddress()}:draft:${Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')}`;
    let id = `tip-${crypto.randomUUID()}`;
    try { id = localStorage.getItem(draftKey) || id; localStorage.setItem(draftKey, id); } catch { /* optional cache */ }
    await this.write(id, 'submit_tip', [
      id,
      input.title.trim(),
      input.content.trim(),
      input.category,
      '',
      input.region?.trim() || 'Global',
      JSON.stringify(input.supportingSources || [])
    ]);
    const tip = (await this.getTip(id))!;
    try { localStorage.removeItem(draftKey); } catch { /* optional cache */ }
    return tip;
  }

  async reviewTip(id: string, sourceUrl = '') {
    await this.write(id, 'review_tip', [id, sourceUrl]);
    const tip = (await this.getTip(id))!;
    if (['pending', 'under-challenge'].includes(tip.status)) {
      throw new Error('Review transaction submitted but review not yet recorded. Please refresh result.');
    }
    return tip;
  }

  async challengeTip(input: SubmitChallengeInput) {
    await this.write(input.tipId, 'challenge_tip', [
      input.tipId,
      '',
      input.reason.trim(),
      input.evidenceUrl?.trim() || ''
    ]);
    const tip = (await this.getTip(input.tipId))!;
    if (tip.status !== 'under-challenge') throw new Error('Finalized challenge state could not be confirmed; refresh before retrying.');
    return tip;
  }

  async exportVerificationRecord(id: string): Promise<Record<string, unknown>> {
    await this.ready();
    const transactions = this.transactions(id);
    const receipts: Record<string, unknown> = {};
    for (const [action, hash] of Object.entries(transactions)) {
      try { receipts[action] = JSON.parse(localStorage.getItem(`${this.transactionKey(id)}:${hash}:receipt`) || 'null'); }
      catch { receipts[action] = null; }
    }
    return {generatedAt:new Date().toISOString(), browserOrigin:window.location.origin, chainId:studionet.id,
      contractAddress:this.address, contractVersion:'3', sourceSha256:import.meta.env.VITE_GENLAYER_SOURCE_SHA256,
      transactions, locallyCapturedReceipts:receipts, finalizedTip:await this.getTip(id),
      note:'Fetch public receipts independently. Missing lifecycle actions are not verified by this export.'};
  }

  async getHistory(id: string, kind: 'reviews' | 'challenges' | 'reports', offset = 0): Promise<Record<string, unknown>[]> {
    await this.ready();
    const json = await this.client.readContract({address: this.address!, functionName: 'get_history_paged',
      args: [id, kind, offset, 10], transactionHashVariant: TransactionHashVariant.LATEST_FINAL}) as string;
    return JSON.parse(json);
  }

  async getReviewRecord(id: string) {
    return (await this.getTip(id))?.review || null;
  }

  async flagTip(id: string, reason: string) {
    await this.write(id, 'flag_tip', [id, reason]);
    const tip = await this.getTip(id);
    if (!tip?.reports?.some(r => r.reporter.toLowerCase() === getWalletAddress()?.toLowerCase())) {
      throw new Error('Finalized report state could not be confirmed; refresh before retrying.');
    }
    return true;
  }

  async resetToDefaultSampleData(): Promise<void> {
    throw new Error('Network records cannot be reset from the browser.');
  }
}
