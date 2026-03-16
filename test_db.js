const mongoose = require('mongoose');

async function check() {
  const uri = "mongodb+srv://karmansingharora03_db_user:8813917626%24Karman@cluster0.yyjs2ln.mongodb.net/ai-interview?retryWrites=true&w=majority&appName=Cluster0";

  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    for (const c of collections) {
      const count = await db.collection(c.name).countDocuments();
      if (count > 0 && c.name.toLowerCase().includes('review') || c.name.toLowerCase().includes('feed')) {
         console.log(`Matched item ${c.name} with count=${count}`);
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
