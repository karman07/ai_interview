import http from './http';
import { SubscriptionPlan } from '@/types/subscription';

export const SubscriptionApi = {
    /**
     * Fetch all active plans for a specific country
     */
    getActivePlans: async (country: string = 'IN'): Promise<SubscriptionPlan[]> => {
        const res = await http.get<SubscriptionPlan[]>(`/subscriptions/active?country=${country}`);
        return res.data;
    },

    /**
     * List all plans (active or inactive)
     */
    getAllPlans: async (params?: { status?: string, country?: string }): Promise<SubscriptionPlan[]> => {
        const res = await http.get<SubscriptionPlan[]>('/subscriptions', { params });
        return res.data;
    },

    /**
     * Get plan by ID
     */
    getPlanById: async (id: string): Promise<SubscriptionPlan> => {
        const res = await http.get<SubscriptionPlan>(`/subscriptions/${id}`);
        return res.data;
    },

    /**
     * Create a Razorpay subscription (for recurring billing)
     */
    createSubscription: async (data: {
        subscriptionId: string
    }) => {
        const res = await http.post('/payments/create-subscription', data);
        return res.data;
    },

    /**
     * Verify Razorpay subscription
     */
    verifySubscription: async (data: {
        razorpaySubscriptionId: string,
        razorpayPaymentId: string,
        razorpaySignature: string
    }) => {
        const res = await http.post('/payments/verify-subscription', data);
        return res.data;
    },

    /**
     * Get spending summary/stats
     */
    getStatsSummary: async () => {
        const res = await http.get('/payments/stats/summary');
        return res.data;
    },

    /**
     * Get transaction history
     */
    getTransactions: async (params?: { page?: number, limit?: number }) => {
        const res = await http.get('/payments', { params });
        return res.data;
    },

    /**
     * Create a one-time payment order
     */
    createOrder: async (data: {
        amount: number,
        description?: string,
        subscriptionId?: string
    }) => {
        const res = await http.post('/payments/create-order', data);
        return res.data;
    },

    /**
     * Verify one-time payment
     */
    verifyPayment: async (data: {
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string
    }) => {
        const res = await http.post('/payments/verify', data);
        return res.data;
    },

    /**
     * Get detail of a specific payment
     */
    getPaymentDetail: async (paymentId: string) => {
        const res = await http.get(`/payments/${paymentId}`);
        return res.data;
    },

    /**
     * Get payment detail by Razorpay Order ID
     */
    getPaymentByOrderId: async (orderId: string) => {
        const res = await http.get(`/payments/order/${orderId}`);
        return res.data;
    },

    /**
     * Validate a coupon / referral code
     */
    validateCoupon: async (data: { code: string; orderAmount: number; subscriptionId?: string }) => {
        const res = await http.post('/discounts/validate', data);
        return res.data as {
            valid: boolean;
            discountAmount: number;
            finalAmount: number;
            message: string;
            coupon?: { _id: string; code: string; discountType: string; discountValue: number };
        };
    },

    /**
     * Create order with optional coupon applied
     */
    createOrderWithCoupon: async (data: {
        amount: number,
        description?: string,
        subscriptionId?: string,
        couponCode?: string,
    }) => {
        const res = await http.post('/payments/create-order', data);
        return res.data;
    },

    // ── Pay-as-you-go ────────────────────────────────────────────────────────

    /**
     * Set up / update the user's PAYG monthly budget (in ₹).
     * Returns updated user object + derived limits.
     */
    paygSetup: async (monthlyBudget: number) => {
        const res = await http.post('/users/me/payg/setup', { monthlyBudget });
        return res.data as {
            success: boolean;
            user: Record<string, any>;
        };
    },

    /**
     * Get current PAYG usage, limits, spend breakdown, and billing cycle.
     */
    paygStatus: async () => {
        const res = await http.get('/users/me/payg/status');
        return res.data as {
            monthlyBudgetRupees: number;
            pricePerInterviewRupees: number;
            pricePerResumeRupees: number;
            interviews: { used: number; limit: number; remaining: number };
            resumes:    { used: number; limit: number; remaining: number };
            spending:   { totalPaisaSpent: number; totalPaisaBudget: number; remainingPaisa: number };
            billingCycle: { start: string; end: string };
        };
    },

    /**
     * Cancel the PAYG plan and revert to free tier.
     */
    paygCancel: async () => {
        const res = await http.post('/users/me/payg/cancel');
        return res.data;
    },

    // ── PAYG Autopay (Razorpay subscription) ─────────────────────────────────

    createPaygSubscription: async (budgetRupees: number, couponCode?: string): Promise<{
        subscriptionId: string;
        razorpayKey: string;
        budgetRupees: number;
        finalBudgetRupees?: number;
    }> => {
        const res = await http.post('/payments/create-payg-subscription', { budgetRupees, couponCode });
        return res.data;
    },

    verifyPaygSubscription: async (data: {
        razorpaySubscriptionId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
        budgetRupees: number;
        interviews?: number;
        resumes?: number;
        couponCode?: string;
    }): Promise<{ success: boolean; interviewsLimit: number; resumesLimit: number }> => {
        const res = await http.post('/payments/verify-payg-subscription', data);
        return res.data;
    },

    // ── Admin PAYG config ─────────────────────────────────────────────────────

    adminGetPaygConfig: async (country: string = 'IN') => {
        const res = await http.get(`/subscriptions/payg/config?country=${country}`);
        return res.data as {
            id: string;
            country: string;
            status: string;
            pricePerInterviewRupees: number;
            pricePerResumeRupees: number;
            minBudgetRupees: number;
            maxBudgetRupees: number;
        } | null;
    },

    adminUpdatePaygConfig: async (data: {
        country?: string;
        pricePerInterviewRupees?: number;
        pricePerResumeRupees?: number;
        minBudgetRupees?: number;
        maxBudgetRupees?: number;
    }) => {
        const res = await http.patch('/subscriptions/payg/config', data);
        return res.data;
    },

    /** Publicly available PAYG settings for the given country */
    getPaygSettings: async (country: string = 'IN') => {
        const res = await http.get(`/subscriptions/payg-settings?country=${country}`);
        return res.data as {
            id: string;
            pricePerInterviewRupees: number;
            pricePerResumeRupees: number;
            minBudgetRupees: number;
            maxBudgetRupees: number;
        };
    },

    // ── Trial & Access Codes ────────────────────────────────────────────────

    redeemAccessCode: async (code: string) => {
        const res = await http.post('/discounts/redeem', { code });
        return res.data as {
            valid: boolean;
            couponId?: string;
            linkedPlanId?: string;
            trialDays?: number;
            message: string;
        };
    },

    createTrialSubscription: async (data: {
        couponId: string;
        linkedPlanId: string;
        trialDays: number;
    }) => {
        const res = await http.post('/payments/create-trial-subscription', data);
        return res.data;
    },

    verifyTrialSubscription: async (data: {
        razorpaySubscriptionId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
        couponId: string;
        linkedPlanId: string;
        trialDays: number;
    }) => {
        const res = await http.post('/payments/verify-trial-subscription', data);
        return res.data;
    },
};
