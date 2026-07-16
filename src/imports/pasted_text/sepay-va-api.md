# Bắt đầu nhanh API VA theo đơn hàng

## Hướng dẫn tạo đơn hàng VA, nhận thanh toán qua webhook. Hỗ trợ BIDV (doanh nghiệp), Sacombank (cá nhân/hộ kinh doanh) và Vietcombank (doanh nghiệp/hộ kinh doanh).

---

**API Overview:**

REST API chuẩn hóa cho SePay. Thay thế các endpoint legacy userapi/.

**Base URL:** `https://userapi.sepay.vn/v2`

**Rate Limits:** 3 requests/giây. Vượt quá trả HTTP 429.


---

Tạo số VA riêng cho mỗi đơn hàng. Khách chuyển khoản vào VA, SePay tự động khớp và gửi webhook. Cần tài khoản BIDV doanh nghiệp, Sacombank cá nhân/hộ kinh doanh hoặc Vietcombank doanh nghiệp/hộ kinh doanh đã liên kết; để thử nghiệm không cần tài khoản thật, dùng [Sandbox](/vi/sepay-api/v2/sandbox).

## Ngân hàng hỗ trợ

|                          | BIDV         | Sacombank                | Vietcombank              |
| ------------------------ | ------------ | ------------------------ | ------------------------ |
| Loại tài khoản           | Doanh nghiệp | Cá nhân / HKD            | Doanh nghiệp / HKD       |
| Tiền tố VA (`va_prefix`) | Không cần    | Bắt buộc                 | Không cần                |
| Terminal ID (`tid`)      | Không cần    | Không cần                | **Bắt buộc**             |
| Số tiền (`amount`)       | Tùy chọn     | Bắt buộc                 | Bắt buộc                 |
| `order_code` tối đa      | 50 ký tự     | 50 ký tự                 | **15 ký tự**             |
| Thanh toán một phần      | Có           | Không (chỉ đúng số tiền) | Không (chỉ đúng số tiền) |

<Callout type="warn" title="Sacombank và Vietcombank: chỉ nhận đúng số tiền">
Sacombank và Vietcombank không hỗ trợ thanh toán một phần. Đơn hàng chỉ chuyển 
`Pending`
 sang 
`Paid`
 hoặc 
`Cancelled`
.
</Callout>

<Callout type="warn" title="Vietcombank: cần `tid` cho mỗi đơn hàng">
Mỗi đơn hàng Vietcombank phải gắn với một terminal cụ thể qua tham số 
`tid`
. Nếu chưa có terminal, xem cách 
thêm terminal cho tài khoản Vietcombank doanh nghiệp/hộ kinh doanh
. Gọi 
Danh sách terminal
 để lấy 
`tid`
 hợp lệ trước khi tạo đơn hàng. 
`tid`
 là Terminal ID gốc do Vietcombank cấp (ví dụ 
`20933557`
), không phải 
`xid`
 UUID của SePay.
</Callout>

## Trạng thái

<Mermaid title="Trạng thái đơn hàng">
stateDiagram-v2
[*] --> Pending
Pending --> Paid
Pending --> Partially: chỉ BIDV
Partially --> Paid: chỉ BIDV
Pending --> Cancelled
</Mermaid>

<Mermaid title="Trạng thái VA">
stateDiagram-v2
[*] --> Unpaid
Unpaid --> Paid
Unpaid --> Cancelled
</Mermaid>

## Các endpoint

<Endpoint>
  <Method>GET</Method>

  <Path>https://userapi.sepay.vn/v2/bank-accounts/{ba_xid}/orders</Path>

  <Description>
    Danh sách đơn hàng
  </Description>

  <Authentication>
    bearerAuth
  </Authentication>
</Endpoint>

<Endpoint>
  <Method>POST</Method>

  <Path>https://userapi.sepay.vn/v2/bank-accounts/{ba_xid}/orders</Path>

  <Description>
    Tạo đơn hàng
  </Description>

  <Authentication>
    bearerAuth
  </Authentication>
</Endpoint>

<Endpoint>
  <Method>GET</Method>

  <Path>https://userapi.sepay.vn/v2/bank-accounts/{ba_xid}/orders/{order_xid}</Path>

  <Description>
    Chi tiết đơn hàng
  </Description>

  <Authentication>
    bearerAuth
  </Authentication>
</Endpoint>

