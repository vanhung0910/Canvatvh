import crypto from "node:crypto";

export const config = { runtime: "nodejs" };

const SUPABASE_FUNCTION_URL =
  process.env.SUPABASE_FUNCTION_URL ||
  "https://tznqkuqsunvzhmjwzufd.supabase.co/functions/v1/make-server-4d3e30ca";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6bnFrdXFzdW52emhtand6dWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTU2NDIsImV4cCI6MjA5MzU3MTY0Mn0.s3N7QxZLTVb6GhJHjyquCI3oD15XS42HBGySVKhc-GM";

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

const ALLOWED_ORIGINS = ["https://tvhcanva.com", "https://www.tvhcanva.com"];

export default async function handler(req: any, res: any) {
  try {
    return await handle(req, res);
  } catch (err) {
    console.log(`sepay-checkout lỗi: ${String(err)}`);
    return res.status(500).json({ error: `Lỗi máy chủ: ${String((err as Error)?.message || err)}` });
  }
}

async function handle(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const merchant = process.env.SEPAY_MERCHANT_ID;
  const secret = process.env.SEPAY_SECRET_KEY;
  const shared = process.env.IPN_SHARED_SECRET;
  const env = process.env.SEPAY_ENV || "sandbox";

  if (!merchant || !secret || !shared) {
    return res.status(500).json({ error: "Server chưa cấu hình đủ secret" });
  }

  const checkoutUrl =
    env === "production"
      ? "https://pay.sepay.vn/v1/checkout/init"
      : "https://pay-sandbox.sepay.vn/v1/checkout/init";

  let body: any = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ error: "Body không hợp lệ" });
  }
  const name = String(body.name || "").trim().slice(0, 80);
  // Ô liên hệ trên form là Email (field vẫn tên "phone"); chấp nhận email hoặc SĐT.
  const contact = String(body.phone || "").trim().slice(0, 100);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const isPhone = /^\+?\d{9,15}$/.test(contact.replace(/[\s.-]/g, ""));
  const phone = isEmail ? contact.toLowerCase() : contact.replace(/[\s.-]/g, "");
  const productName = String(body.productName || "");
  const planLabel = String(body.planLabel || "");
  const chatgptType = body.chatgptType ? String(body.chatgptType) : undefined;

  if (!name || !productName || !planLabel) {
    return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin" });
  }
  if (!isEmail && !isPhone) {
    return res.status(400).json({ error: "Email không hợp lệ, vui lòng kiểm tra lại" });
  }

  // ESM trên Vercel bắt buộc đuôi .js khi import file TS; import động để lỗi (nếu có) trả về JSON.
  const { resolvePrice, CANVA_PLAN_AMOUNTS } = await import("../src/app/data/products.js");

  // Giá tính từ bảng giá phía server, KHÔNG dùng số tiền client gửi.
  const amount = resolvePrice(productName, planLabel, chatgptType);
  if (!amount) return res.status(400).json({ error: "Sản phẩm/gói không tồn tại" });

  // Đơn Canva (1 Tháng 15.000đ / 3 Tháng 40.000đ / 1 Năm 180.000đ) dùng tiền tố "TVHC".
  const isCanva = productName === "Canva Pro" && CANVA_PLAN_AMOUNTS[planLabel] === amount;
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  const invoiceNumber = (isCanva ? "TVHC" : "TVH") + Date.now() + rand;
  const reqOrigin = String(req.headers.origin || "");
  const origin = ALLOWED_ORIGINS.includes(reqOrigin) ? reqOrigin : "https://tvhcanva.com";
  const variantLabel = chatgptType === "chinh-chu" ? " (Chính chủ)" : chatgptType ? " (Share)" : "";

  // Lưu đơn chờ thanh toán để IPN đối chiếu số tiền + để trang quản trị hiển thị.
  try {
    const r = await fetch(`${SUPABASE_FUNCTION_URL}/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "x-shared-secret": shared,
      },
      body: JSON.stringify({
        invoice: invoiceNumber,
        amount,
        product: productName,
        plan: planLabel + variantLabel,
        name,
        phone,
        is_canva: isCanva,
      }),
    });
    if (!r.ok) {
      console.log(`Lỗi lưu đơn ${invoiceNumber}: HTTP ${r.status} ${await r.text()}`);
      return res.status(502).json({ error: "Không tạo được đơn, vui lòng thử lại" });
    }
  } catch (err) {
    console.log(`Lỗi kết nối Supabase khi tạo đơn: ${String(err)}`);
    return res.status(502).json({ error: "Không tạo được đơn, vui lòng thử lại" });
  }

  const fields: Record<string, string> = {
    merchant,
    operation: "PURCHASE",
    payment_method: "BANK_TRANSFER",
    currency: "VND",
    order_amount: String(amount),
    order_invoice_number: invoiceNumber,
    order_description: `${productName} - ${planLabel}${variantLabel} - ${name} ${phone}`,
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
      `Sản phẩm: ${productName} - ${planLabel}${variantLabel}\n` +
      `Khách: ${name} - ${phone}\n` +
      `Số tiền: ${amount.toLocaleString("vi-VN")}đ`;
    try {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: tgChat, text }),
      });
    } catch {}
  }

  return res.status(200).json({
    checkout_url: checkoutUrl,
    fields,
    invoice_number: invoiceNumber,
  });
}
