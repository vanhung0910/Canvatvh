# NHIỆM VỤ: Sửa 2 file, một lần duy nhất

Chỉ sửa `vite.config.ts` và tạo `.gitignore`. **Không đụng vào bất kỳ file nào khác.**

## Bối cảnh — vì sao phải làm ở `vite.config.ts` chứ không phải nơi khác

Figma Make tự sinh lại `index.html` và `src/imports/logo.png` sau mỗi lần push,
nên mọi sửa đổi trực tiếp trên hai file đó đều bị ghi đè ở lần push kế tiếp
(đã xảy ra 2 lần rồi). `vite.config.ts` thì Make không đụng tới, nên bản vá
đặt ở đây sẽ tồn tại lâu dài.

Hai vấn đề được vá:

**1. Website đang tự chặn Google.** `index.html` do Make sinh ra luôn chứa
`<meta name="robots" content="noindex, nofollow">` — dòng này bảo Google đừng
đưa trang vào kết quả tìm kiếm. Kèm theo là `lang="en"` cho một trang tiếng
Việt và thẻ mô tả mẫu nói về "công cụ nhân bản website".
Không thể sửa bằng JavaScript lúc chạy: khi Googlebot thấy `noindex` trong
HTML gốc, nó bỏ qua luôn bước render JavaScript.

**2. Logo nặng 6,24 MB.** `src/imports/logo.png` là ảnh 2816x1536 nhưng chỉ
hiển thị ở 40x40 pixel trên header — nặng gấp 21 lần toàn bộ JS + CSS cộng lại.

## LUẬT BẮT BUỘC

1. **Thay TOÀN BỘ nội dung `vite.config.ts`** bằng đoạn code bên dưới. Không giữ lại dòng nào của bản cũ.
2. **KHÔNG sửa `index.html`.** Plugin sẽ tự xử lý lúc build. Sửa file đó là vô ích vì bạn sẽ ghi đè lại ở lần push sau.
3. **KHÔNG sửa `src/imports/logo.png`**, không xoá nó. Plugin chỉ chặn không cho nó vào bundle, file gốc vẫn nằm nguyên chỗ cũ.
4. **KHÔNG rút gọn, xuống dòng lại, hay "làm đẹp" chuỗi base64 của logo.** Copy nguyên văn từng ký tự. Sai một ký tự là logo hỏng.
5. **GIỮ NGUYÊN** `figmaAssetResolver`, `react()`, `tailwindcss()`, `resolve.alias`, `assetsInclude` — chúng đã có sẵn trong đoạn code bên dưới, đúng vị trí.
6. **KHÔNG sửa** `package.json`, `App.tsx`, `api/`, `supabase/`, `src/app/components/`, hay bất kỳ file nào khác.
7. Không chạy lệnh build/test/deploy. Không viết README hay tài liệu.

---

## FILE 1: `vite.config.ts` — THAY TOÀN BỘ

