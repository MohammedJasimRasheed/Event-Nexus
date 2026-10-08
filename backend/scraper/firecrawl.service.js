const FirecrawlApp = require('@mendable/firecrawl-js').default;

class FirecrawlService {
  constructor() {
    if (!process.env.FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY is required in .env file');
    }

    this.client = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
    this.requestQueue = [];
    this.isProcessing = false;
    
    // Throttling: max 4 requests per minute (15 seconds apart)
    this.minRequestInterval = 15000;
    this.lastRequestTime = 0;
  }

  /**
   * Throttled request wrapper
   */
  async throttledRequest(fn) {
    return new Promise((resolve) => {
      this.requestQueue.push({ fn, resolve });
      this.processQueue();
    });
  }

  /**
   * Process queued requests with throttling
   */
  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      const waitTime = Math.max(0, this.minRequestInterval - timeSinceLastRequest);

      if (waitTime > 0) {
        console.log(`⏳ Throttling: waiting ${waitTime}ms before next request`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      const { fn, resolve } = this.requestQueue.shift();
      this.lastRequestTime = Date.now();

      try {
        const result = await fn();
        resolve({ success: true, data: result });
      } catch (error) {
        resolve({ success: false, error: error.message });
      }
    }

    this.isProcessing = false;
  }

  /**
   * Retry logic with exponential backoff
   */
  async retryWithBackoff(fn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) {
          console.error(`❌ Failed after ${maxRetries} attempts: ${error.message}`);
          throw error;
        }

        const backoffTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`⚠️  Attempt ${attempt} failed, retrying in ${backoffTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }

  /**
   * Scrape a single URL
   */
  async scrapeUrl(url, options = {}) {
    console.log(`🔍 Scraping: ${url}`);

    return this.throttledRequest(async () => {
      return this.retryWithBackoff(async () => {
        const result = await this.client.scrapeUrl(url, {
          formats: ['markdown', 'html'],
          onlyMainContent: false, // Changed to false to capture meta tags
          ...options
        });

        if (!result.success) {
          throw new Error(result.error || 'Scraping failed');
        }

        return result;
      });
    });
  }

  /**
   * Scrape a page to extract all links
   */
  async scrapeLinks(url, options = {}) {
    console.log(`🔗 Extracting links from: ${url}`);

    const response = await this.throttledRequest(async () => {
      return this.retryWithBackoff(async () => {
        const result = await this.client.scrapeUrl(url, {
          formats: ['links'],
          onlyMainContent: false,
          ...options
        });

        if (!result.success) {
          throw new Error(result.error || 'Link extraction failed');
        }

        // The result.links might be { data: [...] } or just an array
        const linksData = result.links;
        
        if (!linksData) {
          return [];
        }
        
        // If links is an object with a data property, use that
        if (typeof linksData === 'object' && !Array.isArray(linksData) && linksData.data) {
          return linksData.data;
        }
        
        // If links is already an array, use it directly
        if (Array.isArray(linksData)) {
          return linksData;
        }
        
        return [];
      });
    });

    // throttledRequest wraps the result in { success, data }
    if (response && response.success && response.data) {
      return response.data;
    }
    
    return [];
  }

  /**
   * Map a website (use sparingly due to credit consumption)
   */
  async mapWebsite(url, options = {}) {
    console.log(`🗺️  Mapping website: ${url}`);

    return this.throttledRequest(async () => {
      return this.retryWithBackoff(async () => {
        const result = await this.client.map(url, {
          search: options.search || null,
          ignoreSitemap: options.ignoreSitemap || false,
          limit: options.limit || 100
        });

        if (!result.success) {
          throw new Error(result.error || 'Mapping failed');
        }

        return result.links || [];
      });
    });
  }

  /**
   * Extract structured data using LLM
   */
  async extractData(url, schema, prompt = "Extract the full event details from this page. Provide accurate ISO 8601 date, full location/address, and descriptions.") {
    console.log(`📊 Extracting structured data from: ${url}`);

    return this.throttledRequest(async () => {
      return this.retryWithBackoff(async () => {
        const result = await this.client.scrapeUrl(url, {
          formats: ['extract'],
          extract: {
            schema: schema,
            prompt: prompt
          }
        });

        if (!result.success) {
          throw new Error(result.error || 'Extraction failed');
        }

        return result.extract;
      });
    });
  }
}

module.exports = new FirecrawlService();
