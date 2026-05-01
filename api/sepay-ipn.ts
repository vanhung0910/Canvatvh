export const config = { runtime: "nodejs" };

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, message: "Sepay IPN endpoint ready" });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  console.log("[SEPAY IPN] payload:", JSON.stringify(data));

  let invoice = "";
  let amount = "0";
  let description = "";
  let txnId = "";
  let txnDate = "";
  let customerId = "";

  if (data?.notification_type === "ORDER_PAID") {
    invoice = data.order?.order_invoice_number || "";
    amount = String(data.order?.order_amount || "0");
    description = data.order?.order_description || "";
    txnId = data.transaction?.transaction_id || "";
    txnDate = data.transaction?.transaction_date || "";
    customerId = data.order?.customer_id || "";
  } else if (data?.transferAmount !== undefined || data?.content !== undefined) {
    invoice = data.code || data.referenceCode || "";
    amount = String(data.transferAmount || "0");
    description = data.content || data.description || "";
    txnId = String(data.id || data.referenceCode || "");
    txnDate = data.transactionDate || "";
    customerId = data.accountNumber || "";
  } else {
    return res.status(200).json({ success: true, ignored: true });
  }

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
      `📦 Sản phẩm: ${sp || "(không rõ)"}\n` +
      `📅 Gói: ${goi || "(không rõ)"}\n` +
      `👤 Khách: ${ten || "(không rõ)"}\n` +
      `📞 SĐT/Zalo: ${sdt || "(không rõ)"}\n` +
      `💰 Số tiền: ${Number(amount).toLocaleString("vi-VN")}đ\n\n` +
      `🧾 Mã đơn: ${invoice}\n` +
      `🔖 Mã GD: ${txnId}\n` +
      `🕐 Thời gian: ${txnDate}\n` +
      `📝 Nội dung: ${description}\n\n` +
      `👉 Liên hệ Zalo ${sdt} để gửi tài khoản cho khách.`;
    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: tgChat, text }),
      });
      const tgData = await tgRes.json();
      console.log("[TELEGRAM]", tgRes.status, JSON.stringify(tgData));
    } catch (e) {
      console.log("[TELEGRAM ERROR]", e);
    }
  } else {
    console.log("[TELEGRAM] missing env vars", { hasToken: !!tgToken, hasChat: !!tgChat });
  }

  const sheetUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (sheetUrl) {
    try {
      await fetch(sheetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice, txnId, txnDate, sp, goi, ten, sdt, amount, description }),
      });
    } catch {}
  }

  return res.status(200).json({ success: true });
}
