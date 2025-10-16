import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DsaQuestionsService } from './dsa-questions.service';
import { sampleDsaQuestions } from './seed-data/sample-questions';

/**
 * Script to seed the database with sample DSA questions
 * 
 * Usage:
 * 1. Make sure your database is running
 * 2. Set your MONGO_URI in .env
 * 3. Run: ts-node src/dsa-questions/seed.script.ts
 * 
 * Or add to package.json:
 * "seed:dsa": "ts-node -r tsconfig-paths/register src/dsa-questions/seed.script.ts"
 */

async function bootstrap() {
  console.log('🌱 Starting DSA Questions seeding...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const dsaQuestionsService = app.get(DsaQuestionsService);

  // Use a default user ID for seeding (you can change this)
  const defaultUserId = '000000000000000000000000'; // Replace with actual user ID

  try {
    let created = 0;
    let skipped = 0;

    for (const question of sampleDsaQuestions) {
      try {
        await dsaQuestionsService.create(question as any, defaultUserId);
        console.log(`✓ Created: ${question.title}`);
        created++;
      } catch (error) {
        if (error.message?.includes('already exists')) {
          console.log(`⊘ Skipped: ${question.title} (already exists)`);
          skipped++;
        } else {
          console.error(`✗ Failed: ${question.title} - ${error.message}`);
        }
      }
    }

    console.log(`\n📊 Seeding Summary:`);
    console.log(`   ✓ Created: ${created}`);
    console.log(`   ⊘ Skipped: ${skipped}`);
    console.log(`   Total: ${sampleDsaQuestions.length}\n`);

    // Show statistics
    const stats = await dsaQuestionsService.getStatistics();
    console.log(`📈 Current Database Statistics:`);
    console.log(`   Total Questions: ${stats.totalQuestions}`);
    console.log(`   By Difficulty:`, stats.byDifficulty);
    console.log(`   By Category:`, stats.byCategory.slice(0, 5), '...\n');

    console.log('✅ Seeding completed successfully!\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
