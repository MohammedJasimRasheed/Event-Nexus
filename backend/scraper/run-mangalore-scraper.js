#!/usr/bin/env node

/**
 * Mangalore Event Scraper Runner
 * Run this script to scrape only Mangalore-specific event sources
 * 
 * Usage:
 *   node run-mangalore-scraper.js
 */

require('dotenv').config();
const ScraperService = require('./scraper.service');
const { sources } = require('./source.config');

// Filter only Mangalore sources
const mangaloreSources = sources.filter(s => 
  s.name.toLowerCase().includes('mangalore') || 
  s.url.toLowerCase().includes('mangalore') ||
  s.url.toLowerCase().includes('mangaluru')
);

console.log('🚀 Mangalore Event Scraper\n');
console.log(`Found ${mangaloreSources.length} Mangalore sources:`);
mangaloreSources.forEach(s => console.log(`  - ${s.name}: ${s.url}`));
console.log('');

// Create a scraper instance and run only Mangalore sources
const scraper = new (ScraperService.constructor || Object.getPrototypeOf(ScraperService).constructor)();

async function run() {
  const results = {
    total: mangaloreSources.length,
    success: 0,
    failed: 0,
    skipped: 0,
    totalEventsFound: 0,
    totalInserted: 0,
    totalUpdated: 0
  };

  for (const source of mangaloreSources) {
    try {
      const result = await ScraperService.scrapeSource(source, true); // force mode
      
      if (result.skipped) {
        results.skipped++;
      } else if (result.success) {
        results.success++;
        results.totalEventsFound += result.eventsFound;
        results.totalInserted += result.inserted || 0;
        results.totalUpdated += result.updated || 0;
      } else {
        results.failed++;
      }
    } catch (err) {
      console.error(`❌ Error scraping ${source.name}:`, err.message);
      results.failed++;
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log('📈 Mangalore Scraping Summary:');
  console.log(`   ✅ Successful: ${results.success}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   ⏭️  Skipped: ${results.skipped}`);
  console.log(`   📋 Events Found: ${results.totalEventsFound}`);
  console.log(`   ➕ Inserted: ${results.totalInserted}`);
  console.log(`   ✏️  Updated: ${results.totalUpdated}`);
  console.log('─'.repeat(60));
  
  return results;
}

run()
  .then(results => {
    console.log('\n✅ Mangalore Scraping Complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Scraping Failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
