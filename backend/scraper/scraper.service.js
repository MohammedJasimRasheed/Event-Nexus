const { supabase } = require('../config/db');
const firecrawlService = require('./firecrawl.service');
const { sources } = require('./source.config');

class ScraperService {
  /**
   * Check if a source should be scraped based on last scrape time
   */
  async shouldScrape(sourceName, frequencyHours) {
    try {
      const { data, error } = await supabase
        .from('scrape_logs')
        .select('scraped_at')
        .eq('source_name', sourceName)
        .order('scraped_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Ignore "no rows" error, scrape if never scraped before
        if (error.code !== 'PGRST301') {
          console.error(`Error checking scrape logs: ${error.message}`);
        }
        return true;
      }

      if (!data) return true;

      const lastScrapeTime = new Date(data.scraped_at);
      const hoursSinceLastScrape = (Date.now() - lastScrapeTime) / (1000 * 60 * 60);

      return hoursSinceLastScrape >= frequencyHours;
    } catch (error) {
      console.error(`Error in shouldScrape: ${error.message}`);
      return true; // Scrape if check fails
    }
  }

  /**
   * Log scraping activity
   */
  async logScrape(sourceName, status, eventsFound = 0, error = null) {
    try {
      await supabase.from('scrape_logs').insert({
        source_name: sourceName,
        status,
        events_found: eventsFound,
        error_message: error,
        scraped_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error logging scrape:', err.message);
    }
  }

  /**
   * Validate URL format
   */
  isValidUrl(urlString) {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if an event is relevant for college students (CS/Science/Engineering)
   * Returns { relevant: boolean, reason: string }
   */
  isRelevantForStudents(event) {
    const text = `${event.title || ''} ${event.description || ''}`.toLowerCase();
    const title = (event.title || '').toLowerCase();
    const source = (event.source || '').toLowerCase();

    // ── REJECT: titles that are too short or garbage ──
    if (!event.title || event.title.trim().length < 5) {
      return { relevant: false, reason: 'Title too short or missing' };
    }

    // ── REJECT: garbage/non-event titles (scraped navigation, dates, etc.) ──
    const garbageTitlePatterns = /^(event starts|schedule|about the event|your one application|back to top|announcing|sign up|log in|register now|home|menu|event$|events$|march \d|february \d|january \d|april \d|may \d|june \d|july \d|august \d)/i;
    if (garbageTitlePatterns.test(title.trim())) {
      return { relevant: false, reason: 'Garbage/navigation title' };
    }

    // ── AUTO-ACCEPT: events from trusted student-focused sources ──
    const trustedSources = ['gdg', 'mlh', 'devfolio', 'unstop', 'gcp arcade'];
    if (trustedSources.some(s => source.includes(s))) {
      return { relevant: true, reason: `Trusted source: ${event.source}` };
    }

    // ── REJECT: clearly irrelevant topics for college students ──
    const irrelevantPatterns = [
      /karaoke|sushi|pho real|board game night|coffee\s*(meetup|club)|movie\s*(club|night)/i,
      /wine|beer|brewery|cocktail|brunch|cooking class|food (tour|fest|walk)/i,
      /dating|speed dating|singles|nightclub|bar hop|pub crawl|party night/i,
      /st\.\s*patrick|halloween party|christmas party|new year.*party/i,
      /self[ -]?help|mastering your mind|wealth creation|real estate|property (expo|summit|forum)/i,
      /insurance|mlm|multi.level|essential oils|weight loss|fitness challenge/i,
      /kids (camp|summer|workshop)|children|parenting|baby|toddler/i,
      /yoga retreat|meditation retreat|spiritual|astrology|tarot/i,
      /wedding|fashion show|beauty|makeup|skincare/i,
      /d2c conclave|recommerce|proptech|msme business/i,
      /infectious disease|medical conference|nursing|dental/i,
      /loving boundaries|relationship|couples therapy/i,
    ];

    for (const pattern of irrelevantPatterns) {
      if (pattern.test(text)) {
        return { relevant: false, reason: `Matches irrelevant pattern: ${pattern.source.substring(0, 40)}` };
      }
    }

    // ── ACCEPT: strongly relevant keywords (even if nothing else matches) ──
    const strongRelevancePatterns = [
      /hackathon|hack\s?a\s?thon|buildathon|codeathon|datathon/i,
      /coding\s*(contest|competition|challenge)|competitive programming/i,
      /workshop.*(code|dev|program|web|app|ai|ml|data|cloud|cyber|iot)/i,
      /bootcamp.*(code|dev|program|web|app|full.?stack)/i,
      /artificial intelligence|machine learning|deep learning|neural network|\bai\b|gen\s?ai|llm/i,
      /data science|big data|data analytics|data engineering/i,
      /web dev|frontend|backend|full.?stack|react|angular|vue|node/i,
      /mobile (app|dev)|android|ios|flutter|react native/i,
      /cloud computing|aws|azure|google cloud|gcp|devops|kubernetes|docker/i,
      /cyber\s*security|ethical hacking|penetration testing|ctf|capture the flag/i,
      /blockchain|web3|smart contract|cryptocurrency/i,
      /iot|internet of things|embedded|arduino|raspberry pi/i,
      /open source|git|github|linux|foss/i,
      /startup|entrepreneurship|pitch competition/i,
      /placement|internship|career fair|job fair|campus recruit/i,
      /research paper|ieee|acm|conference.*(computer|software|engineering|science|tech)/i,
      /gdg|google developer|devfest|developer group/i,
      /mlh|major league hacking/i,
      /devfolio|unstop|dare2compete/i,
      /robotics|drone|autonomous|mechatronics/i,
      /quantum computing|computational|algorithm/i,
      /science (fair|expo|olympiad|competition|quiz)/i,
      /math (olympiad|competition|quiz)|mathematics/i,
      /physics|chemistry|biology.*(competition|olympiad|quiz)/i,
      /engineering.*(fest|summit|conference|expo|competition)/i,
      /tech.*(fest|summit|conference|expo|conclave|talk|meetup)/i,
      /college fest|university event|campus event|student event/i,
    ];

    for (const pattern of strongRelevancePatterns) {
      if (pattern.test(text)) {
        return { relevant: true, reason: 'Matches student-relevant pattern' };
      }
    }

    // ── MODERATE RELEVANCE: general tech keywords ──
    const moderatePatterns = /programming|software|developer|engineer|computer|technology|tech|science|coding|code|api|database|server|agile|scrum|networking event/i;
    if (moderatePatterns.test(text)) {
      return { relevant: true, reason: 'Contains general tech/science keywords' };
    }

    // ── DEFAULT: reject if nothing relevant found ──
    return { relevant: false, reason: 'No student-relevant keywords found' };
  }

  /**
   * Insert or update event in database
   */
  async upsertEvent(event, defaultCity = null) {
    try {
      // Validate URL before processing
      if (!this.isValidUrl(event.url)) {
        console.log(`  ⚠️  Invalid URL: ${event.url}`);
        return { action: 'error', error: 'Invalid URL' };
      }

      // Check if event exists by URL
      const { data: existing } = await supabase
        .from('events')
        .select('id, title, date, venue, image')
        .eq('url', event.url)
        .single();

      // Also check for duplicate by title (handles different URLs for same event)
      const { data: duplicateByTitle } = await supabase
        .from('events')
        .select('id, title, url, date, venue, image, created_at')
        .eq('title', event.title)
        .single();

      if (existing) {
        // Check if data changed
        const hasChanged = 
          existing.title !== event.title ||
          existing.date !== event.date ||
          existing.venue !== event.location ||
          existing.image !== event.image;

        if (hasChanged) {
          const { error } = await supabase
            .from('events')
            .update({
              title: event.title,
              date: event.date,
              venue: event.location,
              description: event.description,
              image: event.image,
              registration_link: event.registration_link || event.url,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);

          if (error) throw error;
          console.log(`  ✏️  Updated: ${event.title}`);
          return { action: 'updated', id: existing.id };
        } else {
          console.log(`  ⏭️  Skipped (no changes): ${event.title}`);
          return { action: 'skipped', id: existing.id };
        }
      } else if (duplicateByTitle && duplicateByTitle.url !== event.url) {
        // Found duplicate by title with different URL
        // Decide whether to update based on data quality (prefer event with image)
        const shouldUpdate = 
          (!duplicateByTitle.image && event.image) || // New event has image, old doesn't
          (new Date(event.date) > new Date(duplicateByTitle.date)); // New event is more recent

        if (shouldUpdate) {
          const { error } = await supabase
            .from('events')
            .update({
              url: event.url, // Update to new URL
              date: event.date,
              venue: event.location,
              description: event.description,
              image: event.image || duplicateByTitle.image, // Keep existing image if new one missing
              registration_link: event.registration_link || event.url,
              updated_at: new Date().toISOString()
            })
            .eq('id', duplicateByTitle.id);

          if (error) throw error;
          console.log(`  🔄 Updated duplicate (by title): ${event.title}`);
          return { action: 'updated', id: duplicateByTitle.id };
        } else {
          console.log(`  ⏭️  Skipped duplicate (by title): ${event.title}`);
          return { action: 'skipped', id: duplicateByTitle.id };
        }
      } else {
        // Insert new event
        // Determine if event should be featured based on multiple criteria:
        // 1. Event source reputation (GDG, MLH, Devfolio = higher weight)
        // 2. Event location (Karnataka events prioritized)
        // 3. Event timing (upcoming events within next 30 days)
        // 4. Registration status (open registration preferred)
        
        let featuredScore = 0;
        
        // Source reputation (0-40 points)
        const highRepSources = ['GDG', 'MLH', 'Devfolio'];
        const mediumRepSources = ['Eventbrite', 'Meetup'];
        if (highRepSources.includes(event.source)) {
          featuredScore += 40;
        } else if (mediumRepSources.includes(event.source)) {
          featuredScore += 25;
        } else {
          featuredScore += 10;
        }
        
        // Location (0-35 points)
        const isKarnatakaEvent = /bangalore|bengaluru|mangalore|mangaluru|mysore|mysuru|hubli|hubballi|belagavi|belgaum|karnataka/i.test(
          event.location || ''
        );
        if (isKarnatakaEvent) {
          featuredScore += 35;
        } else if (/online/i.test(event.location || '')) {
          featuredScore += 20; // Online events accessible to all
        } else {
          featuredScore += 5;
        }
        
        // Timing (0-25 points) - events within next 30 days get higher score
        const eventDate = new Date(event.date);
        const daysUntilEvent = Math.ceil((eventDate - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntilEvent >= 0 && daysUntilEvent <= 30) {
          featuredScore += 25;
        } else if (daysUntilEvent > 30 && daysUntilEvent <= 60) {
          featuredScore += 15;
        } else if (daysUntilEvent > 60) {
          featuredScore += 5;
        }
        
        // Mark as featured if score >= 70 (out of 100)
        const isFeatured = featuredScore >= 70;
        
        // Determine city for better filtering
        // Use defaultCity from source config as fallback for city-specific sources
        let city = defaultCity || 'Online';
        if (event.location) {
          if (/bangalore|bengaluru/i.test(event.location)) {
            city = defaultCity || 'Bangalore';
          } else if (/mangalore|mangaluru/i.test(event.location)) {
            city = 'Mangalore';
          } else if (/mysore|mysuru/i.test(event.location)) {
            city = 'Mysore';
          } else if (/hubli|hubballi/i.test(event.location)) {
            city = 'Hubli';
          } else if (/belagavi|belgaum/i.test(event.location)) {
            city = 'Belagavi';
          } else if (!defaultCity && event.location.toLowerCase() !== 'online') {
            city = event.location.split(',')[0].trim(); // Take first part before comma
          }
        }
        
        // Determine event category based on title and description
        let category = 'other';
        const titleAndDesc = `${event.title} ${event.description || ''}`.toLowerCase();
        
        if (/hackathon|hack\s|buildathon/i.test(titleAndDesc)) {
          category = 'hackathon';
        } else if (/workshop|hands-on|training|bootcamp/i.test(titleAndDesc)) {
          category = 'workshop';
        } else if (/meetup|networking|meet\s|community/i.test(titleAndDesc)) {
          category = 'networking';
        } else if (/seminar|conference|summit|symposium/i.test(titleAndDesc)) {
          category = 'seminar';
        } else if (/talk|speaker|presentation/i.test(titleAndDesc)) {
          category = 'tech-talk';
        } else if (/competition|contest|challenge/i.test(titleAndDesc)) {
          category = 'coding-contest';
        } else if (/academic|lecture|course/i.test(titleAndDesc)) {
          category = 'academic';
        }
        
        const { data: newEvent, error } = await supabase
          .from('events')
          .insert({
            title: event.title,
            description: event.description || `Event from ${event.source}`,
            date: event.date,
            venue: event.location,
            city: city,
            college: event.source,
            url: event.url,
            image: event.image,
            registration_link: event.registration_link || event.url,
            category: category,
            event_type: event.location?.toLowerCase().includes('online') ? 'online' : 'offline',
            registration_fee: 0,
            organizer_id: null, // Scraped events don't have a creator
            status: 'approved',
            featured: isFeatured,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        const locationTag = isKarnatakaEvent ? ' [KARNATAKA]' : '';
        const scoreTag = ` [Score: ${featuredScore}]`;
        console.log(`  ➕ Inserted: ${event.title}${isFeatured ? ' [FEATURED]' : ''}${locationTag}${scoreTag}`);
        return { action: 'inserted', id: newEvent.id };
      }
    } catch (error) {
      console.error(`  ❌ Error upserting event "${event.title}": ${error.message}`);
      return { action: 'error', error: error.message };
    }
  }

  /**
   * Scrape a single source using two-step approach
   */
  async scrapeSource(source, force = false) {
    console.log(`\n🌐 Processing: ${source.name}`);
    console.log(`   URL: ${source.url}`);

    // Check if should scrape (unless forced)
    if (!force) {
      const shouldScrape = await this.shouldScrape(source.name, source.scrapeFrequency);
      if (!shouldScrape) {
        console.log(`   ⏭️  Skipped: Scraped recently (frequency: ${source.scrapeFrequency}h)`);
        console.log(`      💡 Tip: Use --force flag to bypass frequency check`);
        return { skipped: true };
      }
    } else {
      console.log(`   🚀 Force mode: Bypassing frequency check`);
    }

    try {
      // STEP 1: Extract all links from listing page
      console.log(`   📋 Step 1: Extracting links from listing page...`);
      const links = await firecrawlService.scrapeLinks(source.url);
      console.log(`   🔗 Found ${links.length} total links`);

      // STEP 2: Filter valid event URLs
      const eventUrls = links.filter(link => {
        try {
          return source.urlValidator(link);
        } catch (error) {
          return false;
        }
      });

      console.log(`   ✅ Filtered to ${eventUrls.length} valid event URLs`);

      if (eventUrls.length === 0) {
        await this.logScrape(source.name, 'success', 0);
        return { success: true, eventsFound: 0, inserted: 0, updated: 0 };
      }

      // STEP 3: Scrape each event page individually using AI Extraction
      console.log(`   📄 Step 2: Extracting details from individual event pages using AI...`);
      const events = [];
      
      const schema = {
        type: "object",
        properties: {
          title: { type: "string" },
          date: { type: "string", description: "ISO 8601 format full start date and time. Must contain the year, month, and day." },
          location: { type: "string", description: "Physical location (address/city). Output 'Online' if virtual." },
          description: { type: "string", description: "Event description, max 500 characters." },
          image: { type: ["string", "null"], description: "Cover image URL. Null if none." },
          registration_link: { type: ["string", "null"], description: "Registration or RSVP link URL. Null if none." }
        },
        required: ["title", "date", "location", "description"]
      };

      for (const eventUrl of eventUrls.slice(0, 20)) { // Limit to 20 events per source
        try {
          const result = await firecrawlService.extractData(
            eventUrl,
            schema,
            "Extract complete and accurate event details from this page. Provide accurate ISO 8601 date, full location, and image if available."
          );
          
          if (result.success && result.data) {
            const aiData = result.data;
            let finalDate = aiData.date;
            
            // Try to validate and parse the date strictly
            const parsedTime = new Date(finalDate).getTime();
            const isValidDate = !isNaN(parsedTime);
            
            // If LLM failed to give a valid ISO string but we have something, try basic fixing or skip
            // We do NOT use Date.now() fallback to avoid the "events disappearing" bug.
            
            const eventData = {
              title: aiData.title,
              date: isValidDate ? new Date(parsedTime).toISOString() : null,
              location: aiData.location,
              description: aiData.description,
              image: aiData.image,
              registration_link: aiData.registration_link || eventUrl,
              url: eventUrl,
              source: source.name.split(' ')[0] // e.g. "GDG" or "Meetup"
            };
            
            if (eventData.title && eventData.date) {
              events.push(eventData);
              console.log(`   ✓ AI Extracted: ${eventData.title} (${eventData.date})`);
            } else {
              console.log(`   ⚠️  AI Extracted poor details for ${eventUrl} - Title: ${eventData.title}, Valid Date: ${isValidDate}`);
            }
          }
        } catch (error) {
          console.log(`   ⚠️  Failed to extract from ${eventUrl}: ${error.message}`);
        }
      }

      console.log(`   📊 Successfully parsed ${events.length} events`);

      if (events.length === 0) {
        await this.logScrape(source.name, 'success', 0);
        return { success: true, eventsFound: 0, inserted: 0, updated: 0 };
      }

      // STEP 5: Filter for student relevance and upsert events
      const results = { inserted: 0, updated: 0, skipped: 0, errors: 0, filtered: 0 };

      for (const event of events) {
        // Check student relevance before upserting
        const relevance = this.isRelevantForStudents(event);
        if (!relevance.relevant) {
          console.log(`   🚫 Filtered out (not student-relevant): ${event.title} — ${relevance.reason}`);
          results.filtered++;
          continue;
        }

        const result = await this.upsertEvent(event, source.defaultCity);
        if (result.action === 'inserted') results.inserted++;
        else if (result.action === 'updated') results.updated++;
        else if (result.action === 'skipped') results.skipped++;
        else if (result.action === 'error') results.errors++;
      }

      console.log(`   📊 Results: ${results.inserted} inserted, ${results.updated} updated, ${results.skipped} skipped, ${results.filtered} filtered, ${results.errors} errors`);

      await this.logScrape(source.name, 'success', events.length);
      return { success: true, eventsFound: events.length, ...results };

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      await this.logScrape(source.name, 'error', 0, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Scrape all sources
   */
  async scrapeAll(force = false) {
    console.log('\n🚀 Starting Event Scraper');
    console.log(`   Time: ${new Date().toISOString()}`);
    console.log(`   Sources: ${sources.length}`);
    if (force) {
      console.log(`Force Mode: Enabled`);
    }
    console.log('─'.repeat(60));

    const results = {
      total: sources.length,
      success: 0,
      failed: 0,
      skipped: 0,
      totalEventsFound: 0,
      totalInserted: 0,
      totalUpdated: 0
    };

    for (const source of sources) {
      const result = await this.scrapeSource(source, force);

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
    }

    console.log('\n' + '─'.repeat(60));
    console.log('📈 Scraping Summary:');
    console.log(`   ✅ Successful: ${results.success}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   ⏭️  Skipped: ${results.skipped}`);
    console.log(`   📋 Events Found: ${results.totalEventsFound}`);
    console.log(`   ➕ Inserted: ${results.totalInserted}`);
    console.log(`   ✏️  Updated: ${results.totalUpdated}`);
    console.log('─'.repeat(60));

    return results;
  }
}

module.exports = new ScraperService();
