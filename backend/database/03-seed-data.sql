-- Seed data for NCSKIT
\c ncskit;

-- Insert business domains
INSERT INTO business_domains (name, description) VALUES
('Marketing Research', 'Nghiên cứu thị trường và hành vi người tiêu dùng'),
('Brand Management', 'Quản lý thương hiệu và định vị sản phẩm'),
('Digital Marketing', 'Marketing số và truyền thông trực tuyến'),
('Customer Experience', 'Trải nghiệm khách hàng và dịch vụ'),
('Product Development', 'Phát triển sản phẩm và đổi mới')
ON CONFLICT DO NOTHING;

-- Insert marketing models
INSERT INTO marketing_models (name, description, domain_id, model_structure) VALUES
('Customer Satisfaction Model', 'Mô hình đo lường sự hài lòng khách hàng', 1, '{"constructs": ["Service Quality", "Customer Satisfaction", "Loyalty"], "relationships": []}'),
('Brand Equity Model', 'Mô hình đánh giá giá trị thương hiệu', 2, '{"constructs": ["Brand Awareness", "Brand Image", "Brand Loyalty"], "relationships": []}'),
('Technology Acceptance Model', 'Mô hình chấp nhận công nghệ', 3, '{"constructs": ["Perceived Usefulness", "Perceived Ease of Use", "Intention to Use"], "relationships": []}'),
('Service Quality Model', 'Mô hình chất lượng dịch vụ SERVQUAL', 4, '{"constructs": ["Tangibles", "Reliability", "Responsiveness", "Assurance", "Empathy"], "relationships": []}'),
('Innovation Adoption Model', 'Mô hình chấp nhận đổi mới', 5, '{"constructs": ["Innovation Characteristics", "Adoption Intention", "Usage Behavior"], "relationships": []}')
ON CONFLICT DO NOTHING;

-- Create admin user (password: admin123)
INSERT INTO users (id, email, password_hash, full_name, role, is_active, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@ncskit.org', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G', 'NCSKIT Admin', 'admin', true, true)
ON CONFLICT (email) DO NOTHING;



