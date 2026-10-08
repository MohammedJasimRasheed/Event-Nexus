/**
 * Event Source Configuration
 * 
 * Each source defines:
 * - name: Display name
 * - url: Base URL to scrape
 * - scrapeFrequency: Hours between scrapes
 * - type: 'two-step' (extract links then scrape each)
 * - urlValidator: Function to validate if URL is an event page
 * - parser: Function to extract event data from individual event page
 */

const sources = [
  {
    name: 'GDG Bangalore',
    url: 'https://gdg.community.dev/gdg-bangalore/',
    scrapeFrequency: 12, // hours
    type: 'two-step',
    urlValidator: isValidGDGEventUrl,
    parser: parseGDGEventDetail
  },
  {
    name: 'GDG Cloud Bangalore',
    url: 'https://gdg.community.dev/gdg-cloud-bangalore/',
    scrapeFrequency: 12,
    type: 'two-step',
    urlValidator: isValidGDGEventUrl,
    parser: parseGDGEventDetail
  },
  {
    name: 'GDG Mangalore',
    url: 'https://gdg.community.dev/gdg-mangalore/',
    scrapeFrequency: 12,
    type: 'two-step',
    urlValidator: isValidGDGEventUrl,
    parser: parseGDGEventDetail,
    defaultCity: 'Mangalore'
  },
  {
    name: 'Devfolio Karnataka',
    url: 'https://devfolio.co/hackathons',
    scrapeFrequency: 12,
    type: 'two-step',
    urlValidator: isValidDevfolioEventUrl,
    parser: parseDevfolioEventDetail
  },
  {
    name: 'Meetup Bangalore Tech',
    url: 'https://www.meetup.com/find/?location=in--bangalore&source=EVENTS',
    scrapeFrequency: 12,
    type: 'two-step',
    urlValidator: isValidMeetupEventUrl,
    parser: parseMeetupEventDetail
  },
  {
    name: 'MLH Events',
    url: 'https://mlh.io/seasons/2026/events',
    scrapeFrequency: 24,
    type: 'two-step',
    urlValidator: isValidMLHEventUrl,
    parser: parseMLHEventDetail
  },
  {
    name: 'Eventbrite Bangalore Tech',
    url: 'https://www.eventbrite.com/d/india--bangalore/technology/',
    scrapeFrequency: 6,
    type: 'two-step',
    urlValidator: isValidEventbriteUrl,
    parser: parseEventbriteDetail
  },
  {
    name: 'Eventbrite Bangalore Science',
    url: 'https://www.eventbrite.com/d/india--bangalore/science-and-technology/',
    scrapeFrequency: 12,
    type: 'two-step',
    urlValidator: isValidEventbriteUrl,
    parser: parseEventbriteDetail
  },
  // ── Mangalore Local Events Sources ──
  {
    name: 'Eventbrite Mangalore Tech',
    url: 'https://www.eventbrite.com/d/india--mangalore/technology/',
    scrapeFrequency: 6,
    type: 'two-step',
    urlValidator: isValidEventbriteUrl,
    parser: parseEventbriteDetail,
    defaultCity: 'Mangalore'
  },
  {
    name: 'Eventbrite Mangalore Science',
    url: 'https://www.eventbrite.com/d/india--mangalore/science-and-technology/',
    scrapeFrequency: 12,
    type: 'two-step',
    urlValidator: isValidEventbriteUrl,
    parser: parseEventbriteDetail,
    defaultCity: 'Mangalore'
  },
  // ── Unstop (College Competitions & Hackathons) ──
  {
    name: 'Unstop Hackathons',
    url: 'https://unstop.com/hackathons',
    scrapeFrequency: 12,
    type: 'two-step',
    urlValidator: isValidUnstopUrl,
    parser: parseUnstopDetail
  },
  {
    name: 'Unstop Competitions',
    url: 'https://unstop.com/competitions',
    scrapeFrequency: 12,
    type: 'two-step',
    urlValidator: isValidUnstopUrl,
    parser: parseUnstopDetail
  },
  {
    name: 'Devfolio Mangalore',
    url: 'https://devfolio.co/hackathons?ref=mangalore',
    scrapeFrequency: 12,
    type: 'two-step',
    urlValidator: isValidDevfolioEventUrl,
    parser: parseDevfolioEventDetail,
    defaultCity: 'Mangalore'
  }
];

/**
 * URL Validators
 * Determine if a URL is a valid event page for each source
 */

function isValidGDGEventUrl(url) {
  return /gdg\.community\.dev\/events\/details\//.test(url);
}

function isValidDevfolioEventUrl(url) {
  return /devfolio\.co\/hackathons\/[a-zA-Z0-9-]+\/?$/.test(url) && 
         !/\/guidelines|\/submission|\/rules/.test(url);
}

function isValidGCPArcadeEventUrl(url) {
  return /arcade\.google\/events\/[^\/]+\/?$/.test(url);
}

