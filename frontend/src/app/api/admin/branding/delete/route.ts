import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function DELETE(request: NextRequest) {
  try {
    const { type } = await request.json();

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

    // Delete from public folder
    const publicPath = join(process.cwd(), 'frontend', 'public');
    const filepath = join(publicPath, filename);

    if (existsSync(filepath)) {
      await unlink(filepath);
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}
