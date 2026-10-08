const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const courseScraperService = require('./course.scraper.service');

console.log('🚀 Course Scraper - Manual Run\n');
console.log('This will scrape free courses from configured sources...\n');

async function main() {
  try {
    // Run the scraper
    const results = await courseScraperService.scrapeAll();
    
    // Update expired courses
    console.log('\n🔄 Updating expired courses...');
    const expiredCount = await courseScraperService.updateExpiredCourses();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ COURSE SCRAPING COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`📚 Total courses found: ${results.totalCoursesFound}`);
    console.log(`⏰ Expired courses marked: ${expiredCount}`);
    console.log('='.repeat(60) + '\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error running course scraper:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
