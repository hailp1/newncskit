# Hướng Dẫn Thay Avatar Core Team

## 📁 Thư Mục Đã Sẵn Sàng

```
frontend/public/team/
```

Thư mục này đã được tạo và sẵn sàng nhận ảnh!

---

## 📸 Bước 1: Chuẩn Bị Ảnh

### Yêu Cầu Ảnh

**Kích thước:**
- Tối thiểu: 400x400px
- Khuyến nghị: 800x800px
- Tỷ lệ: 1:1 (vuông)

**Format:**
- JPG (cho photos)
- PNG (nếu cần background trong suốt)

**Chất lượng:**
- Professional headshot
- Ánh sáng tốt
- Nền trơn hoặc blur
- Face ở giữa

**Dung lượng:**
- < 500KB (optimize trước khi upload)
- Khuyến nghị: 100-200KB

### Tên File Chính Xác

**⚠️ QUAN TRỌNG: Tên file phải chính xác 100%**

```
le-phuc-hai.jpg          ← Lê Phúc Hải (Lead Developer)
nguyen-duc-tin.jpg       ← Nguyễn Đức Tín (Research Assistant)
chau-carmen-nguyen.jpg   ← Châu Carmen Nguyễn (Partnership Lead)
```

**Lưu ý:**
- Tất cả lowercase (chữ thường)
- Dùng dấu gạch ngang `-` thay space
- Extension: `.jpg` hoặc `.png`

---

## 📂 Bước 2: Copy Ảnh Vào Thư Mục

### Cách 1: Copy Thủ Công (Dễ nhất)

1. **Mở File Explorer:**
   ```
   Windows + E
   ```

2. **Navigate đến:**
   ```
   D:\newNCSKITORG\newNCSkit\local_ncs\frontend\public\team\
   ```

3. **Copy 3 file ảnh vào đây:**
   - le-phuc-hai.jpg
   - nguyen-duc-tin.jpg
   - chau-carmen-nguyen.jpg

### Cách 2: Dùng PowerShell

```powershell
# Giả sử ảnh đang ở Desktop
Copy-Item "$env:USERPROFILE\Desktop\le-phuc-hai.jpg" "frontend\public\team\"
Copy-Item "$env:USERPROFILE\Desktop\nguyen-duc-tin.jpg" "frontend\public\team\"
Copy-Item "$env:USERPROFILE\Desktop\chau-carmen-nguyen.jpg" "frontend\public\team\"
```

### Cách 3: Drag & Drop

1. Mở thư mục `frontend\public\team\` trong File Explorer
2. Drag & drop 3 file ảnh vào đây

---

## ✅ Bước 3: Kiểm Tra

### Check Files Đã Copy

```powershell
dir frontend\public\team\
```

Kết quả mong đợi:
```
le-phuc-hai.jpg
nguyen-duc-tin.jpg
chau-carmen-nguyen.jpg
```

### Test Trên Browser

1. **Refresh page:**
   ```
   http://localhost:3000/about
   ```

2. **Kiểm tra:**
   - ✅ Avatar hiển thị thay vì icon
   - ✅ Ảnh rõ nét
   - ✅ Border màu đúng (blue, green, purple)

---

## 🎨 Optimize Ảnh (Khuyến Nghị)

### Online Tools (Miễn Phí)

**TinyPNG:**
1. Vào: https://tinypng.com
2. Upload ảnh
3. Download ảnh đã optimize
4. Giảm 50-70% dung lượng, giữ chất lượng

**Squoosh:**
1. Vào: https://squoosh.app
2. Upload ảnh
3. Chọn format: MozJPEG
4. Quality: 80-85
5. Download

### Photoshop/GIMP

```
1. Mở ảnh
2. Image → Image Size → 800x800px
3. File → Export → Save for Web
4. Quality: 80
5. Save
```

---

## 🔄 Nếu Muốn Thay Đổi Ảnh

### Thay Ảnh Mới

1. **Xóa ảnh cũ** (hoặc đổi tên)
2. **Copy ảnh mới** với cùng tên file
3. **Hard refresh browser:** `Ctrl + Shift + R`

### Đổi Tên File

Nếu muốn dùng tên file khác, update trong code:

**File:** `frontend/src/app/about/page.tsx`

Tìm và thay:
```tsx
src="/team/le-phuc-hai.jpg"
```

Thành:
```tsx
src="/team/ten-file-moi.jpg"
```

---

## 🎯 Ví Dụ Cụ Thể

### Scenario: Ảnh đang ở Desktop

```powershell
# 1. Check ảnh có ở Desktop không
dir "$env:USERPROFILE\Desktop\*.jpg"

