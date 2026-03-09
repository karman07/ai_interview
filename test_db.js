const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ai-interview";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const jobs = db.collection('adzuna_jobs');
    const counts = await jobs.aggregate([
      { $group: { _id: "$location_structured.country", count: { $sum: 1 } } }
    ]).toArray();
    console.log(counts);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
