import { useState } from "react";
import { ShieldCheck, CheckCircle, MousePointer, FileText, Smartphone, UserCircle, Star } from "lucide-react";
import logoImg from "../imports/logo.png";
import { ProductCard, type Product } from "./components/ProductCard";
import { OrderModal } from "./components/OrderModal";
import { FloatingButtons } from "./components/FloatingButtons";

// ============ PRODUCT DATA ============

const BEST_SELLERS: Product[] = [
  { id: 1, name: "Capcut Pro", price: "55.000đ", originalPrice: "1.500.000đ", discount: "-96%", slotsLeft: 5, bgColor: "#1a1a2e",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/13/1a/60/66/6bfe386de212ab2d2d36baf219722399a5996b23e5e5f87eb78cdd49-w:2400-h:3600-l:857912-t:image/png.png",
    plans: [{ label: "1 Tháng", price: "55.000đ" }] },
  { id: 2, name: "Canva Pro", price: "15.000đ", originalPrice: "1.560.000đ", discount: "-99%", slotsLeft: 7, bgColor: "#7c3aed",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/cf/87/0e/58/77923d59f6e92885f56671d17fc3d9885168822cfbc04acc22f9d236-w:2400-h:3600-l:1401843-t:image/png.png",
    plans: [{ label: "1 Tháng", price: "15.000đ" }, { label: "1 Năm", price: "170.000đ" }] },
  { id: 3, name: "Google One", price: "299.000đ", originalPrice: "2.250.000đ", discount: "-87%", slotsLeft: 7, bgColor: "#e8f5e9",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/9c/85/95/e2/0643a19ac56e0d0e05e1be20b8eff0793ab1d1a5044d62fb8f95ad78-w:2400-h:3600-l:2758098-t:image/png.png",
    plans: [{ label: "2TB", price: "299.000đ" }, { label: "10TB", price: "599.000đ" }, { label: "30TB", price: "999.000đ" }, { label: "100TB", price: "1.999.000đ" }] },
  { id: 4, name: "iCloud+ 400GB", price: "550.000đ", originalPrice: "990.000đ", discount: "-28%", slotsLeft: 6, bgColor: "#e3f2fd",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/be/22/d4/71/fe6d5e791f0a17e99cb0991fee4acbddab3edfa8bae61cdf58e50378-w:2400-h:3600-l:469472-t:image/png.png",
    plans: [{ label: "50GB", price: "150.000đ" }, { label: "200GB", price: "350.000đ" }, { label: "400GB", price: "550.000đ" }, { label: "2TB", price: "999.000đ" }] },
  { id: 5, name: "ChatGPT Plus", price: "129.000đ", originalPrice: "500.000đ", discount: "-74%", slotsLeft: 8, bgColor: "#10a37f",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/13/ce/96/58/4f93be895e52df7810b3dca33f45664ccc2bcaa559ab4f6f387c62e4-w:2400-h:3600-l:937688-t:image/png.png",
    plans: [{ label: "1 Tháng", price: "129.000đ" }, { label: "3 Tháng", price: "349.000đ" }, { label: "6 Tháng", price: "649.000đ" }, { label: "1 Năm", price: "1.199.000đ" }] },
  { id: 6, name: "Google AI Pro/Ultra", price: "650.000đ", originalPrice: "1.740.000đ", discount: "-92%", slotsLeft: 6, bgColor: "#4caf50",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/60/9c/1f/be/df80fbd6485921fcd5e21cfec9b102fd87686d1371fd0c39e520fb82-w:2400-h:3600-l:2084072-t:image/png.png",
    plans: [{ label: "1 Tháng", price: "650.000đ" }, { label: "3 Tháng", price: "1.799.000đ" }, { label: "6 Tháng", price: "3.299.000đ" }, { label: "1 Năm", price: "5.999.000đ" }] },
  { id: 7, name: "Spotify Premium", price: "399.000đ", originalPrice: "708.000đ", discount: "-57%", slotsLeft: 7, bgColor: "#1db954",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/2e/c6/b9/8e/03794cc15316b8f068e8197f7d54ca71971fb40f1fdd440ccd865077-w:2400-h:3600-l:510259-t:image/png.png",
    plans: [{ label: "1 Tháng", price: "399.000đ" }, { label: "3 Tháng", price: "999.000đ" }, { label: "6 Tháng", price: "1.799.000đ" }, { label: "1 Năm", price: "2.999.000đ" }] },
  { id: 8, name: "Youtube Premium", price: "599.000đ", originalPrice: "999.000đ", discount: "-58%", slotsLeft: 4, bgColor: "#ff0000",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/ca/04/cb/b7/3864eb267345978b394857b0a02aebe0b332027c3ab6e12f318cdc37-w:2400-h:3600-l:463501-t:image/png.png",
    plans: [{ label: "1 Tháng", price: "599.000đ" }, { label: "3 Tháng", price: "1.599.000đ" }, { label: "6 Tháng", price: "2.899.000đ" }, { label: "1 Năm", price: "4.999.000đ" }] },
  { id: 9, name: "Office 365", price: "239.000đ", originalPrice: "1.499.000đ", discount: "-87%", slotsLeft: 3, bgColor: "#ff6f00",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/94/3f/23/69/2ff09c3f77802d794693b54f3930d4ba8a5ebf0a1767bd0d14a86445-w:2400-h:3600-l:2948033-t:image/png.png",
    plans: [{ label: "1 Tháng", price: "239.000đ" }, { label: "3 Tháng", price: "649.000đ" }, { label: "6 Tháng", price: "1.199.000đ" }, { label: "1 Năm", price: "1.999.000đ" }] },
  { id: 10, name: "Kaspersky Premium", price: "299.000đ", originalPrice: "1.029.000đ", discount: "-65%", slotsLeft: 8, bgColor: "#00796b",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/b9/40/f5/31/4cbac65cf0547f6616af061019ac85225e6cfb011f03b45f9d788b6e-w:2400-h:3600-l:672960-t:image/png.png",
    plans: [{ label: "1 Tháng", price: "299.000đ" }, { label: "3 Tháng", price: "799.000đ" }, { label: "6 Tháng", price: "1.399.000đ" }, { label: "1 Năm", price: "2.499.000đ" }] },
  { id: 11, name: "Quillbot Premium", price: "199.000đ", originalPrice: "1.178.000đ", discount: "-75%", slotsLeft: 7, bgColor: "#2e7d32",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/6d/be/ff/3f/a89ae0baf4a0a0acb411536c72bf8efb10e2881fd43338814f0f6f3c-w:2400-h:3600-l:1051242-t:image/png.png",
    plans: [{ label: "1 Tháng", price: "199.000đ" }, { label: "3 Tháng", price: "549.000đ" }, { label: "6 Tháng", price: "999.000đ" }, { label: "1 Năm", price: "1.799.000đ" }] },
  { id: 12, name: "Grammarly Pro + AI", price: "199.000đ", originalPrice: "3.600.000đ", discount: "-95%", slotsLeft: 7, bgColor: "#15803d",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/c6/ac/17/25/f6a3a80c013e0dff7c5edac0f46f4480f7a55db3668d1b5e125ba7c1-w:2400-h:3600-l:776470-t:image/png.png",
    plans: [{ label: "1 Tháng", price: "199.000đ" }, { label: "3 Tháng", price: "549.000đ" }, { label: "6 Tháng", price: "999.000đ" }, { label: "1 Năm", price: "1.799.000đ" }] },
];