<Endpoint>
  <Method>DELETE</Method>

  <Path>https://userapi.sepay.vn/v2/bank-accounts/{ba_xid}/orders/{order_xid}</Path>

  <Description>
    Hủy đơn hàng
  </Description>

  <Authentication>
    bearerAuth
  </Authentication>
</Endpoint>

<Endpoint>
  <Method>POST</Method>

  <Path>https://userapi.sepay.vn/v2/bank-accounts/{ba_xid}/orders/{order_xid}/va</Path>

  <Description>
    Tạo VA cho đơn hàng
  </Description>

  <Authentication>
    bearerAuth
  </Authentication>
</Endpoint>

<Endpoint>
  <Method>DELETE</Method>

  <Path>https://userapi.sepay.vn/v2/bank-accounts/{ba_xid}/orders/{order_xid}/va/{va_number}</Path>

  <Description>
    Hủy VA
  </Description>

  <Authentication>
    bearerAuth
  </Authentication>
</Endpoint>

<Endpoint>
  <Method>GET</Method>

  <Path>https://userapi.sepay.vn/v2/bank-accounts/{ba_xid}/prefixes</Path>

  <Description>
    Danh sách tiền tố VA
  </Description>

  <Authentication>
    bearerAuth
  </Authentication>
</Endpoint>

<Endpoint>
  <Method>GET</Method>

  <Path>https://userapi.sepay.vn/v2/bank-accounts/{ba_xid}/prefixes/{va_prefix}</Path>

  <Description>
    Chi tiết tiền tố VA
  </Description>

  <Authentication>
    bearerAuth
  </Authentication>
</Endpoint>

<Endpoint>
  <Method>GET</Method>

  <Path>https://userapi.sepay.vn/v2/bank-accounts/{ba_xid}/terminals</Path>

  <Description>
    Danh sách terminal
  </Description>

  <Authentication>
    bearerAuth
  </Authentication>
</Endpoint>

***

## Luồng thanh toán qua VA

<Mermaid title="Luồng tích hợp VA theo đơn hàng">
sequenceDiagram
participant WEB as Website của bạn
participant SP as SePay API v2
participant KH as Khách hàng
participant NH as Ngân hàng

Note over WEB,SP: Sacombank: GET /prefixes trước<br/>Vietcombank: GET /terminals trước
WEB->>SP: 1. POST /orders
SP-->>WEB: va_number, amount, expired_at, qr_code
WEB->>KH: 2. Hiển thị thông tin thanh toán (VA, QR)
KH->>NH: 3. Chuyển khoản đến VA
NH->>SP: 4. Thông báo giao dịch
SP->>WEB: 5. Webhook xác nhận thanh toán
WEB->>KH: 6. Cập nhật trạng thái đơn hàng
</Mermaid>

***

## Các bước tích hợp

