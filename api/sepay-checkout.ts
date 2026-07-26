import crypto from "node:crypto";

export const config = { runtime: "nodejs" };

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

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method === "GET") {
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

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { name, phone, productName, planLabel, amount } = body || {};

  if (!name || !phone || !productName || !amount) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Đơn Canva 1 tháng (15.000đ) dùng tiền tố "TVHC" để nhận diện đơn cần trả link Canva.
  const isCanva =
    String(productName).toLowerCase().includes("canva") &&
    String(planLabel).trim() === "1 Tháng" &&
    Number(amount) === 15000;
  const invoiceNumber = (isCanva ? "TVHC" : "TVH") + Date.now();
  const origin = req.headers.origin || "https://tvhcanva.com";

  const fields: Record<string, string> = {
    merchant,
    operation: "PURCHASE",
    payment_method: "BANK_TRANSFER",
    currency: "VND",
    order_amount: String(amount),
    order_invoice_number: invoiceNumber,
    order_description: `${productName} - ${planLabel} - ${name} ${phone}`,
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
      `Số tiền: ${Number(amount).toLocaleString("vi-VN")}đ`;
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
