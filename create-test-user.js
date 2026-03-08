
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interview';

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, lowercase: true },
    passwordHash: String,
    role: { type: String, default: 'user' },
    isEmailVerified: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function createTestUser() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'test@aiforjob.ai';
        const password = 'Password123!';
        const name = 'Sample User';

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists. Updating verification status and password...');
            existingUser.passwordHash = await bcrypt.hash(password, 10);
            existingUser.isEmailVerified = true;
            existingUser.name = name;
            await existingUser.save();
            console.log('User updated successfully.');
        } else {
            const passwordHash = await bcrypt.hash(password, 10);
            const user = new User({
                name,
                email,
                passwordHash,
                role: 'user',
                isEmailVerified: true,
            });
            await user.save();
            console.log('User created successfully.');
        }

        console.log('\n--- Sample User Credentials ---');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('--- --- --- --- --- --- --- ---\n');

    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createTestUser();
