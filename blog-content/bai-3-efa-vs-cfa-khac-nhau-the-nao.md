# EFA vs CFA: Hai Anh Em "Phân Tích Nhân Tố" - Giống Nhau Nhưng Khác Biệt!

**Danh mục:** Phương Pháp Nghiên Cứu  
**Tags:** EFA, CFA, Factor Analysis, Phân tích nhân tố, SEM, AMOS, SPSS  
**Thời gian đọc:** 12 phút  
**Tác giả:** NCSKIT Team

---

## Mở Đầu: Câu Chuyện Về Hai Anh Em Thám Tử

Tưởng tượng bạn là một thám tử điều tra vụ án. Có hai cách tiếp cận:

**Thám tử A (EFA):** "Tôi không biết hung thủ là ai. Hãy thu thập tất cả manh mối và xem chúng dẫn đến đâu!" 🔍

**Thám tử B (CFA):** "Tôi nghi ngờ ông X là hung thủ. Hãy kiểm tra xem bằng chứng có khớp với giả thuyết không!" 🎯

Đó chính xác là sự khác biệt giữa **EFA** (Exploratory Factor Analysis) và **CFA** (Confirmatory Factor Analysis)!

---

## EFA và CFA Là Gì? (Giải Thích Không Dùng Thuật Ngữ Khó)

### EFA - "Nhà Thám Hiểm"

**Exploratory Factor Analysis (EFA)** = Phân tích nhân tố khám phá

**Mục đích:** Tìm ra cấu trúc ẩn trong dữ liệu khi bạn CHƯA BIẾT nó là gì.

**Ví dụ:** Bạn có 20 câu hỏi về "hạnh phúc" nhưng không biết:
- Có bao nhiêu chiều của hạnh phúc?
- Câu nào đo chiều nào?

→ Dùng EFA để "khám phá"!

### CFA - "Nhà Kiểm Chứng"

**Confirmatory Factor Analysis (CFA)** = Phân tích nhân tố khẳng định

**Mục đích:** Kiểm tra xem cấu trúc bạn ĐÃ BIẾT có đúng không.

**Ví dụ:** Lý thuyết nói "hạnh phúc" có 3 chiều:
1. Hạnh phúc vật chất
2. Hạnh phúc tinh thần
3. Hạnh phúc xã hội

→ Dùng CFA để "kiểm chứng" lý thuyết này!

---

## Bảng So Sánh Nhanh: EFA vs CFA

| Tiêu chí | EFA 🔍 | CFA 🎯 |
|----------|--------|--------|
| **Mục đích** | Khám phá | Kiểm chứng |
| **Lý thuyết** | Chưa có | Đã có |
| **Câu hỏi** | "Có bao nhiêu nhân tố?" | "Mô hình này có đúng không?" |
| **Khi nào dùng** | Nghiên cứu mới, thang đo mới | Kiểm tra thang đo có sẵn |
| **Output** | Số nhân tố + Câu hỏi thuộc nhân tố nào | Độ phù hợp của mô hình |
| **Công cụ** | SPSS, R | AMOS, Mplus, lavaan (R) |
| **Độ khó** | Dễ hơn ⭐⭐ | Khó hơn ⭐⭐⭐⭐ |

---

## EFA - Phân Tích Nhân Tố Khám Phá

### Khi Nào Dùng EFA?

✅ **Dùng khi:**
- Phát triển thang đo mới
- Chưa có lý thuyết rõ ràng
- Muốn giảm số lượng biến
- Khám phá cấu trúc dữ liệu

❌ **Không dùng khi:**
- Đã có lý thuyết rõ ràng
- Muốn kiểm chứng mô hình
- Cần đo độ phù hợp chính xác

### Ví Dụ Thực Tế: Đo "Sự Hài Lòng Công Việc"

**Bước 1: Thiết kế 15 câu hỏi**