-- Insert blog posts
INSERT INTO blog_posts (id, title, slug, content, excerpt, author_id, category, tags, is_published, published_at) VALUES
(
    '550e8400-e29b-41d4-a716-446655440100',
    'Phân tích nhân tố khám phá (EFA) và khẳng định (CFA) trong nghiên cứu marketing',
    'phan-tich-nhan-to-efa-cfa',
    '# Phân tích nhân tố khám phá (EFA) và khẳng định (CFA)

Phân tích nhân tố là một kỹ thuật thống kê quan trọng trong nghiên cứu marketing, giúp nghiên cứu viên khám phá và xác nhận cấu trúc tiềm ẩn của dữ liệu.

## EFA - Exploratory Factor Analysis

EFA được sử dụng để khám phá cấu trúc nhân tố tiềm ẩn trong dữ liệu mà không có giả định trước về số lượng hay bản chất của các nhân tố.

### Các bước thực hiện EFA:

1. **Kiểm tra tính phù hợp của dữ liệu**
   - KMO (Kaiser-Meyer-Olkin) ≥ 0.5
   - Bartlett''s Test có ý nghĩa thống kê (p < 0.05)

2. **Xác định số lượng nhân tố**
   - Eigenvalue > 1
   - Scree plot
   - Phương sai tích lũy ≥ 50%

3. **Xoay nhân tố**
   - Varimax (xoay vuông góc)
   - Promax (xoay xiên)

## CFA - Confirmatory Factor Analysis

CFA được sử dụng để kiểm định một mô hình nhân tố đã được xác định trước, thường dựa trên lý thuyết hoặc kết quả EFA.

### Các chỉ số đánh giá mô hình CFA:

- **Chi-square/df**: < 3 (tốt), < 5 (chấp nhận được)
- **CFI**: > 0.9 (tốt), > 0.95 (rất tốt)
- **TLI**: > 0.9 (tốt), > 0.95 (rất tốt)
- **RMSEA**: < 0.08 (tốt), < 0.05 (rất tốt)
- **SRMR**: < 0.08 (tốt), < 0.05 (rất tốt)

## Ứng dụng trong nghiên cứu Marketing

### 1. Phát triển thang đo
- Xây dựng thang đo mới cho các khái niệm marketing
- Kiểm định tính đơn hướng của thang đo

### 2. Kiểm định mô hình lý thuyết
- Xác nhận cấu trúc của các mô hình marketing nổi tiếng
- Điều chỉnh mô hình cho phù hợp với bối cảnh nghiên cứu

### 3. So sánh nhóm
- Kiểm định tính bất biến đo lường giữa các nhóm
- Phân tích đa nhóm (Multi-group analysis)

## Ví dụ thực tế

Trong nghiên cứu về chất lượng dịch vụ, chúng ta có thể sử dụng:

1. **EFA** để khám phá các thành phần chất lượng dịch vụ từ góc nhìn của khách hàng Việt Nam
2. **CFA** để kiểm định mô hình SERVQUAL đã được điều chỉnh

```r
# Ví dụ code R cho EFA
library(psych)
library(GPArotation)

# Thực hiện EFA
efa_result <- fa(data, nfactors = 5, rotate = "varimax")
print(efa_result)

# Kiểm tra KMO và Bartlett
KMO(data)
cortest.bartlett(data)
```

## Kết luận

EFA và CFA là hai kỹ thuật bổ trợ cho nhau trong phân tích dữ liệu marketing. EFA giúp khám phá cấu trúc dữ liệu, trong khi CFA giúp xác nhận và tinh chỉnh mô hình lý thuyết.',
    'Hướng dẫn chi tiết về phân tích nhân tố khám phá (EFA) và khẳng định (CFA) trong nghiên cứu marketing, bao gồm các bước thực hiện và ví dụ thực tế.',
    '550e8400-e29b-41d4-a716-446655440000',
    'Phân tích dữ liệu',
    ARRAY['EFA', 'CFA', 'Factor Analysis', 'SPSS', 'R'],
    true,
    NOW() - INTERVAL '7 days'
),
(
    '550e8400-e29b-41d4-a716-446655440101',
    'Hồi quy toàn diện: Từ cơ bản đến nâng cao trong nghiên cứu marketing',
    'hoi-quy-toan-dien',
    '# Hồi quy toàn diện trong nghiên cứu Marketing

Phân tích hồi quy là một trong những kỹ thuật thống kê quan trọng nhất trong nghiên cứu marketing, giúp chúng ta hiểu mối quan hệ giữa các biến và dự đoán kết quả.

## 1. Hồi quy tuyến tính đơn giản

### Công thức cơ bản:
Y = β₀ + β₁X + ε

Trong đó:
- Y: Biến phụ thuộc
- X: Biến độc lập
- β₀: Hệ số chặn
- β₁: Hệ số góc
- ε: Sai số ngẫu nhiên

### Ví dụ trong Marketing:
Dự đoán doanh số (Y) dựa trên chi phí quảng cáo (X)

## 2. Hồi quy tuyến tính bội

### Mô hình:
Y = β₀ + β₁X₁ + β₂X₂ + ... + βₖXₖ + ε

### Các giả định cần kiểm tra:
1. **Tính tuyến tính**: Mối quan hệ tuyến tính giữa biến độc lập và phụ thuộc
2. **Tính độc lập**: Các quan sát độc lập với nhau
3. **Đồng phương sai**: Phương sai của sai số không đổi
4. **Phân phối chuẩn**: Sai số có phân phối chuẩn
5. **Không đa cộng tuyến**: Các biến độc lập không tương quan cao với nhau

## 3. Hồi quy Logistic

Sử dụng khi biến phụ thuộc là biến định tính (0/1, có/không).

### Công thức:
ln(p/(1-p)) = β₀ + β₁X₁ + β₂X₂ + ... + βₖXₖ

### Ứng dụng trong Marketing:
- Dự đoán khả năng mua hàng của khách hàng
- Phân loại khách hàng trung thành/không trung thành

## 4. Hồi quy đa thức (Polynomial Regression)

Sử dụng khi mối quan hệ không tuyến tính.

### Mô hình bậc 2:
Y = β₀ + β₁X + β₂X² + ε

## 5. Hồi quy Ridge và Lasso

### Ridge Regression:
Thêm penalty term α∑βᵢ² để giảm overfitting

### Lasso Regression:
Thêm penalty term α∑|βᵢ| để lựa chọn biến

## Ứng dụng thực tế trong Marketing

### 1. Phân tích hiệu quả Marketing Mix
```r
# Mô hình Marketing Mix
sales ~ price + advertising + promotion + distribution
```

### 2. Customer Lifetime Value (CLV)
```r
# Dự đoán CLV
clv ~ recency + frequency + monetary + tenure
```

### 3. Phân tích giá
```r
# Mô hình định giá
price ~ brand + quality + features + competition
```

## Đánh giá mô hình

### 1. R-squared (R²)
- Tỷ lệ phương sai được giải thích bởi mô hình
- R² = 1 - (SSres/SStot)

### 2. Adjusted R-squared
- Điều chỉnh cho số lượng biến trong mô hình
- Tránh overfitting khi thêm biến

### 3. AIC/BIC
- Tiêu chí lựa chọn mô hình
- Cân bằng giữa độ phù hợp và độ phức tạp

### 4. Cross-validation
- Kiểm tra khả năng tổng quát hóa của mô hình

## Xử lý các vấn đề thường gặp

### 1. Đa cộng tuyến (Multicollinearity)
- **Phát hiện**: VIF > 10
- **Xử lý**: Loại bỏ biến, PCA, Ridge regression

### 2. Heteroscedasticity
- **Phát hiện**: Breusch-Pagan test
- **Xử lý**: Weighted least squares, robust standard errors

### 3. Autocorrelation
- **Phát hiện**: Durbin-Watson test
- **Xử lý**: Cochrane-Orcutt procedure

## Code R thực tế

```r
# Load libraries
library(car)
library(lmtest)
library(sandwich)

# Hồi quy tuyến tính bội
model <- lm(sales ~ price + advertising + promotion, data = marketing_data)

# Kiểm tra giả định
# 1. Đa cộng tuyến
vif(model)

# 2. Đồng phương sai
bptest(model)

# 3. Phân phối chuẩn của residuals
shapiro.test(residuals(model))

# 4. Tự tương quan
dwtest(model)

# Robust standard errors
coeftest(model, vcov = vcovHC(model, type = "HC1"))
```

## Báo cáo kết quả

### Bảng hồi quy chuẩn:
| Biến | Hệ số | SE | t-value | p-value | VIF |
|------|-------|----|---------|---------|----- |
| Price | -0.85 | 0.12 | -7.08 | <0.001 | 1.23 |
| Advertising | 1.24 | 0.18 | 6.89 | <0.001 | 1.45 |
| Promotion | 0.67 | 0.15 | 4.47 | <0.001 | 1.18 |

### Thống kê mô hình:
- R² = 0.742
- Adjusted R² = 0.738
- F-statistic = 187.3 (p < 0.001)
- n = 200

## Kết luận

Phân tích hồi quy là công cụ mạnh mẽ trong nghiên cứu marketing, nhưng cần:
1. Kiểm tra các giả định cẩn thận
2. Xử lý các vi phạm giả định
3. Diễn giải kết quả trong bối cảnh kinh doanh
4. Xác thực mô hình trên dữ liệu mới',
    'Hướng dẫn toàn diện về phân tích hồi quy trong nghiên cứu marketing, từ cơ bản đến nâng cao, bao gồm các loại hồi quy, kiểm định giả định và ứng dụng thực tế.',
    '550e8400-e29b-41d4-a716-446655440000',
    'Phân tích dữ liệu',
    ARRAY['Regression', 'Statistics', 'Marketing Analytics', 'R', 'Data Analysis'],
    true,
    NOW() - INTERVAL '5 days'
)
ON CONFLICT (slug) DO NOTHING;