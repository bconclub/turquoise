
import mammoth from 'mammoth';

/**
 * Main function to parse a Word document buffer
 */
export async function parseDocument(buffer) {
    try {
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value;
        return parseText(text);
    } catch (error) {
        console.error('Error extracting text with mammoth:', error);
        throw new Error('Failed to extract text from document');
    }
}

/**
 * Parse the extracted text into structured data
 */
function parseText(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Invalid text input');
    }

    // Clean up text: normalize newlines, remove excessive whitespace
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const parsed = {
        title: '',
        subtitle: '',
        description: '',
        nights: 0,
        days: 0,
        duration_display: '',
        is_domestic: false,
        itinerary: [],
        includes: [],
        excludes: [],
        highlights: [],
        arrival_point: '',
        departure_point: '',
        cities_covered: [],
        stay_breakdown: [],
        internal_transport: [],
    };

    let currentSection = 'general'; // general, itinerary, includes, excludes, highlights
    let currentDay = null;
    let dayContentBuffer = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();

        // --- SECTION DETECTION ---
        if (isIncludesHeader(lowerLine)) {
            finishCurrentDay(parsed, currentDay, dayContentBuffer);
            currentDay = null;
            currentSection = 'includes';
            continue;
        }
        if (isExcludesHeader(lowerLine)) {
            finishCurrentDay(parsed, currentDay, dayContentBuffer);
            currentDay = null;
            currentSection = 'excludes';
            continue;
        }
        if (isHighlightsHeader(lowerLine)) {
            finishCurrentDay(parsed, currentDay, dayContentBuffer);
            currentDay = null;
            currentSection = 'highlights';
            continue;
        }

        // --- GENERAL INFO PARSING (Title, Duration, Subtitle, Description) ---
        if (currentSection === 'general') {
            // Try to extract title and duration from the first few lines
            if (!parsed.title && i < 5) {
                // Check for Title + Duration pattern on same line
                // e.g. "ARMENIA GUARANTEED DEPARTURES04 Nights / 05 Days"
                const splitResult = splitTitleAndDuration(line);
                if (splitResult) {
                    parsed.title = toTitleCase(splitResult.title);
                    parsed.nights = splitResult.nights;
                    parsed.days = splitResult.days;
                    parsed.duration_display = splitResult.display;
                    continue;
                }

                // If not split, maybe just title?
                // Assume first non-empty line is title if not already found
                if (!parsed.title && line.length > 3 && !isDurationString(line)) {
                    parsed.title = toTitleCase(line);
                    continue;
                }
            }

            // Check for standalone duration line
            if ((!parsed.nights || !parsed.days) && i < 10) {
                const duration = parseDuration(line);
                if (duration) {
                    parsed.nights = duration.nights;
                    parsed.days = duration.days;
                    parsed.duration_display = duration.display;
                    continue;
                }
            }

            // Extract subtitle (short description) - first meaningful line after title
            // Subtitle should be a short line (typically 1 sentence, max 150 chars)
            if (parsed.title && !parsed.subtitle && line !== parsed.title && !isDurationString(line)) {
                // Skip if it looks like it's starting the itinerary or a section
                if (!matchDayHeader(line) && !isIncludesHeader(lowerLine) && 
                    !isExcludesHeader(lowerLine) && !isHighlightsHeader(lowerLine)) {
                    // If it's a short line (likely subtitle), use it as subtitle
                    // Otherwise, it goes to description
                    if (line.length > 10 && line.length <= 150 && 
                        !line.match(/^(day|includes|excludes|highlights|itinerary)/i)) {
                        parsed.subtitle = line.trim();
                        continue;
                    }
                }
            }
        }

        // --- DAY DETECTION ---
        const dayMatch = matchDayHeader(line);
        if (dayMatch) {
            // Finish previous day
            finishCurrentDay(parsed, currentDay, dayContentBuffer);

            // Start new day
            currentSection = 'itinerary';
            dayContentBuffer = [];

            const dayNum = parseInt(dayMatch.number);
            // Title is the rest of the line after "Day X"
            let dayTitle = dayMatch.rest ? dayMatch.rest.trim() : `Day ${dayNum}`;
            // Clean up separators like ":", "-", "." at start of title
            dayTitle = dayTitle.replace(/^[:\-\.]+\s*/, '');
            if (!dayTitle) dayTitle = `Day ${dayNum}`;

            currentDay = {
                day_number: dayNum,
                title: toTitleCase(dayTitle),
                description: '',
                route_from: null,
                route_to: null,
                route_mode: null,
                activities: [],
                meals: [],
                overnight: null,
                optionals: [],
                notes: []
            };
            continue;
        }

        // --- CONTENT COLLECTION ---
        if (currentSection === 'itinerary' && currentDay) {
            dayContentBuffer.push(line);
        } else if (currentSection === 'includes') {
            addListItem(parsed.includes, line);
        } else if (currentSection === 'excludes') {
            addListItem(parsed.excludes, line);
        } else if (currentSection === 'highlights') {
            addListItem(parsed.highlights, line);
        } else if (currentSection === 'general') {
            // Collect description if it's not title/duration/subtitle
            // Stop collecting if we hit a day header or section header
            if (parsed.title && line !== parsed.title && !isDurationString(line) && 
                line !== parsed.subtitle && !matchDayHeader(line) &&
                !isIncludesHeader(lowerLine) && !isExcludesHeader(lowerLine) && 
                !isHighlightsHeader(lowerLine)) {
                // Add to description (subtitle already handled above)
                parsed.description = parsed.description ? parsed.description + '\n' + line : line;
            }
        }
    }

    // Finish last day
    finishCurrentDay(parsed, currentDay, dayContentBuffer);

    // Post-processing
    parsed.is_domestic = isDomestic(parsed.title, parsed.description);
    parsed.slug = generateSlug(parsed.title, parsed.days, parsed.nights);
    
    // Extract cities_covered from itinerary
    parsed.cities_covered = extractCitiesCovered(parsed.itinerary);
    
    // Calculate stay_breakdown from overnight locations
    parsed.stay_breakdown = calculateStayBreakdown(parsed.itinerary);
    
    // Extract internal_transport from itinerary (unique transport modes used)
    parsed.internal_transport = extractInternalTransport(parsed.itinerary);

    return parsed;
}

