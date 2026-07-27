import { useEffect } from "react";
import type { Product } from "./ProductCard";

const SITE_URL = "https://www.tvhcanva.com";
const SITE_NAME = "TVHCanva";
const TITLE =
  "TVHCanva — Tài khoản bản quyền giá rẻ: Canva Pro, ChatGPT, Netflix, Spotify";
const DESCRIPTION =
  "Mua tài khoản bản quyền giá rẻ, kích hoạt trong 5 phút: Canva Pro, CapCut Pro, ChatGPT Plus, Netflix Premium, Spotify, YouTube Premium, Office 365, VPN… Bảo hành trọn gói, hỗ trợ qua Zalo.";

interface SeoHeadProps {
  /** Toàn bộ sản phẩm để sinh dữ liệu có cấu trúc cho Google. */
  products: Product[];
  /** Ảnh chia sẻ mạng xã hội (1200x630). Đặt file vào thư mục public/. */
  ogImage?: string;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function toNumber(price: string): number {
  return parseInt(price.replace(/[^\d]/g, ""), 10) || 0;
}

/**
 * SEO cho trang một-trang (SPA).
 *
 * Googlebot có chạy JavaScript nên sẽ đọc được các thẻ meta và JSON-LD
 * do component này chèn vào. Tuy vậy, các thẻ tĩnh trong index.html vẫn
 * tốt hơn cho tốc độ index và cho Facebook/Zalo (bot của họ KHÔNG chạy JS)
 * — xem hướng dẫn kèm theo để dán vào index.html.
 *
 * Component không render gì ra màn hình, không ảnh hưởng giao diện.
 */
export function SeoHead({ products, ogImage }: SeoHeadProps) {
  useEffect(() => {
    const image = ogImage || `${SITE_URL}/og-image.jpg`;

    document.title = TITLE;
    document.documentElement.lang = "vi";

    upsertMeta("name", "description", DESCRIPTION);
    upsertMeta("name", "robots", "index, follow, max-image-preview:large");
    upsertMeta("name", "theme-color", "#1a1a4e");

    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:title", TITLE);
    upsertMeta("property", "og:description", DESCRIPTION);
    upsertMeta("property", "og:url", SITE_URL);
    upsertMeta("property", "og:image", image);
    upsertMeta("property", "og:locale", "vi_VN");

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", TITLE);
    upsertMeta("name", "twitter:description", DESCRIPTION);
    upsertMeta("name", "twitter:image", image);

    upsertLink("canonical", SITE_URL);

    // ----- Dữ liệu có cấu trúc (JSON-LD) -----
    const graph: any[] = [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        sameAs: ["https://www.facebook.com/groups/tvhcanva"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "vi-VN",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "ItemList",
        name: "Tài khoản bản quyền giá rẻ",
        numberOfItems: products.length,
        itemListElement: products.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: p.name,
            image: p.image,
            description: `${p.name} bản quyền giá rẻ, kích hoạt nhanh, bảo hành trọn gói tại ${SITE_NAME}.`,
            brand: { "@type": "Brand", name: p.name },
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "VND",
              lowPrice: Math.min(...p.plans.map((pl) => toNumber(pl.price))),
              highPrice: Math.max(...p.plans.map((pl) => toNumber(pl.price))),
              offerCount: p.plans.length,
              availability: "https://schema.org/InStock",
              seller: { "@id": `${SITE_URL}/#organization` },
            },
          },
        })),
      },
    ];

    const ID = "tvh-jsonld";
    document.getElementById(ID)?.remove();
    const script = document.createElement("script");
    script.id = ID;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": graph,
    });
    document.head.appendChild(script);

    return () => {
      document.getElementById(ID)?.remove();
    };
  }, [products, ogImage]);

  return null;
}
