# NHIỆM VỤ: Vá lỗi bảo mật + tối ưu SEO và tốc độ

Bạn là kỹ sư sửa code cho dự án này. Tài liệu này chứa ĐẦY ĐỦ nội dung mọi file
cần thay đổi. Áp dụng chính xác, không sáng tạo thêm.

## Ba vấn đề cần sửa

**1. Lỗ hổng sửa giá (nghiêm trọng nhất).**
`/api/sepay-checkout` đang nhận số tiền `amount` do frontend gửi lên và dùng
luôn con số đó để tạo đơn. Khách mở DevTools sửa `amount` là mua được hàng
599.000đ với giá 1.000đ, và chữ ký vẫn hợp lệ vì chính server ký. Bản vá đưa
bảng giá về phía server.

**2. Website đang tự chặn Google.**
`index.html` có `<meta name="robots" content="noindex, nofollow">` — dòng này
bảo Google đừng đưa trang vào kết quả tìm kiếm. Ngoài ra `lang="en"` cho một
trang tiếng Việt, và thẻ mô tả vẫn là văn bản mẫu của Figma Make nói về công
cụ nhân bản website.

**3. Trang tải nặng.**
61 ảnh sản phẩm tải cùng lúc khi mở trang, không có lazy-load.

## LUẬT BẮT BUỘC

1. **Thay TOÀN BỘ nội dung file** bằng đoạn code được cung cấp. Không giữ lại dòng nào của bản cũ.
2. **KHÔNG tự ý sửa, tối ưu, refactor, đổi tên biến, đổi format** ngoài những gì có trong đoạn code.
3. **KHÔNG thay đổi giao diện**: màu sắc, bố cục, khoảng cách, font, chữ hiển thị giữ nguyên.
4. **KHÔNG tự bịa nội dung file.** Mọi file đều có nội dung đầy đủ bên dưới. Nếu bạn thấy mình đang phải tự nghĩ ra code, nghĩa là đã làm sai — dừng lại và hỏi.
5. **TUYỆT ĐỐI KHÔNG tự sinh lại bảng giá** trong `api/_catalog.ts`. Đó là giá bán thật, phải copy nguyên văn từng ký tự.
6. Làm **đúng thứ tự 1 → 11**. File 2 import từ file 1; file 4 gọi hàm mới ở file 3.
7. Nếu phát hiện xung đột với code hiện tại, **DỪNG và hỏi**, đừng tự quyết.

## DANH SÁCH CẤM

Những việc dưới đây **không nằm trong nhiệm vụ này**:

- **KHÔNG đổi bất kỳ URL, tên miền hay đường dẫn nào đang chạy.** Website đang hoạt động bình thường. Giữ nguyên `req.headers.origin`, giữ nguyên `success_url`/`error_url`/`cancel_url`, giữ nguyên `checkout_url`, giữ nguyên CORS `*`.
- Không sửa `api/sepay-ipn.ts`
- Không sửa `supabase/functions/server/index.tsx` hay `kv_store.tsx`
- Không sửa `utils/supabase/info.tsx`
- Không sửa `package.json` — không thêm hay gỡ thư viện nào
- Không đổi dữ liệu sản phẩm trong `App.tsx`: tên, giá, ảnh, slotsLeft, plans, TESTIMONIALS
- Không đổi giá ChatGPT Plus — chủ dự án sẽ tự quyết sau
- Không đổi URL ảnh sản phẩm, không thêm srcSet, không đổi `s702x1053`
- Không tạo file `.env`, không đụng biến môi trường
- Không chạy lệnh build/test/deploy
- Không viết README, CHANGELOG hay tài liệu nào

---

# CÁC FILE CẦN THAY ĐỔI

## 1. `api/_catalog.ts` — TẠO MỚI

Bảng giá 60 sản phẩm phía server. Đây là nguồn giá DUY NHẤT dùng để tính tiền.

