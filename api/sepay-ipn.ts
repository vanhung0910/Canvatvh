export const config = { runtime: "nodejs" };

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  if (data?.notification_type === "ORDER_PAID") {
    const invoice = data.order?.order_invoice_number;
    const amount = data.order?.order_amount;
    const description = data.order?.order_description;

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