// --- HELPER FUNCTIONS ---

function finishCurrentDay(parsed, day, contentBuffer) {
    if (!day) return;

    const fullText = contentBuffer.join('\n');
    day.description = fullText.trim();

    // Extract arrival_point (only from first day)
    if (day.day_number === 1) {
        const arrival = extractArrivalPoint(fullText);
        if (arrival) {
            parsed.arrival_point = arrival;
        }
    }

    // Extract departure_point (only from last day)
    const isLastDay = !parsed.itinerary.some(d => d.day_number > day.day_number);
    if (isLastDay) {
        const departure = extractDeparturePoint(fullText);
        if (departure) {
            parsed.departure_point = departure;
        }
    }

    // Extract meals (NOT activities)
    day.meals = extractMeals(fullText);

    // Extract overnight (NOT activity)
    const overnight = extractOvernight(fullText) || extractOvernight(day.title);
    if (overnight) day.overnight = overnight;

    // Extract activities (filtered - no meals, no transfers as activities, no overnight)
    day.activities = extractActivities(fullText, true); // Pass flag to filter properly

    // Try to find route info (From - To)
    // Check title first, then full text
    let route = extractRoute(day.title) || extractRoute(fullText);
    
    // Also check for patterns like "Fly from X to Y", "Drive to X", "Transfer to X"
    if (!route) {
        route = extractRouteFromText(fullText);
    }
    
    if (route) {
        day.route_from = route.from;
        day.route_to = route.to;
        // Extract route mode (drive, flight, ferry, etc.)
        day.route_mode = extractRouteMode(fullText) || route.mode || null;
        // If no explicit overnight, assume destination is overnight
        if (!day.overnight) day.overnight = route.to;
    } else if (!day.overnight && day.title) {
        // Fallback: check if title is just a city name
        const city = extractCityFromTitle(day.title);
        if (city) day.overnight = city;
    }
    
    // If route_mode not found but route exists, try to infer from text
    if (route && !day.route_mode) {
        day.route_mode = extractRouteMode(fullText) || 'drive';
    }

    // Extract optional activities
    day.optionals = extractOptionals(fullText);

    parsed.itinerary.push(day);
}

function isIncludesHeader(line) {
    return /^(includes|inclusions|package includes|price includes)/i.test(line);
}

function isExcludesHeader(line) {
    return /^(excludes|exclusions|package excludes|price excludes)/i.test(line);
}

function isHighlightsHeader(line) {
    return /^(highlights|package highlights|tour highlights)/i.test(line);
}

function addListItem(array, line) {
    // Remove bullet points
    const clean = line.replace(/^[-•*➢➣➤]\s*/, '').trim();
    if (clean.length > 2) {
        array.push(clean);
    }
}

function splitTitleAndDuration(line) {
    // Pattern: "TITLE TEXT04 Nights / 05 Days" or "TITLE TEXT 4 Nights 5 Days"
    // Look for the start of the duration pattern
    const durationRegex = /(\d+\s*Nights?.*)|(\d+\s*Days?.*)/i;
    const match = line.match(durationRegex);

    if (match) {
        const durationPart = match[0];
        const titlePart = line.substring(0, match.index).trim();
        const duration = parseDuration(durationPart);

        if (duration && titlePart.length > 0) {
            return {
                title: titlePart,
                ...duration
            };
        }
    }
    return null;
}

function isDurationString(line) {
    return parseDuration(line) !== null;
}

function parseDuration(text) {
    if (!text) return null;

    // Normalize
    const t = text.toLowerCase();

    // Patterns
    const patterns = [
        // 4 Nights / 5 Days
        /(\d+)\s*n(?:ights?)?\s*[\/&]?\s*(\d+)\s*d(?:ays?)?/i,
        // 5 Days / 4 Nights
        /(\d+)\s*d(?:ays?)?\s*[\/&]?\s*(\d+)\s*n(?:ights?)?/i,
    ];

    let nights = 0;
    let days = 0;

    const match1 = t.match(patterns[0]); // Nights first
    if (match1) {
        nights = parseInt(match1[1]);
        days = parseInt(match1[2]);
    } else {
        const match2 = t.match(patterns[1]); // Days first
        if (match2) {
            days = parseInt(match1[1]);
            nights = parseInt(match1[2]);
        }
    }

    if (nights > 0 || days > 0) {
        // If only one found, infer the other
        if (days === 0 && nights > 0) days = nights + 1;
        if (nights === 0 && days > 0) nights = days - 1;

        return {
            nights,
            days,
            display: `${days} Days / ${nights} Nights`
        };
    }

    return null;
}

function matchDayHeader(line) {
    // Day 1, Day 01, DAY 1, Day 1: Title
    const match = line.match(/^(?:Day|DAY)\s*0*(\d+)(.*)/);
    if (match) {
        return { number: match[1], rest: match[2] };
    }
    return null;
}