```ts
/**
 * BẢNG GIÁ CHÍNH THỨC — NGUỒN DUY NHẤT ĐỂ TÍNH TIỀN.
 *
 * File bắt đầu bằng dấu "_" nên Vercel KHÔNG coi đây là một API endpoint,
 * nó chỉ là module dùng chung cho các function trong /api.
 *
 * QUY TẮC: số tiền khách phải trả LUÔN lấy từ bảng này, không bao giờ
 * lấy từ dữ liệu client gửi lên. Muốn đổi giá thì sửa ở đây (và sửa giá
 * hiển thị tương ứng trong src/app/App.tsx).
 *
 * Đơn vị: VND (số nguyên).
 */
export const PRICES: Record<string, Record<string, number>> = {
  "Capcut Pro":              { "7 Ngày": 25000, "1 Tháng": 80000 },
  "Canva Pro":               { "1 Tháng": 15000, "1 Năm": 200000 },
  "Google One 5TB":          { "1 Năm": 399000 },
  "ChatGPT Plus":            { "1 Tháng (Cấp tài khoản)": 275000, "1 Tháng (Chính chủ)": 420000 },
  "Spotify Premium":         { "1 Tháng": 80000, "3 Tháng": 230000, "1 Năm": 399000 },
  "Youtube Premium":         { "1 Năm": 599000 },
  "Netflix Premium 4K":      { "1 Tháng": 85000 },
  "Office 365":              { "1 Năm": 299000 },
  "Quillbot Premium":        { "1 Năm": 299000 },
  "Grammarly Pro + AI":      { "1 Tháng": 100000 },
  "Adobe Full App":          { "1 Năm": 799000 },
  "Autodesk AutoCAD":        { "1 Năm": 299000 },
  "Figma Pro":               { "1 Tháng": 179000 },
  "Meitu Vip":               { "1 Tháng": 80000, "3 Tháng": 239000 },
  "SuperGrok":               { "1 Tháng": 199000 },
  "Leonardo AI":             { "1 Tháng": 239000 },
  "Gamma AI Pro":            { "1 Tháng": 99000 },
  "Copilot Pro":             { "1 Tháng": 129000 },
  "GenSpark Plus":           { "1 Tháng": 500000 },
  "InVideo Plus":            { "1 Tháng": 699000, "3 Tháng": 1899000, "6 Tháng": 3499000, "1 Năm": 5999000 },
  "Vidu AI":                 { "1 Tháng": 199000, "3 Tháng": 549000, "6 Tháng": 999000, "1 Năm": 1799000 },
  "Hailuo AI Pro":           { "1 Tháng": 699000, "3 Tháng": 1899000, "6 Tháng": 3499000, "1 Năm": 5999000 },
  "Suno AI":                 { "1 Tháng": 199000, "3 Tháng": 549000, "6 Tháng": 999000, "1 Năm": 1799000 },
  "Claude AI":               { "1 Tháng": 129000, "3 Tháng": 349000, "6 Tháng": 649000, "1 Năm": 1199000 },
  "Kling AI":                { "1 Tháng": 150000, "3 Tháng": 399000, "6 Tháng": 749000, "1 Năm": 1299000 },
  "HeyGen AI":               { "1 Tháng": 599000, "3 Tháng": 1599000, "6 Tháng": 2899000, "1 Năm": 4999000 },
  "Runway AI":               { "1 Tháng": 699000, "3 Tháng": 1899000, "6 Tháng": 3499000, "1 Năm": 5999000 },
  "Monica AI Unlimited":     { "1 Tháng": 199000, "3 Tháng": 549000, "6 Tháng": 999000, "1 Năm": 1799000 },
  "Minimax Audio AI":        { "1 Tháng": 299000, "3 Tháng": 799000, "6 Tháng": 1399000, "1 Năm": 2499000 },
  "Google Meet + 2TB":       { "1 Tháng": 299000, "3 Tháng": 799000, "6 Tháng": 1399000, "1 Năm": 2499000 },
  "Zoom Pro":                { "1 Tháng": 119000, "3 Tháng": 319000, "6 Tháng": 599000, "1 Năm": 999000 },
  "Linkedin Business":       { "1 Tháng": 950000, "3 Tháng": 2599000, "6 Tháng": 4799000, "1 Năm": 8499000 },
  "CamScanner":              { "1 Tháng": 399000, "3 Tháng": 1099000, "6 Tháng": 1999000, "1 Năm": 3499000 },
  "VieON VIP HBO":           { "1 Tháng": 299000, "3 Tháng": 799000, "6 Tháng": 1399000, "1 Năm": 2499000 },
  "FPT Smax":                { "1 Tháng": 199000, "3 Tháng": 539000, "6 Tháng": 999000, "1 Năm": 1799000 },
  "MyTV Sport":              { "1 Tháng": 125000, "3 Tháng": 339000, "6 Tháng": 629000, "1 Năm": 1099000 },
  "iQIYI Premium":           { "1 Tháng": 299000, "3 Tháng": 799000, "6 Tháng": 1399000, "1 Năm": 2499000 },
  "Clip TV":                 { "1 Tháng": 359000, "3 Tháng": 979000, "6 Tháng": 1799000, "1 Năm": 3199000 },
  "TV360 Super VIP":         { "1 Tháng": 125000, "3 Tháng": 339000, "6 Tháng": 629000, "1 Năm": 1099000 },
  "Galaxy Play":             { "1 Năm": 399000 },
  "Youku VIP":               { "1 Tháng": 299000, "3 Tháng": 799000, "6 Tháng": 1399000, "1 Năm": 2499000 },
  "Chess.com Diamond":       { "1 Tháng": 500000, "3 Tháng": 1399000, "6 Tháng": 2499000, "1 Năm": 4499000 },
  "Tinder Platinum":         { "1 Tháng": 450000, "3 Tháng": 1199000, "6 Tháng": 2199000, "1 Năm": 3999000 },
  "Bumble Premium":          { "1 Tháng": 450000, "3 Tháng": 1199000, "6 Tháng": 2199000, "1 Năm": 3999000 },
  "ELSA Premium":            { "1 Tháng": 1350000, "3 Tháng": 3699000, "6 Tháng": 6799000, "1 Năm": 11999000 },
  "Duolingo Super":          { "1 Tháng": 199000, "3 Tháng": 549000, "6 Tháng": 999000, "1 Năm": 1799000 },
  "Udemy Business":          { "1 Tháng": 550000, "3 Tháng": 1499000, "6 Tháng": 2799000, "1 Năm": 4999000 },
  "Coursera Plus":           { "1 Tháng": 529000, "3 Tháng": 1449000, "6 Tháng": 2699000, "1 Năm": 4799000 },
  "Quizlet":                 { "1 Tháng": 299000, "3 Tháng": 799000, "6 Tháng": 1399000, "1 Năm": 2499000 },
  "Chegg":                   { "1 Tháng": 259000, "3 Tháng": 699000, "6 Tháng": 1299000, "1 Năm": 2299000 },
  "Notion Plus":             { "1 Tháng": 799000, "3 Tháng": 2199000, "6 Tháng": 3999000, "1 Năm": 6999000 },
  "Turnitin":                { "1 Tháng": 260000, "3 Tháng": 699000, "6 Tháng": 1299000, "1 Năm": 2299000 },
  "Quizizz Super":           { "1 Tháng": 450000, "3 Tháng": 1199000, "6 Tháng": 2199000, "1 Năm": 3999000 },
  "Kahoot Silver":           { "1 Tháng": 150000, "3 Tháng": 399000, "6 Tháng": 749000, "1 Năm": 1299000 },
  "StuDocu Premium":         { "1 Tháng": 350000, "3 Tháng": 949000, "6 Tháng": 1749000, "1 Năm": 2999000 },
  "Ejoy Pro-Voca":           { "1 Tháng": 399000, "3 Tháng": 1099000, "6 Tháng": 1999000, "1 Năm": 3499000 },
  "HMA VPN":                 { "1 Tháng": 69000, "3 Tháng": 189000, "6 Tháng": 349000, "1 Năm": 599000 },
  "Express VPN":             { "1 Tháng": 69000, "3 Tháng": 189000, "6 Tháng": 349000, "1 Năm": 599000 },
  "NordVPN":                 { "1 Tháng": 69000, "3 Tháng": 189000, "6 Tháng": 349000, "1 Năm": 599000 },
  "Surfshark VPN":           { "1 Tháng": 399000, "3 Tháng": 1099000, "6 Tháng": 1999000, "1 Năm": 3499000 },
};

/** Trả về giá hợp lệ, hoặc null nếu sản phẩm/gói không tồn tại. */
export function getPrice(
  productName: unknown,
  planLabel: unknown,
): number | null {
  if (typeof productName !== "string" || typeof planLabel !== "string") return null;
  const plans = PRICES[productName.trim()];
  if (!plans) return null;
  const amount = plans[planLabel.trim()];
  return typeof amount === "number" && amount > 0 ? amount : null;
}

/** Đơn Canva Pro 1 tháng — đơn duy nhất được trả link mời Canva tự động. */
export function isCanvaOrder(productName: string, planLabel: string): boolean {
  return productName.trim() === "Canva Pro" && planLabel.trim() === "1 Tháng";
}
```

