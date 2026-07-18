import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { getCanvaStatus } from "./wcMapping";

interface PaymentReturnModalProps {
  status: "success" | "error" | "cancel";
  invoice: string;
  onClose: () => void;
}

/**
 * Hiển thị sau khi khách quay lại từ trang thanh toán Sepay.
 * Với đơn Canva đã thanh toán, tự động lấy link tham gia Canva (server giữ link).
 */
export function PaymentReturnModal({
  status,
  invoice,
  onClose,
}: PaymentReturnModalProps) {
  const isCanvaOrder = invoice.toUpperCase().startsWith("TVHC");
  const [canvaLink, setCanvaLink] = useState<string | null>(null);
  const [checking, setChecking] = useState(status === "success" && isCanvaOrder);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const triesRef = useRef(0);

  useEffect(() => {
    if (status !== "success" || !isCanvaOrder) return;

    const check = async () => {
      triesRef.current += 1;
      try {
        const st = await getCanvaStatus(invoice);
        if (st.status === "Paid") {
          if (st.canva_link) setCanvaLink(st.canva_link);
          setChecking(false);
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        /* thử lại lần sau */
      }
      // Ngừng sau ~2 phút nếu vẫn chưa nhận được IPN.
      if (triesRef.current >= 40) {
        setChecking(false);
        if (pollRef.current) clearInterval(pollRef.current);
      }
    };

    check();
    pollRef.current = setInterval(check, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, invoice, isCanvaOrder]);

  const title =
    status === "success"
      ? "THANH TOÁN THÀNH CÔNG"
      : status === "cancel"
        ? "ĐÃ HỦY THANH TOÁN"
        : "THANH TOÁN THẤT BẠI";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
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
            {title}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="p-8 text-center">
          {status === "success" ? (
            <>
              <div className="text-5xl mb-3">✅</div>
              <h3
                className="text-green-600 mb-2"
                style={{ fontSize: "1.2rem", fontWeight: 700 }}
              >
                Cảm ơn bạn đã thanh toán!
              </h3>

              {isCanvaOrder ? (
                canvaLink ? (
                  <div className="mt-4">
                    <div className="text-left bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                      <p
                        className="text-purple-800 mb-2"
                        style={{ fontWeight: 800, fontSize: "0.95rem" }}
                      >
                        Hướng dẫn tham gia (làm đúng để không bị lỗi):
                      </p>
                      <ol className="space-y-2 text-sm text-gray-700 list-decimal pl-5">
                        <li>
                          <span style={{ fontWeight: 700 }}>Bắt buộc</span> đăng
                          nhập tài khoản Canva của bạn trên{" "}
                          <span style={{ fontWeight: 700 }}>
                            chính thiết bị / trình duyệt bạn đang dùng
                          </span>{" "}
                          (bằng app Canva hoặc trên trình duyệt hiện tại).
                        </li>
                        <li>
                          Sau khi đã đăng nhập xong, quay lại đúng trang này và
                          nhấn nút{" "}
                          <span style={{ fontWeight: 700 }}>
                            THAM GIA CANVA NGAY
                          </span>{" "}
                          bên dưới để vào nhóm Canva Pro.
                        </li>
                      </ol>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      Đã đăng nhập Canva xong? Nhấn nút bên dưới để vào nhóm:
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
                ) : checking ? (
                  <div className="mt-4 flex flex-col items-center gap-2 text-gray-500 text-sm">
                    <span className="inline-block w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    Đang xác nhận thanh toán và lấy link Canva...
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mt-4">
                    Chúng tôi đang xác nhận thanh toán. Nếu đã chuyển khoản, link
                    Canva sẽ được gửi ngay khi xác nhận xong. Vui lòng liên hệ Zalo nếu cần hỗ trợ.
                  </p>
                )
              ) : (
                <p className="text-gray-500 text-sm">
                  Chúng tôi sẽ bàn giao tài khoản và liên hệ với bạn trong thời
                  gian sớm nhất.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="text-5xl mb-3">
                {status === "cancel" ? "⚠️" : "❌"}
              </div>
              <p className="text-gray-600 text-sm">
                {status === "cancel"
                  ? "Bạn đã hủy giao dịch. Bạn có thể đặt lại bất cứ lúc nào."
                  : "Thanh toán chưa thành công. Vui lòng thử lại hoặc liên hệ Zalo để được hỗ trợ."}
              </p>
            </>
          )}

          <button
            onClick={onClose}
            className="mt-5 px-6 py-2 text-white rounded-lg transition-colors"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #c054c0)",
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
