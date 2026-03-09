import { connect } from 'mongoose';
async function run() {
  const conn = await connect('mongodb://localhost:27017/ai-interview');
  const db = conn.connection.db;
  const col = db.collection('adzuna_jobs');
  const counts = await col.aggregate([{ $group: { _id: "$location_structured.country", count: { $sum: 1 } } }]).toArray();
  console.log('Countries:', counts);
  const recentLog = await db.collection('jobsynclogs').find().sort({created_at: -1}).limit(1).toArray();
  console.log('Latest log:', recentLog);
  await conn.disconnect();
}
run().catch(console.error);