function extractActivities(text, strictMode = false) {
    const activities = [];
    if (!text || text.trim().length === 0) return activities;

    // Split text into potential activity segments
    // Split by periods, newlines, commas (in compound activities), and common separators
    const segments = text
        .split(/[.\n•;]/)
        .map(s => s.trim())
        .filter(s => s.length > 3);

    for (const segment of segments) {
        // Skip if it's just a meal mention (will be handled by extractMeals)
        if (isMealOnly(segment)) {
            continue;
        }

        // Skip arrival/departure info (handled separately)
        if (isArrivalOrDeparture(segment)) {
            continue;
        }

        // Skip overnight mentions (handled separately)
        if (isOvernightOnly(segment)) {
            continue;
        }

        // Skip check-in, hotel transfer, airport transfer (in strict mode)
        if (strictMode && isAdministrativeOnly(segment)) {
            continue;
        }

        // Check if this is a compound activity (contains "with", "including", "and")
        if (isCompoundActivity(segment)) {
            const splitActivities = splitCompoundActivity(segment, strictMode);
            activities.push(...splitActivities);
        } else {
            // Single activity
            const activity = parseActivity(segment, strictMode);
            if (activity) {
                activities.push(activity);
            }
        }
    }

    // Deduplicate and clean
    return deduplicateActivities(activities);
}

function isMealOnly(text) {
    if (!text || text.trim().length < 3) return false;
    
    const t = text.toLowerCase().trim();
    
    // Patterns like "Breakfast at hotel", "Lunch on cruise", "Dinner and overnight"
    const mealOnlyPatterns = [
        /^(breakfast|lunch|dinner)\s+(?:at|on|in|and)\s+/i,  // "Breakfast at hotel"
        /^(breakfast|lunch|dinner)$/i,                        // Just "Breakfast"
        /^meal\s+(?:at|on|in)/i,                              // "Meal at..."
        /^(breakfast|lunch|dinner)\s+and\s+overnight/i,       // "Dinner and overnight"
        /^overnight\s+and\s+(breakfast|lunch|dinner)/i        // "Overnight and breakfast"
    ];
    
    // If it matches a meal-only pattern, check if there's other content
    if (mealOnlyPatterns.some(pattern => pattern.test(t))) {
        // If the text is mostly about the meal (less than 30 chars or no other keywords), it's meal-only
        if (text.length < 30) return true;
        
        // Check if there are activity keywords that suggest it's not just a meal
        const activityKeywords = /(visit|explore|tour|temple|museum|palace|cruise|safari|transfer|drive)/i;
        if (!activityKeywords.test(text)) {
            return true; // No activity keywords, so it's meal-only
        }
    }
    
    return false;
}

function isCompoundActivity(text) {
    const t = text.toLowerCase();
    return /(?:with|including|and|,)\s+(?:activities|including|such as)/i.test(t) ||
           /,\s+and\s+/i.test(t) ||
           (/,/.test(t) && /(?:camel|boat|ride|transfer|experience|tour|visit)/i.test(t));
}

function splitCompoundActivity(text, strictMode = false) {
    const activities = [];
    const t = text.toLowerCase();

    // Pattern 1: "Visit X with activities including Y, Z, and W"
    let mainMatch = text.match(/^(?:visit|explore|tour of|tour to)?\s*([^,]+?)(?:\s+with\s+activities\s+including|\s+including|\s+with)/i);
    let mainActivity = mainMatch ? mainMatch[1].trim() : null;

    // Pattern 2: "Visit X, Y, and Z" (simple comma-separated list)
    if (!mainActivity && /,\s+and\s+/.test(text)) {
        // Split by commas and "and"
        const parts = text.split(/,\s*|\s+and\s+/).map(s => s.trim()).filter(s => s.length > 3);
        for (const part of parts) {
            const activity = parseActivity(part, strictMode);
            if (activity) {
                activities.push(activity);
            }
        }
        return activities;
    }

    // Extract sub-activities from "including X, Y, and Z" or "with X, Y, and Z"
    const includingMatch = text.match(/(?:including|with|and)\s+([^.]+?)(?:\.|$)/i);
    if (includingMatch) {
        const subActivitiesText = includingMatch[1];
        // Split by commas and "and", but be smart about it
        // Handle: "camel ride, boat transfer, and Nubian tea experience"
        const subActivities = subActivitiesText
            .split(/(?:,\s*|\s+and\s+)/)
            .map(s => s.trim())
            .filter(s => s.length > 2);

        // Add main activity if found
        if (mainActivity) {
            const main = parseActivity(mainActivity, strictMode);
            if (main) {
                main.highlight = true; // Main activity is usually a highlight
                activities.push(main);
            }
        }

        // Add sub-activities
        for (const sub of subActivities) {
            const activity = parseActivity(sub, strictMode);
            if (activity) {
                activity.highlight = false; // Sub-activities are usually not highlights
                activities.push(activity);
            }
        }
    } else if (mainActivity) {
        // We have a main activity but no sub-activities pattern
        // Just add the main activity
        const main = parseActivity(mainActivity, strictMode);
        if (main) {
            activities.push(main);
        }
    } else {
        // Fallback: try to split by commas
        const parts = text.split(',').map(s => s.trim()).filter(s => s.length > 3);
        for (const part of parts) {
            const activity = parseActivity(part, strictMode);
            if (activity) {
                activities.push(activity);
            }
        }
    }

    return activities;
}

