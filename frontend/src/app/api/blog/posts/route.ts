import { NextRequest, NextResponse } from 'next/server';
import { blogService } from '@/services/blog';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const options = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      category: searchParams.get('category') || undefined,
      tag: searchParams.get('tag') || undefined,
      search: searchParams.get('search') || undefined,
      featured: searchParams.get('featured') === 'true',
    };

    const result = await blogService.getPosts(options);
    
    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        page: options.page,
        limit: options.limit,
        total: result.total,
        hasMore: result.hasMore
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch posts'
    }, { status: 500 });
  }
}