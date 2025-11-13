# Team Avatar Setup Guide

## ✅ ĐÃ HOÀN THÀNH

### 1. UI Improvements
- ✅ Trang About sử dụng MainLayout (header + footer đồng nhất)
- ✅ Trang Features sử dụng MainLayout (header + footer đồng nhất)
- ✅ Team section có avatar placeholders với fallback icons
- ✅ Avatar có border màu theo role (blue, green, purple)
- ✅ Hover effects và shadows cho professional look

### 2. Cấu Trúc Files

**Trang đã update:**
- `frontend/src/app/about/page.tsx` - About page với team avatars
- `frontend/src/app/features/page.tsx` - Features page với header/footer

**Layout components:**
- `frontend/src/components/layout/main-layout.tsx` - Layout chung
- `frontend/src/components/layout/header.tsx` - Header component
- `frontend/src/components/layout/footer.tsx` - Footer component

---

## 📸 THÊM AVATAR CHO TEAM

### Bước 1: Chuẩn Bị Ảnh

**Yêu cầu ảnh:**
- Format: JPG hoặc PNG
- Kích thước: 400x400px (hoặc lớn hơn, tỷ lệ 1:1)
- Chất lượng: Rõ nét, ánh sáng tốt
- Background: Nền trơn hoặc professional

**Tên file:**
```
le-phuc-hai.jpg          (Lê Phúc Hải)
nguyen-duc-tin.jpg       (Nguyễn Đức Tín)
chau-carmen-nguyen.jpg   (Châu Carmen Nguyễn)
```

### Bước 2: Upload Ảnh

**Tạo thư mục:**
```
frontend/public/team/
```

**Copy ảnh vào:**
```
frontend/public/team/le-phuc-hai.jpg
frontend/public/team/nguyen-duc-tin.jpg
frontend/public/team/chau-carmen-nguyen.jpg
```

### Bước 3: Kiểm Tra

1. **Start dev server:**
   ```powershell
   cd frontend
   npm run dev
   ```

2. **Mở trang About:**
   ```
   http://localhost:3000/about
   ```

3. **Kiểm tra:**
   - ✅ Avatar hiển thị đúng
   - ✅ Nếu ảnh không có, icon fallback hiển thị
   - ✅ Border màu đúng theo role
   - ✅ Hover effect hoạt động

---

## 🎨 AVATAR STYLING

### Current Design

**Lê Phúc Hải (Lead Developer):**
- Border: Blue (border-blue-100)
- Size: 128x128px (w-32 h-32)
- Fallback: Graduation cap icon

**Nguyễn Đức Tín (Research Assistant):**
- Border: Green (border-green-100)
- Size: 128x128px
- Fallback: Users icon

**Châu Carmen Nguyễn (Partnership Lead):**
- Border: Purple (border-purple-100)
- Size: 128x128px
- Fallback: Briefcase icon

### Customization

Nếu muốn thay đổi style, edit trong `frontend/src/app/about/page.tsx`:

```tsx
<div className="relative w-32 h-32 mx-auto mb-6">
  <div className="w-full h-full rounded-full overflow-hidden border-4 border-blue-100 shadow-lg">
    <Image
      src="/team/le-phuc-hai.jpg"
      alt="Lê Phúc Hải"
      width={128}
      height={128}
      className="object-cover w-full h-full"
    />
  </div>
</div>
```

**Thay đổi:**
- `w-32 h-32` → Kích thước avatar
- `border-4` → Độ dày border
- `border-blue-100` → Màu border
- `shadow-lg` → Shadow effect

---

## 🔄 FALLBACK SYSTEM

### Cách Hoạt Động

Nếu ảnh không tồn tại hoặc lỗi load:
1. Image component trigger `onError` event
2. Ẩn image element
3. Hiển thị icon fallback với màu tương ứng

### Icons Fallback

- **Lê Phúc Hải:** Graduation cap (Academic)
- **Nguyễn Đức Tín:** Users group (Team/Data)
- **Châu Carmen Nguyễn:** Briefcase (Business/Partnership)

---

## 📱 RESPONSIVE DESIGN

Avatar tự động responsive:
- **Desktop:** 128x128px
- **Tablet:** 128x128px
- **Mobile:** 128x128px (centered)

Cards stack vertically trên mobile (grid-cols-1 md:grid-cols-3)

---

## 🎯 BEST PRACTICES

### Ảnh Avatar Chất Lượng

1. **Professional headshot:**
   - Mặc trang phục professional
   - Nền trơn hoặc blur
   - Ánh sáng tự nhiên

2. **Crop đúng:**
   - Tỷ lệ 1:1 (vuông)
   - Face ở giữa
   - Không quá zoom in/out

3. **Optimize:**
   - Compress ảnh (< 200KB)
   - Format: JPG cho photos
   - Quality: 80-90%

### Tools Để Optimize

**Online:**
- TinyPNG: https://tinypng.com
- Squoosh: https://squoosh.app

**Command line:**
```bash
# ImageMagick
convert input.jpg -resize 400x400^ -gravity center -extent 400x400 -quality 85 output.jpg
```

---

## 🚀 DEPLOYMENT

### Production Checklist

- [ ] Tất cả avatar files đã upload vào `public/team/`
- [ ] Ảnh đã optimize (< 200KB mỗi file)
- [ ] Test trên localhost
- [ ] Test fallback (xóa tạm 1 ảnh để test)
- [ ] Commit và push
- [ ] Deploy lên production
- [ ] Test trên production URL

### Git Commands

```bash
# Add avatar files
git add frontend/public/team/*.jpg

# Commit
git commit -m "Add team member avatars"

# Push
git push origin main
```

---

## 📊 CURRENT STATUS

### Pages Updated
- ✅ `/about` - Team section với avatars
- ✅ `/features` - Consistent header/footer
- ✅ `/` - Homepage (đã có header/footer)

### Pending
- ⏳ Upload actual team photos
- ⏳ Test on production

---

## 🆘 TROUBLESHOOTING

### Avatar không hiển thị

**Check 1: File path đúng chưa?**
```
frontend/public/team/le-phuc-hai.jpg  ✅
frontend/public/le-phuc-hai.jpg       ❌
frontend/team/le-phuc-hai.jpg         ❌
```

**Check 2: Tên file đúng chưa?**
- Case-sensitive trên Linux/Mac
- Dùng lowercase và dashes
- Extension đúng (.jpg không phải .jpeg)

**Check 3: File size?**
- Nếu > 5MB, Next.js có thể không load
- Optimize xuống < 500KB

### Fallback icon không hiển thị

- Check console errors
- Verify Heroicons installed: `npm list @heroicons/react`
- Clear browser cache

### Border màu không đúng

- Check Tailwind classes: `border-blue-100`, `border-green-100`, etc.
- Verify Tailwind config includes these colors

---

## 💡 TIPS

1. **Consistent style:** Tất cả ảnh nên có style tương tự (cùng background, lighting)
2. **Professional:** Dùng ảnh professional, không selfie
3. **Update regularly:** Cập nhật ảnh khi có thay đổi team
4. **Alt text:** Luôn có alt text cho accessibility

---

**Khi có ảnh team, chỉ cần copy vào `frontend/public/team/` và avatar sẽ tự động hiển thị!**
