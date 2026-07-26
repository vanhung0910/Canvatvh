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
