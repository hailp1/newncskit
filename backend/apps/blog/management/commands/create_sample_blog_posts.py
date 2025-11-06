from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.blog.models import BlogPost, BlogCategory, BlogTag

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample blog posts for testing'

    def handle(self, *args, **options):
        # Create or get admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@ncskit.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True
            }
        )
        
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Created admin user'))

        # Create categories
        categories_data = [
            {
                'name': 'Phương pháp nghiên cứu',
                'slug': 'phuong-phap-nghien-cuu',
                'description': 'Các phương pháp và kỹ thuật nghiên cứu khoa học',
                'color': '#3B82F6'
            },
            {
                'name': 'Thống kê',
                'slug': 'thong-ke',
                'description': 'Phân tích thống kê và xử lý dữ liệu',
                'color': '#10B981'
            },
            {
                'name': 'Xu hướng',
                'slug': 'xu-huong',
                'description': 'Xu hướng mới trong nghiên cứu và công nghệ',
                'color': '#F59E0B'
            },
            {
                'name': 'Đạo đức',
                'slug': 'dao-duc',
                'description': 'Đạo đức nghiên cứu và bảo vệ dữ liệu',
                'color': '#EF4444'
            }
        ]

        categories = {}
        for cat_data in categories_data:
            category, created = BlogCategory.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            categories[cat_data['slug']] = category
            if created:
                self.stdout.write(f'Created category: {category.name}')

        # Create tags
        tags_data = [
            'Thiết kế khảo sát', 'Tỷ lệ phản hồi', 'Chất lượng dữ liệu',
            'Phân tích thống kê', 'Nghiên cứu xã hội', 'Công nghệ',
            'Đạo đức nghiên cứu', 'Quyền riêng tư', 'Hợp tác',
            'Quản lý dự án', 'Phương pháp luận', 'Tương lai'
        ]

        tags = {}
        for tag_name in tags_data:
            tag, created = BlogTag.objects.get_or_create(
                name=tag_name,
                defaults={
                    'slug': tag_name.lower().replace(' ', '-'),
                    'description': f'Bài viết về {tag_name.lower()}'
                }
            )
            tags[tag_name] = tag
            if created:
                self.stdout.write(f'Created tag: {tag.name}')

        # Create blog posts
        posts_data = [
            {
                'title': 'Kỹ thuật thiết kế khảo sát nâng cao để tăng tỷ lệ phản hồi',
                'slug': 'ky-thuat-thiet-ke-khao-sat-nang-cao',
                'excerpt': 'Tìm hiểu cách thiết kế khảo sát thu hút người tham gia và cải thiện chất lượng dữ liệu thông qua các phương pháp và thực tiễn tốt nhất đã được chứng minh.',
                'content': '''
<h2>Giới thiệu</h2>
<p>Thiết kế khảo sát vừa là nghệ thuật vừa là khoa học. Cách bạn xây dựng câu hỏi, cấu trúc khảo sát và trình bày cho người tham gia có thể tác động mạnh mẽ đến tỷ lệ phản hồi và chất lượng dữ liệu.</p>

<h2>Hiểu về các yếu tố ảnh hưởng đến tỷ lệ phản hồi</h2>
<p>Trước khi đi sâu vào các kỹ thuật cụ thể, điều quan trọng là phải hiểu những gì ảnh hưởng đến tỷ lệ phản hồi:</p>
<ul>
  <li><strong>Độ dài khảo sát:</strong> Khảo sát ngắn hơn thường có tỷ lệ hoàn thành cao hơn</li>
  <li><strong>Tính rõ ràng của câu hỏi:</strong> Câu hỏi rõ ràng, không mơ hồ giảm tỷ lệ bỏ dở</li>
  <li><strong>Thiết kế trực quan:</strong> Thiết kế chuyên nghiệp, sạch sẽ xây dựng lòng tin</li>
  <li><strong>Tối ưu hóa di động:</strong> Thiết yếu trong thế giới ưu tiên di động ngày nay</li>
</ul>

<h2>Chiến lược thiết kế câu hỏi nâng cao</h2>
<h3>1. Tiết lộ dần dần</h3>
<p>Thay vì làm choáng ngợp người tham gia với tất cả câu hỏi cùng một lúc, hãy sử dụng kỹ thuật tiết lộ dần dần để hiển thị câu hỏi dựa trên câu trả lời trước đó.</p>

<h3>2. Sắp xếp câu hỏi thông minh</h3>
<p>Thứ tự câu hỏi của bạn có thể ảnh hưởng đáng kể đến phản hồi:</p>
<ul>
  <li>Bắt đầu với những câu hỏi dễ, hấp dẫn</li>
  <li>Đặt câu hỏi nhạy cảm ở giữa</li>
  <li>Kết thúc với thông tin nhân khẩu học</li>
</ul>

<h2>Kết luận</h2>
<p>Việc triển khai các kỹ thuật thiết kế khảo sát nâng cao này đòi hỏi lập kế hoạch và kiểm tra cẩn thận, nhưng kết quả xứng đáng với nỗ lực.</p>
                ''',
                'category': 'phuong-phap-nghien-cuu',
                'tags': ['Thiết kế khảo sát', 'Tỷ lệ phản hồi', 'Chất lượng dữ liệu'],
                'status': 'published',
                'reading_time': 8,
                'seo_score': 85
            },
            {
                'title': 'Thực tiễn tốt nhất trong phân tích thống kê nghiên cứu xã hội',
                'slug': 'thuc-tien-tot-nhat-phan-tich-thong-ke',
                'excerpt': 'Hướng dẫn toàn diện về các phương pháp thống kê thường được sử dụng trong nghiên cứu khoa học xã hội, với các ví dụ thực tế và cách diễn giải.',
                'content': '''
<h2>Giới thiệu về phân tích thống kê</h2>
<p>Phân tích thống kê là công cụ quan trọng trong nghiên cứu xã hội, giúp chúng ta hiểu và diễn giải dữ liệu một cách khoa học.</p>

<h2>Các phương pháp thống kê cơ bản</h2>
<h3>1. Thống kê mô tả</h3>
<p>Thống kê mô tả giúp tóm tắt và mô tả các đặc điểm cơ bản của dữ liệu:</p>
<ul>
  <li>Trung bình, trung vị, mode</li>
  <li>Độ lệch chuẩn và phương sai</li>
  <li>Phân phối tần số</li>
</ul>

<h3>2. Thống kê suy luận</h3>
<p>Thống kê suy luận cho phép chúng ta rút ra kết luận về tổng thể từ mẫu:</p>
<ul>
  <li>Kiểm định giả thuyết</li>
  <li>Khoảng tin cậy</li>
  <li>Phân tích tương quan và hồi quy</li>
</ul>

<h2>Lưu ý quan trọng</h2>
<p>Khi thực hiện phân tích thống kê, cần chú ý đến các giả định của từng phương pháp và đảm bảo dữ liệu đáp ứng các điều kiện cần thiết.</p>
                ''',
                'category': 'thong-ke',
                'tags': ['Phân tích thống kê', 'Nghiên cứu xã hội', 'Phương pháp luận'],
                'status': 'published',
                'reading_time': 12,
                'seo_score': 78
            },
            {
                'title': 'Tương lai của nghiên cứu trực tuyến: Xu hướng và dự đoán',
                'slug': 'tuong-lai-nghien-cuu-truc-tuyen',
                'excerpt': 'Khám phá các xu hướng mới nổi trong phương pháp nghiên cứu số và ý nghĩa của chúng đối với các nhà nghiên cứu trong thập kỷ tới.',
                'content': '''
<h2>Bối cảnh nghiên cứu trực tuyến hiện tại</h2>
<p>Nghiên cứu trực tuyến đã trở thành xu hướng chủ đạo, đặc biệt sau đại dịch COVID-19. Công nghệ đã mở ra nhiều cơ hội mới cho việc thu thập và phân tích dữ liệu.</p>

<h2>Các xu hướng nổi bật</h2>
<h3>1. Trí tuệ nhân tạo trong nghiên cứu</h3>
<p>AI đang thay đổi cách chúng ta tiếp cận nghiên cứu:</p>
<ul>
  <li>Phân tích dữ liệu tự động</li>
  <li>Nhận dạng mẫu phức tạp</li>
  <li>Dự đoán xu hướng</li>
</ul>

<h3>2. Big Data và Analytics</h3>
<p>Khả năng xử lý lượng dữ liệu lớn mở ra những cơ hội nghiên cứu mới:</p>
<ul>
  <li>Phân tích hành vi người dùng</li>
  <li>Nghiên cứu xu hướng xã hội</li>
  <li>Dự báo thị trường</li>
</ul>

<h3>3. Nghiên cứu đa phương tiện</h3>
<p>Tích hợp nhiều loại dữ liệu khác nhau:</p>
<ul>
  <li>Video và audio</li>
  <li>Hình ảnh và đồ họa</li>
  <li>Dữ liệu cảm biến</li>
</ul>

<h2>Thách thức và cơ hội</h2>
<p>Mặc dù có nhiều cơ hội, nghiên cứu trực tuyến cũng đối mặt với các thách thức về đạo đức, quyền riêng tư và chất lượng dữ liệu.</p>
                ''',
                'category': 'xu-huong',
                'tags': ['Công nghệ', 'Phương pháp luận', 'Tương lai'],
                'status': 'published',
                'reading_time': 6,
                'seo_score': 92
            },
            {
                'title': 'Cân nhắc đạo đức trong nghiên cứu khảo sát số',
                'slug': 'can-nhac-dao-duc-nghien-cuu-so',
                'excerpt': 'Hiểu về các tác động đạo đức của việc thu thập dữ liệu số và cách đảm bảo quyền riêng tư và sự đồng ý của người tham gia.',
                'content': '''
<h2>Tầm quan trọng của đạo đức nghiên cứu</h2>
<p>Trong thời đại số, việc bảo vệ quyền riêng tư và đảm bảo đạo đức nghiên cứu trở nên quan trọng hơn bao giờ hết.</p>

<h2>Các nguyên tắc đạo đức cơ bản</h2>
<h3>1. Sự đồng ý có thông tin</h3>
<p>Người tham gia phải hiểu rõ:</p>
<ul>
  <li>Mục đích nghiên cứu</li>
  <li>Cách dữ liệu được sử dụng</li>
  <li>Quyền từ chối tham gia</li>
</ul>

<h3>2. Bảo mật và quyền riêng tư</h3>
<p>Đảm bảo an toàn dữ liệu:</p>
<ul>
  <li>Mã hóa dữ liệu</li>
  <li>Ẩn danh hóa thông tin</li>
  <li>Lưu trữ an toàn</li>
</ul>

<h3>3. Minh bạch và trách nhiệm</h3>
<p>Nghiên cứu viên cần:</p>
<ul>
  <li>Công khai phương pháp</li>
  <li>Báo cáo kết quả trung thực</li>
  <li>Chịu trách nhiệm về tác động</li>
</ul>

<h2>Thách thức trong môi trường số</h2>
<p>Nghiên cứu số đặt ra những thách thức mới về đạo đức, đòi hỏi các tiêu chuẩn và quy định được cập nhật liên tục.</p>
                ''',
                'category': 'dao-duc',
                'tags': ['Đạo đức nghiên cứu', 'Quyền riêng tư', 'Phương pháp luận'],
                'status': 'published',
                'reading_time': 10,
                'seo_score': 88
            }
        ]

        for post_data in posts_data:
            # Get category and tags
            category = categories[post_data['category']]
            post_tags = [tags[tag_name] for tag_name in post_data['tags']]
            
            # Remove category and tags from post_data for creation
            category_slug = post_data.pop('category')
            tag_names = post_data.pop('tags')
            
            # Create or update post
            post, created = BlogPost.objects.get_or_create(
                slug=post_data['slug'],
                defaults={
                    **post_data,
                    'author': admin_user,
                    'published_at': timezone.now(),
                    'word_count': len(post_data['content'].split()),
                }
            )
            
            if created:
                # Add category and tags
                post.categories.add(category)
                post.tags.set(post_tags)
                post.save()
                
                self.stdout.write(f'Created blog post: {post.title}')
            else:
                self.stdout.write(f'Blog post already exists: {post.title}')

        self.stdout.write(self.style.SUCCESS('Successfully created sample blog posts'))