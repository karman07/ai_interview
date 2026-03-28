# Frontend Subscription Integration Guide (Razorpay AutoPay)

This guide explains how to integrate the newly implemented subscription workflow into your React/Frontend application.

---

## Prerequisites
1.  **Razorpay Web SDK**: Add this to your `index.html` or load it dynamically.
    ```html
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    ```
2.  **Razorpay Key**: Use your `RAZORPAY_KEY_ID` from the dashboard/env.

---

## 🔄 Interaction Flow

### 1. Initialize Subscription (Get `subscription_id`)
When the user clicks the "Subscribe" button on your pricing card:

```javascript
const handleSubscribe = async (planId, userId) => {
  try {
    // Call backend to create a Razorpay subscription instance
    const response = await axios.post('/api/subscription/create', {
      userId: userId,
      subscriptionId: planId // MongoDB ID of the plan
    });

    const { subscriptionId } = response.data; // This is the 'sub_XXXX' id from Razorpay
    openRazorpayCheckout(subscriptionId);
  } catch (error) {
    console.error("Initialization failed", error);
  }
};
```

---

### 2. Open Razorpay Checkout
Use the `subscriptionId` returned from the backend to open the modal. For subscriptions, you pass **`subscription_id`** instead of `order_id`.

```javascript
const openRazorpayCheckout = (subscriptionId) => {
  const options = {
    key: "YOUR_RAZORPAY_KEY_ID",
    subscription_id: subscriptionId, // CRITICAL: Use subscription_id for AutoPay
    name: "Ai for job",
    description: "Monthly Pro Plan Subscription",
    image: "https://your-logo-url.com/logo.png",
    handler: async function (response) {
      // Step 3: Send verification data to backend
      verifyPayment(response);
    },
    prefill: {
      name: "User Name",
      email: "user@example.com",
      contact: "9999999999"
    },
    theme: {
      color: "#3B82F6" // Your brand color
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
```

---

### 3. Verify Payment
Once the user completes the payment, the `handler` callback provides three IDs. Send these to the backend to activate the account.

```javascript
const verifyPayment = async (razorpayResponse) => {
  try {
    // Parameters received from Razorpay handler:
    // razorpay_payment_id, razorpay_subscription_id, razorpay_signature
    
    await axios.post('/api/subscription/verify', {
      razorpay_subscription_id: razorpayResponse.razorpay_subscription_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature: razorpayResponse.razorpay_signature,
      userId: "CURRENT_USER_ID" // Can also be inferred by backend if token is valid
    });

    // Success! Redirect to dashboard or refresh profile
    window.location.href = "/dashboard?payment=success";
  } catch (error) {
    alert("Payment verification failed. Please contact support.");
  }
};
```

---

### 4. Check Status (Gatekeeping)
Use this endpoint to check if the user is currently subscribed before showing premium content.

```javascript
const checkStatus = async (userId) => {
  const response = await axios.get(`/api/subscription/status/${userId}`);
  if (response.data.status === 'active') {
    // Show premium features
  } else {
    // Redirect to pricing page
  }
};
```

---

## 💡 Important Tips
- **AutoPay**: Because you are using `subscription_id`, Razorpay will automatically handle the recurring charges every month. You do **not** need to call any API for future payments.
- **Webhooks**: Your backend is now set up to receive `subscription.charged` events. When a renewal happens next month, the backend will automatically extend the expiry date without any frontend action.
- **Cancelations**: If a user cancels via the Razorpay dashboard, the backend will receive a webhook and mark the status as `inactive` automatically.
