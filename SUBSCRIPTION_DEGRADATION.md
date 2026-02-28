# Subscription Degradation Logic

This document describes the automated process of degrading a user's subscription status when an AutoPay subscription is cancelled, halted, or expires.

## 🔄 Lifecycle of Degradation

When a Razorpay Subscription event occurs that indicates the end of the billing relationship, the backend automatically performs the following steps:

1.  **Webhook Receipt**: Razorpay sends a POST request to `/api/webhook/razorpay` with one of the following events:
    *   `subscription.cancelled`
    *   `subscription.halted`
    *   `subscription.expired`

2.  **User Identification**: the backend looks up the user in MongoDB using the `razorpaySubscriptionId` provided in the webhook payload.

3.  **Data Update**: The user's profile is updated with the following changes:
    *   `subscriptionStatus`: Set to `'free'`.
    *   `subscriptionPlan`: Set to `null`.
    *   `subscriptionExpiry`: Remains (for historical reference) but logic ignores it since status is `'free'`.

4.  **Notification**: An automated email is sent to the user via `EmailService.sendSubscriptionCancelledEmail` to inform them of the change.

## 💾 Database Implementation

The `User` schema handles these fields as follows:

```typescript
// Location: src/users/schemas/user.schema.ts

@Prop({ type: Types.ObjectId, ref: 'Subscription' })
subscriptionPlan?: Types.ObjectId;

@Prop({ default: 'free' })
subscriptionStatus?: string; // Reset to 'free' upon degradation
```

The logic is centralized in `PaymentService.handleSubscriptionTermination`:

```typescript
// Location: src/payments/payment.service.ts

private async handleSubscriptionTermination(subscriptionEntity: any) {
  // Finds user and resets status to 'free' + clears subscriptionPlan
}
```

## 🔒 Security & Verification

All degradation events are verified using the `RAZORPAY_WEBHOOK_SECRET`. No status changes occur unless the Razorpay signature is valid. This prevents malicious actors from "downgrading" other users.

## 🚀 Impact on User Access

Once degraded:
*   Users will fall back to the **Free Tier** limits (e.g., maximum of 5 resumes).
*   Premium features like "AI Feedback" or "Custom CV Templates" will be locked.
*   The dashboard will prompt the user to "Renew or Upgrade" to restore access.
