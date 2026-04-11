import { Flame } from "lucide-react";

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
}

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const slotPercent = product.slotsLeft ? Math.min(product.slotsLeft * 12, 90) : 50;

  return (
    <div
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group hover:-translate-y-1 border border-gray-100"
      onClick={() => onClick(product)}
    >
      {/* Image - crop to show logo + product name area */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: product.bgColor || "#f3f4f6", aspectRatio: "4 / 3" }}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full group-hover:scale-105 transition-transform duration-300"
          style={{ objectFit: "cover", objectPosition: "top", height: "170%", marginTop: 0 }}
        />
      </div>

      {/* Info */}
      <div className="px-3 pt-3 pb-2">
        {/* Name */}
        <h3 className="text-gray-900 mb-1 line-clamp-1" style={{ fontSize: "1.05rem", fontWeight: 700 }}>
          {product.name}
        </h3>

        {/* Price */}
        <div className="text-pink-500 mb-0.5" style={{ fontSize: "1.3rem", fontWeight: 800 }}>
          {product.price}
        </div>

        {/* Original price + discount */}
        <div className="flex items-center gap-2 mb-2">
          {product.originalPrice && (
            <span className="text-gray-400 line-through" style={{ fontSize: "0.8rem" }}>
              {product.originalPrice}
            </span>
          )}
          {product.discount && (
            <span className="text-pink-500" style={{ fontSize: "0.8rem", fontWeight: 700 }}>
              {product.discount}
            </span>
          )}
        </div>

        {/* Slots left */}
        {product.slotsLeft && (
          <div className="flex items-center gap-1.5 mb-2">
            <span style={{ fontSize: "1.2rem" }}>🔥</span>
            <div className="flex-1 relative rounded-full overflow-hidden" style={{ height: 24, background: "#e5e7eb" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${slotPercent}%`,
                  background: "linear-gradient(90deg, #f97316, #facc15)",
                }}
              />
              <span
                className="absolute inset-0 flex items-center justify-center text-gray-700"
                style={{ fontSize: "0.72rem", fontWeight: 600 }}
              >
                Chỉ còn {product.slotsLeft} slots
              </span>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 pt-2">
          <button
            className="w-full text-blue-500 hover:text-blue-700 transition-colors text-center"
            style={{ fontSize: "0.95rem", fontWeight: 700 }}
          >
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
}