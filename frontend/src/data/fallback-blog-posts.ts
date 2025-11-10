// Fallback blog posts - Hiển thị khi database trống
// Giúp trang load nhanh và luôn có nội dung

export const fallbackBlogPosts = [
  {
    id: 'fallback-1',
    title: 'Cronbach\'s Alpha: "Thước Đo Độ Tin Cậy" Của Bảng Hỏi',
    excerpt: 'Cronbach\'s Alpha là gì? Tại sao nó quan trọng trong nghiên cứu? Hướng dẫn chi tiết với ví dụ thực tế, dễ hiểu cho người mới bắt đầu.',
    content: '',
    author: {
      name: 'NCSKIT Team',
      avatar: undefined
    },
    publishedAt: new Date().toISOString(),
    readTime: 8,
    category: 'Phương Pháp Nghiên Cứu',
    tags: ['Cronbach\'s Alpha', 'Độ tin cậy', 'Thang đo', 'SPSS'],
    views: 156,
    comments: 12,
    featured: true
  },
  {
    id: 'fallback-2',
    title: 'Phân Tích Hồi Quy: "Bói Toán" Khoa Học Hay Là Gì?',
    excerpt: 'Phân tích hồi quy là gì? Làm sao dự đoán tương lai từ dữ liệu? Hướng dẫn từ A-Z với ví dụ thực tế, không cần biết toán phức tạp!',
    content: '',
    author: {
      name: 'NCSKIT Team',
      avatar: undefined
    },
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    readTime: 10,
    category: 'Phân Tích Dữ Liệu',
    tags: ['Hồi quy', 'Regression', 'Dự đoán', 'SPSS'],
    views: 203,
    comments: 18,
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
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    readTime: 12,
    category: 'Phương Pháp Nghiên Cứu',
    tags: ['EFA', 'CFA', 'Factor Analysis', 'AMOS'],
    views: 178,
    comments: 15,
    featured: false
  }
];

export const fallbackCategories = [
  'Tất cả',
  'Phương Pháp Nghiên Cứu',
  'Phân Tích Dữ Liệu',
  'Thống Kê'
];
