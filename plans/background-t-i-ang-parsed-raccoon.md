# Tự động giao link Canva cho gói 3 Tháng & 1 Năm

## Context

Hiện tại luồng "thanh toán → nhận link tham gia Canva" chỉ hoạt động cho gói **Canva Pro 1 Tháng (15.000đ)**. Gói **3 Tháng (40.000đ)** và **1 Năm (200.000đ)** đã hiển thị trong dropdown và tạo được đơn, nhưng sau khi thanh toán khách **không nhận được link tham gia và hướng dẫn 2 bước**.

Nguyên nhân: điều kiện nhận diện "đơn Canva cần trả link" bị hardcode cứng theo `planLabel === "1 Tháng"` và `amount === 15000` ở 2 nơi (checkout của Vercel + Edge Function của Supabase). Đơn 3 Tháng / 1 Năm vì thế nhận tiền tố mã đơn `TVH` (không phải `TVHC`), bị lưu `is_canva = false`, và không bao giờ được trả link.

Mục tiêu: gói 3 Tháng và 1 Năm chạy **tự động y hệt** gói 1 Tháng. Mỗi gói có **link tham gia riêng** (người dùng sẽ cung cấp link cho 3 Tháng và 1 Năm giống như đã có cho 1 Tháng).

## Thiết kế

Số tiền của mỗi gói là **duy nhất** (15.000 / 40.000 / 200.000) và là dữ liệu duy nhất đi được qua IPN của SePay tới `mark-paid`. Vì vậy ta dùng **amount làm khóa để chọn đúng link** cho từng gói, và mở rộng điều kiện `isCanva` để chấp nhận cả 3 mức giá. Tiền tố mã đơn giữ nguyên là `TVHC` cho mọi gói Canva → `PaymentReturnModal.tsx` (nhận diện qua tiền tố `TVHC`) **không cần sửa gì**.

Cần 2 secret mới trên Supabase (dùng công cụ `create_supabase_secret`):
- `CANVA_INVITE_LINK_3M` — link nhóm Canva Pro 3 Tháng
- `CANVA_INVITE_LINK_1Y` — link nhóm Canva Pro 1 Năm

`CANVA_INVITE_LINK` hiện có tiếp tục dùng cho gói 1 Tháng.

## Các thay đổi

### 1. `api/sepay-checkout.ts` (dòng 67–72)
Mở rộng `isCanva`: bỏ ràng buộc `planLabel === "1 Tháng"` và `amount === 15000`, thay bằng "tên sản phẩm chứa canva" + số tiền thuộc tập giá Canva. Cách này bền vững kể cả khi label bị đổi chữ (ví dụ `"1 Tháng - 7 ngày đổi nhóm 1 lần"`).

```ts
const CANVA_AMOUNTS = new Set([15000, 40000, 200000]);
const isCanva =
  String(productName).toLowerCase().includes("canva") &&
  CANVA_AMOUNTS.has(Number(amount));
const invoiceNumber = (isCanva ? "TVHC" : "TVH") + Date.now();
```

### 2. `supabase/functions/server/index.tsx`
- **`mark-paid` (dòng 61):** bỏ `&& amount === 15000`, chỉ dựa vào tiền tố. `amount` vẫn được lưu (đã có ở dòng 66) để `canva-link` chọn link.
  ```ts
  const isCanva = invoice.toUpperCase().startsWith("TVHC");
  ```
- **`canva-link` (dòng 100–103):** chọn link theo `record.amount`.
  ```ts
  if (record.is_canva) {
    let link: string | undefined;
    if (record.amount === 40000) link = Deno.env.get("CANVA_INVITE_LINK_3M");
    else if (record.amount === 200000) link = Deno.env.get("CANVA_INVITE_LINK_1Y");
    else link = Deno.env.get("CANVA_INVITE_LINK"); // 15.000đ - 1 Tháng
    if (link) result.canva_link = link;
  }
  ```
- **`/diag` (dòng 28–33):** thêm cờ tồn tại cho 2 env mới để dễ chẩn đoán.

### 3. Không cần sửa
- `src/app/components/PaymentReturnModal.tsx` — nhận diện qua tiền tố `TVHC`, tự chạy.
- `src/app/App.tsx` — 3 gói đã có sẵn trong `plans` (dòng 53–57).
- `src/app/components/wcMapping.ts` — luồng SePay không đọc `WC_MAPPING` để tính giá (chỉ ghi chú: entry Canva thiếu "3 Tháng", không ảnh hưởng luồng link nhưng có thể bổ sung cho nhất quán nếu muốn).

## Cung cấp secret
Dùng `create_supabase_secret` để người dùng nhập `CANVA_INVITE_LINK_3M` và `CANVA_INVITE_LINK_1Y`. Không hoạt động nếu thiếu link.

## Kiểm thử end-to-end
1. Mở web, chọn Canva Pro → gói **3 Tháng** (40.000đ), đặt hàng → xác nhận mã đơn bắt đầu bằng `TVHC` (kiểm qua response `invoice_number` hoặc URL trả về `?inv=TVHC...`).
2. Thanh toán thật (production) → SePay gọi IPN `https://www.tvhcanva.com/api/sepay-ipn` → `mark-paid` lưu `is_canva=true, amount=40000`.
3. Trang trả về hiển thị hướng dẫn 2 bước + nút "THAM GIA CANVA NGAY" trỏ đúng link 3 Tháng.
4. Lặp lại cho gói **1 Năm** (200.000đ) → nhận đúng link 1 Năm.
5. Xác nhận gói **1 Tháng** vẫn nhận đúng `CANVA_INVITE_LINK` như cũ.
6. Kiểm `GET /make-server-4d3e30ca/diag` thấy cả 3 cờ link = true.
