const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/teacher_ai'); // we saw it was teacher_ai from previous logs in their dot-env if it exists
  const db = mongoose.connection.db;
  
  await db.collection('universities').updateMany(
    { domain: { $regex: 'thapar', $options: 'i' } },
    { $set: { logoUrl: '/uploads/universities/thapar.png' } }
  );
  
  await db.collection('universities').updateMany(
    { domain: { $regex: 'iit', $options: 'i' } },
    { $set: { logoUrl: '/uploads/universities/iit.png' } }
  );

  console.log('Done seeding logos');
  process.exit(0);
}

seed().catch(console.error);