function parseActivity(text, strictMode = false) {
    if (!text || text.trim().length < 3) return null;

    // Skip meal-only entries
    if (isMealOnly(text)) return null;

    // Skip arrival/departure in strict mode
    if (strictMode && isArrivalOrDeparture(text)) return null;

    // Skip overnight-only in strict mode
    if (strictMode && isOvernightOnly(text)) return null;

    // Skip administrative tasks in strict mode
    if (strictMode && isAdministrativeOnly(text)) return null;

    // Extract description if present (after dash, colon, or parentheses)
    let name = text;
    let description = null;

    // Pattern: "Activity Name – Description" or "Activity Name: Description"
    const dashMatch = text.match(/^([^–—\-:]+?)\s*[–—\-:]\s*(.+)$/);
    if (dashMatch) {
        name = dashMatch[1].trim();
        description = dashMatch[2].trim();
    }

    // Pattern: "Activity Name (Description)"
    const parenMatch = text.match(/^([^(]+?)\s*\(([^)]+)\)\s*$/);
    if (parenMatch && !description) {
        name = parenMatch[1].trim();
        description = parenMatch[2].trim();
    }

    // Clean activity name
    name = cleanActivityName(name);

    // Determine type
    const type = detectActivityType(name);

    // Skip if type is 'other' or it's clearly not an activity
    if (type === 'other' || type === 'dining') {
        return null;
    }

    // In strict mode, skip transfers and leisure
    if (strictMode && (type === 'transfer' || type === 'leisure')) {
        return null;
    }

    // Determine if it's a highlight (temples, major attractions usually are)
    const highlight = isHighlightActivity(name, type);

    return {
        name: name,
                type: type,
        highlight: highlight,
        description: description || undefined
    };
}

function cleanActivityName(name) {
    let cleaned = name.trim();

    // Remove common prefixes
    cleaned = cleaned.replace(/^(visit|visit to|explore|tour of|tour to|proceed to|arrive at|transfer to|drive to)\s+/i, '');
    
    // Remove "to " prefix if it's at the start
    cleaned = cleaned.replace(/^to\s+/i, '');

    // Clean up "Transfer to X" -> "X transfer"
    if (/^transfer\s+to\s+/i.test(cleaned)) {
        cleaned = cleaned.replace(/^transfer\s+to\s+/i, '') + ' transfer';
    }

    // Remove trailing "transfer" if it's redundant
    cleaned = cleaned.replace(/\s+transfer\s*$/i, ' transfer');

    // Capitalize first letter of each word (title case)
    cleaned = toTitleCase(cleaned);

    return cleaned;
}

function isHighlightActivity(name, type) {
    const n = name.toLowerCase();
    
    // Major attractions are usually highlights
    const highlightKeywords = [
        'temple', 'pyramid', 'sphinx', 'palace', 'museum', 'monument',
        'wonder', 'unesco', 'world heritage', 'ancient', 'historic',
        'cruise', 'safari', 'gondola', 'cable car', 'suspension bridge'
    ];

    if (highlightKeywords.some(keyword => n.includes(keyword))) {
        return true;
    }

    // Cultural sites are usually highlights
    if (type === 'cultural') {
        return true;
    }

    return false;
}

function deduplicateActivities(activities) {
    const seen = new Set();
    const unique = [];

    for (const activity of activities) {
        const key = activity.name.toLowerCase().trim();
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(activity);
        }
    }

    return unique;
}

function detectActivityType(text) {
    if (!text) return 'other';
    const t = text.toLowerCase();

    // Check for meals first - these should NOT be activities
    if (/(^|\s)(breakfast|lunch|dinner)(\s|$|at|on|in|and)/.test(t)) {
        return 'dining'; // Special marker to skip
    }

    // Cultural sites
    if (/(temple|shrine|museum|palace|castle|fort|monument|heritage|church|mosque|cathedral|tomb|necropolis|ruins|archaeological)/.test(t)) {
        return 'cultural';
    }

    // Dams, bridges, towers, modern structures
    if (/(dam|bridge|tower|skyscraper|building|monument)/.test(t)) {
        return 'sightseeing';
    }

    // Adventure activities
    if (/(camel|boat|cruise|safari|trek|dive|hike|adventure|jeep|rafting|felucca|sailboat|gondola|cable car)/.test(t)) {
        return 'adventure';
    }

    // Transfers
    if (/(transfer|airport|drive|station|pickup|drop|flight|train|bus|vehicle)/.test(t)) {
        return 'transfer';
    }

    // Shopping
    if (/(shopping|market|mall|bazaar|souvenir|shop)/.test(t)) {
        return 'shopping';
    }

    // Beach activities
    if (/(beach|bay|island|sea|ocean|swim|snorkel|dive)/.test(t)) {
        return 'beach';
    }

    // Shows and performances
    if (/(show|performance|dance|music|concert|theater)/.test(t)) {
        return 'show';
    }

    // Leisure
    if (/(free time|relax|leisure|spa|massage|tea|coffee)/.test(t)) {
        return 'leisure';
    }

    // Gardens and parks
    if (/(garden|park|view|sightseeing|city tour|panorama|viewpoint)/.test(t)) {
        return 'sightseeing';
    }

    // Villages, towns, cities (cultural)
    if (/(village|town|city|settlement)/.test(t)) {
        return 'cultural';
    }

    return 'other';
}

function extractMeals(text) {
    const meals = [];
    if (!text) return meals;
    
    const t = text.toLowerCase();
    
    // More precise meal detection
    // "Breakfast at hotel", "Breakfast on cruise", "Breakfast and departure"
    if (/(^|\s)breakfast(\s|$|at|on|in|and)/.test(t)) {
        meals.push('breakfast');
    }
    if (/(^|\s)lunch(\s|$|at|on|in|and)/.test(t)) {
        meals.push('lunch');
    }
    if (/(^|\s)dinner(\s|$|at|on|in|and)/.test(t)) {
        meals.push('dinner');
    }
    
    return meals;
}

