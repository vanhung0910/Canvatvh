import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

const P = "/make-server-4d3e30ca";

// Gói Canva tự động giao link: số tiền -> tên secret.
const CANVA_LINK_ENV: Record<number, string> = {
  15000: "CANVA_INVITE_LINK",
  40000: "CANVA_INVITE_LINK_3M",
  180000: "CANVA_INVITE_LINK_1Y",
};

app.use("*", logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "x-admin-key"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get(`${P}/health`, (c) => c.json({ status: "ok" }));

/** Fail-closed: chỉ chấp nhận khi secret đã cấu hình VÀ khớp. */
function sharedOk(c: any): boolean {
  const shared = Deno.env.get("IPN_SHARED_SECRET");
  return !!shared && c.req.header("x-shared-secret") === shared;
}

function adminOk(c: any): boolean {
  const pass = Deno.env.get("ADMIN_PASSWORD");
  return !!pass && c.req.header("x-admin-key") === pass;
}

function canvaLinkFor(amount: number): string | undefined {
  const envName = CANVA_LINK_ENV[amount];
  return envName ? Deno.env.get(envName) || undefined : undefined;
}

/** Vercel tạo đơn chờ thanh toán (giá đã tính phía server). */
app.post(`${P}/create-order`, async (c) => {
  if (!sharedOk(c)) return c.json({ error: "Unauthorized" }, 401);
  let b: any = {};
  try {
    b = await c.req.json();
  } catch (err) {
    return c.json({ error: `Body không hợp lệ: ${String(err)}` }, 400);
  }
  const invoice = String(b?.invoice || "").trim();
  const amount = Number(b?.amount) || 0;
  if (!invoice || !amount) return c.json({ error: "Thiếu invoice/amount" }, 400);
  try {
    await kv.set(`order:${invoice}`, {
      invoice,
      amount,
      product: String(b.product || ""),
      plan: String(b.plan || ""),
      name: String(b.name || ""),
      phone: String(b.phone || ""),
      is_canva: !!b.is_canva,
      status: "pending",
      created_at: Date.now(),
    });
  } catch (err) {
    console.log(`Lỗi lưu đơn ${invoice}: ${String(err)}`);
    return c.json({ error: `Lỗi lưu đơn: ${String(err)}` }, 500);
  }
  return c.json({ success: true });
});

/**
 * IPN (Vercel) báo đã thanh toán. Đối chiếu số tiền với đơn pending:
 * chỉ trả link Canva khi đơn có thật, là đơn Canva và số tiền khớp đúng.
 */
app.post(`${P}/mark-paid`, async (c) => {
  if (!sharedOk(c)) {
    console.log("mark-paid bị từ chối: thiếu hoặc sai x-shared-secret");
    return c.json({ error: "Unauthorized" }, 401);
  }
  let body: any = {};
  try {
    body = await c.req.json();
  } catch (err) {
    return c.json({ error: `Body không hợp lệ: ${String(err)}` }, 400);
  }
  const invoice = String(body?.invoice || "").trim();
  const paidAmount = Number(body?.amount) || 0;
  if (!invoice) return c.json({ error: "Thiếu invoice" }, 400);

  try {
    const order = await kv.get(`order:${invoice}`);
    let status = "paid";
    let warning = "";
    if (!order) {
      status = "mismatch";
      warning = "Không tìm thấy đơn chờ thanh toán tương ứng — cần kiểm tra tay.";
    } else if (order.amount !== paidAmount) {
      status = "mismatch";
      warning = `Số tiền không khớp: đơn ${order.amount}đ, nhận ${paidAmount}đ — không tự giao link.`;
    } else if (order.is_canva && !canvaLinkFor(order.amount)) {
      warning = "Đơn Canva đã trả nhưng thiếu secret link Canva cho gói này — cần gửi link tay.";
    }
    await kv.set(`order:${invoice}`, {
      ...(order || { invoice, amount: paidAmount, product: "", plan: "", name: "", phone: "", is_canva: false, created_at: Date.now() }),
      status,
      paid_amount: paidAmount,
      paid_at: Date.now(),
      warning: warning || undefined,
    });
    if (warning) console.log(`mark-paid ${invoice}: ${warning}`);
    return c.json({ success: true, status, warning: warning || undefined });
  } catch (err) {
    console.log(`Lỗi cập nhật đơn ${invoice}: ${String(err)}`);
    return c.json({ error: `Lỗi cập nhật đơn: ${String(err)}` }, 500);
  }
});

/**
 * Frontend hỏi trạng thái đơn. Link Canva chỉ trả khi đơn đã "paid" (đã khớp tiền)
 * và là đơn Canva. Mã đơn có chuỗi ngẫu nhiên nên không đoán được.
 */
app.get(`${P}/canva-link`, async (c) => {
  const invoice = (c.req.query("inv") || "").trim();
  if (!invoice) return c.json({ error: "Thiếu inv" }, 400);
  let order: any = null;
  try {
    order = await kv.get(`order:${invoice}`);
  } catch (err) {
    console.log(`Lỗi đọc đơn ${invoice}: ${String(err)}`);
    return c.json({ error: `Lỗi đọc đơn: ${String(err)}` }, 500);
  }
  if (!order || order.status === "pending") return c.json({ status: "Pending" });
  if (order.status !== "paid" && order.status !== "delivered") {
    return c.json({ status: "Review" });
  }

  const result: Record<string, unknown> = { status: "Paid" };
  if (order.is_canva) {
    const link = canvaLinkFor(order.amount);
    if (link) result.canva_link = link;
  }
  return c.json(result);
});

// ================= QUẢN TRỊ (header x-admin-key === ADMIN_PASSWORD) =================

app.get(`${P}/admin/orders`, async (c) => {
  if (!adminOk(c)) return c.json({ error: "Sai mật khẩu quản trị" }, 401);
  try {
    const orders = await kv.getByPrefix("order:");
    orders.sort((a: any, b: any) => (b.created_at || 0) - (a.created_at || 0));
    return c.json({ orders });
  } catch (err) {
    return c.json({ error: `Lỗi đọc đơn: ${String(err)}` }, 500);
  }
});

app.get(`${P}/admin/diag`, (c) => {
  if (!adminOk(c)) return c.json({ error: "Sai mật khẩu quản trị" }, 401);
  return c.json({
    IPN_SHARED_SECRET: !!Deno.env.get("IPN_SHARED_SECRET"),
    CANVA_INVITE_LINK: !!Deno.env.get("CANVA_INVITE_LINK"),
    CANVA_INVITE_LINK_3M: !!Deno.env.get("CANVA_INVITE_LINK_3M"),
    CANVA_INVITE_LINK_1Y: !!Deno.env.get("CANVA_INVITE_LINK_1Y"),
  });
});

/** Admin xử lý tay: duyệt đơn lệch tiền, đánh dấu đã giao, hoặc hủy. */
app.post(`${P}/admin/update`, async (c) => {
  if (!adminOk(c)) return c.json({ error: "Sai mật khẩu quản trị" }, 401);
  let b: any = {};
  try {
    b = await c.req.json();
  } catch (err) {
    return c.json({ error: `Body không hợp lệ: ${String(err)}` }, 400);
  }
  const invoice = String(b?.invoice || "");
  const status = String(b?.status || "");
  if (!["paid", "delivered", "cancelled", "pending"].includes(status)) {
    return c.json({ error: "Trạng thái không hợp lệ" }, 400);
  }
  const order = await kv.get(`order:${invoice}`);
  if (!order) return c.json({ error: "Không tìm thấy đơn" }, 404);
  const updated = { ...order, status, note: b.note ?? order.note, updated_at: Date.now() };
  await kv.set(`order:${invoice}`, updated);
  return c.json({ success: true, order: updated });
});

Deno.serve(app.fetch);
