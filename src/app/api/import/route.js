import { NextResponse } from 'next/server';
import mammoth from 'mammoth';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = [];

    // Extract all files from formData
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Process the first file (can be extended to handle multiple)
    const file = files[0];
    
    if (!file.name.endsWith('.docx')) {
      return NextResponse.json(
        { error: 'Only .docx files are supported' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from Word document
    let result;
    try {
      result = await mammoth.extractRawText({ buffer });
    } catch (mammothError) {
      console.error('Mammoth extraction error:', mammothError);
      return NextResponse.json(
        { 
          error: 'Failed to extract text from document',
          details: mammothError.message,
          stack: process.env.NODE_ENV === 'development' ? mammothError.stack : undefined
        },
        { status: 500 }
      );
    }
    
    const text = result.value;
    
    // Validate extracted text
    if (!text || typeof text !== 'string') {
      console.error('Invalid text extracted:', { 
        textType: typeof text, 
        textLength: text?.length,
        hasValue: !!result.value 
      });
      return NextResponse.json(
        { error: 'Failed to extract text from document. The file may be corrupted or empty.' },
        { status: 400 }
      );
    }
    
    console.log('Text extracted successfully, length:', text.length);

    // Parse the extracted text
    let parsed;
    try {
      console.log('Starting parseWordDocument...');
      parsed = parseWordDocument(text);
      console.log('Parse completed successfully, itinerary days:', parsed.itinerary?.length || 0);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Parse error message:', parseError.message);
      console.error('Parse error stack:', parseError.stack);
      return NextResponse.json(
        { 
          error: 'Failed to parse document',
          details: parseError.message,
          stack: process.env.NODE_ENV === 'development' ? parseError.stack : undefined
        },
        { status: 500 }
      );
    }

    console.log('Returning parsed data');
    
    // Ensure the response is serializable
    try {
      // Test serialization
      JSON.stringify(parsed);
      return NextResponse.json(parsed);
    } catch (jsonError) {
      console.error('JSON serialization error:', jsonError);
      console.error('Problematic data:', jsonError.message);
      return NextResponse.json(
        { 
          error: 'Failed to serialize response',
          details: jsonError.message
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Import error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process document',
        details: error.stack || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Helper: Parse duration from various formats
function parseDuration(text) {
  if (!text) return null;

  const patterns = [
    // "9N/10D", "9 N / 10 D" - Nights first, then Days
    { pattern: /(\d+)\s*N[ights]*\s*[\/&]\s*(\d+)\s*D[ays]*/i, nightsFirst: true },
    // "10D/9N" - Days first, then Nights
    { pattern: /(\d+)\s*D[ays]*\s*[\/&]\s*(\d+)\s*N[ights]*/i, nightsFirst: false },
    // "10 Days / 9 Nights" - Days first
    { pattern: /(\d+)\s*Days?\s*[\/&]?\s*(\d+)\s*Nights?/i, nightsFirst: false },
    // "9 Nights / 10 Days" - Nights first
    { pattern: /(\d+)\s*Nights?\s*[\/&]?\s*(\d+)\s*Days?/i, nightsFirst: true },
    // "10 Days 9 Nights" (no separator)
    { pattern: /(\d+)\s*Days?\s+(\d+)\s*Nights?/i, nightsFirst: false },
    // "9 Nights 10 Days" (no separator)
    { pattern: /(\d+)\s*Nights?\s+(\d+)\s*Days?/i, nightsFirst: true },
  ];

  for (const { pattern, nightsFirst } of patterns) {
    const match = text.match(pattern);
    if (match) {
      const num1 = parseInt(match[1]);
      const num2 = parseInt(match[2]);
      
      if (nightsFirst) {
        // First number is nights, second is days
        return { days: num2, nights: num1, display: `${num2} Days / ${num1} Nights` };
      } else {
        // First number is days, second is nights
        return { days: num1, nights: num2, display: `${num1} Days / ${num2} Nights` };
      }
    }
  }

  return null;
}

// Helper: Detect activity type from name
function detectActivityType(name) {
  const lowerName = name.toLowerCase();
  
  // Transfer
  if (/\b(transfer|airport|railway|drive|flight|train|ferry|bullet train|shinkansen|bus|car|vehicle|station|terminal)\b/i.test(name)) {
    return 'transfer';
  }
  
  // Cultural - Temple, Shrine, Palace, Castle, Museum
  if (/\b(temple|shrine|museum|castle|palace|church|monastery|mosque|cathedral|pagoda|tomb|monument|heritage|unesco|fort|ruins|historical)\b/i.test(name)) {
    return 'cultural';
  }
  
  // Shopping - Shopping, Market, Arcade, Mall
  if (/\b(shopping|market|mall|bazaar|souvenir|store|boutique|arcade|shopping street|duty free)\b/i.test(name)) {
    return 'shopping';
  }
  
  // Adventure - Cruise, Safari, Trek
  if (/\b(safari|trek|hike|snorkel|dive|jeep|rafting|paragliding|bungee|climbing|adventure|cruise|boat|sailing)\b/i.test(name)) {
    return 'adventure';
  }
  
  // Beach
  if (/\b(beach|coast|bay|shoreline|seaside)\b/i.test(name)) {
    return 'beach';
  }
  
  // Leisure - Free, Leisure, Rest, Hot spring
  if (/\b(relax|free time|hot spring|onsen|spa|resort|leisure|rest|free|at leisure)\b/i.test(name)) {
    return 'leisure';
  }
  
  // Show
  if (/\b(show|performance|light and sound|dance|theater|concert|entertainment)\b/i.test(name)) {
    return 'show';
  }
  
  // Sightseeing - Garden, Park, View, Tower, Sky Tree, etc.
  if (/\b(garden|park|view|tower|sky|observation|deck|bridge|square|plaza|street|district|area)\b/i.test(name)) {
    return 'sightseeing';
  }
  
  // Default to sightseeing for visit, explore, see, view
  return 'sightseeing';
}

// Helper: Extract meals from text
function extractMeals(text) {
  const meals = [];
  if (!text) return meals;
  
  // Check for meal patterns: (B), (L), (D), (B,L), (B,D), (B,L,D)
  const mealPatterns = [
    /\(([BLD,]+)\)/i,  // (B), (L), (D), (B,L), etc.
    /\b([BLD])\b(?!\w)/g,  // Standalone B, L, D
  ];
  
  for (const pattern of mealPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const mealCodes = match[1] || match[0];
      if (mealCodes.includes('B') || mealCodes.includes('b')) {
        if (!meals.includes('breakfast')) meals.push('breakfast');
      }
      if (mealCodes.includes('L') || mealCodes.includes('l')) {
        if (!meals.includes('lunch')) meals.push('lunch');
      }
      if (mealCodes.includes('D') || mealCodes.includes('d')) {
        if (!meals.includes('dinner')) meals.push('dinner');
      }
    }
  }
  
  // Check for full words: "Breakfast at hotel", "Lunch included", "Dinner at restaurant"
  if (/\b(breakfast|breakfast at|breakfast included)\b/i.test(text) && !meals.includes('breakfast')) {
    meals.push('breakfast');
  }
  if (/\b(lunch|lunch included|lunch at)\b/i.test(text) && !meals.includes('lunch')) {
    meals.push('lunch');
  }
  if (/\b(dinner|dinner included|dinner at)\b/i.test(text) && !meals.includes('dinner')) {
    meals.push('dinner');
  }
  
  return meals;
}

// Helper: Extract overnight location
function extractOvernight(text) {
  if (!text) return null;
  
  const patterns = [
    /overnight\s+(?:at|in|in\s+hotel\s+in)\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|\.|,)/i,
    /stay\s+(?:at|in)\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|\.|,)/i,
    /check[- ]?in\s+(?:at|in)\s+hotel\s+in\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|\.|,)/i,
    /overnight:\s*([A-Z][a-zA-Z\s]+?)(?:\s|$|\.|,)/i,
    /at\s+hotel\s+in\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|\.|,)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const location = match[1].trim();
      // Clean up common words
      const cleanLocation = location
        .replace(/\s+hotel.*$/i, '')
        .replace(/\s+city.*$/i, '')
        .trim();
      if (cleanLocation.length > 1) {
        return cleanLocation;
      }
    }
  }
  
  return null;
}

