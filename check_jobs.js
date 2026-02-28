const mongoose = require('mongoose');
require('dotenv').config({ path: '/Volumes/Data/Intern/AI-Interview-Prateek Sir/ai-interview-nest/.env' });

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await mongoose.connection.db.collection('jobs').countDocuments();
    console.log("Total jobs in 'jobs' collection:", count);
    const active = await mongoose.connection.db.collection('jobs').countDocuments({ status: "active" });
    console.log("Active jobs:", active);

    // Check if maybe it's named something else
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    process.exit(0);
}

check().catch(console.error);
