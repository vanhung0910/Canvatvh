export const SHOP_URL = "https://shop.tvhcanva.com";

type WcEntry = {
  productId: number;
  slug: string;
  variations: Record<string, number>;
};

export const WC_MAPPING: Record<string, WcEntry> = {
  "Capcut Pro": { productId: 17, slug: "capcut-pro", variations: { "1 Tháng": 30 } },
  "Canva Pro": { productId: 18, slug: "canva-pro", variations: { "1 Tháng": 32, "1 Năm": 33 } },
  "Google One 2TB": { productId: 19, slug: "google-one-2tb", variations: { "1 Năm": 35 } },
  "iCloud+ 400GB": { productId: 20, slug: "icloud-400gb", variations: { "1 Năm": 37 } },
  "ChatGPT Plus": { productId: 21, slug: "chatgpt-plus", variations: { "1 Tháng": 39 } },
  "Google AI Ultra": { productId: 22, slug: "google-ai-ultra", variations: { "1 Tháng": 41, "3 Tháng": 42, "6 Tháng": 43, "1 Năm": 44 } },
  "Spotify Premium": { productId: 23, slug: "spotify-premium", variations: { "1 Năm": 52 } },
  "Youtube Premium": { productId: 24, slug: "youtube-premium", variations: { "1 Năm": 54 } },
  "Office 365": { productId: 25, slug: "office-365", variations: { "1 Năm": 56 } },
  "Kaspersky Premium": { productId: 26, slug: "kaspersky-premium", variations: { "1 Năm": 58 } },
  "Quillbot Premium": { productId: 27, slug: "quillbot-premium", variations: { "1 Năm": 60 } },
  "Grammarly Pro + AI": { productId: 28, slug: "grammarly-pro-ai", variations: { "1 Tháng": 62, "3 Tháng": 63, "6 Tháng": 64, "1 Năm": 67 } },
  "Adobe Full App": { productId: 45, slug: "adobe-full-app", variations: { "1 Năm": 69 } },
  "Autodesk AutoCAD": { productId: 46, slug: "autodesk-autocad", variations: { "1 Năm": 71 } },
  "Figma Pro": { productId: 47, slug: "figma-pro", variations: { "1 Tháng": 73 } },
  "Freepik Premium": { productId: 48, slug: "freepik-premium", variations: { "6 Tháng": 75 } },
  SuperGrok: { productId: 49, slug: "supergrok", variations: { "1 Tháng": 77, "3 Tháng": 78, "6 Tháng": 79, "1 Năm": 80 } },
  "Leonardo AI": { productId: 50, slug: "leonardo-ai", variations: { "1 Tháng": 86, "3 Tháng": 87, "6 Tháng": 88, "1 Năm": 89 } },
  "Gamma AI Pro": { productId: 65, slug: "gamma-ai-pro", variations: { "1 Tháng": 91, "3 Tháng": 92, "6 Tháng": 93, "1 Năm": 94 } },
  "Copilot Pro": { productId: 66, slug: "copilot-pro", variations: { "1 Tháng": 96, "3 Tháng": 97, "6 Tháng": 98, "1 Năm": 99 } },
  "Claude AI": { productId: 82, slug: "claude-ai", variations: { "1 Tháng": 101, "3 Tháng": 102, "6 Tháng": 103, "1 Năm": 104 } },
  "Google Meet + 2TB": { productId: 83, slug: "google-meet-2tb", variations: { "1 Tháng": 106, "1 Năm": 107 } },
  "Zoom Pro": { productId: 84, slug: "zoom-pro", variations: { "1 Tháng": 114, "1 Năm": 115 } },
  "Netflix Premium 4K": { productId: 85, slug: "netflix-premium-4k", variations: { "1 Tháng": 117, "3 Tháng": 118, "6 Tháng": 119, "1 Năm": 120 } },
  "ELSA Premium": { productId: 109, slug: "elsa-premium", variations: { "1 Tháng": 122, "1 Năm": 123 } },
  "Duolingo Super": { productId: 110, slug: "duolingo-super", variations: { "1 Tháng": 125, "1 Năm": 126 } },
  "HMA VPN": { productId: 111, slug: "hma-vpn", variations: { "1 Tháng": 128, "1 Năm": 129 } },
  "Express VPN": { productId: 112, slug: "express-vpn", variations: { "1 Tháng": 131, "1 Năm": 132 } },
  NordVPN: { productId: 113, slug: "nordvpn", variations: { "1 Tháng": 134, "1 Năm": 135 } },
};

export function buildCheckoutUrl(
  productName: string,
  _planLabel: string,
  _fullName?: string,
  _phone?: string,
): string | null {
  const entry = WC_MAPPING[productName];
  if (!entry) return null;
  return `${SHOP_URL}/product/${entry.slug}/`;
}

function parsePrice(priceStr: string): number {
  return parseInt(priceStr.replace(/[^\d]/g, ""), 10) || 0;
}

export async function submitSepayCheckout(
  productName: string,
  planLabel: string,
  priceStr: string,
  name: string,
  phone: string,
): Promise<boolean> {
  const amount = parsePrice(priceStr);
  if (!amount) return false;

  const res = await fetch("/api/sepay-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, productName, planLabel, amount }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  if (!data.checkout_url || !data.fields) return false;

  const form = document.createElement("form");
  form.method = "POST";
  form.action = data.checkout_url;
  form.style.display = "none";
  Object.entries(data.fields).forEach(([k, v]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = k;
    input.value = String(v);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
  return true;
}
