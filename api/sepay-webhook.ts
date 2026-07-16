export const config = { runtime: "nodejs" };

/**
 * Webhook nhận thông báo giao dịch từ Sepay (API v2 / VA theo đơn hàng).
 *
 * Cấu hình trên Sepay:
 *  - URL webhook   : https://tvhcanva.com/api/sepay-webhook
 *  - Authentication: Apikey  (giá trị khớp với biến môi trường SEPAY_WEBHOOK_APIKEY)
 *
 * Payload Sepay gửi (POST) gồm các trường: id, gateway, transactionDate,
 * accountNumber, code (khớp order_code), content, transferType, transferAmount...
 */

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, message: "Sepay webhook endpoint ready" });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Xác thực webhook đến từ Sepay bằng Apikey.
  const expected = process.env.SEPAY_WEBHOOK_APIKEY;
  if (expected) {
    const auth = (req.headers?.authorization || "").toString();
    if (auth !== `Apikey ${expected}`) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
  }

  const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

  const code = data.code || data.order_code || "(không có mã)";
  const amount = Number(data.transferAmount ?? data.amount ?? 0);
  const transferType = data.transferType || "";
  const content = data.content || "";

  // Chỉ thông báo với giao dịch tiền vào.
  if (transferType === "in" || transferType === "" ) {
    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const tgChat = process.env.TELEGRAM_CHAT_ID;
    if (tgToken && tgChat) {
      const text =
        `✅ ĐÃ THANH TOÁN\n` +
        `Mã đơn: ${code}\n` +
        `Số tiền: ${amount.toLocaleString("vi-VN")}đ\n` +
        (content ? `Nội dung: ${content}` : "");
      try {
        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: tgChat, text }),
        });
      } catch {}
    }
  }

  return res.status(200).json({ success: true });
}
