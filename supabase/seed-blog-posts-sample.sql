-- ============================================================================
-- Seed Blog Posts - Sample Research Articles
-- ============================================================================
-- Run this to add 3 sample blog posts about research methods
-- ============================================================================

-- Insert sample blog posts (adjust user_id as needed)
-- Replace 'YOUR_USER_ID' with actual user ID from auth.users table

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get first admin user or create a system user
  SELECT id INTO admin_user_id FROM auth.users LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'No user found. Please create a user first.';
    RETURN;
  END IF;

  -- Post 1: Cronbach's Alpha
  INSERT INTO blog_posts (
    title,
    slug,
    excerpt,
    content,
    author_id,
    status,
    published_at,
    reading_time,
    view_count,
    comment_count,
    created_at,
    updated_at
  ) VALUES (
    'Cronbach''s Alpha: "Thước Đo Độ Tin Cậy" Của Bảng Hỏi - Giải Thích Cho Người Mới Bắt Đầu',
    'cronbach-alpha-la-gi',
    'Cronbach''s Alpha là gì? Tại sao nó quan trọng trong nghiên cứu? Hướng dẫn chi tiết với ví dụ thực tế, dễ hiểu cho người mới bắt đầu.',
    '# Cronbach''s Alpha: "Thước Đo Độ Tin Cậy" Của Bảng Hỏi

## Mở Đầu: Câu Chuyện Về Cái Cân Bị Lỗi

Tưởng tượng bạn đi siêu thị mua 1kg táo. Lần đầu cân được 1.2kg, lần hai cân lại được 0.8kg, lần ba được 1.5kg... với cùng một mớ táo! 😱

Bạn sẽ nghĩ gì? "Cái cân này hỏng rồi!" - Đúng không?

Đó chính xác là vấn đề mà **Cronbach''s Alpha** giúp chúng ta phát hiện trong nghiên cứu khoa học.

## Cronbach''s Alpha Là Gì?

**Cronbach''s Alpha** (ký hiệu: α) là một con số từ 0 đến 1 cho biết các câu hỏi trong thang đo của bạn có "hợp tác" với nhau tốt không.

- **α = 0.9-1.0:** Tuyệt vời! 🎯
- **α = 0.7-0.9:** Tốt ✅
- **α = 0.6-0.7:** Chấp nhận được 🤔
- **α < 0.6:** Có vấn đề ❌

## Tại Sao Quan Trọng?

1. Phát hiện câu hỏi "phá hoại"
2. Tăng độ tin cậy nghiên cứu
3. Yêu cầu của tạp chí khoa học

## Cách Tính

Sử dụng SPSS, R, hoặc **NCSKIT** để tính tự động!

[Đọc thêm trong bài viết đầy đủ...]',
    admin_user_id,
    'published',
    NOW(),
    8,
    156,
    12,
    NOW(),
    NOW()
  ) ON CONFLICT (slug) DO NOTHING;

  -- Post 2: Regression Analysis
  INSERT INTO blog_posts (
    title,
    slug,
    excerpt,
    content,
    author_id,
    status,
    published_at,
    reading_time,
    view_count,
    comment_count,
    created_at,
    updated_at
  ) VALUES (
    'Phân Tích Hồi Quy: "Bói Toán" Khoa Học Hay Là Gì?',
    'phan-tich-hoi-quy-cho-nguoi-moi',
    'Phân tích hồi quy là gì? Làm sao dự đoán tương lai từ dữ liệu? Hướng dẫn từ A-Z với ví dụ thực tế, không cần biết toán phức tạp!',
    '# Phân Tích Hồi Quy: "Bói Toán" Khoa Học

## Mở Đầu: Câu Chuyện Về Cô Giáo Đoán Điểm

Hồi cấp 3, cô giáo toán có "siêu năng lực": Chỉ cần nhìn số giờ học thêm, cô đoán điểm thi cực chuẩn! 🔮

- Học 0 giờ → Điểm 5
- Học 5 giờ → Điểm 7
- Học 10 giờ → Điểm 9

Đó không phải "bói toán" - đó là **Phân Tích Hồi Quy**!

## Hồi Quy Là Gì?

Tìm mối quan hệ giữa:
- **X (độc lập):** Cái bạn kiểm soát
- **Y (phụ thuộc):** Cái bạn muốn dự đoán

## Ví Dụ Thực Tế

### Giá Nhà 🏠
```
Giá = 500 + (50 × Diện tích)
```

### Lương 💰
```
Lương = 10 + (2 × Kinh nghiệm)
```

## Các Loại Hồi Quy

1. **Simple Linear:** 1 biến độc lập
2. **Multiple Linear:** Nhiều biến
3. **Logistic:** Dự đoán Yes/No

[Đọc thêm để biết cách làm...]',
    admin_user_id,
    'published',
    NOW() - INTERVAL '1 day',
    10,
    203,
    18,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Post 3: EFA vs CFA
  INSERT INTO blog_posts (
    title,
    slug,
    excerpt,
    content,
    author_id,
    status,
    published_at,
    reading_time,
    view_count,
    comment_count,
    created_at,
    updated_at
  ) VALUES (
    'EFA vs CFA: Hai Anh Em "Phân Tích Nhân Tố" - Giống Nhau Nhưng Khác Biệt!',
    'efa-vs-cfa-khac-nhau-the-nao',
    'EFA và CFA khác nhau như thế nào? Khi nào dùng cái nào? So sánh chi tiết với ví dụ thực tế, dễ hiểu cho người mới học.',
    '# EFA vs CFA: Hai Anh Em Phân Tích Nhân Tố

## Mở Đầu: Hai Anh Em Thám Tử

**Thám tử A (EFA):** "Tôi không biết hung thủ. Thu thập manh mối!" 🔍

**Thám tử B (CFA):** "Tôi nghi ông X. Kiểm tra bằng chứng!" 🎯

Đó là sự khác biệt giữa **EFA** và **CFA**!

## EFA - "Nhà Thám Hiểm"

**Exploratory Factor Analysis** = Khám phá

**Dùng khi:**
- Phát triển thang đo mới
- Chưa có lý thuyết
- Muốn khám phá cấu trúc

## CFA - "Nhà Kiểm Chứng"

**Confirmatory Factor Analysis** = Kiểm chứng

**Dùng khi:**
- Đã có lý thuyết
- Kiểm tra thang đo có sẵn
- Đo độ phù hợp mô hình

## So Sánh Nhanh

| Tiêu chí | EFA | CFA |
|----------|-----|-----|
| Mục đích | Khám phá | Kiểm chứng |
| Lý thuyết | Chưa có | Đã có |
| Công cụ | SPSS | AMOS |

[Đọc thêm để hiểu rõ hơn...]',
    admin_user_id,
    'published',
    NOW() - INTERVAL '2 days',
    12,
    178,
    15,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ) ON CONFLICT (slug) DO NOTHING;

  -- Add categories
  INSERT INTO blog_categories (name, slug, description, created_at)
  VALUES 
    ('Phương Pháp Nghiên Cứu', 'phuong-phap-nghien-cuu', 'Các phương pháp và kỹ thuật nghiên cứu khoa học', NOW()),
    ('Phân Tích Dữ Liệu', 'phan-tich-du-lieu', 'Hướng dẫn phân tích và xử lý dữ liệu nghiên cứu', NOW()),
    ('Thống Kê', 'thong-ke', 'Các phương pháp thống kê trong nghiên cứu', NOW())
  ON CONFLICT (slug) DO NOTHING;

  -- Link posts to categories
  INSERT INTO blog_post_categories (post_id, category_id)
  SELECT 
    bp.id,
    bc.id
  FROM blog_posts bp
  CROSS JOIN blog_categories bc
  WHERE bp.slug IN ('cronbach-alpha-la-gi', 'efa-vs-cfa-khac-nhau-the-nao')
    AND bc.slug = 'phuong-phap-nghien-cuu'
  ON CONFLICT DO NOTHING;

  INSERT INTO blog_post_categories (post_id, category_id)
  SELECT 
    bp.id,
    bc.id
  FROM blog_posts bp
  CROSS JOIN blog_categories bc
  WHERE bp.slug = 'phan-tich-hoi-quy-cho-nguoi-moi'
    AND bc.slug = 'phan-tich-du-lieu'
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✓ Successfully seeded 3 blog posts!';
  RAISE NOTICE 'Posts: Cronbach Alpha, Regression, EFA vs CFA';
  RAISE NOTICE 'Categories: 3 categories created';
END $$;
