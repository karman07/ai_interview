import { connect } from 'mongoose';
async function run() {
    const uri = "mongodb+srv://karmansingharora03_db_user:8813917626%24Karman@cluster0.yyjs2ln.mongodb.net/ai-interview?retryWrites=true&w=majority&appName=Cluster0";
    const conn = await connect(uri);
    const db = conn.connection.db;
    const recentLog = await db.collection('job_sync_logs').find().sort({ started_at: -1 }).limit(5).toArray();
    console.log('Latest log:', JSON.stringify(recentLog, null, 2));
    await conn.disconnect();
}
run().catch(console.error);
