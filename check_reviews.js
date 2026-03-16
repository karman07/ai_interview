const mongoose = require('mongoose');

async function check() {
  const uri = "mongodb+srv://karmansingharora03_db_user:8813917626%24Karman@cluster0.yyjs2ln.mongodb.net/ai-interview?retryWrites=true&w=majority&appName=Cluster0";
  await mongoose.connect(uri);
  
  const reviews = await mongoose.connection.db.collection('reviews').find({}).toArray();
  console.log('Reviews count:', reviews.length);
  if (reviews.length > 0) {
    console.log('Sample:', reviews[0]);
  }

  const results = await mongoose.connection.db.collection('results').find({ "feedback": { $exists: true } }).toArray();
  console.log('Results with feedback count:', results.length);
  if (results.length > 0) {
    console.log('Sample result feedback:', results[0].feedback);
  }

  mongoose.disconnect();
}
check();