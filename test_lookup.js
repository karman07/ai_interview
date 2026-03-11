const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/ai_interview');
  
  // Create a mock user
  const User = mongoose.model('User', new mongoose.Schema({ name: String, email: String }));
  const user = await User.create({ name: 'Lookup Test', email: 'lookup@test.com' });
  
  // Create a mock visitor
  const Visitor = mongoose.model('Visitor', new mongoose.Schema({ visitorId: String, userId: String }));
  // Set userId as exactly the ID string
  const visitor = await Visitor.create({ visitorId: 'v_lookup123', userId: user._id.toString() });

  console.log('Created user:', user._id);
  console.log('Created visitor userId:', visitor.userId);

  // Run pipeline
  const res = await Visitor.aggregate([
    { $match: { visitorId: 'v_lookup123' } },
    {
      $addFields: {
        userObjectId: {
          $convert: {
            input: '$userId',
            to: 'objectId',
            onError: null,
            onNull: null,
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userObjectId',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $addFields: {
        user: { $arrayElemAt: ['$userDetails', 0] },
      },
    }
  ]);
  
  console.log('Results:');
  console.log(JSON.stringify(res, null, 2));

  mongoose.disconnect();
}
test();
