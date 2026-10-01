import { useCallback, useEffect, useMemo, useState } from "react";
import { Lock, RefreshCw, LogOut, Search, AlertTriangle, CheckCircle2, Copy } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const FN = `https://${projectId}.supabase.co/functions/v1/make-server-4d3e30ca`;
const KEY_STORAGE = "tvh_admin_key";

type Order = {
  invoice: string;
  amount: number;
  paid_amount?: number;
  product: string;
  plan: string;
  name: string;
  phone: string;
  is_canva: boolean;
  status: "pending" | "paid" | "mismatch" | "delivered" | "cancelled";
  created_at: number;
  paid_at?: number;
  warning?: string;
  note?: string;
};

const STATUS: Record<Order["status"], { label: string; cls: string }> = {
  pending: { label: "Chờ thanh toán", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  paid: { label: "Đã thanh toán", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  mismatch: { label: "Cần kiểm tra", cls: "bg-red-50 text-red-700 ring-red-200" },
  delivered: { label: "Đã giao", cls: "bg-indigo-50 text-indigo-700 ring-indigo-200" },
  cancelled: { label: "Đã hủy", cls: "bg-gray-100 text-gray-500 ring-gray-200" },
};

const vnd = (n: number) => `${(n || 0).toLocaleString("vi-VN")}đ`;
const time = (t?: number) =>
  t ? new Date(t).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }) : "—";

