import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-4d3e30ca/health", (c) => {
  return c.json({ status: "ok" });
});

// Chẩn đoán env phía Supabase (chỉ true/false, không lộ giá trị).
app.get("/make-server-4d3e30ca/diag", (c) => {
  return c.json({
    has_ipn_shared_secret: !!Deno.env.get("IPN_SHARED_SECRET"),
    has_canva_invite_link: !!Deno.env.get("CANVA_INVITE_LINK"),
    has_canva_invite_link_3m: !!Deno.env.get("CANVA_INVITE_LINK_3M"),
    has_canva_invite_link_1y: !!Deno.env.get("CANVA_INVITE_LINK_1Y"),
  });
});

/**
 * Đánh dấu một đơn đã thanh toán. CHỈ được gọi bởi server IPN của Vercel,
 * bảo vệ bằng secret riêng (x-shared-secret === IPN_SHARED_SECRET).
 * Đơn Canva 1 tháng (mã bắt đầu "TVHC" + số tiền 15.000đ) được đánh dấu is_canva.
 */
app.post("/make-server-4d3e30ca/mark-paid", async (c) => {
  const shared = Deno.env.get("IPN_SHARED_SECRET");
  if (shared) {
    const got = c.req.header("x-shared-secret") || "";
    if (got !== shared) {
      console.log("mark-paid bị từ chối: x-shared-secret không khớp");
      return c.json({ error: "Unauthorized" }, 401);
    }
  }

  let body: any = {};
  try {
    body = await c.req.json();
  } catch (err) {
    return c.json({ error: `Body không hợp lệ: ${String(err)}` }, 400);
  }

  const invoice = String(body?.invoice || "").trim();
  const amount = Number(body?.amount) || 0;
  if (!invoice) return c.json({ error: "Thiếu invoice" }, 400);

  const isCanva = invoice.toUpperCase().startsWith("TVHC");

  try {
    await kv.set(`paid:${invoice}`, {
      paid: true,
      amount,
      is_canva: isCanva,
      ts: Date.now(),
    });
  } catch (err) {
    console.log(`Lỗi lưu trạng thái đơn ${invoice}: ${String(err)}`);
    return c.json({ error: `Lỗi lưu trạng thái: ${String(err)}` }, 500);
  }

  return c.json({ success: true, is_canva: isCanva });
});

/**
 * Frontend hỏi trạng thái đơn sau khi thanh toán.
 * Chỉ trả link Canva khi: đơn đã thanh toán + là đơn Canva.
 * Link Canva nằm trong env CANVA_INVITE_LINK (server-side), không có trong bundle.
 */
app.get("/make-server-4d3e30ca/canva-link", async (c) => {
  const invoice = (c.req.query("inv") || "").trim();
  if (!invoice) return c.json({ error: "Thiếu inv" }, 400);

  let record: any = null;
  try {
    record = await kv.get(`paid:${invoice}`);
  } catch (err) {
    console.log(`Lỗi đọc trạng thái đơn ${invoice}: ${String(err)}`);
    return c.json({ error: `Lỗi đọc trạng thái: ${String(err)}` }, 500);
  }

  if (!record?.paid) {
    return c.json({ status: "Pending" });
  }

  const result: Record<string, unknown> = { status: "Paid" };
  if (record.is_canva) {
    // Chọn đúng link theo số tiền của gói: 40.000đ = 3 Tháng, 200.000đ = 1 Năm,
    // còn lại (15.000đ) = 1 Tháng.
    let link: string | undefined;
    if (record.amount === 40000) link = Deno.env.get("CANVA_INVITE_LINK_3M");
    else if (record.amount === 200000) link = Deno.env.get("CANVA_INVITE_LINK_1Y");
    else link = Deno.env.get("CANVA_INVITE_LINK");
    if (link) result.canva_link = link;
  }
  return c.json(result);
});

Deno.serve(app.fetch);