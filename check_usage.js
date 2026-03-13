const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interview-v4');
    console.log('Connected to DB');
    const AIUsage = mongoose.connection.collection('aiusages');
    const Results = mongoose.connection.collection('results');

    const latestUsage = await AIUsage.find().sort({ _id: -1 }).limit(2).toArray();
    console.log("Latest AI Usage:");
    console.log(JSON.stringify(latestUsage, null, 2));

    const latestResult = await Results.find().sort({ _id: -1 }).limit(1).toArray();
    console.log("Latest Result:");
    if (latestResult.length > 0) {
        console.log(JSON.stringify({
            _id: latestResult[0]._id,
            sessionId: latestResult[0].sessionId,
            tokenUsage: latestResult[0].tokenUsage,
            role: latestResult[0].role
        }, null, 2));
    } else {
        console.log("No results");
    }
    process.exit(0);
}
test();
