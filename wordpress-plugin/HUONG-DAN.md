# HƯỚNG DẪN ĐÓNG GÓI & UPLOAD PLUGIN

## BƯỚC 1 — Tải code React về máy
Tải toàn bộ project Figma Make này về máy tính (nút Download trong Figma Make).

## BƯỚC 2 — Cài Node.js & build React
Trên máy tính của bạn:

```bash
# Cài Node.js từ https://nodejs.org (LTS)
# Sau đó mở Terminal/CMD vào thư mục project:
cd duong-dan-toi-project
npm install -g pnpm
pnpm install
```

Sửa file `vite.config.ts` (hoặc tạo nếu chưa có) để bật manifest:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    manifest: true,
    rollupOptions: {
      input: 'index.html'
    }
  }
});
```

Tạo file `index.html` ở root:
```html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>TVHCanva</title></head>
<body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>
```

Build:
```bash
pnpm vite build
```

→ Ra folder `dist/` chứa `assets/` + `manifest.json`

## BƯỚC 3 — Đóng gói plugin
1. Copy folder `dist/` vào folder `wordpress-plugin/`
2. Cấu trúc cuối cùng:
   ```
   wordpress-plugin/
   ├── tvhcanva-app.php
   └── dist/
       ├── .vite/manifest.json
       └── assets/
           ├── index-xxx.js
           └── index-xxx.css
   ```
3. Nén folder `wordpress-plugin/` thành **`tvhcanva-app.zip`**
   - Quan trọng: zip folder, không zip các file riêng lẻ

## BƯỚC 4 — Upload lên WordPress
1. WP Admin → **Plugins → Add New → Upload Plugin**
2. Chọn `tvhcanva-app.zip` → Install Now → Activate

## BƯỚC 5 — Tạo trang chủ
1. **Pages → Add New** → tên "Trang chủ"
2. Trong nội dung paste: `[tvhcanva_app]`
3. Publish
4. **Settings → Reading** → Static homepage → chọn "Trang chủ"

## BƯỚC 6 — Truy cập tvhcanva.com → React app sẽ hiện

---

## NẾU GẶP KHÓ KHĂN
Nếu không quen với Node.js/build, bạn có thể:
- Thuê freelancer 30 phút làm bước 2-3 (~200-500k)
- Hoặc dùng GitHub Actions tự build (tôi hướng dẫn tiếp nếu cần)
- Hoặc dùng Cách 3 (host React ở Vercel + iframe vào Elementor) — đơn giản hơn nhiều
