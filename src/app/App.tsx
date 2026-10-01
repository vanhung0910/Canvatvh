import { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle,
  MousePointer,
  FileText,
  Smartphone,
  UserCircle,
  Star,
  Facebook,
  Gift,
  Bell,
} from "lucide-react";

const FACEBOOK_GROUP_URL = "https://www.facebook.com/groups/tvhcanva";
import logoImg from "../imports/logo.png";
import {
  ProductCard,
  type Product,
} from "./components/ProductCard";
import { OrderModal } from "./components/OrderModal";
import { PaymentReturnModal } from "./components/PaymentReturnModal";
import { FloatingButtons } from "./components/FloatingButtons";
import { AdminPage } from "./components/AdminPage";
import {
  BEST_SELLERS,
  DESIGN_PRODUCTS,
  AI_PRODUCTS,
  WORK_PRODUCTS,
  ENTERTAINMENT_PRODUCTS,
  EDUCATION_PRODUCTS,
  VPN_PRODUCTS,
} from "./data/products";

const TESTIMONIALS = [
  {
    name: "Chị My",
    role: "Sinh viên",
    avatar:
      "https://content.pancake.vn/1/f6/c7/6b/c2/870293ade67fc411fc854e4cabd360f1fbf509a4951e6c5e1d2bd122-w:500-h:750-l:50062-t:image/jpeg.jpg",
    text: "Mình đã so sánh nhiều shop khác nhưng tvhcanva.com có giá cả cạnh tranh nhất. Chất lượng tài khoản Canva Pro rất tốt, giúp mình tiết kiệm được nhiều thời gian.",
  },
  {
    name: "Anh Vinh",
    role: "Trưởng phòng",
    avatar:
      "https://content.pancake.vn/1/s668x632/ab/68/df/55/c144ecc3169eabb59f6beedcd6971695b168d7314ac29fed592b297f-w:1000-h:945-l:249213-t:image/jpeg.jpg",
    text: "tvhcanva.com đã giúp mình tìm được tài khoản Google One với dung lượng lớn mà giá cả lại rất hợp lý. Nhân viên hỗ trợ nhiệt tình, giải đáp mọi thắc mắc của mình.",
  },
  {
    name: "Chị Thu",
    role: "Content Creator",
    avatar:
      "https://images.unsplash.com/photo-1758600587709-ad6b8e429896?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHdvbWFuJTIwY29udGVudCUyMGNyZWF0b3IlMjBzb2NpYWwlMjBtZWRpYXxlbnwxfHx8fDE3NzU4NDMyMTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    text: "tvhcanva.com là nơi mình tin tưởng để mua tài khoản ChatGPT Plus. Tài khoản hoạt động ổn định, giá cả hợp lý và đội ngũ hỗ trợ rất chuyên nghiệp.",
  },
  {
    name: "Anh Tuấn",
    role: "Video Editor",
    avatar:
      "https://images.unsplash.com/photo-1769755031467-1553dd467c9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMG1hbiUyMHZpZGVvJTIwZWRpdG9yJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzc1ODQzMjE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    text: "Mình rất hài lòng với dịch vụ của tvhcanva.com. Tài khoản Capcut Pro hoạt động ổn định, giá cả phải chăng và giao dịch rất nhanh gọn. Mình sẽ tiếp tục ủng hộ shop.",
  },
];

const NAV_ITEMS = [
  { label: "VỀ CHÚNG TÔI", href: "#about" },
  { label: "ĐANG BÁN CHẠY", href: "#best-sellers" },
  { label: "SẢN PHẨM KHÁC", href: "#other-products" },
  { label: "KHÁCH HÀNG", href: "#testimonials" },
  { label: "LIÊN HỆ", href: "#contact" },
];

function SectionTitle({
  children,
  white = false,
}: {
  children: React.ReactNode;
  white?: boolean;
}) {
  return (
    <h2
      className="text-center mb-8"
      style={{
        fontSize: "clamp(1.5rem, 3vw, 2rem)",
        fontWeight: 900,
        fontStyle: "italic",
        color: white ? "#fff" : "#1a1a4e",
        textDecoration: "underline",
        textDecorationColor: white ? "#fff" : "#e91e63",
        textUnderlineOffset: "8px",
      }}
    >
      {children}
    </h2>
  );
}

