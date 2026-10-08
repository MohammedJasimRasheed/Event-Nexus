const { supabase } = require('../config/db');
const firecrawlService = require('./firecrawl.service');
const { courseSources } = require('./course.source.config');

class CourseScraperService {
  /**
   * Check if a source should be scraped based on last scrape time
   */
  async shouldScrape(sourceName, frequencyHours) {
    try {
      const { data, error } = await supabase
        .from('course_scrape_logs')
        .select('scraped_at')
        .eq('source_name', sourceName)
        .order('scraped_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        if (error.code !== 'PGRST301') {
          console.error(`Error checking course scrape logs: ${error.message}`);
        }
        return true;
      }

      if (!data) return true;

      const lastScrapeTime = new Date(data.scraped_at);
      const hoursSinceLastScrape = (Date.now() - lastScrapeTime) / (1000 * 60 * 60);

      return hoursSinceLastScrape >= frequencyHours;
    } catch (error) {
      console.error(`Error in shouldScrape: ${error.message}`);
      return true;
    }
  }

  /**
   * Log scraping activity
   */
  async logScrape(sourceName, status, coursesFound = 0, error = null) {
    try {
      await supabase.from('course_scrape_logs').insert({
        source_name: sourceName,
        status,
        courses_found: coursesFound,
        error_message: error,
        scraped_at: new Date().toISOString()
      });
    } catch (err) {
      console.error(`Failed to log scrape: ${err.message}`);
    }
  }

  /**
   * Check if course already exists (avoid duplicates)
   */
  async courseExists(courseUrl, couponCode) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, status')
        .eq('course_url', courseUrl)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error(`Error checking course existence: ${error.message}`);
        return false;
      }

      // If course exists and is active, skip
      if (data && data.status === 'active') {
        return true;
      }

      // If course exists but expired, update it
      if (data && data.status === 'expired') {
        return data.id; // Return ID to update instead
      }

      return false;
    } catch (error) {
      console.error(`Error in courseExists: ${error.message}`);
      return false;
    }
  }

  /**
   * Save course to database
   */
  async saveCourse(courseData, sourceUrl) {
    try {
      // Validate required fields
      if (!courseData.title || !courseData.course_url) {
        console.log('❌ Missing required fields (title or course_url)');
        return null;
      }

      // Check if course already exists
      const existing = await this.courseExists(courseData.course_url, courseData.coupon_code);
      
      if (existing === true) {
        console.log(`⏭️  Course already exists: ${courseData.title}`);
        return null;
      }

      // Prepare course data with defaults
      const course = {
        title: courseData.title.substring(0, 255),
        description: courseData.description || 'Course description not available',
        issuer: courseData.issuer || 'Udemy',
        instructor: courseData.instructor || null,
        category: courseData.category || 'General',
        level: courseData.level || 'All Levels',
        duration: courseData.duration || null,
        original_price: courseData.original_price || 0,
        discount_percentage: 100,
        coupon_code: courseData.coupon_code || null,
        course_url: courseData.course_url,
        image_url: courseData.image_url || null,
        language: courseData.language || 'English',
        rating: courseData.rating || null,
        enrolled_count: courseData.enrolled_count || null,
        expiry_date: courseData.expiry_date || this.getDefaultExpiryDate(),
        status: 'active',
        source_url: sourceUrl,
        created_by: null // System-scraped courses
      };

      // If updating existing expired course
      if (typeof existing === 'string') {
        const { data, error } = await supabase
          .from('courses')
          .update({
            ...course,
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', existing)
          .select()
          .single();

        if (error) {
          console.error(`❌ Error updating course: ${error.message}`);
          return null;
        }

        console.log(`✅ Updated course: ${data.title}`);
        return data;
      }

      // Insert new course
      const { data, error } = await supabase
        .from('courses')
        .insert(course)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Duplicate key
          console.log(`⏭️  Course already exists (duplicate): ${course.title}`);
          return null;
        }
        console.error(`❌ Error saving course: ${error.message}`);
        return null;
      }

      console.log(`✅ Saved course: ${data.title}`);
      return data;
    } catch (error) {
      console.error(`Error in saveCourse: ${error.message}`);
      return null;
    }
  }

  /**
   * Get default expiry date (30 days from now)
   */
  getDefaultExpiryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString();
  }

  /**
   * Scrape a single source
   */
  async scrapeSource(source) {
    console.log(`\n🔍 Scraping: ${source.name}`);
    console.log(`📍 URL: ${source.url}`);

    try {
      // Check if we should scrape based on frequency
      const shouldScrape = await this.shouldScrape(source.name, source.scrapeFrequency);
      
      if (!shouldScrape) {
        console.log(`⏭️  Skipping ${source.name} (scraped recently)`);
        return { success: true, coursesFound: 0, skipped: true };
      }

      // Step 1: Scrape the listing page to extract course URLs
      console.log('📄 Fetching course listing page...');
      const listingResult = await firecrawlService.scrapeUrl(source.url, {
        formats: ['html'],
        onlyMainContent: false,
        waitFor: 5000,  // Increased wait time
        timeout: 60000  // 60 second timeout for slow sites
      });

      if (!listingResult.success) {
        throw new Error(`Failed to fetch listing page: ${listingResult.error}`);
      }

      // Extract course URLs from the listing page
      const courseUrls = this.extractCourseUrls(listingResult.html, source);
      console.log(`📚 Found ${courseUrls.length} potential course URLs`);

      if (courseUrls.length === 0) {
        console.log(`⚠️  No course URLs found. The site structure may have changed or requires authentication.`);
        await this.logScrape(source.name, 'completed', 0);
        return { success: true, coursesFound: 0 };
      }

      // Step 2: Scrape each course detail page
      let savedCount = 0;
      const maxCoursesPerRun = 20; // Limit to avoid API quota issues
      const coursesToScrape = courseUrls.slice(0, maxCoursesPerRun);

      for (const courseUrl of coursesToScrape) {
        try {
          console.log(`\n🔎 Processing course: ${courseUrl}`);
          
          // If it's a direct Udemy URL, try to extract info from it
          if (courseUrl.includes('udemy.com/course/')) {
            const courseSlug = courseUrl.match(/\/course\/([a-zA-Z0-9_-]+)/)?.[1];
            const couponMatch = courseUrl.match(/couponCode=([A-Z0-9_-]+)/i);
            
            if (courseSlug) {
              const courseData = {
                title: courseSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                description: `Free Udemy course: ${courseSlug}`,
                issuer: 'Udemy',
                instructor: '',
                category: 'General',
                level: 'All Levels',
                duration: '',
                original_price: 3499, // Typical Udemy price in INR
                coupon_code: couponMatch ? couponMatch[1] : '',
                course_url: courseUrl,
                image_url: '',
                language: 'English',
                rating: null,
                enrolled_count: null,
                source_url: source.url
              };
              
              const saved = await this.saveCourse(courseData, source.url);
              if (saved) {
                savedCount++;
              }
              
              // Small delay
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
          }
          
          // Otherwise, scrape the course detail page
          const courseResult = await firecrawlService.scrapeUrl(courseUrl, {
            formats: ['html'],
            onlyMainContent: true,
            waitFor: 3000,  // Wait for page to load
            timeout: 45000  // 45 second timeout
          });

          if (!courseResult.success) {
            console.log(`⚠️  Failed to fetch course page: ${courseResult.error}`);
            continue;
          }

          // Parse course data
          const courseData = source.parser(courseResult.html, courseUrl);
          
          if (!courseData) {
            console.log('⚠️  Failed to parse course data');
            continue;
          }

          // Ensure we have essential data
          if (!courseData.title || !courseData.course_url) {
            console.log('⚠️  Missing required course data');
            continue;
          }

          // Save course
          const saved = await this.saveCourse(courseData, courseUrl);
          if (saved) {
            savedCount++;
          }

          // Small delay between course scrapes
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          console.error(`❌ Error scraping course ${courseUrl}: ${error.message}`);
          continue;
        }
      }

      await this.logScrape(source.name, 'completed', savedCount);
      console.log(`\n✅ ${source.name}: Saved ${savedCount} courses`);
      
      return { success: true, coursesFound: savedCount };

    } catch (error) {
      console.error(`❌ Error scraping ${source.name}: ${error.message}`);
      await this.logScrape(source.name, 'failed', 0, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract course URLs from listing page HTML
   */
  extractCourseUrls(html, source) {
    const urls = new Set();
    
    // First, try to find direct Udemy URLs in the content
    const udemyUrlRegex = /https?:\/\/(?:www\.)?udemy\.com\/course\/[a-zA-Z0-9_-]+/gi;
    let udemyMatch;
    while ((udemyMatch = udemyUrlRegex.exec(html)) !== null) {
      urls.add(udemyMatch[0]);
    }
    
    // If we found Udemy URLs directly, return them (these sites aggregate Udemy courses)
    if (urls.size > 0) {
      console.log(`📝 Found ${urls.size} Udemy course URLs directly`);
      const urlArray = Array.from(urls);
      urlArray.slice(0, 3).forEach(url => console.log(`   - ${url}`));
      return urlArray;
    }
    
    // Otherwise, try to extract page URLs using  multiple patterns
    const patterns = [
      /href=["']([^"']+)["']/gi,      // Standard href with quotes
      /href=([^\s>]+)/gi,              // href without quotes
      /<a[^>]+href=["']([^"']+)["']/gi // Full anchor tag
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const url = match[1];
        
        // Skip invalid URLs
        if (!url || url.startsWith('#') || url.startsWith('javascript:') || url.startsWith('mailto:')) {
          continue;
        }
        
        // Convert relative URLs to absolute
        let absoluteUrl = url;
        try {
          if (url.startsWith('/')) {
            const baseUrl = new URL(source.url);
            absoluteUrl = `${baseUrl.protocol}//${baseUrl.host}${url}`;
          } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
            const baseUrl = new URL(source.url);
            absoluteUrl = `${baseUrl.protocol}//${baseUrl.host}/${url}`;
          }
          
          // Validate if it's a course URL using the source's validator
          if (source.urlValidator(absoluteUrl)) {
            urls.add(absoluteUrl);
          }
        } catch (error) {
          // Skip invalid URLs
          continue;
        }
      }
    }
    
    // Debug: log first few URLs found
    const urlArray = Array.from(urls);
    if (urlArray.length > 0) {
      console.log(`📝 Sample URLs found:`);
      urlArray.slice(0, 3).forEach(url => console.log(`   - ${url}`));
    }
    
    return urlArray;
  }

  /**
   * Scrape all configured sources
   */
  async scrapeAll() {
    console.log('🚀 Starting course scraper...\n');
    console.log(`📋 Sources configured: ${courseSources.length}\n`);

    const results = {
      total: courseSources.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      totalCoursesFound: 0
    };

    for (const source of courseSources) {
      try {
        const result = await this.scrapeSource(source);
        
        if (result.skipped) {
          results.skipped++;
        } else if (result.success) {
          results.successful++;
          results.totalCoursesFound += result.coursesFound || 0;
        } else {
          results.failed++;
        }

        // Delay between sources to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 5000));

      } catch (error) {
        console.error(`❌ Fatal error scraping ${source.name}: ${error.message}`);
        results.failed++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 COURSE SCRAPING SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successful: ${results.successful}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⏭️  Skipped: ${results.skipped}`);
    console.log(`📚 Total courses found: ${results.totalCoursesFound}`);
    console.log('='.repeat(50) + '\n');

    return results;
  }

  /**
   * Mark expired courses as inactive
   */
  async updateExpiredCourses() {
    try {
      console.log('🔄 Checking for expired courses...');

      const { data, error } = await supabase
        .from('courses')
        .update({ status: 'expired' })
        .lt('expiry_date', new Date().toISOString())
        .eq('status', 'active')
        .select('id');

      if (error) {
        console.error(`Error updating expired courses: ${error.message}`);
        return 0;
      }

      const expiredCount = data?.length || 0;
      console.log(`✅ Marked ${expiredCount} courses as expired`);
      
      return expiredCount;
    } catch (error) {
      console.error(`Error in updateExpiredCourses: ${error.message}`);
      return 0;
    }
  }
}

// Create singleton instance
const courseScraperService = new CourseScraperService();

module.exports = courseScraperService;
