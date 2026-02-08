import http from './http';

export interface SubscriptionResponse {
    success: boolean;
    message: string;
    subscription?: {
        email: string;
        isSubscribed: boolean;
        frequency?: string;
    };
    // For getStatus endpoint which returns flat structure
    isSubscribed?: boolean;
    email?: string;
    frequency?: string;
}

export interface SubscriptionStatusResponse {
    isSubscribed: boolean;
    email: string;
    subscriptionTypes?: string[];
    frequency?: string; // It seems this might not be returned, but keeping it optional
}

export const subscriptionService = {
    subscribe: async (data: { email: string; userId?: string; frequency?: string; resumeData?: any }): Promise<SubscriptionResponse> => {
        const response = await http.post('/email/subscribe', data);
        return response.data;
    },

    unsubscribe: async (data: { email: string }): Promise<SubscriptionResponse> => {
        const response = await http.post('/email/unsubscribe', data);
        return response.data;
    },

    getStatus: async (email: string): Promise<SubscriptionStatusResponse> => {
        const response = await http.get(`/email/subscription-status/${email}`);
        return response.data;
    },

    getMySubscription: async (): Promise<SubscriptionResponse> => {
        const response = await http.get('/email/my-subscription');
        return response.data;
    },

    triggerJobUpdate: async (data: { email: string }): Promise<SubscriptionResponse> => {
        const response = await http.post('/email/trigger-job-update', data);
        return response.data;
    }
};
