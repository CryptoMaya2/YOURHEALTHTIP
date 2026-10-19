import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';
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
      throw new Error('Set VITE_GENLAYER_CONTRACT_ADDRESS to the deployed v2 contract address.');
    }
    if (!this.versionChecked) {
      try {
        const version = await this.client.readContract({
          address: this.address!,
          functionName: 'get_version',
          args: []
        });
        if (version !== '2') {
          throw new Error('This frontend requires the YourHealthTip v2 contract. Deploy the updated contract first.');
        }
        this.versionChecked = true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('v2 contract')) throw err;
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
    const writer = await getWriteClient();
    let hash: Parameters<Client['waitForTransactionReceipt']>[0]['hash'];

    try {
      hash = await writer.writeContract({
        address: this.address!,
        functionName,
        args,
        value: 0n
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        (typeof err === 'object' && err !== null && 'code' in err && (err as { code: number }).code === 4001) ||
        /user rejected|user denied|cancelled|declined/i.test(msg)
      ) {
        throw new Error('Transaction declined: Signature request was cancelled in your wallet.');
      }
      if (/account changed/i.test(msg)) {
        throw new Error('Wallet account changed. Please reconnect and retry.');
      }
      throw new Error(`Failed to submit transaction to GenLayer: ${msg}`);
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
      const receipt = await this.client.waitForTransactionReceipt({
        hash,
        status: TransactionStatus.ACCEPTED,
        retries: 120,
        interval: 3000
      });

      const status = String(receipt.statusName || receipt.status);
      if (
        !['ACCEPTED', 'FINALIZED', '5', '7'].includes(status) ||
        (receipt.txExecutionResultName && receipt.txExecutionResultName !== 'FINISHED_WITH_RETURN') ||
        receipt.consensus_data?.leader_receipt?.some(
          r => r.mode === 'leader' && (r.error || /error|fail|revert/i.test(r.execution_result))
        )
      ) {
        let revertReason = `Transaction ${hash} did not succeed (${status}).`;
        const leaderErr = receipt.consensus_data?.leader_receipt?.find(r => r.mode === 'leader')?.execution_result;
        if (leaderErr) revertReason += ` Execution detail: ${leaderErr}`;
        throw new Error(revertReason);
      }

      try {
        const tx = this.transactions(id);
        delete tx[`pending_${functionName}`];
        localStorage.setItem(this.transactionKey(id), JSON.stringify({ ...tx, [functionName]: hash }));
      } catch {
        /* optional local receipt cache */
      }
      return hash;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/did not succeed|Execution detail/i.test(msg)) {
        throw err;
      }
      // Receipt timeout or provisional state: never represent as finalized or failed without verification
      throw new Error(
        `Transaction ${hash} is pending validator consensus on GenLayer Studio. It has not yet finalized. Please refresh the result in a few moments rather than resubmitting immediately.`
      );
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
        finding: s.finding || 'insufficient'
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

    try {
      // First attempt efficient paginated read
      const pagedJson = await this.client.readContract({
        address: this.address!,
        functionName: 'get_tips_paged',
        args: [0, 25]
      }) as string;

      const rawTips = JSON.parse(pagedJson) as RawTip[];
      tips = rawTips.map(r => this.mapRawTip(r));
    } catch {
      // Fallback for deployments that only support get_all_tip_ids
      const ids = await this.client.readContract({
        address: this.address!,
        functionName: 'get_all_tip_ids',
        args: []
      }) as string[];

      // Bounded read (up to 25 items)
      const boundedIds = ids.slice(0, 25);
      const fetched = await Promise.all(
        boundedIds.map(id => this.getTip(id).catch(() => null))
      );
      tips = fetched.filter((t): t is HealthTip => t !== null);
    }

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
        args: [id]
      })) as string
    ) as RawTip;

    return this.mapRawTip(raw);
  }

  async submitTip(input: CreateTipInput) {
    if (!input.generalHealthAcknowledgement) {
      throw new Error('Confirm the general health educational acknowledgement.');
    }
    const id = `tip-${crypto.randomUUID()}`;
    await this.write(id, 'submit_tip', [
      id,
      input.title.trim(),
      input.content.trim(),
      input.category,
      '',
      input.region?.trim() || 'Global',
      JSON.stringify(input.supportingSources || [])
    ]);
    return (await this.getTip(id))!;
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
    return (await this.getTip(input.tipId))!;
  }

  async getReviewRecord(id: string) {
    return (await this.getTip(id))?.review || null;
  }

  async flagTip(id: string, reason: string) {
    await this.write(id, 'flag_tip', [id, reason]);
    return true;
  }

  async resetToDefaultSampleData(): Promise<void> {
    throw new Error('Network records cannot be reset from the browser.');
  }
}
