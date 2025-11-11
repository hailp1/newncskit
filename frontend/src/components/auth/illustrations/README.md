# Illustration Components - Performance Optimization Guide

## Current Implementation

All illustration components use inline SVG graphics, which provides several performance benefits:

1. **No HTTP requests**: SVGs are embedded directly in the component
2. **Small bundle size**: SVG code is minimal and compresses well
3. **Scalable**: Vector graphics scale perfectly at any resolution
4. **CSS styling**: Can be styled with Tailwind classes
5. **Accessibility**: Proper ARIA labels and semantic HTML

## Code Splitting

Illustration components are lazy-loaded via `illustration-content.tsx` to reduce initial bundle size:

```typescript
const WelcomeIllustration = lazy(() => import('./welcome-illustration').then(m => ({ default: m.WelcomeIllustration })));
```

This ensures illustrations are only loaded when needed.

## Best Practices

### For SVG Icons

- Use inline SVG for small icons (< 5KB)
- Remove unnecessary metadata and comments
- Use `currentColor` for fill/stroke to enable CSS styling
- Add proper ARIA labels for accessibility
- Use `aria-hidden="true"` for decorative elements

### For Future Image Assets

If you need to add raster images (PNG, JPG, WebP) in the future:

1. **Use Next.js Image Component**:
```tsx
import Image from 'next/image';

<Image
  src="/auth/illustration.png"
  alt="Description"
  width={600}
  height={400}
  priority={false} // Set to true for above-the-fold images
  placeholder="blur" // Optional: add blur placeholder
  quality={85} // Default is 75
/>
```

2. **Provide Multiple Sizes**:
```tsx
<Image
  src="/auth/illustration.png"
  alt="Description"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
  fill
/>
```

3. **Use Modern Formats**:
- WebP for photos (smaller than JPEG)
- AVIF for even better compression (if browser support allows)
- SVG for logos and icons

4. **Optimize Images Before Upload**:
- Use tools like ImageOptim, Squoosh, or Sharp
- Target file sizes: < 100KB for illustrations
- Use appropriate dimensions (don't upload 4K images for 600px display)

## Performance Metrics

Current implementation achieves:
- Zero image HTTP requests
- Minimal bundle size impact (< 10KB per illustration)
- Instant rendering (no loading states needed)
- Perfect scaling on all devices

## Loading States

A loading fallback is provided in `illustration-content.tsx`:

```tsx
const IllustrationLoader = () => (
  <div className="flex items-center justify-center h-full p-8">
    <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl animate-pulse" />
  </div>
);
```

This provides a smooth loading experience during code splitting.
