

const mongoose = require('mongoose');


const MONGODB_URI = process.env.MONGODB_URI || 'your_mongodb_uri_here';

async function migrateProblemConfidence() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Problem = mongoose.model('Problem', new mongoose.Schema({}, { strict: false }));

    
    const problemsWithoutConfidence = await Problem.find({
      Confidence: { $exists: false }
    });

    console.log(`📊 Found ${problemsWithoutConfidence.length} problems without Confidence field`);

    if (problemsWithoutConfidence.length === 0) {
      console.log('✅ All problems already have Confidence field!');
      return;
    }

    let updated = 0;
    for (const problem of problemsWithoutConfidence) {
    
      const confidenceValue = problem.difficulty || 5;
      
      await Problem.updateOne(
        { _id: problem._id },
        { 
          $set: { 
            Confidence: confidenceValue,
            lastRevised: problem.lastRevised || problem.createdAt || new Date(),
            revisionCount: problem.revisionCount || 0
          } 
        }
      );

      updated++;
      if (updated % 10 === 0) {
        console.log(`⏳ Migrated ${updated}/${problemsWithoutConfidence.length} problems...`);
      }
    }

    console.log(`✅ Successfully migrated ${updated} problems`);
    console.log('🎉 Migration complete!');

    
    const remaining = await Problem.countDocuments({ Confidence: { $exists: false } });
    console.log(`📊 Problems without Confidence: ${remaining}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}


if (require.main === module) {
  migrateProblemConfidence();
}

module.exports = migrateProblemConfidence;
