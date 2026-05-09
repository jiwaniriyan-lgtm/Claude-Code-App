export const NICHES = [
  'Finance', 'Weight Loss', 'Python', 'AI Tools', 'Productivity',
  'Crypto', 'Fitness', 'YouTube', 'Side Hustle', 'Self Help',
  'Mental Health', 'Dating', 'Travel', 'Meal Prep', 'Real Estate',
  'Marketing', 'Study Tips', 'Mindfulness', 'Car Reviews', 'Gaming',
] as const;

export const BATCH_SIZE = 10;
export const MAX_IDEAS = 10;

export const PLATFORMS = ['YouTube', 'Instagram', 'TikTok', 'Facebook'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const DURATIONS = [
  { v: '5', label: '5 min' },
  { v: '10', label: '10 min' },
  { v: '15', label: '15 min' },
  { v: '25', label: '25 min' },
  { v: '30', label: '30 min' },
  { v: '45', label: '45 min' },
  { v: '60', label: '1 hour' },
  { v: '120', label: '2 hours' },
] as const;

export const DURATION_WORDS: Record<string, number> = {
  '5': 750, '10': 1500, '15': 2250, '25': 3750,
  '30': 4500, '45': 6750, '60': 9000, '120': 18000,
};

export const PRICING_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'forever',
    limits: { activeWorkbooks: 1, ideasPerMonth: 30, visionImages: 5, longScripts: false, videoPrompts: false },
    features: ['1 active workbook', '30 ideas/month', '5 reference images', 'Scripts up to 30 min'],
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    price: 19,
    interval: 'month',
    priceId: process.env.STRIPE_PRICE_CREATOR,
    limits: { activeWorkbooks: 10, ideasPerMonth: 500, visionImages: -1, longScripts: true, videoPrompts: false },
    features: ['10 active workbooks', '500 ideas/month', 'Unlimited reference images', 'Scripts up to 2 hours', '7-day free trial'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 49,
    interval: 'month',
    priceId: process.env.STRIPE_PRICE_PRO,
    limits: { activeWorkbooks: -1, ideasPerMonth: 2000, visionImages: -1, longScripts: true, videoPrompts: true },
    features: ['Unlimited workbooks', '2000 ideas/month', 'Video clip prompts', 'Priority generation', '7-day free trial'],
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    price: 149,
    interval: 'month',
    priceId: process.env.STRIPE_PRICE_AGENCY,
    limits: { activeWorkbooks: -1, ideasPerMonth: 10000, visionImages: -1, longScripts: true, videoPrompts: true, teamSeats: 3 },
    features: ['Everything in Pro', '10,000 ideas/month', '3 team seats', 'Dedicated support', '7-day free trial'],
  },
} as const;

export type TierId = keyof typeof PRICING_TIERS;

export const TRIAL_DAYS = 7;