const DESIGN_PRODUCTS: Product[] = [
  { id: 20, name: "Adobe Full App", price: "799.000đ", originalPrice: "2.399.000đ", discount: "-75%", slotsLeft: 5, bgColor: "#ff6f61",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/80/81/b8/7d/fbc5fff362f14a7bf242d4b6557a22447986eb6b421e55744960229a-w:2400-h:3600-l:1748870-t:image/png.png",
    plans: [{ label: "1 Tháng", price: "799.000đ" }, { label: "3 Tháng", price: "2.199.000đ" }, { label: "6 Tháng", price: "3.999.000đ" }, { label: "1 Năm", price: "6.999.000đ" }] },
  { id: 21, name: "Autodesk AutoCAD", price: "299.000đ", originalPrice: "2.075.000đ", discount: "-85%", slotsLeft: 6, bgColor: "#c62828",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/f0/b7/a0/a6/d817aa39f4714d3ecd32b9ad9c195badafbd15505a014b31bf562cba-w:2400-h:3600-l:930832-t:image/png.png",
    plans: [{ label: "1 Tháng", price: "299.000đ" }, { label: "3 Tháng", price: "799.000đ" }, { label: "6 Tháng", price: "1.399.000đ" }, { label: "1 Năm", price: "2.499.000đ" }] },
  { id: 22, name: "Figma Pro", price: "199.000đ", originalPrice: "3.456.000đ", discount: "-97%", slotsLeft: 4, bgColor: "#1e1e1e",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/0b/e0/2c/ea/4f85c905ca87bc4f8cc950905c8eed691e530101fec2497eb9b63abf-w:2400-h:3600-l:297633-t:image/png.png",
    plans: [{ label: "1 Tháng", price: "199.000đ" }, { label: "3 Tháng", price: "549.000đ" }, { label: "6 Tháng", price: "999.000đ" }, { label: "1 Năm", price: "1.799.000đ" }] },
  { id: 23, name: "Freepik Premium", price: "299.000đ", originalPrice: "2.400.000đ", discount: "-88%", slotsLeft: 4, bgColor: "#1976d2",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/0a/5a/17/b6/26382df2f2cbe8dfb56e9dafb4422597382b49b0a7974989865c0e2f-w:2400-h:3600-l:594939-t:image/png.png",
    plans: [{ label: "1 Tháng", price: "299.000đ" }, { label: "3 Tháng", price: "799.000đ" }, { label: "6 Tháng", price: "1.399.000đ" }, { label: "1 Năm", price: "2.499.000đ" }] },
];

