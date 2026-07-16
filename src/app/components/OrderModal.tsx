import { useState, useRef, useEffect } from "react";
import { X, Copy, Check } from "lucide-react";
import type { Product } from "./ProductCard";
import {
  createSepayOrder,
  getSepayOrderStatus,
  type SepayOrder,
} from "./wcMapping";

interface OrderModalProps {
  product: Product;
  onClose: () => void;
}

type Step = "form" | "pay" | "done";

export function OrderModal({
  product,
  onClose,
}: OrderModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(
    product.plans[0]?.label || "",
  );
  const [chatgptType, setChatgptType] = useState<
    "share" | "chinh-chu"
  >("share");
  const [paymentMethod] = useState("Chuyển khoản / Quét QR");

  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<SepayOrder | null>(null);
  const [canvaLink, setCanvaLink] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const chatgptPrices: Record<string, string> = {
    share: "275.000đ",
    "chinh-chu": "420.000đ",
  };

  const isChatGPT = product.name
    .toLowerCase()
    .includes("chatgpt");

  const selectedPlanData = product.plans.find(
    (p) => p.label === selectedPlan,
  );

  const priceStr = isChatGPT
    ? chatgptPrices[chatgptType]
    : selectedPlanData?.price || "";

  // Dọn dẹp các interval khi đóng modal.
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = (seconds: number) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setSecondsLeft(seconds);
    countdownRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          if (pollRef.current) clearInterval(pollRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const checkNow = async () => {
    if (!order) return;
    setChecking(true);
    try {
      const st = await getSepayOrderStatus(order.order_code, order.amount);
      if (st.status === "Paid") {
        if (pollRef.current) clearInterval(pollRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (st.canva_link) setCanvaLink(st.canva_link);
        setStep("done");
      } else {
        alert("Chưa nhận được thanh toán. Vui lòng đợi thêm hoặc kiểm tra lại nội dung/số tiền chuyển khoản.");
      }
    } catch {
      alert("Không kiểm tra được lúc này. Vui lòng thử lại sau giây lát.");
    } finally {
      setChecking(false);
    }
  };

  const fmtTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const startPolling = (code: string, amount: number) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const st = await getSepayOrderStatus(code, amount);
        if (st.status === "Paid") {
          if (pollRef.current) clearInterval(pollRef.current);
          if (st.canva_link) setCanvaLink(st.canva_link);
          setStep("done");
        }
      } catch {
        /* thử lại ở lần poll sau */
      }
    }, 4000);
  };

  const handleOrder = async () => {
    if (!fullName.trim() || !phone.trim()) {
      alert("Vui lòng nhập đầy đủ tên và số điện thoại!");
      return;
    }
    setLoading(true);
    try {
      const planLabel = isChatGPT ? "1 Tháng" : selectedPlan;
      const created = await createSepayOrder(
        product.name,
        planLabel,
        priceStr,
        fullName,
        phone,
      );
      setOrder(created);
      setStep("pay");
      startPolling(created.order_code, created.amount);
      startCountdown(15 * 60);
    } catch (err: any) {
      alert(err?.message || "Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ Zalo!");
    } finally {
      setLoading(false);
    }
  };

  const handleConsult = () => {
    window.open(`https://www.facebook.com/huwng0910`, "_blank");
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden max-h-[92vh] overflow-y-auto">
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
            {step === "pay"
              ? "QUÉT QR ĐỂ THANH TOÁN"
              : step === "done"
                ? "THANH TOÁN THÀNH CÔNG"
                : "ĐẶT MUA TÀI KHOẢN"}
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
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {step === "done" ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-3">✅</div>
            <h3
              className="text-green-600 mb-2"
              style={{ fontSize: "1.2rem", fontWeight: 700 }}
            >
              Thanh toán thành công!
            </h3>
            {canvaLink ? (
              <div className="mt-4">
                <p className="text-gray-600 text-sm mb-3">
                  Nhấn nút bên dưới để tham gia Canva của bạn:
                </p>
                <a
                  href={canvaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full text-white py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #7c3aed 0%, #c054c0 100%)",
                    fontSize: "1.05rem",
                    fontWeight: 900,
                    fontStyle: "italic",
                    textTransform: "uppercase",
                  }}
                >
                  THAM GIA CANVA NGAY
                </a>
                <p className="text-gray-400 text-xs mt-3">
                  Link tham gia là riêng của bạn, vui lòng không chia sẻ cho người khác.
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Chúng tôi sẽ bàn giao tài khoản và liên hệ với bạn trong thời
                gian sớm nhất.
              </p>
            )}
            <button
              onClick={onClose}
              className="mt-5 px-6 py-2 text-white rounded-lg transition-colors"
              style={{
                background:
                  "linear-gradient(135deg, #7c3aed, #c054c0)",
              }}
            >
              Đóng
            </button>
          </div>
        ) : step === "pay" && order ? (
          <div className="px-6 pb-6 space-y-4">
            {/* QR */}
            {order.qr_url && (
              <div className="flex justify-center">
                <img
                  src={order.qr_url}
                  alt="Mã QR thanh toán"
                  className="w-52 h-52 object-contain border border-gray-200 rounded-lg p-2"
                />
              </div>
            )}

            <p className="text-center text-gray-500 text-sm">
              Quét mã QR bằng app ngân hàng, hoặc chuyển khoản thủ công:
            </p>

            {/* Bank details */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg divide-y divide-gray-200 text-sm">
              {order.bank_name && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-gray-500">Ngân hàng</span>
                  <span style={{ fontWeight: 700 }}>{order.bank_name}</span>
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-gray-500">Số tài khoản</span>
                <button
                  onClick={() => copyText(order.account_number, "va")}
                  className="flex items-center gap-1.5 text-purple-600"
                  style={{ fontWeight: 700 }}
                >
                  {order.account_number}
                  {copied === "va" ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              {order.account_holder && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-gray-500">Chủ tài khoản</span>
                  <span style={{ fontWeight: 700 }}>{order.account_holder}</span>
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-gray-500">Số tiền</span>
                <button
                  onClick={() => copyText(String(order.amount), "amount")}
                  className="flex items-center gap-1.5 text-purple-600"
                  style={{ fontWeight: 700 }}
                >
                  {order.amount.toLocaleString("vi-VN")}đ
                  {copied === "amount" ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-gray-500">Nội dung</span>
                <button
                  onClick={() => copyText(order.order_code, "code")}
                  className="flex items-center gap-1.5 text-purple-600"
                  style={{ fontWeight: 700 }}
                >
                  {order.order_code}
                  {copied === "code" ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <span className="inline-block w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              {secondsLeft > 0
                ? `Đang chờ thanh toán, tự động xác nhận... (${fmtTime(secondsLeft)})`
                : "Mã QR đã hết hạn, vui lòng tạo lại đơn."}
            </div>

            {/* Nút kiểm tra thủ công */}
            <button
              onClick={checkNow}
              disabled={checking}
              className="w-full text-white py-3 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
              style={{
                background:
                  "linear-gradient(135deg, #7c3aed 0%, #c054c0 100%)",
                fontSize: "1rem",
                fontWeight: 900,
                fontStyle: "italic",
                textTransform: "uppercase",
              }}
            >
              {checking ? "ĐANG KIỂM TRA..." : "TÔI ĐÃ CHUYỂN KHOẢN – KIỂM TRA NGAY"}
            </button>

            <p className="text-center text-gray-400 text-xs">
              Vui lòng chuyển đúng số tiền và nội dung để được xác nhận tự động.
            </p>
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
                placeholder="SĐT có đăng kí Zalo"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
              />
            </div>

            {/* Product & Plan row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                {isChatGPT ? (
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 appearance-none bg-white text-sm pr-8"
                    value={chatgptType}
                    onChange={(e) =>
                      setChatgptType(
                        e.target.value as "share" | "chinh-chu",
                      )
                    }
                  >
                    <option value="share">
                      ChatGPT Plus (Cấp tài khoản)
                    </option>
                    <option value="chinh-chu">
                      ChatGPT Plus (Chính chủ)
                    </option>
                  </select>
                ) : (
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 appearance-none bg-white text-sm pr-8"
                    disabled
                    value={product.name}
                  >
                    <option>{product.name}</option>
                  </select>
                )}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                  >
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 appearance-none bg-white text-sm pr-8"
                    disabled
                  >
                    <option>1 tháng</option>
                  </select>
                ) : (
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 appearance-none bg-white text-sm pr-8"
                    value={selectedPlan}
                    onChange={(e) =>
                      setSelectedPlan(e.target.value)
                    }
                  >
                    {product.plans.map((plan) => (
                      <option
                        key={plan.label}
                        value={plan.label}
                      >
                        {plan.label}
                      </option>
                    ))}
                  </select>
                )}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                  >
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
                {priceStr}
              </span>
            </div>

            {/* Order button */}
            <button
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
        )}
      </div>
    </div>
  );
}