1. Tôi thích công việc hiện tại
2. Lương của tôi hợp lý
3. Đồng nghiệp thân thiện
4. Sếp quan tâm nhân viên
5. Văn phòng thoải mái
6. Có cơ hội thăng tiến
7. Công việc ổn định
8. Lương thưởng đúng hạn
9. Đồng nghiệp hỗ trợ lẫn nhau
10. Sếp công bằng
11. Có chỗ đậu xe
12. Được đào tạo
13. Công ty uy tín
14. Lương cao hơn thị trường
15. Đồng nghiệp vui vẻ

**Bước 2: Thu thập dữ liệu (n=300)**

**Bước 3: Chạy EFA trong SPSS**

```
Analyze → Dimension Reduction → Factor
→ Chọn 15 biến
→ Extraction: Principal Components
→ Rotation: Varimax
→ OK
```

**Bước 4: Kết quả**

```
Total Variance Explained:
Component 1: 35.2% (Eigenvalue = 5.28)
Component 2: 18.7% (Eigenvalue = 2.81)
Component 3: 12.4% (Eigenvalue = 1.86)
Total: 66.3%
```

**Rotated Component Matrix:**

| Câu hỏi | Factor 1 | Factor 2 | Factor 3 |
|---------|----------|----------|----------|
| Câu 2   | .812     | .102     | .089     |
| Câu 8   | .789     | .134     | .112     |
| Câu 14  | .756     | .098     | .145     |
| Câu 3   | .098     | .834     | .102     |
| Câu 9   | .112     | .801     | .089     |
| Câu 15  | .134     | .778     | .123     |
| Câu 4   | .089     | .123     | .845     |
| Câu 10  | .102     | .098     | .812     |
| ...     | ...      | ...      | ...      |

**Bước 5: Đặt tên nhân tố**

- **Factor 1:** "Hài lòng về lương" (Câu 2, 8, 14)
- **Factor 2:** "Hài lòng về đồng nghiệp" (Câu 3, 9, 15)
- **Factor 3:** "Hài lòng về sếp" (Câu 4, 10)

→ Phát hiện: "Sự hài lòng công việc" có 3 chiều!

### Các Chỉ Số Quan Trọng Trong EFA

#### 1. KMO (Kaiser-Meyer-Olkin)

**Ý nghĩa:** Dữ liệu có phù hợp để chạy EFA không?

| KMO | Đánh giá |
|-----|----------|
| 0.9-1.0 | Tuyệt vời 🌟 |
| 0.8-0.9 | Tốt ✅ |
| 0.7-0.8 | Trung bình 👍 |
| 0.6-0.7 | Tạm chấp nhận 🤔 |
| < 0.6 | Không nên dùng ❌ |

**Ví dụ:** KMO = 0.856 → Tốt! ✅

#### 2. Bartlett's Test

**Ý nghĩa:** Các biến có tương quan với nhau không?

- **p < 0.05:** Có tương quan → Dùng EFA được ✅
- **p ≥ 0.05:** Không tương quan → Không nên dùng EFA ❌

#### 3. Eigenvalue

**Ý nghĩa:** Nhân tố này có "đủ mạnh" không?

**Quy tắc:** Eigenvalue > 1 → Giữ nhân tố

**Ví dụ:**
```
Factor 1: Eigenvalue = 5.28 → Giữ ✅
Factor 2: Eigenvalue = 2.81 → Giữ ✅
Factor 3: Eigenvalue = 1.86 → Giữ ✅
Factor 4: Eigenvalue = 0.67 → Bỏ ❌
```

#### 4. Factor Loading

**Ý nghĩa:** Câu hỏi "thuộc về" nhân tố này mức độ nào?

| Loading | Đánh giá |
|---------|----------|
| > 0.7 | Rất tốt 🌟 |
| 0.6-0.7 | Tốt ✅ |
| 0.5-0.6 | Chấp nhận được 👍 |
| 0.4-0.5 | Yếu 🤔 |
| < 0.4 | Xóa ❌ |

**Ví dụ:**
```
Câu 2 → Factor 1: Loading = .812 (Rất tốt!)
Câu 11 → Factor 1: Loading = .234 (Xóa!)
```

