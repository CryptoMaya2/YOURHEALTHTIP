import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import type { 
  HealthTip, 
  ReviewRecord, 
  CreateTipInput, 
  SubmitChallengeInput, 
  Category, 
  ReviewStatus,
  Challenge
} from '../types/tip';
import type { ITipService, TipFilterOptions } from './tipService';

/**
 * GenLayer Intelligent Contract Implementation of ITipService.
 * Connects to the deployed YourHealthTip Python contract using genlayer-js.
 * 
 * NOTE: Contract address is configured via VITE_GENLAYER_CONTRACT_ADDRESS.
 * Never hardcode private keys or testnet secrets into frontend source code.
 */
export class GenLayerTipService implements ITipService {
  private contractAddress: `0x${string}` | null = null;
  private client: ReturnType<typeof createClient> | null = null;

  constructor() {
    const envAddress = import.meta.env.VITE_GENLAYER_CONTRACT_ADDRESS;
    if (envAddress && envAddress.startsWith('0x')) {
      this.contractAddress = envAddress as `0x${string}`;
    }

    try {
      this.client = createClient({
        chain: studionet,
        endpoint: import.meta.env.VITE_GENLAYER_RPC_URL || undefined,
      });
    } catch (err) {
      console.warn('GenLayer client initialization deferred:', err);
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.contractAddress && this.client);
  }

  public getContractAddress(): string | null {
    return this.contractAddress;
  }

  private ensureConfigured(): void {
    if (!this.contractAddress || !this.client) {
      throw new Error(
        'GenLayer Intelligent Contract is not yet configured or deployed. ' +
        'Please deploy contracts/your_health_tip.py in GenLayer Studio and set VITE_GENLAYER_CONTRACT_ADDRESS in .env.'
      );
    }
  }

  async listTips(options: TipFilterOptions = {}): Promise<HealthTip[]> {
    this.ensureConfigured();
    const client = this.client!;
    const address = this.contractAddress!;

    // Call read-only view method to get all registered tip IDs
    const tipIds = (await client.readContract({
      address,
      functionName: 'get_all_tip_ids',
      args: [],
    })) as string[];

    if (!tipIds || tipIds.length === 0) {
      return [];
    }

    const tips: HealthTip[] = [];
    for (const id of tipIds) {
      try {
        const rawJson = (await client.readContract({
          address,
          functionName: 'get_tip',
          args: [id],
        })) as string;

        const parsed = JSON.parse(rawJson);
        tips.push(this.mapContractDataToTip(parsed));
      } catch (e) {
        console.error(`Failed to load on-chain tip ${id}:`, e);
      }
    }

    let result = [...tips];

    if (options.category && options.category !== 'all') {
      result = result.filter((t) => t.category === options.category);
    }

    if (options.status && options.status !== 'all') {
      result = result.filter((t) => t.status === options.status);
    }

    if (options.searchQuery && options.searchQuery.trim() !== '') {
      const q = options.searchQuery.toLowerCase().trim();
      result = result.filter((t) => 
        t.title.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        (t.region && t.region.toLowerCase().includes(q))
      );
    }

    const sort = options.sortBy || 'newest';
    result.sort((a, b) => {
      if (sort === 'newest') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
      if (sort === 'oldest') {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      }
      return 0;
    });

    return result;
  }

  async getTip(id: string): Promise<HealthTip | null> {
    this.ensureConfigured();
    const client = this.client!;
    const address = this.contractAddress!;

    try {
      const rawJson = (await client.readContract({
        address,
        functionName: 'get_tip',
        args: [id],
      })) as string;

      const parsed = JSON.parse(rawJson);
      return this.mapContractDataToTip(parsed);
    } catch {
      return null;
    }
  }

  async submitTip(input: CreateTipInput): Promise<HealthTip> {
    this.ensureConfigured();
    const client = this.client!;
    const address = this.contractAddress!;

    const uniqueId = `tip-onchain-${Date.now()}`;
    const cleanRegion = input.region?.trim() || 'Global';

    // Submit tip to GenLayer contract
    const txHash = await client.writeContract({
      address,
      functionName: 'submit_tip',
      args: [
        uniqueId,
        input.title.trim(),
        input.content.trim(),
        input.category,
        'Community Contributor',
        cleanRegion
      ],
      value: 0n,
    });

    // Wait for on-chain consensus finalization
    await client.waitForTransactionReceipt({ hash: txHash });

    const tip = await this.getTip(uniqueId);
    if (!tip) {
      throw new Error('Tip was submitted on-chain but could not be immediately retrieved.');
    }
    return tip;
  }