---

## 2. `api/sepay-checkout.ts` — THAY TOÀN BỘ

Tra giá từ api/_catalog.ts thay vì tin số tiền client gửi lên. Mọi thứ khác (CORS, cách dựng success_url từ req.headers.origin, checkoutUrl, cách ký HMAC) giữ nguyên y hệt bản cũ.

```ts
import crypto from "node:crypto";
import { getPrice, isCanvaOrder } from "./_catalog";

export const config = { runtime: "nodejs" };

/**
 * Tạo phiên thanh toán SePay.
 *
 * THAY ĐỔI DUY NHẤT VỀ LOGIC: số tiền không còn lấy từ client.
 * Server tra giá trong api/_catalog.ts. Trước đây khách mở DevTools
 * sửa `amount` là mua được hàng 599.000đ với giá 1.000đ.
 *
 * GIỮ NGUYÊN: cách dựng success_url/error_url/cancel_url từ req.headers.origin,
 * CORS, checkoutUrl, cách ký HMAC — tất cả y hệt bản cũ.
 */

const SIGNED_FIELDS = [
  "merchant",
  "operation",
  "payment_method",
  "order_amount",
  "currency",
  "order_invoice_number",
  "order_description",
  "customer_id",
  "success_url",
  "error_url",
  "cancel_url",
];

function signFields(fields: Record<string, string>, secret: string): string {
  const parts: string[] = [];
  for (const key of Object.keys(fields)) {
    if (SIGNED_FIELDS.includes(key) && fields[key] !== undefined) {
      parts.push(`${key}=${fields[key]}`);
    }
  }
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(parts.join(","));
  return hmac.digest("base64");
}

/** Cắt bớt và bỏ ký tự điều khiển để không phá order_description gửi sang SePay. */
function clean(input: unknown, maxLen: number): string {
  return String(input ?? "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    // Endpoint chẩn đoán: chỉ mở khi có DIAG_TOKEN khớp.
    // Trước đây ai cũng xem được trạng thái cấu hình bảo mật của bạn.
    const diagToken = process.env.DIAG_TOKEN;
    if (!diagToken || req.query?.key !== diagToken) {
      return res.status(404).json({ error: "Not found" });
    }
    return res.status(200).json({
      ok: true,
      message: "Sepay checkout endpoint ready",
      env: process.env.SEPAY_ENV || "sandbox",
      has_merchant: !!process.env.SEPAY_MERCHANT_ID,
      has_secret: !!process.env.SEPAY_SECRET_KEY,
    });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const merchant = process.env.SEPAY_MERCHANT_ID;
  const secret = process.env.SEPAY_SECRET_KEY;
  const env = process.env.SEPAY_ENV || "sandbox";

  if (!merchant || !secret) {
    return res.status(500).json({ error: "Sepay credentials not configured" });
  }

  const checkoutUrl =
    env === "production"
      ? "https://pay.sepay.vn/v1/checkout/init"
      : "https://pay-sandbox.sepay.vn/v1/checkout/init";

  let body: any;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
  }

  const name = clean(body?.name, 60);
  const phone = clean(body?.phone, 60);
  const productName = clean(body?.productName, 80);
  const planLabel = clean(body?.planLabel, 40);

  if (!name || !phone || !productName || !planLabel) {
    return res.status(400).json({ error: "Vui lòng nhập đủ thông tin" });
  }

  // ===== ĐIỂM MẤU CHỐT =====
  // Giá lấy từ bảng giá phía server. body.amount bị bỏ qua hoàn toàn.
  const amount = getPrice(productName, planLabel);
  if (amount === null) {
    console.warn(`Từ chối đơn: sản phẩm/gói không hợp lệ — "${productName}" / "${planLabel}"`);
    return res.status(400).json({ error: "Sản phẩm hoặc gói không hợp lệ" });
  }

  // Ghi log khi client gửi giá khác giá thật — dấu hiệu có người đang dò.
  const claimed = Number(body?.amount);
  if (Number.isFinite(claimed) && claimed !== amount) {
    console.warn(
      `Client gửi amount=${claimed} nhưng giá thật là ${amount} cho "${productName}" / "${planLabel}"`,
    );
  }

  // Đơn Canva Pro 1 tháng dùng tiền tố "TVHC" để nhận diện đơn cần trả link Canva.
  // Thêm hậu tố ngẫu nhiên vì mã cũ chỉ là Date.now() nên đoán được.
  const isCanva = isCanvaOrder(productName, planLabel);
  const rand = crypto.randomBytes(5).toString("hex").toUpperCase();
  const invoiceNumber = `${isCanva ? "TVHC" : "TVH"}${Date.now()}${rand}`;

  // GIỮ NGUYÊN như bản cũ.
  const origin = req.headers.origin || "https://tvhcanva.com";

  const fields: Record<string, string> = {
    merchant,
    operation: "PURCHASE",
    payment_method: "BANK_TRANSFER",
    currency: "VND",
    order_amount: String(amount),
    order_invoice_number: invoiceNumber,
    order_description: clean(`${productName} - ${planLabel} - ${name} ${phone}`, 190),
    customer_id: phone,
    success_url: `${origin}/?payment=success&inv=${invoiceNumber}`,
    error_url: `${origin}/?payment=error&inv=${invoiceNumber}`,
    cancel_url: `${origin}/?payment=cancel&inv=${invoiceNumber}`,
  };

  fields.signature = signFields(fields, secret);

  // Báo đơn mới (chờ thanh toán) về Telegram.
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChat = process.env.TELEGRAM_CHAT_ID;
  if (tgToken && tgChat) {
    const text =
      `🆕 ĐƠN MỚI (chờ thanh toán)\n` +
      `Mã: ${invoiceNumber}\n` +
      `Sản phẩm: ${productName} - ${planLabel}\n` +
      `Khách: ${name} - ${phone}\n` +
      `Số tiền: ${amount.toLocaleString("vi-VN")}đ`;
    try {
      const r = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: tgChat, text }),
      });
      if (!r.ok) {
        // Trước đây lỗi bị nuốt im lặng -> mất đơn mà không ai biết.
        console.error(`Telegram lỗi (đơn ${invoiceNumber}): HTTP ${r.status} ${await r.text()}`);
      }
    } catch (err) {
      console.error(`Telegram lỗi kết nối (đơn ${invoiceNumber}): ${String(err)}`);
    }
  }

  return res.status(200).json({
    checkout_url: checkoutUrl,
    fields,
    invoice_number: invoiceNumber,
    amount,
  });
}
```