<Steps>
  <Step title="Chuẩn bị">
    * Tạo [API Token](/vi/sepay-api/v2/tao-api-token)
    * Tài khoản ngân hàng đã liên kết trên SePay:
      * **BIDV**: tài khoản doanh nghiệp
      * **Sacombank**: tài khoản cá nhân hoặc hộ kinh doanh, merchant đã kích hoạt
      * **Vietcombank**: tài khoản doanh nghiệp hoặc hộ kinh doanh, đã có ít nhất một terminal (xem cách [thêm terminal](https://docs.sepay.vn/ket-noi-vietcombank-doanh-nghiep-ho-kinh-doanh.html#them-va) hoặc lấy danh sách qua [Danh sách terminal](/vi/sepay-api/v2/tai-khoan-ngan-hang/terminal))
    * Lấy UUID tài khoản từ [API Tài khoản ngân hàng](/vi/sepay-api/v2/tai-khoan-ngan-hang/danh-sach)
  </Step>

  <Step title="Lấy tiền tố VA (Sacombank) hoặc terminal (Vietcombank)">
    <Tabs
      tabs={[
{ label: "BIDV", content: (
  <Callout type="info">BIDV không cần bước này. Bỏ qua và chuyển sang bước tiếp theo.</Callout>
)},
{ label: "Sacombank", content: (
  <>
    <p>Mỗi đơn hàng Sacombank phải có <code>va_prefix</code>. Gọi API lấy danh sách prefix:</p>
    <NodeSnippet title="cURL" lang="bash" code={`curl -X GET "https://userapi.sepay.vn/v2/bank-accounts/{ba_uuid}/prefixes" \\
-H "Authorization: Bearer YOUR_API_TOKEN"`} />
    <NodeSnippet title="Response 200" lang="json" code={`{
"status": "success",
"data": [
  {
    "va_prefix": "SEP200001WEB",
    "store_id": "WEB",
    "store_name": "NGUYEN VAN A",
    "status": "active",
    "created_at": "2026-03-20 09:00:00"
  }
]
}`} />
    <p>Lấy <code>va_prefix</code> (ví dụ <code>SEP200001WEB</code>) để truyền vào bước tạo đơn hàng. <a href="/vi/sepay-api/v2/don-hang/tien-to-va">Xem chi tiết Tiền tố VA</a>.</p>
  </>
)},
{ label: "Vietcombank", content: (
  <>
    <p>Mỗi đơn hàng Vietcombank phải gắn với một terminal. Gọi API lấy danh sách terminal:</p>
    <NodeSnippet title="cURL" lang="bash" code={`curl -X GET "https://userapi.sepay.vn/v2/bank-accounts/{ba_uuid}/terminals" \\
-H "Authorization: Bearer YOUR_API_TOKEN"`} />
    <NodeSnippet title="Response 200" lang="json" code={`{
"status": "success",
"data": [
  {
    "xid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "tid": "20933557",
    "name": "POS quay 1",
    "created_at": "2026-04-26 09:15:00"
  }
]
}`} />
    <p>Lấy <code>tid</code> (ví dụ <code>20933557</code>) để truyền vào bước tạo đơn hàng. <a href="/vi/sepay-api/v2/tai-khoan-ngan-hang/terminal">Xem chi tiết Danh sách terminal</a>.</p>
  </>
)}
]}
    />
  </Step>

  <Step title="Tạo đơn hàng">
    <Tabs
      tabs={[
{ label: "BIDV", content: <NodeSnippet title="cURL" lang="bash" code={`curl -X POST "https://userapi.sepay.vn/v2/bank-accounts/{ba_uuid}/orders" \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer YOUR_API_TOKEN" \\
-d '{"amount": 500000, "order_code": "DH20250001", "with_qrcode": "1"}'`} /> },
{ label: "Sacombank", content: <NodeSnippet title="cURL" lang="bash" code={`curl -X POST "https://userapi.sepay.vn/v2/bank-accounts/{ba_uuid}/orders" \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer YOUR_API_TOKEN" \\
-d '{"va_prefix": "SEP200001WEB", "order_code": "ORDER001", "amount": 100000, "duration": 900, "with_qrcode": "1"}'`} /> },
{ label: "Vietcombank", content: <NodeSnippet title="cURL" lang="bash" code={`curl -X POST "https://userapi.sepay.vn/v2/bank-accounts/{ba_uuid}/orders" \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer YOUR_API_TOKEN" \\
-d '{"tid": "20933557", "order_code": "ORDER001", "amount": 100000, "duration": 900, "with_qrcode": "1"}'`} /> }
]}
    />

    <Tabs
      tabs={[
{ label: "BIDV", content: <NodeSnippet title="Response 201" lang="json" code={`{
"status": "success",
"message": "Order created successfully",
"data": {
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678902",
  "order_code": "DH20250001",
  "va_number": "963NQDORD1234567890AB",
  "va_holder_name": "CONG TY CP TECH VINA",
  "amount": 500000,
  "status": "Pending",
  "bank_name": "BIDV",
  "account_holder_name": "CONG TY CP TECH VINA",
  "account_number": "1234567890",
  "expired_at": null,
  "qr_code": "data:image/png;base64,...",
  "qr_code_url": "https://vietqr.app/img?acc=963NQDORD1234567890AB&bank=BIDV&amount=500000&template=compact"
}
}`} /> },
{ label: "Sacombank", content: <NodeSnippet title="Response 201" lang="json" code={`{
"status": "success",
"message": "Order created successfully",
"data": {
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "order_code": "ORDER001",
  "va_number": "SEP200001WEB1234567",
  "va_holder_name": "NGUYEN VAN A",
  "amount": 100000,
  "status": "Pending",
  "bank_name": "Sacombank",
  "account_holder_name": "NGUYEN VAN A",
  "account_number": "0123456789",
  "expired_at": "2026-03-27 10:15:00",
  "qr_code": "data:image/png;base64,...",
  "qr_code_url": "https://vietqr.app/img?acc=SEP200001WEB1234567&bank=Sacombank&amount=100000&template=compact"
}
}`} /> },
{ label: "Vietcombank", content: <NodeSnippet title="Response 201" lang="json" code={`{
"status": "success",
"message": "Order created successfully",
"data": {
  "id": "c3d4e5f6-a7b8-9012-cdef-345678901234",
  "order_code": "ORDER001",
  "va_number": "9704970012345678",
  "va_holder_name": "CONG TY ABC",
  "amount": 100000,
  "status": "Pending",
  "bank_name": "Vietcombank",
  "account_holder_name": "CONG TY ABC",
  "account_number": "0021000123456",
  "expired_at": "2026-03-27 10:15:00",
  "qr_code": "data:image/png;base64,...",
  "qr_code_url": "https://vietqr.app/img?acc=9704970012345678&bank=Vietcombank&amount=100000&template=compact"
}
}`} /> }
]}
    />
  </Step>

  <Step title="Hiển thị cho khách hàng">
    Từ response, hiển thị cho khách hàng:

    * **Số tài khoản**: `va_number` (số VA để chuyển khoản)
    * **Số tiền**: `amount`
    * **Mã QR**: `qr_code` hoặc `qr_code_url`
    * **Thời hạn**: `expired_at` (nếu có)
  </Step>

  <Step title="Nhận thông báo thanh toán">
    Khi khách hàng chuyển khoản thành công, SePay gửi webhook đến URL bạn đã cấu hình. Giao dịch sẽ chứa trường `code` khớp với `order_code` của đơn hàng.

    Xem chi tiết [cấu hình webhook](/vi/sepay-webhooks/bat-dau-nhanh).
  </Step>

  <Step title="Kiểm tra trạng thái đơn hàng">
    ```bash
    curl -X GET "https://userapi.sepay.vn/v2/bank-accounts/{ba_uuid}/orders/{order_uuid}" \
      -H "Authorization: Bearer YOUR_API_TOKEN"
    ```

    Trạng thái đơn hàng:

    * `Pending`: chờ thanh toán
    * `Paid`: đã thanh toán
    * `Partially`: thanh toán một phần (chỉ BIDV)
    * `Cancelled`: đã hủy
  </Step>
</Steps>

***

## Tham số chính

| Tham số      | Bắt buộc                        | Mô tả                                                                 |
| ------------ | ------------------------------- | --------------------------------------------------------------------- |
| `va_prefix`  | **Có** (Sacombank)              | Tiền tố VA. Không dùng cho BIDV và Vietcombank.                       |
| `tid`        | **Có** (Vietcombank)            | Terminal ID gốc do Vietcombank cấp. Không dùng cho BIDV và Sacombank. |
| `order_code` | Không                           | Mã đơn hàng (6-50 ký tự, Vietcombank tối đa 15). Tự sinh nếu bỏ qua.  |
| `amount`     | **Có** (Sacombank, Vietcombank) | Số tiền (VND). Chỉ BIDV cho phép tùy chọn.                            |

[Xem đầy đủ tham số](/vi/sepay-api/v2/don-hang/tao-don-hang)

***

## Thanh toán nhiều lần (chỉ BIDV)

BIDV hỗ trợ tạo thêm VA cho đơn hàng đang `Pending` hoặc `Partially`. Khi tổng số tiền thanh toán đạt đủ `amount` của đơn hàng, đơn hàng chuyển sang `Paid`; trong khi đó đơn hàng ở trạng thái `Partially`. Sacombank và Vietcombank không hỗ trợ trạng thái `Partially`: đơn hàng chuyển trực tiếp từ `Pending` sang `Paid` khi nhận thanh toán.

[Xem API tạo VA](/vi/sepay-api/v2/don-hang/tao-va)

***

## Hủy đơn hàng hoặc VA

Chỉ hủy được đơn hàng `Pending` và VA `Unpaid`. Response: `204 No Content`.

[Hủy đơn hàng](/vi/sepay-api/v2/don-hang/huy-don-hang) | [Hủy VA](/vi/sepay-api/v2/don-hang/huy-va)

***

## Xem thêm

* [Tạo đơn hàng (chi tiết API)](/vi/sepay-api/v2/don-hang/tao-don-hang)
* [Danh sách đơn hàng](/vi/sepay-api/v2/don-hang/danh-sach)
* [Tiền tố VA](/vi/sepay-api/v2/don-hang/tien-to-va)
* [Danh sách terminal](/vi/sepay-api/v2/tai-khoan-ngan-hang/terminal)
* [Cấu hình webhook](/vi/sepay-webhooks/bat-dau-nhanh)