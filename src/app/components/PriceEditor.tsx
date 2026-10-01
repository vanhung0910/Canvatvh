import React, { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, RotateCcw, Save, Search, X } from "lucide-react";
import {
  SECTIONS,
  applyOverrides,
  editablePlans,
  isChatGPTProduct,
  orderProducts,
  parsePrice,
  type PriceOverrides,
} from "../data/products";
import { setOrder, setPrices, useCatalog } from "../data/usePrices";
import type { Product } from "./ProductCard";

type DraftPlan = { key: string; label: string; price: string };
type Draft = { plans: DraftPlan[]; original: string };

const PLAN_SUGGESTIONS = ["1 Tuần", "2 Tuần", "1 Tháng", "2 Tháng", "3 Tháng", "6 Tháng", "1 Năm", "2 Năm", "Vĩnh viễn"];

const digits = (v: string) => v.replace(/[^\d]/g, "");
const pretty = (v: string) => (v ? Number(v).toLocaleString("vi-VN") : "");

function toDraft(product: Product, prices: PriceOverrides): Draft {
  const plans = editablePlans(product, prices).map((p) => ({ key: p.key, label: p.label, price: String(p.price) }));
  const original = prices[product.name]?.original ?? parsePrice(product.originalPrice || "");
  return { plans, original: original ? String(original) : "" };
}

