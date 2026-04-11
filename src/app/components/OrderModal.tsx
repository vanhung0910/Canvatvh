import { useState } from "react";
import { X, MessageCircle } from "lucide-react";
import type { Product } from "./ProductCard";

interface OrderModalProps {
  product: Product;
  onClose: () => void;
}

export function OrderModal({ product, onClose }: OrderModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(product.plans[0]?.label || "");
  const [paymentMethod] = useState("Chuyển khoản");
  const [submitted, setSubmitted] = useState(false);

  const handleOrder = () => {
    if (!fullName.trim() || !phone.trim()) {
      alert("Vui lòng nhập đầy đủ tên và số điện thoại!");
      return;
    }
    setSubmitted(true);
  };

  const handleConsult = () => {
    const msg = encodeURIComponent(
      `Xin chào! Tôi muốn tư vấn về sản phẩm: ${product.name} - Gói: ${selectedPlan}`
    );
    window.open(`https://www.facebook.com/huwng910`, "_blank");
  };

  const selectedPlanData = product.plans.find((p) => p.label === selectedPlan);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Header */}
        <div className="text-center py-4 px-6" style={{ background: "linear-gradient(135deg, #1a1a4e 0%, #5b2fa0 100%)" }}>
          <h2 className="text-white" style={{ fontSize: "1.4rem", fontWeight: 900, fontStyle: "italic", textTransform: "uppercase" }}>
            ĐẶT MUA TÀI KHOẢN
          </h2>
        </div>

        {/* Product name + close */}
        <div className="relative px-6 pt-5 pb-3 text-center">
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, fontStyle: "italic", color: "#7c3aed" }}>
            {product.name} Giá Rẻ
          </h3>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-3">✅</div>
            <h3 className="text-green-600 mb-2" style={{ fontSize: "1.2rem", fontWeight: 700 }}>Đặt hàng thành công!</h3>
            <p className="text-gray-500 text-sm">
              Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
            </p>
            <button
              onClick={onClose}
              className="mt-5 px-6 py-2 text-white rounded-lg transition-colors"
              style={{ background: "linear-gradient(135deg, #7c3aed, #c054c0)" }}
            >
              Đóng
            </button>
          </div>
        ) : (
          <div className="px-6 pb-6 space-y-4">
            {/* Name & Phone row */}
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tên"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
              />
            </div>

            {/* Product & Plan row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 appearance-none bg-white text-sm pr-8"
                  disabled
                  value={product.name}
                >
                  <option>{product.name}</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
                </div>
              </div>
              <div className="relative">
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 appearance-none bg-white text-sm pr-8"
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                >
                  {product.plans.map((plan) => (
                    <option key={plan.label} value={plan.label}>{plan.label}</option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="border border-gray-300 rounded-lg px-4 py-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="w-4 h-4 rounded-full border-2 border-purple-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                </div>
                <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>{paymentMethod}</span>
              </label>
            </div>

            {/* Total */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-gray-700" style={{ fontSize: "0.95rem", fontWeight: 700, fontStyle: "italic" }}>Tổng tiền</span>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a1a4e" }}>
                {selectedPlanData?.price || product.price}
              </span>
            </div>

            {/* Order button */}
            <button
              onClick={handleOrder}
              className="w-full text-white py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #c054c0 0%, #e06080 100%)", fontSize: "1.1rem", fontWeight: 900, fontStyle: "italic", textTransform: "uppercase" }}
            >
              ĐẶT HÀNG NGAY
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t-2 border-dashed border-gray-300" />
              <span className="text-purple-500" style={{ fontSize: "0.9rem", fontWeight: 700, fontStyle: "italic" }}>hoặc</span>
              <div className="flex-1 border-t-2 border-dashed border-gray-300" />
            </div>

            {/* Consult button */}
            <button
              onClick={handleConsult}
              className="w-full text-white py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #5b2fa0 100%)", fontSize: "1.1rem", fontWeight: 900, fontStyle: "italic", textTransform: "uppercase" }}
            >
              NHẬN TƯ VẤN THÊM
            </button>
          </div>
        )}
      </div>
    </div>
  );
}