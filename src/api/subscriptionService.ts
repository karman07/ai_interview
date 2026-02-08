import http from './http';

export interface SubscriptionResponse {
    success: boolean;
    message: string;
    subscription?: {
        email: string;
        isSubscribed: boolean;
    };
}

export const subscriptionService = {
    subscribe: async (data: { email: string; userId?: string; frequency?: string }): Promise<SubscriptionResponse> => {
        const response = await http.post('/email/subscribe', data);
        return response.data;
    },

    unsubscribe: async (data: { email: string }): Promise<SubscriptionResponse> => {
        const response = await http.post('/email/unsubscribe', data);
        return response.data;
    }
};
