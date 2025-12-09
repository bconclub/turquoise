import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import mammoth from 'mammoth';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    // Check if API key is configured
    if (!process.env.CLAUDE_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'CLAUDE_API_KEY or ANTHROPIC_API_KEY is not configured. Please add it to your .env.local file.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.docx')) {
      return NextResponse.json(
        { error: 'Only .docx files are supported' },
        { status: 400 }
      );
    }

    // Extract text from Word document
    console.log(`Extracting text from document: ${file.name}`);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const result = await mammoth.extractRawText({ buffer });
    const documentText = result.value;

    if (!documentText || documentText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Document appears to be empty or could not extract text' },
        { status: 400 }
      );
    }

    // Use Claude to parse and extract structured data
    console.log('Sending document to Claude for parsing...');
    const parsedData = await parseWithClaude(documentText);

    console.log('Parse successful:', {
      title: parsedData.title,
      days: parsedData.itinerary?.length || 0,
      cities: parsedData.cities_covered?.length || 0
    });

    return NextResponse.json(parsedData);

  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to parse document',
        details: error.stack
      },
      { status: 500 }
    );
  }
}

function extractJSON(text) {
  if (!text) return null;
  
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
  
  // Find the first { and try to find matching }
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace === -1) {
    // No opening brace found, return null
    return null;
  }
  
  // Start from the first brace
  cleaned = cleaned.substring(firstBrace);
  
  // Try to find the matching closing brace by counting braces
  let braceCount = 0;
  let lastValidIndex = -1;
  
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') {
      braceCount++;
    } else if (cleaned[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        lastValidIndex = i;
        break;
      }
    }
  }
  
  if (lastValidIndex === -1) {
    // No matching closing brace found, try to extract what we have
    // Sometimes Claude truncates, so we'll try to fix it
    console.warn('Incomplete JSON detected, attempting to fix...');
    // Try to add closing braces
    const missingBraces = braceCount;
    cleaned = cleaned + '\n' + '}'.repeat(missingBraces);
    lastValidIndex = cleaned.length - 1;
  }
  
  return cleaned.substring(0, lastValidIndex + 1);
}

