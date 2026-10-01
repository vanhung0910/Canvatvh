import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

const SITE = "https://tvhcanva.com";
const GA_ID = "G-B3YY70S3TZ";
const TITLE = "TVH Canva – Canva Pro, CapCut Pro, ChatGPT Plus giá rẻ, giao tự động";
const DESCRIPTION =
  "Mua bản quyền Canva Pro chỉ từ 15.000đ, CapCut Pro, ChatGPT Plus, Google One, Netflix… giá rẻ, thanh toán chuyển khoản tự động, bảo hành đầy đủ, hỗ trợ qua Zalo.";

const HEAD = `
    <title>${TITLE}</title>
    <meta name="description" content="${DESCRIPTION}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${SITE}/" />
    <link rel="icon" type="image/png" href="/logo.png" />
    <meta name="theme-color" content="#5b2fa0" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="vi_VN" />
    <meta property="og:site_name" content="TVH Canva" />
    <meta property="og:url" content="${SITE}/" />
    <meta property="og:title" content="${TITLE}" />
    <meta property="og:description" content="${DESCRIPTION}" />
    <meta property="og:image" content="${SITE}/og-image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="TVH Canva – Canva Pro & CapCut giá rẻ" />
    <meta name="twitter:image" content="${SITE}/og-image.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Store",
      name: "TVH Canva",
      url: SITE,
      logo: `${SITE}/logo.png`,
      description: DESCRIPTION,
      sameAs: [
        "https://www.facebook.com/groups/tvhcanva",
        "https://zalo.me/g/wvhu5evlevj1vvnzccgo",
      ],
    })}</script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      if (!location.pathname.startsWith('/admin') && location.hash !== '#admin') {
        gtag('config', '${GA_ID}');
      }
    </script>`;

/**
 * Viết lại <head> của index.html lúc build: bỏ noindex, title/description mẫu,
 * đặt lang="vi", thêm Open Graph, dữ liệu cấu trúc và Google Analytics.
 */
const ROBOTS = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${SITE}/sitemap.xml
`;

const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

export function seoPlugin(): Plugin {
  return {
    name: "tvh-seo",
    // Tự sinh robots.txt + sitemap.xml vào bản build (không phụ thuộc thư mục public/).
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "robots.txt", source: ROBOTS });
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: SITEMAP });
      for (const [src, out] of [
        ["src/imports/logo.png", "logo.png"],
        ["src/imports/og-image.jpg", "og-image.jpg"],
      ]) {
        const file = path.resolve(__dirname, src);
        if (fs.existsSync(file)) {
          this.emitFile({ type: "asset", fileName: out, source: fs.readFileSync(file) });
        }
      }
    },
    transformIndexHtml(html) {
      return html
        .replace(/<html[^>]*>/i, '<html lang="vi">')
        .replace(/<title>[\s\S]*?<\/title>/gi, "")
        .replace(/<meta[^>]+name=["'](robots|description|googlebot)["'][^>]*>/gi, "")
        .replace(/<meta[^>]+(property|name)=["'](og|twitter):[^"']*["'][^>]*>/gi, "")
        .replace(/<link[^>]+rel=["'](canonical|icon)["'][^>]*>/gi, "")
        .replace(/<script[^>]*googletagmanager[^>]*><\/script>/gi, "")
        .replace(/<head>/i, `<head>${HEAD}`);
    },
  };
}