---

## 3. `src/app/components/wcMapping.ts` — THAY TOÀN BỘ

Bỏ WC_MAPPING / buildCheckoutUrl / SHOP_URL / parsePrice (code chết, không nơi nào dùng). submitSepayCheckout không còn gửi giá lên server.

```ts
import { projectId, publicAnonKey } from "/utils/supabase/info";

const SUPABASE_FN_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d3e30ca`;

export type CanvaStatus = {
  status: "Pending" | "Paid";
  canva_link?: string;
};

/**
 * Hỏi trạng thái đơn sau khi thanh toán. Chỉ đơn Canva đã thanh toán mới kèm link.
 * Link Canva do server Supabase giữ, không có trong bundle.
 */
export async function getCanvaStatus(invoice: string): Promise<CanvaStatus> {
  const res = await fetch(
    `${SUPABASE_FN_URL}/canva-link?inv=${encodeURIComponent(invoice)}`,
    { headers: { Authorization: `Bearer ${publicAnonKey}` } },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Không tra cứu được đơn hàng");
  return data as CanvaStatus;
}

export type CheckoutResult = { ok: true } | { ok: false; error: string };

/**
 * Tạo phiên thanh toán rồi submit form sang SePay.
 *
 * LƯU Ý: không còn gửi số tiền lên server nữa.
 * Server tự tra giá trong api/_catalog.ts — đây là điểm chặn lỗ hổng
 * khách tự sửa giá trong DevTools.
 */
export async function submitSepayCheckout(
  productName: string,
  planLabel: string,
  name: string,
  phone: string,
): Promise<CheckoutResult> {
  let res: Response;
  try {
    res = await fetch("/api/sepay-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, productName, planLabel }),
    });
  } catch {
    return { ok: false, error: "Không kết nối được máy chủ. Vui lòng thử lại." };
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* bỏ qua, xử lý bên dưới */
  }

  if (!res.ok) {
    return {
      ok: false,
      error: data?.error || "Không tạo được đơn hàng. Vui lòng liên hệ Zalo.",
    };
  }
  if (!data?.checkout_url || !data?.fields) {
    return { ok: false, error: "Phản hồi cổng thanh toán không hợp lệ." };
  }

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
  return { ok: true };
}
```

---

## 4. `src/app/components/OrderModal.tsx` — THAY TOÀN BỘ

Giao diện giữ nguyên. Đổi cách gọi API (4 tham số), thay alert() bằng khung báo lỗi đỏ, tách rõ hai gói ChatGPT.

```tsx
import { useState } from "react";
import { X } from "lucide-react";
import type { Product } from "./ProductCard";
import { submitSepayCheckout } from "./wcMapping";

