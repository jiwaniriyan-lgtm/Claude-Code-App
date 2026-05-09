import type { TierId } from './constants';

export type Idea = {
  title: string;
  description: string;
  viral_score: number;
  tier: 'VIRAL HIT' | 'HIGH POTENTIAL' | 'TRENDING';
  outlier_factor: string;
  viewer_payoff: string;
};

export type SavedIdea = Idea & {
  id: string;
  niche: string;
  saved_at: string;
};

export type SetupMode = 'clone' | 'own' | '';

export type SetupData = {
  mode: SetupMode;
  channelUrl: string;
  niche: string;
  transcripts: string[];
  styleImages: string[];      // base64 data URLs (client-side, before upload)
  thumbnailImages: string[];  // base64 data URLs
  duration: string;
  notes: string;
};

export type StateKind =
  | 'simple'
  | 'transcripts'
  | 'script'
  | 'imagevideo'
  | 'platform';

export type WorkbookStateBase = {
  n: number;
  input: string;
  output: string;
  skipped: boolean;
};

export type WorkbookStateData = WorkbookStateBase & {
  // state 2 only
  transcripts?: string[];
  styleImages?: string[];      // urls (Supabase Storage paths)
  thumbnailImages?: string[];
  // state 4
  duration?: string;
  // state 5
  generateVideo?: boolean;
};

export type Workbook = {
  id: string;
  user_id: string;
  name: string;
  niche: string;
  idea_title: string;
  idea_description: string;
  idea_score: number;
  setup_mode: SetupMode | null;
  current_state_idx: number;
  states: WorkbookStateData[];
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  email: string;
  tier: TierId;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  created_at: string;
};

export type UsageStats = {
  ideas_this_month: number;
  workbooks_active: number;
  tokens_this_month: number;
  cost_usd_this_month: number;
};

export type PromptCtx = {
  niche: string;
  ideaTitle: string;
  ideaDescription: string;
  input: string;
  prev: Record<number, string>;
  transcripts?: string[];
  styleImagesCount?: number;
  thumbnailImagesCount?: number;
  duration?: string;
  generateVideo?: boolean;
};
