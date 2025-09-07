// Script to seed investment plans data
// Run this with: node scripts/seed-plans.js

const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function seedPlans() {
  try {
    console.log("Seeding investment plans...");
    
    const result = await client.mutation("investmentPlans:seedPlans", {});
    
    console.log("✅ Successfully seeded investment plans!");
    console.log(`Inserted ${result.insertedCount} plans`);
    
  } catch (error) {
    console.error("❌ Error seeding plans:", error);
  }
}

seedPlans();
