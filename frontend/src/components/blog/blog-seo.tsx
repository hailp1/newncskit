import Head from 'next/head';
import type { BlogPost } from '@/services/blog';

interface BlogSEOProps {
  post?: BlogPost;
  title?: string;
  description?: string;
  canonical?: string;
  type?: 'website' | 'article';
}

export function BlogSEO({ 
  post, 
  title = 'NCSKIT Blog - Nghiên cứu Marketing & Thống kê',
  description = 'Blog chuyên sâu về nghiên cứu marketing, phân tích thống kê và các phương pháp nghiên cứu khoa học.',
  canonical,
  type = 'website'
}: BlogSEOProps) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ncskit.com';
  
  // Post-specific SEO
  if (post) {
    const postUrl = `${siteUrl}/blog/${post.slug}`;
    const featuredImageUrl = typeof post.featured_image === 'string' 
      ? post.featured_image 
      : post.featured_image?.cdn_url || post.featured_image?.storage_path || '';
    const imageUrl = featuredImageUrl ? 
      (featuredImageUrl.startsWith('http') ? featuredImageUrl : `${siteUrl}${featuredImageUrl}`) :
      `${siteUrl}/images/blog-default.jpg`;
    const authorName = post.author.first_name && post.author.last_name 
      ? `${post.author.first_name} ${post.author.last_name}` 
      : post.author.username;
    const categoryName = post.categories && post.categories.length > 0 
      ? post.categories[0].name 
      : '';
    const tagNames = post.tags.map(tag => typeof tag === 'string' ? tag : tag.name).join(', ');

    return (
      <Head>
        {/* Basic Meta Tags */}
        <title>{post.meta_title || post.title}</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
        <meta name="keywords" content={post.focus_keyword || tagNames} />
        <meta name="author" content={authorName} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={post.canonical_url || postUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.og_title || post.title} />
        <meta property="og:description" content={post.og_description || post.excerpt} />
        <meta property="og:url" content={postUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:alt" content={post.title} />
        <meta property="og:site_name" content="NCSKIT" />
        <meta property="og:locale" content="vi_VN" />

        {/* Article specific */}
        <meta property="article:published_time" content={post.published_at || ''} />
        <meta property="article:modified_time" content={post.updated_at} />
        <meta property="article:author" content={authorName} />
        <meta property="article:section" content={categoryName} />
        {post.tags.map(tag => {
          const tagName = typeof tag === 'string' ? tag : tag.name;
          return <meta key={tagName} property="article:tag" content={tagName} />;
        })}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.twitter_title || post.title} />
        <meta name="twitter:description" content={post.twitter_description || post.excerpt} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:image:alt" content={post.title} />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt,
              "image": imageUrl,
              "author": {
                "@type": "Person",
                "name": authorName
              },
              "publisher": {
                "@type": "Organization",
                "name": "NCSKIT",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${siteUrl}/images/logo.png`
                }
              },
              "datePublished": post.published_at || post.created_at,
              "dateModified": post.updated_at,
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": postUrl
              },
              "articleSection": categoryName,
              "keywords": tagNames,
              "wordCount": post.word_count || post.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
              "timeRequired": `PT${post.reading_time}M`,
              "url": postUrl
            })
          }}
        />
      </Head>
    );
  }

  // General blog SEO
  const pageUrl = canonical || `${siteUrl}/blog`;
  
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="nghiên cứu marketing, phân tích thống kê, NCSKIT, research, analytics" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={`${siteUrl}/images/blog-og.jpg`} />
      <meta property="og:site_name" content="NCSKIT" />
      <meta property="og:locale" content="vi_VN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}/images/blog-og.jpg`} />

      {/* JSON-LD for Blog */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "NCSKIT Blog",
            "description": description,
            "url": pageUrl,
            "publisher": {
              "@type": "Organization",
              "name": "NCSKIT",
              "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/images/logo.png`
              }
            },
            "inLanguage": "vi-VN"
          })
        }}
      />
    </Head>
  );
}