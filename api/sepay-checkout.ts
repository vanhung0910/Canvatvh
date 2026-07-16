export const config = { runtime: "nodejs" };

/**
 * Tạo "đơn hàng" thanh toán bằng VietQR trỏ thẳng vào tài khoản cá nhân.
 * Phù hợp tài khoản BIDV cá nhân (không cần VA doanh nghiệp).
 *
 * Luồng: sinh mã đơn duy nhất -> tạo VietQR (qr.sepay.vn) với nội dung = mã đơn
 * -> khách chuyển khoản đúng số tiền + nội dung -> Sepay ghi nhận giao dịch
 * -> api/sepay-order-status đối chiếu giao dịch để xác nhận đã thanh toán.
 *
 * Biến môi trường cần cấu hình trên Vercel:
 *  - SEPAY_ACCOUNT_NUMBER : số tài khoản nhận tiền (vd 5601998234)
 *  - SEPAY_BANK           : mã ngân hàng cho VietQR (vd "BIDV")
 *  - SEPAY_ACCOUNT_HOLDER : (tùy chọn) tên chủ tài khoản để hiển thị
 *  - TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID : thông báo đơn mới
 */

// Đơn Canva 1 tháng (15.000đ) dùng tiền tố "TVHC" để nhận diện đơn cần trả link Canva.
const CANVA_ORDER_PREFIX = "TVHC";
const DEFAULT_ORDER_PREFIX = "TVH";

function isCanvaOrder(productName: string, planLabel: string, amount: number): boolean {
  return (
    productName.toLowerCase().includes("canva") &&
    planLabel.trim() === "1 Tháng" &&
    amount === 15000
  );
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "Sepay VietQR checkout endpoint ready",
      bank: process.env.SEPAY_BANK || "(chưa cấu hình)",
      has_account: !!process.env.SEPAY_ACCOUNT_NUMBER,
    });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const account = process.env.SEPAY_ACCOUNT_NUMBER;
  const bank = (process.env.SEPAY_BANK || "").trim();
  if (!account || !bank) {
    return res.status(500).json({ error: "Chưa cấu hình SEPAY_ACCOUNT_NUMBER / SEPAY_BANK" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { name, phone, productName, planLabel, amount } = body || {};
  if (!name || !phone || !productName || !amount) {
    return res.status(400).json({ error: "Thiếu thông tin đơn hàng" });
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: "Số tiền không hợp lệ" });
  }

  const canva = isCanvaOrder(productName, planLabel, numericAmount);
  // Mã đơn ngắn gọn, duy nhất, chỉ chữ + số để ngân hàng giữ nguyên trong nội dung CK.
  const orderCode = (canva ? CANVA_ORDER_PREFIX : DEFAULT_ORDER_PREFIX) + Date.now().toString(36).toUpperCase();

  const qrUrl =
    `https://qr.sepay.vn/img?acc=${encodeURIComponent(account)}` +
    `&bank=${encodeURIComponent(bank)}` +
    `&amount=${numericAmount}` +
    `&des=${encodeURIComponent(orderCode)}`;

  // Thông báo đơn mới về Telegram để đối chiếu theo mã đơn.
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChat = process.env.TELEGRAM_CHAT_ID;
  if (tgToken && tgChat) {
    const text =
      `🆕 ĐƠN MỚI (chờ thanh toán)\n` +
      `Mã: ${orderCode}\n` +
      `Sản phẩm: ${productName} - ${planLabel}\n` +
      `Khách: ${name} - ${phone}\n` +
      `Số tiền: ${numericAmount.toLocaleString("vi-VN")}đ`;
    try {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: tgChat, text }),
      });
    } catch {}
  }

  return res.status(200).json({
    order_code: orderCode,
    is_canva: canva,
    qr_url: qrUrl,
    account_number: account,
    bank_name: bank,
    account_holder: process.env.SEPAY_ACCOUNT_HOLDER || "",
    amount: numericAmount,
  });
}
