export const config = { runtime: "nodejs" };

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, message: "Sepay IPN endpoint ready" });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  if (data?.notification_type === "ORDER_PAID") {
    const invoice = data.order?.order_invoice_number || "";
    const amount = data.order?.order_amount || "0";
    const description = data.order?.order_description || "";
    const txnId = data.transaction?.transaction_id || "";
    const txnDate = data.transaction?.transaction_date || "";
    const customerId = data.order?.customer_id || "";

    const parsed: Record<string, string> = {};
    description.split("|").forEach((seg: string) => {
      const [k, ...rest] = seg.split(":");
      if (k && rest.length) parsed[k.trim()] = rest.join(":").trim();
    });
    const sp = parsed["SP"] || "";
    const goi = parsed["GOI"] || "";
    const ten = parsed["TEN"] || "";
    const sdt = parsed["SDT"] || customerId;

    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const tgChat = process.env.TELEGRAM_CHAT_ID;
    if (tgToken && tgChat) {
      const text =
        `🎉 ĐƠN HÀNG MỚI ĐÃ THANH TOÁN\n\n` +
        `📦 Sản phẩm: ${sp}\n` +
        `📅 Gói: ${goi}\n` +
        `👤 Khách: ${ten}\n` +
        `📞 SĐT/Zalo: ${sdt}\n` +
        `💰 Số tiền: ${Number(amount).toLocaleString("vi-VN")}đ\n\n` +
        `🧾 Mã đơn: ${invoice}\n` +
        `🔖 Mã GD: ${txnId}\n` +
        `🕐 Thời gian: ${txnDate}\n\n` +
        `👉 Liên hệ Zalo ${sdt} để gửi tài khoản cho khách.`;
      try {
        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: tgChat,
            text,
            parse_mode: "HTML",
          }),
        });
      } catch {}
    }

    const sheetUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (sheetUrl) {
      try {
        await fetch(sheetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoice,
            txnId,
            txnDate,
            sp,
            goi,
            ten,
            sdt,
            amount,
          }),
        });
      } catch {}
    }
  }

  return res.status(200).json({ success: true });
}
