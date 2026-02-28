const Razorpay = require('razorpay');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID.trim(),
    key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
});

async function createPlan() {
    console.log('Attempting to create a new plan via API to verify account link...');
    try {
        const plan = await instance.plans.create({
            period: 'monthly',
            interval: 1,
            item: {
                name: 'Pro Monthly Test',
                amount: 99900,
                currency: 'INR',
                description: 'Test plan created via API'
            }
        });
        console.log('✅ Plan Created Successfully!');
        console.log('New Plan ID:', plan.id);
        console.log('Please use this ID in your database/request.');
    } catch (error) {
        console.error('❌ Failed to create plan.');
        console.error('Error:', error.error ? error.error.description : error.message);
    }
}

createPlan();