// Helper: Extract route (from - to)
function extractRoute(text) {
  if (!text) return null;
  
  const patterns = [
    // "Tokyo – Kyoto", "Tokyo - Kyoto", "Tokyo — Kyoto"
    /([A-Z][a-zA-Z\s]+?)\s*[-–—]\s*([A-Z][a-zA-Z\s]+?)(?:\s|$|\.|,)/,
    // "Tokyo to Kyoto"
    /([A-Z][a-zA-Z\s]+?)\s+to\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|\.|,)/i,
    // "Tokyo → Kyoto"
    /([A-Z][a-zA-Z\s]+?)\s+→\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|\.|,)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[2]) {
      const from = match[1].trim();
      const to = match[2].trim();
      
      // Clean up common words
      const cleanFrom = from.replace(/\s+(city|town|hotel).*$/i, '').trim();
      const cleanTo = to.replace(/\s+(city|town|hotel).*$/i, '').trim();
      
      if (cleanFrom.length > 1 && cleanTo.length > 1) {
        return {
          from: cleanFrom,
          to: cleanTo
        };
      }
    }
  }
  
  return null;
}

// Helper: Extract activities from text - split on keywords
function extractActivities(text) {
  const activities = [];
  if (!text) return activities;
  
  // Split text on activity keywords
  const splitKeywords = [
    /\b(?:visit|transfer|drive|explore|enjoy|arrive|depart|check[- ]?in|see|experience|discover|tour|take|go to|head to)\b/gi
  ];
  
  // First, try to split on keywords
  let parts = [text];
  for (const keyword of splitKeywords) {
    const newParts = [];
    for (const part of parts) {
      try {
        if (!part || typeof part !== 'string') continue;
        
        const matches = [...part.matchAll(keyword)];
        if (matches.length > 0) {
          let lastIndex = 0;
          for (const match of matches) {
            if (!match || match.index === undefined || match.index < 0) continue;
            
            if (match.index > lastIndex && match.index < part.length) {
              newParts.push(part.substring(lastIndex, match.index).trim());
            }
            
            // Find the end of this activity (next keyword, comma, period, or end)
            const nextMatch = matches.find(m => m && m.index !== undefined && m.index > match.index);
            let endIndex = nextMatch && nextMatch.index !== undefined
              ? nextMatch.index 
              : (() => {
                  const commaIdx = part.indexOf(',', match.index);
                  const periodIdx = part.indexOf('.', match.index);
                  const andIdx = part.indexOf(' and ', match.index);
                  const indices = [
                    commaIdx !== -1 ? commaIdx : part.length,
                    periodIdx !== -1 ? periodIdx : part.length,
                    andIdx !== -1 ? andIdx : part.length,
                    part.length
                  ];
                  return Math.min(...indices);
                })();
            
            // Ensure endIndex is valid
            if (endIndex === -1 || endIndex === Infinity || endIndex > part.length || endIndex < match.index) {
              endIndex = part.length;
            }
            
            // Ensure match.index is valid before substring
            if (match.index >= 0 && match.index < part.length && endIndex > match.index) {
              const activityText = part.substring(match.index, endIndex).trim();
              if (activityText.length > 5) {
                newParts.push(activityText);
              }
              lastIndex = endIndex;
            } else {
              // Skip invalid match
              lastIndex = match.index !== undefined ? Math.max(lastIndex, match.index) : lastIndex;
            }
          }
          if (lastIndex < part.length) {
            newParts.push(part.substring(lastIndex).trim());
          }
        } else {
          newParts.push(part);
        }
      } catch (err) {
        console.error('Error processing part in extractActivities:', err);
        // If error occurs, just add the part as-is
        newParts.push(part);
      }
    }
    parts = newParts.filter(p => p && typeof p === 'string' && p.length > 0);
  }
  
  // Also check for bullet points
  const bulletPoints = text.match(/^[-•*]\s*[^\n]+/gm) || [];
  for (const bullet of bulletPoints) {
    const activityName = bullet.replace(/^[-•*]\s*/, '').trim();
    if (activityName.length > 3 && !/\b(breakfast|lunch|dinner|overnight)\b/i.test(activityName)) {
      parts.push(activityName);
    }
  }
  
  // Process each part as a potential activity
  for (const part of parts) {
    const cleanPart = part.trim();
    if (cleanPart.length < 3) continue;
    
    // Skip if it's a meal or overnight indicator
    if (/\b(breakfast|lunch|dinner|overnight|stay|check[- ]?in)\b/i.test(cleanPart) && cleanPart.length < 50) {
      continue;
    }
    
    // Remove activity keywords from start
    let activityName = cleanPart.replace(/^(?:visit|transfer|drive|explore|enjoy|arrive|depart|check[- ]?in|see|experience|discover|tour|take|go to|head to)\s+/i, '').trim();
    
    // Clean up common endings
    activityName = activityName.replace(/\s*(?:and|,|\.|;).*$/, '').trim();
    
    if (activityName.length > 3) {
      // Check if it contains "and" - might be multiple activities
      if (/\s+and\s+/i.test(activityName)) {
        const subActivities = activityName.split(/\s+and\s+/i);
        for (const subAct of subActivities) {
          const cleanSub = subAct.trim();
          if (cleanSub.length > 3) {
            activities.push({
              name: cleanSub,
              type: detectActivityType(cleanSub),
              highlight: /\b(visit|explore|see|experience|enjoy|discover|tour)\b/i.test(cleanPart)
            });
          }
        }
      } else {
        activities.push({
          name: activityName,
          type: detectActivityType(activityName),
          highlight: /\b(visit|explore|see|experience|enjoy|discover|tour)\b/i.test(cleanPart)
        });
      }
    }
  }
  
  // Remove duplicates
  const uniqueActivities = [];
  const seen = new Set();
  for (const activity of activities) {
    const key = activity.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueActivities.push(activity);
    }
  }
  
  return uniqueActivities;
}

