import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Handle file upload logic
    const formData = await req.formData();
    const file = formData.get('file') as Blob;

    // Process the file (e.g., upload to Supabase Storage)
    // Add your file handling logic here

    return NextResponse.json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error in /api/upload route:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
