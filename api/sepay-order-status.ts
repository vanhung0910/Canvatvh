export const config = { runtime: "nodejs" };

/**
 * Đối chiếu giao dịch để xác nhận đơn đã thanh toán (tài khoản cá nhân + VietQR).
 * Frontend gọi định kỳ với ?code=<order_code>&amount=<amount>.
 *
 * Cách xác nhận: gọi API tra cứu giao dịch Sepay, tìm giao dịch TIỀN VÀO có
 * đúng số tiền và nội dung chứa mã đơn. Nếu có -> đã thanh toán.
 *
 * BẢO MẬT link Canva:
 *  - Link Canva chỉ nằm trong biến môi trường CANVA_INVITE_LINK (server-side),
 *    KHÔNG bao giờ có trong bundle frontend.
 *  - Chỉ trả link khi: tìm được giao dịch thật đã trả + mã đơn bắt đầu bằng
 *    "TVHC" + đúng số tiền 15.000đ. Kẻ tấn công không thể tự tạo ra một giao
 *    dịch ngân hàng thật, nên không thể lấy link chùa.
 */

const API_BASE = "https://userapi.sepay.vn/v2";
const CANVA_ORDER_PREFIX = "TVHC";
const CANVA_AMOUNT = 15000;

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const token = process.env.SEPAY_API_TOKEN;
  if (!token) return res.status(500).json({ error: "Chưa cấu hình SEPAY_API_TOKEN" });

  const code = (req.query?.code || "").toString().trim().toUpperCase();
  const amount = Number(req.query?.amount);
  if (!code || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: "Thiếu code/amount" });
  }

  let txns: any[] = [];
  try {
    const resp = await fetch(`${API_BASE}/transactions?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await resp.json();
    if (!resp.ok || json?.status !== "success") {
      return res.status(502).json({ error: "Không tra cứu được giao dịch", detail: json?.message });
    }
    txns = Array.isArray(json.data) ? json.data : [];
  } catch (err: any) {
    return res.status(502).json({ error: "Lỗi kết nối Sepay", detail: String(err?.message || err) });
  }

  const paid = txns.some((t) => {
    const isIn = t.transfer_type === "in";
    const amtOk = Number(t.amount_in) === amount;
    const content = `${t.transaction_content || ""} ${t.code || ""}`.toUpperCase();
    return isIn && amtOk && content.includes(code);
  });

  const result: Record<string, unknown> = { status: paid ? "Paid" : "Pending" };

  if (paid && code.startsWith(CANVA_ORDER_PREFIX) && amount === CANVA_AMOUNT) {
    const link = process.env.CANVA_INVITE_LINK;
    if (link) result.canva_link = link;
  }

  return res.status(200).json(result);
}