function extractOvernight(text) {
    if (!text) return null;
    
    // Pattern 1: "Overnight stay in [Location]"
    let match = text.match(/overnight\s+stay\s+in\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|\.|,)/i);
    if (match) {
        return cleanLocationName(match[1].trim());
    }
    
    // Pattern 2: "Dinner and overnight on the [Location]" or "overnight on the [Location]"
    match = text.match(/(?:dinner\s+and\s+)?overnight\s+on\s+(?:the\s+)?([A-Z][a-zA-Z\s]+?)(?:\s|$|\.|,|-)/i);
    if (match) {
        let location = match[1].trim();
        // Handle "Nile cruise" or "Nile Cruise" or "Nile Cruise - Aswan"
        if (/nile\s+cruise/i.test(location)) {
            // Normalize: "Nile Cruise - Aswan" -> "Nile Cruise"
            location = location.replace(/\s*-\s*[A-Z][a-zA-Z\s]+$/, '').trim();
            return 'Nile Cruise';
        }
        return cleanLocationName(location);
    }
    
    // Pattern 3: "Overnight at/in [Location]" (more flexible)
    match = text.match(/overnight\s+(?:at|in)\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|\.|,|hotel|cruise)/i);
    if (match) {
        let location = match[1].trim();
        // Handle "St. Catherine" or "St Catherine"
        if (/st\.?\s*catherine/i.test(location)) {
            return 'St. Catherine';
        }
        // Handle "Nile Cruise - Aswan" -> "Nile Cruise"
        if (/nile\s+cruise/i.test(location)) {
            location = location.replace(/\s*-\s*[A-Z][a-zA-Z\s]+$/, '').trim();
            return 'Nile Cruise';
        }
        return cleanLocationName(location);
    }
    
    // Pattern 4: "Overnight: [Location]"
    match = text.match(/overnight\s*:\s*([A-Z][a-zA-Z\s]+?)(?:\s|$|\.|,)/i);
    if (match) {
        return cleanLocationName(match[1].trim());
    }
    
    // Pattern 5: "Overnight at [Location] hotel" or "Overnight at [Location]"
    match = text.match(/overnight\s+at\s+([A-Z][a-zA-Z\s]+?)\s+hotel/i);
    if (match) {
        return cleanLocationName(match[1].trim());
    }
    
    // Pattern 6: Just "Overnight in [Location]" at end of sentence
    match = text.match(/overnight\s+in\s+([A-Z][a-zA-Z\s]+?)(?:\.|$)/i);
    if (match) {
        let location = match[1].trim();
        // Handle "Nile Cruise" variations
        if (/nile\s+cruise/i.test(location)) {
            location = location.replace(/\s*-\s*[A-Z][a-zA-Z\s]+$/, '').trim();
            return 'Nile Cruise';
        }
        // Handle "St. Catherine"
        if (/st\.?\s*catherine/i.test(location)) {
            return 'St. Catherine';
        }
        return cleanLocationName(location);
    }
    
    return null;
}

function cleanLocationName(location) {
    if (!location) return null;
    
    let cleaned = location.trim();
    
    // Handle special cases first
    if (/nile\s+cruise/i.test(cleaned)) {
        return 'Nile Cruise';
    }
    if (/st\.?\s*catherine/i.test(cleaned)) {
        return 'St. Catherine';
    }
    if (/abu\s+simbel/i.test(cleaned)) {
        return 'Abu Simbel';
    }
    
    // Remove common suffixes but keep "Cruise" if it's part of the name
    if (!/cruise/i.test(cleaned)) {
        cleaned = cleaned.replace(/\s+(hotel|resort|lodge|camp|villa)$/i, '');
    }
    
    // Capitalize properly
    cleaned = toTitleCase(cleaned);
    
    // Fix common city names
    const cityFixes = {
        'Cairo': 'Cairo',
        'Luxor': 'Luxor',
        'Aswan': 'Aswan',
        'Alexandria': 'Alexandria',
        'Kom Ombo': 'Kom Ombo',
        'Edfu': 'Edfu',
        'Giza': 'Giza',
        'Saqqara': 'Saqqara'
    };
    
    // Check if it matches a known city (case-insensitive)
    for (const [correct, fixed] of Object.entries(cityFixes)) {
        if (cleaned.toLowerCase() === correct.toLowerCase()) {
            return fixed;
        }
    }
    
    return cleaned;
}

function extractRoute(text) {
    if (!text) return null;
    // "City A - City B" or "City A to City B"
    const match = text.match(/([A-Z][a-zA-Z\s]+)\s*(?:-|–|to)\s*([A-Z][a-zA-Z\s]+)/);
    if (match) {
        return { from: match[1].trim(), to: match[2].trim() };
    }
    return null;
}

// Extract route from text patterns like "Fly from X to Y", "Drive to X", "Transfer to X"
function extractRouteFromText(text) {
    if (!text) return null;
    
    // Pattern: "Fly from X to Y" or "Flight from X to Y"
    let match = text.match(/(?:fly|flight|flying)\s+(?:from|to)\s+([A-Z][a-zA-Z\s]+?)(?:\s+to\s+([A-Z][a-zA-Z\s]+))?/i);
    if (match) {
        return {
            from: match[1] ? match[1].trim() : null,
            to: match[2] ? match[2].trim() : null,
            mode: 'flight'
        };
    }
    
    // Pattern: "Drive to X" or "Transfer to X"
    match = text.match(/(?:drive|transfer|proceed)\s+to\s+([A-Z][a-zA-Z\s]+)/i);
    if (match) {
        return {
            from: null,
            to: match[1].trim(),
            mode: 'drive'
        };
    }
    
    // Pattern: "Sail to X" or "Cruise to X"
    match = text.match(/(?:sail|cruise)\s+(?:to|towards)\s+([A-Z][a-zA-Z\s]+)/i);
    if (match) {
        return {
            from: null,
            to: match[1].trim(),
            mode: 'ferry'
        };
    }
    
    return null;
}

