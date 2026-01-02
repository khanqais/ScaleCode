const { MongoClient } = require('mongodb');
require('dotenv').config(); // if you use .env file

async function migrateUserId() {
  // Your MongoDB connection string from .env or paste it here
  const uri = process.env.MONGO_URI || "your_connection_string_here";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('ScaleCode');
    
    // Replace these with your actual user IDs
    const oldUserId = "68cfca9dcd7967dca6ed5554"; // Old Clerk ID from your screenshot
    const newUserId = "6957ddca06b87d42791147b9"; // New NextAuth ID from your screenshot
    
    // Update problems collection
    const result = await db.collection('problems').updateMany(
      { userId: oldUserId },
      { $set: { userId: newUserId } }
    );
    
    console.log(`✅ Successfully updated ${result.modifiedCount} documents`);
    console.log(`📊 Matched ${result.matchedCount} documents`);
    
    // Verify the update
    const oldCount = await db.collection('problems').countDocuments({ userId: oldUserId });
    const newCount = await db.collection('problems').countDocuments({ userId: newUserId });
    
    console.log(`\n🔍 Verification:`);
    console.log(`Old userId remaining: ${oldCount} (should be 0)`);
    console.log(`New userId count: ${newCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

migrateUserId();