# 2. Copy vào thư mục team
Copy-Item "$env:USERPROFILE\Desktop\le-phuc-hai.jpg" "frontend\public\team\"
Copy-Item "$env:USERPROFILE\Desktop\nguyen-duc-tin.jpg" "frontend\public\team\"
Copy-Item "$env:USERPROFILE\Desktop\chau-carmen-nguyen.jpg" "frontend\public\team\"

# 3. Verify
dir frontend\public\team\

# 4. Refresh browser
# Ctrl + Shift + R
```

---

## 🖼️ Fallback System

### Nếu Ảnh Không Tồn Tại

Code tự động hiển thị icon fallback:
- **Lê Phúc Hải:** Graduation cap icon (blue)
- **Nguyễn Đức Tín:** Users icon (green)
- **Châu Carmen Nguyễn:** Briefcase icon (purple)

### Test Fallback

Để test fallback, tạm thời đổi tên file:
```powershell
# Rename để test
Rename-Item "frontend\public\team\le-phuc-hai.jpg" "le-phuc-hai.jpg.bak"

# Refresh browser → Sẽ thấy icon

# Restore
Rename-Item "frontend\public\team\le-phuc-hai.jpg.bak" "le-phuc-hai.jpg"
```

---

## 📊 Checklist

### Trước Khi Upload
- [ ] Ảnh đã crop vuông (1:1)
- [ ] Kích thước >= 400x400px
- [ ] Dung lượng < 500KB
- [ ] Tên file chính xác
- [ ] Format: JPG hoặc PNG

### Sau Khi Upload
- [ ] Files đã copy vào `frontend/public/team/`
- [ ] Tên file khớp với code
- [ ] Refresh browser (`Ctrl + Shift + R`)
- [ ] Avatar hiển thị đúng
- [ ] Ảnh rõ nét

---

## 🆘 Troubleshooting

### Avatar Không Hiển Thị

**Check 1: Tên file đúng chưa?**
```powershell
dir frontend\public\team\
```
Phải thấy exact names:
- le-phuc-hai.jpg
- nguyen-duc-tin.jpg
- chau-carmen-nguyen.jpg

**Check 2: Path đúng chưa?**
```
✅ frontend\public\team\le-phuc-hai.jpg
❌ frontend\team\le-phuc-hai.jpg
❌ public\team\le-phuc-hai.jpg
```

**Check 3: Extension đúng chưa?**
```
✅ le-phuc-hai.jpg
❌ le-phuc-hai.jpeg
❌ le-phuc-hai.JPG (case-sensitive trên Linux)
```

**Check 4: Browser cache?**
```
Ctrl + Shift + R (hard refresh)
```

### Ảnh Bị Vỡ/Mờ

- Upload ảnh resolution cao hơn (800x800px)
- Check ảnh gốc có rõ không
- Optimize lại với quality cao hơn (85-90)

### File Size Quá Lớn

- Dùng TinyPNG để compress
- Resize xuống 800x800px
- Giảm quality xuống 80

---

## 💡 Tips

### Professional Photos

1. **Lighting:** Ánh sáng tự nhiên từ phía trước
2. **Background:** Nền trơn hoặc blur
3. **Framing:** Face chiếm 60-70% frame
4. **Expression:** Tự nhiên, friendly
5. **Attire:** Professional clothing

### Consistent Style

Tất cả 3 ảnh nên có:
- Cùng style (cùng background type)
- Cùng lighting
- Cùng framing
- Cùng color tone

### Quick Edit

Nếu cần edit nhanh:
1. Vào: https://www.photopea.com (free Photoshop online)
2. Upload ảnh
3. Crop vuông
4. Adjust brightness/contrast
5. Export JPG quality 85

---

## 🎊 Hoàn Thành!

Sau khi copy ảnh:
1. ✅ Avatar hiển thị trên About page
2. ✅ Professional look
3. ✅ Team section hoàn chỉnh
4. ✅ Ready for production!

---

**Chỉ cần copy 3 file ảnh vào `frontend/public/team/` là xong! 🚀**

**Path:** `D:\newNCSKITORG\newNCSkit\local_ncs\frontend\public\team\`