// Extract route mode (drive, flight, ferry, train, etc.)
function extractRouteMode(text) {
    if (!text) return null;
    const t = text.toLowerCase();
    
    // Check for flight patterns
    if (/(?:fly|flight|flying|airplane|aircraft)\s+(?:to|from|between)/i.test(t) || 
        /(?:domestic\s+)?flight/i.test(t)) {
        return 'flight';
    }
    
    // Check for ferry/boat patterns
    if (/(?:ferry|boat|sail|sailing|cruise)\s+(?:to|from|between)/i.test(t) ||
        /(?:by\s+)?ferry/i.test(t)) {
        return 'ferry';
    }
    
    // Check for train patterns
    if (/(?:train|railway|rail)\s+(?:to|from|between)/i.test(t) ||
        /(?:by\s+)?train/i.test(t)) {
        return 'train';
    }
    
    // Check for drive patterns
    if (/(?:drive|driving|road|by\s+road|by\s+car|vehicle)\s+(?:to|from|between)/i.test(t) ||
        /(?:transfer|proceed)\s+to/i.test(t)) {
        return 'drive';
    }
    
    // Default to drive if route exists but mode not specified
    if (extractRoute(text)) {
        return 'drive';
    }
    
    return null;
}

// Extract optional activities with prices
function extractOptionals(text) {
    const optionals = [];
    if (!text) return optionals;
    
    // Pattern: "Optional: Activity Name - Price" or "Optional Activity Name (Price)"
    const optionalPatterns = [
        /(?:optional|optional:)\s*([^:–—\-]+?)\s*[–—\-:]\s*([A-Z]{3}\s*[\d,]+|\$[\d,]+|USD\s*[\d,]+|EUR\s*[\d,]+|INR\s*[\d,]+)/gi,
        /(?:optional|optional:)\s*([^(]+?)\s*\(([A-Z]{3}\s*[\d,]+|\$[\d,]+|USD\s*[\d,]+|EUR\s*[\d,]+|INR\s*[\d,]+)\)/gi,
    ];
    
    for (const pattern of optionalPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const name = match[1].trim();
            const price = match[2].trim();
            
            if (name && price) {
                optionals.push({
                    name: name,
                    price: price,
                    description: null
                });
            }
        }
    }
    
    // Also check for "Optional:" followed by description
    const optionalDescPattern = /(?:optional|optional:)\s*([^\.]+?)(?:\.|$)/gi;
    let descMatch;
    while ((descMatch = optionalDescPattern.exec(text)) !== null) {
        const desc = descMatch[1].trim();
        // Skip if already captured by price pattern
        if (!optionals.some(opt => opt.name.includes(desc) || desc.includes(opt.name))) {
            // Try to extract price from description
            const priceMatch = desc.match(/([A-Z]{3}\s*[\d,]+|\$[\d,]+|USD\s*[\d,]+|EUR\s*[\d,]+|INR\s*[\d,]+)/);
            if (priceMatch) {
                const name = desc.replace(priceMatch[0], '').trim();
                optionals.push({
                    name: name || desc,
                    price: priceMatch[0],
                    description: null
                });
            } else {
                optionals.push({
                    name: desc,
                    price: null,
                    description: null
                });
            }
        }
    }
    
    return optionals;
}

function extractCityFromTitle(title) {
    // If title is just "Yerevan" or "Arrival in Yerevan"
    const clean = title.replace(/^(Arrival|Departure|Tour|Visit)\s+(in|to|of)\s+/i, '');
    if (/^[A-Z][a-zA-Z\s]+$/.test(clean)) return clean.trim();
    return null;
}

function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

function isDomestic(title, desc) {
    const t = (title + ' ' + desc).toLowerCase();
    const indianCities = ['delhi', 'mumbai', 'goa', 'kerala', 'rajasthan', 'himachal', 'kashmir', 'andaman'];
    return indianCities.some(c => t.includes(c));
}

function generateSlug(title, days, nights) {
    if (!title) return 'package-' + Date.now();
    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (days && nights) {
        slug += `-${days}d${nights}n`;
    }
    return slug;
}

// Extract arrival point
function extractArrivalPoint(text) {
    if (!text) return null;
    
    const patterns = [
        /arrive\s+(?:at|in)\s+([A-Z][^,\.]+?)(?:,|\.|$)/i,
        /arrival\s+(?:at|in)\s+([A-Z][^,\.]+?)(?:,|\.|$)/i,
        /land\s+(?:at|in)\s+([A-Z][^,\.]+?)(?:,|\.|$)/i,
        /reach\s+([A-Z][^,\.]+?)\s+(?:airport|station|terminal)/i,
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }
    
    return null;
}

// Extract departure point
function extractDeparturePoint(text) {
    if (!text) return null;
    
    const patterns = [
        /depart\s+(?:from|at)\s+([A-Z][^,\.]+?)(?:,|\.|$)/i,
        /departure\s+(?:from|at)\s+([A-Z][^,\.]+?)(?:,|\.|$)/i,
        /fly\s+out\s+(?:from|at)\s+([A-Z][^,\.]+?)(?:,|\.|$)/i,
        /leave\s+(?:from|at)\s+([A-Z][^,\.]+?)(?:,|\.|$)/i,
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }
    
    return null;
}

// Check if text is about arrival or departure
function isArrivalOrDeparture(text) {
    if (!text) return false;
    const t = text.toLowerCase();
    return /(?:arrive|arrival|land|reach)\s+(?:at|in)/i.test(t) ||
           /(?:depart|departure|fly\s+out|leave)\s+(?:from|at)/i.test(t);
}

