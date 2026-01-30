const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-interview';

const InterviewResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  sessionId: { type: String, required: true },
  roundType: { type: String, required: true },
  evaluation: { type: Object },
  next_question: { type: Object },
  state: { type: Object },
  video_analysis: { type: Object },
  analytics: { type: Object },
  rawResponse: { type: Object },
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

async function testSave() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const InterviewResult = mongoose.model('InterviewResult', InterviewResultSchema);

    // Test data
    const testData = {
      userId: new mongoose.Types.ObjectId('697c87811135ecf66c3d23e2'),
      sessionId: 'test_session_' + Date.now(),
      roundType: 'technical',
      evaluation: {
        total_score: 0.5,
        feedback: "Test interview",
        suggestions: ["Test suggestion"]
      },
      state: {
        user_id: '697c87811135ecf66c3d23e2',
        session_id: 'test_session',
        status: 'completed',
        history: []
      },
      video_analysis: {},
      analytics: {},
      completedAt: new Date()
    };

    console.log('\n💾 Saving test interview result...');
    const result = await InterviewResult.create(testData);
    console.log('✅ Test interview saved with ID:', result._id);

    console.log('\n🔍 Querying all interview results...');
    const all = await InterviewResult.find({});
    console.log(`📊 Found ${all.length} interview results in database`);
    
    console.log('\n🔍 Querying for specific user...');
    const userResults = await InterviewResult.find({ 
      userId: new mongoose.Types.ObjectId('697c87811135ecf66c3d23e2') 
    });
    console.log(`📊 Found ${userResults.length} interview results for user 697c87811135ecf66c3d23e2`);
    
    if (userResults.length > 0) {
      console.log('\n📝 Sample result:');
      console.log(JSON.stringify(userResults[0], null, 2));
    }

    await mongoose.disconnect();
    console.log('\n✅ Test completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testSave();
