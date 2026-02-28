const Razorpay = require('razorpay');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID.trim(),
    key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
});

async function debugPlan() {
    const planId = 'plan_SKqg030DvG2aew';
    console.log(`Checking specifically for Plan ID: ${planId}`);
    console.log(`Using Key ID: [${process.env.RAZORPAY_KEY_ID}]`);

    try {
        const plan = await instance.plans.fetch(planId);
        console.log('✅ Plan found via API!');
        console.log(JSON.stringify(plan, null, 2));
    } catch (error) {
        console.error('❌ Plan NOT found via API.');
        console.error('Detailed Error:', error.error ? error.error.description : error.message);
    }
}

debugPlan();