interface OrderModalProps {
  product: Product;
  onClose: () => void;
}

/**
 * Nhãn gói ChatGPT phải TRÙNG KHỚP với key trong api/_catalog.ts,
 * vì server dựa vào (productName, planLabel) để tra giá.
 */
const CHATGPT_PLANS = {
  share: {
    planLabel: "1 Tháng (Cấp tài khoản)",
    optionText: "ChatGPT Plus (Cấp tài khoản)",
    price: "275.000đ",
  },
  "chinh-chu": {
    planLabel: "1 Tháng (Chính chủ)",
    optionText: "ChatGPT Plus (Chính chủ)",
    price: "420.000đ",
  },
} as const;

export function OrderModal({ product, onClose }: OrderModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(
    product.plans[0]?.label || "",
  );
  const [chatgptType, setChatgptType] =
    useState<keyof typeof CHATGPT_PLANS>("share");
  const [paymentMethod] = useState("Chuyển khoản");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isChatGPT = product.name.toLowerCase().includes("chatgpt");

  const selectedPlanData = product.plans.find(
    (p) => p.label === selectedPlan,
  );

  const displayPrice = isChatGPT
    ? CHATGPT_PLANS[chatgptType].price
    : selectedPlanData?.price || "";

  const handleOrder = async () => {
    setError(null);
    if (!fullName.trim() || !phone.trim()) {
      setError("Vui lòng nhập đầy đủ tên và thông tin liên hệ.");
      return;
    }
    setLoading(true);
    const planLabel = isChatGPT
      ? CHATGPT_PLANS[chatgptType].planLabel
      : selectedPlan;

    const result = await submitSepayCheckout(
      product.name,
      planLabel,
      fullName.trim(),
      phone.trim(),
    );

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
    }
    // Nếu ok: trình duyệt đang chuyển sang trang SePay, giữ nguyên trạng thái loading.
  };

  const handleConsult = () => {
    window.open(
      "https://www.facebook.com/groups/tvhcanva",
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`Đặt mua ${product.name}`}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Header */}
        <div
          className="text-center py-4 px-6"
          style={{
            background:
              "linear-gradient(135deg, #1a1a4e 0%, #5b2fa0 100%)",
          }}
        >
          <h2
            className="text-white"
            style={{
              fontSize: "1.4rem",
              fontWeight: 900,
              fontStyle: "italic",
              textTransform: "uppercase",
            }}
          >
            ĐẶT MUA TÀI KHOẢN
          </h2>
        </div>

        {/* Product name + close */}
        <div className="relative px-6 pt-5 pb-3 text-center">
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              fontStyle: "italic",
              color: "#7c3aed",
            }}
          >
            {product.name} Giá Rẻ
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute top-4 right-4 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Name & Phone row */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tên"
              autoComplete="name"
              maxLength={60}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
            />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="SĐT / Zalo hoặc Email"
              autoComplete="tel"
              maxLength={60}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
            />
          </div>

          {/* Product & Plan row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              {isChatGPT ? (
                <select
                  aria-label="Loại tài khoản ChatGPT"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 appearance-none bg-white text-sm pr-8"
                  value={chatgptType}
                  onChange={(e) =>
                    setChatgptType(
                      e.target.value as keyof typeof CHATGPT_PLANS,
                    )
                  }
                >
                  {(
                    Object.keys(CHATGPT_PLANS) as (keyof typeof CHATGPT_PLANS)[]
                  ).map((k) => (
                    <option key={k} value={k}>
                      {CHATGPT_PLANS[k].optionText}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  aria-label="Sản phẩm"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 appearance-none bg-white text-sm pr-8"
                  disabled
                  value={product.name}
                >
                  <option>{product.name}</option>
                </select>
              )}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path
                    d="M3 5l3 3 3-3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
            <div className="relative">
              {isChatGPT ? (
                <select
                  aria-label="Thời hạn"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 appearance-none bg-white text-sm pr-8"
                  disabled
                >
                  <option>1 tháng</option>
                </select>
              ) : (
                <select
                  aria-label="Chọn gói"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 appearance-none bg-white text-sm pr-8"
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                >
                  {product.plans.map((plan) => (
                    <option key={plan.label} value={plan.label}>
                      {plan.label}
                    </option>
                  ))}
                </select>
              )}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path
                    d="M3 5l3 3 3-3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="border border-gray-300 rounded-lg px-4 py-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="w-4 h-4 rounded-full border-2 border-purple-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
              </div>
              <span
                className="text-sm text-gray-700"
                style={{ fontWeight: 600 }}
              >
                {paymentMethod}
              </span>
            </label>
          </div>

          {/* Total */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
            <span
              className="text-gray-700"
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                fontStyle: "italic",
              }}
            >
              Tổng tiền
            </span>
            <span
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#1a1a4e",
              }}
            >
              {displayPrice}
            </span>
          </div>

          {/* Lỗi (thay cho alert()) */}
          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm"
            >
              {error}
            </div>
          )}

          {/* Order button */}
          <button
            type="button"
            onClick={handleOrder}
            disabled={loading}
            className="w-full text-white py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
            style={{
              background:
                "linear-gradient(135deg, #c054c0 0%, #e06080 100%)",
              fontSize: "1.1rem",
              fontWeight: 900,
              fontStyle: "italic",
              textTransform: "uppercase",
            }}
          >
            {loading ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG NGAY"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t-2 border-dashed border-gray-300" />
            <span
              className="text-purple-500"
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                fontStyle: "italic",
              }}
            >
              hoặc
            </span>
            <div className="flex-1 border-t-2 border-dashed border-gray-300" />
          </div>

          {/* Consult button */}
          <button
            type="button"
            onClick={handleConsult}
            className="w-full text-white py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              background:
                "linear-gradient(135deg, #7c3aed 0%, #5b2fa0 100%)",
              fontSize: "1.1rem",
              fontWeight: 900,
              fontStyle: "italic",
              textTransform: "uppercase",
            }}
          >
            NHẬN TƯ VẤN THÊM
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. `src/app/components/ProductCard.tsx` — THAY TOÀN BỘ

