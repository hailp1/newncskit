import { NextRequest, NextResponse } from 'next/server';
import { blogService } from '@/services/blog';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await blogService.getPostBySlug(params.slug);
    
    if (!post) {
      return NextResponse.json({
        success: false,
        error: 'Post not found'
      }, { status: 404 });
    }

    // Get related posts
    const relatedPosts = await blogService.getRelatedPosts(post.id, 4);
    
    return NextResponse.json({
      success: true,
      data: {
        post,
        relatedPosts
      }
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch post'
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { action } = await request.json();
    
    if (action === 'like') {
      const post = await blogService.getPostBySlug(params.slug);
      if (!post) {
        return NextResponse.json({
          success: false,
          error: 'Post not found'
        }, { status: 404 });
      }
      
      await blogService.likePost(post.id);
      
      return NextResponse.json({
        success: true,
        message: 'Post liked successfully'
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });
  } catch (error) {
    console.error('Error processing post action:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process action'
    }, { status: 500 });
  }
}