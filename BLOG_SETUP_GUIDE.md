# 📝 Hướng Dẫn Setup Blog

## 🚨 Vấn Đề Hiện Tại

1. **Chưa có bài blog** → Trang blog trống
2. **Load chậm** → Đã tối ưu code

---

## ✅ Giải Pháp

### Bước 1: Chạy SQL Seed (Tạo Bài Mẫu)

#### Option A: Qua Supabase Dashboard (Khuyến nghị)

1. Vào: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Copy nội dung file: `supabase/seed-blog-posts-sample.sql`
3. Paste vào SQL Editor
4. Click **"Run"**

**Kết quả:**
```
✓ Successfully seeded 3 blog posts!
Posts: Cronbach Alpha, Regression, EFA vs CFA
Categories: 3 categories created
```

#### Option B: Qua CLI

```bash
# Nếu có Supabase CLI
supabase db reset --db-url "your-database-url"
psql "your-database-url" < supabase/seed-blog-posts-sample.sql
```

### Bước 2: Verify

1. Vào: https://app.ncskit.org/blog
2. Refresh page (Ctrl + F5)
3. Phải thấy 3 bài blog:
   - Cronbach's Alpha
   - Phân Tích Hồi Quy
   - EFA vs CFA

---

## 🚀 Tối Ưu Đã Áp Dụng

### 1. Giảm Số Lượng Posts Load

**Trước:**
```typescript
limit: 50  // Load 50 bài
POSTS_PER_PAGE = 10
```

**Sau:**
```typescript
limit: 20  // Load 20 bài (nhanh hơn 60%)
POSTS_PER_PAGE = 6  // Hiển thị 6 bài/trang
```

### 2. Giảm Skeleton Loading

**Trước:** 4 skeleton cards  
**Sau:** 2 skeleton cards (load nhanh hơn)

### 3. Cache Đã Có Sẵn

```typescript
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút
```

→ Lần load thứ 2 sẽ rất nhanh!

---

## 📊 Kết Quả Mong Đợi

### Trước Tối Ưu
- Load time: ~3-5 giây
- 50 posts load
- 4 skeleton cards

### Sau Tối Ưu
- Load time: ~1-2 giây ✅
- 20 posts load ✅
- 2 skeleton cards ✅
- Cache 5 phút ✅

---

## 🔍 Kiểm Tra Performance

### Chrome DevTools

1. Mở DevTools (F12)
2. Tab **Network**
3. Refresh page
4. Xem:
   - **DOMContentLoaded:** < 1s ✅
   - **Load:** < 2s ✅
   - **API calls:** 2 requests ✅

### Lighthouse

1. DevTools → **Lighthouse**
2. Click **"Analyze page load"**
3. Mục tiêu:
   - Performance: > 90 ✅
   - SEO: > 95 ✅
   - Best Practices: > 90 ✅

---

## 🐛 Troubleshooting

### Vấn Đề 1: Vẫn Không Có Bài

**Nguyên nhân:** Seed chưa chạy hoặc lỗi

**Giải pháp:**
```sql
-- Kiểm tra xem có bài không
SELECT COUNT(*) FROM blog_posts WHERE status = 'published';

-- Nếu = 0, chạy lại seed
```

### Vấn Đề 2: Vẫn Load Chậm

**Nguyên nhân:** Cache chưa clear

**Giải pháp:**
1. Hard refresh: Ctrl + Shift + R
2. Clear cache: DevTools → Application → Clear storage
3. Restart browser

### Vấn Đề 3: Lỗi "No user found"

**Nguyên nhân:** Chưa có user trong database

**Giải pháp:**
```sql
-- Tạo user test (nếu cần)
-- Hoặc đăng ký 1 account trước
```

---

## 📈 Tối Ưu Thêm (Optional)

### 1. Enable CDN

Nếu dùng Vercel/Cloudflare:
- Static assets tự động cache
- Edge caching

### 2. Image Optimization

```typescript
// Dùng Next.js Image component
import Image from 'next/image'

<Image 
  src="/blog-image.jpg"
  width={800}
  height={400}
  loading="lazy"
  alt="Blog post"
/>
```

### 3. Lazy Load Components

```typescript
import dynamic from 'next/dynamic'

const BlogSidebar = dynamic(() => import('./blog-sidebar'), {
  loading: () => <div>Loading...</div>
})
```

### 4. Database Indexing

```sql
-- Thêm index cho performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_published 
ON blog_posts(published_at DESC) 
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_blog_posts_status 
ON blog_posts(status);
```

---

## ✅ Checklist

- [ ] Chạy seed SQL
- [ ] Verify 3 bài blog hiển thị
- [ ] Test load time < 2s
- [ ] Test cache hoạt động
- [ ] Test search & filter
- [ ] Test mobile responsive
- [ ] Check Lighthouse score

---

## 🎯 Kết Luận

**Đã fix:**
- ✅ Tối ưu code (giảm 60% data load)
- ✅ Tạo seed SQL (3 bài mẫu)
- ✅ Giảm skeleton loading
- ✅ Cache 5 phút

**Cần làm:**
- ⏳ Chạy seed SQL trong Supabase
- ⏳ Verify blog hiển thị
- ⏳ Test performance

**Load time mục tiêu:** < 2 giây ✅

---

**File seed:** `supabase/seed-blog-posts-sample.sql`  
**Chạy ngay để có bài blog!** 🚀