// Helper: Check if destination is domestic (India)
function isDomesticDestination(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  const indianDestinations = [
    'andaman', 'goa', 'kerala', 'rajasthan', 'kashmir', 'ladakh', 
    'himachal', 'sikkim', 'darjeeling', 'ooty', 'munnar', 'kodaikanal',
    'manali', 'shimla', 'mcleod ganj', 'rishikesh', 'varanasi', 'agra',
    'jaipur', 'udaipur', 'jodhpur', 'jaisalmer', 'mumbai', 'delhi',
    'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune'
  ];
  
  return indianDestinations.some(dest => text.includes(dest));
}

function parseWordDocument(text) {
  // Validate input
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid text input: text must be a non-empty string');
  }
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const parsed = {
    title: '',
    subtitle: '',
    description: '',
    nights: null,
    days: null,
    duration_display: '',
    is_domestic: false,
    itinerary: [],
    includes: [],
    excludes: [],
    highlights: [],
  };

  let currentDay = null;
  let inIncludes = false;
  let inExcludes = false;
  let inHighlights = false;
  let dayContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Extract title
    if (!parsed.title) {
      if (lowerLine.includes('package name:') || lowerLine.includes('title:')) {
        parsed.title = line.split(':').slice(1).join(':').trim() || lines[i + 1]?.trim() || '';
        continue;
      } else if (i === 0 && line.length > 0 && line.length < 100 && !line.match(/^\d/)) {
        parsed.title = line;
        continue;
      }
    }

    // Extract duration - check current line and next few lines
    if (!parsed.nights || !parsed.days) {
      const durationInfo = parseDuration(line);
      if (durationInfo) {
        parsed.nights = durationInfo.nights;
        parsed.days = durationInfo.days;
        parsed.duration_display = durationInfo.display;
        continue;
      }
      // Also check if duration is in next line
      if (i < lines.length - 1) {
        const nextLine = lines[i + 1];
        const durationInfo = parseDuration(nextLine);
        if (durationInfo) {
          parsed.nights = durationInfo.nights;
          parsed.days = durationInfo.days;
          parsed.duration_display = durationInfo.display;
          i++; // Skip next line
          continue;
        }
      }
    }

    // Detect day markers - multiple patterns
    const dayPatterns = [
      /day\s*0*(\d+)[:.\-]\s*(.*)/i,
      /day\s*0*(\d+)\s+(.*)/i,
      /day\s*0*(\d+)/i,
      /DAY\s*0*(\d+)[:.\-]?\s*(.*)/i,
    ];
    
    let dayMatch = null;
    for (const pattern of dayPatterns) {
      dayMatch = line.match(pattern);
      if (dayMatch) break;
    }
    
    if (dayMatch) {
      // Save previous day
      if (currentDay) {
        // Process accumulated content
        const fullText = dayContent.join(' ');
        currentDay.description = fullText;
        
        // Extract route from day title or description
        try {
          const route = extractRoute(currentDay.title) || extractRoute(fullText);
          if (route) {
            currentDay.route_from = route.from;
            currentDay.route_to = route.to;
          } else {
            // If no route, check if title has city name
            if (currentDay.title) {
              const cityMatch = currentDay.title.match(/\b([A-Z][a-zA-Z]+)\b/);
              if (cityMatch && cityMatch[1]) {
                currentDay.route_to = cityMatch[1];
                currentDay.route_from = cityMatch[1]; // Same city
              }
            }
          }
        } catch (routeError) {
          console.error('Error extracting route:', routeError);
          // Continue without route
        }
        
        // Extract activities
        try {
          currentDay.activities = extractActivities(fullText);
        } catch (activityError) {
          console.error('Error extracting activities:', activityError);
          currentDay.activities = [];
        }
        
        // Extract meals
        try {
          currentDay.meals = extractMeals(fullText);
        } catch (mealError) {
          console.error('Error extracting meals:', mealError);
          currentDay.meals = [];
        }
        
        // Extract overnight
        try {
          const overnight = extractOvernight(fullText) || (currentDay.title ? extractOvernight(currentDay.title) : null);
          if (overnight) {
            currentDay.overnight = overnight;
          } else if (currentDay.route_to) {
            // Use route_to as overnight if no explicit overnight mentioned
            currentDay.overnight = currentDay.route_to;
          }
        } catch (overnightError) {
          console.error('Error extracting overnight:', overnightError);
          // Continue without overnight
        }
        
        parsed.itinerary.push(currentDay);
      }
      
      // Start new day
      const dayNumber = parseInt(dayMatch[1]) || parsed.itinerary.length + 1;
      const dayTitle = dayMatch[2]?.trim() || `Day ${dayNumber}`;
      
      currentDay = {
        day_number: dayNumber,
        title: dayTitle,
        description: '',
        route_from: null,
        route_to: null,
        activities: [],
        meals: [],
        overnight: null,
        notes: [],
      };
      
      dayContent = [];
      continue;
    }

    // Detect sections
    if (lowerLine.includes('package includes') || 
        lowerLine.includes('includes:') ||
        lowerLine.includes('inclusions:')) {
      inIncludes = true;
      inExcludes = false;
      inHighlights = false;
      continue;
    }

    if (lowerLine.includes('package excludes') || 
        lowerLine.includes('excludes:') ||
        lowerLine.includes('exclusions:')) {
      inIncludes = false;
      inExcludes = true;
      inHighlights = false;
      continue;
    }

    if (lowerLine.includes('highlights') || 
        lowerLine.includes('key features') ||
        lowerLine.includes('package highlights')) {
      inIncludes = false;
      inExcludes = false;
      inHighlights = true;
      continue;
    }

    // Collect includes
    if (inIncludes && line.length > 0) {
      const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
      if (cleanLine.length > 0 && !lowerLine.includes('package') && !lowerLine.includes('includes')) {
        parsed.includes.push(cleanLine);
      }
      continue;
    }

    // Collect excludes
    if (inExcludes && line.length > 0) {
      const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
      if (cleanLine.length > 0 && !lowerLine.includes('package') && !lowerLine.includes('excludes')) {
        parsed.excludes.push(cleanLine);
      }
      continue;
    }

    // Collect highlights
    if (inHighlights && line.length > 0) {
      const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
      if (cleanLine.length > 0 && !lowerLine.includes('highlights') && !lowerLine.includes('features')) {
        parsed.highlights.push(cleanLine);
      }
      continue;
    }

    // Collect day content
    if (currentDay) {
      if (line.length > 0 && 
          !lowerLine.includes('day') && 
          !lowerLine.includes('includes') && 
          !lowerLine.includes('excludes') &&
          !lowerLine.includes('highlights')) {
        dayContent.push(line);
      }
    } else {
      // Collect general description
      if (line.length > 20 && !lowerLine.includes('package')) {
        if (parsed.description) {
          parsed.description += ' ' + line;
        } else {
          parsed.description = line;
        }
      }
    }
  }

  // Process last day
  if (currentDay) {
    try {
      const fullText = dayContent.join(' ');
      currentDay.description = fullText;
      
      // Extract route from day title or description
      try {
        const route = extractRoute(currentDay.title) || extractRoute(fullText);
        if (route) {
          currentDay.route_from = route.from;
          currentDay.route_to = route.to;
        } else {
          // If no route, check if title has city name
          if (currentDay.title) {
            const cityMatch = currentDay.title.match(/\b([A-Z][a-zA-Z]+)\b/);
            if (cityMatch && cityMatch[1]) {
              currentDay.route_to = cityMatch[1];
              currentDay.route_from = cityMatch[1]; // Same city
            }
          }
        }
      } catch (routeError) {
        console.error('Error extracting route for last day:', routeError);
      }
      
      // Extract activities
      try {
        currentDay.activities = extractActivities(fullText);
      } catch (activityError) {
        console.error('Error extracting activities for last day:', activityError);
        currentDay.activities = [];
      }
      
      // Extract meals
      try {
        currentDay.meals = extractMeals(fullText);
      } catch (mealError) {
        console.error('Error extracting meals for last day:', mealError);
        currentDay.meals = [];
      }
      
      // Extract overnight
      try {
        const overnight = extractOvernight(fullText) || (currentDay.title ? extractOvernight(currentDay.title) : null);
        if (overnight) {
          currentDay.overnight = overnight;
        } else if (currentDay.route_to) {
          // Use route_to as overnight if no explicit overnight mentioned
          currentDay.overnight = currentDay.route_to;
        }
      } catch (overnightError) {
        console.error('Error extracting overnight for last day:', overnightError);
      }
      
      parsed.itinerary.push(currentDay);
    } catch (dayError) {
      console.error('Error processing last day:', dayError);
      // Still add the day even if processing failed
      parsed.itinerary.push(currentDay);
    }
  }

  // Determine if domestic
  try {
    parsed.is_domestic = isDomesticDestination(parsed.title || '', parsed.description || '');
  } catch (domesticError) {
    console.error('Error determining domestic status:', domesticError);
    parsed.is_domestic = false;
  }

  // Generate slug from title + duration
  try {
    if (parsed.title) {
      let slug = parsed.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Add duration to slug if available
      if (parsed.days && parsed.nights) {
        slug += `-${parsed.days}d${parsed.nights}n`;
      } else if (parsed.duration_display) {
        const durationSlug = parsed.duration_display
          .toLowerCase()
          .replace(/\s+/g, '')
          .replace(/\//g, '');
        slug += '-' + durationSlug;
      }
      
      parsed.slug = slug;
    }
  } catch (slugError) {
    console.error('Error generating slug:', slugError);
    parsed.slug = parsed.title ? parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'package';
  }

  // Extract highlights from itinerary if not found in highlights section
  try {
    if (parsed.highlights.length === 0 && parsed.itinerary.length > 0) {
      // Get activities marked as highlight
      for (const day of parsed.itinerary) {
        if (day.activities && Array.isArray(day.activities)) {
          for (const activity of day.activities) {
            if (activity && activity.highlight && activity.name && !parsed.highlights.includes(activity.name)) {
              parsed.highlights.push(activity.name);
            }
          }
        }
      }
      
      // If still no highlights, use first few key activities
      if (parsed.highlights.length === 0) {
        try {
          const allActivities = parsed.itinerary.flatMap(day => (day.activities && Array.isArray(day.activities)) ? day.activities : []);
          const keyActivities = allActivities
            .filter(a => a && a.type && (a.type === 'cultural' || a.type === 'sightseeing') && a.name)
            .slice(0, 5)
            .map(a => a.name);
          parsed.highlights = keyActivities;
        } catch (keyActivityError) {
          console.error('Error extracting key activities:', keyActivityError);
        }
      }
    }
  } catch (highlightError) {
    console.error('Error extracting highlights:', highlightError);
  }

  // Clean up arrays
  parsed.includes = parsed.includes.filter(item => item.length > 0);
  parsed.excludes = parsed.excludes.filter(item => item.length > 0);
  parsed.highlights = parsed.highlights.filter(item => item.length > 0);

  // Ensure required fields have defaults
  if (!parsed.nights) parsed.nights = 0;
  if (!parsed.days) parsed.days = 0;
  if (!parsed.duration_display && parsed.days && parsed.nights) {
    parsed.duration_display = `${parsed.days} Days / ${parsed.nights} Nights`;
  }

  return parsed;
}

