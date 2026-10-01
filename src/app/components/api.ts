import { projectId, publicAnonKey } from "/utils/supabase/info";

const SUPABASE_FN_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d3e30ca`;

export type CanvaStatus = {
  status: "Pending" | "Paid" | "Review";
  canva_link?: string;
};

/**
 * Hỏi trạng thái đơn sau khi thanh toán. Chỉ đơn Canva đã thanh toán mới kèm link.
 * Link Canva do server Supabase giữ, không có trong bundle.
 */
export async function getCanvaStatus(invoice: string): Promise<CanvaStatus> {
  const res = await fetch(
    `${SUPABASE_FN_URL}/canva-link?inv=${encodeURIComponent(invoice)}`,
    { headers: { Authorization: `Bearer ${publicAnonKey}` } },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Không tra cứu được đơn hàng");
  return data as CanvaStatus;
}

export async function submitSepayCheckout(
  productName: string,
  planLabel: string,
  name: string,
  phone: string,
  chatgptType?: string,
): Promise<true> {
  // Server tự tính giá theo bảng giá, client chỉ gửi sản phẩm + gói.

  const res = await fetch("/api/sepay-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, productName, planLabel, chatgptType }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.checkout_url || !data.fields) {
    throw new Error(data?.error || "Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ Zalo!");
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = data.checkout_url;
  form.style.display = "none";
  Object.entries(data.fields).forEach(([k, v]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = k;
    input.value = String(v);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
  return true;
}
