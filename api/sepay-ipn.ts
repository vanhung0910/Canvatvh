export const config = { runtime: "nodejs" };

/**
 * IPN nhận từ Cổng thanh toán Sepay.
 *
 * Bảo mật:
 *  - Xác thực IPN bằng header `X-Secret-Key` (cấu hình trên Sepay = SEPAY_IPN_SECRET).
 *    Không có/không khớp -> 401, tránh bị giả thông báo "đã thanh toán".
 *  - Khi đơn đã thanh toán (ORDER_PAID), gọi Supabase Edge Function để đánh dấu
 *    đơn đã trả (kèm secret riêng IPN_SHARED_SECRET). Link Canva KHÔNG nằm ở đây,
 *    chỉ nằm trong env của Supabase và chỉ được trả khi đơn thật sự đã thanh toán.
 */

const SUPABASE_FUNCTION_URL =
  process.env.SUPABASE_FUNCTION_URL ||
  "https://tznqkuqsunvzhmjwzufd.supabase.co/functions/v1/make-server-4d3e30ca";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6bnFrdXFzdW52emhtand6dWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTU2NDIsImV4cCI6MjA5MzU3MTY0Mn0.s3N7QxZLTVb6GhJHjyquCI3oD15XS42HBGySVKhc-GM";

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, message: "Sepay IPN endpoint ready" });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Xác thực IPN đến từ Sepay bằng X-Secret-Key.
  const ipnSecret = process.env.SEPAY_IPN_SECRET;
  if (ipnSecret) {
    const got = (req.headers?.["x-secret-key"] || "").toString();
    if (got !== ipnSecret) {
      console.log("IPN Sepay bị từ chối: X-Secret-Key không khớp");
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
  }

  const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

  if (data?.notification_type === "ORDER_PAID") {
    const invoice = data.order?.order_invoice_number;
    const amount = Number(data.order?.order_amount);
    const description = data.order?.order_description || "";

    // 1) Đánh dấu đơn đã thanh toán trên Supabase (để frontend nhận link Canva an toàn).
    if (invoice) {
      try {
        const r = await fetch(`${SUPABASE_FUNCTION_URL}/mark-paid`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "x-shared-secret": process.env.IPN_SHARED_SECRET || "",
          },
          body: JSON.stringify({ invoice, amount }),
        });
        if (!r.ok) {
          console.log(
            `Lỗi đánh dấu đơn đã trả trên Supabase (${invoice}): HTTP ${r.status} ${await r.text()}`,
          );
        }
      } catch (err) {
        console.log(`Lỗi kết nối Supabase khi đánh dấu đơn ${invoice}: ${String(err)}`);
      }
    }

    // 2) Thông báo Telegram.
    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const tgChat = process.env.TELEGRAM_CHAT_ID;
    if (tgToken && tgChat) {
      const text =
        `✅ ĐƠN HÀNG MỚI ĐÃ THANH TOÁN\n` +
        `Mã: ${invoice}\n` +
        `Số tiền: ${Number(amount).toLocaleString("vi-VN")}đ\n` +
        `Chi tiết: ${description}`;
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