// Check if text is only about overnight (not an activity)
function isOvernightOnly(text) {
    if (!text) return false;
    const t = text.toLowerCase();
    
    // Patterns that indicate it's just about overnight
    const overnightPatterns = [
        /^(?:dinner\s+and\s+)?overnight\s+(?:at|in|on)/i,
        /^stay\s+(?:at|in)\s+hotel/i,
        /^night\s+(?:at|in)/i,
        /^overnight$/i,
    ];
    
    if (overnightPatterns.some(pattern => pattern.test(t))) {
        // Check if there are activity keywords
        const activityKeywords = /(visit|explore|tour|temple|museum|palace|cruise|safari)/i;
        return !activityKeywords.test(text);
    }
    
    return false;
}

// Check if text is only administrative (check-in, transfer, etc.)
function isAdministrativeOnly(text) {
    if (!text) return false;
    const t = text.toLowerCase();
    
    const adminPatterns = [
        /^(?:transfer|drive|proceed)\s+to\s+(?:your\s+)?hotel/i,
        /^check\s*[-]?in/i,
        /^meet\s+and\s+assist/i,
        /^airport\s+(?:transfer|pickup|pick-up)/i,
        /^hotel\s+(?:transfer|pickup|pick-up)/i,
    ];
    
    if (adminPatterns.some(pattern => pattern.test(t))) {
        // Check if there are activity keywords
        const activityKeywords = /(visit|explore|tour|temple|museum|palace|cruise|safari|market|monument)/i;
        return !activityKeywords.test(text);
    }
    
    return false;
}

// Extract cities covered from itinerary
function extractCitiesCovered(itinerary) {
    const cities = new Set();
    
    if (!itinerary || itinerary.length === 0) return [];
    
    // Known city names to validate against (common travel destinations)
    const knownCities = new Set([
        'Cairo', 'Luxor', 'Aswan', 'Alexandria', 'Giza', 'Abu Simbel', 'Kom Ombo', 'Edfu', 'Saqqara', 'St. Catherine',
        'Amman', 'Petra', 'Wadi Rum', 'Aqaba', 'Dead Sea', 'Jerash', 'Madaba',
        'Yerevan', 'Gyumri', 'Dilijan', 'Garni', 'Geghard',
        'Paris', 'London', 'Rome', 'Barcelona', 'Amsterdam', 'Berlin', 'Vienna',
        'Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya',
        'Dubai', 'Abu Dhabi', 'Doha', 'Muscat',
        'Istanbul', 'Cappadocia', 'Antalya', 'Bodrum',
        'Bali', 'Jakarta', 'Yogyakarta', 'Singapore',
        'Tokyo', 'Kyoto', 'Osaka', 'Seoul', 'Busan'
    ]);
    
    // Extract from overnight locations (most reliable source)
    itinerary.forEach(day => {
        if (day.overnight) {
            let location = day.overnight.trim();
            
            // Handle "Nile Cruise - Aswan" or "Nile Cruise - Luxor" - extract the city
            const cruiseCityMatch = location.match(/nile\s+cruise\s*-\s*([A-Z][a-zA-Z\s]+?)(?:\s|$|\.|,)/i);
            if (cruiseCityMatch) {
                const city = cruiseCityMatch[1].trim();
                if (city && city.length >= 3 && city.length <= 30 && /^[A-Z]/.test(city)) {
                    cities.add(city);
                }
                // Don't add "Nile Cruise" as a city, but continue to process other cities
            }
            
            // Skip "Nile Cruise" (without city) - it's transport, not a city
            if (/^nile\s+cruise$/i.test(location)) {
                return;
            }
            
            // Handle "St. Catherine" or "St Catherine"
            if (/st\.?\s*catherine/i.test(location)) {
                cities.add('St. Catherine');
                return;
            }
            
            // Clean location name
            location = location
                .replace(/\s+(hotel|resort|lodge|camp|villa|on board|on the|at the|in the)$/i, '')
                .replace(/^(the|a|an)\s+/i, '')
                .trim();
            
            // Remove cruise suffix if present
            location = location.replace(/\s*-\s*nile\s+cruise$/i, '').trim();
            
            // Validate city name
            if (location && 
                location.length >= 3 && 
                location.length <= 30 &&
                /^[A-Z]/.test(location) &&
                !/(airport|departure|arrival|transfer|check|meet|assist|breakfast|lunch|dinner|overnight|activities|including|camel|boat|ride|tour|visit|explore|temple|palace|museum|market|park|monument|pyramid|sphinx|valley|tower|bridge|dam|shopping|optional|evening|sound|light|show|citadel|street|village|bazaar|khan|el|khalili|moazz|qaitbay|raha|fly|back|nile|cruise)/i.test(location) &&
                !/^(The|A|An|And|Or|But|For|With|At|In|On|Of|To|From|St|St\.)$/i.test(location)) {
                cities.add(location);
            }
        }
        
        // Extract from route_to (destination city)
        if (day.route_to) {
            let city = day.route_to
                .replace(/\s+(hotel|cruise|resort|lodge|camp|villa|airport|station)$/i, '')
                .replace(/^(the|a|an)\s+/i, '')
                .trim();
            
            // Skip if it's "Nile Cruise" or invalid
            if (city && 
                city.length >= 3 && 
                city.length <= 30 &&
                /^[A-Z]/.test(city) &&
                !/(transfer|drive|flight|proceed|arrive|depart|check|meet|assist|nile\s+cruise|fly\s+back|airport)$/i.test(city) &&
                !/^(The|A|An|And|Or|But|For|With|At|In|On|Of|To|From|St|St\.)$/i.test(city)) {
                cities.add(city);
            }
        }
        
        // Extract from route_from (origin city)
        if (day.route_from) {
            let city = day.route_from
                .replace(/\s+(hotel|cruise|resort|lodge|camp|villa|airport|station)$/i, '')
                .replace(/^(the|a|an)\s+/i, '')
                .trim();
            
            if (city && 
                city.length >= 3 && 
                city.length <= 30 &&
                /^[A-Z]/.test(city) &&
                !/(transfer|drive|flight|proceed|arrive|depart|check|meet|assist|nile\s+cruise|fly\s+back|airport)$/i.test(city) &&
                !/^(The|A|An|And|Or|But|For|With|At|In|On|Of|To|From|St|St\.)$/i.test(city)) {
                cities.add(city);
            }
        }
        
        // Extract from day title if it mentions a city (e.g., "Day 09: Alexandria Day Trip")
        if (day.title) {
            // Pattern: "Day X: City Name" or "City Name – Description" or "City Name Day Trip"
            const titleMatch = day.title.match(/(?:Day\s+\d+:\s*)?([A-Z][a-zA-Z\s]+?)(?:\s*(?:Day\s+Trip|–|\-|$))/);
            if (titleMatch) {
                const potentialCity = titleMatch[1].trim();
                // Check if it's a known city or looks like a city name
                if (knownCities.has(potentialCity) || 
                    (potentialCity.length >= 3 && 
                     potentialCity.length <= 30 &&
                     /^[A-Z]/.test(potentialCity) &&
                     !/(arrival|departure|transfer|tour|visit|explore|full|day|trip)/i.test(potentialCity) &&
                     !/(activities|including|camel|boat|ride|temple|palace|museum|market|park|monument|pyramid|sphinx|valley|tower|bridge|dam)/i.test(potentialCity))) {
                    cities.add(potentialCity);
                }
            }
        }
    });
    
    // Filter to only include valid city names
    const validCities = Array.from(cities).filter(city => {
        // Must be a proper noun (starts with capital)
        if (!/^[A-Z]/.test(city)) return false;
        
        // Must not contain common activity words
        if (/(activities|including|camel|boat|ride|tour|visit|explore|temple|palace|museum|market|park|monument|pyramid|sphinx|valley|tower|bridge|dam|shopping|optional|evening|sound|light|show|citadel|street|village|bazaar|khan|el|khalili|moazz|qaitbay|raha)/i.test(city)) {
            return false;
        }
        
        // Must not be too short or too long
        if (city.length < 3 || city.length > 30) return false;
        
        // Must not be common words
        if (/^(The|A|An|And|Or|But|For|With|At|In|On|Of|To|From|St|St\.)$/i.test(city)) {
            return false;
        }
        
        return true;
    });
    
    return validCities.sort();
}

