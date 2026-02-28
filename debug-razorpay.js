const Razorpay = require('razorpay');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function checkPlans() {
    try {
        console.log('Using Key:', process.env.RAZORPAY_KEY_ID);
        const plans = await instance.plans.all();
        console.log('Available Plans in Razorpay:');
        if (plans && plans.items) {
            plans.items.forEach(p => {
                console.log(`- ID: ${p.id}, Name: ${p.item.name}, Amount: ${p.item.amount}, Currency: ${p.item.currency}`);
            });
        } else {
            console.log('No plans found.');
        }
    } catch (error) {
        console.error('Error fetching plans:', error);
    }
}

checkPlans();
