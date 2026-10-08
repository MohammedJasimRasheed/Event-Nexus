const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const firecrawlService = require('./firecrawl.service');

const schema = {
  type: "object",
  properties: {
    title: { type: "string" },
    date: { type: "string", description: "ISO 8601 format full date and time. Must contain the year, month, and day." },
    location: { type: "string" },
    description: { type: "string" },
    image: { type: ["string", "null"] },
    registration_link: { type: ["string", "null"] }
  },
  required: ["title", "date", "location", "description"]
};

async function debugScrape() {
  console.log('🔍 Debug Scrape - Checking LLM Extraction\\n');
  
  const testUrl = 'https://ethglobal.com/events/london2024'; // Valid active or past mock event to test extraction.
  console.log(`Testing: ${testUrl}`);
  
  try {
    const result = await firecrawlService.extractData(
      testUrl, 
      schema, 
      "Extract event details including the exact date (convert to ISO8601), full address, and the cover image URL."
    );
    console.log('Extraction Result:\\n', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

debugScrape().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
