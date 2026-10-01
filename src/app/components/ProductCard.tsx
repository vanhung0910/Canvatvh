import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { autoSlots } from "../data/products";

interface Plan {
  label: string;
  price: string;
}

export interface Product {
  id: number;
  name: string;
  image: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  slotsLeft?: number;
  plans: Plan[];
  bgColor?: string;
  soldOut?: boolean;
}

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export function ProductCard({
  product,
  onClick,
}: ProductCardProps) {
  // Slot tự động theo giờ trong ngày, cập nhật mỗi phút.
  const [slots, setSlots] = useState(() => autoSlots(product.id));
  useEffect(() => {
    const t = setInterval(() => setSlots(autoSlots(product.id)), 60_000);
    return () => clearInterval(t);
  }, [product.id]);
  // Thanh hiển thị phần đã bán: càng ít slot, thanh càng đầy.
  const slotPercent = Math.min(95, Math.max(15, Math.round((1 - slots.left / slots.total) * 100)));

  return (
    <div
      className={`bg-white rounded-2xl shadow-md transition-all duration-300 overflow-hidden group border border-gray-100 ${
        product.soldOut ? "cursor-not-allowed" : "cursor-pointer hover:shadow-xl hover:-translate-y-1"
      }`}
      onClick={() => !product.soldOut && onClick(product)}
      aria-disabled={product.soldOut}
    >
      {/* Image - crop to show logo + product name area */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: product.bgColor || "#f3f4f6",
          aspectRatio: "4 / 3",
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          className={`w-full transition-transform duration-300 ${
            product.soldOut ? "grayscale opacity-60" : "group-hover:scale-105"
          }`}
          style={{
            objectFit: "cover",
            objectPosition: "top",
            height: "170%",
            marginTop: 0,
          }}
        />
        {product.soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            <span
              className="bg-white/95 text-gray-800 px-4 py-1.5 rounded-full shadow-lg -rotate-6 border-2 border-gray-800"
              style={{ fontSize: "0.95rem", fontWeight: 800, letterSpacing: "0.08em" }}
            >
              HẾT HÀNG
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 pt-3 pb-2">
        {/* Name */}
        <h3
          className="text-gray-900 mb-1 line-clamp-1"
          style={{ fontSize: "1.05rem", fontWeight: 700 }}
        >
          {product.name}
        </h3>

        {/* Price */}
        <div
          className="text-pink-500 mb-0.5"
          style={{ fontSize: "1.3rem", fontWeight: 800 }}
        >
          {product.price}
        </div>

        {/* Original price + discount */}
        <div className="flex items-center gap-2 mb-2">
          {product.originalPrice && (
            <span
              className="text-gray-400 line-through"
              style={{ fontSize: "0.8rem" }}
            >
              {product.originalPrice}
            </span>
          )}
          {product.discount && (
            <span
              className="text-pink-500"
              style={{ fontSize: "0.8rem", fontWeight: 700 }}
            >
              {product.discount}
            </span>
          )}
        </div>

        {/* Slots left */}
        {product.soldOut ? (
          <div
            className="mb-2 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
            style={{ height: 24, fontSize: "0.72rem", fontWeight: 600 }}
          >
            Tạm hết hàng · đang nhập thêm
          </div>
        ) : (
          <div className="flex items-center gap-1.5 mb-2">
            <span style={{ fontSize: "1.2rem" }}>🔥</span>
            <div
              className="flex-1 relative rounded-full overflow-hidden"
              style={{ height: 24, background: "#e5e7eb" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${slotPercent}%`,
                  background:
                    "linear-gradient(90deg, #f97316, #facc15)",
                }}
              />
              <span
                className="absolute inset-0 flex items-center justify-center text-gray-700"
                style={{ fontSize: "0.72rem", fontWeight: 600 }}
              >
                Chỉ còn {slots.left} slot
              </span>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 pt-2">
          <button
            disabled={product.soldOut}
            className={`w-full transition-colors text-center ${
              product.soldOut ? "text-gray-400" : "text-blue-500 hover:text-blue-700"
            }`}
            style={{ fontSize: "0.95rem", fontWeight: 700 }}
          >
            {product.soldOut ? "Hết hàng" : "Mua ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}