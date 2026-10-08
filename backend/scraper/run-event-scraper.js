#!/usr/bin/env node

/**
 * Manual Event Scraper Runner
 * Run this script to manually trigger event scraping from all configured sources
 * 
 * Usage:
 *   node run-event-scraper.js          # Normal run (respects frequency)
 *   node run-event-scraper.js --force  # Force run (bypasses frequency check)
 */

require('dotenv').config();
const scraperService = require('./scraper.service');

// Check for --force flag
const forceMode = process.argv.includes('--force');

console.log('🚀 Event Scraper - Manual Run\n');
if (forceMode) {
  console.log('⚡ Force Mode Enabled - Bypassing frequency checks\n');
} else {
  console.log('This will scrape events from all configured sources...\n');
  console.log('💡 Tip: Use --force flag to bypass frequency checks\n');
}

// Run the scraper
scraperService.scrapeAll(forceMode)
  .then(results => {
    console.log('\n✅ Scraping Complete!');
    console.log('\nFinal Results:');
    console.log(`   Total Sources: ${results.total}`);
    console.log(`   Successful: ${results.success}`);
    console.log(`   Failed: ${results.failed}`);
    console.log(`   Skipped: ${results.skipped}`);
    console.log(`   Events Found: ${results.totalEventsFound}`);
    console.log(`   Inserted: ${results.totalInserted}`);
    console.log(`   Updated: ${results.totalUpdated}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Scraping Failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
