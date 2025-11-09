from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.blog.models import BlogPost, BlogCategory, BlogTag

User = get_user_model()

class Command(BaseCommand):
    help = 'Create NCSKit introduction blog post'

    def handle(self, *args, **options):
        # Get or create admin user
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@ncskit.com',
                password='admin123',
                first_name='Admin',
                last_name='NCSKit'
            )
            self.stdout.write(self.style.SUCCESS('Created admin user'))

        # Get or create category
        category, _ = BlogCategory.objects.get_or_create(
            slug='gioi-thieu',
            defaults={
                'name': 'Giới thiệu',
                'description': 'Giới thiệu về NCSKit và các tính năng',
                'color': '#3B82F6',
                'icon': 'info'
            }
        )

        # Get or create tags
        tag_names = ['NCSKit', 'Giới thiệu', 'Nghiên cứu', 'Khảo sát', 'Phân tích dữ liệu']
        tags = []
        for tag_name in tag_names:
            tag, _ = BlogTag.objects.get_or_create(
                name=tag_name,
                defaults={
                    'slug': tag_name.lower().replace(' ', '-'),
                    'description': f'Bài viết về {tag_name}'
                }
            )
            tags.append(tag)

        # Create the blog post content
        content = '''
<div class="blog-intro">
    <p class="lead">Chào mừng bạn đến với NCSKit - nơi nghiên cứu khảo sát trở nên dễ dàng và thú vị hơn bao giờ hết! 🎉</p>
</div>

<h2>🤔 NCSKit là gì?</h2>

<p>Hãy tưởng tượng bạn đang làm một bài nghiên cứu về "Mức độ hài lòng của sinh viên về thư viện trường". Bạn có 500 phiếu khảo sát với 30 câu hỏi. Giờ bạn phải:</p>

<ul>
    <li>📊 Nhập dữ liệu vào Excel (mất 2 ngày)</li>
    <li>🧹 Làm sạch dữ liệu, tìm lỗi (mất 1 ngày)</li>
    <li>📈 Phân tích bằng SPSS (mất 3 ngày học lệnh)</li>
    <li>📝 Viết báo cáo (mất 2 ngày)</li>
    <li>😱 Tổng cộng: 1 tuần + stress vô hạn!</li>
</ul>

<p><strong>Với NCSKit?</strong> Chỉ cần 2 giờ! ⚡</p>

<div class="highlight-box">
    <h3>✨ NCSKit = Trợ lý nghiên cứu thông minh của bạn</h3>
    <p>Một nền tảng tích hợp đầy đủ giúp bạn từ A đến Z: Tạo khảo sát → Thu thập dữ liệu → Phân tích → Xuất báo cáo đẹp!</p>
</div>

<h2>🎯 Tại sao NCSKit lại "xịn" thế?</h2>

<h3>1. 🚀 Upload và Phân tích Tự động</h3>

<p>Bạn có file CSV từ Google Forms? Chỉ cần kéo thả vào NCSKit:</p>

<div class="example-box">
    <p><strong>Ví dụ thực tế:</strong></p>
    <ol>
        <li>Upload file "khao_sat_sinh_vien.csv" (500 dòng, 30 cột)</li>
        <li>NCSKit tự động:
            <ul>
                <li>✅ Phát hiện 15 câu hỏi về "Chất lượng dịch vụ"</li>
                <li>✅ Nhóm 8 câu hỏi về "Cơ sở vật chất"</li>
                <li>✅ Tìm 3 biến nhân khẩu học (tuổi, giới tính, khoa)</li>
                <li>✅ Phát hiện 12 dòng có dữ liệu thiếu</li>
            </ul>
        </li>
        <li>Thời gian: <strong>30 giây</strong> ⚡</li>
    </ol>
</div>

<h3>2. 🧠 AI Thông minh - Hiểu ý bạn</h3>

<p>NCSKit không chỉ đọc dữ liệu, mà còn <em>hiểu</em> dữ liệu!</p>

<div class="example-box">
    <p><strong>Ví dụ:</strong> Bạn có các câu hỏi:</p>
    <ul>
        <li>"Thư viện có đủ sách không?" (Likert 1-5)</li>
        <li>"Không gian học tập thoải mái?" (Likert 1-5)</li>
        <li>"Nhân viên thân thiện?" (Likert 1-5)</li>
    </ul>
    
    <p><strong>NCSKit tự động nhận biết:</strong></p>
    <ul>
        <li>✨ Đây là nhóm "Chất lượng dịch vụ thư viện"</li>
        <li>✨ Có thể tính Cronbach's Alpha để kiểm tra độ tin cậy</li>
        <li>✨ Nên dùng phân tích hồi quy để xem yếu tố nào ảnh hưởng nhất</li>
    </ul>
</div>

<h3>3. 📊 Phân tích Chuyên nghiệp - Không cần code</h3>

<p>Bạn không cần biết R hay Python. NCSKit có sẵn:</p>

<table class="feature-table">
    <tr>
        <th>Phân tích</th>
        <th>Khi nào dùng?</th>
        <th>Ví dụ</th>
    </tr>
    <tr>
        <td>📈 Thống kê mô tả</td>
        <td>Tổng quan dữ liệu</td>
        <td>"Tuổi trung bình: 21, 60% nữ"</td>
    </tr>
    <tr>
        <td>🔍 Cronbach's Alpha</td>
        <td>Kiểm tra độ tin cậy</td>
        <td>"Alpha = 0.89 → Thang đo tốt!"</td>
    </tr>
    <tr>
        <td>📊 T-test / ANOVA</td>
        <td>So sánh nhóm</td>
        <td>"Nam vs Nữ có khác biệt không?"</td>
    </tr>
    <tr>
        <td>🎯 Hồi quy</td>
        <td>Tìm yếu tố ảnh hưởng</td>
        <td>"Cơ sở vật chất ảnh hưởng 45%"</td>
    </tr>
    <tr>
        <td>🌟 EFA / CFA</td>
        <td>Phân tích nhân tố</td>
        <td>"Có 3 nhân tố chính"</td>
    </tr>
</table>

<h3>4. 🎨 Báo cáo Đẹp - Xuất Ngay</h3>

<p>Không cần copy-paste từ SPSS sang Word nữa!</p>

<div class="example-box">
    <p><strong>NCSKit tự động tạo:</strong></p>
    <ul>
        <li>📄 Báo cáo PDF chuyên nghiệp (có biểu đồ, bảng số liệu)</li>
        <li>📊 File Excel với tất cả kết quả</li>
        <li>📈 Biểu đồ tương tác (có thể zoom, filter)</li>
        <li>📋 Bảng APA format chuẩn (copy vào luận văn luôn!)</li>
    </ul>
</div>

<h2>🎪 Câu chuyện thực tế</h2>

<div class="story-box">
    <h3>📖 Câu chuyện của Minh - Sinh viên năm 3</h3>
    
    <p><strong>Trước khi dùng NCSKit:</strong></p>
    <blockquote>
        "Mình làm khóa luận về hành vi mua sắm online. Thu thập được 300 phiếu khảo sát, 
        nhưng mất 1 tuần để nhập dữ liệu vào SPSS. Sau đó lại mất 3 ngày để học cách chạy 
        phân tích hồi quy. Khi ra kết quả, mình không biết cách giải thích... 😭"
    </blockquote>
    
    <p><strong>Sau khi dùng NCSKit:</strong></p>
    <blockquote>
        "Mình upload file CSV từ Google Forms lên NCSKit. Chỉ sau 5 phút, hệ thống đã:
        <ul>
            <li>✅ Tự động nhóm 20 câu hỏi thành 4 nhóm</li>
            <li>✅ Tính Cronbach's Alpha (0.87 - tốt!)</li>
            <li>✅ Chạy hồi quy và cho biết 'Giá cả' ảnh hưởng 52%</li>
            <li>✅ Tạo báo cáo PDF 15 trang với biểu đồ đẹp</li>
        </ul>
        Mình chỉ cần đọc và viết phần bàn luận. Tiết kiệm được 2 tuần! 🎉"
    </blockquote>
</div>

<h2>🚀 Bắt đầu với NCSKit như thế nào?</h2>

<div class="steps-box">
    <h3>3 bước siêu đơn giản:</h3>
    
    <div class="step">
        <h4>Bước 1: Đăng ký tài khoản (30 giây)</h4>
        <p>Vào <a href="https://app.ncskit.org">app.ncskit.org</a> → Đăng ký → Xác nhận email</p>
    </div>
    
    <div class="step">
        <h4>Bước 2: Upload dữ liệu (1 phút)</h4>
        <p>Vào "Data Analysis" → Kéo thả file CSV/Excel → Đợi hệ thống phân tích</p>
    </div>
    
    <div class="step">
        <h4>Bước 3: Nhận kết quả (5 phút)</h4>
        <p>Chọn phân tích muốn chạy → Click "Run" → Tải báo cáo PDF</p>
    </div>
</div>

<h2>💡 Các tính năng "xịn xò" khác</h2>

<h3>🎯 Survey Campaigns - Tạo khảo sát có thưởng</h3>

<div class="feature-detail">
    <p>Bạn muốn thu thập 500 phản hồi nhưng sợ không ai làm?</p>
    <ul>
        <li>🎁 Tạo campaign với phần thưởng token</li>
        <li>🎯 Nhắm mục tiêu: "Sinh viên, 18-25 tuổi, TP.HCM"</li>
        <li>📊 Theo dõi real-time: Đã có bao nhiêu người làm?</li>
        <li>💰 Tự động trả thưởng khi hoàn thành</li>
    </ul>
    
    <p><strong>Ví dụ:</strong> "Khảo sát về cafe - Thưởng 50 token (= 10.000đ) - Cần 200 người"</p>
</div>

<h3>✍️ Smart Editor - Viết bài nghiên cứu có AI hỗ trợ</h3>

<div class="feature-detail">
    <p>Viết phần Literature Review mà không biết bắt đầu từ đâu?</p>
    <ul>
        <li>🤖 AI gợi ý cấu trúc bài viết</li>
        <li>📚 Tìm tài liệu tham khảo liên quan</li>
        <li>✨ Paraphrase và cải thiện văn phong</li>
        <li>📋 Tự động format APA/MLA</li>
    </ul>
</div>

<h3>🔍 Journal Finder - Tìm tạp chí phù hợp</h3>

<div class="feature-detail">
    <p>Viết xong bài mà không biết gửi đâu?</p>
    <ul>
        <li>🎯 Nhập abstract → AI gợi ý 10 tạp chí phù hợp</li>
        <li>📊 Xem impact factor, acceptance rate</li>
        <li>⏱️ Thời gian review trung bình</li>
        <li>💰 Chi phí xuất bản</li>
    </ul>
</div>

<h2>🎁 Giá cả như thế nào?</h2>

<div class="pricing-box">
    <h3>🆓 Free Plan - Cho sinh viên</h3>
    <ul>
        <li>✅ 5 projects/tháng</li>
        <li>✅ Upload file tối đa 10MB</li>
        <li>✅ Phân tích cơ bản (thống kê mô tả, t-test, ANOVA)</li>
        <li>✅ Xuất báo cáo PDF</li>
    </ul>
    
    <h3>⭐ Pro Plan - 99.000đ/tháng</h3>
    <ul>
        <li>✅ Unlimited projects</li>
        <li>✅ Upload file tối đa 100MB</li>
        <li>✅ Tất cả phân tích (EFA, CFA, SEM, Regression...)</li>
        <li>✅ AI Smart Editor</li>
        <li>✅ Priority support</li>
    </ul>
    
    <h3>🏢 Team Plan - 499.000đ/tháng</h3>
    <ul>
        <li>✅ Tất cả tính năng Pro</li>
        <li>✅ 5 thành viên</li>
        <li>✅ Collaboration tools</li>
        <li>✅ Custom branding</li>
        <li>✅ Dedicated support</li>
    </ul>
</div>

<h2>🎉 Kết luận</h2>

<p>NCSKit không chỉ là một công cụ - đó là <strong>người bạn đồng hành</strong> trong hành trình nghiên cứu của bạn!</p>

<div class="cta-box">
    <h3>🚀 Sẵn sàng bắt đầu chưa?</h3>
    <p>Đăng ký ngay hôm nay và nhận <strong>14 ngày dùng thử Pro Plan miễn phí!</strong></p>
    <p><a href="https://app.ncskit.org/auth/register" class="cta-button">Đăng ký miễn phí →</a></p>
</div>

<div class="help-box">
    <h3>❓ Cần hỗ trợ?</h3>
    <ul>
        <li>📧 Email: support@ncskit.com</li>
        <li>💬 Live chat: Góc phải màn hình</li>
        <li>📚 Tài liệu: <a href="https://docs.ncskit.org">docs.ncskit.org</a></li>
        <li>🎥 Video hướng dẫn: <a href="https://youtube.com/@ncskit">YouTube</a></li>
    </ul>
</div>

<p class="closing">Chúc bạn nghiên cứu vui vẻ và thành công! 🎓✨</p>

<style>
.blog-intro { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin: 2rem 0; }
.lead { font-size: 1.25rem; font-weight: 500; }
.highlight-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px; }
.example-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 1.5rem; margin: 1.5rem 0; border-radius: 8px; }
.story-box { background: #f3e8ff; border: 2px solid #a855f7; padding: 2rem; margin: 2rem 0; border-radius: 12px; }
.steps-box { background: #ecfdf5; padding: 2rem; margin: 2rem 0; border-radius: 12px; }
.step { background: white; padding: 1.5rem; margin: 1rem 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.feature-detail { background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 1.5rem 0; border-radius: 8px; }
.pricing-box { background: #f8fafc; padding: 2rem; margin: 2rem 0; border-radius: 12px; border: 2px solid #e2e8f0; }
.cta-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; margin: 2rem 0; border-radius: 12px; text-align: center; }
.cta-button { background: white; color: #667eea; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; }
.help-box { background: #f0fdf4; border: 2px solid #10b981; padding: 1.5rem; margin: 2rem 0; border-radius: 12px; }
.closing { font-size: 1.25rem; text-align: center; margin: 2rem 0; font-weight: 500; }
.feature-table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
.feature-table th, .feature-table td { padding: 1rem; border: 1px solid #e5e7eb; text-align: left; }
.feature-table th { background: #f3f4f6; font-weight: 600; }
blockquote { border-left: 4px solid #9ca3af; padding-left: 1rem; margin: 1rem 0; font-style: italic; color: #4b5563; }
</style>
'''

        # Create or update the blog post
        post, created = BlogPost.objects.update_or_create(
            slug='gioi-thieu-ncskit-nen-tang-nghien-cuu-thong-minh',
            defaults={
                'title': 'Giới thiệu NCSKit - Nền tảng nghiên cứu thông minh cho mọi người! 🚀',
                'excerpt': 'Khám phá NCSKit - trợ lý nghiên cứu AI giúp bạn từ tạo khảo sát, thu thập dữ liệu, đến phân tích và xuất báo cáo chỉ trong vài phút. Không cần biết code, không cần stress!',
                'content': content,
                'author': admin_user,
                'status': 'published',
                'published_at': timezone.now(),
                'meta_title': 'NCSKit - Nền tảng nghiên cứu khảo sát thông minh | Phân tích dữ liệu tự động',
                'meta_description': 'NCSKit giúp sinh viên và nhà nghiên cứu tạo khảo sát, thu thập và phân tích dữ liệu tự động với AI. Tiết kiệm thời gian, không cần code. Dùng thử miễn phí!',
                'focus_keyword': 'NCSKit',
                'word_count': len(content.split()),
                'reading_time': len(content.split()) // 200,
                'seo_score': 85,
                'readability_score': 75
            }
        )

        # Add categories and tags
        post.categories.add(category)
        post.tags.set(tags)

        if created:
            self.stdout.write(self.style.SUCCESS(f'✅ Created blog post: {post.title}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'✅ Updated blog post: {post.title}'))

        self.stdout.write(self.style.SUCCESS(f'📝 Post URL: /blog/{post.slug}'))
        self.stdout.write(self.style.SUCCESS(f'🎉 Done! Visit your blog to see the post.'))
