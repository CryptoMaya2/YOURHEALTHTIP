export type Category = 
  | 'nutrition'
  | 'sleep'
  | 'physical-activity'
  | 'mental-wellbeing'
  | 'hygiene'
  | 'general';

export interface CategoryInfo {
  id: Category;
  label: string;
  description: string;
  iconName: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'nutrition',
    label: 'Nutrition',
    description: 'Everyday dietary patterns, hydration, dietary fiber, and wholesome food choices.',
    iconName: 'Apple'
  },
  {
    id: 'sleep',
    label: 'Sleep',
    description: 'Circadian rhythm support, sleep hygiene, recovery routines, and restful rest habits.',
    iconName: 'Moon'
  },
  {
    id: 'physical-activity',
    label: 'Physical Activity',
    description: 'Cardiovascular movement, posture, daily stretching, and sustainable mobility habits.',
    iconName: 'Activity'
  },
  {
    id: 'mental-wellbeing',
    label: 'Mental Wellbeing',
    description: 'Stress alleviation, mindfulness practices, focus boundaries, and restorative breaks.',
    iconName: 'HeartHandshake'
  },
  {
    id: 'hygiene',
    label: 'Hygiene',
    description: 'Preventative surface and hand hygiene, oral health routines, and ambient cleanliness.',
    iconName: 'Sparkles'
  },
  {
    id: 'general',
    label: 'General Healthy Living',
    description: 'Sunlight exposure, screen-time balance, indoor air habits, and holistic wellbeing.',
    iconName: 'ShieldCheck'
  }
];

export type ReviewStatus = 
  | 'pending'
  | 'evidence-consistent'
  | 'evidence-inconsistent'
  | 'under-challenge'
  | 'undetermined';

export interface StatusMeta {
  status: ReviewStatus;
  label: string;
  shortDescription: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
}

export const STATUS_DEFINITIONS: Record<ReviewStatus, StatusMeta> = {
  'evidence-consistent': {
    status: 'evidence-consistent',
    label: 'Evidence-Consistent',
    shortDescription: 'Evaluated against trusted public health guidelines and found consistent with current scientific literature. Not an individualized medical diagnosis or guarantee.',
    badgeBg: '#F0F5EC',
    badgeColor: '#2D3A18',
    badgeBorder: '#B8CCA8'
  },
  'pending': {
    status: 'pending',
    label: 'Pending Review',
    shortDescription: 'Submitted and queued for multi-source consensus evaluation. Scheduled for automated GenLayer validation.',
    badgeBg: '#FFFBEB',
    badgeColor: '#92400E',
    badgeBorder: '#FDE68A'
  },
  'under-challenge': {
    status: 'under-challenge',
    label: 'Under Challenge',
    shortDescription: 'A community member has flagged contradicting evidence or outdated public health data; awaiting consensus re-evaluation.',
    badgeBg: '#FFF7ED',
    badgeColor: '#C2410C',
    badgeBorder: '#FDBA74'
  },
  'evidence-inconsistent': {
    status: 'evidence-inconsistent',
    label: 'Evidence-Inconsistent',
    shortDescription: 'Contradicted by established public health consensus or lacking verifiable evidentiary support in benchmark health databases.',
    badgeBg: '#FEF2F2',
    badgeColor: '#991B1B',
    badgeBorder: '#FECACA'
  },
  'undetermined': {
    status: 'undetermined',
    label: 'Review Undetermined',
    shortDescription: 'Current scientific literature exhibits mixed consensus or insufficient public health data to reach conclusive alignment.',
    badgeBg: '#F3F4F6',
    badgeColor: '#374151',
    badgeBorder: '#D1D5DB'
  }
};

export interface EvidenceSource {
  title: string;
  url: string;
  organization: string;
  year?: string;
  excerpt: string;
  finding?: 'supports' | 'contradicts' | 'insufficient' | 'irrelevant';
}

export interface TipReport {
  reporter: string;
  reason: string;
  reportedAt: string;
}

export interface ReviewRecord {
  status: ReviewStatus;
  reviewedAt: string;
  evaluator: string; // e.g., 'GenLayer Intelligent Contract (Simulation Architecture)'
  reasoning: string;
  sourcesConsulted: EvidenceSource[];
  contractTransactionRef: string; // explicitly shown as pending on-chain deploy
  challengeCount?: number;
}

export interface Challenge {
  id: string;
  tipId: string;
  createdAt: string;
  challengerName: string;
  reason: string;
  evidenceUrl?: string;
  status: 'submitted' | 'under-review' | 'resolved';
}

export interface HealthTip {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: Category;
  region?: string;
  submittedBy: string;
  isCurrentUserSubmission?: boolean;
  submittedAt: string;
  supportingSources?: string[];
  status: ReviewStatus;
  review?: ReviewRecord;
  challenges?: Challenge[];
  isSampleData: boolean;
  flagCount?: number;
  reports?: TipReport[];
  safetyAlert?: boolean;
  safetyNotice?: string;
  reviewHistory?: ReviewRecord[];
  transactions?: Record<string, string>;
}

export interface CreateTipInput {
  title: string;
  content: string;
  category: Category;
  region?: string;
  supportingSources?: string[];
  generalHealthAcknowledgement: boolean;
}

export interface SubmitChallengeInput {
  tipId: string;
  reason: string;
  evidenceUrl?: string;
  challengerName?: string;
}
