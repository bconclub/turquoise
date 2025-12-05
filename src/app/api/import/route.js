
import { NextResponse } from 'next/server';
import { parseDocument } from '@/lib/parser/documentParser';

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

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the document
    console.log(`Parsing document: ${file.name}`);
    const parsedData = await parseDocument(buffer);

    console.log('Parse successful:', {
      title: parsedData.title,
      days: parsedData.itinerary.length
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
