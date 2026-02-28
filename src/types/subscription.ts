export interface SubscriptionFeature {
    name: string;
    description: string;
    type: string;
    value: any;
    enabled?: boolean;
    limit?: number;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    country: string;
    price: number;
    formattedPrice?: string;
    currency: string;
    type: 'monthly' | 'yearly' | 'half-yearly' | 'quarterly' | 'free' | 'onetime';
    formattedDuration?: string;
    features: SubscriptionFeature[];
    status: 'active' | 'inactive';
    popular?: boolean;
    icon?: string;
    order?: number;
    razorpayPlanId?: string;
}