Giao diện giữ nguyên 100%. Thêm lazy-load cho 61 ảnh sản phẩm và memo() để không render lại khi mở modal.

```tsx
import { memo } from "react";

interface Plan {
  label: string;
  price: string;
}

export interface Product {
  id: number;
  name: string;
  image: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  slotsLeft?: number;
  plans: Plan[];
  bgColor?: string;
}

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  /** Đặt true cho vài thẻ đầu tiên nằm trong màn hình đầu (nếu muốn ưu tiên tải). */
  priority?: boolean;
}

/**
 * TỐI ƯU (giao diện giữ nguyên 100%, chỉ đổi cách tải ảnh):
 *  - loading="lazy": 61 ảnh sản phẩm không còn tải cùng lúc lúc mở trang.
 *    Trình duyệt vẫn tải ngay những ảnh đang/sắp lọt vào màn hình, nên
 *    người dùng không thấy khác biệt, chỉ tiết kiệm băng thông.
 *  - decoding="async": giải mã ảnh ngoài luồng chính, cuộn mượt hơn.
 *  - width/height: cho trình duyệt biết tỉ lệ trước, tránh giật layout (CLS).
 *  - memo(): thẻ sản phẩm không render lại khi mở/đóng modal.
 */
function ProductCardBase({
  product,
  onClick,
  priority = false,
}: ProductCardProps) {
  const slotPercent = product.slotsLeft
    ? Math.min(product.slotsLeft * 12, 90)
    : 50;

  // fetchpriority chưa có trong kiểu JSX của React 18 → truyền qua spread.
  const imgPriorityAttrs: Record<string, string> = {
    fetchpriority: priority ? "high" : "low",
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group hover:-translate-y-1 border border-gray-100"
      onClick={() => onClick(product)}
    >
      {/* Image - crop to show logo + product name area */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: product.bgColor || "#f3f4f6",
          aspectRatio: "4 / 3",
        }}
      >
        <img
          src={product.image}
          alt={`${product.name} giá rẻ - TVHCanva`}
          className="w-full group-hover:scale-105 transition-transform duration-300"
          width={702}
          height={1053}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...imgPriorityAttrs}
          style={{
            objectFit: "cover",
            objectPosition: "top",
            height: "170%",
            marginTop: 0,
          }}
        />
      </div>

      {/* Info */}
      <div className="px-3 pt-3 pb-2">
        {/* Name */}
        <h3
          className="text-gray-900 mb-1 line-clamp-1"
          style={{ fontSize: "1.05rem", fontWeight: 700 }}
        >
          {product.name}
        </h3>

        {/* Price */}
        <div
          className="text-pink-500 mb-0.5"
          style={{ fontSize: "1.3rem", fontWeight: 800 }}
        >
          {product.price}
        </div>

        {/* Original price + discount */}
        <div className="flex items-center gap-2 mb-2">
          {product.originalPrice && (
            <span
              className="text-gray-400 line-through"
              style={{ fontSize: "0.8rem" }}
            >
              {product.originalPrice}
            </span>
          )}
          {product.discount && (
            <span
              className="text-pink-500"
              style={{ fontSize: "0.8rem", fontWeight: 700 }}
            >
              {product.discount}
            </span>
          )}
        </div>

        {/* Slots left */}
        {product.slotsLeft && (
          <div className="flex items-center gap-1.5 mb-2">
            <span style={{ fontSize: "1.2rem" }}>🔥</span>
            <div
              className="flex-1 relative rounded-full overflow-hidden"
              style={{ height: 24, background: "#e5e7eb" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${slotPercent}%`,
                  background:
                    "linear-gradient(90deg, #f97316, #facc15)",
                }}
              />
              <span
                className="absolute inset-0 flex items-center justify-center text-gray-700"
                style={{ fontSize: "0.72rem", fontWeight: 600 }}
              >
                Chỉ còn {product.slotsLeft} slots
              </span>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 pt-2">
          <button
            type="button"
            aria-label={`Mua ${product.name}`}
            className="w-full text-blue-500 hover:text-blue-700 transition-colors text-center"
            style={{ fontSize: "0.95rem", fontWeight: 700 }}
          >
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
}

