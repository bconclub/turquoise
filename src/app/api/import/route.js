
import { NextResponse } from 'next/server';
import { parseDocumentWithClaude } from '@/lib/parser/claudeParser';

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

    // Process the first file
    const file = files[0];

    if (!file.name.endsWith('.docx')) {
      return NextResponse.json(
        { error: 'Only .docx files are supported' },
        { status: 400 }
      );
    }

    // Parse the document using Claude
    console.log(`Parsing document with Claude: ${file.name}`);
    const parsedData = await parseDocumentWithClaude(file);

    console.log('Parse successful:', {
      title: parsedData.title,
      days: parsedData.itinerary?.length || 0,
      cities: parsedData.cities_covered?.length || 0
    });

    return NextResponse.json(parsedData);

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to process document',
        details: error.stack
      },
      { status: 500 }
    );
  }
}
