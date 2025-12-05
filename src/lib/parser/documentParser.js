
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

        // --- GENERAL INFO PARSING (Title, Duration) ---
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
                activities: [],
                meals: [],
                overnight: null,
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
            // Collect description if it's not title/duration
            if (parsed.title && line !== parsed.title && !isDurationString(line)) {
                parsed.description = parsed.description ? parsed.description + '\n' + line : line;
            }
        }
    }

    // Finish last day
    finishCurrentDay(parsed, currentDay, dayContentBuffer);

    // Post-processing
    parsed.is_domestic = isDomestic(parsed.title, parsed.description);
    parsed.slug = generateSlug(parsed.title, parsed.days, parsed.nights);

    return parsed;
}

// --- HELPER FUNCTIONS ---

function finishCurrentDay(parsed, day, contentBuffer) {
    if (!day) return;

    const fullText = contentBuffer.join('\n');
    day.description = fullText.trim();

    // Extract details from the full text of the day
    day.activities = extractActivities(fullText);
    day.meals = extractMeals(fullText);

    // Try to find overnight/stay info
    const overnight = extractOvernight(fullText) || extractOvernight(day.title);
    if (overnight) day.overnight = overnight;

    // Try to find route info (From - To)
    const route = extractRoute(day.title) || extractRoute(fullText);
    if (route) {
        day.route_from = route.from;
        day.route_to = route.to;
        // If no explicit overnight, assume destination is overnight
        if (!day.overnight) day.overnight = route.to;
    } else if (!day.overnight && day.title) {
        // Fallback: check if title is just a city name
        const city = extractCityFromTitle(day.title);
        if (city) day.overnight = city;
    }

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

function extractActivities(text) {
    const activities = [];
    // Split by common delimiters or keywords
    // This is a simplified approach. For better results, NLP or more complex regex is needed.
    // We'll split by sentences or bullet points first.

    const sentences = text.split(/[.\n•]/).map(s => s.trim()).filter(s => s.length > 5);

    for (const sentence of sentences) {
        // Check for keywords
        const type = detectActivityType(sentence);
        if (type !== 'other') {
            // It's likely an activity
            activities.push({
                name: sentence,
                type: type,
                highlight: false // Can be improved
            });
        }
    }

    // Deduplicate
    return activities.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
}

function detectActivityType(text) {
    const t = text.toLowerCase();
    if (/(temple|shrine|museum|palace|castle|fort|monument|heritage|church|mosque|cathedral)/.test(t)) return 'cultural';
    if (/(shopping|market|mall|bazaar|souvenir)/.test(t)) return 'shopping';
    if (/(transfer|airport|drive|station|pickup|drop|flight|train)/.test(t)) return 'transfer';
    if (/(beach|bay|island|sea|ocean|swim)/.test(t)) return 'beach';
    if (/(safari|trek|cruise|dive|hike|adventure|jeep|rafting)/.test(t)) return 'adventure';
    if (/(garden|park|tower|view|sightseeing|city tour|panorama)/.test(t)) return 'sightseeing';
    if (/(show|performance|dance|music|concert)/.test(t)) return 'show';
    if (/(free time|relax|leisure|spa|massage)/.test(t)) return 'leisure';

    // Default fallback for generic movement/visiting
    if (/(visit|explore|proceed to|arrive at)/.test(t)) return 'sightseeing';

    return 'other';
}

function extractMeals(text) {
    const meals = [];
    const t = text.toLowerCase();
    if (t.includes('breakfast')) meals.push('breakfast');
    if (t.includes('lunch')) meals.push('lunch');
    if (t.includes('dinner')) meals.push('dinner');
    return meals;
}

function extractOvernight(text) {
    if (!text) return null;
    const match = text.match(/overnight\s+(?:at|in)\s+([A-Z][a-zA-Z\s]+)/);
    if (match) return match[1].trim();
    return null;
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