async function parseWithClaude(documentText) {
  // Truncate text if too long (Claude has token limits)
  const maxLength = 100000; // ~25k tokens
  const truncatedText = documentText.length > maxLength 
    ? documentText.substring(0, maxLength) + '\n\n[... document truncated ...]'
    : documentText;

  const prompt = `You are an expert travel document parser. Extract structured data from this travel package itinerary document and return it as valid JSON.

CRITICAL: Return ONLY valid JSON, no markdown, no code blocks, no explanations. The response must be parseable JSON.

Extract the following fields according to this exact structure:

{
  "title": "string (package title, max 300 chars)",
  "subtitle": "string (optional tagline, max 500 chars)",
  "description": "string (full description, 2-3 sentences maximum)",
  "nights": number (total nights),
  "days": number (total days),
  "duration_display": "string (e.g., '7 Days / 6 Nights')",
  "is_domestic": boolean,
  "cities_covered": ["array of city names"],
  "stay_breakdown": [{"location": "string", "nights": number}],
  "travel_styles": ["array: cultural, adventure, luxury, historical, beach, wildlife, pilgrimage, honeymoon, family, relaxation"],
  "themes": ["array: desert, ancient-ruins, unesco, film-location, mountains, beaches, wildlife, spiritual, etc."],
  "difficulty": "string: easy, moderate, challenging",
  "pace": "string: relaxed, moderate, fast",
  "highlights": ["array of highlight strings"],
  "includes": ["array of inclusion strings"],
  "excludes": ["array of exclusion strings"],
  "important_notes": ["array of important note strings"],
  "arrival_point": "string (airport/arrival location)",
  "departure_point": "string (airport/departure location)",
  "internal_transport": ["array of transport modes"],
  "best_months": [array of month numbers 1-12],
  "season_note": "string (optional note about best time)",
  "itinerary": [
    {
      "day_number": number,
      "title": "string (e.g., 'Day 01: Arrival in Cairo')",
      "description": "string (full day description)",
      "overnight": "string (location name)",
      "meals": ["breakfast", "lunch", "dinner"],
      "route_from": "string (starting location)",
      "route_to": "string (ending location)",
      "route_mode": "string (flight, drive, train, cruise, etc.)",
      "activities": [
        {
          "name": "string (activity name)",
          "type": "string (cultural, adventure, leisure, transfer, dining, shopping, etc.)",
          "highlight": boolean,
          "description": "string (optional)"
        }
      ]
    }
  ]
}

EXTRACTION RULES:

1. TITLE: Extract from document header or first prominent line. Should be descriptive and include destination.

2. DURATION: Extract nights and days. Look for patterns like "7 Days / 6 Nights", "04 Nights / 05 Days", etc.

3. CITIES COVERED: Extract all unique city/location names mentioned in the itinerary. Include cities from:
   - Overnight locations (but normalize "Nile Cruise" separately)
   - Day trip destinations
   - Route locations
   Exclude: generic terms like "hotel", "airport", "restaurant"

4. STAY BREAKDOWN: Count nights per location from overnight fields. Format: [{"location": "Cairo", "nights": 3}, {"location": "Nile Cruise", "nights": 3}]

5. TRAVEL STYLES: Infer from content:
   - cultural: temples, museums, historical sites
   - adventure: hiking, safaris, outdoor activities
   - luxury: premium hotels, exclusive experiences
   - historical: ancient sites, monuments
   - beach: beach activities, coastal locations
   - wildlife: safaris, animal encounters
   - pilgrimage: religious sites, spiritual journeys
   - honeymoon: romantic experiences
   - family: family-friendly activities

6. THEMES: Extract themes like: unesco, desert, mountains, beaches, ancient-ruins, film-location, etc.

7. DIFFICULTY: 
   - easy: mostly sightseeing, minimal physical activity
   - moderate: some walking, light activities
   - challenging: hiking, strenuous activities

8. PACE:
   - relaxed: 1-2 activities per day, lots of free time
   - moderate: 3-4 activities per day
   - fast: 5+ activities per day, packed schedule

9. HIGHLIGHTS: Extract 5-10 major attractions/experiences. Should be specific and compelling.

10. INCLUDES/EXCLUDES: Extract from dedicated sections. If not clearly marked, infer from content.

11. ITINERARY: Parse each day carefully:
    - Extract day number and title
    - Extract full description
    - Extract overnight location (normalize "Nile Cruise" variations)
    - Extract meals (breakfast, lunch, dinner)
    - Extract route information (from, to, mode)
    - Extract activities with proper categorization:
      * transfer: airport transfers, hotel transfers, moving between cities
      * cultural: temples, museums, monuments, historical sites
      * adventure: hiking, safaris, outdoor activities
      * leisure: free time, shopping, optional activities
      * dining: restaurant visits, special meals
      * shopping: market visits, shopping opportunities
    - Mark major attractions as highlight: true

12. ARRIVAL/DEPARTURE: Extract airport names or arrival/departure points.

13. INTERNAL TRANSPORT: Extract transport modes (flight, private vehicle, train, cruise, etc.)

14. BEST MONTHS: Extract from "best time to visit" or seasonal information. Return as array of month numbers (1-12).

IMPORTANT:
- Normalize location names (e.g., "Nile Cruise - Aswan" → location: "Nile Cruise", extract "Aswan" to cities_covered)
- Be precise with activity types
- Filter out administrative tasks (check-in, check-out) from activities
- Ensure all arrays are arrays (not null/undefined)
- Ensure all required fields are present
- Return valid JSON only

Document text:
${truncatedText}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 16000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].text.trim();
    
    console.log('Claude response length:', responseText.length);
    console.log('Claude response preview:', responseText.substring(0, 500));
    
    // Extract JSON from response (handle cases where Claude adds markdown)
    let jsonText = extractJSON(responseText);

    if (!jsonText) {
      console.error('Failed to extract JSON from response:', responseText);
      throw new Error('Claude did not return valid JSON. Response: ' + responseText.substring(0, 200));
    }

    // Parse JSON
    let parsedData;
    try {
      parsedData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Attempted to parse:', jsonText.substring(0, 500));
      throw new Error(`Failed to parse JSON: ${parseError.message}. Response preview: ${jsonText.substring(0, 200)}`);
    }

    // Validate and normalize the response
    return normalizeParsedData(parsedData);

  } catch (error) {
    console.error('Claude parsing error:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to parse document with Claude: ${error.message}`);
  }
}

function normalizeParsedData(data) {
  // Ensure all required fields exist with proper defaults
  const normalized = {
    title: data.title || '',
    subtitle: data.subtitle || '',
    description: data.description || '',
    nights: parseInt(data.nights) || 0,
    days: parseInt(data.days) || 0,
    duration_display: data.duration_display || '',
    is_domestic: data.is_domestic || false,
    cities_covered: Array.isArray(data.cities_covered) ? data.cities_covered : [],
    stay_breakdown: Array.isArray(data.stay_breakdown) ? data.stay_breakdown : [],
    travel_styles: Array.isArray(data.travel_styles) ? data.travel_styles : [],
    themes: Array.isArray(data.themes) ? data.themes : [],
    difficulty: data.difficulty || 'easy',
    pace: data.pace || 'moderate',
    highlights: Array.isArray(data.highlights) ? data.highlights : [],
    includes: Array.isArray(data.includes) ? data.includes : [],
    excludes: Array.isArray(data.excludes) ? data.excludes : [],
    important_notes: Array.isArray(data.important_notes) ? data.important_notes : [],
    arrival_point: data.arrival_point || '',
    departure_point: data.departure_point || '',
    internal_transport: Array.isArray(data.internal_transport) ? data.internal_transport : [],
    best_months: Array.isArray(data.best_months) ? data.best_months : [],
    season_note: data.season_note || '',
    itinerary: Array.isArray(data.itinerary) ? data.itinerary.map(day => ({
      day_number: parseInt(day.day_number) || 0,
      title: day.title || '',
      description: day.description || '',
      overnight: day.overnight || '',
      meals: Array.isArray(day.meals) ? day.meals : [],
      route_from: day.route_from || '',
      route_to: day.route_to || '',
      route_mode: day.route_mode || '',
      activities: Array.isArray(day.activities) ? day.activities.map(activity => ({
        name: activity.name || '',
        type: activity.type || 'leisure',
        highlight: activity.highlight || false,
        description: activity.description || ''
      })) : []
    })) : []
  };

  return normalized;
}