---

## CFA - Phân Tích Nhân Tố Khẳng Định

### Khi Nào Dùng CFA?

✅ **Dùng khi:**
- Đã có lý thuyết rõ ràng
- Kiểm tra thang đo có sẵn
- Muốn đo độ phù hợp mô hình
- Chuẩn bị cho SEM

❌ **Không dùng khi:**
- Chưa có lý thuyết
- Thang đo hoàn toàn mới
- Chỉ muốn khám phá

### Ví Dụ Thực Tế: Kiểm Chứng Thang Đo "Hạnh Phúc"

**Bước 1: Lý thuyết có sẵn**

Theo nghiên cứu của Diener (1984), "Hạnh phúc" gồm 3 chiều:
1. **Positive Affect** (Cảm xúc tích cực)
2. **Negative Affect** (Cảm xúc tiêu cực)
3. **Life Satisfaction** (Sự hài lòng cuộc sống)

**Bước 2: Thiết kế mô hình**

```
Hạnh phúc
├── Positive Affect
│   ├── Câu 1: Tôi cảm thấy vui vẻ
│   ├── Câu 2: Tôi cảm thấy hạnh phúc
│   └── Câu 3: Tôi cảm thấy tràn đầy năng lượng
├── Negative Affect
│   ├── Câu 4: Tôi cảm thấy buồn
│   ├── Câu 5: Tôi cảm thấy lo lắng
│   └── Câu 6: Tôi cảm thấy tức giận
└── Life Satisfaction
    ├── Câu 7: Tôi hài lòng với cuộc sống
    ├── Câu 8: Cuộc sống của tôi gần với lý tưởng
    └── Câu 9: Tôi sẽ không thay đổi gì trong cuộc sống
```

**Bước 3: Thu thập dữ liệu (n=400)**

**Bước 4: Chạy CFA trong AMOS**

1. Vẽ mô hình (3 nhân tố, 9 biến quan sát)
2. Kết nối các mũi tên
3. Click "Calculate Estimates"
4. Xem kết quả

**Bước 5: Đánh giá độ phù hợp**

```
Model Fit Indices:
Chi-square = 45.23, df = 24, p = .006
CMIN/df = 1.88
CFI = 0.965
TLI = 0.952
RMSEA = 0.047
SRMR = 0.038
```

**Giải thích:**
- ✅ CMIN/df = 1.88 (< 3) → Tốt!
- ✅ CFI = 0.965 (> 0.95) → Tuyệt vời!
- ✅ TLI = 0.952 (> 0.95) → Tuyệt vời!
- ✅ RMSEA = 0.047 (< 0.06) → Tốt!
- ✅ SRMR = 0.038 (< 0.08) → Tốt!

→ **Kết luận:** Mô hình phù hợp với dữ liệu! ✅

### Các Chỉ Số Độ Phù Hợp Trong CFA

#### 1. Chi-square (χ²)

**Ý nghĩa:** Mô hình có khác biệt với dữ liệu không?

- **p > 0.05:** Mô hình phù hợp ✅
- **p < 0.05:** Mô hình không phù hợp ❌

**Lưu ý:** Chi-square nhạy cảm với cỡ mẫu lớn!

#### 2. CMIN/df (Chi-square/df)

**Ý nghĩa:** Chi-square có quá lớn không?

| CMIN/df | Đánh giá |
|---------|----------|
| < 2 | Tuyệt vời 🌟 |
| 2-3 | Tốt ✅ |
| 3-5 | Chấp nhận được 👍 |
| > 5 | Không tốt ❌ |

#### 3. CFI (Comparative Fit Index)

**Ý nghĩa:** Mô hình tốt hơn mô hình baseline bao nhiêu?

| CFI | Đánh giá |
|-----|----------|
| > 0.95 | Tuyệt vời 🌟 |
| 0.90-0.95 | Tốt ✅ |
| 0.85-0.90 | Chấp nhận được 👍 |
| < 0.85 | Không tốt ❌ |

