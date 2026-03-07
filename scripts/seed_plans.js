const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interview';

const SubscriptionSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    type: { type: String, required: true },
    duration: Number,
    features: [{
        name: String,
        description: String,
        type: String,
        value: mongoose.Schema.Types.Mixed,
        enabled: Boolean,
        limit: Number,
        unit: String
    }],
    status: { type: String, default: 'active' },
    order: { type: Number, default: 0 },
    popularBadge: Boolean,
    country: { type: String, required: true },
    razorpayPlanId: String
}, { timestamps: true });

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        console.log('Clearing existing Indian plans...');
        await Subscription.deleteMany({ country: 'IN' });

        const plans = [
            {
                name: 'free_tier_in',
                displayName: 'Free Tier',
                country: 'IN',
                price: 0,
                currency: 'INR',
                type: 'monthly',
                status: 'active',
                description: 'Perfect for starters to experience the platform.',
                features: [
                    {
                        name: 'Resume Limit',
                        description: '5 Resume analysis reports',
                        type: 'numeric',
                        value: 5,
                        enabled: true,
                        limit: 5,
                        unit: 'resumes'
                    },
                    {
                        name: 'Interview Limit',
                        description: '3 Professional AI interviews',
                        type: 'numeric',
                        value: 3,
                        enabled: true,
                        limit: 3,
                        unit: 'interviews'
                    },
                    { name: 'AI Feedback', description: 'Basic qualitative feedback', type: 'boolean', value: true, enabled: true },
                ],
                order: 0
            },
            {
                name: 'pro_tier_100_in',
                displayName: 'Career Starter',
                country: 'IN',
                price: 10000, // 100 INR in paisa
                currency: 'INR',
                type: 'monthly',
                status: 'active',
                razorpayPlanId: 'plan_SOAOKbZ1fdkXRN',
                description: 'Accelerate your job search with more resumes and interviews.',
                features: [
                    {
                        name: 'Resume Limit',
                        description: '15 Resume analysis reports',
                        type: 'numeric',
                        value: 15,
                        enabled: true,
                        limit: 15,
                        unit: 'resumes'
                    },
                    {
                        name: 'Interview Limit',
                        description: '10 Professional AI interviews',
                        type: 'numeric',
                        value: 10,
                        enabled: true,
                        limit: 10,
                        unit: 'interviews'
                    },
                    { name: 'AI Feedback', description: 'Detailed qualitative analysis', type: 'boolean', value: true, enabled: true },
                    { name: 'Priority Support', description: '24/7 Priority support access', type: 'boolean', value: true, enabled: true }
                ],
                order: 1,
                popularBadge: true
            },
            {
                name: 'pro_tier_200_in',
                displayName: 'Professional',
                country: 'IN',
                price: 20000, // 200 INR in paisa
                currency: 'INR',
                type: 'monthly',
                status: 'active',
                razorpayPlanId: 'plan_SKqg030DvG2aew',
                description: 'For power users who want the maximum edge in their prep.',
                features: [
                    {
                        name: 'Resume Limit',
                        description: '40 Resume analysis reports',
                        type: 'numeric',
                        value: 40,
                        enabled: true,
                        limit: 40,
                        unit: 'resumes'
                    },
                    {
                        name: 'Interview Limit',
                        description: '20 Professional AI interviews',
                        type: 'numeric',
                        value: 20,
                        enabled: true,
                        limit: 20,
                        unit: 'interviews'
                    },
                    { name: 'AI Feedback', description: 'Full deep-dive qualitative analysis', type: 'boolean', value: true, enabled: true },
                    { name: 'Custom Roadmaps', description: 'Personalized career roadmaps', type: 'boolean', value: true, enabled: true }
                ],
                order: 2
            }
        ];

        console.log('Inserting new plans...');
        await Subscription.insertMany(plans);
        console.log('Successfully seeded plans for India!');

    } catch (err) {
        console.error('Error seeding plans:', err);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
}

seed();