function isValidMLHEventUrl(url) {
  // Only accept external hackathon sites linked from MLH, or mlh.io event pages
  // Reject MLH internal pages that aren't actual events
  if (/mlh\.io\/(seasons|about|contact|faq|brand|code-of-conduct|privacy|terms)/.test(url)) return false;
  if (/mlh\.io\/event\//.test(url)) return true;
  // Accept external hackathon sites (common MLH-linked domains)
  return /hackathon|devpost|hackerearth|luma\.si|lu\.ma/i.test(url) && 
         !/seasons|about|contact|login|signup/.test(url);
}

function isValidMeetupEventUrl(url) {
  return /meetup\.com\/[^\/]+\/events\/[0-9]+/.test(url);
}

function isValidEventbriteUrl(url) {
  // Match Eventbrite event pages  
  return /eventbrite\.com\/e\/[^\/]+-\d+/.test(url) ||
         /eventbrite\.co\.in\/e\/[^\/]+-\d+/.test(url);
}

function isValidUnstopUrl(url) {
  // Match Unstop event detail pages (hackathons, competitions, workshops)
  return /unstop\.com\/(hackathons|competitions|workshops|college-fests)\/[a-zA-Z0-9][\w-]+-\d+/.test(url) &&
         !/\/login|\/register|\/signup|\/profile/.test(url);
}

/**
 * Event Detail Parsers
 * Extract event data from individual event pages
 * Return: { title, date, location, url, description, image, source }
 */

function parseGDGEventDetail(content, eventUrl) {
  try {
    const html = content.html || '';
    const markdown = content.markdown || '';
    
    // Try extracting structured data first (JSON-LD)
    const structuredData = extractStructuredData(html);
    
    // Extract title - priority: og:title > structured data > specific h1 classes > markdown
    // GDG pages have misleading h1 tags (Organizer, Moderator), so prioritize meta tags
    let title = null;
    
    // Try og:title first (most reliable for GDG)
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    if (ogTitleMatch) {
      title = cleanText(ogTitleMatch[1]);
    }
    
    // Try structured data
    if (!title && structuredData?.name) {
      title = cleanText(structuredData.name);
    }
    
    // Try markdown heading (usually reliable)
    if (!title) {
      const mdTitleMatch = markdown.match(/^#\s+(.+?)$/m);
      if (mdTitleMatch) {
        const candidate = cleanText(mdTitleMatch[1]);
        // Only use if it's not a role name and is reasonably long
        if (candidate.length > 5 && !/^(organizer|moderator|speaker|host|hosts|about|description)$/i.test(candidate)) {
          title = candidate;
        }
      }
    }
    
    // Fallback: try h1, but filter out short/invalid ones
    if (!title) {
      const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
      if (h1Match && h1Match.length > 0) {
        // Find the longest h1 that's not a role name
        for (const match of h1Match) {
          const candidate = cleanText(match.replace(/<\/?h1[^>]*>/gi, ''));
          if (candidate.length > 10 && !/^(organizer|moderator|speaker|host|hosts)$/i.test(candidate)) {
            title = candidate;
            break;
          }
        }
      }
    }
    
    // Final fallback
    if (!title) {
      title = 'GDG Event';
    }
    
    // Validate title - skip if it's a role name or generic word
    const invalidTitles = /^(organizer|moderator|speaker|host|hosts|about|description|details|date|time|location|venue|register|rsvp|join|event)$/i;
    if (invalidTitles.test(title)) {
      console.log(`  ⚠️  Skipping event with invalid title: ${title}`);
      return null;
    }

    // Extract date - GDG has specific date formats
    // Look for patterns like "Sun, Feb 15, 2026" or ISO dates in time elements
    let date = structuredData?.startDate;
    if (!date) {
      // Try time element first (most reliable)
      const timeMatch = html.match(/<time[^>]*datetime=["']([^"']+)["']/i) ||
                       html.match(/data-start-date=["']([^"']+)["']/i);
      
      if (timeMatch) {
        date = timeMatch[1];
      } else {
        // Look for date patterns in markdown - avoiding image URLs
        // Common GDG format: "Sun, Feb 15, 2026, 10:00 AM IST"
        const mdDateMatch = markdown.match(/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+\d{4}(?:,\s+\d{1,2}:\d{2}\s*(?:AM|PM))?/i);
        if (mdDateMatch && !mdDateMatch[0].includes('http') && !mdDateMatch[0].includes('.svg')) {
          date = mdDateMatch[0];
        } else {
          // Fallback: look for ISO date pattern in content (not in URLs)
          const isoMatch = markdown.match(/\b(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^\s]*)/);
          if (isoMatch && !isoMatch[0].includes('http')) {
            date = isoMatch[1];
          } else {
            // Last resort: look for any date string not in image URL
            const simpleDateMatch = markdown.match(/(?:date|when)[\s:]*([A-Z][a-z]+,?\s+[A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i);
            if (simpleDateMatch && !simpleDateMatch[1].includes('http')) {
              date = simpleDateMatch[1];
            }
          }
        }
      }
    }
    date = parseDate(date || new Date().toISOString());

    // Extract location - priority: structured data > location element > regex
    let location = structuredData?.location?.name || structuredData?.location;
    if (!location) {
      const locationMatch = html.match(/<span[^>]*class="[^"]*location[^"]*"[^>]*>([^<]+)<\/span>/i) ||
                           html.match(/data-location=["']([^"']+)["']/i) ||
                           markdown.match(/(?:location|where|venue)[\s:]*([^\n]+?)(?:\n|$)/i);
      location = locationMatch ? cleanText(locationMatch[1]) : null;
    }
    // Validate location - filter invalid values
    if (location) {
      location = cleanText(location);
      // Filter out common invalid patterns
      const invalidPatterns = [
        /security|register|required|admission|pre-register|click|link|rsvp/i, // Registration text
        /^[^a-zA-Z0-9\s,]+$/, // Only symbols
        /https?:\/\//i, // URLs
        /^(tba|tbd|n\/a|na|pending|coming soon)$/i, // Placeholder text
      ];
      
      const isInvalid = invalidPatterns.some(pattern => pattern.test(location)) ||
                       location.length < 3 || 
                       location.length > 100;
      
      if (isInvalid) {
        location = null;
      }
    }
    location = normalizeLocation(location || 'Bangalore, Karnataka');

    // Extract description - priority: og:description > structured data > first paragraph
    let description = '';
    const descMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    if (descMatch) {
      description = cleanText(descMatch[1]);
    } else {
      description = structuredData?.description || '';
      if (!description) {
        // Extract first meaningful paragraph from markdown (skip headers and image descriptions)
        const lines = markdown.split('\n').filter(line => {
          const trimmed = line.trim();
          return trimmed && 
                 !trimmed.startsWith('#') && 
                 !trimmed.startsWith('!') && 
                 !trimmed.startsWith('[') &&
                 !trimmed.includes('http') &&
                 !trimmed.includes('background(') &&
                 !trimmed.includes('svg)') &&
                 !trimmed.includes('css') &&
                 trimmed.length > 50;
        });
        description = lines.length > 0 ? cleanText(lines[0]) : 'GDG Community Event';
      }
    }
    // Filter out CSS/HTML artifacts
    if (description && (description.includes('background(') || description.includes('url(') || description.startsWith(')'))) {
      description = 'GDG Community Event';
    }
    description = description.substring(0, 500);

    // Extract image - multiple strategies for better coverage
    let image = null;
    
    // Try meta tags first (most reliable)
    const metaImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (metaImgMatch) {
      image = metaImgMatch[1];
    }
    
    // Try structured data
    if (!image && structuredData?.image) {
      image = structuredData.image;
    }
    
    // Try markdown image syntax (![alt](url))
    if (!image) {
      const mdImgMatch = markdown.match(/!\[[^\]]*\]\(([^)]+)\)/);
      if (mdImgMatch) {
        const imgUrl = mdImgMatch[1];
        // Only use if it's a real image URL (not icon/svg)
        if (imgUrl.includes('http') && (imgUrl.includes('.jpg') || imgUrl.includes('.png') || imgUrl.includes('.jpeg') || imgUrl.includes('.webp'))) {
          image = imgUrl;
        }
      }
    }
    
    // Try any img tag as fallback
    if (!image) {
      const anyImgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (anyImgMatch) {
        const imgUrl = anyImgMatch[1];
        // Filter out small icons and SVGs
        if (!imgUrl.includes('icon') && !imgUrl.includes('logo') && (imgUrl.includes('.jpg') || imgUrl.includes('.png') || imgUrl.includes('.jpeg') || imgUrl.includes('.webp'))) {
          image = imgUrl;
        }
      }
    }

    // Registration link - look for register/RSVP buttons
    let registration_link = eventUrl;
    const regMatch = html.match(/<a[^>]+(?:class="[^"]*(?:register|rsvp|join)[^"]*"|href="[^"]*(?:register|rsvp|join)[^"]*")[^>]+href=["']([^"']+)["']/i);
    if (regMatch) registration_link = regMatch[1];

    return {
      title: cleanText(title),
      date,
      location,
      url: eventUrl,
      description,
      image,
      source: 'GDG',
      registration_link
    };
  } catch (error) {
    console.error('Error parsing GDG event detail:', error.message);
    return null;
  }
}

function parseDevfolioEventDetail(content, eventUrl) {
  try {
    const html = content.html || '';
    const markdown = content.markdown || '';
    
    // Extract structured data
    const structuredData = extractStructuredData(html);
    
    // Extract title - Devfolio has specific title structure
    let title = structuredData?.name || structuredData?.title;
    if (!title) {
      const titleMatch = html.match(/<h1[^>]*class="[^"]*(?:title|heading)[^"]*"[^>]*>([^<]+)<\/h1>/i) ||
                        html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                        html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                        markdown.match(/^#\s+(.+?)$/m);
      title = titleMatch ? cleanText(titleMatch[1]) : eventUrl.split('/').pop().replace(/-/g, ' ');
    }
    
    // Validate title - skip if it's a role name or generic word
    const invalidTitles = /^(organizer|moderator|speaker|host|hosts|about|description|details|date|time|location|venue|register|rsvp|join|event|applied|open|upcoming|past)$/i;
    if (invalidTitles.test(title)) {
      console.log(`  ⚠️  Skipping Devfolio event with invalid title: ${title}`);
      return null;
    }

    // Extract date - Devfolio shows timeline/dates
    let date = structuredData?.startDate;
    if (!date) {
      const dateMatch = html.match(/<time[^>]*datetime=["']([^"']+)["']/i) ||
                       html.match(/data-(?:start-)?date=["']([^"']+)["']/i) ||
                       html.match(/<span[^>]*class="[^"]*date[^"]*"[^>]*>([^<]+)<\/span>/i) ||
                       markdown.match(/(?:date|timeline|starts?|when)[:\s]*([^\n]+)/i);
      date = dateMatch ? parseDate(dateMatch[1].trim()) : new Date().toISOString();
    }
    date = parseDate(date);

    // Extract location - Devfolio shows mode (online/offline)
    let location = structuredData?.location?.name || structuredData?.location;
    if (!location) {
      const locationMatch = html.match(/<span[^>]*class="[^"]*(?:location|venue|mode)[^"]*"[^>]*>([^<]+)<\/span>/i) ||
                           html.match(/data-(?:location|venue|mode)=["']([^"']+)["']/i) ||
                           markdown.match(/(?:mode|location|venue)[:\s]*([^\n]+?)(?:\n|$)/i);
      location = locationMatch ? cleanText(locationMatch[1]) : null;
    }
    // Validate location - filter invalid values
    if (location) {
      location = cleanText(location);
      if (location.includes('http') || /^[^a-zA-Z0-9]+$/.test(location) || 
          location.length < 3 || location.length > 100) {
        location = null;
      }
    }
    location = normalizeLocation(location || 'Bangalore, Karnataka');

    // Extract description - Devfolio has detailed descriptions
    let description = '';
    const descMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                     html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/div>/is);
    if (descMatch) {
      description = cleanText(descMatch[1].replace(/<[^>]+>/g, ''));
    } else {
      const mdDescMatch = markdown.match(/(?:about|description|overview)[:\s]*([^\n#]+(?:\n(?!#)[^\n]+)*)/is);
      description = mdDescMatch ? cleanText(mdDescMatch[1]) : 'Hackathon on Devfolio';
    }
    description = description.substring(0, 500);

    // Extract image - enhanced extraction with multiple strategies
    let image = null;
    const metaImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (metaImgMatch) {
      // Decode HTML entities like &amp; to &
      image = metaImgMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    } else if (structuredData?.image) {
      image = structuredData.image;
    } else {
      // Try markdown image syntax
      const mdImgMatch = markdown.match(/!\[[^\]]*\]\(([^)]+)\)/);
      if (mdImgMatch) {
        const imgUrl = mdImgMatch[1];
        if (imgUrl.includes('http') && (imgUrl.includes('.jpg') || imgUrl.includes('.png') || imgUrl.includes('.jpeg') || imgUrl.includes('.webp'))) {
          image = imgUrl;
        }
      }
      // Last resort: any img tag with banner/cover/hero class
      if (!image) {
        const anyImgMatch = html.match(/<img[^>]+class="[^"]*(?:banner|cover|thumbnail|hero)[^"]*"[^>]+src=["']([^"']+)["']/i);
        if (anyImgMatch) image = anyImgMatch[1];
      }
    }

    // Registration link - Devfolio has apply/register buttons
    let registration_link = eventUrl;
    const regMatch = html.match(/<a[^>]+(?:class="[^"]*(?:apply|register|join)[^"]*"|href="[^"]*(?:apply|register|join)[^"]*")[^>]+href=["']([^"']+)["']/i);
    if (regMatch) registration_link = regMatch[1];

    return {
      title: cleanText(title),
      date,
      location,
      url: eventUrl,
      description,
      image,
      source: 'Devfolio',
      registration_link
    };
  } catch (error) {
    console.error('Error parsing Devfolio event detail:', error.message);
    return null;
  }
}

function parseGCPArcadeEventDetail(content, eventUrl) {
  try {
    const html = content.html || '';
    const markdown = content.markdown || '';
    
    // Extract structured data
    const structuredData = extractStructuredData(html);
    
    // Extract title
    let title = structuredData?.name || structuredData?.title;
    if (!title) {
      const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                        html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                        markdown.match(/^#\s+(.+?)$/m);
      title = titleMatch ? cleanText(titleMatch[1]) : 'Google Cloud Arcade Event';
    }
    
    // Validate title - skip if it's a role name or generic word
    const invalidTitles = /^(organizer|moderator|speaker|host|hosts|about|description|details|date|time|location|venue|register|rsvp|join|event)$/i;
    if (invalidTitles.test(title) || title.length < 5) {
      console.log(`  ⚠️  Skipping GCP Arcade event with invalid title: ${title}`);
      return null;
    }

    // Extract date
    let date = structuredData?.startDate;
    if (!date) {
      const dateMatch = html.match(/<time[^>]*datetime=["']([^"']+)["']/i) ||
                       markdown.match(/(?:date|when)[:\s]*([^\n]+)/i);
      date = dateMatch ? parseDate(dateMatch[1].trim()) : new Date().toISOString();
    }
    date = parseDate(date);

    // Extract description
    let description = '';
    const descMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    if (descMatch) {
      description = cleanText(descMatch[1]);
    } else {
      const mdDescMatch = markdown.match(/(?:about|description)[:\s]*([^\n#]+(?:\n(?!#)[^\n]+)*)/is);
      description = mdDescMatch ? cleanText(mdDescMatch[1]) : 'Google Cloud Arcade Event';
    }
    description = description.substring(0, 500);

    // Extract image - enhanced extraction
    let image = null;
    const metaImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (metaImgMatch) {
      image = metaImgMatch[1];
    } else if (structuredData?.image) {
      image = structuredData.image;
    } else {
      const mdImgMatch = markdown.match(/!\[[^\]]*\]\(([^)]+)\)/);
      if (mdImgMatch && (mdImgMatch[1].includes('.jpg') || mdImgMatch[1].includes('.png') || mdImgMatch[1].includes('.jpeg') || mdImgMatch[1].includes('.webp'))) {
        image = mdImgMatch[1];
      }
    }

    // Registration link
    let registration_link = eventUrl;
    const regMatch = html.match(/<a[^>]+(?:class="[^"]*(?:register|join)[^"]*"|href="[^"]*(?:register|join)[^"]*")[^>]+href=["']([^"']+)["']/i);
    if (regMatch) registration_link = regMatch[1];

    return {
      title: cleanText(title),
      date,
      location: 'Online',
      url: eventUrl,
      description,
      image,
      source: 'GCP Arcade',
      registration_link
    };
  } catch (error) {
    console.error('Error parsing GCP Arcade event detail:', error.message);
    return null;
  }
}

function parseMLHEventDetail(content, eventUrl) {
  try {
    const html = content.html || '';
    const markdown = content.markdown || '';
    
    // Extract structured data
    const structuredData = extractStructuredData(html);
    
    // Extract title - MLH has specific title structure
    let title = structuredData?.name || structuredData?.title;
    if (!title) {
      const titleMatch = html.match(/<h1[^>]*class="[^"]*event-name[^"]*"[^>]*>([^<]+)<\/h1>/i) ||
                        html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                        html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                        markdown.match(/^#\s+(.+?)$/m);
      title = titleMatch ? cleanText(titleMatch[1]) : 'MLH Event';
    }
    
    // Validate title - skip if it's a role name or generic word
    const invalidTitles = /^(organizer|moderator|speaker|host|hosts|about|description|details|date|time|location|venue|register|rsvp|join|event|hack|make|back to top|announcing)$/i;
    if (invalidTitles.test(title) || title.length < 3) {
      console.log(`  ⚠️  Skipping MLH event with invalid title: ${title}`);
      return null;
    }

    // Extract date - MLH shows event dates clearly
    let date = structuredData?.startDate;
    if (!date) {
      const dateMatch = html.match(/<time[^>]*datetime=["']([^"']+)["']/i) ||
                       html.match(/data-(?:start-)?date=["']([^"']+)["']/i) ||
                       markdown.match(/(?:date|when)[:\s]*([^\n]+)/i) ||
                       html.match(/(?:date|when)[:\s]*(.+?)(?:<|$)/i);
      date = dateMatch ? parseDate(dateMatch[1].trim()) : new Date().toISOString();
    }
    date = parseDate(date);

    // Extract location - MLH shows location/format
    let location = structuredData?.location?.name || structuredData?.location;
    if (!location) {
      const locationMatch = html.match(/<span[^>]*class="[^"]*event-location[^"]*"[^>]*>([^<]+)<\/span>/i) ||
                           markdown.match(/(?:location|where)[:\s]*([^\n]+?)(?:\n|$)/i) ||
                           markdown.match(/(?:city|campus)[:\s]*([^\n]+?)(?:\n|$)/i);
      location = locationMatch ? cleanText(locationMatch[1]) : null;
    }
    // Validate location - filter invalid values
    if (location) {
      location = cleanText(location);
      if (location.includes('http') || /^[^a-zA-Z0-9]+$/.test(location) || 
          location.length < 3 || location.length > 100 ||
          /participants|team|work|event|hackathon|where|when/i.test(location)) {
        location = null;
      }
    }
    location = normalizeLocation(location || 'Various');

    // Extract description - MLH has detailed descriptions
    let description = '';
    const descMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    if (descMatch) {
      description = cleanText(descMatch[1]);
    } else {
      const mdDescMatch = markdown.match(/(?:about|description)[:\s]*([^\n#]+(?:\n(?!#)[^\n]+)*)/is);
      description = mdDescMatch ? cleanText(mdDescMatch[1]) : 'Major League Hacking Event';
    }
    // Filter out CSS/HTML artifacts and incomplete descriptions
    if (description && (description.includes('background(') || description.includes('url(') || description.startsWith(')') || description.length < 20)) {
      description = 'Major League Hacking Event';
    }
    description = description.substring(0, 500);

    // Extract image - enhanced extraction
    let image = null;
    const metaImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (metaImgMatch) {
      image = metaImgMatch[1];
    } else if (structuredData?.image) {
      image = structuredData.image;
    } else {
      const mdImgMatch = markdown.match(/!\[[^\]]*\]\(([^)]+)\)/);
      if (mdImgMatch && (mdImgMatch[1].includes('.jpg') || mdImgMatch[1].includes('.png') || mdImgMatch[1].includes('.jpeg') || mdImgMatch[1].includes('.webp'))) {
        image = mdImgMatch[1];
      }
    }

    // Registration link
    let registration_link = eventUrl;
    const regMatch = html.match(/<a[^>]+(?:class="[^"]*(?:apply|register)[^"]*"|href="[^"]*(?:apply|register)[^"]*")[^>]+href=["']([^"']+)["']/i);
    if (regMatch) registration_link = regMatch[1];

    return {
      title: cleanText(title),
      date,
      location,
      url: eventUrl,
      description,
      image,
      source: 'MLH',
      registration_link
    };
  } catch (error) {
    console.error('Error parsing MLH event detail:', error.message);
    return null;
  }
}

function parseMeetupEventDetail(content, eventUrl) {
  try {
    const html = content.html || '';
    const markdown = content.markdown || '';
    
    // Extract structured data
    const structuredData = extractStructuredData(html);
    
    // Extract title - Meetup has specific title structure
    let title = structuredData?.name || structuredData?.title;
    if (!title) {
      const titleMatch = html.match(/<h1[^>]*class="[^"]*eventTitle[^"]*"[^>]*>([^<]+)<\/h1>/i) ||
                        html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                        html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                        html.match(/<title>(.+?)(?:\s*\|\s*Meetup)?<\/title>/i) ||
                        markdown.match(/^#\s+(.+?)$/m);
      title = titleMatch ? cleanText(titleMatch[1]).replace(' | Meetup', '').trim() : 'Meetup Event';
    }
    
    // Validate title - skip if it's a role name or generic word
    const invalidTitles = /^(organizer|moderator|speaker|host|hosts|about|description|details|date|time|location|venue|register|rsvp|join|event|meetup)$/i;
    if (invalidTitles.test(title) || title.length < 5) {
      console.log(`  ⚠️  Skipping Meetup event with invalid title: ${title}`);
      return null;
    }

    // Extract date - Meetup has specific time patterns
    let date = structuredData?.startDate;
    if (!date) {
      const dateMatch = html.match(/<time[^>]*datetime=["']([^"']+)["']/i) ||
                       html.match(/data-event-time=["']([^"']+)["']/i) ||
                       html.match(/<meta[^>]+itemprop=["']startDate["'][^>]+content=["']([^"']+)["']/i) ||
                       markdown.match(/(?:date|when|time)[:\s]*([^\n]+)/i) ||
                       html.match(/(?:date|when)[:\s]*(.+?)(?:<|$)/i);
      date = dateMatch ? parseDate(dateMatch[1].trim()) : new Date().toISOString();
    }
    date = parseDate(date);

    // Extract location - Meetup has detailed location data
    let location = null;
    
    // Try structured data first (most reliable)
    if (structuredData?.location?.address?.addressLocality) {
      const locality = structuredData.location.address.addressLocality;
      const region = structuredData.location.address.addressRegion || '';
      location = `${locality}${region ? ', ' + region : ''}`;
    } else if (structuredData?.location?.name) {
      location = structuredData.location.name;
    } else if (structuredData?.location?.address) {
      location = typeof structuredData.location.address === 'string' ? 
                 structuredData.location.address : 
                 structuredData.location.address.streetAddress || null;
    }
    
    // Try HTML/markdown if structured data not available
    if (!location) {
      const locationMatch = html.match(/<span[^>]*class="[^"]*venueAddress[^"]*"[^>]*>([^<]+)<\/span>/i) ||
                           html.match(/<p[^>]*class="[^"]*event-location[^"]*"[^>]*>([^<]+)<\/p>/i) ||
                           html.match(/<div[^>]*class="[^"]*venue-name[^"]*"[^>]*>([^<]+)<\/div>/i) ||
                           html.match(/data-event-location=["']([^"']+)["']/i);
      location = locationMatch ? cleanText(locationMatch[1]) : null;
    }
    
    // Validate location - filter invalid values
    if (location) {
      location = cleanText(location);
      // Filter out common invalid patterns
      const invalidPatterns = [
        /security|register|required|admission|pre-register|click|link|rsvp/i, // Registration text
        /^[^a-zA-Z0-9\s,]+$/, // Only symbols
        /https?:\/\//i, // URLs
        /^(tba|tbd|n\/a|na|pending|coming soon)$/i, // Placeholder text
        /\d{10,}/, // Long numbers (likely IDs)
      ];
      
      const isInvalid = invalidPatterns.some(pattern => pattern.test(location)) ||
                       location.length < 3 || 
                       location.length > 150;
      
      if (isInvalid) {
        location = null;
      }
    }
    
    location = normalizeLocation(location || 'Online');

    // Extract description - Meetup has detailed descriptions
    let description = '';
    const descMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                     html.match(/<div[^>]*class="[^"]*event-description[^"]*"[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/div>/is);
    if (descMatch) {
      description = cleanText(descMatch[1].replace(/<[^>]+>/g, ' '));
    } else {
      const mdDescMatch = markdown.match(/(?:about|description|details)[:\s]*([^\n#]+(?:\n(?!#)[^\n]+)*)/is);
      description = mdDescMatch ? cleanText(mdDescMatch[1]) : 'Tech event in Karnataka';
    }
    description = description.substring(0, 500);

    // Extract image - enhanced extraction
    let image = null;
    const metaImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (metaImgMatch) {
      image = metaImgMatch[1];
    } else if (structuredData?.image) {
      image = structuredData.image;
    } else {
      const mdImgMatch = markdown.match(/!\[[^\]]*\]\(([^)]+)\)/);
      if (mdImgMatch && (mdImgMatch[1].includes('.jpg') || mdImgMatch[1].includes('.png') || mdImgMatch[1].includes('.jpeg') || mdImgMatch[1].includes('.webp'))) {
        image = mdImgMatch[1];
      }
    }

    // Registration link
    let registration_link = eventUrl;
    const regMatch = html.match(/<a[^>]+(?:class="[^"]*(?:rsvp|attend|register)[^"]*"|href="[^"]*(?:rsvp|attend|register)[^"]*")[^>]+href=["']([^"']+)["']/i);
    if (regMatch) registration_link = regMatch[1];

    return {
      title: cleanText(title),
      date,
      location,
      url: eventUrl,
      description,
      image,
      source: 'Meetup',
      registration_link
    };
  } catch (error) {
    console.error('Error parsing Meetup event detail:', error.message);
    return null;
  }
}

function parseEventbriteDetail(content, eventUrl) {
  try {
    const html = content.html || '';
    const markdown = content.markdown || '';
    
    // Extract structured data
    const structuredData = extractStructuredData(html);
    
    // Extract title - Eventbrite has specific title structure
    let title = structuredData?.name || structuredData?.title;
    if (!title) {
      const titleMatch = html.match(/<h1[^>]*class="[^"]*event-title[^"]*"[^>]*>([^<]+)<\/h1>/i) ||
                        html.match(/<h1[^>]*class="[^"]*listing-hero-title[^"]*"[^>]*>([^<]+)<\/h1>/i) ||
                        html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                        html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                        html.match(/<title>(.+?)(?:\s*\|\s*Eventbrite)?<\/title>/i) ||
                        markdown.match(/^#\s+(.+?)$/m);
      title = titleMatch ? cleanText(titleMatch[titleMatch.length - 1]) : 'Eventbrite Event';
    }
    
    // Validate title - skip if it's a role name or generic word
    const invalidTitles = /^(organizer|moderator|speaker|host|hosts|about|description|details|date|time|location|venue|register|rsvp|join|event)$/i;
    if (invalidTitles.test(title) || title.length < 5) {
      console.log(`  ⚠️  Skipping Eventbrite event with invalid title: ${title}`);
      return null;
    }

    // Extract date - Eventbrite has structured date elements
    let date = structuredData?.startDate;
    if (!date) {
      const dateMatch = html.match(/<time[^>]*datetime=["']([^"']+)["']/i) ||
                       html.match(/data-event-start-date=["']([^"']+)["']/i) ||
                       html.match(/<meta[^>]+itemprop=["']startDate["'][^>]+content=["']([^"']+)["']/i) ||
                       html.match(/<span[^>]*class="[^"]*date-info__full-datetime[^"]*"[^>]*>([^<]+)<\/span>/i) ||
                       markdown.match(/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}[,\s]+\d{4}[,\s]+\d{1,2}:\d{2}\s*(?:AM|PM)?/i) ||
                       markdown.match(/(?:date|when)[:\s]*([^\n•]+)/i);
      date = dateMatch ? parseDate(dateMatch[1].trim()) : new Date().toISOString();
    }
    date = parseDate(date);

    // Extract location - Eventbrite has structured location data
    let location = structuredData?.location?.name || structuredData?.location?.address;
    if (!location) {
      const locationMatch = html.match(/<span[^>]*class="[^"]*location-info__address[^"]*"[^>]*>([^<]+)<\/span>/i) ||
                           html.match(/<p[^>]*class="[^"]*location-info[^"]*"[^>]*>([^<]+)<\/p>/i) ||
                           html.match(/<div[^>]*class="[^"]*event-details__data[^"]*"[^>]*>[^<]*<span[^>]*>([^<]+)<\/span>/i) ||
                           html.match(/data-event-location=["']([^"']+)["']/i) ||
                           html.match(/<meta[^>]+itemprop=["']location["'][^>]+content=["']([^"']+)["']/i) ||
                           markdown.match(/(?:venue|address)[:\s]*([^\n•]+?)(?:\n|$)/i) ||
                           markdown.match(/(?:location|where)[:\s]*([^\n•]+?)(?:\n|$)/i);
      location = locationMatch ? cleanText(locationMatch[1]) : null;
    }
    // Validate location - filter invalid values
    if (location) {
      location = cleanText(location);
      // Filter out common invalid patterns
      const invalidPatterns = [
        /security|register|required|admission|pre-register|click|link|rsvp/i, // Registration text
        /^[^a-zA-Z0-9\s,]+$/, // Only symbols
        /https?:\/\//i, // URLs
        /^(tba|tbd|n\/a|na|pending|coming soon)$/i, // Placeholder text
        /^[.,:;)(!?]+$/, // Only punctuation
        /^[a-z]{1,3}[\/\)\(,;:]+$/i, // Malformed patterns like "s/)", "a/", "bc)"
      ];
      
      const isInvalid = invalidPatterns.some(pattern => pattern.test(location)) ||
                       location.length < 3 || 
                       location.length > 150;
      
      if (isInvalid) {
        location = null;
      }
    }
    location = normalizeLocation(location || 'Bangalore, Karnataka');

    // Extract description - Eventbrite has detailed descriptions
    let description = '';
    const descMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                     html.match(/<div[^>]*class="[^"]*event-description[^"]*"[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/div>/is) ||
                     html.match(/<div[^>]*class="[^"]*structured-content-rich-text[^"]*"[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/div>/is);
    if (descMatch) {
      description = cleanText(descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
    } else {
      const mdDescMatch = markdown.match(/(?:about|description|details)[:\s]*([^\n#]+(?:\n(?!#)[^\n]+)*)/is);
      description = mdDescMatch ? cleanText(mdDescMatch[1]) : 'Event in Bangalore';
    }
    description = description.substring(0, 500);

    // Extract image - enhanced extraction
    let image = null;
    const metaImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (metaImgMatch) {
      image = decodeHTMLEntities(metaImgMatch[1]);
    } else if (structuredData?.image) {
      image = decodeHTMLEntities(structuredData.image);
    } else {
      const mdImgMatch = markdown.match(/!\[[^\]]*\]\(([^)]+)\)/);
      if (mdImgMatch && (mdImgMatch[1].includes('.jpg') || mdImgMatch[1].includes('.png') || mdImgMatch[1].includes('.jpeg') || mdImgMatch[1].includes('.webp'))) {
        image = decodeHTMLEntities(mdImgMatch[1]);
      } else {
        // Try any img tag with event-related attributes
        const anyImgMatch = html.match(/<img[^>]+(?:class="[^"]*event[^"]*"|data-src|src)=["']([^"']+)["']/i);
        if (anyImgMatch) image = decodeHTMLEntities(anyImgMatch[1]);
      }
    }

    // Registration link - Eventbrite URLs are registration links
    const registration_link = eventUrl;

    return {
      title: cleanText(title),
      date,
      location,
      url: eventUrl,
      description,
      image,
      source: 'Eventbrite',
      registration_link
    };
  } catch (error) {
    console.error('Error parsing Eventbrite event detail:', error.message);
    return null;
  }
}

function parseUnstopDetail(content, eventUrl) {
  try {
    const html = content.html || '';
    const markdown = content.markdown || '';

    // Extract structured data
    const structuredData = extractStructuredData(html);

    // Extract title
    let title = structuredData?.name || structuredData?.title;
    if (!title) {
      const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                        html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                        markdown.match(/^#\s+(.+?)$/m);
      title = titleMatch ? cleanText(titleMatch[1]) : null;
    }
    // Fallback: derive from URL slug
    if (!title) {
      const slugMatch = eventUrl.match(/unstop\.com\/(?:hackathons|competitions|workshops)\/([a-zA-Z0-9-]+)-\d+/);
      title = slugMatch ? slugMatch[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Unstop Event';
    }

    // Validate title
    const invalidTitles = /^(about|login|register|sign up|home|event|profile|contact)$/i;
    if (invalidTitles.test(title) || title.length < 5) {
      console.log(`  ⚠️  Skipping Unstop event with invalid title: ${title}`);
      return null;
    }

    // Extract date
    let date = structuredData?.startDate;
    if (!date) {
      const dateMatch = html.match(/<time[^>]*datetime=["']([^"']+)["']/i) ||
                       markdown.match(/(?:starts?|deadline|date|when)[:\s]*([^\n]+)/i) ||
                       markdown.match(/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}[,\s]+\d{4}/i);
      date = dateMatch ? parseDate(dateMatch[1] || dateMatch[0]) : new Date().toISOString();
    }
    date = parseDate(date);

    // Extract location - Unstop events are usually online or at specific colleges
    let location = structuredData?.location?.name || structuredData?.location;
    if (!location) {
      const locationMatch = markdown.match(/(?:location|venue|mode|format)[:\s]*([^\n]+?)(?:\n|$)/i);
      location = locationMatch ? cleanText(locationMatch[1]) : null;
    }
    if (location) {
      location = cleanText(location);
      if (location.includes('http') || location.length < 3 || location.length > 100) {
        location = null;
      }
    }
    location = normalizeLocation(location || 'Online');

    // Extract description
    let description = '';
    const descMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    if (descMatch) {
      description = cleanText(descMatch[1]);
    } else {
      const mdDescMatch = markdown.match(/(?:about|description|overview)[:\s]*([^\n#]+(?:\n(?!#)[^\n]+)*)/is);
      description = mdDescMatch ? cleanText(mdDescMatch[1]) : 'College competition on Unstop';
    }
    description = description.substring(0, 500);

    // Extract image
    let image = null;
    const metaImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (metaImgMatch) {
      image = decodeHTMLEntities(metaImgMatch[1]);
    } else if (structuredData?.image) {
      image = decodeHTMLEntities(structuredData.image);
    }

    // Registration link
    const registration_link = eventUrl;

    return {
      title: cleanText(title),
      date,
      location,
      url: eventUrl,
      description,
      image,
      source: 'Unstop',
      registration_link
    };
  } catch (error) {
    console.error('Error parsing Unstop event detail:', error.message);
    return null;
  }
}

/**
 * Helper: Extract structured data (JSON-LD, microdata) from HTML
 */
function extractStructuredData(html) {
  try {
    // Try JSON-LD first
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      const jsonData = JSON.parse(jsonLdMatch[1]);
      // Handle both single object and array of objects
      if (Array.isArray(jsonData)) {
        // Find Event type
        const eventData = jsonData.find(item => 
          item['@type'] === 'Event' || 
          (Array.isArray(item['@type']) && item['@type'].includes('Event'))
        );
        if (eventData) return eventData;
      } else if (jsonData['@type'] === 'Event' || 
                (Array.isArray(jsonData['@type']) && jsonData['@type'].includes('Event'))) {
        return jsonData;
      }
    }

    // Try Open Graph and meta tags
    const ogData = {};
    const titleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    if (titleMatch) ogData.name = titleMatch[1];
    
    const descMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
    if (descMatch) ogData.description = descMatch[1];
    
    const imageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (imageMatch) ogData.image = imageMatch[1];

    // Try to extract event:start_time
    const startMatch = html.match(/<meta[^>]+property=["']event:start_time["'][^>]+content=["']([^"']+)["']/i);
    if (startMatch) ogData.startDate = startMatch[1];

    return Object.keys(ogData).length > 0 ? ogData : null;
  } catch (error) {
    return null;
  }
}

/**
 * Helper: Decode HTML entities in URLs
 */
function decodeHTMLEntities(text) {
  if (!text) return text;
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/**
 * Helper: Normalize location names
 */
function normalizeLocation(location) {
  if (!location || location.length < 2) return 'Online';
  
  const loc = location.toLowerCase().trim();
  
  // Filter out invalid locations (symbols only, too short)
  if (/^[^a-zA-Z0-9]+$/.test(loc) || loc.length < 2) {
    return 'Online';
  }
  
  // Check for online/virtual events
  if (/online|virtual|remote|web|internet/i.test(loc)) {
    return 'Online';
  }
  
  // Normalize Karnataka cities
  if (/bangalore|bengaluru/i.test(loc)) {
    return 'Bangalore, Karnataka';
  } else if (/mangalore|mangaluru/i.test(loc)) {
    return 'Mangalore, Karnataka';
  } else if (/mysore|mysuru/i.test(loc)) {
    return 'Mysore, Karnataka';
  } else if (/hubli|hubballi/i.test(loc)) {
    return 'Hubli, Karnataka';
  } else if (/belagavi|belgaum/i.test(loc)) {
    return 'Belagavi, Karnataka';
  } else if (/karnataka/i.test(loc) && !/bangalore|mangalore|mysore|hubli|belagavi/i.test(loc)) {
    return 'Karnataka';
  }
  
  // Return cleaned location (limit to 80 chars for display)
  const cleaned = cleanText(location);
  return cleaned.length > 80 ? cleaned.substring(0, 80) + '...' : cleaned;
}

/**
 * Helper: Clean markdown and special characters from text
 */
function cleanText(text) {
  if (!text) return text;
  return text
    .replace(/[\*_~`]/g, '') // Remove markdown formatting
    .replace(/^[•\-\+]\s*/gm, '') // Remove bullet points
    .replace(/\[|\]/g, '') // Remove brackets
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, ' ') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Helper: Parse various date formats
 */
function parseDate(dateString) {
  if (!dateString) return new Date().toISOString();
  
  try {
    // If already ISO format, return as is
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateString)) {
      return new Date(dateString).toISOString();
    }

    // Try standard date parsing
    const parsed = new Date(dateString);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }

    // Handle "Month DD, YYYY" format (e.g., "February 15, 2026")
    const monthDayYearMatch = dateString.match(/(\w+)\s+(\d+),?\s+(\d{4})/);
    if (monthDayYearMatch) {
      const date = new Date(`${monthDayYearMatch[1]} ${monthDayYearMatch[2]}, ${monthDayYearMatch[3]}`);
      if (!isNaN(date.getTime())) return date.toISOString();
    }

    // Handle "DD Month YYYY" format (e.g., "15 February 2026")
    const dayMonthYearMatch = dateString.match(/(\d+)\s+(\w+)\s+(\d{4})/);
    if (dayMonthYearMatch) {
      const date = new Date(`${dayMonthYearMatch[2]} ${dayMonthYearMatch[1]}, ${dayMonthYearMatch[3]}`);
      if (!isNaN(date.getTime())) return date.toISOString();
    }

    // Handle "Day, Month DD, YYYY" format (e.g., "Sunday, February 15, 2026")
    const fullDateMatch = dateString.match(/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s+(\w+)\s+(\d+),?\s+(\d{4})/i);
    if (fullDateMatch) {
      const date = new Date(`${fullDateMatch[1]} ${fullDateMatch[2]}, ${fullDateMatch[3]}`);
      if (!isNaN(date.getTime())) return date.toISOString();
    }

    // Handle timestamp (milliseconds)
    if (/^\d+$/.test(dateString)) {
      const timestamp = parseInt(dateString);
      if (timestamp > 1000000000000) { // Milliseconds
        return new Date(timestamp).toISOString();
      } else { // Seconds
        return new Date(timestamp * 1000).toISOString();
      }
    }

    // Default to now if unparseable
    console.warn(`Could not parse date: ${dateString}, using current date`);
    return new Date().toISOString();
  } catch (error) {
    console.error(`Error parsing date "${dateString}":`, error.message);
    return new Date().toISOString();
  }
}

module.exports = { sources };