```ts
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

/**
 * Nhúng thẳng logo đã tối ưu vào bundle.
 *
 * VÌ SAO: src/imports/logo.png trong dự án nặng 6,24 MB (2816x1536) nhưng
 * chỉ hiển thị ở 40x40 pixel trên header — nặng gấp 21 lần toàn bộ JS + CSS
 * cộng lại. Figma Make sinh lại file ảnh đó nên thay tay sẽ bị ghi đè.
 *
 * Ảnh dưới đây là bản đã cắt vuông (đúng như object-cover hiển thị) và
 * resize còn 160x160, nặng 5 KB. Ở kích thước hiển thị 40x40 thì mắt
 * thường không phân biệt được với bản gốc.
 */
const LOGO_DATA_URI =
  'data:image/png;base64,' +
  'iVBORw0KGgoAAAANSUhEUgAAAKAAAACgCAMAAAC8EZcfAAABgFBMVEXZoJ5XTeHoZ2qca8twL+LtzUiwYJwQGiWRjtGg1+Tqo1Xt' +
  'za81b9Ufp8izjqvQp9CX0mB0xdlSsNcGwMINuLuJPM/qYIdew5Hzjj3e4+Jgr4dhX6pox3M5QjhWWmiUlGAcMEAtTm1TTDlpoG87' +
  'NNU+foZFLjGcXz+HTUCjgDzvfzf7xDr5+/sBAgIKGyoTIzHp6eqztrfU1dbuikzJycumqqtOVVkMFBpwdXmSlZcsOUQ1mNQvNThP' +
  'h9MkKS4vo9dQWmOQSs7zk01MltSHiotFS05laWs5RE5wZtDT5euOVs/QeHNVeM9tdtLz5dVZY2vYhHKnV6+3Z5HHd4l0e4LU2ed8' +
  'g4nu2s7m2eivZagLuMRzWc5Mptayt9Nutti4w8vTuNNriNHQx+PtpnM2iM+coqWx1uZNaNRwl8+XnKOTyOHiiWjvyKkXqMaSZs53' +
  'SNBvqNWRuNnPtuLnys+QptWuyOLnlmiVx9uxltTCaouaSbi1ea6xiM7HqNTst5GqptfRn1Y6AAAAgHRSTlP/////////////////' +
  '////////////////////////////////////////////////////////////////////////////////////////////////////' +
  '/////////////////////////////////////////////////////xUHpOoAABIQSURBVHja7Zz5Q9PY9sAjZRMFxDfzRp317d/l' +
  'JrlJszcNhe4IFEtbQJYigoq44IAKCvqvv3uT3CRtliYFnPmBozNCW8gn557tLjkU/ScX6hrwGvAa8BrwGvAyRNalkqKqIodEFNVC' +
  'SdKNPwugLhU4HgQIzxVK+h8MqCtiIJsri5yi/1GARbUHnKNKtSh/c0C9EJPOkvuq/i0B5ZIAEotQkr8RoKwsgr4EFoxvACgXIOhb' +
  'oDpyxYCycgE8E/FX+SoBpSjPgKurO79j2VldjbgNWLoyQJ0LuWbz95Oz1Ju5uZmZ77HMzMzNpVJnk9shnIJ+NYCFYLjN0Tfrb9++' +
  'RVBzGBGL/e+nT49Sk0IQZOEKAPWAyAJ3TlKV9fX1uTmMiBnfYCGcM6nUp0+f1s62/Yz8z5cNqPjxdkYXKpXKG0Q49yZ1drLtmB6E' +
  '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'

function inlineLogo() {
  return {
    name: 'tvh-inline-logo',
    enforce: 'pre',
    load(id) {
      const clean = id.replace(/\\/g, '/').split('?')[0]
      if (clean.endsWith('src/imports/logo.png')) {
        return `export default ${JSON.stringify(LOGO_DATA_URI)}`
      }
    },
  }
}

/**
 * Sửa thẻ SEO ngay lúc build.
 *
 * VÌ SAO PHẢI LÀM Ở ĐÂY: Figma Make tự sinh lại index.html sau mỗi lần push,
 * và bản nó sinh ra luôn có <meta name="robots" content="noindex, nofollow">
 * cùng thẻ mô tả mẫu nói về "công cụ nhân bản website". Sửa tay trong
 * index.html sẽ bị Make ghi đè ở lần push kế tiếp.
 *
 * Plugin này chạy lúc build nên dù index.html nguồn có nội dung gì,
 * HTML deploy lên Vercel vẫn luôn đúng.
 *
 * Lưu ý: KHÔNG thể sửa bằng JavaScript lúc chạy. Khi Googlebot thấy noindex
 * trong HTML gốc, nó bỏ qua luôn bước render JavaScript, nên SeoHead.tsx
 * không cứu được trường hợp này.
 */
const SITE_URL = 'https://www.tvhcanva.com'
const TITLE =
  'TVHCanva — Tài khoản bản quyền giá rẻ: Canva Pro, ChatGPT, Netflix, Spotify'
const DESCRIPTION =
  'Mua tài khoản bản quyền giá rẻ, kích hoạt trong 5 phút: Canva Pro, CapCut Pro, ChatGPT Plus, Netflix Premium, Spotify, YouTube Premium, Office 365, VPN. Bảo hành trọn gói, hỗ trợ qua Zalo.'

function seoHead() {
  return {
    name: 'tvh-seo-head',
    transformIndexHtml(html) {
      let out = html

      // Trang tiếng Việt
      out = out.replace(/<html([^>]*)\slang="[^"]*"/i, '<html$1 lang="vi"')
      if (!/<html[^>]*\slang=/i.test(out)) {
        out = out.replace(/<html/i, '<html lang="vi"')
      }

      // Gỡ các thẻ Make tự sinh — chèn lại bản đúng bên dưới
      out = out
        .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
        .replace(/<meta\s+name="description"[^>]*>\s*/gi, '')
        .replace(/<meta\s+name="robots"[^>]*>\s*/gi, '')

      const tags = `
    <title>${TITLE}</title>
    <meta name="description" content="${DESCRIPTION}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${SITE_URL}/" />
    <meta name="theme-color" content="#1a1a4e" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="TVHCanva" />
    <meta property="og:title" content="${TITLE}" />
    <meta property="og:description" content="Tài khoản bản quyền giá rẻ, kích hoạt nhanh, bảo hành trọn gói. Canva Pro chỉ từ 15.000d." />
    <meta property="og:url" content="${SITE_URL}/" />
    <meta property="og:image" content="${SITE_URL}/og-image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="vi_VN" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="TVHCanva - Tài khoản bản quyền giá rẻ" />
    <meta name="twitter:description" content="Canva Pro, CapCut Pro, ChatGPT Plus, Netflix, Spotify giá rẻ, kích hoạt trong 5 phút." />
    <meta name="twitter:image" content="${SITE_URL}/og-image.jpg" />

    <link rel="preconnect" href="https://content.pancake.vn" crossorigin />
    <link rel="dns-prefetch" href="https://content.pancake.vn" />
  `

      return out.replace(/<\/head>/i, `${tags}</head>`)
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    inlineLogo(),
    seoHead(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
```

---

## FILE 2: `.gitignore` — TẠO MỚI ở thư mục gốc

File này đã từng có nhưng bị mất. Không có nó, ai clone repo về chạy
`npm install` rồi lỡ `git add .` sẽ commit cả `node_modules` lên.

```text
node_modules/
dist/
.vercel/
*.local
.DS_Store
```

---

## TỰ KIỂM TRA

- [ ] `vite.config.ts` có đủ 3 hàm plugin: `figmaAssetResolver`, `inlineLogo`, `seoHead`
- [ ] Mảng `plugins` theo đúng thứ tự: `figmaAssetResolver(), inlineLogo(), seoHead(), react(), tailwindcss()`
- [ ] Chuỗi base64 trong `LOGO_DATA_URI` còn nguyên vẹn, không bị cắt ngắn
- [ ] `index.html` **không bị sửa**
- [ ] `src/imports/logo.png` **vẫn còn nguyên**, không bị xoá
- [ ] Không file nào khác trong dự án bị thay đổi
- [ ] `.gitignore` đã được tạo

Báo cáo ngắn gọn: đã sửa file nào, và bất kỳ chỗ nào bạn phải suy đoán.
