export const SHOP_URL = "https://shop.tvhcanva.com";

type WcEntry = {
  productId: number;
  variations: Record<string, number>;
};

export const WC_MAPPING: Record<string, WcEntry> = {
  "Capcut Pro": { productId: 17, variations: { "1 Tháng": 30 } },
  "Canva Pro": { productId: 18, variations: { "1 Tháng": 32, "1 Năm": 33 } },
  "Google One 2TB": { productId: 19, variations: { "1 Năm": 35 } },
  "iCloud+ 400GB": { productId: 20, variations: { "1 Năm": 37 } },
  "ChatGPT Plus": { productId: 21, variations: { "1 Tháng": 39 } },
  "Google AI Ultra": {
    productId: 22,
    variations: { "1 Tháng": 41, "3 Tháng": 42, "6 Tháng": 43, "1 Năm": 44 },
  },
  "Spotify Premium": { productId: 23, variations: { "1 Năm": 52 } },
  "Youtube Premium": { productId: 24, variations: { "1 Năm": 54 } },
  "Office 365": { productId: 25, variations: { "1 Năm": 56 } },
  "Kaspersky Premium": { productId: 26, variations: { "1 Năm": 58 } },
  "Quillbot Premium": { productId: 27, variations: { "1 Năm": 60 } },
  "Grammarly Pro + AI": {
    productId: 28,
    variations: { "1 Tháng": 62, "3 Tháng": 63, "6 Tháng": 64, "1 Năm": 67 },
  },
  "Adobe Full App": { productId: 45, variations: { "1 Năm": 69 } },
  "Autodesk AutoCAD": { productId: 46, variations: { "1 Năm": 71 } },
  "Figma Pro": { productId: 47, variations: { "1 Tháng": 73 } },
  "Freepik Premium": { productId: 48, variations: { "6 Tháng": 75 } },
  SuperGrok: {
    productId: 49,
    variations: { "1 Tháng": 77, "3 Tháng": 78, "6 Tháng": 79, "1 Năm": 80 },
  },
  "Leonardo AI": {
    productId: 50,
    variations: { "1 Tháng": 86, "3 Tháng": 87, "6 Tháng": 88, "1 Năm": 89 },
  },
  "Gamma AI Pro": {
    productId: 65,
    variations: { "1 Tháng": 91, "3 Tháng": 92, "6 Tháng": 93, "1 Năm": 94 },
  },
  "Copilot Pro": {
    productId: 66,
    variations: { "1 Tháng": 96, "3 Tháng": 97, "6 Tháng": 98, "1 Năm": 99 },
  },
  "Claude AI": {
    productId: 82,
    variations: { "1 Tháng": 101, "3 Tháng": 102, "6 Tháng": 103, "1 Năm": 104 },
  },
  "Google Meet + 2TB": {
    productId: 83,
    variations: { "1 Tháng": 106, "1 Năm": 107 },
  },
  "Zoom Pro": { productId: 84, variations: { "1 Tháng": 114, "1 Năm": 115 } },
  "Netflix Premium 4K": {
    productId: 85,
    variations: { "1 Tháng": 117, "3 Tháng": 118, "6 Tháng": 119, "1 Năm": 120 },
  },
  "ELSA Premium": {
    productId: 109,
    variations: { "1 Tháng": 122, "1 Năm": 123 },
  },
  "Duolingo Super": {
    productId: 110,
    variations: { "1 Tháng": 125, "1 Năm": 126 },
  },
  "HMA VPN": { productId: 111, variations: { "1 Tháng": 128, "1 Năm": 129 } },
  "Express VPN": {
    productId: 112,
    variations: { "1 Tháng": 131, "1 Năm": 132 },
  },
  NordVPN: { productId: 113, variations: { "1 Tháng": 134, "1 Năm": 135 } },
};

export function buildCheckoutUrl(
  productName: string,
  planLabel: string,
  fullName?: string,
  phone?: string,
): string | null {
  const entry = WC_MAPPING[productName];
  if (!entry) return null;

  const variationId = entry.variations[planLabel];
  const params = new URLSearchParams();
  params.set("add-to-cart", String(entry.productId));
  if (variationId) {
    params.set("variation_id", String(variationId));
    params.set("attribute_pa_goi", planLabel.toLowerCase().replace(/\s+/g, "-"));
  }
  params.set("quantity", "1");
  if (fullName) params.set("billing_first_name", fullName);
  if (phone) params.set("billing_phone", phone);

  return `${SHOP_URL}/?${params.toString()}`;
}
