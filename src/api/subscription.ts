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
};
