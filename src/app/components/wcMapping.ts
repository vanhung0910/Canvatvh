export const SHOP_URL = "https://shop.tvhcanva.com";

type WcEntry = {
  productId: number;
  slug: string;
  variations: Record<string, number>;
};

/**
 * WC_MAPPING: Ánh xạ tên sản phẩm → WooCommerce product ID + variation IDs.
 * Cập nhật theo danh sách sản phẩm hiện tại trong App.tsx.
 * Các sản phẩm mới (ID >= 200) cần được tạo trên WooCommerce tại shop.tvhcanva.com.
 */
export const WC_MAPPING: Record<string, WcEntry> = {
  // ===== ĐANG BÁN CHẠY =====
  "Capcut Pro":         { productId: 17,  slug: "capcut-pro",         variations: { "1 Tháng": 30 } },
  "Canva Pro":          { productId: 18,  slug: "canva-pro",          variations: { "1 Tháng": 32, "1 Năm": 33 } },
  "Google One 5TB":     { productId: 19,  slug: "google-one-5tb",     variations: { "1 Năm": 35 } },
  "ChatGPT Plus":       { productId: 21,  slug: "chatgpt-plus",       variations: { "1 Tháng": 39 } },
  "Spotify Premium":    { productId: 23,  slug: "spotify-premium",    variations: { "1 Tháng": 200, "3 Tháng": 201, "1 Năm": 52 } },
  "Youtube Premium":    { productId: 24,  slug: "youtube-premium",    variations: { "1 Năm": 54 } },
  "Netflix Premium 4K": { productId: 85,  slug: "netflix-premium-4k", variations: { "1 Tháng": 117 } },
  "Office 365":         { productId: 25,  slug: "office-365",         variations: { "1 Năm": 56 } },
  "Quillbot Premium":   { productId: 27,  slug: "quillbot-premium",   variations: { "1 Năm": 60 } },
  "Grammarly Pro + AI": { productId: 28,  slug: "grammarly-pro-ai",   variations: { "1 Tháng": 62 } },

  // ===== THIẾT KẾ =====
  "Adobe Full App":     { productId: 45,  slug: "adobe-full-app",     variations: { "1 Năm": 69 } },
  "Autodesk AutoCAD":   { productId: 46,  slug: "autodesk-autocad",   variations: { "1 Năm": 71 } },
  "Figma Pro":          { productId: 47,  slug: "figma-pro",          variations: { "1 Tháng": 73 } },
  "Meitu Vip":          { productId: 202, slug: "meitu-vip",          variations: { "1 Tháng": 203, "3 Tháng": 204 } },

  // ===== TRỢ LÝ AI =====
  "SuperGrok":          { productId: 49,  slug: "supergrok",          variations: { "1 Tháng": 77, "3 Tháng": 78, "6 Tháng": 79, "1 Năm": 80 } },
  "Leonardo AI":        { productId: 50,  slug: "leonardo-ai",        variations: { "1 Tháng": 86, "3 Tháng": 87, "6 Tháng": 88, "1 Năm": 89 } },
  "Gamma AI Pro":       { productId: 65,  slug: "gamma-ai-pro",       variations: { "1 Tháng": 91, "3 Tháng": 92, "6 Tháng": 93, "1 Năm": 94 } },
  "Copilot Pro":        { productId: 66,  slug: "copilot-pro",        variations: { "1 Tháng": 96, "3 Tháng": 97, "6 Tháng": 98, "1 Năm": 99 } },
  "GenSpark Plus":      { productId: 210, slug: "genspark-plus",      variations: { "1 Tháng": 211, "3 Tháng": 212, "6 Tháng": 213, "1 Năm": 214 } },
  "InVideo Plus":       { productId: 215, slug: "invideo-plus",       variations: { "1 Tháng": 216, "3 Tháng": 217, "6 Tháng": 218, "1 Năm": 219 } },
  "Vidu AI":            { productId: 220, slug: "vidu-ai",            variations: { "1 Tháng": 221, "3 Tháng": 222, "6 Tháng": 223, "1 Năm": 224 } },
  "Hailuo AI Pro":      { productId: 225, slug: "hailuo-ai-pro",      variations: { "1 Tháng": 226, "3 Tháng": 227, "6 Tháng": 228, "1 Năm": 229 } },
  "Suno AI":            { productId: 230, slug: "suno-ai",            variations: { "1 Tháng": 231, "3 Tháng": 232, "6 Tháng": 233, "1 Năm": 234 } },
  "Claude AI":          { productId: 82,  slug: "claude-ai",          variations: { "1 Tháng": 101, "3 Tháng": 102, "6 Tháng": 103, "1 Năm": 104 } },
  "Kling AI":           { productId: 235, slug: "kling-ai",           variations: { "1 Tháng": 236, "3 Tháng": 237, "6 Tháng": 238, "1 Năm": 239 } },
  "HeyGen AI":          { productId: 240, slug: "heygen-ai",          variations: { "1 Tháng": 241, "3 Tháng": 242, "6 Tháng": 243, "1 Năm": 244 } },
  "Runway AI":          { productId: 245, slug: "runway-ai",          variations: { "1 Tháng": 246, "3 Tháng": 247, "6 Tháng": 248, "1 Năm": 249 } },
  "Monica AI Unlimited":{ productId: 250, slug: "monica-ai-unlimited",variations: { "1 Tháng": 251, "3 Tháng": 252, "6 Tháng": 253, "1 Năm": 254 } },
  "Minimax Audio AI":   { productId: 255, slug: "minimax-audio-ai",   variations: { "1 Tháng": 256, "3 Tháng": 257, "6 Tháng": 258, "1 Năm": 259 } },

  // ===== LÀM VIỆC =====
  "Google Meet + 2TB":  { productId: 83,  slug: "google-meet-2tb",    variations: { "1 Tháng": 106, "3 Tháng": 260, "6 Tháng": 261, "1 Năm": 107 } },
  "Zoom Pro":           { productId: 84,  slug: "zoom-pro",           variations: { "1 Tháng": 114, "3 Tháng": 262, "6 Tháng": 263, "1 Năm": 115 } },
  "Linkedin Business":  { productId: 265, slug: "linkedin-business",  variations: { "1 Tháng": 266, "3 Tháng": 267, "6 Tháng": 268, "1 Năm": 269 } },
  "CamScanner":         { productId: 270, slug: "camscanner",         variations: { "1 Tháng": 271, "3 Tháng": 272, "6 Tháng": 273, "1 Năm": 274 } },

  // ===== XEM PHIM - GIẢI TRÍ =====
  "VieON VIP HBO":      { productId: 275, slug: "vieon-vip-hbo",      variations: { "1 Tháng": 276, "3 Tháng": 277, "6 Tháng": 278, "1 Năm": 279 } },
  "FPT Smax":           { productId: 280, slug: "fpt-smax",           variations: { "1 Tháng": 281, "3 Tháng": 282, "6 Tháng": 283, "1 Năm": 284 } },
  "MyTV Sport":         { productId: 285, slug: "mytv-sport",         variations: { "1 Tháng": 286, "3 Tháng": 287, "6 Tháng": 288, "1 Năm": 289 } },
  "iQIYI Premium":      { productId: 290, slug: "iqiyi-premium",      variations: { "1 Tháng": 291, "3 Tháng": 292, "6 Tháng": 293, "1 Năm": 294 } },
  "Clip TV":            { productId: 295, slug: "clip-tv",            variations: { "1 Tháng": 296, "3 Tháng": 297, "6 Tháng": 298, "1 Năm": 299 } },
  "TV360 Super VIP":    { productId: 300, slug: "tv360-super-vip",    variations: { "1 Tháng": 301, "3 Tháng": 302, "6 Tháng": 303, "1 Năm": 304 } },
  "Galaxy Play":        { productId: 305, slug: "galaxy-play",        variations: { "1 Năm": 306 } },
  "Youku VIP":          { productId: 307, slug: "youku-vip",          variations: { "1 Tháng": 308, "3 Tháng": 309, "6 Tháng": 310, "1 Năm": 311 } },
  "Chess.com Diamond":  { productId: 312, slug: "chesscom-diamond",   variations: { "1 Tháng": 313, "3 Tháng": 314, "6 Tháng": 315, "1 Năm": 316 } },
  "Tinder Platinum":    { productId: 317, slug: "tinder-platinum",    variations: { "1 Tháng": 318, "3 Tháng": 319, "6 Tháng": 320, "1 Năm": 321 } },
  "Bumble Premium":     { productId: 322, slug: "bumble-premium",     variations: { "1 Tháng": 323, "3 Tháng": 324, "6 Tháng": 325, "1 Năm": 326 } },

  // ===== HỌC TẬP =====
  "ELSA Premium":       { productId: 109, slug: "elsa-premium",       variations: { "1 Tháng": 122, "3 Tháng": 327, "6 Tháng": 328, "1 Năm": 123 } },
  "Duolingo Super":     { productId: 110, slug: "duolingo-super",     variations: { "1 Tháng": 125, "3 Tháng": 329, "6 Tháng": 330, "1 Năm": 126 } },
  "Udemy Business":     { productId: 331, slug: "udemy-business",     variations: { "1 Tháng": 332, "3 Tháng": 333, "6 Tháng": 334, "1 Năm": 335 } },
  "Coursera Plus":      { productId: 336, slug: "coursera-plus",      variations: { "1 Tháng": 337, "3 Tháng": 338, "6 Tháng": 339, "1 Năm": 340 } },
  "Quizlet":            { productId: 341, slug: "quizlet",            variations: { "1 Tháng": 342, "3 Tháng": 343, "6 Tháng": 344, "1 Năm": 345 } },
  "Chegg":              { productId: 346, slug: "chegg",              variations: { "1 Tháng": 347, "3 Tháng": 348, "6 Tháng": 349, "1 Năm": 350 } },
  "Notion Plus":        { productId: 351, slug: "notion-plus",        variations: { "1 Tháng": 352, "3 Tháng": 353, "1 Năm": 354 } },
  "Turnitin":           { productId: 355, slug: "turnitin",           variations: { "1 Tháng": 356, "3 Tháng": 357, "6 Tháng": 358, "1 Năm": 359 } },
  "Quizizz Super":      { productId: 360, slug: "quizizz-super",      variations: { "1 Tháng": 361, "3 Tháng": 362, "6 Tháng": 363, "1 Năm": 364 } },
  "Kahoot Silver":      { productId: 365, slug: "kahoot-silver",      variations: { "1 Tháng": 366, "3 Tháng": 367, "6 Tháng": 368, "1 Năm": 369 } },
  "StuDocu Premium":    { productId: 370, slug: "studocu-premium",    variations: { "1 Tháng": 371, "3 Tháng": 372, "6 Tháng": 373, "1 Năm": 374 } },
  "Ejoy Pro-Voca":      { productId: 375, slug: "ejoy-pro-voca",      variations: { "1 Tháng": 376, "3 Tháng": 377, "6 Tháng": 378, "1 Năm": 379 } },

  // ===== VPN GIÁ RẺ =====
  "HMA VPN":            { productId: 111, slug: "hma-vpn",            variations: { "1 Tháng": 128, "3 Tháng": 380, "6 Tháng": 381, "1 Năm": 129 } },
  "Express VPN":        { productId: 112, slug: "express-vpn",        variations: { "1 Tháng": 131, "3 Tháng": 382, "6 Tháng": 383, "1 Năm": 132 } },
  "NordVPN":            { productId: 113, slug: "nordvpn",            variations: { "1 Tháng": 134, "3 Tháng": 384, "6 Tháng": 385, "1 Năm": 135 } },
  "Surfshark VPN":      { productId: 386, slug: "surfshark-vpn",      variations: { "1 Tháng": 387, "3 Tháng": 388, "6 Tháng": 389, "1 Năm": 390 } },
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

export function parsePrice(priceStr: string): number {
  return parseInt(priceStr.replace(/[^\d]/g, ""), 10) || 0;
}

export type SepayOrder = {
  order_code: string;
  is_canva: boolean;
  qr_url: string;
  account_number: string;
  bank_name: string;
  account_holder?: string;
  amount: number;
};

export type SepayOrderStatus = {
  status: "Pending" | "Paid";
  canva_link?: string;
};

/** Tạo đơn thanh toán VietQR. Trả về mã đơn + QR để hiển thị cho khách. */
export async function createSepayOrder(
  productName: string,
  planLabel: string,
  priceStr: string,
  name: string,
  phone: string,
): Promise<SepayOrder> {
  const amount = parsePrice(priceStr);
  if (!amount) throw new Error("Số tiền không hợp lệ");

  const res = await fetch("/api/sepay-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, productName, planLabel, amount }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Không tạo được đơn hàng");
  return data as SepayOrder;
}

/** Đối chiếu giao dịch. Trả kèm link Canva nếu đơn Canva đã thanh toán. */
export async function getSepayOrderStatus(
  code: string,
  amount: number,
): Promise<SepayOrderStatus> {
  const res = await fetch(
    `/api/sepay-order-status?code=${encodeURIComponent(code)}&amount=${amount}`,
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Không tra cứu được đơn hàng");
  return data as SepayOrderStatus;
}
