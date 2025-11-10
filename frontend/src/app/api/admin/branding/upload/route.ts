import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large' },
        { status: 400 }
      );
    }

    // Determine filename based on type
    const filenameMap: Record<string, string> = {
      favicon: 'favicon.ico',
      icon: 'icon.png',
      appleIcon: 'apple-icon.png',
      ogImage: 'og-image.png',
      twitterImage: 'twitter-image.png',
    };

    const filename = filenameMap[type];
    if (!filename) {
      return NextResponse.json(
        { error: 'Invalid type' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public folder
    const publicPath = join(process.cwd(), 'frontend', 'public');
    
    // Ensure public directory exists
    if (!existsSync(publicPath)) {
      await mkdir(publicPath, { recursive: true });
    }

    const filepath = join(publicPath, filename);
    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      url: `/${filename}`,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