const AI_PRODUCTS: Product[] = [
  { id: 30, name: "SuperGrok", price: "199.000đ", originalPrice: "800.000đ", discount: "-75%", slotsLeft: 8, bgColor: "#111",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/ae/1e/0e/63/d42e7e23395ebf23d795b1dc8eeeac5998bcae396345e30cb4165899-w:2400-h:3600-l:434204-t:image/png.png",
    plans: [{ label: "1 Tháng", price: "199.000đ" }, { label: "3 Tháng", price: "549.000đ" }, { label: "6 Tháng", price: "999.000đ" }, { label: "1 Năm", price: "1.799.000đ" }] },
  { id: 31, name: "Leonardo AI", price: "239.000đ", originalPrice: "260.000đ", discount: "-73%", slotsLeft: 8, bgColor: "#1a1a2e",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/7e/c1/bf/0f/4da5a258d48fbe01388c7c96627f28a020d4358e26f794262a54777f-w:2400-h:3600-l:4747953-t:image/png.png",
    plans: [{ label: "1 Tháng", price: "239.000đ" }, { label: "3 Tháng", price: "649.000đ" }, { label: "6 Tháng", price: "1.199.000đ" }, { label: "1 Năm", price: "1.999.000đ" }] },
  { id: 32, name: "Gamma AI Pro", price: "99.000đ", originalPrice: "390.000đ", discount: "-75%", slotsLeft: 7, bgColor: "#7c3aed",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/bb/d6/f3/ec/f0ee5193609004c2ae13b695cc95cb7f6d619ff9e78e96dac6345b51-w:2400-h:3600-l:798212-t:image/png.png",
    plans: [{ label: "1 Tháng", price: "99.000đ" }, { label: "3 Tháng", price: "269.000đ" }, { label: "6 Tháng", price: "499.000đ" }, { label: "1 Năm", price: "899.000đ" }] },
  { id: 33, name: "Copilot Pro", price: "129.000đ", originalPrice: "562.000đ", discount: "-76%", slotsLeft: 8, bgColor: "#6366f1",
    image: "https://content.pancake.vn/1/s702x1053/fwebp0/70/70/2f/03/7f729f2d79cc119a8602a976438ea8a11c8bb418db5f7e97a4a44bef-w:2400-h:3600-l:620897-t:image/png.png",
    plans: [{ label: "1 Tháng", price: "129.000đ" }, { label: "3 Tháng", price: "349.000đ" }, { label: "6 Tháng", price: "649.000đ" }, { label: "1 Năm", price: "1.199.000đ" }] },
  { id: 34, name: "GenSpark Plus", price: "500.000đ", originalPrice: "699.000đ", discount: "-30%", slotsLeft: 7, bgColor: "#0f0f1e",
    image: "https://images.unsplash.com/photo-1659353672237-91826f496791?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXBjdXQlMjB2aWRlbyUyMGVkaXRpbmclMjBhcHB8ZW58MXx8fHwxNzc1ODQyNjg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "500.000đ" }, { label: "3 Tháng", price: "1.399.000đ" }, { label: "6 Tháng", price: "2.499.000đ" }, { label: "1 Năm", price: "4.499.000đ" }] },
  { id: 35, name: "InVideo Plus", price: "699.000đ", originalPrice: "999.000đ", discount: "-30%", slotsLeft: 7, bgColor: "#2d1b69",
    image: "https://images.unsplash.com/photo-1649091245823-18be815da4f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW52YSUyMGRlc2lnbiUyMGdyYXBoaWMlMjB0b29sfGVufDF8fHx8MTc3NTg0MjY4NXww&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "699.000đ" }, { label: "3 Tháng", price: "1.899.000đ" }, { label: "6 Tháng", price: "3.499.000đ" }, { label: "1 Năm", price: "5.999.000đ" }] },
  { id: 36, name: "Vidu AI", price: "199.000đ", originalPrice: "260.000đ", discount: "-23%", slotsLeft: 5, bgColor: "#4f46e5",
    image: "https://images.unsplash.com/photo-1753931043704-a7856fec33a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFtbWFybHklMjB3cml0aW5nJTIwYXNzaXN0YW50fGVufDF8fHx8MTc3NTg0MjY5M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "199.000đ" }, { label: "3 Tháng", price: "549.000đ" }, { label: "6 Tháng", price: "999.000đ" }, { label: "1 Năm", price: "1.799.000đ" }] },
  { id: 37, name: "Hailuo AI Pro", price: "699.000đ", originalPrice: "999.000đ", discount: "-30%", slotsLeft: 5, bgColor: "#1a1a3e",
    image: "https://images.unsplash.com/photo-1730818876657-8015070c5d34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb29nbGUlMjBkcml2ZSUyMGNsb3VkJTIwc3RvcmFnZXxlbnwxfHx8fDE3NzU4NDI2ODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "699.000đ" }, { label: "3 Tháng", price: "1.899.000đ" }, { label: "6 Tháng", price: "3.499.000đ" }, { label: "1 Năm", price: "5.999.000đ" }] },
  { id: 38, name: "Suno AI", price: "199.000đ", originalPrice: "250.000đ", discount: "-20%", slotsLeft: 5, bgColor: "#e91e63",
    image: "https://images.unsplash.com/photo-1551817958-795f9440ce4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG90aWZ5JTIwbXVzaWMlMjBzdHJlYW1pbmclMjBncmVlbnxlbnwxfHx8fDE3NzU4NDI2ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "199.000đ" }, { label: "3 Tháng", price: "549.000đ" }, { label: "6 Tháng", price: "999.000đ" }, { label: "1 Năm", price: "1.799.000đ" }] },
  { id: 39, name: "Claude AI", price: "129.000đ", originalPrice: "500.000đ", discount: "-75%", slotsLeft: 7, bgColor: "#ff9800",
    image: "https://images.unsplash.com/photo-1719716133697-e924192e9a7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpY2xvdWQlMjBhcHBsZSUyMHN0b3JhZ2V8ZW58MXx8fHwxNzc1ODQyNjg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "129.000đ" }, { label: "3 Tháng", price: "349.000đ" }, { label: "6 Tháng", price: "649.000đ" }, { label: "1 Năm", price: "1.199.000đ" }] },
  { id: 40, name: "Kling AI", price: "150.000đ", originalPrice: "185.000đ", discount: "-20%", slotsLeft: 5, bgColor: "#00bcd4",
    image: "https://images.unsplash.com/photo-1726409724841-016b6f4f8b1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3V0dWJlJTIwcHJlbWl1bSUyMHJlZCUyMHZpZGVvfGVufDF8fHx8MTc3NTg0MjY4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "150.000đ" }, { label: "3 Tháng", price: "399.000đ" }, { label: "6 Tháng", price: "749.000đ" }, { label: "1 Năm", price: "1.299.000đ" }] },
  { id: 41, name: "HeyGen AI", price: "599.000đ", originalPrice: "299.000đ", discount: "-30%", slotsLeft: 7, bgColor: "#00838f",
    image: "https://images.unsplash.com/photo-1764974033674-fe324b36c1e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZG9iZSUyMGNyZWF0aXZlJTIwc3VpdGUlMjBkZXNpZ258ZW58MXx8fHwxNzc1ODQyNjk0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "599.000đ" }, { label: "3 Tháng", price: "1.599.000đ" }, { label: "6 Tháng", price: "2.899.000đ" }, { label: "1 Năm", price: "4.999.000đ" }] },
  { id: 42, name: "Runway AI", price: "699.000đ", originalPrice: "699.000đ", discount: "-30%", slotsLeft: 7, bgColor: "#d32f2f",
    image: "https://images.unsplash.com/photo-1721244654392-9c912a6eb236?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvY2FkJTIwYXJjaGl0ZWN0dXJhbCUyMGRyYXdpbmd8ZW58MXx8fHwxNzc1ODQyNjk0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "699.000đ" }, { label: "3 Tháng", price: "1.899.000đ" }, { label: "6 Tháng", price: "3.499.000đ" }, { label: "1 Năm", price: "5.999.000đ" }] },
  { id: 43, name: "Monica AI Unlimited", price: "199.000đ", originalPrice: "450.000đ", discount: "-30%", slotsLeft: 4, bgColor: "#311b92",
    image: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWdtYSUyMGRlc2lnbiUyMHByb3RvdHlwZSUyMHRvb2x8ZW58MXx8fHwxNzc1ODQyNjk1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "199.000đ" }, { label: "3 Tháng", price: "549.000đ" }, { label: "6 Tháng", price: "999.000đ" }, { label: "1 Năm", price: "1.799.000đ" }] },
  { id: 44, name: "Minimax Audio AI", price: "299.000đ", originalPrice: "390.000đ", discount: "-30%", slotsLeft: 4, bgColor: "#e91e63",
    image: "https://images.unsplash.com/photo-1649734926700-8dfb770ffaee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBZG9iZSUyMENyZWF0aXZlJTIwQ2xvdWQlMjBkZXNpZ24lMjBzb2Z0d2FyZXxlbnwxfHx8fDE3NzU4NDE3Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "299.000đ" }, { label: "3 Tháng", price: "799.000đ" }, { label: "6 Tháng", price: "1.399.000đ" }, { label: "1 Năm", price: "2.499.000đ" }] },
];

const WORK_PRODUCTS: Product[] = [
  { id: 50, name: "Google Meet + 2TB", price: "299.000đ", originalPrice: "2.126.000đ", discount: "-87%", slotsLeft: 7, bgColor: "#1a73e8",
    image: "https://images.unsplash.com/photo-1730818876657-8015070c5d34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb29nbGUlMjBkcml2ZSUyMGNsb3VkJTIwc3RvcmFnZXxlbnwxfHx8fDE3NzU4NDI2ODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "299.000đ" }, { label: "3 Tháng", price: "799.000đ" }, { label: "6 Tháng", price: "1.399.000đ" }, { label: "1 Năm", price: "2.499.000đ" }] },
  { id: 51, name: "Zoom Pro", price: "119.000đ", originalPrice: "2.500.000đ", discount: "-95%", slotsLeft: 9, bgColor: "#2d8cff",
    image: "https://images.unsplash.com/photo-1560264401-b76ed96f3134?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6b29tJTIwdmlkZW8lMjBjb25mZXJlbmNlJTIwbWVldGluZ3xlbnwxfHx8fDE3NzU4NDMyMDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "119.000đ" }, { label: "3 Tháng", price: "319.000đ" }, { label: "6 Tháng", price: "599.000đ" }, { label: "1 Năm", price: "999.000đ" }] },
  { id: 52, name: "Linkedin Business", price: "950.000đ", originalPrice: "6.700.000đ", discount: "-85%", slotsLeft: 3, bgColor: "#0a66c2",
    image: "https://images.unsplash.com/photo-1762330471769-47ffee22607f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaW5rZWRpbiUyMGJ1c2luZXNzJTIwcHJvZmVzc2lvbmFsJTIwbmV0d29ya3xlbnwxfHx8fDE3NzU4NDMyMDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "950.000đ" }, { label: "3 Tháng", price: "2.599.000đ" }, { label: "6 Tháng", price: "4.799.000đ" }, { label: "1 Năm", price: "8.499.000đ" }] },
  { id: 53, name: "CamScanner", price: "399.000đ", originalPrice: "1.100.000đ", discount: "-69%", slotsLeft: 5, bgColor: "#1a1a2e",
    image: "https://images.unsplash.com/photo-1775163035702-06e47ba88857?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N1bWVudCUyMHNjYW5uZXIlMjBtb2JpbGUlMjBhcHB8ZW58MXx8fHwxNzc1ODQzMjA1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "399.000đ" }, { label: "3 Tháng", price: "1.099.000đ" }, { label: "6 Tháng", price: "1.999.000đ" }, { label: "1 Năm", price: "3.499.000đ" }] },
];

const ENTERTAINMENT_PRODUCTS: Product[] = [
  { id: 60, name: "Netflix Premium 4K", price: "99.000đ", originalPrice: "260.000đ", discount: "-66%", slotsLeft: 2, bgColor: "#e50914",
    image: "https://images.unsplash.com/photo-1643208589889-0735ad7218f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXRmbGl4JTIwc3RyZWFtaW5nJTIwbW92aWVzJTIwcmVkfGVufDF8fHx8MTc3NTg0MzIwNnww&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "99.000đ" }, { label: "3 Tháng", price: "269.000đ" }, { label: "6 Tháng", price: "499.000đ" }, { label: "1 Năm", price: "899.000đ" }] },
  { id: 61, name: "VieON VIP HBO", price: "299.000đ", originalPrice: "828.000đ", discount: "-88%", slotsLeft: 6, bgColor: "#00c853",
    image: "https://images.unsplash.com/photo-1760260623678-3193e7c5499c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHRlbGV2aXNpb24lMjBzdHJlYW1pbmclMjBlbnRlcnRhaW5tZW50fGVufDF8fHx8MTc3NTg0MzIxNHww&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "299.000đ" }, { label: "3 Tháng", price: "799.000đ" }, { label: "6 Tháng", price: "1.399.000đ" }, { label: "1 Năm", price: "2.499.000đ" }] },
  { id: 62, name: "FPT Smax", price: "199.000đ", originalPrice: "396.000đ", discount: "-37%", slotsLeft: 7, bgColor: "#ff5722",
    image: "https://images.unsplash.com/photo-1768765982802-4076860c8733?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUViUyMGVudGVydGFpbm1lbnQlMjBicm9hZGNhc3QlMjBtZWRpYXxlbnwxfHx8fDE3NzU4NDMyMTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "199.000đ" }, { label: "3 Tháng", price: "539.000đ" }, { label: "6 Tháng", price: "999.000đ" }, { label: "1 Năm", price: "1.799.000đ" }] },
  { id: 63, name: "MyTV Sport", price: "125.000đ", originalPrice: "153.000đ", discount: "-18%", slotsLeft: 7, bgColor: "#ff9800",
    image: "https://images.unsplash.com/photo-1583211913969-6fcadbf730b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdXJwbGUlMjBnYWxheHklMjBjaW5lbWElMjBmaWxtfGVufDF8fHx8MTc3NTg0MzIxNXww&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "125.000đ" }, { label: "3 Tháng", price: "339.000đ" }, { label: "6 Tháng", price: "629.000đ" }, { label: "1 Năm", price: "1.099.000đ" }] },
  { id: 64, name: "iQIYI Premium", price: "299.000đ", originalPrice: "528.000đ", discount: "-43%", slotsLeft: 5, bgColor: "#0f9d58",
    image: "https://images.unsplash.com/photo-1551817958-795f9440ce4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG90aWZ5JTIwbXVzaWMlMjBzdHJlYW1pbmclMjBncmVlbnxlbnwxfHx8fDE3NzU4NDI2ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "299.000đ" }, { label: "3 Tháng", price: "799.000đ" }, { label: "6 Tháng", price: "1.399.000đ" }, { label: "1 Năm", price: "2.499.000đ" }] },
  { id: 65, name: "Clip TV", price: "359.000đ", originalPrice: "720.000đ", discount: "-50%", slotsLeft: 5, bgColor: "#1976d2",
    image: "https://images.unsplash.com/photo-1726409724841-016b6f4f8b1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3V0dWJlJTIwcHJlbWl1bSUyMHJlZCUyMHZpZGVvfGVufDF8fHx8MTc3NTg0MjY4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "359.000đ" }, { label: "3 Tháng", price: "979.000đ" }, { label: "6 Tháng", price: "1.799.000đ" }, { label: "1 Năm", price: "3.199.000đ" }] },
  { id: 66, name: "TV360 Super VIP", price: "125.000đ", originalPrice: "200.000đ", discount: "-38%", slotsLeft: 6, bgColor: "#d32f2f",
    image: "https://images.unsplash.com/photo-1643208589889-0735ad7218f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXRmbGl4JTIwc3RyZWFtaW5nJTIwbW92aWVzJTIwcmVkfGVufDF8fHx8MTc3NTg0MzIwNnww&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "125.000đ" }, { label: "3 Tháng", price: "339.000đ" }, { label: "6 Tháng", price: "629.000đ" }, { label: "1 Năm", price: "1.099.000đ" }] },
  { id: 67, name: "Galaxy Play", price: "399.000đ", originalPrice: "660.000đ", discount: "-40%", slotsLeft: 5, bgColor: "#e040fb",
    image: "https://images.unsplash.com/photo-1583211913969-6fcadbf730b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdXJwbGUlMjBnYWxheHklMjBjaW5lbWElMjBmaWxtfGVufDF8fHx8MTc3NTg0MzIxNXww&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "399.000đ" }, { label: "3 Tháng", price: "1.099.000đ" }, { label: "6 Tháng", price: "1.999.000đ" }, { label: "1 Năm", price: "3.499.000đ" }] },
  { id: 68, name: "Youku VIP", price: "299.000đ", originalPrice: "1.225.000đ", discount: "-75%", slotsLeft: 6, bgColor: "#e91e63",
    image: "https://images.unsplash.com/photo-1760260623678-3193e7c5499c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHRlbGV2aXNpb24lMjBzdHJlYW1pbmclMjBlbnRlcnRhaW5tZW50fGVufDF8fHx8MTc3NTg0MzIxNHww&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "299.000đ" }, { label: "3 Tháng", price: "799.000đ" }, { label: "6 Tháng", price: "1.399.000đ" }, { label: "1 Năm", price: "2.499.000đ" }] },
  { id: 69, name: "Chess.com Diamond", price: "500.000đ", originalPrice: "999.000đ", discount: "-50%", slotsLeft: 6, bgColor: "#2e7d32",
    image: "https://images.unsplash.com/photo-1702143842605-d5a599320ad2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVzcyUyMGdhbWUlMjBib2FyZCUyMHBpZWNlc3xlbnwxfHx8fDE3NzU4NDMyMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "500.000đ" }, { label: "3 Tháng", price: "1.399.000đ" }, { label: "6 Tháng", price: "2.499.000đ" }, { label: "1 Năm", price: "4.499.000đ" }] },
  { id: 70, name: "Tinder Platinum", price: "450.000đ", originalPrice: "4.500.000đ", discount: "-90%", slotsLeft: 8, bgColor: "#ff6b6b",
    image: "https://images.unsplash.com/photo-1775213416658-69720b9f80af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRpbmclMjBhcHAlMjBzbWFydHBob25lJTIwaGVhcnR8ZW58MXx8fHwxNzc1ODQzMjA3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "450.000đ" }, { label: "3 Tháng", price: "1.199.000đ" }, { label: "6 Tháng", price: "2.199.000đ" }, { label: "1 Năm", price: "3.999.000đ" }] },
  { id: 71, name: "Bumble Premium", price: "450.000đ", originalPrice: "2.975.000đ", discount: "-85%", slotsLeft: 6, bgColor: "#ffc107",
    image: "https://images.unsplash.com/photo-1768765982802-4076860c8733?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUViUyMGVudGVydGFpbm1lbnQlMjBicm9hZGNhc3QlMjBtZWRpYXxlbnwxfHx8fDE3NzU4NDMyMTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "450.000đ" }, { label: "3 Tháng", price: "1.199.000đ" }, { label: "6 Tháng", price: "2.199.000đ" }, { label: "1 Năm", price: "3.999.000đ" }] },
];

const EDUCATION_PRODUCTS: Product[] = [
  { id: 80, name: "ELSA Premium", price: "1.350.000đ", originalPrice: "2.399.000đ", discount: "-40%", slotsLeft: 8, bgColor: "#283593",
    image: "https://images.unsplash.com/photo-1729860649490-f4a76b11ac46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5ndWFnZSUyMGxlYXJuaW5nJTIwZWR1Y2F0aW9uJTIwZHVvbGluZ298ZW58MXx8fHwxNzc1ODQzMjA3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "1.350.000đ" }, { label: "3 Tháng", price: "3.699.000đ" }, { label: "6 Tháng", price: "6.799.000đ" }, { label: "1 Năm", price: "11.999.000đ" }] },
  { id: 81, name: "Duolingo Super", price: "199.000đ", originalPrice: "2.800.000đ", discount: "-93%", slotsLeft: 8, bgColor: "#7c3aed",
    image: "https://images.unsplash.com/photo-1762330918491-f4288a62adb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBjb3Vyc2UlMjBlZHVjYXRpb24lMjBsYXB0b3B8ZW58MXx8fHwxNzc1Nzg1MjU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "199.000đ" }, { label: "3 Tháng", price: "549.000đ" }, { label: "6 Tháng", price: "999.000đ" }, { label: "1 Năm", price: "1.799.000đ" }] },
  { id: 82, name: "Udemy Business", price: "550.000đ", originalPrice: "5.750.000đ", discount: "-92%", slotsLeft: 6, bgColor: "#5624d0",
    image: "https://images.unsplash.com/photo-1660322813920-810aa6e447d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdWl6bGV0JTIwZmxhc2hjYXJkcyUyMHN0dWR5fGVufDF8fHx8MTc3NTg0MzIxOXww&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "550.000đ" }, { label: "3 Tháng", price: "1.499.000đ" }, { label: "6 Tháng", price: "2.799.000đ" }, { label: "1 Năm", price: "4.999.000đ" }] },
  { id: 83, name: "Coursera Plus", price: "529.000đ", originalPrice: "9.863.000đ", discount: "-94%", slotsLeft: 8, bgColor: "#0056d2",
    image: "https://images.unsplash.com/photo-1642132652859-3ef5a1048fd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub3Rpb24lMjBwcm9kdWN0aXZpdHklMjB3b3Jrc3BhY2UlMjBhcHB8ZW58MXx8fHwxNzc1ODQzMjIwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "529.000đ" }, { label: "3 Tháng", price: "1.449.000đ" }, { label: "6 Tháng", price: "2.699.000đ" }, { label: "1 Năm", price: "4.799.000đ" }] },
  { id: 84, name: "Quizlet", price: "299.000đ", originalPrice: "878.000đ", discount: "-49%", slotsLeft: 6, bgColor: "#4257b2",
    image: "https://images.unsplash.com/photo-1660322813920-810aa6e447d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdWl6bGV0JTIwZmxhc2hjYXJkcyUyMHN0dWR5fGVufDF8fHx8MTc3NTg0MzIxOXww&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "299.000đ" }, { label: "3 Tháng", price: "799.000đ" }, { label: "6 Tháng", price: "1.399.000đ" }, { label: "1 Năm", price: "2.499.000đ" }] },
  { id: 85, name: "Chegg", price: "259.000đ", originalPrice: "490.000đ", discount: "-30%", slotsLeft: 7, bgColor: "#ff6600",
    image: "https://images.unsplash.com/photo-1729860649490-f4a76b11ac46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5ndWFnZSUyMGxlYXJuaW5nJTIwZWR1Y2F0aW9uJTIwZHVvbGluZ298ZW58MXx8fHwxNzc1ODQzMjA3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "259.000đ" }, { label: "3 Tháng", price: "699.000đ" }, { label: "6 Tháng", price: "1.299.000đ" }, { label: "1 Năm", price: "2.299.000đ" }] },
  { id: 86, name: "Notion Plus", price: "799.000đ", originalPrice: "3.120.000đ", discount: "-76%", slotsLeft: 5, bgColor: "#1a1a1a",
    image: "https://images.unsplash.com/photo-1642132652859-3ef5a1048fd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub3Rpb24lMjBwcm9kdWN0aXZpdHklMjB3b3Jrc3BhY2UlMjBhcHB8ZW58MXx8fHwxNzc1ODQzMjIwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "799.000đ" }, { label: "3 Tháng", price: "2.199.000đ" }, { label: "6 Tháng", price: "3.999.000đ" }, { label: "1 Năm", price: "6.999.000đ" }] },
  { id: 87, name: "Turnitin", price: "260.000đ", originalPrice: "595.000đ", discount: "-56%", slotsLeft: 6, bgColor: "#e0e7ff",
    image: "https://images.unsplash.com/photo-1762330918491-f4288a62adb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBjb3Vyc2UlMjBlZHVjYXRpb24lMjBsYXB0b3B8ZW58MXx8fHwxNzc1Nzg1MjU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "260.000đ" }, { label: "3 Tháng", price: "699.000đ" }, { label: "6 Tháng", price: "1.299.000đ" }, { label: "1 Năm", price: "2.299.000đ" }] },
  { id: 88, name: "Quizizz Super", price: "450.000đ", originalPrice: "2.600.000đ", discount: "-71%", slotsLeft: 7, bgColor: "#7c3aed",
    image: "https://images.unsplash.com/photo-1753931043704-a7856fec33a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFtbWFybHklMjB3cml0aW5nJTIwYXNzaXN0YW50fGVufDF8fHx8MTc3NTg0MjY5M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "450.000đ" }, { label: "3 Tháng", price: "1.199.000đ" }, { label: "6 Tháng", price: "2.199.000đ" }, { label: "1 Năm", price: "3.999.000đ" }] },
  { id: 89, name: "Kahoot Silver", price: "150.000đ", originalPrice: "375.000đ", discount: "-50%", slotsLeft: 8, bgColor: "#46178f",
    image: "https://images.unsplash.com/photo-1767716134877-82b74809e431?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHJvYm90JTIwYXNzaXN0YW50JTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzU4MTU2NjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "150.000đ" }, { label: "3 Tháng", price: "399.000đ" }, { label: "6 Tháng", price: "749.000đ" }, { label: "1 Năm", price: "1.299.000đ" }] },
  { id: 90, name: "StuDocu Premium", price: "350.000đ", originalPrice: "2.900.000đ", discount: "-85%", slotsLeft: 6, bgColor: "#2196f3",
    image: "https://images.unsplash.com/photo-1678347123725-2d0d31bc06bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGF0Z3B0JTIwYXJ0aWZpY2lhbCUyMGludGVsbGlnZW5jZXxlbnwxfHx8fDE3NzU4NDI2ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "350.000đ" }, { label: "3 Tháng", price: "949.000đ" }, { label: "6 Tháng", price: "1.749.000đ" }, { label: "1 Năm", price: "2.999.000đ" }] },
  { id: 91, name: "Ejoy Pro-Voca", price: "399.000đ", originalPrice: "990.000đ", discount: "-60%", slotsLeft: 5, bgColor: "#e8eaf6",
    image: "https://images.unsplash.com/photo-1757310998309-87a97e562ee5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb29nbGUlMjBnZW1pbmklMjBBSXxlbnwxfHx8fDE3NzU4NDI2ODd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "399.000đ" }, { label: "3 Tháng", price: "1.099.000đ" }, { label: "6 Tháng", price: "1.999.000đ" }, { label: "1 Năm", price: "3.499.000đ" }] },
];

const VPN_PRODUCTS: Product[] = [
  { id: 100, name: "HMA VPN", price: "69.000đ", originalPrice: "300.000đ", discount: "-67%", slotsLeft: 8, bgColor: "#ffd600",
    image: "https://images.unsplash.com/photo-1603985529862-9e12198c9a60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxWUE4lMjBzaGllbGQlMjBjeWJlciUyMHByb3RlY3Rpb258ZW58MXx8fHwxNzc1ODQzMjEzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "69.000đ" }, { label: "3 Tháng", price: "189.000đ" }, { label: "6 Tháng", price: "349.000đ" }, { label: "1 Năm", price: "599.000đ" }] },
  { id: 101, name: "Express VPN", price: "69.000đ", originalPrice: "300.000đ", discount: "-77%", slotsLeft: 9, bgColor: "#d32f2f",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlciUyMHNlY3VyaXR5JTIwc2hpZWxkfGVufDF8fHx8MTc3NTgxNTY2M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "69.000đ" }, { label: "3 Tháng", price: "189.000đ" }, { label: "6 Tháng", price: "349.000đ" }, { label: "1 Năm", price: "599.000đ" }] },
  { id: 102, name: "NordVPN", price: "69.000đ", originalPrice: "312.000đ", discount: "-71%", slotsLeft: 8, bgColor: "#1a2744",
    image: "https://images.unsplash.com/photo-1603985529862-9e12198c9a60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxWUE4lMjBzaGllbGQlMjBjeWJlciUyMHByb3RlY3Rpb258ZW58MXx8fHwxNzc1ODQzMjEzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "69.000đ" }, { label: "3 Tháng", price: "189.000đ" }, { label: "6 Tháng", price: "349.000đ" }, { label: "1 Năm", price: "599.000đ" }] },
  { id: 103, name: "Surfshark VPN", price: "399.000đ", originalPrice: "610.000đ", discount: "-67%", slotsLeft: 9, bgColor: "#178a80",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlciUyMHNlY3VyaXR5JTIwc2hpZWxkfGVufDF8fHx8MTc3NTgxNTY2M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    plans: [{ label: "1 Tháng", price: "399.000đ" }, { label: "3 Tháng", price: "1.099.000đ" }, { label: "6 Tháng", price: "1.999.000đ" }, { label: "1 Năm", price: "3.499.000đ" }] },
];

const TESTIMONIALS = [
  { name: "Chị My", role: "Sinh viên",
    avatar: "https://images.unsplash.com/photo-1758270705555-015de348a48a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0dWRlbnQlMjB3b21hbiUyMGNvbGxlZ2V8ZW58MXx8fHwxNzc1ODQzMjEzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    text: "Mình đã so sánh nhiều shop khác nhưng tvhcanva.com có giá cả cạnh tranh nhất. Chất lượng tài khoản Canva Pro rất tốt, giúp mình tiết kiệm được nhiều thời gian." },
  { name: "Anh Vinh", role: "Trưởng phòng",
    avatar: "https://images.unsplash.com/photo-1543879739-ab87be3df369?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGJ1c2luZXNzbWFuJTIwc3VpdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzU4NDMyMTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    text: "tvhcanva.com đã giúp mình tìm được tài khoản Google One với dung lượng lớn mà giá cả lại rất hợp lý. Nhân viên hỗ trợ nhiệt tình, giải đáp mọi thắc mắc của mình." },
  { name: "Chị Thu", role: "Content Creator",
    avatar: "https://images.unsplash.com/photo-1758600587709-ad6b8e429896?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHdvbWFuJTIwY29udGVudCUyMGNyZWF0b3IlMjBzb2NpYWwlMjBtZWRpYXxlbnwxfHx8fDE3NzU4NDMyMTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    text: "tvhcanva.com là nơi mình tin tưởng để mua tài khoản ChatGPT Plus. Tài khoản hoạt động ổn định, giá cả hợp lý và đội ngũ hỗ trợ rất chuyên nghiệp." },
  { name: "Anh Tuấn", role: "Video Editor",
    avatar: "https://images.unsplash.com/photo-1769755031467-1553dd467c9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMG1hbiUyMHZpZGVvJTIwZWRpdG9yJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzc1ODQzMjE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    text: "Mình rất hài lòng với dịch vụ của tvhcanva.com. Tài khoản Capcut Pro hoạt động ổn định, giá cả phải chăng và giao dịch rất nhanh gọn. Mình sẽ tiếp tục ủng hộ shop." },
];

const NAV_ITEMS = [
  { label: "VỀ CHÚNG TÔI", href: "#about" },
  { label: "ĐANG BÁN CHẠY", href: "#best-sellers" },
  { label: "SẢN PHẨM KHÁC", href: "#other-products" },
  { label: "KHÁCH HÀNG", href: "#testimonials" },
  { label: "LIÊN HỆ", href: "#contact" },
];

function SectionTitle({ children, white = false }: { children: React.ReactNode; white?: boolean }) {
  return (
    <h2 className="text-center mb-8" style={{
      fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 900, fontStyle: "italic",
      color: white ? "#fff" : "#1a1a4e",
      textDecoration: "underline", textDecorationColor: white ? "#fff" : "#e91e63",
      textUnderlineOffset: "8px",
    }}>
      {children}
    </h2>
  );
}

function ProductSection({ title, products, bg, onClick, id }: {
  title: string; products: Product[]; bg: "white" | "gray" | "gradient"; onClick: (p: Product) => void; id?: string;
}) {
  const bgClass = bg === "white" ? "bg-white" : bg === "gray" ? "bg-gray-50" : "";
  const bgStyle = bg === "gradient" ? { background: "linear-gradient(135deg, #5b2fa0 0%, #c054c0 100%)" } : {};
  return (
    <section id={id} className={`py-10 px-4 ${bgClass}`} style={bgStyle}>
      <div className="max-w-6xl mx-auto">
        <SectionTitle white={bg === "gradient"}>{title}</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} onClick={onClick} />)}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40" style={{ background: "linear-gradient(135deg, #1a1a4e 0%, #3b1a6e 50%, #6b2fa0 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-shrink-0">
              <img src={logoImg} alt="TVHCanva Logo" className="h-10 w-10 object-cover rounded-full" />
              <div>
                <div className="text-white" style={{ fontSize: "1rem", fontWeight: 700 }}>TVHCanva.com</div>
                <div className="text-white/60" style={{ fontSize: "0.6rem" }}>Phần Mềm Bản Quyền Giá Rẻ</div>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map((item) => (
                <a key={item.label} href={item.href} className="text-white/90 hover:text-white transition-colors" style={{ fontSize: "0.85rem", fontWeight: 600 }}>{item.label}</a>
              ))}
            </nav>
            <button className="md:hidden text-white text-xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
          {mobileMenuOpen && (
            <nav className="md:hidden mt-3 pb-2 flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <a key={item.label} href={item.href} className="text-white/90 py-1" style={{ fontSize: "0.85rem" }}>{item.label}</a>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Hero Banner */}
      <section style={{ background: "linear-gradient(135deg, #2a1a5e 0%, #5b2fa0 30%, #c054c0 70%, #e06080 100%)" }} className="py-12 px-4 text-center text-white relative overflow-hidden">
        <h1 className="text-white mb-6" style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 900, fontStyle: "italic", textTransform: "uppercase", letterSpacing: "2px" }}>
          NGUỒN TÀI KHOẢN BẢN QUYỀN GIÁ RẺ
        </h1>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 bg-white text-gray-800 px-5 py-2 rounded-full shadow-lg">
              <CheckCircle size={20} className="text-green-500" />
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "#e91e63" }}>CHẤT LƯỢNG</span>
            </div>
            <div className="flex items-center gap-2 bg-white text-gray-800 px-5 py-2 rounded-full shadow-lg">
              <CheckCircle size={20} className="text-green-500" />
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "#e91e63" }}>GIÁ RẺ</span>
            </div>
          </div>
          <div className="relative">
            <div className="w-52 h-36 md:w-64 md:h-44 bg-gray-800 rounded-lg border-4 border-gray-700 flex items-center justify-center shadow-2xl overflow-hidden">
              <div className="text-center p-3">
                <p className="text-yellow-300 mb-1" style={{ fontSize: "0.65rem", fontWeight: 700 }}>CUNG CẤP PHẦN MỀM GIÁ RẺ</p>
                <div className="grid grid-cols-5 gap-1">
                  {["📧","🎬","🎵","📺","🎮","💬","📝","🔒","☁️","🤖"].map((e, i) => (
                    <div key={i} className="w-5 h-5 bg-white/20 rounded flex items-center justify-center" style={{ fontSize: "0.6rem" }}>{e}</div>
                  ))}
                </div>
                <p className="text-white/60 mt-2" style={{ fontSize: "0.5rem" }}>BẢO HÀNH TRỌN ĐỜI</p>
              </div>
            </div>
            <div className="w-20 h-3 bg-gray-700 mx-auto rounded-b-lg" />
            <div className="w-28 h-2 bg-gray-600 mx-auto rounded-b-lg" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 bg-white text-gray-800 px-5 py-2 rounded-full shadow-lg">
              <CheckCircle size={20} className="text-green-500" />
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "#e91e63" }}>BẢO HÀNH 24/7</span>
            </div>
            <div className="flex items-center gap-2 bg-white text-gray-800 px-5 py-2 rounded-full shadow-lg">
              <CheckCircle size={20} className="text-green-500" />
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "#e91e63" }}>UY TÍN</span>
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
              <p className="text-gray-700 mb-4" style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
                Chúng tôi cung cấp tài khoản bản quyền với mức giá chỉ bằng 10% so với mức giá được công bố trên website chính thức như Canva Pro, Capcut Pro, Youtube Premium, Google One 2TB, Microsoft Office 365, Spotify Premium, Gamma AI, SuperGrok, ChatGPT Plus, ChatGPT Pro,...
              </p>
              <p className="text-gray-700" style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
                Hơn hết, chúng tôi làm việc bằng sự tử tế và trách nhiệm. Là một khách hàng của chúng tôi, bạn sẽ được hỗ trợ bảo hành 24/7 đến hết vòng đời của tài khoản!
              </p>
            </div>
            <div className="flex flex-col gap-3 justify-center">
              {[{ t: "GIÁ RẺ", d: "Tiết kiệm được 90% chi phí so với mua trên website chính thức" }, { t: "UY TÍN", d: "Hỗ trợ nhiệt tình, bảo hành 24/7 bởi đội ngũ admin" }].map((item) => (
                <div key={item.t} className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={24} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#e91e63" }}>{item.t}</h4>
                      <p className="text-gray-500" style={{ fontSize: "0.78rem" }}>{item.d}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Payment Guide */}
      <section style={{ background: "linear-gradient(135deg, #c054c0 0%, #e06080 100%)" }} className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionTitle white>HƯỚNG DẪN THANH TOÁN</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: "Bước 1", icon: <MousePointer size={36} className="text-pink-500" />, text: "Lựa chọn sản phẩm" },
              { step: "Bước 2", icon: <FileText size={36} className="text-pink-500" />, text: "Điền đầy đủ thông tin mua hàng" },
              { step: "Bước 3", icon: <Smartphone size={36} className="text-pink-500" />, text: "Thanh toán với QR Code" },
              { step: "Bước 4", icon: <UserCircle size={36} className="text-pink-500" />, text: "Nhận tài khoản và sử dụng ngay!" },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-5 text-center shadow-lg">
                <h4 className="mb-3" style={{ fontSize: "1rem", fontWeight: 700, fontStyle: "italic", textDecoration: "underline", color: "#1a1a4e" }}>{item.step}</h4>
                <div className="flex justify-center mb-3">{item.icon}</div>
                <p className="text-gray-700" style={{ fontSize: "0.85rem", fontWeight: 600, fontStyle: "italic" }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Sections */}
      <ProductSection id="best-sellers" title="ĐANG BÁN CHẠY" products={BEST_SELLERS} bg="gray" onClick={setSelectedProduct} />
      <ProductSection id="other-products" title="THIẾT KẾ" products={DESIGN_PRODUCTS} bg="gradient" onClick={setSelectedProduct} />
      <ProductSection title="TRỢ LÝ AI" products={AI_PRODUCTS} bg="gray" onClick={setSelectedProduct} />
      <ProductSection title="LÀM VIỆC" products={WORK_PRODUCTS} bg="gradient" onClick={setSelectedProduct} />
      <ProductSection title="XEM PHIM - GIẢI TRÍ" products={ENTERTAINMENT_PRODUCTS} bg="gray" onClick={setSelectedProduct} />
      <ProductSection title="HỌC TẬP" products={EDUCATION_PRODUCTS} bg="gradient" onClick={setSelectedProduct} />
      <ProductSection title="VPN GIÁ RẺ" products={VPN_PRODUCTS} bg="gray" onClick={setSelectedProduct} />

      {/* Testimonials */}
      <section id="testimonials" style={{ background: "linear-gradient(135deg, #5b2fa0 0%, #c054c0 50%, #e06080 100%)" }} className="py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-white mb-2" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 900, fontStyle: "italic" }}>
            UY TÍN TẠO NÊN THƯƠNG HIỆU
          </h2>
          <p className="text-white/80 mb-10" style={{ fontSize: "1.1rem", fontStyle: "italic" }}>
            KHÁCH HÀNG LUÔN CẢM THẤY HÀI LÒNG
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="flex flex-col items-center">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-4"
                />
                <div className="bg-white rounded-2xl p-5 shadow-lg w-full">
                  <div className="flex justify-center gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#f59e0b" stroke="#f59e0b" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4" style={{ fontSize: "0.8rem", lineHeight: 1.6 }}>
                    "{t.text}"
                  </p>
                  <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a1a4e" }}>{t.name}</p>
                  <p className="text-pink-500" style={{ fontSize: "0.8rem", fontStyle: "italic" }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Left */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={logoImg} alt="TVHCanva Logo" className="h-10 w-10 object-contain rounded-full" />
                <div>
                  <span className="text-white" style={{ fontSize: "1rem", fontWeight: 700 }}>TVHCanva.com</span>
                  <div className="text-gray-500" style={{ fontSize: "0.65rem" }}>Phần Mềm Bản Quyền Giá Rẻ</div>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-pink-400 mb-3" style={{ fontSize: "0.9rem", fontWeight: 600, fontStyle: "italic" }}>Về chúng tôi</h4>
                <div className="space-y-1.5" style={{ fontSize: "0.82rem" }}>
                  <p></p>
                  <p><span className="text-gray-500">Website:</span> <span className="text-white">https://www.tvhcanva.com</span></p>
                  <p><span className="text-gray-500">Facebook:</span> <a href="https://www.facebook.com/huwng910" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-400 transition-colors">https://www.facebook.com/huwng910</a></p>
                </div>
              </div>
            </div>

            {/* Right - Zalo groups */}
            <div className="flex-1">
              <div className="bg-gray-800 rounded-2xl p-4 space-y-3">
                {["TVHCanva.com - Nhóm 1", "TVHCanva.com - Nhóm 2", "TVHCanva.com - Nhóm CTV"].map((g, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-700/50 rounded-lg p-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <ShieldCheck size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{g}</p>
                      <p className="text-gray-500" style={{ fontSize: "0.65rem" }}>Cộng đồng • {900 + i * 50} thành viên</p>
                    </div>
                  </div>
                ))}
                <a href="https://zalo.me/g/wvhu5evlevj1vvnzccgo" target="_blank" rel="noopener noreferrer" className="block text-center text-pink-400 mt-2" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  Tham gia ngay →
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 text-center" style={{ fontSize: "0.75rem" }}>
            Copyright © 2024 tvhcanva.com
          </div>
        </div>
      </footer>

      {/* Floating Buttons */}
      <FloatingButtons />

      {/* Order Modal */}
      {selectedProduct && (
        <OrderModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
