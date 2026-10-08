/**
 * Course Source Configuration
 * 
 * Sources for finding 100% discount courses from popular platforms
 * Each source defines:
 * - name: Display name
 * - url: Base URL to scrape
 * - scrapeFrequency: Hours between scrapes
 * - type: 'two-step' (extract links then scrape each) or 'single-page'
 * - urlValidator: Function to validate if URL is a course page
 * - parser: Function to extract course data from individual course page
 */

const courseSources = [
  {
    name: 'Real Discount - Udemy Free',
    url: 'https://www.real.discount/udemy-coupon-code/',
    scrapeFrequency: 6, // Check every 6 hours
    type: 'two-step',
    urlValidator: isValidRealDiscountCourseUrl,
    parser: parseRealDiscountCourse
  },
  {
    name: 'Tutorialbar Free Courses',
    url: 'https://www.tutorialbar.com/all-courses/',
    scrapeFrequency: 12,
    type: 'two-step',
    urlValidator: isValidTutorialbarCourseUrl,
    parser: parseTutorialbarCourse
  },
  {
    name: 'DiscUdemy Free',
    url: 'https://www.discudemy.com/all',
    scrapeFrequency: 12,
    type: 'two-step',
    urlValidator: isValidDiscUdemyCourseUrl,
    parser: parseDiscUdemyCourse
  },
  {
    name: 'Freebiesglobal Udemy',
    url: 'https://freebiesglobal.com/category/free-udemy-courses',
    scrapeFrequency: 12,
    type: 'two-step',
    urlValidator: isValidFreebiesglobalCourseUrl,
    parser: parseFreebiesglobalCourse
  }
];

/**
 * URL Validators - Check if URL is a valid course page
 */

function isValidRealDiscountCourseUrl(url) {
  // Accept any page that looks like a course detail page
  return url.includes('real.discount') && 
         url !== 'https://www.real.discount/udemy-coupon-code/' &&
         !url.includes('/page/') &&
         !url.includes('/category/') &&
         !url.includes('/tag/');
}

function isValidTutorialbarCourseUrl(url) {
  // Accept course detail pages
  return url.includes('tutorialbar.com') && 
         url !== 'https://www.tutorialbar.com/all-courses/' &&
         !url.includes('/page/') &&
         !url.includes('/category/');
}

function isValidDiscUdemyCourseUrl(url) {
  // Accept course detail pages
  return url.includes('discudemy.com') && 
         url !== 'https://www.discudemy.com/all' &&
         !url.includes('/page/') &&
         !url.includes('/category/');
}

function isValidFreebiesglobalCourseUrl(url) {
  // Accept individual course post pages
  return url.includes('freebiesglobal.com') && 
         url !== 'https://freebiesglobal.com/category/free-udemy-courses' &&
         !url.includes('/page/') &&
         url.split('/').length > 4; // Has more path segments than just domain
}

/**
 * Course Data Parsers - Extract course information from page content
 */

