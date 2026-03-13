const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-interview-v4');
  const AIUsage = mongoose.connection.collection('aiusages');
  const Results = mongoose.connection.collection('results');

  // Find latest AIUsage
  const latestUsage = await AIUsage.find().sort({_id: -1}).limit(1).toArray();
  console.log("Latest AI Usage:\n", JSON.stringify(latestUsage, null, 2));

  // Find latest Result
  const latestResult = await Results.find().sort({_id: -1}).limit(1).toArray();
  console.log("Latest Result (check tokenUsage field):\n", JSON.stringify(latestResult.map(r => ({
     _id: r._id,
     sessionId: r.sessionId,
     tokenUsage: r.tokenUsage,
  })), null, 2));

  process.exit(0);
}
test();
