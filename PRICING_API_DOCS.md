# 💳 Pricing, Subscriptions & Autopay API Documentation (Updated)

This document provides the latest API specification for handling recurring subscriptions (Autopay), one-time payments, and admin analytics using Razorpay and MongoDB.

**Base URL**: `http://localhost:3000`

---

## 🏗️ 1. Subscription Plans (`/subscriptions`)

Retrieve available plans for the frontend.

### 1.1 Get Active Plans
- **Endpoint**: `GET /subscriptions/active?country=IN`
- **Response**: Returns plans with `razorpayPlanId` which are required for autopay.

### 1.2 Get Plan by ID
- **Endpoint**: `GET /subscriptions/:id`

---

## 🔄 2. Autopay / Recurring Payments (`/payments`)

These routes handle Razorpay Subscriptions (Automatic recurring charges).

### 2.1 Create Subscription Session
Initializes a Razorpay Subscription.
- **Endpoint**: `POST /payments/create-subscription`
- **Auth**: Required (`Bearer <JWT>`)
- **Body**:
```json
{
  "subscriptionId": "65f...mongo_id",
  "notes": { "coupon": "WELCOME10" }
}
```
- **Response**: Returns a Razorpay Subscription object (including `id` starting with `sub_`).

### 2.2 Verify & Activate Autopay
Verifies the signature after the user completes the checkout.
- **Endpoint**: `POST /payments/verify-subscription`
- **Auth**: Required
- **Body**:
```json
{
  "razorpaySubscriptionId": "sub_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "sig_xxx"
}
```
- **Action**: Marks the user as `active`, sets the `subscriptionExpiry` based on plan type (Monthly/Yearly), and stores the `razorpaySubscriptionId` in the user profile.

---

## 💰 3. One-Time Payments (`/payments`)

Used for non-recurring purchases or credits.

### 3.1 Create Order
- **Endpoint**: `POST /payments/create-order`
- **Body**: `{ "amount": 500, "description": "Add Credits" }`

### 3.2 Verify Payment
- **Endpoint**: `POST /payments/verify`

---

## 📊 4. Admin & Analytics (`/payments/admin`)

Routes for administrative oversight and financial tracking.

### 4.1 Global Payment History
- **Endpoint**: `GET /payments/admin/all`
- **Query Params**: `limit`, `offset`
- **Response**: List of all payments in the system with populated User and Subscription names.

### 4.2 Financial Analytics
- **Endpoint**: `GET /payments/admin/analytics`
- **Response**:
```json
{
  "totalRevenue": 15400.50,
  "statusBreakdown": {
    "paid": 45,
    "failed": 2,
    "created": 10
  },
  "recentPayments": [...]
}
```

---

## 🏗️ 5. Technical Workflow (Webhooks)

The system automatically handles background events via the Razorpay Webhook (`POST /payments/webhook`).

1.  **Subscription Charged**: When a recurring payment is successful (e.g., month 2), the hook records a new Payment in MongoDB and extends the user's `subscriptionExpiry`.
2.  **Subscription Cancelled**: If a user cancels via Razorpay, the hook marks the user status as `expired` and sends a notification email.

---

## 👤 6. User Portal

### 6.1 My Payment Stats
- **Endpoint**: `GET /payments/stats/summary`
- **Response**: Breakdown of the logged-in user's spending and payment status.

### 6.2 My Transaction History
- **Endpoint**: `GET /payments`
