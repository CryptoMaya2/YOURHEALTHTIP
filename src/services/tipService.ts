import type { 
  HealthTip, 
  ReviewRecord, 
  CreateTipInput, 
  SubmitChallengeInput, 
  Category, 
  ReviewStatus,
  Challenge
} from '../types/tip';
import { INITIAL_SAMPLE_TIPS } from './sampleData';

export interface TipFilterOptions {
  category?: Category | 'all';
  status?: ReviewStatus | 'all';
  searchQuery?: string;
  sortBy?: 'newest' | 'recently-reviewed' | 'oldest';
  currentUserOnly?: boolean;
}

// Shared interface for local demonstration and GenLayer v2 services.
export interface ITipService {
  listTips(options?: TipFilterOptions): Promise<HealthTip[]>;
  getTip(id: string): Promise<HealthTip | null>;
  submitTip(input: CreateTipInput): Promise<HealthTip>;
  challengeTip(input: SubmitChallengeInput): Promise<HealthTip>;
  getReviewRecord(tipId: string): Promise<ReviewRecord | null>;
  reviewTip(tipId: string, sourceUrl?: string): Promise<HealthTip>;
  flagTip(tipId: string, reason: string): Promise<boolean>;
  resetToDefaultSampleData(): Promise<void>;
}

const STORAGE_KEY = 'yourhealthtip_local_tips_v1';
const CURRENT_USER_NAME = 'You (Local Demo Contributor)';

class MockTipService implements ITipService {
  private tips: HealthTip[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.tips = JSON.parse(stored);
      } else {
        this.tips = [...INITIAL_SAMPLE_TIPS];
        this.saveToStorage();
      }
    } catch {
      this.tips = [...INITIAL_SAMPLE_TIPS];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tips));
    } catch {
      // Ignore local storage write errors
    }
  }

  async listTips(options: TipFilterOptions = {}): Promise<HealthTip[]> {
    // Simulate brief network latency for realistic UX feel
    await new Promise((resolve) => setTimeout(resolve, 80));

    let result = [...this.tips];

    if (options.currentUserOnly) {
      result = result.filter((t) => t.isCurrentUserSubmission);
    }

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
      if (sort === 'recently-reviewed') {
        const timeA = a.review?.reviewedAt ? new Date(a.review.reviewedAt).getTime() : 0;
        const timeB = b.review?.reviewedAt ? new Date(b.review.reviewedAt).getTime() : 0;
        return timeB - timeA;
      }
      return 0;
    });

    return result;
  }

  async getTip(id: string): Promise<HealthTip | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const tip = this.tips.find((t) => t.id === id);
    return tip ? { ...tip } : null;
  }

  async submitTip(input: CreateTipInput): Promise<HealthTip> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Generate first sentence or brief summary
    const firstSentence = input.content.split(/[.?!]/)[0] || input.content.substring(0, 120);
    const summary = firstSentence.length > 140 ? firstSentence.substring(0, 140) + '...' : firstSentence + '.';

    const newTip: HealthTip = {
      id: `tip-user-${Date.now()}`,
      title: input.title.trim(),
      content: input.content.trim(),
      summary: summary,
      category: input.category,
      region: input.region?.trim() || 'Global',
      submittedBy: CURRENT_USER_NAME,
      isCurrentUserSubmission: true,
      submittedAt: new Date().toISOString(),
      supportingSources: input.supportingSources || [],
      status: 'pending', // Starts in Pending Review
      review: undefined,
      isSampleData: false,
      challenges: []
    };

    // Prepend to top of list
    this.tips = [newTip, ...this.tips];
    this.saveToStorage();

    return { ...newTip };
  }

  async challengeTip(input: SubmitChallengeInput): Promise<HealthTip> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const index = this.tips.findIndex((t) => t.id === input.tipId);
    if (index === -1) {
      throw new Error(`Tip not found: ${input.tipId}`);
    }

    const tip = this.tips[index];

    // Duplicate challenge prevention
    const normReason = input.reason.trim().toLowerCase();
    const cleanUrl = input.evidenceUrl?.trim().toLowerCase();
    for (const c of tip.challenges || []) {
      if (cleanUrl && c.evidenceUrl && c.evidenceUrl.toLowerCase() === cleanUrl) {
        throw new Error('A challenge citing this evidence URL has already been submitted.');
      }
      if (c.reason.trim().toLowerCase() === normReason) {
        throw new Error('An identical challenge reason has already been submitted.');
      }
    }

    const newChallenge: Challenge = {
      id: `chal-${Date.now()}`,
      tipId: tip.id,
      createdAt: new Date().toISOString(),
      challengerName: input.challengerName?.trim() || 'Community Challenger',
      reason: input.reason.trim(),
      evidenceUrl: input.evidenceUrl?.trim(),
      status: 'under-review'
    };

    // When challenged, status transitions to 'under-challenge'
    const updatedChallenges = [...(tip.challenges || []), newChallenge];
    const updatedTip: HealthTip = {
      ...tip,
      status: 'under-challenge',
      challenges: updatedChallenges,
      review: tip.review ? {
        ...tip.review,
        status: 'under-challenge',
        challengeCount: updatedChallenges.length
      } : undefined
    };

    this.tips[index] = updatedTip;
    this.saveToStorage();

    return { ...updatedTip };
  }

  async reviewTip(_tipId: string): Promise<HealthTip> {
    throw new Error('Live evidence review requires GenLayer mode and a connected wallet.');
  }

  async getReviewRecord(tipId: string): Promise<ReviewRecord | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const tip = this.tips.find((t) => t.id === tipId);
    return tip?.review || null;
  }

  async flagTip(tipId: string, reason: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const tip = this.tips.find((t) => t.id === tipId);
    if (!tip) return false;

    tip.reports = tip.reports || [];
    if (tip.reports.some((r) => r.reporter === CURRENT_USER_NAME)) {
      throw new Error('You have already submitted a report for this health tip.');
    }

    tip.reports.push({
      reporter: CURRENT_USER_NAME,
      reason: reason.trim(),
      reportedAt: new Date().toISOString()
    });

    tip.flagCount = tip.reports.length;
    if (tip.flagCount >= 3) {
      tip.safetyAlert = true;
      tip.safetyNotice = `Community Safety Notice: This tip has received ${tip.flagCount} independent community reports. Historical consensus evidence is preserved below.`;
    }

    this.saveToStorage();
    return true;
  }

  async resetToDefaultSampleData(): Promise<void> {
    this.tips = [...INITIAL_SAMPLE_TIPS];
    this.saveToStorage();
  }
}

import { GenLayerTipService } from './genlayerTipService';
export { MockTipService, GenLayerTipService };

// An explicitly selected network service must never silently switch to demo data.
export function getActiveTipService(): ITipService {
  return import.meta.env.VITE_USE_GENLAYER_CONTRACT === 'true'
    ? new GenLayerTipService()
    : new MockTipService();
}

export const tipService: ITipService = getActiveTipService();
