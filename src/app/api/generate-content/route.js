import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

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

    const { type, packageData } = await request.json();

    if (!packageData) {
      return NextResponse.json(
        { error: 'Package data is required' },
        { status: 400 }
      );
    }

    if (!['title', 'subtitle', 'description'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be title, subtitle, or description' },
        { status: 400 }
      );
    }

    // Build context from package data
    const context = buildContext(packageData);

    // Create prompt based on type
    const prompt = createPrompt(type, context);

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: type === 'description' ? 150 : 100,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const generatedText = message.content[0].text.trim();

    if (!generatedText) {
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      );
    }

    return NextResponse.json({ content: generatedText });

  } catch (error) {
    console.error('Claude API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate content',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

function buildContext(packageData) {
  const context = {
    destination: packageData.destination_name || '',
    cities: packageData.cities_covered || [],
    days: packageData.days || 0,
    nights: packageData.nights || 0,
    travelStyles: packageData.travel_styles || [],
    themes: packageData.themes || [],
    highlights: packageData.highlights || [],
    itinerary: packageData.itinerary || [],
    stayBreakdown: packageData.stay_breakdown || [],
    arrivalPoint: packageData.arrival_point || '',
    departurePoint: packageData.departure_point || '',
    internalTransport: packageData.internal_transport || [],
    includes: packageData.includes || [],
    excludes: packageData.excludes || [],
  };

  return context;
}

function createPrompt(type, context) {
  const { destination, cities, days, nights, travelStyles, themes, highlights, itinerary, stayBreakdown, arrivalPoint, departurePoint } = context;

  const citiesList = cities.length > 0 ? cities.join(', ') : 'various destinations';
  const duration = days > 0 && nights > 0 ? `${days} Days / ${nights} Nights` : days > 0 ? `${days} Days` : '';
  const travelStyleText = travelStyles.length > 0 ? travelStyles.join(', ') : '';
  const themesText = themes.length > 0 ? themes.join(', ') : '';
  const highlightsText = highlights.length > 0 ? highlights.slice(0, 5).join(', ') : '';
  
  // Build itinerary summary
  let itinerarySummary = '';
  if (itinerary && itinerary.length > 0) {
    const daySummaries = itinerary.slice(0, 5).map((day, idx) => {
      const activities = day.activities?.slice(0, 3).map(a => a.name).join(', ') || '';
      return `Day ${idx + 1}: ${day.title || 'Travel day'}${activities ? ` - ${activities}` : ''}`;
    }).join('\n');
    itinerarySummary = `\nItinerary Overview:\n${daySummaries}${itinerary.length > 5 ? `\n... and ${itinerary.length - 5} more days` : ''}`;
  }

  // Build stay breakdown summary
  let staySummary = '';
  if (stayBreakdown && stayBreakdown.length > 0) {
    const stays = stayBreakdown.map(s => `${s.location}: ${s.nights} night${s.nights > 1 ? 's' : ''}`).join(', ');
    staySummary = `\nAccommodations: ${stays}`;
  }

  if (type === 'title') {
    return `You are a travel content writer for a luxury travel company. Generate a compelling, SEO-friendly package title based on the following information:

Destination: ${destination || 'Not specified'}
Cities Covered: ${citiesList}
Duration: ${duration || 'Not specified'}
Travel Style: ${travelStyleText || 'Not specified'}
Themes: ${themesText || 'Not specified'}
${itinerarySummary}
${staySummary}

Requirements:
- Exactly 4-5 words (catchy and concise)
- Include destination name if available
- Include key cities if space allows (max 1-2 cities)
- Include travel style or theme if relevant
- Make it compelling and professional
- No generic words like "Amazing" or "Incredible"
- Format: "Destination City1 & City2 [Style/Theme] Tour" or similar
- Examples: "Paris & Loire Valley Heritage Tour", "Egyptian Nile Cruise Experience"

Generate ONLY the title, nothing else.`;
  }

  if (type === 'subtitle') {
    return `You are a travel content writer for a luxury travel company. Generate a concise, engaging subtitle (tagline) based on the following information:

Destination: ${destination || 'Not specified'}
Cities Covered: ${citiesList}
Duration: ${duration || 'Not specified'}
Travel Style: ${travelStyleText || 'Not specified'}
Themes: ${themesText || 'Not specified'}
Key Highlights: ${highlightsText || 'Not specified'}
${itinerarySummary}

Requirements:
- Maximum 8-10 words
- Should be a short, punchy tagline
- Highlight the unique selling point
- Use format like "Heritage & Culture • Cairo & Luxor • UNESCO" or "Luxury Nile Cruise Experience"
- Can use bullet points (•) or dashes (-) to separate concepts
- Make it memorable and descriptive

Generate ONLY the subtitle, nothing else.`;
  }

  if (type === 'description') {
    return `You are a travel content writer for a luxury travel company. Write a compelling package description based on the following information:

Destination: ${destination || 'Not specified'}
Cities Covered: ${citiesList}
Duration: ${duration || 'Not specified'}
Travel Style: ${travelStyleText || 'Not specified'}
Themes: ${themesText || 'Not specified'}
Key Highlights: ${highlightsText || 'Not specified'}
${itinerarySummary}
${staySummary}
Arrival: ${arrivalPoint || 'Not specified'}
Departure: ${departurePoint || 'Not specified'}

Requirements:
- 2-3 sentences maximum (approximately 50-100 words)
- Start with an engaging hook about the destination/experience
- Mention duration and key cities
- Highlight 1-2 main attractions/experiences
- Include travel style or theme context if space allows
- Write in second person ("you", "your")
- Professional, luxurious tone
- No markdown formatting
- Keep it concise and impactful

Generate ONLY the description paragraph, nothing else.`;
  }

  return '';
}