#### 4. RMSEA (Root Mean Square Error of Approximation)

**Ý nghĩa:** Sai số trung bình của mô hình

| RMSEA | Đánh giá |
|-------|----------|
| < 0.05 | Tuyệt vời 🌟 |
| 0.05-0.08 | Tốt ✅ |
| 0.08-0.10 | Chấp nhận được 👍 |
| > 0.10 | Không tốt ❌ |

#### 5. SRMR (Standardized Root Mean Square Residual)

**Ý nghĩa:** Sai số chuẩn hóa

| SRMR | Đánh giá |
|------|----------|
| < 0.05 | Tuyệt vời 🌟 |
| 0.05-0.08 | Tốt ✅ |
| 0.08-0.10 | Chấp nhận được 👍 |
| > 0.10 | Không tốt ❌ |

---

## Quy Trình: Từ EFA Đến CFA

### Bước 1: EFA (Mẫu 1)

**Mục đích:** Khám phá cấu trúc

**Kết quả:** Phát hiện 3 nhân tố

### Bước 2: CFA (Mẫu 2)

**Mục đích:** Kiểm chứng cấu trúc từ EFA

**Kết quả:** Xác nhận 3 nhân tố phù hợp

### Lưu Ý Quan Trọng

⚠️ **KHÔNG BAO GIỜ** dùng cùng một mẫu cho cả EFA và CFA!

**Tại sao?**
- EFA "tìm" cấu trúc từ dữ liệu
- CFA "kiểm tra" cấu trúc đó
- Dùng cùng mẫu = "tự kiểm tra bài thi của mình" → Không khách quan!

**Giải pháp:**
- **Option 1:** Chia mẫu 50-50 (Mẫu 1: EFA, Mẫu 2: CFA)
- **Option 2:** Thu thập 2 mẫu riêng biệt

---

## Ví Dụ So Sánh: EFA vs CFA

### Tình Huống: Nghiên Cứu "Động Lực Học Tập"

#### Nghiên Cứu Sinh A (Dùng EFA)

**Câu hỏi:** "Động lực học tập" có những chiều nào?

**Phương pháp:**
1. Thiết kế 30 câu hỏi về động lực
2. Thu thập n=500
3. Chạy EFA
4. Phát hiện 4 nhân tố:
   - Động lực nội tại
   - Động lực ngoại tại
   - Áp lực xã hội
   - Mục tiêu cá nhân

**Kết luận:** "Động lực học tập" có 4 chiều!

#### Nghiên Cứu Sinh B (Dùng CFA)

**Câu hỏi:** Lý thuyết Self-Determination (Deci & Ryan, 1985) có đúng không?

**Lý thuyết:** Động lực có 3 loại:
1. Intrinsic (Nội tại)
2. Extrinsic (Ngoại tại)
3. Amotivation (Không có động lực)

**Phương pháp:**
1. Dùng thang đo có sẵn (Academic Motivation Scale)
2. Thu thập n=400
3. Chạy CFA
4. Kiểm tra độ phù hợp

**Kết quả:**
```
CFI = 0.942
RMSEA = 0.058
→ Mô hình phù hợp!
```

**Kết luận:** Lý thuyết Self-Determination được xác nhận!

---

## Những Sai Lầm Thường Gặp

### Sai Lầm 1: Dùng EFA Khi Đã Có Lý Thuyết

**Ví dụ sai:**
```
Nghiên cứu: "Kiểm tra thang đo Big Five Personality"
Phương pháp: EFA
```

**Tại sao sai?** Big Five đã có lý thuyết rõ ràng (5 nhân tố) → Nên dùng CFA!

### Sai Lầm 2: Dùng CFA Khi Chưa Có Lý Thuyết

**Ví dụ sai:**
```
Nghiên cứu: "Khám phá các chiều của hạnh phúc ở Việt Nam"
Phương pháp: CFA
```

**Tại sao sai?** Chưa biết có bao nhiêu chiều → Nên dùng EFA trước!

