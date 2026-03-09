# Payment API Documentation (Razorpay Integration)

All APIs (except Webhook) require a Bearer Token in the `Authorization` header.
Base URL: `http://api.aiforjob.ai`

---

## 1. Subscription APIs (Recurring)

### Create Subscription
**Endpoint:** `POST /payments/create-subscription`  
**Description:** Initializes a Razorpay subscription for the current user based on a plan.
**Body:**
```json
{
  "subscriptionId": "65af..." // Local MongoDB Subscription ID
}
```
**Success Response:** Returns the Razorpay Subscription Object.

### Verify Subscription
**Endpoint:** `POST /payments/verify-subscription`  
**Description:** Verifies the payment signature after a successful subscription checkout.
**Body:**
```json
{
  "razorpaySubscriptionId": "sub_...",
  "razorpayPaymentId": "pay_...",
  "razorpaySignature": "..."
}
```

---

## 2. One-Time Payment APIs

### Create Order
**Endpoint:** `POST /payments/create-order`  
**Description:** Creates a one-time payment order in Razorpay.
**Body:**
```json
{
  "amount": 999, // In main currency units (e.g., INR)
  "description": "Optional description",
  "subscriptionId": "optional_plan_id"
}
```

### Verify Payment
**Endpoint:** `POST /payments/verify`  
**Description:** Verifies the payment signature for a one-time order.
**Body:**
```json
{
  "razorpayOrderId": "order_...",
  "razorpayPaymentId": "pay_...",
  "razorpaySignature": "..."
}
```

---

## 3. User Payment History

### Get All Payments
**Endpoint:** `GET /payments`  
**Description:** Retrieves the payment history for the logged-in user.
**Query Params:** `limit` (default 10), `offset` (default 0)

### Get Payment Stats
**Endpoint:** `GET /payments/stats/summary`  
**Description:** Returns a summary of the user's total paid, pending, and failed amounts.

### Get Payment Detail
**Endpoint:** `GET /payments/:paymentId`  
**Endpoint:** `GET /payments/order/:orderId`  
**Description:** Fetches details of a specific payment.

---

## 4. Admin Analytics

### Get All Payments (Admin)
**Endpoint:** `GET /payments/admin/all`  
**Description:** Retrieves all payments across the system. Requires Admin Role.

### Revenue Analytics
**Endpoint:** `GET /payments/admin/analytics`  
**Description:** Returns total revenue, recent payments, and status breakdown.

---

## 5. Webhooks

### Razorpay Webhook
**Endpoint:** `POST /payments/webhook`  
**Description:** Receives events from Razorpay (e.g., recurring charge success, subscription cancelled).
**Headers:** `x-razorpay-signature` is required.
**Events Handled:**
- `subscription.charged`: Credits the user with an extra month/year.
- `subscription.cancelled`: Marks the user's plan as expired.
- `subscription.expired`: Marks the user's plan as expired.

---

## Integration Flow (Frontend)
1. **Fetch Plans:** Call `GET /subscriptions` to show pricing cards.
2. **Initialize:** On click, call `POST /payments/create-subscription`.
3. **Razorpay Checkout:** Use the returned `id` to open the Razorpay Modal.
4. **Verification:** In the `handler` callback of Razorpay, send the IDs to `POST /payments/verify-subscription`.
5. **Success:** User is automatically updated to 'active' status.
