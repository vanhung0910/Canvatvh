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

// ================= EMAIL (Resend) =================
// Secrets: RESEND_API_KEY (bắt buộc), EMAIL_FROM (vd: "TVH Canva <noreply@tvhcanva.com>").

const ZALO_URL = "https://zalo.me/g/wvhu5evlevj1vvnzccgo";
const FB_URL = "https://www.facebook.com/groups/tvhcanva";

function esc(v: string): string {
  return v.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
}

function emailLayout(title: string, body: string): string {
  return `<!doctype html><html lang="vi"><body style="margin:0;background:#f4f2fa;font-family:Arial,Helvetica,sans-serif;color:#1a1a4e">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="background:linear-gradient(135deg,#1a1a4e,#5b2fa0);background-color:#5b2fa0;padding:24px;text-align:center;color:#fff">
<div style="font-size:13px;letter-spacing:2px;opacity:.8">TVHCANVA.COM</div>
<div style="font-size:22px;font-weight:800;margin-top:6px">${title}</div></td></tr>
<tr><td style="padding:28px 28px 8px;font-size:15px;line-height:1.6">${body}</td></tr>
<tr><td style="padding:16px 28px 28px;font-size:13px;color:#6b6b8a;border-top:1px solid #eee">
Cần hỗ trợ? Nhắn <a href="${ZALO_URL}" style="color:#5b2fa0">nhóm Zalo</a> hoặc
<a href="${FB_URL}" style="color:#5b2fa0">nhóm Facebook</a>. Vui lòng không trả lời email này.</td></tr>
</table></td></tr></table></body></html>`;
}

function orderSummary(o: any): string {
  return `<table cellpadding="0" cellspacing="0" style="width:100%;background:#f8f7fc;border-radius:10px;padding:12px 16px;font-size:14px;margin:12px 0">
<tr><td style="color:#6b6b8a">Mã đơn</td><td align="right"><b>${esc(o.invoice)}</b></td></tr>
<tr><td style="color:#6b6b8a">Sản phẩm</td><td align="right">${esc(o.product)} – ${esc(o.plan)}</td></tr>
<tr><td style="color:#6b6b8a">Số tiền</td><td align="right">${Number(o.amount).toLocaleString("vi-VN")}đ</td></tr></table>`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<string | null> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return "Chưa cấu hình RESEND_API_KEY";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return "Khách không để lại email hợp lệ";
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: Deno.env.get("EMAIL_FROM") || "TVH Canva <noreply@tvhcanva.com>",
        to: [to],
        subject,
        html,
      }),
    });
    if (!r.ok) return `Resend lỗi HTTP ${r.status}: ${await r.text()}`;
    return null;
  } catch (err) {
    return `Lỗi gửi email: ${String(err)}`;
  }
}

function canvaEmail(o: any, link: string): string {
  return emailLayout(
    "Link tham gia Canva Pro của bạn",
    `<p>Chào <b>${esc(o.name || "bạn")}</b>, cảm ơn bạn đã mua hàng tại TVH Canva!</p>
${orderSummary(o)}
<p style="margin:20px 0 8px"><b>Bước 1:</b> Đăng nhập Canva bằng tài khoản bạn muốn nâng cấp.</p>
<p style="margin:0 0 16px"><b>Bước 2:</b> Bấm nút bên dưới và chọn <b>Tham gia nhóm</b>.</p>
<p style="text-align:center;margin:24px 0"><a href="${esc(link)}" style="display:inline-block;background:#5b2fa0;color:#fff;text-decoration:none;font-weight:800;padding:14px 28px;border-radius:12px">THAM GIA CANVA NGAY</a></p>
<p style="font-size:13px;color:#6b6b8a">Nếu nút không bấm được, copy link: <br><a href="${esc(link)}" style="color:#5b2fa0;word-break:break-all">${esc(link)}</a></p>
<p style="font-size:13px;color:#6b6b8a">Link là riêng của bạn, vui lòng không chia sẻ cho người khác.</p>`,
  );
}

function deliveryEmail(o: any, content: string): string {
  return emailLayout(
    "Đơn hàng của bạn đã sẵn sàng",
    `<p>Chào <b>${esc(o.name || "bạn")}</b>, đơn hàng của bạn đã được bàn giao.</p>
${orderSummary(o)}
<p style="margin:20px 0 8px"><b>Thông tin tài khoản / hướng dẫn:</b></p>
<div style="background:#1a1a4e;color:#fff;border-radius:10px;padding:16px;font-family:Consolas,monospace;font-size:14px;white-space:pre-wrap;word-break:break-word">${esc(content)}</div>
<p style="font-size:13px;color:#6b6b8a;margin-top:16px">Vui lòng đổi mật khẩu (nếu được phép) và không chia sẻ thông tin này cho người khác.</p>`,
  );
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
    const updated: any = {
      ...(order || { invoice, amount: paidAmount, product: "", plan: "", name: "", phone: "", is_canva: false, created_at: Date.now() }),
      status,
      paid_amount: paidAmount,
      paid_at: Date.now(),
      warning: warning || undefined,
    };
    // Đơn Canva hợp lệ: tự gửi link vào email khách (dự phòng khi khách đóng trang sớm).
    const link = status === "paid" && order?.is_canva ? canvaLinkFor(order.amount) : undefined;
    if (link && !order.email_sent_at) {
      const err = await sendEmail(order.phone, "Link tham gia Canva Pro – đơn " + invoice, canvaEmail(order, link));
      if (err) {
        updated.email_error = err;
        warning = warning ? `${warning} ${err}` : `Chưa gửi được email: ${err}`;
        updated.warning = warning;
      } else {
        updated.email_sent_at = Date.now();
      }
    }
    await kv.set(`order:${invoice}`, updated);
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
    RESEND_API_KEY: !!Deno.env.get("RESEND_API_KEY"),
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

/**
 * Admin gửi email giao hàng. Đơn Canva: gửi lại link theo gói.
 * Đơn khác: gửi nội dung admin nhập (tài khoản/hướng dẫn), rồi chuyển "delivered".
 */
app.post(`${P}/admin/deliver`, async (c) => {
  if (!adminOk(c)) return c.json({ error: "Sai mật khẩu quản trị" }, 401);
  let b: any = {};
  try {
    b = await c.req.json();
  } catch (err) {
    return c.json({ error: `Body không hợp lệ: ${String(err)}` }, 400);
  }
  const invoice = String(b?.invoice || "");
  const content = String(b?.content || "").trim();
  const order = await kv.get(`order:${invoice}`);
  if (!order) return c.json({ error: "Không tìm thấy đơn" }, 404);
  const to = String(b?.email || order.phone || "").trim();

  let err: string | null;
  if (order.is_canva && !content) {
    const link = canvaLinkFor(order.amount);
    if (!link) return c.json({ error: "Thiếu secret link Canva cho gói này" }, 400);
    err = await sendEmail(to, "Link tham gia Canva Pro – đơn " + invoice, canvaEmail(order, link));
  } else {
    if (!content) return c.json({ error: "Nhập thông tin tài khoản cần gửi" }, 400);
    err = await sendEmail(to, `Bàn giao ${order.product} – đơn ${invoice}`, deliveryEmail(order, content));
  }
  if (err) return c.json({ error: err }, 502);

  const updated = {
    ...order,
    phone: to,
    status: "delivered",
    email_sent_at: Date.now(),
    email_error: undefined,
    warning: undefined,
    updated_at: Date.now(),
  };
  await kv.set(`order:${invoice}`, updated);
  return c.json({ success: true, order: updated });
});

Deno.serve(app.fetch);
