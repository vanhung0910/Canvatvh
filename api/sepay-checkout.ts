import crypto from "node:crypto";
import { getPrice, isCanvaOrder } from "./_catalog";

export const config = { runtime: "nodejs" };

/**
 * Tạo phiên thanh toán SePay.
 *
 * THAY ĐỔI QUAN TRỌNG SO VỚI BẢN CŨ:
 *  - Số tiền KHÔNG còn lấy từ client. Server tự tra trong api/_catalog.ts.
 *    Client gửi amount bao nhiêu cũng bị bỏ qua hoàn toàn.
 *  - success/error/cancel URL dùng hằng số cố định, không lấy từ header Origin
 *    (trước đây kẻ tấn công đặt được Origin tuỳ ý và vẫn có chữ ký hợp lệ).
 *  - CORS chỉ mở cho domain của mình.
 *  - Endpoint chẩn đoán GET phải có ?key=<DIAG_TOKEN> mới xem được.
 */

const SITE_URL = (process.env.PUBLIC_SITE_URL || "https://tvhcanva.com").replace(/\/+$/, "");

const ALLOWED_ORIGINS = [
  SITE_URL,
  "https://www.tvhcanva.com",
  "https://tvhcanva.com",
];

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

/** Cắt bớt và loại ký tự điều khiển để không phá order_description gửi sang SePay. */
function clean(input: unknown, maxLen: number): string {
  return String(input ?? "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, " ") // bỏ ký tự điều khiển / xuống dòng
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

function applyCors(req: any, res: any) {
  const origin = req.headers?.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req: any, res: any) {
  applyCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  // Chẩn đoán: cần token, không còn công khai.
  if (req.method === "GET") {
    const diagToken = process.env.DIAG_TOKEN;
    if (!diagToken || req.query?.key !== diagToken) {
      return res.status(404).json({ error: "Not found" });
    }
    return res.status(200).json({
      ok: true,
      env: process.env.SEPAY_ENV || "sandbox",
      has_merchant: !!process.env.SEPAY_MERCHANT_ID,
      has_secret: !!process.env.SEPAY_SECRET_KEY,
      site_url: SITE_URL,
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const merchant = process.env.SEPAY_MERCHANT_ID;
  const secret = process.env.SEPAY_SECRET_KEY;
  const env = process.env.SEPAY_ENV || "sandbox";

  if (!merchant || !secret) {
    console.error("Thiếu SEPAY_MERCHANT_ID / SEPAY_SECRET_KEY");
    return res.status(503).json({ error: "Cổng thanh toán chưa sẵn sàng" });
  }

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

  // Cảnh báo khi client cố gửi giá khác giá thật (dấu hiệu bị dò).
  const claimed = Number(body?.amount);
  if (Number.isFinite(claimed) && claimed !== amount) {
    console.warn(
      `Client gửi amount=${claimed} nhưng giá thật là ${amount} cho "${productName}" / "${planLabel}"`,
    );
  }

  const checkoutUrl =
    env === "production"
      ? "https://pay.sepay.vn/v1/checkout/init"
      : "https://pay-sandbox.sepay.vn/v1/checkout/init";

  // Đơn Canva Pro 1 tháng dùng tiền tố "TVHC" để nhận diện đơn cần trả link Canva.
  const isCanva = isCanvaOrder(productName, planLabel);
  const rand = crypto.randomBytes(5).toString("hex").toUpperCase();
  const invoiceNumber = `${isCanva ? "TVHC" : "TVH"}${Date.now()}${rand}`;

  const fields: Record<string, string> = {
    merchant,
    operation: "PURCHASE",
    payment_method: "BANK_TRANSFER",
    currency: "VND",
    order_amount: String(amount),
    order_invoice_number: invoiceNumber,
    order_description: clean(`${productName} - ${planLabel} - ${name} ${phone}`, 190),
    customer_id: phone,
    success_url: `${SITE_URL}/?payment=success&inv=${invoiceNumber}`,
    error_url: `${SITE_URL}/?payment=error&inv=${invoiceNumber}`,
    cancel_url: `${SITE_URL}/?payment=cancel&inv=${invoiceNumber}`,
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
        console.error(`Telegram lỗi (đơn ${invoiceNumber}): HTTP ${r.status} ${await r.text()}`);
      }
    } catch (err) {
      // Không chặn luồng thanh toán, nhưng PHẢI ghi log để còn truy được đơn.
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