async function call(path: string, key: string, init?: RequestInit) {
  const res = await fetch(`${FN}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
      "x-admin-key": key,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export function AdminPage() {
  const [key, setKey] = useState(() => sessionStorage.getItem(KEY_STORAGE) || "");
  const [input, setInput] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [diag, setDiag] = useState<Record<string, boolean> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | Order["status"]>("all");
  const [q, setQ] = useState("");

  const load = useCallback(async (k: string) => {
    setLoading(true);
    setError("");
    try {
      const [o, d] = await Promise.all([call("/admin/orders", k), call("/admin/diag", k)]);
      setOrders(o.orders || []);
      setDiag(d);
      sessionStorage.setItem(KEY_STORAGE, k);
      setKey(k);
    } catch (e) {
      setError(String((e as Error).message));
      if (String(e).includes("mật khẩu")) {
        sessionStorage.removeItem(KEY_STORAGE);
        setKey("");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (key) load(key);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const update = async (invoice: string, status: Order["status"]) => {
    if (status === "cancelled" && !confirm(`Hủy đơn ${invoice}?`)) return;
    try {
      const r = await call("/admin/update", key, { method: "POST", body: JSON.stringify({ invoice, status }) });
      setOrders((list) => list.map((o) => (o.invoice === invoice ? r.order : o)));
    } catch (e) {
      alert(String((e as Error).message));
    }
  };

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (filter === "all" || o.status === filter) &&
        (!s || [o.invoice, o.name, o.phone, o.product].some((v) => v?.toLowerCase().includes(s))),
    );
  }, [orders, filter, q]);

  const stats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const paid = orders.filter((o) => o.status === "paid" || o.status === "delivered");
    return {
      revenueToday: paid.filter((o) => (o.paid_at || 0) >= today).reduce((s, o) => s + o.amount, 0),
      revenueAll: paid.reduce((s, o) => s + o.amount, 0),
      toDeliver: orders.filter((o) => o.status === "paid" && !o.is_canva).length,
      review: orders.filter((o) => o.status === "mismatch").length,
    };
  }, [orders]);

  if (!key) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#1a1a4e] p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input) load(input);
          }}
          className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#5b2fa0] text-white">
              <Lock size={18} />
            </span>
            <div>
              <h1 className="text-lg font-bold text-[#1a1a4e]">Quản trị TVH Canva</h1>
              <p className="text-xs text-gray-500">Nhập mật khẩu quản trị</p>
            </div>
          </div>
          <input
            type="password"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-[#5b2fa0] focus:ring-2 focus:ring-[#5b2fa0]/20"
            placeholder="Mật khẩu"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-[#5b2fa0] py-2.5 font-semibold text-white transition hover:bg-[#4a2585] disabled:opacity-60"
          >
            {loading ? "Đang kiểm tra..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    );
  }

  const missing = diag ? Object.entries(diag).filter(([, v]) => !v).map(([k]) => k) : [];

  return (
    <div className="min-h-screen bg-[#f6f5fb] text-[#1a1a4e]">
      <header className="sticky top-0 z-10 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <div className="flex items-baseline gap-3">
            <h1 className="text-lg font-extrabold">TVH Canva</h1>
            <span className="text-xs uppercase tracking-widest text-gray-400">Quản trị đơn hàng</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(key)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Làm mới
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem(KEY_STORAGE);
                setKey("");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
            >
              <LogOut size={14} /> Thoát
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6">
        {missing.length > 0 && (
          <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            Thiếu secret trên Supabase: <b>{missing.join(", ")}</b>. Đơn tương ứng sẽ không được tự giao link.
          </div>
        )}
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Doanh thu hôm nay", vnd(stats.revenueToday)],
            ["Tổng doanh thu", vnd(stats.revenueAll)],
            ["Chờ giao tay", String(stats.toDeliver)],
            ["Cần kiểm tra", String(stats.review)],
          ].map(([label, value], i) => (
            <div key={label} className={`rounded-xl bg-white p-4 ring-1 ring-black/5 ${i === 3 && stats.review ? "ring-red-300" : ""}`}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
            </div>
          ))}
        </section>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          {(["all", "pending", "paid", "mismatch", "delivered", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-sm transition ${
                filter === f ? "bg-[#5b2fa0] text-white" : "bg-white text-gray-600 ring-1 ring-black/5 hover:bg-gray-50"
              }`}
            >
              {f === "all" ? "Tất cả" : STATUS[f].label}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 ring-1 ring-black/5">
            <Search size={14} className="text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Mã đơn, tên, email..."
              className="w-48 bg-transparent text-sm outline-none"
            />
          </label>
        </div>

        <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-black/5">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    {loading ? "Đang tải..." : "Chưa có đơn nào"}
                  </td>
                </tr>
              )}
              {shown.map((o) => (
                <tr key={o.invoice} className="border-b border-gray-50 align-top hover:bg-[#faf9fd]">
                  <td className="px-4 py-3 font-mono text-xs">
                    <button
                      onClick={() => navigator.clipboard.writeText(o.invoice)}
                      className="inline-flex items-center gap-1 hover:text-[#5b2fa0]"
                      title="Sao chép"
                    >
                      {o.invoice} <Copy size={11} />
                    </button>
                    {o.is_canva && (
                      <span className="mt-1 block w-fit rounded bg-purple-100 px-1.5 text-[10px] font-semibold text-purple-700">
                        TỰ GIAO CANVA
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.name || "—"}</p>
                    <a href={o.phone.includes("@") ? `mailto:${o.phone}` : `https://zalo.me/${o.phone}`} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-[#5b2fa0]">
                      {o.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <p>{o.product || "—"}</p>
                    <p className="text-xs text-gray-500">{o.plan}</p>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {vnd(o.amount)}
                    {o.paid_amount !== undefined && o.paid_amount !== o.amount && (
                      <p className="text-xs text-red-600">Nhận {vnd(o.paid_amount)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs ring-1 ${STATUS[o.status]?.cls}`}>
                      {STATUS[o.status]?.label || o.status}
                    </span>
                    {o.warning && <p className="mt-1 max-w-[220px] text-xs text-red-600">{o.warning}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    <p>Tạo {time(o.created_at)}</p>
                    {o.paid_at && <p>Trả {time(o.paid_at)}</p>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      {o.status === "mismatch" && (
                        <button onClick={() => update(o.invoice, "paid")} className="rounded-md bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700">
                          Duyệt
                        </button>
                      )}
                      {(o.status === "paid" || o.status === "mismatch") && (
                        <button onClick={() => update(o.invoice, "delivered")} className="inline-flex items-center gap-1 rounded-md bg-[#5b2fa0] px-2 py-1 text-xs text-white hover:bg-[#4a2585]">
                          <CheckCircle2 size={12} /> Đã giao
                        </button>
                      )}
                      {o.status !== "cancelled" && o.status !== "delivered" && (
                        <button onClick={() => update(o.invoice, "cancelled")} className="rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100">
                          Hủy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
