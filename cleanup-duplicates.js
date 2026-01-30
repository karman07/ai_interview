const mongoose = require('mongoose');

// MongoDB connection URL
const MONGODB_URI = 'mongodb://127.0.0.1:27017/ai_interview'; // Update if needed

async function cleanupDuplicates() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('interviewquestions'); // Check actual collection name

    console.log('📊 Analyzing duplicate documents...\n');
    
    // Find all documents grouped by sessionId and questionNumber
    const duplicates = await collection.aggregate([
      {
        $group: {
          _id: {
            sessionId: '$sessionId',
            questionNumber: '$questionNumber'
          },
          docs: { $push: '$$ROOT' },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      await mongoose.disconnect();
      return;
    }

    console.log(`⚠️  Found ${duplicates.length} sets of duplicate questions\n`);
    
    let totalDocs = 0;
    let toDelete = 0;
    
    duplicates.forEach((dup, index) => {
      const count = dup.count;
      totalDocs += count;
      toDelete += (count - 1);
      
      console.log(`${index + 1}. Session: ${dup._id.sessionId}, Question #${dup._id.questionNumber}`);
      console.log(`   Total copies: ${count} (will keep 1, delete ${count - 1})`);
      
      // Show document IDs
      dup.docs.forEach((doc, i) => {
        const keepOrDelete = i === 0 ? '✅ KEEP' : '❌ DELETE';
        console.log(`   ${keepOrDelete} - ID: ${doc._id} (created: ${doc.createdAt})`);
      });
      console.log('');
    });

    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total duplicate sets: ${duplicates.length}`);
    console.log(`   Total documents: ${totalDocs}`);
    console.log(`   Documents to keep: ${duplicates.length}`);
    console.log(`   Documents to delete: ${toDelete}\n`);

    // Ask for confirmation
    console.log('⚠️  This will DELETE duplicate documents permanently!');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('🗑️  Deleting duplicates...\n');
    
    let deletedCount = 0;
    
    for (const dup of duplicates) {
      // Keep the first document (oldest), delete the rest
      const docsToDelete = dup.docs.slice(1);
      const idsToDelete = docsToDelete.map(doc => doc._id);
      
      const result = await collection.deleteMany({
        _id: { $in: idsToDelete }
      });
      
      deletedCount += result.deletedCount;
      console.log(`✅ Deleted ${result.deletedCount} duplicates for Question #${dup._id.questionNumber}`);
    }

    console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
    console.log(`║                   ✅ CLEANUP COMPLETE!                        ║`);
    console.log(`╚═══════════════════════════════════════════════════════════════╝`);
    console.log(`   Total documents deleted: ${deletedCount}`);
    console.log(`   Remaining unique questions: ${duplicates.length}\n`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

cleanupDuplicates();