// Extract internal transport modes from itinerary
function extractInternalTransport(itinerary) {
    const transportModes = new Set();
    
    if (!itinerary || itinerary.length === 0) return [];
    
    itinerary.forEach(day => {
        if (day.route_mode) {
            // Map route_mode to display names
            const modeMap = {
                'flight': 'Domestic Flight',
                'ferry': 'Ferry',
                'train': 'Train',
                'drive': 'A/C Coach'
            };
            const displayName = modeMap[day.route_mode] || day.route_mode;
            transportModes.add(displayName);
        }
        
        // Also check activities for transport mentions
        if (day.activities) {
            day.activities.forEach(activity => {
                if (activity.type === 'transfer' || activity.type === 'adventure') {
                    const name = activity.name.toLowerCase();
                    if (name.includes('cruise')) transportModes.add('Nile Cruise');
                    if (name.includes('felucca')) transportModes.add('Felucca');
                    if (name.includes('jeep') || name.includes('4x4')) transportModes.add('4x4 Jeep');
                }
            });
        }
    });
    
    return Array.from(transportModes).sort();
}

// Calculate stay breakdown from overnight locations
function calculateStayBreakdown(itinerary) {
    const stayCounts = {};
    
    if (!itinerary || itinerary.length === 0) return [];
    
    itinerary.forEach(day => {
        if (day.overnight) {
            let location = day.overnight.trim();
            
            // Handle "Nile Cruise" - keep as is (including variations)
            if (/nile\s+cruise/i.test(location)) {
                // Normalize variations: "Nile Cruise - Aswan" -> "Nile Cruise"
                location = 'Nile Cruise';
            }
            // Handle "St. Catherine" or "St Catherine"
            else if (/st\.?\s*catherine/i.test(location)) {
                location = 'St. Catherine';
            }
            // Handle other locations - clean them
            else {
                location = location
                    .replace(/\s+(hotel|resort|lodge|camp|villa|on board|on the|at the|in the)$/i, '')
                    .replace(/^(the|a|an)\s+/i, '')
                    .trim();
                
                // Remove location suffixes like "- Aswan", "- Luxor" from cruise
                location = location.replace(/\s*-\s*[A-Z][a-zA-Z\s]+$/, '').trim();
            }
            
            // Filter out invalid locations
            if (location && 
                location.length >= 3 && 
                location.length <= 50 &&
                /^[A-Z]/.test(location) && // Must start with capital
                !/(airport|departure|arrival|transfer|check|meet|assist|breakfast|lunch|dinner|overnight|activities|including|camel|boat|ride|tour|visit|explore|temple|palace|museum|market|park|monument|pyramid|sphinx|valley|tower|bridge|dam|shopping|optional|evening|sound|light|show|citadel|street|village|bazaar|khan|el|khalili|moazz|qaitbay|raha|fly\s+back)/i.test(location) &&
                !/^(The|A|An|And|Or|But|For|With|At|In|On|Of|To|From|St|St\.)$/i.test(location)) {
                stayCounts[location] = (stayCounts[location] || 0) + 1;
            }
        }
    });
    
    // Convert to array format and filter out invalid entries
    return Object.entries(stayCounts)
        .filter(([location]) => location.length >= 3 && location.length <= 50)
        .map(([location, nights]) => ({
            location: location,
            nights: nights
        }))
        .sort((a, b) => b.nights - a.nights); // Sort by nights descending
}