export function PriceEditor({
  call,
}: {
  call: (path: string, init?: RequestInit) => Promise<any>;
}) {
  const { prices, order } = useCatalog();
  const [q, setQ] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const search = q.trim().toLowerCase();
  const sections = useMemo(
    () => SECTIONS.map((s) => ({ ...s, products: orderProducts(s.products, order[s.id]) })),
    [order],
  );

  const move = async (sectionId: string, names: string[], from: number, to: number) => {
    if (to < 0 || to >= names.length) return;
    const next = [...names];
    [next[from], next[to]] = [next[to], next[from]];
    const prev = order;
    setOrder({ ...order, [sectionId]: next }); // hiện ngay, lỗi thì trả lại
    try {
      const r = await call("/admin/order", {
        method: "POST",
        body: JSON.stringify({ section: sectionId, names: next }),
      });
      setOrder(r.order || {});
    } catch (e) {
      setOrder(prev);
      alert(String((e as Error).message));
    }
  };

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
    for (const p of d.plans) plans[p.key] = Number(p.price);
    const labels = d.plans.map((p) => p.key);
    if (!reset) {
      if (!labels.length) return alert("Sản phẩm cần ít nhất 1 gói");
      if (labels.some((l) => !l.trim())) return alert("Nhập tên cho tất cả các gói");
      if (new Set(labels).size !== labels.length) return alert("Tên gói bị trùng");
      if (Object.values(plans).some((n) => !n || n < 1000)) return alert("Giá mỗi gói tối thiểu 1.000đ");
    }
    if (reset && !confirm(`Khôi phục giá mặc định cho ${product.name}?`)) return;
    setSaving(product.name);
    try {
      const r = await call("/admin/prices", {
        method: "POST",
        body: JSON.stringify({
          name: product.name,
          plans,
          ...(isChatGPTProduct(product.name) ? {} : { planList: labels }),
          original: Number(d.original) || 0,
          reset,
        }),
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
          Sửa giá, thêm/xóa gói, bấm <b>Lưu</b>, trang chủ và cổng thanh toán cập nhật ngay. % giảm tự tính từ giá gốc và giá gói rẻ nhất.
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

      {sections.map((section) => {
        const names = section.products.map((p) => p.name);
        const visible = section.products.filter((p) => !search || p.name.toLowerCase().includes(search));
        if (!visible.length) return null;
        return (
          <section key={section.id} className="mb-8">
            <h2 className="mb-3 text-xs font-bold tracking-widest text-gray-400">
              {section.title} <span className="font-normal">· {names.length} sản phẩm · ↑↓ để đổi thứ tự trên web</span>
            </h2>
      <div className="grid gap-3 lg:grid-cols-2">
        {visible.map((product) => {
          const idx = names.indexOf(product.name);
          const d = drafts[product.name] || toDraft(product, prices);
          const dirty = !!drafts[product.name];
          const edited = !!(prices[product.name]?.plans || prices[product.name]?.original);
          const soldOut = !!prices[product.name]?.soldOut;
          const fixedPlans = isChatGPTProduct(product.name);
          const preview = applyOverrides(product, {
            [product.name]: {
              plans: Object.fromEntries(d.plans.map((p) => [p.key, Number(p.price) || 0])),
              planList: fixedPlans ? undefined : d.plans.map((p) => p.key),
              original: Number(d.original) || 0,
            },
          });
          const update = (patch: Partial<Draft>) =>
            setDrafts((all) => ({ ...all, [product.name]: { ...d, ...patch } }));
          const setPlan = (i: number, patch: Partial<DraftPlan>) =>
            update({ plans: d.plans.map((p, j) => (j === i ? { ...p, ...patch } : p)) });

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
                  {!search && (
                    <span className="mr-1 flex rounded-md ring-1 ring-black/10">
                      <button
                        onClick={() => move(section.id, names, idx, idx - 1)}
                        disabled={idx === 0}
                        title="Lên trên"
                        className="p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-20"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => move(section.id, names, idx, idx + 1)}
                        disabled={idx === names.length - 1}
                        title="Xuống dưới"
                        className="border-l border-black/10 p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-20"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </span>
                  )}
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
                {d.plans.map((p, i) =>
                  fixedPlans ? (
                    <PriceField key={i} label={p.label} value={p.price} onChange={(v) => setPlan(i, { price: v })} />
                  ) : (
                    <PriceField
                      key={i}
                      label={
                        <input
                          list="plan-suggestions"
                          value={p.key}
                          onChange={(e) => setPlan(i, { key: e.target.value, label: e.target.value })}
                          placeholder="Tên gói"
                          className="w-full bg-transparent text-[11px] text-gray-600 outline-none"
                        />
                      }
                      value={p.price}
                      onChange={(v) => setPlan(i, { price: v })}
                      onRemove={d.plans.length > 1 ? () => update({ plans: d.plans.filter((_, j) => j !== i) }) : undefined}
                    />
                  ),
                )}
                {!fixedPlans && (
                  <button
                    onClick={() => update({ plans: [...d.plans, { key: "", label: "", price: "" }] })}
                    className="flex min-h-[52px] items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 hover:border-[#5b2fa0] hover:text-[#5b2fa0]"
                  >
                    <Plus size={12} /> Thêm gói
                  </button>
                )}
              </div>
              {product.name === "Canva Pro" && d.plans.some((p) => p.key && !["1 Tháng", "3 Tháng", "1 Năm"].includes(p.key)) && (
                <p className="mt-2 text-[11px] text-amber-600">
                  Gói Canva ngoài 1 Tháng / 3 Tháng / 1 Năm sẽ không tự gửi link, cần giao tay bằng nút “Gửi email”.
                </p>
              )}

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
          </section>
        );
      })}
      <datalist id="plan-suggestions">
        {PLAN_SUGGESTIONS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}

function PriceField({
  label,
  value,
  onChange,
  muted,
  onRemove,
}: {
  label: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  muted?: boolean;
  onRemove?: () => void;
}) {
  return (
    <div className="block">
      <span className={`flex items-center gap-1 text-[11px] ${muted ? "text-gray-400" : "text-gray-600"}`}>
        {label}
        {onRemove && (
          <button onClick={onRemove} title="Xóa gói" className="ml-auto text-gray-300 hover:text-red-500">
            <X size={12} />
          </button>
        )}
      </span>
      <div className="mt-0.5 flex items-center rounded-lg border border-gray-200 px-2.5 focus-within:border-[#5b2fa0] focus-within:ring-2 focus-within:ring-[#5b2fa0]/20">
        <input
          inputMode="numeric"
          value={pretty(value)}
          onChange={(e) => onChange(digits(e.target.value))}
          className="w-full bg-transparent py-1.5 text-sm tabular-nums outline-none"
        />
        <span className="text-xs text-gray-400">đ</span>
      </div>
    </div>
  );
}