### Sai Lầm 3: Dùng Cùng Mẫu Cho EFA và CFA

**Ví dụ sai:**
```
1. Chạy EFA với n=300 → Tìm ra 3 nhân tố
2. Chạy CFA với cùng n=300 → "Xác nhận" 3 nhân tố
```

**Tại sao sai?** Tự kiểm tra bài thi của mình!

### Sai Lầm 4: Chỉ Nhìn Một Chỉ Số

**Ví dụ sai:**
```
CFI = 0.96 → "Mô hình tốt!"
(Nhưng RMSEA = 0.15 → Không tốt!)
```

**Đúng:** Phải xem TẤT CẢ các chỉ số!

---

## Checklist: EFA vs CFA

### Khi Nào Dùng EFA?

- [ ] Phát triển thang đo mới
- [ ] Chưa có lý thuyết rõ ràng
- [ ] Muốn giảm số lượng biến
- [ ] Khám phá cấu trúc ẩn
- [ ] Nghiên cứu khám phá

### Khi Nào Dùng CFA?

- [ ] Kiểm tra thang đo có sẵn
- [ ] Đã có lý thuyết rõ ràng
- [ ] Muốn đo độ phù hợp mô hình
- [ ] Chuẩn bị cho SEM
- [ ] Nghiên cứu kiểm chứng

---

## Công Cụ Để Chạy EFA và CFA

### EFA

| Công cụ | Độ khó | Giá |
|---------|--------|-----|
| **SPSS** | Dễ ⭐⭐ | Trả phí |
| **R (psych)** | Trung bình ⭐⭐⭐ | Miễn phí |
| **NCSKIT** | Rất dễ ⭐ | Miễn phí |

### CFA

| Công cụ | Độ khó | Giá |
|---------|--------|-----|
| **AMOS** | Trung bình ⭐⭐⭐ | Trả phí |
| **Mplus** | Khó ⭐⭐⭐⭐ | Trả phí |
| **R (lavaan)** | Khó ⭐⭐⭐⭐ | Miễn phí |
| **NCSKIT** | Dễ ⭐⭐ | Miễn phí |

---

## Kết Luận: EFA và CFA - Hai Mặt Của Một Đồng Xu

**EFA** và **CFA** không phải "đối thủ" - chúng là "đồng đội"!

- **EFA:** Khám phá → "Có gì trong dữ liệu?"
- **CFA:** Kiểm chứng → "Lý thuyết có đúng không?"

**Quy trình lý tưởng:**
```
1. EFA (Mẫu 1) → Khám phá cấu trúc
2. CFA (Mẫu 2) → Kiểm chứng cấu trúc
3. SEM (Mẫu 3) → Kiểm định mô hình lý thuyết
```

---

## Bài Tập Thực Hành

**Câu hỏi:** Bạn muốn nghiên cứu "Sự gắn kết nhân viên". Nên dùng EFA hay CFA?

**Tình huống 1:** Bạn tự thiết kế 25 câu hỏi mới
→ **Đáp án:** EFA (Chưa biết cấu trúc)

**Tình huống 2:** Bạn dùng thang đo Utrecht Work Engagement Scale (có sẵn)
→ **Đáp án:** CFA (Đã có lý thuyết: 3 chiều)

**Tình huống 3:** Bạn dùng thang đo có sẵn nhưng ở Việt Nam (chưa kiểm chứng)
→ **Đáp án:** EFA trước, sau đó CFA (Kiểm tra xem có phù hợp với văn hóa VN không)

---

**Bài viết tiếp theo:** "SEM (Structural Equation Modeling): Khi Nào Cần Dùng?" 🔗

---

*Bài viết này được viết bởi NCSKIT Team. Đăng ký ngay để nhận thêm nhiều bài viết về phân tích dữ liệu!*

**#EFA #CFA #FactorAnalysis #PhânTíchNhânTố #SPSS #AMOS #SEM #NCSKIT #NghiênCứuKhoaHọc**