function ProductSection({
  title,
  products,
  bg,
  onClick,
  id,
}: {
  title: string;
  products: Product[];
  bg: "white" | "gray" | "gradient";
  onClick: (p: Product) => void;
  id?: string;
}) {
  const bgClass =
    bg === "white"
      ? "bg-white"
      : bg === "gray"
        ? "bg-gray-50"
        : "";
  const bgStyle =
    bg === "gradient"
      ? {
          background:
            "linear-gradient(135deg, #5b2fa0 0%, #c054c0 100%)",
        }
      : {};
  return (
    <section
      id={id}
      className={`py-10 px-4 ${bgClass}`}
      style={bgStyle}
    >
      <div className="max-w-6xl mx-auto">
        <SectionTitle white={bg === "gradient"}>
          {title}
        </SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={onClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Storefront() {
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paymentReturn, setPaymentReturn] = useState<{
    status: "success" | "error" | "cancel";
    invoice: string;
  } | null>(null);

  // Xử lý khi khách quay lại từ trang thanh toán Sepay (?payment=...&inv=...).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "success" || payment === "error" || payment === "cancel") {
      setPaymentReturn({
        status: payment,
        invoice: params.get("inv") || "",
      });
      // Dọn URL để không hiện lại khi tải lại trang.
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      url.searchParams.delete("inv");
      window.history.replaceState({}, "", url.pathname + url.hash);
    }
  }, []);

  useEffect(() => {
    const GA_ID = "G-B3YY70S3TZ";
    if (document.querySelector(`script[src*="${GA_ID}"]`)) return;
    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s1);
    const s2 = document.createElement("script");
    s2.innerHTML = `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_ID}');`;
    document.head.appendChild(s2);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="sticky top-0 z-40"
        style={{
          background:
            "linear-gradient(135deg, #1a1a4e 0%, #3b1a6e 50%, #6b2fa0 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-shrink-0">
              <img
                src={logoImg}
                alt="TVHCanva Logo"
                className="h-10 w-10 object-cover rounded-full"
              />
              <div>
                <div
                  className="text-white"
                  style={{ fontSize: "1rem", fontWeight: 700 }}
                >
                  TVHCanva.com
                </div>
                <div
                  className="text-white/60"
                  style={{ fontSize: "0.6rem" }}
                >
                  Phần Mềm Bản Quyền Giá Rẻ
                </div>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-white/90 hover:text-white transition-colors"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <button
              className="md:hidden text-white text-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
          {mobileMenuOpen && (
            <nav className="md:hidden mt-3 pb-2 flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-white/90 py-1"
                  style={{ fontSize: "0.85rem" }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Hero Banner */}
      <section
        style={{
          background:
            "linear-gradient(135deg, #2a1a5e 0%, #5b2fa0 30%, #c054c0 70%, #e06080 100%)",
        }}
        className="py-12 px-4 text-center text-white relative overflow-hidden"
      >
        <h1
          className="text-white mb-6"
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            fontWeight: 900,
            fontStyle: "italic",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          NGUỒN TÀI KHOẢN BẢN QUYỀN GIÁ RẺ
        </h1>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 bg-white text-gray-800 px-5 py-2 rounded-full shadow-lg">
              <CheckCircle
                size={20}
                className="text-green-500"
              />
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#e91e63",
                }}
              >
                CHẤT LƯỢNG
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white text-gray-800 px-5 py-2 rounded-full shadow-lg">
              <CheckCircle
                size={20}
                className="text-green-500"
              />
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#e91e63",
                }}
              >
                GIÁ RẺ
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="w-52 h-36 md:w-64 md:h-44 bg-gray-800 rounded-lg border-4 border-gray-700 flex items-center justify-center shadow-2xl overflow-hidden">
              <div className="text-center p-3">
                <p
                  className="text-yellow-300 mb-1"
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                  }}
                >
                  CUNG CẤP PHẦN MỀM GIÁ RẺ
                </p>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    "📧",
                    "🎬",
                    "🎵",
                    "📺",
                    "🎮",
                    "💬",
                    "📝",
                    "🔒",
                    "☁️",
                    "🤖",
                  ].map((e, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 bg-white/20 rounded flex items-center justify-center"
                      style={{ fontSize: "0.6rem" }}
                    >
                      {e}
                    </div>
                  ))}
                </div>
                <p
                  className="text-white/60 mt-2"
                  style={{ fontSize: "0.5rem" }}
                >
                  BẢO HÀNH TRỌN ĐỜI
                </p>
              </div>
            </div>
            <div className="w-20 h-3 bg-gray-700 mx-auto rounded-b-lg" />
            <div className="w-28 h-2 bg-gray-600 mx-auto rounded-b-lg" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 bg-white text-gray-800 px-5 py-2 rounded-full shadow-lg">
              <CheckCircle
                size={20}
                className="text-green-500"
              />
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#e91e63",
                }}
              >
                BẢO HÀNH 24/7
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white text-gray-800 px-5 py-2 rounded-full shadow-lg">
              <CheckCircle
                size={20}
                className="text-green-500"
              />
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#e91e63",
                }}
              >
                UY TÍN
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-10 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <SectionTitle>VỀ TVHCANVA.COM</SectionTitle>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-pink-50 rounded-2xl p-6 border border-pink-100">
              <p
                className="text-gray-700 mb-4"
                style={{ fontSize: "0.9rem", lineHeight: 1.8 }}
              >
                Chúng tôi cung cấp tài khoản bản quyền với mức
                giá chỉ bằng 10% so với mức giá được công bố
                trên website chính thức như Canva Pro, Capcut
                Pro, Youtube Premium, Google One 2TB, Microsoft
                Office 365, Spotify Premium, Gamma AI,
                SuperGrok, ChatGPT Plus, ChatGPT Pro,...
              </p>
              <p
                className="text-gray-700"
                style={{ fontSize: "0.9rem", lineHeight: 1.8 }}
              >
                Hơn hết, chúng tôi làm việc bằng sự tử tế và
                trách nhiệm. Là một khách hàng của chúng tôi,
                bạn sẽ được hỗ trợ bảo hành 24/7 đến hết vòng
                đời của tài khoản!
              </p>
            </div>
            <div className="flex flex-col gap-3 justify-center">
              {[
                {
                  t: "GIÁ RẺ",
                  d: "Tiết kiệm được 90% chi phí so với mua trên website chính thức",
                },
                {
                  t: "UY TÍN",
                  d: "Hỗ trợ nhiệt tình, bảo hành 24/7 bởi đội ngũ admin",
                },
              ].map((item) => (
                <div
                  key={item.t}
                  className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle
                      size={24}
                      className="text-green-500 flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <h4
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "#e91e63",
                        }}
                      >
                        {item.t}
                      </h4>
                      <p
                        className="text-gray-500"
                        style={{ fontSize: "0.78rem" }}
                      >
                        {item.d}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Payment Guide */}
      <section
        style={{
          background:
            "linear-gradient(135deg, #c054c0 0%, #e06080 100%)",
        }}
        className="py-10 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <SectionTitle white>
            HƯỚNG DẪN THANH TOÁN
          </SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                step: "Bước 1",
                icon: (
                  <MousePointer
                    size={36}
                    className="text-pink-500"
                  />
                ),
                text: "Lựa chọn sản phẩm",
              },
              {
                step: "Bước 2",
                icon: (
                  <FileText
                    size={36}
                    className="text-pink-500"
                  />
                ),
                text: "Điền đầy đủ thông tin mua hàng",
              },
              {
                step: "Bước 3",
                icon: (
                  <Smartphone
                    size={36}
                    className="text-pink-500"
                  />
                ),
                text: "Thanh toán với QR Code",
              },
              {
                step: "Bước 4",
                icon: (
                  <UserCircle
                    size={36}
                    className="text-pink-500"
                  />
                ),
                text: "Nhận tài khoản và sử dụng ngay!",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl p-5 text-center shadow-lg"
              >
                <h4
                  className="mb-3"
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    fontStyle: "italic",
                    textDecoration: "underline",
                    color: "#1a1a4e",
                  }}
                >
                  {item.step}
                </h4>
                <div className="flex justify-center mb-3">
                  {item.icon}
                </div>
                <p
                  className="text-gray-700"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    fontStyle: "italic",
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Sections */}
      <ProductSection
        id="best-sellers"
        title="ĐANG BÁN CHẠY"
        products={BEST_SELLERS}
        bg="gray"
        onClick={setSelectedProduct}
      />
      <ProductSection
        id="other-products"
        title="THIẾT KẾ"
        products={DESIGN_PRODUCTS}
        bg="gradient"
        onClick={setSelectedProduct}
      />
      <ProductSection
        title="TRỢ LÝ AI"
        products={AI_PRODUCTS}
        bg="gray"
        onClick={setSelectedProduct}
      />
      <ProductSection
        title="LÀM VIỆC"
        products={WORK_PRODUCTS}
        bg="gradient"
        onClick={setSelectedProduct}
      />
      <ProductSection
        title="XEM PHIM - GIẢI TRÍ"
        products={ENTERTAINMENT_PRODUCTS}
        bg="gray"
        onClick={setSelectedProduct}
      />
      <ProductSection
        title="HỌC TẬP"
        products={EDUCATION_PRODUCTS}
        bg="gradient"
        onClick={setSelectedProduct}
      />
      <ProductSection
        title="VPN GIÁ RẺ"
        products={VPN_PRODUCTS}
        bg="gray"
        onClick={setSelectedProduct}
      />

      {/* Facebook Community CTA */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-3xl p-8 md:p-10 text-center text-white shadow-2xl relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #1877f2 0%, #4267B2 60%, #5b2fa0 100%)",
            }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center">
                <Facebook size={40} className="text-white" fill="white" />
              </div>
            </div>
            <h2
              style={{
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                fontWeight: 900,
                fontStyle: "italic",
                textTransform: "uppercase",
              }}
            >
              Tham gia nhóm Facebook TVHCanva
            </h2>
            <p
              className="text-white/90 mt-3 max-w-2xl mx-auto"
              style={{ fontSize: "0.95rem", lineHeight: 1.7 }}
            >
              Vào nhóm để nhận thông báo sản phẩm mới, mã giảm giá độc quyền và
              tham gia tặng tài khoản miễn phí hằng tháng như{" "}
              <span style={{ fontWeight: 800 }}>Capcut Pro</span>,{" "}
              <span style={{ fontWeight: 800 }}>Netflix Premium</span> và nhiều
              phần mềm hot khác!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 mb-7">
              {[
                { icon: <Bell size={18} />, text: "Thông báo sản phẩm mới" },
                { icon: <Gift size={18} />, text: "Tặng tài khoản miễn phí hằng tháng" },
                { icon: <Star size={18} />, text: "Ưu đãi & mã giảm giá độc quyền" },
              ].map((b) => (
                <div
                  key={b.text}
                  className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2"
                  style={{ fontSize: "0.82rem", fontWeight: 600 }}
                >
                  {b.icon}
                  <span>{b.text}</span>
                </div>
              ))}
            </div>

            <a
              href={FACEBOOK_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[#1877f2] px-8 py-3.5 rounded-xl transition-transform hover:scale-105 shadow-lg"
              style={{
                fontSize: "1.05rem",
                fontWeight: 900,
                fontStyle: "italic",
                textTransform: "uppercase",
              }}
            >
              <Facebook size={20} fill="#1877f2" />
              Tham gia nhóm ngay
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        style={{
          background:
            "linear-gradient(135deg, #5b2fa0 0%, #c054c0 50%, #e06080 100%)",
        }}
        className="py-12 px-4"
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2
            className="text-white mb-2"
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 900,
              fontStyle: "italic",
            }}
          >
            UY TÍN TẠO NÊN THƯƠNG HIỆU
          </h2>
          <p
            className="text-white/80 mb-10"
            style={{ fontSize: "1.1rem", fontStyle: "italic" }}
          >
            KHÁCH HÀNG LUÔN CẢM THẤY HÀI LÒNG
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="flex flex-col items-center"
              >
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-4"
                />
                <div className="bg-white rounded-2xl p-5 shadow-lg w-full">
                  <div className="flex justify-center gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill="#f59e0b"
                        stroke="#f59e0b"
                      />
                    ))}
                  </div>
                  <p
                    className="text-gray-600 mb-4"
                    style={{
                      fontSize: "0.8rem",
                      lineHeight: 1.6,
                    }}
                  >
                    "{t.text}"
                  </p>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#1a1a4e",
                    }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-pink-500"
                    style={{
                      fontSize: "0.8rem",
                      fontStyle: "italic",
                    }}
                  >
                    {t.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-gray-900 text-gray-400 py-10 px-4"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Left */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src={logoImg}
                  alt="TVHCanva Logo"
                  className="h-10 w-10 object-contain rounded-full"
                />
                <div>
                  <span
                    className="text-white"
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                    }}
                  >
                    TVHCanva.com
                  </span>
                  <div
                    className="text-gray-500"
                    style={{ fontSize: "0.65rem" }}
                  >
                    Phần Mềm Bản Quyền Giá Rẻ
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h4
                  className="text-pink-400 mb-3"
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    fontStyle: "italic",
                  }}
                >
                  Về chúng tôi
                </h4>
                <div
                  className="space-y-1.5"
                  style={{ fontSize: "0.82rem" }}
                >
                  <p></p>
                  <p>
                    <span className="text-gray-500">
                      Website:
                    </span>{" "}
                    <span className="text-white">
                      https://www.tvhcanva.com
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">
                      Facebook:
                    </span>{" "}
                    <a
                      href="https://www.facebook.com/groups/tvhcanva"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-pink-400 transition-colors"
                    >
                      https://www.facebook.com/groups/tvhcanva
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Right - Zalo groups */}
            <div className="flex-1">
              <div className="bg-gray-800 rounded-2xl p-4 space-y-3">
                {[
                  "TVHCanva.com - Nhóm 1",
                  "TVHCanva.com - Nhóm 2",
                  "TVHCanva.com - Nhóm CTV",
                ].map((g, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-gray-700/50 rounded-lg p-2"
                  >
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <ShieldCheck
                        size={16}
                        className="text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-white"
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        {g}
                      </p>
                      <p
                        className="text-gray-500"
                        style={{ fontSize: "0.65rem" }}
                      >
                        Cộng đồng • {900 + i * 50} thành viên
                      </p>
                    </div>
                  </div>
                ))}
                <a
                  href="https://zalo.me/g/wvhu5evlevj1vvnzccgo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-pink-400 mt-2"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  Tham gia ngay →
                </a>
              </div>
            </div>
          </div>

          <div
            className="border-t border-gray-800 pt-4 text-center"
            style={{ fontSize: "0.75rem" }}
          >
            Copyright © 2024 tvhcanva.com
          </div>
        </div>
      </footer>

      {/* Floating Buttons */}
      <FloatingButtons />

      {/* Order Modal */}
      {selectedProduct && (
        <OrderModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Màn hình quay lại sau thanh toán (tự nhận link Canva với đơn Canva) */}
      {paymentReturn && (
        <PaymentReturnModal
          status={paymentReturn.status}
          invoice={paymentReturn.invoice}
          onClose={() => setPaymentReturn(null)}
        />
      )}
    </div>
  );
}
export default function App() {
  const isAdmin =
    window.location.pathname.startsWith("/admin") || window.location.hash === "#admin";
  return isAdmin ? <AdminPage /> : <Storefront />;
}