  async challengeTip(input: SubmitChallengeInput): Promise<HealthTip> {
    this.ensureConfigured();
    const client = this.client!;
    const address = this.contractAddress!;

    const txHash = await client.writeContract({
      address,
      functionName: 'challenge_tip',
      args: [
        input.tipId,
        input.challengerName?.trim() || 'Community Challenger',
        input.reason.trim(),
        input.evidenceUrl?.trim() || ''
      ],
      value: 0n,
    });

    await client.waitForTransactionReceipt({ hash: txHash });

    const updated = await this.getTip(input.tipId);
    if (!updated) {
      throw new Error(`Tip ${input.tipId} was challenged but could not be refreshed.`);
    }
    return updated;
  }

  async getReviewRecord(tipId: string): Promise<ReviewRecord | null> {
    this.ensureConfigured();
    const client = this.client!;
    const address = this.contractAddress!;

    try {
      const rawJson = (await client.readContract({
        address,
        functionName: 'get_review_record',
        args: [tipId],
      })) as string;

      const parsed = JSON.parse(rawJson);
      if (!parsed.has_review) return null;

      return {
        status: parsed.status as ReviewStatus,
        reviewedAt: parsed.reviewed_at,
        evaluator: parsed.evaluator,
        reasoning: parsed.reasoning,
        sourcesConsulted: parsed.sources_consulted ? [{
          title: parsed.sources_consulted,
          url: '',
          organization: 'Public Health Benchmark',
          excerpt: parsed.reasoning
        }] : [],
        contractTransactionRef: `GenLayer Verified: ${address}`
      };
    } catch {
      return null;
    }
  }

  async flagTip(_tipId: string, _reason: string): Promise<boolean> {
    // Flagging remains local / moderation-side in this phase
    return true;
  }

  async resetToDefaultSampleData(): Promise<void> {
    throw new Error('On-chain GenLayer contract state cannot be reset from client side.');
  }

  private mapContractDataToTip(raw: any): HealthTip {
    const firstSentence = raw.content.split(/[.?!]/)[0] || raw.content.substring(0, 120);
    const summary = firstSentence.length > 140 ? firstSentence.substring(0, 140) + '...' : firstSentence + '.';

    const challenges: Challenge[] = raw.has_challenge && raw.challenge ? [{
      id: `chal-onchain-${raw.id}`,
      tipId: raw.id,
      createdAt: raw.challenge.created_at || 'On-Chain',
      challengerName: raw.challenge.challenger || 'Community Challenger',
      reason: raw.challenge.reason || '',
      evidenceUrl: raw.challenge.evidence_url || undefined,
      status: 'under-review'
    }] : [];

    const review: ReviewRecord | undefined = raw.has_review && raw.review ? {
      status: raw.review.status as ReviewStatus,
      reviewedAt: raw.review.reviewed_at || 'Finalized On-Chain',
      evaluator: raw.review.evaluator || 'GenLayer Validator Consensus',
      reasoning: raw.review.reasoning || '',
      sourcesConsulted: raw.review.sources_consulted ? [{
        title: raw.review.sources_consulted,
        url: '',
        organization: 'Public Health Benchmark Sources',
        excerpt: raw.review.reasoning || ''
      }] : [],
      contractTransactionRef: `GenLayer Intelligent Contract: ${this.contractAddress}`
    } : undefined;

    return {
      id: raw.id,
      title: raw.title,
      content: raw.content,
      summary,
      category: raw.category as Category,
      region: raw.region || 'Global',
      submittedBy: raw.submitter || 'Community Contributor',
      submittedAt: raw.submitted_at || new Date().toISOString(),
      status: raw.status as ReviewStatus,
      isSampleData: false,
      review,
      challenges
    };
  }
}
