/**
 * Seed script: adds sample universities to the DB
 * Run: node seed-universities.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interview';

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    domain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
    resumeLimit: { type: Number, default: 5 },
    interviewLimit: { type: Number, default: 10 },
    logoUrl: { type: String },
    adminEmail: { type: String },
    notes: { type: String },
  },
  { timestamps: true },
);

const University = mongoose.model('University', universitySchema);

const universities = [
  {
    name: 'Thapar Institute of Engineering & Technology',
    domain: 'thapar.edu',
    isActive: true,
    resumeLimit: 10,
    interviewLimit: 20,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Thapar_University_logo.png/220px-Thapar_University_logo.png',
    adminEmail: 'admin@thapar.edu',
    notes: 'Thapar Institute of Engineering & Technology, Patiala — seeded via seed-universities.js',
  },
  {
    name: 'Indian Institute of Technology Bombay',
    domain: 'iitb.ac.in',
    isActive: true,
    resumeLimit: 15,
    interviewLimit: 30,
    adminEmail: 'admin@iitb.ac.in',
    notes: 'IIT Bombay — seeded via seed-universities.js',
  },
  {
    name: 'Indian Institute of Technology Delhi',
    domain: 'iitd.ac.in',
    isActive: true,
    resumeLimit: 15,
    interviewLimit: 30,
    adminEmail: 'admin@iitd.ac.in',
    notes: 'IIT Delhi — seeded via seed-universities.js',
  },
  {
    name: 'Delhi Technological University',
    domain: 'dtu.ac.in',
    isActive: true,
    resumeLimit: 10,
    interviewLimit: 20,
    adminEmail: 'admin@dtu.ac.in',
    notes: 'DTU Delhi — seeded via seed-universities.js',
  },
  {
    name: 'Vellore Institute of Technology',
    domain: 'vit.ac.in',
    isActive: true,
    resumeLimit: 10,
    interviewLimit: 20,
    adminEmail: 'admin@vit.ac.in',
    notes: 'VIT Vellore — seeded via seed-universities.js',
  },
];

async function seed() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  let inserted = 0;
  let skipped = 0;

  for (const u of universities) {
    const exists = await University.findOne({ domain: u.domain });
    if (exists) {
      console.log(`  ⚠  Skipped (already exists): ${u.name} [${u.domain}]`);
      skipped++;
    } else {
      await University.create(u);
      console.log(`  ✓  Inserted: ${u.name} [${u.domain}]  resumeLimit=${u.resumeLimit}  interviewLimit=${u.interviewLimit}`);
      inserted++;
    }
  }

  console.log(`\nDone. ${inserted} inserted, ${skipped} skipped.`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
