// Fallback blog posts - Hiển thị khi database trống
// Giúp trang load nhanh và luôn có nội dung

export const fallbackBlogPosts = [
  {
    id: 'fallback-0',
    title: 'NCSKIT: Nền Tảng Phân Tích Dữ Liệu Khảo Sát Miễn Phí Cho Nhà Nghiên Cứu Việt Nam',
    excerpt: 'Giới thiệu NCSKIT - công cụ phân tích dữ liệu khảo sát trực tuyến, miễn phí, hỗ trợ tiếng Việt. Từ Cronbach Alpha đến SEM, tất cả trong một nền tảng!',
    content: `# NCSKIT: Nền Tảng Phân Tích Dữ Liệu Miễn Phí

**NCSKIT** là nền tảng phân tích dữ liệu khảo sát trực tuyến, 100% miễn phí, được thiết kế cho nhà nghiên cứu Việt Nam.

## Tính Năng Chính

✅ **Cronbach's Alpha** - Kiểm tra độ tin cậy thang đo  
✅ **EFA/CFA** - Phân tích nhân tố  
✅ **SEM** - Mô hình cấu trúc tuyến tính  
✅ **Regression** - Phân tích hồi quy  
✅ **ANOVA/T-test** - So sánh nhóm  

## Tại Sao Chọn NCSKIT?

- **Miễn phí hoàn toàn** - Không giới hạn
- **Giao diện tiếng Việt** - Dễ hiểu
- **Không cần cài đặt** - Chạy trên browser
- **Tự động hóa** - Upload CSV là có kết quả
- **Báo cáo chuyên nghiệp** - Sẵn sàng cho luận văn

## So Sánh Với SPSS/AMOS

| Tiêu chí | NCSKIT | SPSS | AMOS |
|----------|--------|------|------|
| Giá | Miễn phí | ~$100/tháng | ~$150/tháng |
| Tiếng Việt | ✅ | ❌ | ❌ |
| Dễ dùng | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

Truy cập **NCSKIT** tại: https://app.ncskit.org

#NCSKIT #PhânTíchDữLiệu #NghiênCứuKhoaHọc #MiễnPhí`,
    author: {
      name: 'NCSKIT Team',
      avatar: undefined
    },
    publishedAt: new Date().toISOString(),
    readTime: 6,
    category: 'Giới Thiệu',
    tags: ['NCSKIT', 'Phân tích dữ liệu', 'Nghiên cứu', 'Miễn phí'],
    views: 523,
    comments: 34,
    featured: true
  },
  {
    id: 'fallback-1',
    title: 'Cronbach\'s Alpha: "Thước Đo Độ Tin Cậy" Của Bảng Hỏi',
    excerpt: 'Cronbach\'s Alpha là gì? Tại sao nó quan trọng trong nghiên cứu? Hướng dẫn chi tiết với ví dụ thực tế, dễ hiểu cho người mới bắt đầu.',
    content: `# Cronbach's Alpha: Thước Đo Độ Tin Cậy

## Cronbach's Alpha Là Gì?

**Cronbach's Alpha** (α) là chỉ số đo độ tin cậy của thang đo, cho biết các câu hỏi có "nhất quán" với nhau không.

**Giá trị:**
- α ≥ 0.9: Xuất sắc 🌟
- 0.8 ≤ α < 0.9: Tốt ✅
- 0.7 ≤ α < 0.8: Chấp nhận được
- α < 0.7: Cần cải thiện

## Ví Dụ Thực Tế

Đo "Sự hài lòng công việc" với 5 câu hỏi:
1. Tôi thích công việc (1-5)
2. Tôi muốn làm lâu dài (1-5)
3. Tôi cảm thấy hạnh phúc (1-5)
4. Tôi thích món phở gần công ty (1-5) ❌
5. Tôi tự hào về công việc (1-5)

Câu 4 "lạc quẻ" → Làm giảm α!

## Cách Tính Với NCSKIT

1. Upload CSV vào **NCSKIT**
2. Chọn "Reliability Analysis"
3. Chọn các biến trong thang đo
4. Click "Run" → Có kết quả α ngay!

**NCSKIT** tự động:
- Tính Cronbach's Alpha
- Hiển thị Item-Total Correlation
- Đề xuất xóa item nào để tăng α

Dùng **NCSKIT** miễn phí tại: https://app.ncskit.org

#CronbachAlpha #ĐộTinCậy #NCSKIT #SPSS`,
    author: {
      name: 'NCSKIT Team',
      avatar: undefined
    },
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    readTime: 8,
    category: 'Phương Pháp Nghiên Cứu',
    tags: ['Cronbach\'s Alpha', 'Độ tin cậy', 'Thang đo', 'SPSS'],
    views: 456,
    comments: 28,
    featured: true
  },
  {
    id: 'fallback-2',
    title: 'Phân Tích Hồi Quy: "Bói Toán" Khoa Học Hay Là Gì?',
    excerpt: 'Phân tích hồi quy là gì? Làm sao dự đoán tương lai từ dữ liệu? Hướng dẫn từ A-Z với ví dụ thực tế, không cần biết toán phức tạp!',
    content: `# Phân Tích Hồi Quy: Dự Đoán Khoa Học

## Hồi Quy Là Gì?

**Regression Analysis** = Tìm mối quan hệ giữa biến độc lập (X) và biến phụ thuộc (Y) để dự đoán.

**Công thức đơn giản:**
\`\`\`
Y = a + bX
\`\`\`

## Ví Dụ Thực Tế

### Dự Đoán Giá Nhà
\`\`\`
Giá nhà = 500 + (50 × Diện tích)
\`\`\`
- Nhà 100m² = 500 + 50×100 = 5,500 triệu

### Dự Đoán Lương
\`\`\`
Lương = 10 + (2 × Kinh nghiệm) + (3 × Học vấn)
\`\`\`
- 5 năm, Thạc sĩ = 10 + 2×5 + 3×2 = 26 triệu

## Các Loại Hồi Quy

1. **Simple Linear** - 1 biến độc lập
2. **Multiple Linear** - Nhiều biến
3. **Logistic** - Dự đoán Yes/No

## Chạy Hồi Quy Với NCSKIT

1. Upload CSV vào **NCSKIT**
2. Chọn "Regression Analysis"
3. Chọn biến phụ thuộc (Y)
4. Chọn biến độc lập (X1, X2...)
5. Click "Run" → Có phương trình!

**NCSKIT** tự động:
- Tính R², p-value
- Hiển thị phương trình
- Giải thích kết quả

Phân tích miễn phí tại: https://app.ncskit.org

#HồiQuy #Regression #NCSKIT #DựĐoán`,
    author: {
      name: 'NCSKIT Team',
      avatar: undefined
    },
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    readTime: 10,
    category: 'Phân Tích Dữ Liệu',
    tags: ['Hồi quy', 'Regression', 'Dự đoán', 'SPSS'],
    views: 389,
    comments: 22,
    featured: true
  },
  {
    id: 'fallback-3',
    title: 'EFA vs CFA: Hai Anh Em "Phân Tích Nhân Tố"',
    excerpt: 'EFA và CFA khác nhau như thế nào? Khi nào dùng cái nào? So sánh chi tiết với ví dụ thực tế, dễ hiểu cho người mới học.',
    content: '',
    author: {
      name: 'NCSKIT Team',
      avatar: undefined
    },
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
    readTime: 12,
    category: 'Phương Pháp Nghiên Cứu',
    tags: ['EFA', 'CFA', 'Factor Analysis', 'AMOS'],
    views: 312,
    comments: 19,
    featured: false
  },
  {
    id: 'fallback-4',
    title: 'ANOVA: So Sánh Trung Bình Nhiều Nhóm Như Thế Nào?',
    excerpt: 'ANOVA là gì? Khi nào dùng ANOVA thay vì t-test? Hướng dẫn chi tiết với ví dụ về so sánh lương 3 phòng ban, dễ hiểu cho người mới.',
    content: '',
    author: {
      name: 'NCSKIT Team',
      avatar: undefined
    },
    publishedAt: new Date(Date.now() - 345600000).toISOString(),
    readTime: 9,
    category: 'Thống Kê',
    tags: ['ANOVA', 'So sánh trung bình', 'F-test', 'SPSS'],
    views: 267,
    comments: 16,
    featured: false
  },
  {
    id: 'fallback-5',
    title: 'SEM (Structural Equation Modeling): Mô Hình "Siêu Phức Tạp" Nhưng Cực Mạnh!',
    excerpt: 'SEM là gì? Tại sao các nghiên cứu top journal đều dùng SEM? Giải thích đơn giản về mô hình cấu trúc tuyến tính với ví dụ thực tế.',
    content: '',
    author: {
      name: 'NCSKIT Team',
      avatar: undefined
    },
    publishedAt: new Date(Date.now() - 432000000).toISOString(),
    readTime: 15,
    category: 'Phương Pháp Nghiên Cứu',
    tags: ['SEM', 'Mô hình cấu trúc', 'AMOS', 'Nghiên cứu nâng cao'],
    views: 445,
    comments: 31,
    featured: false
  },
  {
    id: 'fallback-6',
    title: 'T-Test: Kiểm Định Đơn Giản Nhất Mà Ai Cũng Cần Biết',
    excerpt: 'T-test là gì? Khi nào dùng Independent t-test vs Paired t-test? Ví dụ về so sánh lương nam-nữ, điểm thi trước-sau, dễ hiểu!',
    content: '',
    author: {
      name: 'NCSKIT Team',
      avatar: undefined
    },
    publishedAt: new Date(Date.now() - 518400000).toISOString(),
    readTime: 7,
    category: 'Thống Kê',
    tags: ['T-test', 'Kiểm định', 'So sánh 2 nhóm', 'SPSS'],
    views: 298,
    comments: 18,
    featured: false
  },
  {
    id: 'fallback-7',
    title: 'Mediation & Moderation: Hiệu Ứng Trung Gian Và Điều Tiết',
    excerpt: 'Mediation và Moderation khác nhau thế nào? Khi nào biến đóng vai trò trung gian, khi nào điều tiết? Ví dụ thực tế dễ hiểu.',
    content: '',
    author: {
      name: 'NCSKIT Team',
      avatar: undefined
    },
    publishedAt: new Date(Date.now() - 604800000).toISOString(),
    readTime: 11,
    category: 'Phương Pháp Nghiên Cứu',
    tags: ['Mediation', 'Moderation', 'Hiệu ứng trung gian', 'Process Macro'],
    views: 356,
    comments: 24,
    featured: false
  },
  {
    id: 'fallback-8',
    title: 'Cách Thiết Kế Bảng Hỏi Khảo Sát Chuẩn Khoa Học',
    excerpt: 'Làm sao thiết kế bảng hỏi tốt? Thang đo Likert 5 hay 7 điểm? Câu hỏi ngược chiều có cần không? Hướng dẫn từ A-Z cho người mới.',
    content: '',
    author: {
      name: 'NCSKIT Team',
      avatar: undefined
    },
    publishedAt: new Date(Date.now() - 691200000).toISOString(),
    readTime: 10,
    category: 'Phương Pháp Nghiên Cứu',
    tags: ['Bảng hỏi', 'Khảo sát', 'Thang đo Likert', 'Thiết kế nghiên cứu'],
    views: 412,
    comments: 27,
    featured: false
  },
  {
    id: 'fallback-9',
    title: 'Xử Lý Missing Data: Khi Dữ Liệu Bị "Thủng Lỗ Chỗ"',
    excerpt: 'Missing data là gì? Xóa hay thay thế? Mean imputation, FIML, hay Multiple Imputation? So sánh các phương pháp xử lý dữ liệu thiếu.',
    content: '',
    author: {
      name: 'NCSKIT Team',
      avatar: undefined
    },
    publishedAt: new Date(Date.now() - 777600000).toISOString(),
    readTime: 8,
    category: 'Phân Tích Dữ Liệu',
    tags: ['Missing data', 'Dữ liệu thiếu', 'Imputation', 'Data cleaning'],
    views: 234,
    comments: 14,
    featured: false
  },
  {
    id: 'fallback-10',
    title: 'Correlation vs Causation: Tương Quan Không Phải Nhân Quả!',
    excerpt: 'Tại sao "ăn kem nhiều → đuối nước nhiều" không có nghĩa kem gây đuối nước? Phân biệt tương quan và nhân quả với ví dụ hài hước.',
    content: '',
    author: {
      name: 'NCSKIT Team',
      avatar: undefined
    },
    publishedAt: new Date(Date.now() - 864000000).toISOString(),
    readTime: 6,
    category: 'Thống Kê',
    tags: ['Correlation', 'Causation', 'Tương quan', 'Nhân quả'],
    views: 389,
    comments: 21,
    featured: false
  },
  {
    id: 'fallback-11',
    title: 'P-value: Con Số "Ma Thuật" 0.05 Có Ý Nghĩa Gì?',
    excerpt: 'P-value là gì? Tại sao p < 0.05 là "có ý nghĩa"? Giải thích đơn giản về ý nghĩa thống kê và những hiểu lầm phổ biến.',
    content: '',
    author: {
      name: 'NCSKIT Team',
      avatar: undefined
    },
    publishedAt: new Date(Date.now() - 950400000).toISOString(),
    readTime: 7,
    category: 'Thống Kê',
    tags: ['P-value', 'Ý nghĩa thống kê', 'Kiểm định giả thuyết', 'Significance'],
    views: 467,
    comments: 29,
    featured: false
  },
  {
    id: 'fallback-12',
    title: 'Cỡ Mẫu: Cần Bao Nhiêu Người Tham Gia Khảo Sát?',
    excerpt: 'Cỡ mẫu tối thiểu là bao nhiêu? Công thức tính cỡ mẫu cho các phương pháp khác nhau. Hướng dẫn xác định n cho nghiên cứu của bạn.',
    content: '',
    author: {
      name: 'NCSKIT Team',
      avatar: undefined
    },
    publishedAt: new Date(Date.now() - 1036800000).toISOString(),
    readTime: 9,
    category: 'Phương Pháp Nghiên Cứu',
    tags: ['Cỡ mẫu', 'Sample size', 'Thiết kế nghiên cứu', 'Power analysis'],
    views: 378,
    comments: 23,
    featured: false
  }
];

export const fallbackCategories = [
  'Tất cả',
  'Giới Thiệu',
  'Phương Pháp Nghiên Cứu',
  'Phân Tích Dữ Liệu',
  'Thống Kê'
];
