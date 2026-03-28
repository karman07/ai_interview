# 💻 Frontend Integration Guide (v2.2)

This guide summarizes the changes to the user-facing APIs for the frontend team.

---

## � 1. User Profile & current Plan
**Endpoint**: `GET /users/me`

This route now returns the user profile with the `subscriptionPlan` fully populated.

**Example JSON Response:**
```json
{
  "_id": "65f1234567890abcdef12345",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "subscriptionStatus": "active",
  "subscriptionExpiry": "2026-04-27T07:30:00.000Z",
  "subscriptionPlan": {
    "_id": "65f0987654321fedcba09876",
    "name": "pro_monthly",
    "displayName": "Pro Monthly",
    "description": "Full access to AI features",
    "price": 99900,
    "currency": "INR",
    "type": "monthly",
    "features": [
      {
        "name": "Ai for jobs",
        "type": "numeric",
        "value": -1,
        "enabled": true
      }
    ],
    "razorpayPlanId": "plan_NvnK2L1qXYZ123"
  }
}
```

---

## �🔁 2. Autopay (Recurring Subscriptions)
**Changes**: Moving from one-time orders to automated recurring billing.

### Integration Flow:
1.  **Fetch Plans**: `GET /subscriptions/active?country=IN`
    *   Each plan now contains a `razorpayPlanId`.
2.  **Create Subscription**: Instead of `create-order`, use:
    *   `POST /payments/create-subscription`
    *   **Body**: `{ "subscriptionId": "mongo_id_from_plan" }`
    *   **Returns**: A Record including `id` (e.g., `sub_xxx`). You must pass this `id` to the Razorpay checkout script.
3.  **Verify & Activate**:
    *   `POST /payments/verify-subscription`
    *   **Body**: 
        ```json
        {
          "razorpaySubscriptionId": "sub_xxx",
          "razorpayPaymentId": "pay_xxx",
          "razorpaySignature": "sig_xxx"
        }
        ```
    *   **Success**: The user's `subscriptionStatus` becomes `active` immediately.

---

## 📊 3. User Dashboard
*   **Spending Summary**: `GET /payments/stats/summary`
*   **Transaction History**: `GET /payments` (Includes both initial and recurring charges).

---

## 🚫 4. Plan Limits (Enforcement)
**Endpoint**: `POST /v1/resume/upload`

Now returns a `400 Bad Request` if the user exceeds their resume upload limit.
*   **Free**: 5 Resumes
*   **Pro**: 50 Resumes

**See Detailed Guide**: [RESUME_UPLOAD_LIMITS.md](./RESUME_UPLOAD_LIMITS.md)

---

## 🛠️ Key Documentation Links
*   **Detailed Profile Specs**: [USER_PROFILE_ROUTES.md](./USER_PROFILE_ROUTES.md)
*   **Payment & Subscriptions**: [PRICING_API_DOCS.md](./PRICING_API_DOCS.md)
*   **Resume Limits**: [RESUME_UPLOAD_LIMITS.md](./RESUME_UPLOAD_LIMITS.md)
