// Subscription plan configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    problemLimit: 30,
    features: [
      '30 problems',
      'Smart revision system',
      'Basic analytics',
      'All DSA categories'
    ]
  },
  pro: {
    name: 'Pro',
    price: 8.99,
    problemLimit: 200,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
    features: [
      '200 problems',
      'Smart revision system',
      'Advanced analytics',
      'All DSA categories',
      'Priority support'
    ]
  },
  pro_max: {
    name: 'Pro Max',
    price: 19.99,
    problemLimit: 1000,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MAX_PRICE_ID || '',
    features: [
      '1,000 problems',
      'Smart revision system',
      'Advanced analytics',
      'All DSA categories',
      'Priority support',
      'Unlimited revisions',
      'Export data'
    ]
  }
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

export function getPlanLimit(plan: SubscriptionPlan): number {
  return SUBSCRIPTION_PLANS[plan].problemLimit;
}

export function getPlanName(plan: SubscriptionPlan): string {
  return SUBSCRIPTION_PLANS[plan].name;
}

export function canAddProblem(currentProblems: number, plan: SubscriptionPlan): boolean {
  return currentProblems < getPlanLimit(plan);
}
