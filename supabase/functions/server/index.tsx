import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

const P = "/make-server-4d3e30ca";

// Gói Canva tự động giao link: tên gói -> tên secret (không phụ thuộc giá, admin sửa giá thoải mái).
const CANVA_LINK_ENV: Record<string, string> = {
  "1 Tháng": "CANVA_INVITE_LINK",
  "3 Tháng": "CANVA_INVITE_LINK_3M",
  "1 Năm": "CANVA_INVITE_LINK_1Y",
};
// Đơn cũ (trước khi lưu canva_plan) suy ra gói theo số tiền.
const LEGACY_CANVA_AMOUNT: Record<number, string> = { 15000: "1 Tháng", 40000: "3 Tháng", 180000: "1 Năm" };

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

function canvaLinkFor(order: any): string | undefined {
  const plan = order?.canva_plan || LEGACY_CANVA_AMOUNT[Number(order?.amount)];
  const envName = plan ? CANVA_LINK_ENV[plan] : undefined;
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
<div style="font-size:13px;letter-spacing:2px;color:#d9d3f0">TVHCANVA<span>&#8203;</span>.COM</div>
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
<div style="background:#fff7e6;border:1px solid #ffd591;border-radius:10px;padding:12px 14px;font-size:14px;color:#874d00;margin-top:8px">
⏰ <b>Link sẽ hết hạn sau 3 ngày.</b> Vui lòng kiểm tra và tham gia sớm nhất để không bị gián đoạn. Nếu link đã hết hạn, nhắn Zalo kèm mã đơn để được cấp lại.</div>
<p style="font-size:13px;color:#6b6b8a">Link là riêng của bạn, vui lòng không chia sẻ cho người khác.</p>`,
  );
}

/**
 * Nội dung giao hàng admin nhập theo định dạng:
 *   tài khoản | mật khẩu | thông tin thêm | ...
 * Mỗi dòng là 1 tài khoản. Mục từ thứ 3 trở đi có thể ghi "Nhãn: giá trị"
 * (vd "Hạn dùng: 01/11/2026", "2FA: ABCD") — không có nhãn thì hiện là "Ghi chú".
 */
function parseDelivery(content: string): { label: string; value: string }[][] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      line.split("|").map((raw, i) => {
        const part = raw.trim();
        if (i === 0) return { label: "Tài khoản", value: part };
        if (i === 1) return { label: "Mật khẩu", value: part };
        const m = /^https?:\/\//i.test(part) ? null : part.match(/^([^:]{1,30}):\s*(.+)$/);
        return m ? { label: m[1].trim(), value: m[2].trim() } : { label: "Ghi chú", value: part };
      }).filter((f) => f.value),
    );
}

function deliveryEmail(o: any, content: string): string {
  const accounts = parseDelivery(content);
  const blocks = accounts
    .map(
      (fields, idx) => `
<table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e6e1f5;border-radius:10px;margin:0 0 12px;font-size:14px">
${accounts.length > 1 ? `<tr><td colspan="2" style="background:#f4f0ff;padding:8px 14px;font-weight:700;color:#5b2fa0;border-radius:10px 10px 0 0">Tài khoản ${idx + 1}</td></tr>` : ""}
${fields
  .map(
    (f) => `<tr><td style="padding:10px 14px;color:#6b6b8a;width:110px;vertical-align:top;border-top:1px solid #f0edf8">${esc(f.label)}</td>
<td style="padding:10px 14px;font-family:Consolas,monospace;font-weight:700;color:#1a1a4e;word-break:break-all;border-top:1px solid #f0edf8">${esc(f.value)}</td></tr>`,
  )
  .join("")}
</table>`,
    )
    .join("");
  return emailLayout(
    "Đơn hàng của bạn đã sẵn sàng",
    `<p>Chào <b>${esc(o.name || "bạn")}</b>, đơn hàng của bạn đã được bàn giao.</p>
${orderSummary(o)}
<p style="margin:20px 0 8px"><b>Thông tin tài khoản:</b></p>
${blocks}
<p style="font-size:13px;color:#6b6b8a;margin-top:16px">Vui lòng không đổi thông tin đăng nhập nếu không được hướng dẫn và không chia sẻ tài khoản cho người khác để tránh bị khóa.</p>`,
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
      canva_plan: b.canva_plan ? String(b.canva_plan) : undefined,
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
    } else if (order.is_canva && !canvaLinkFor(order)) {
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
    const link = status === "paid" && order?.is_canva ? canvaLinkFor(order) : undefined;
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
    const link = canvaLinkFor(order);
    if (link) result.canva_link = link;
  }
  return c.json(result);
});

/** Giá admin đã sửa (công khai — chỉ là bảng giá). */
app.get(`${P}/prices`, async (c) => {
  try {
    const [prices, order] = await Promise.all([kv.get("prices"), kv.get("layout")]);
    return c.json({ prices: prices || {}, order: order || {} });
  } catch (err) {
    return c.json({ error: `Lỗi đọc bảng giá: ${String(err)}` }, 500);
  }
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

/** Admin lưu giá 1 sản phẩm. reset=true -> về giá mặc định trong code. */
app.post(`${P}/admin/prices`, async (c) => {
  if (!adminOk(c)) return c.json({ error: "Sai mật khẩu quản trị" }, 401);
  let b: any = {};
  try {
    b = await c.req.json();
  } catch (err) {
    return c.json({ error: `Body không hợp lệ: ${String(err)}` }, 400);
  }
  const name = String(b?.name || "").trim();
  if (!name) return c.json({ error: "Thiếu tên sản phẩm" }, 400);
  const prices: any = (await kv.get("prices")) || {};
  if (b.soldOut !== undefined && b.plans === undefined && !b.reset) {
    // Chỉ bật/tắt hết hàng, giữ nguyên giá đang có.
    prices[name] = { ...(prices[name] || {}), soldOut: !!b.soldOut };
    if (!prices[name].soldOut) delete prices[name].soldOut;
    if (!Object.keys(prices[name]).length) delete prices[name];
  } else if (b.reset) {
    // Về giá mặc định nhưng giữ trạng thái hết hàng.
    if (prices[name]?.soldOut) prices[name] = { soldOut: true };
    else delete prices[name];
  } else {
    const plans: Record<string, number> = {};
    const planList: string[] = Array.isArray(b.planList)
      ? b.planList.map((l: any) => String(l).trim().slice(0, 40)).filter(Boolean)
      : [];
    if (planList.length && new Set(planList).size !== planList.length) {
      return c.json({ error: "Tên gói bị trùng" }, 400);
    }
    if (Array.isArray(b.planList) && !planList.length) {
      return c.json({ error: "Sản phẩm cần ít nhất 1 gói" }, 400);
    }
    for (const [k, v] of Object.entries(b.plans || {})) {
      if (planList.length && !planList.includes(k)) continue;
      const n = Math.round(Number(v));
      if (!Number.isFinite(n) || n < 1000 || n > 100_000_000) {
        return c.json({ error: `Giá gói "${k}" không hợp lệ (tối thiểu 1.000đ)` }, 400);
      }
      plans[k] = n;
    }
    const original = Math.round(Number(b.original) || 0);
    if (planList.some((l) => !plans[l])) return c.json({ error: "Thiếu giá cho gói mới" }, 400);
    prices[name] = {
      plans,
      ...(planList.length ? { planList } : {}),
      ...(original > 0 ? { original } : {}),
      ...(prices[name]?.soldOut ? { soldOut: true } : {}),
    };
  }
  await kv.set("prices", prices);
  return c.json({ success: true, prices });
});

/** Admin lưu thứ tự sản phẩm trong 1 mục: { section, names: string[] }. */
app.post(`${P}/admin/order`, async (c) => {
  if (!adminOk(c)) return c.json({ error: "Sai mật khẩu quản trị" }, 401);
  let b: any = {};
  try {
    b = await c.req.json();
  } catch (err) {
    return c.json({ error: `Body không hợp lệ: ${String(err)}` }, 400);
  }
  const section = String(b?.section || "").trim();
  if (!section || !Array.isArray(b?.names)) return c.json({ error: "Thiếu dữ liệu sắp xếp" }, 400);
  const order: any = (await kv.get("layout")) || {};
  order[section] = b.names.map((n: any) => String(n)).slice(0, 200);
  await kv.set("layout", order);
  return c.json({ success: true, order });
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
    const link = canvaLinkFor(order);
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
