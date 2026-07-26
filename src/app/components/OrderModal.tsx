import { useState } from "react";
import { X } from "lucide-react";
import type { Product } from "./ProductCard";
import { submitSepayCheckout } from "./wcMapping";

interface OrderModalProps {
  product: Product;
  onClose: () => void;
}

/**
 * Nhãn gói ChatGPT phải TRÙNG KHỚP với key trong api/_catalog.ts,
 * vì server dựa vào (productName, planLabel) để tra giá.
 */
const CHATGPT_PLANS = {
  share: {
    planLabel: "1 Tháng (Cấp tài khoản)",
    optionText: "ChatGPT Plus (Cấp tài khoản)",
    price: "275.000đ",
  },
  "chinh-chu": {
    planLabel: "1 Tháng (Chính chủ)",
    optionText: "ChatGPT Plus (Chính chủ)",
    price: "420.000đ",
  },
} as const;

export function OrderModal({ product, onClose }: OrderModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(
    product.plans[0]?.label || "",
  );
  const [chatgptType, setChatgptType] =
    useState<keyof typeof CHATGPT_PLANS>("share");
  const [paymentMethod] = useState("Chuyển khoản");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isChatGPT = product.name.toLowerCase().includes("chatgpt");

  const selectedPlanData = product.plans.find(
    (p) => p.label === selectedPlan,
  );

  const displayPrice = isChatGPT
    ? CHATGPT_PLANS[chatgptType].price
    : selectedPlanData?.price || "";

  const handleOrder = async () => {
    setError(null);
    if (!fullName.trim() || !phone.trim()) {
      setError("Vui lòng nhập đầy đủ tên và thông tin liên hệ.");
      return;
    }
    setLoading(true);
    const planLabel = isChatGPT
      ? CHATGPT_PLANS[chatgptType].planLabel
      : selectedPlan;

    const result = await submitSepayCheckout(
      product.name,
      planLabel,
      fullName.trim(),
      phone.trim(),
    );

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
    }
    // Nếu ok: trình duyệt đang chuyển sang trang SePay, giữ nguyên trạng thái loading.
  };

  const handleConsult = () => {
    window.open(
      "https://www.facebook.com/groups/tvhcanva",
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`Đặt mua ${product.name}`}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Header */}
        <div
          className="text-center py-4 px-6"
          style={{
            background:
              "linear-gradient(135deg, #1a1a4e 0%, #5b2fa0 100%)",
          }}
        >
          <h2
            className="text-white"
            style={{
              fontSize: "1.4rem",
              fontWeight: 900,
              fontStyle: "italic",
              textTransform: "uppercase",
            }}
          >
            ĐẶT MUA TÀI KHOẢN
          </h2>
        </div>

        {/* Product name + close */}
        <div className="relative px-6 pt-5 pb-3 text-center">
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              fontStyle: "italic",
              color: "#7c3aed",
            }}
          >
            {product.name} Giá Rẻ
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute top-4 right-4 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Name & Phone row */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tên"
              autoComplete="name"
              maxLength={60}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
            />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="SĐT / Zalo hoặc Email"
              autoComplete="tel"
              maxLength={60}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
            />
          </div>

          {/* Product & Plan row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              {isChatGPT ? (
                <select
                  aria-label="Loại tài khoản ChatGPT"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 appearance-none bg-white text-sm pr-8"
                  value={chatgptType}
                  onChange={(e) =>
                    setChatgptType(
                      e.target.value as keyof typeof CHATGPT_PLANS,
                    )
                  }
                >
                  {(
                    Object.keys(CHATGPT_PLANS) as (keyof typeof CHATGPT_PLANS)[]
                  ).map((k) => (
                    <option key={k} value={k}>
                      {CHATGPT_PLANS[k].optionText}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  aria-label="Sản phẩm"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 appearance-none bg-white text-sm pr-8"
                  disabled
                  value={product.name}
                >
                  <option>{product.name}</option>
                </select>
              )}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path
                    d="M3 5l3 3 3-3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
            <div className="relative">
              {isChatGPT ? (
                <select
                  aria-label="Thời hạn"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 appearance-none bg-white text-sm pr-8"
                  disabled
                >
                  <option>1 tháng</option>
                </select>
              ) : (
                <select
                  aria-label="Chọn gói"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 appearance-none bg-white text-sm pr-8"
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                >
                  {product.plans.map((plan) => (
                    <option key={plan.label} value={plan.label}>
                      {plan.label}
                    </option>
                  ))}
                </select>
              )}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path
                    d="M3 5l3 3 3-3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="border border-gray-300 rounded-lg px-4 py-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="w-4 h-4 rounded-full border-2 border-purple-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
              </div>
              <span
                className="text-sm text-gray-700"
                style={{ fontWeight: 600 }}
              >
                {paymentMethod}
              </span>
            </label>
          </div>

          {/* Total */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
            <span
              className="text-gray-700"
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                fontStyle: "italic",
              }}
            >
              Tổng tiền
            </span>
            <span
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#1a1a4e",
              }}
            >
              {displayPrice}
            </span>
          </div>

          {/* Lỗi (thay cho alert()) */}
          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm"
            >
              {error}
            </div>
          )}

          {/* Order button */}
          <button
            type="button"
            onClick={handleOrder}
            disabled={loading}
            className="w-full text-white py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
            style={{
              background:
                "linear-gradient(135deg, #c054c0 0%, #e06080 100%)",
              fontSize: "1.1rem",
              fontWeight: 900,
              fontStyle: "italic",
              textTransform: "uppercase",
            }}
          >
            {loading ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG NGAY"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t-2 border-dashed border-gray-300" />
            <span
              className="text-purple-500"
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                fontStyle: "italic",
              }}
            >
              hoặc
            </span>
            <div className="flex-1 border-t-2 border-dashed border-gray-300" />
          </div>

          {/* Consult button */}
          <button
            type="button"
            onClick={handleConsult}
            className="w-full text-white py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              background:
                "linear-gradient(135deg, #7c3aed 0%, #5b2fa0 100%)",
              fontSize: "1.1rem",
              fontWeight: 900,
              fontStyle: "italic",
              textTransform: "uppercase",
            }}
          >
            NHẬN TƯ VẤN THÊM
          </button>
        </div>
      </div>
    </div>
  );
}