export const ProductCard = memo(ProductCardBase);
```

---

## 6. `src/app/components/SeoHead.tsx` — TẠO MỚI

Chèn thẻ meta, Open Graph và dữ liệu có cấu trúc JSON-LD. Không render gì ra màn hình.

```tsx
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
```

---

## 7. `index.html` — THAY TOÀN BỘ

QUAN TRỌNG NHẤT: bản cũ có <meta name="robots" content="noindex, nofollow"> đang chặn Google lập chỉ mục toàn bộ website.

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>TVHCanva — Tài khoản bản quyền giá rẻ: Canva Pro, ChatGPT, Netflix, Spotify</title>
    <meta
      name="description"
      content="Mua tài khoản bản quyền giá rẻ, kích hoạt trong 5 phút: Canva Pro, CapCut Pro, ChatGPT Plus, Netflix Premium, Spotify, YouTube Premium, Office 365, VPN… Bảo hành trọn gói, hỗ trợ qua Zalo."
    />

    <!-- QUAN TRỌNG: dòng cũ là "noindex, nofollow" khiến Google KHÔNG lập chỉ mục website. -->
    <meta name="robots" content="index, follow, max-image-preview:large" />

    <link rel="canonical" href="https://www.tvhcanva.com/" />
    <meta name="theme-color" content="#1a1a4e" />

    <!-- Chia sẻ Facebook / Zalo (bot của họ không chạy JavaScript nên phải để tĩnh ở đây) -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="TVHCanva" />
    <meta
      property="og:title"
      content="TVHCanva — Tài khoản bản quyền giá rẻ: Canva Pro, ChatGPT, Netflix, Spotify"
    />
    <meta
      property="og:description"
      content="Tài khoản bản quyền giá rẻ, kích hoạt nhanh, bảo hành trọn gói. Canva Pro chỉ từ 15.000đ."
    />
    <meta property="og:url" content="https://www.tvhcanva.com/" />
    <meta property="og:image" content="https://www.tvhcanva.com/og-image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="vi_VN" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta
      name="twitter:title"
      content="TVHCanva — Tài khoản bản quyền giá rẻ"
    />
    <meta
      name="twitter:description"
      content="Canva Pro, CapCut Pro, ChatGPT Plus, Netflix, Spotify… giá rẻ, kích hoạt trong 5 phút."
    />
    <meta name="twitter:image" content="https://www.tvhcanva.com/og-image.jpg" />

    <!-- Tăng tốc tải 61 ảnh sản phẩm: mở sẵn kết nối tới CDN ngay từ đầu -->
    <link rel="preconnect" href="https://content.pancake.vn" crossorigin />
    <link rel="dns-prefetch" href="https://content.pancake.vn" />

    <style>
      html,
      body {
        height: 100%;
        margin: 0;
      }
      #root {
        height: 100%;
      }
    </style>
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 8. `vercel.json` — TẠO MỚI

Cache headers + security headers. Đặt ở thư mục gốc, ngang hàng package.json.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)\\.(png|jpg|jpeg|webp|avif|svg|ico|woff2)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=604800, stale-while-revalidate=86400" }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        {
          "key": "Content-Security-Policy-Report-Only",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.googletagmanager.com; form-action 'self' https://pay.sepay.vn https://pay-sandbox.sepay.vn; frame-ancestors 'self'; base-uri 'self'"
        }
      ]
    }
  ]
}
```

