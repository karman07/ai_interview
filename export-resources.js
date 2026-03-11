const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const resourceSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    type: String,
    duration: String,
    studyTime: String,
    difficulty: { type: String, default: 'Beginner' },
    tags: [String],
    featured: { type: Boolean, default: false },
    status: { type: String, default: 'draft' },
    thumbnailUrl: String,
    downloadUrl: String,
    externalUrl: String,
    rating: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    students: { type: Number, default: 0 },
}, { timestamps: true });

const Resource = mongoose.model('Resource', resourceSchema);

async function exportData() {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI is not defined in the environment.");
        }

        console.log("Connecting to MongoDB...");
        await mongoose.connect(mongoUri);

        console.log("Fetching resources...");
        const resources = await Resource.find({}).lean();

        const exportPath = path.join(__dirname, '..', 'resources_export.json');
        fs.writeFileSync(exportPath, JSON.stringify(resources, null, 2));

        console.log(`Successfully exported ${resources.length} resources to ${exportPath}`);
    } catch (error) {
        console.error("Error exporting data:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

exportData();
