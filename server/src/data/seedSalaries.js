/**
 * Run: node server/src/data/seedSalaries.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../..', 'server/.env') });
const mongoose  = require('mongoose');
const { connectDB } = require('../config/db');
const SalaryData    = require('../models/SalaryData');

const records = [
  // ── Software Engineering ────────────────────────────────────
  { jobTitle: 'Software Engineer',   location: 'Bangalore',  averageSalary: 1200000, minSalary:  600000, medianSalary: 1100000, maxSalary: 2000000, currency: 'INR' },
  { jobTitle: 'Software Engineer',   location: 'Hyderabad',  averageSalary: 1100000, minSalary:  550000, medianSalary: 1000000, maxSalary: 1800000, currency: 'INR' },
  { jobTitle: 'Software Engineer',   location: 'Mumbai',     averageSalary: 1050000, minSalary:  500000, medianSalary:  950000, maxSalary: 1700000, currency: 'INR' },
  { jobTitle: 'Software Engineer',   location: 'Pune',       averageSalary:  950000, minSalary:  450000, medianSalary:  850000, maxSalary: 1500000, currency: 'INR' },
  { jobTitle: 'Software Engineer',   location: 'Delhi',      averageSalary: 1000000, minSalary:  500000, medianSalary:  900000, maxSalary: 1600000, currency: 'INR' },
  { jobTitle: 'Software Engineer',   location: 'Noida',      averageSalary:  950000, minSalary:  450000, medianSalary:  880000, maxSalary: 1550000, currency: 'INR' },
  { jobTitle: 'Software Engineer',   location: 'Chennai',    averageSalary:  950000, minSalary:  450000, medianSalary:  880000, maxSalary: 1500000, currency: 'INR' },
  // ── Flutter ─────────────────────────────────────────────────
  { jobTitle: 'Flutter Developer',   location: 'Ahmedabad',  averageSalary: 1200000, minSalary:  700000, medianSalary: 1150000, maxSalary: 1800000, currency: 'INR' },
  { jobTitle: 'Flutter Developer',   location: 'Bangalore',  averageSalary: 1300000, minSalary:  750000, medianSalary: 1250000, maxSalary: 2000000, currency: 'INR' },
  { jobTitle: 'Flutter Developer',   location: 'Pune',       averageSalary: 1050000, minSalary:  550000, medianSalary: 1000000, maxSalary: 1600000, currency: 'INR' },
  { jobTitle: 'Flutter Developer',   location: 'Mumbai',     averageSalary: 1150000, minSalary:  600000, medianSalary: 1100000, maxSalary: 1750000, currency: 'INR' },
  // ── React ───────────────────────────────────────────────────
  { jobTitle: 'React Developer',     location: 'Bangalore',  averageSalary: 1100000, minSalary:  600000, medianSalary: 1050000, maxSalary: 1800000, currency: 'INR' },
  { jobTitle: 'React Developer',     location: 'Pune',       averageSalary:  950000, minSalary:  500000, medianSalary:  900000, maxSalary: 1500000, currency: 'INR' },
  { jobTitle: 'React Developer',     location: 'Hyderabad',  averageSalary: 1000000, minSalary:  550000, medianSalary:  950000, maxSalary: 1600000, currency: 'INR' },
  // ── SPFX ────────────────────────────────────────────────────
  { jobTitle: 'SPFX Developer',      location: 'Noida',      averageSalary: 1100000, minSalary:  600000, medianSalary: 1050000, maxSalary: 1700000, currency: 'INR' },
  { jobTitle: 'SPFX Developer',      location: 'Bangalore',  averageSalary: 1200000, minSalary:  650000, medianSalary: 1150000, maxSalary: 1800000, currency: 'INR' },
  // ── Data & ML ───────────────────────────────────────────────
  { jobTitle: 'Data Scientist',      location: 'Bangalore',  averageSalary: 1500000, minSalary:  800000, medianSalary: 1400000, maxSalary: 2500000, currency: 'INR' },
  { jobTitle: 'Data Scientist',      location: 'Hyderabad',  averageSalary: 1350000, minSalary:  700000, medianSalary: 1250000, maxSalary: 2200000, currency: 'INR' },
  { jobTitle: 'Data Analyst',        location: 'Mumbai',     averageSalary:  900000, minSalary:  400000, medianSalary:  850000, maxSalary: 1500000, currency: 'INR' },
  { jobTitle: 'Machine Learning Engineer', location: 'Bangalore', averageSalary: 1800000, minSalary: 1000000, medianSalary: 1700000, maxSalary: 3000000, currency: 'INR' },
  // ── Java / Python ───────────────────────────────────────────
  { jobTitle: 'Java Developer',      location: 'Pune',       averageSalary:  900000, minSalary:  400000, medianSalary:  850000, maxSalary: 1500000, currency: 'INR' },
  { jobTitle: 'Java Developer',      location: 'Bangalore',  averageSalary: 1100000, minSalary:  500000, medianSalary: 1000000, maxSalary: 1800000, currency: 'INR' },
  { jobTitle: 'Python Developer',    location: 'Bangalore',  averageSalary: 1100000, minSalary:  500000, medianSalary: 1050000, maxSalary: 1900000, currency: 'INR' },
  { jobTitle: 'Python Developer',    location: 'Hyderabad',  averageSalary: 1000000, minSalary:  450000, medianSalary:  950000, maxSalary: 1700000, currency: 'INR' },
  // ── DevOps / Cloud ──────────────────────────────────────────
  { jobTitle: 'DevOps Engineer',     location: 'Bangalore',  averageSalary: 1400000, minSalary:  700000, medianSalary: 1300000, maxSalary: 2200000, currency: 'INR' },
  { jobTitle: 'Cloud Architect',     location: 'Bangalore',  averageSalary: 2500000, minSalary: 1500000, medianSalary: 2300000, maxSalary: 4000000, currency: 'INR' },
  // ── Product / Management ────────────────────────────────────
  { jobTitle: 'Product Manager',     location: 'Bangalore',  averageSalary: 2000000, minSalary: 1200000, medianSalary: 1900000, maxSalary: 3500000, currency: 'INR' },
  { jobTitle: 'Product Manager',     location: 'Mumbai',     averageSalary: 1800000, minSalary: 1000000, medianSalary: 1700000, maxSalary: 3000000, currency: 'INR' },
  { jobTitle: 'Project Manager',     location: 'Delhi',      averageSalary: 1500000, minSalary:  800000, medianSalary: 1400000, maxSalary: 2500000, currency: 'INR' },
  { jobTitle: 'Project Manager',     location: 'Bangalore',  averageSalary: 1600000, minSalary:  900000, medianSalary: 1500000, maxSalary: 2700000, currency: 'INR' },
  // ── Design ──────────────────────────────────────────────────
  { jobTitle: 'UI/UX Designer',      location: 'Bangalore',  averageSalary:  900000, minSalary:  400000, medianSalary:  850000, maxSalary: 1600000, currency: 'INR' },
  { jobTitle: 'UI/UX Designer',      location: 'Mumbai',     averageSalary:  850000, minSalary:  380000, medianSalary:  800000, maxSalary: 1500000, currency: 'INR' },
  // ── Business / Finance ──────────────────────────────────────
  { jobTitle: 'Business Analyst',    location: 'Mumbai',     averageSalary:  900000, minSalary:  400000, medianSalary:  850000, maxSalary: 1400000, currency: 'INR' },
  { jobTitle: 'Financial Analyst',   location: 'Mumbai',     averageSalary: 1100000, minSalary:  500000, medianSalary: 1000000, maxSalary: 2000000, currency: 'INR' },
  { jobTitle: 'Marketing Manager',   location: 'Mumbai',     averageSalary: 1200000, minSalary:  600000, medianSalary: 1100000, maxSalary: 2000000, currency: 'INR' },
  { jobTitle: 'Sales Manager',       location: 'Delhi',      averageSalary: 1000000, minSalary:  500000, medianSalary:  950000, maxSalary: 1800000, currency: 'INR' },
  { jobTitle: 'HR Manager',          location: 'Bangalore',  averageSalary:  800000, minSalary:  400000, medianSalary:  750000, maxSalary: 1400000, currency: 'INR' },
  // ── Full Stack ──────────────────────────────────────────────
  { jobTitle: 'Full Stack Developer', location: 'Bangalore', averageSalary: 1200000, minSalary:  650000, medianSalary: 1150000, maxSalary: 1900000, currency: 'INR' },
  { jobTitle: 'Full Stack Developer', location: 'Pune',      averageSalary: 1050000, minSalary:  550000, medianSalary: 1000000, maxSalary: 1650000, currency: 'INR' },
  { jobTitle: 'Full Stack Developer', location: 'Hyderabad', averageSalary: 1100000, minSalary:  600000, medianSalary: 1050000, maxSalary: 1750000, currency: 'INR' },
];

async function seed() {
  await connectDB();
  await SalaryData.deleteMany({});
  const inserted = await SalaryData.insertMany(records.map((r) => ({ ...r, lastUpdated: new Date() })));
  console.log(`Seeded ${inserted.length} salary records.`);
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
