const mongoose = require('mongoose');

async function check() {
  const uri = "mongodb+srv://karmansingharora03_db_user:8813917626%24Karman@cluster0.yyjs2ln.mongodb.net/ai-interview?retryWrites=true&w=majority&appName=Cluster0";

  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    const user = await db.collection('users').findOne({});
    if (!user) throw new Error('No user found to link review');

    const payload = {
      userId: user._id,
      rating: 5,
      comment: "This is a test review directly from node script",
      sessionId: new mongoose.Types.ObjectId().toString(),
      flag: 'clean',
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Inserting payload:', payload);

    const res = await db.collection('reviews').insertOne(payload);
    console.log('Inserted review successfully:', res.insertedId);

    const count = await db.collection('reviews').countDocuments();
    console.log('New Reviews count:', count);

  } catch (err) {
    console.error('Insert failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
