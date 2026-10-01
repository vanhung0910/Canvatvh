import { useMemo, useState } from "react";
import { RotateCcw, Save, Search } from "lucide-react";
import {
  ALL_PRODUCTS,
  applyOverrides,
  editablePlans,
  parsePrice,
  type PriceOverrides,
} from "../data/products";
import { setPrices, usePrices } from "../data/usePrices";
import type { Product } from "./ProductCard";

type Draft = { plans: Record<string, string>; original: string };

const digits = (v: string) => v.replace(/[^\d]/g, "");
const pretty = (v: string) => (v ? Number(v).toLocaleString("vi-VN") : "");

function toDraft(product: Product, prices: PriceOverrides): Draft {
  const plans: Record<string, string> = {};
  editablePlans(product, prices).forEach((p) => (plans[p.key] = String(p.price)));
  const original = prices[product.name]?.original ?? parsePrice(product.originalPrice || "");
  return { plans, original: original ? String(original) : "" };
}

export function PriceEditor({
  call,
}: {
  call: (path: string, init?: RequestInit) => Promise<any>;
}) {
  const prices = usePrices();
  const [q, setQ] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return ALL_PRODUCTS.filter((p) => !s || p.name.toLowerCase().includes(s));
  }, [q]);

  const toggleSoldOut = async (product: Product, soldOut: boolean) => {
    setSaving(product.name);
    try {
      const r = await call("/admin/prices", {
        method: "POST",
        body: JSON.stringify({ name: product.name, soldOut }),
      });
      setPrices(r.prices || {});
    } catch (e) {
      alert(String((e as Error).message));
    } finally {
      setSaving(null);
    }
  };

  const save = async (product: Product, reset = false) => {
    const d = drafts[product.name] || toDraft(product, prices);
    const plans: Record<string, number> = {};
    for (const [k, v] of Object.entries(d.plans)) plans[k] = Number(v);
    if (!reset && Object.values(plans).some((n) => !n || n < 1000)) {
      alert("Giá mỗi gói tối thiểu 1.000đ");
      return;
    }
    if (reset && !confirm(`Khôi phục giá mặc định cho ${product.name}?`)) return;
    setSaving(product.name);
    try {
      const r = await call("/admin/prices", {
        method: "POST",
        body: JSON.stringify({ name: product.name, plans, original: Number(d.original) || 0, reset }),
      });
      setPrices(r.prices || {});
      setDrafts(({ [product.name]: _, ...rest }) => rest);
    } catch (e) {
      alert(String((e as Error).message));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <p className="text-sm text-gray-500">
          Sửa giá, bấm <b>Lưu</b>, trang chủ và cổng thanh toán cập nhật ngay. % giảm tự tính từ giá gốc và giá gói rẻ nhất.
        </p>
        <label className="ml-auto flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 ring-1 ring-black/5">
          <Search size={14} className="text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm sản phẩm..."
            className="w-48 bg-transparent text-sm outline-none"
          />
        </label>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {list.map((product) => {
          const d = drafts[product.name] || toDraft(product, prices);
          const dirty = !!drafts[product.name];
          const edited = !!(prices[product.name]?.plans || prices[product.name]?.original);
          const soldOut = !!prices[product.name]?.soldOut;
          const preview = applyOverrides(product, {
            [product.name]: {
              plans: Object.fromEntries(Object.entries(d.plans).map(([k, v]) => [k, Number(v) || 0])),
              original: Number(d.original) || 0,
            },
          });
          const plans = editablePlans(product, prices);
          const update = (patch: Partial<Draft>) =>
            setDrafts((all) => ({ ...all, [product.name]: { ...d, ...patch } }));

          return (
            <div key={product.name} className={`rounded-xl p-4 ring-1 ${soldOut ? "bg-gray-50" : "bg-white"} ${dirty ? "ring-[#5b2fa0]/40" : "ring-black/5"}`}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 font-bold">
                    {product.name}
                    {soldOut && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">HẾT HÀNG</span>
                    )}
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Hiển thị: <b className="text-pink-600">{preview.price}</b>
                    {preview.originalPrice && <span className="ml-1 line-through">{preview.originalPrice}</span>}
                    {preview.discount && <b className="ml-1 text-pink-600">{preview.discount}</b>}
                    {edited && <span className="ml-2 rounded bg-indigo-50 px-1.5 text-[10px] text-indigo-700">ĐÃ SỬA</span>}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {edited && (
                    <button
                      onClick={() => save(product, true)}
                      title="Khôi phục mặc định"
                      className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => save(product)}
                    disabled={!dirty || saving === product.name}
                    className="inline-flex items-center gap-1 rounded-md bg-[#5b2fa0] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4a2585] disabled:opacity-30"
                  >
                    <Save size={12} /> {saving === product.name ? "Đang lưu" : "Lưu"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <PriceField label="Giá gốc (gạch ngang)" value={d.original} onChange={(v) => update({ original: v })} muted />
                {plans.map((p) => (
                  <PriceField
                    key={p.key}
                    label={p.label}
                    value={d.plans[p.key] ?? ""}
                    onChange={(v) => update({ plans: { ...d.plans, [p.key]: v } })}
                  />
                ))}
              </div>

              <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 border-t border-gray-100 pt-3">
                <span className="text-sm">
                  <b className={soldOut ? "text-red-600" : "text-gray-700"}>Hết hàng</b>
                  <span className="ml-2 text-xs text-gray-400">
                    {soldOut ? "Web hiện “Hết hàng”, không nhận đơn" : "Đang nhận đơn"}
                  </span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={soldOut}
                  disabled={saving === product.name}
                  onClick={() => toggleSoldOut(product, !soldOut)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                    soldOut ? "bg-red-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                      soldOut ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PriceField({
  label,
  value,
  onChange,
  muted,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  muted?: boolean;
}) {
  return (
    <label className="block">
      <span className={`text-[11px] ${muted ? "text-gray-400" : "text-gray-600"}`}>{label}</span>
      <div className="mt-0.5 flex items-center rounded-lg border border-gray-200 px-2.5 focus-within:border-[#5b2fa0] focus-within:ring-2 focus-within:ring-[#5b2fa0]/20">
        <input
          inputMode="numeric"
          value={pretty(value)}
          onChange={(e) => onChange(digits(e.target.value))}
          className="w-full bg-transparent py-1.5 text-sm tabular-nums outline-none"
        />
        <span className="text-xs text-gray-400">đ</span>
      </div>
    </label>
  );
}
