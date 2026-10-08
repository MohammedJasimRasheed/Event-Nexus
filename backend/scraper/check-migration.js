const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { supabase } = require('../config/db');
const fs = require('fs');

async function applyMigration() {
  try {
    console.log('🚀 Applying course scraper migration...\n');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../database/migrations/add_course_scraper_support.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Migration SQL loaded');
    console.log('⚠️  Note: Supabase client cannot execute raw SQL directly.');
    console.log('📋 Please apply this migration manually:\n');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Copy the SQL from: backend/database/migrations/add_course_scraper_support.sql');
    console.log('3. Paste and run it\n');

    // Verify if tables exist by querying
    console.log('🔍 Checking if course_scrape_logs table exists...');
    
    const { data, error } = await supabase
      .from('course_scrape_logs')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('❌ course_scrape_logs table does NOT exist');
        console.log('📋 Please apply the migration manually in Supabase SQL Editor\n');
      } else {
        console.log(`⚠️  Error checking table: ${error.message}`);
      }
    } else {
      console.log('✅ course_scrape_logs table exists!');
      console.log('✅ Migration already applied or table is ready\n');
    }

    // Check if source_url column exists in courses table
    console.log('🔍 Checking courses table setup...');
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id, source_url')
      .limit(1);

    if (courseError) {
      console.log(`⚠️  Error checking courses table: ${courseError.message}`);
    } else {
      console.log('✅ Courses table is ready for scraping\n');
    }

    console.log('═'.repeat(60));
    console.log('NEXT STEPS:');
    console.log('═'.repeat(60));
    console.log('1. If migration not applied, apply it in Supabase SQL Editor');
    console.log('2. Run: npm run scrape:courses');
    console.log('3. Or run: node scraper/run-course-scraper.js');
    console.log('═'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyMigration().then(() => process.exit(0));