function parseRealDiscountCourse(content, url) {
  try {
    const courseData = {
      title: '',
      description: '',
      issuer: 'Udemy',
      instructor: '',
      category: '',
      level: '',
      duration: '',
      original_price: 0,
      coupon_code: '',
      course_url: '',
      image_url: '',
      language: 'English',
      rating: null,
      enrolled_count: null,
      source_url: url
    };

    // Extract title
    const titleMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                      content.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      courseData.title = titleMatch[1]
        .replace(/\s*\|\s*Real\.Discount/i, '')
        .replace(/Free Udemy Courses?/i, '')
        .trim();
    }

    // Extract description
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
                     content.match(/<p[^>]*class=["'][^"']*description[^"']*["'][^>]*>([^<]+)</i);
    if (descMatch) {
      courseData.description = descMatch[1].trim();
    }

    // Extract coupon code
    const couponMatch = content.match(/coupon[^:]*:\s*([A-Z0-9_-]+)/i) ||
                       content.match(/code[^:]*:\s*([A-Z0-9_-]+)/i) ||
                       content.match(/\?couponCode=([A-Z0-9_-]+)/i);
    if (couponMatch) {
      courseData.coupon_code = couponMatch[1];
    }

    // Extract Udemy course URL
    const udemyUrlMatch = content.match(/https?:\/\/(?:www\.)?udemy\.com\/course\/([^"'\s?]+)/i);
    if (udemyUrlMatch) {
      const courseSlug = udemyUrlMatch[1].replace(/\/$/, '');
      courseData.course_url = `https://www.udemy.com/course/${courseSlug}/`;
      if (courseData.coupon_code) {
        courseData.course_url += `?couponCode=${courseData.coupon_code}`;
      }
    }

    // Extract image
    const imageMatch = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["'][^"']*course[^"']*["']/i) ||
                      content.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (imageMatch) {
      courseData.image_url = imageMatch[1];
    }

    // Extract category
    const categoryMatch = content.match(/category[^:]*:\s*([^<\n]+)/i) ||
                         content.match(/<span[^>]*class=["'][^"']*category[^"']*["'][^>]*>([^<]+)</i);
    if (categoryMatch) {
      courseData.category = categoryMatch[1].trim();
    }

    // Extract instructor
    const instructorMatch = content.match(/instructor[^:]*:\s*([^<\n]+)/i) ||
                           content.match(/by\s+([^<\n,]+)/i);
    if (instructorMatch) {
      courseData.instructor = instructorMatch[1].trim();
    }

    // Extract rating
    const ratingMatch = content.match(/rating[^:]*:\s*([\d.]+)/i) ||
                       content.match(/([\d.]+)\s*stars?/i);
    if (ratingMatch) {
      courseData.rating = parseFloat(ratingMatch[1]);
    }

    // Extract original price
    const priceMatch = content.match(/(?:₹|Rs\.?|INR)\s*([\d,]+)/i) ||
                      content.match(/price[^:]*:\s*(?:₹|Rs\.?|INR)?\s*([\d,]+)/i);
    if (priceMatch) {
      courseData.original_price = parseFloat(priceMatch[1].replace(/,/g, ''));
    }

    return courseData;
  } catch (error) {
    console.error('Error parsing Real Discount course:', error.message);
    return null;
  }
}

function parseTutorialbarCourse(content, url) {
  try {
    const courseData = {
      title: '',
      description: '',
      issuer: 'Udemy',
      instructor: '',
      category: '',
      level: '',
      duration: '',
      original_price: 0,
      coupon_code: '',
      course_url: '',
      image_url: '',
      language: 'English',
      rating: null,
      enrolled_count: null,
      source_url: url
    };

    // Extract title
    const titleMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                      content.match(/<title>([^<|]+)/i);
    if (titleMatch) {
      courseData.title = titleMatch[1]
        .replace(/\s*-\s*Tutorial Bar/i, '')
        .trim();
    }

    // Extract description
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (descMatch) {
      courseData.description = descMatch[1].trim();
    }

    // Extract course URL and coupon
    const udemyUrlMatch = content.match(/https?:\/\/(?:www\.)?udemy\.com\/course\/([^"'\s?]+)(?:\?couponCode=([^"'\s&]+))?/i);
    if (udemyUrlMatch) {
      const courseSlug = udemyUrlMatch[1].replace(/\/$/, '');
      courseData.course_url = `https://www.udemy.com/course/${courseSlug}/`;
      if (udemyUrlMatch[2]) {
        courseData.coupon_code = udemyUrlMatch[2];
        courseData.course_url += `?couponCode=${courseData.coupon_code}`;
      }
    }

    // Extract image
    const imageMatch = content.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (imageMatch) {
      courseData.image_url = imageMatch[1];
    }

    // Extract category
    const categoryMatch = content.match(/<span[^>]*class=["'][^"']*category[^"']*["'][^>]*>([^<]+)</i);
    if (categoryMatch) {
      courseData.category = categoryMatch[1].trim();
    }

    return courseData;
  } catch (error) {
    console.error('Error parsing Tutorialbar course:', error.message);
    return null;
  }
}

function parseDiscUdemyCourse(content, url) {
  try {
    const courseData = {
      title: '',
      description: '',
      issuer: 'Udemy',
      instructor: '',
      category: '',
      level: '',
      duration: '',
      original_price: 0,
      coupon_code: '',
      course_url: '',
      image_url: '',
      language: 'English',
      rating: null,
      enrolled_count: null,
      source_url: url
    };

    // Extract title
    const titleMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (titleMatch) {
      courseData.title = titleMatch[1]
        .replace(/\[.*?\]/g, '')
        .trim();
    }

    // Extract description
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (descMatch) {
      courseData.description = descMatch[1].trim();
    }

    // Extract Udemy URL
    const udemyUrlMatch = content.match(/https?:\/\/(?:www\.)?udemy\.com\/[^"'\s]+/i);
    if (udemyUrlMatch) {
      courseData.course_url = udemyUrlMatch[0];
      
      // Extract coupon from URL
      const couponMatch = courseData.course_url.match(/couponCode=([^&\s]+)/i);
      if (couponMatch) {
        courseData.coupon_code = couponMatch[1];
      }
    }

    // Extract image
    const imageMatch = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*(?:alt|title)=["'][^"']*course/i);
    if (imageMatch) {
      courseData.image_url = imageMatch[1];
    }

    return courseData;
  } catch (error) {
    console.error('Error parsing DiscUdemy course:', error.message);
    return null;
  }
}

function parseFreebiesglobalCourse(content, url) {
  try {
    const courseData = {
      title: '',
      description: '',
      issuer: 'Udemy',
      instructor: '',
      category: '',
      level: '',
      duration: '',
      original_price: 0,
      coupon_code: '',
      course_url: '',
      image_url: '',
      language: 'English',
      rating: null,
      enrolled_count: null,
      source_url: url
    };

    // Extract title
    const titleMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (titleMatch) {
      courseData.title = titleMatch[1]
        .replace(/free udemy course/i, '')
        .trim();
    }

    // Extract description
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (descMatch) {
      courseData.description = descMatch[1].trim();
    }

    // Extract Udemy URL and coupon
    const udemyUrlMatch = content.match(/href=["'](https?:\/\/(?:www\.)?udemy\.com\/[^"']+)["']/i);
    if (udemyUrlMatch) {
      courseData.course_url = udemyUrlMatch[1];
      
      const couponMatch = courseData.course_url.match(/couponCode=([^&\s]+)/i);
      if (couponMatch) {
        courseData.coupon_code = couponMatch[1];
      }
    }

    // Extract image
    const imageMatch = content.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (imageMatch) {
      courseData.image_url = imageMatch[1];
    }

    return courseData;
  } catch (error) {
    console.error('Error parsing Freebiesglobal course:', error.message);
    return null;
  }
}

module.exports = {
  courseSources,
  // Export validators and parsers for testing
  isValidRealDiscountCourseUrl,
  isValidTutorialbarCourseUrl,
  isValidDiscUdemyCourseUrl,
  isValidFreebiesglobalCourseUrl,
  parseRealDiscountCourse,
  parseTutorialbarCourse,
  parseDiscUdemyCourse,
  parseFreebiesglobalCourse
};
