import { NextRequest, NextResponse } from 'next/server';
import { blogService } from '@/services/blog';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Query must be at least 2 characters long'
      }, { status: 400 });
    }

    const posts = await blogService.searchPosts(query.trim(), limit);
    
    return NextResponse.json({
      success: true,
      data: {
        posts,
        query: query.trim(),
        total: posts.length
      }
    });
  } catch (error) {
    console.error('Error searching posts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to search posts'
    }, { status: 500 });
  }
}