---

## 9. `public/robots.txt` — TẠO MỚI

Cho công cụ tìm kiếm.

```text
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://www.tvhcanva.com/sitemap.xml
```

---

## 10. `public/sitemap.xml` — TẠO MỚI

Cho công cụ tìm kiếm.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.tvhcanva.com/</loc>
    <lastmod>2026-07-26</lastmod>
  </url>
</urlset>
```

---

## 11. `src/app/App.tsx` — SỬA 4 CHỖ (không thay toàn bộ file)

File này dài ~1.888 dòng. **Chỉ thêm 4 đoạn dưới đây, giữ nguyên tuyệt đối mọi thứ khác**,
đặc biệt là toàn bộ dữ liệu sản phẩm (BEST_SELLERS, DESIGN_PRODUCTS, AI_PRODUCTS,
WORK_PRODUCTS, ENTERTAINMENT_PRODUCTS, EDUCATION_PRODUCTS, VPN_PRODUCTS, TESTIMONIALS).

**Chỗ 1** — thêm import, đặt cạnh dòng import `FloatingButtons`:

```tsx
import { SeoHead } from "./components/SeoHead";
```

**Chỗ 2** — thêm hằng số này ngay TRƯỚC dòng `export default function App() {`:

```tsx
const ALL_PRODUCTS: Product[] = [
  ...BEST_SELLERS,
  ...DESIGN_PRODUCTS,
  ...AI_PRODUCTS,
  ...WORK_PRODUCTS,
  ...ENTERTAINMENT_PRODUCTS,
  ...EDUCATION_PRODUCTS,
  ...VPN_PRODUCTS,
];
```

**Chỗ 3** — trong phần `return` của `App`, thêm đúng MỘT dòng ngay sau thẻ mở
`<div className="min-h-screen bg-gray-50">`:

```tsx
<SeoHead products={ALL_PRODUCTS} />
```

**Chỗ 4** — trong hàm `ProductSection`, sửa phần `products.map`.

Từ:

```tsx
{products.map((p) => (
  <ProductCard key={p.id} product={p} onClick={onClick} />
))}
```

Thành:

```tsx
{products.map((p, i) => (
  <ProductCard
    key={p.id}
    product={p}
    onClick={onClick}
    priority={id === "best-sellers" && i < 4}
  />
))}
```

---

# TỰ KIỂM TRA SAU KHI LÀM XONG

Rà lại từng mục. Mục nào không đạt thì sửa rồi báo.

- [ ] `api/_catalog.ts` tồn tại, có **đúng 60 dòng sản phẩm**, giá copy nguyên văn. Dòng đầu `"Capcut Pro"`, dòng cuối `"Surfshark VPN"`.
- [ ] `api/sepay-checkout.ts` có dòng `const amount = getPrice(productName, planLabel);` và **không còn** lấy `amount` từ `body` để tính tiền.
- [ ] `api/sepay-checkout.ts` **vẫn còn** dòng `const origin = req.headers.origin || "https://tvhcanva.com";` — không được đổi.
- [ ] `index.html` có `content="index, follow, max-image-preview:large"` và `lang="vi"`, **không còn** `noindex`.
- [ ] `wcMapping.ts` **không còn** `WC_MAPPING`, `buildCheckoutUrl`, `SHOP_URL`, `parsePrice`.
- [ ] `OrderModal.tsx` gọi `submitSepayCheckout` với **đúng 4 tham số**.
- [ ] `ProductCard.tsx` có `loading={priority ? "eager" : "lazy"}` và export bằng `memo`.
- [ ] `SeoHead.tsx` tồn tại và được import + dùng trong `App.tsx`.
- [ ] Dữ liệu sản phẩm trong `App.tsx` **không thay đổi một ký tự nào**.
- [ ] Dự án build được, không còn import nào trỏ tới hàm đã xoá.

Báo cáo ngắn gọn: đã tạo/sửa file nào, và bất kỳ chỗ nào bạn phải suy đoán.

**Nếu bạn không sửa được `index.html`**, hãy nói rõ ngay thay vì bỏ qua im lặng —
đó là file quan trọng nhất về mặt SEO trong danh sách này.
