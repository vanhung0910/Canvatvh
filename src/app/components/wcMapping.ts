import { projectId, publicAnonKey } from "/utils/supabase/info";

const SUPABASE_FN_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d3e30ca`;

export type CanvaStatus = {
  status: "Pending" | "Paid";
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

export type CheckoutResult = { ok: true } | { ok: false; error: string };

/**
 * Tạo phiên thanh toán rồi submit form sang SePay.
 *
 * LƯU Ý: không còn gửi số tiền lên server nữa.
 * Server tự tra giá trong api/_catalog.ts — đây là điểm chặn lỗ hổng
 * khách tự sửa giá trong DevTools.
 */
export async function submitSepayCheckout(
  productName: string,
  planLabel: string,
  name: string,
  phone: string,
): Promise<CheckoutResult> {
  let res: Response;
  try {
    res = await fetch("/api/sepay-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, productName, planLabel }),
    });
  } catch {
    return { ok: false, error: "Không kết nối được máy chủ. Vui lòng thử lại." };
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* bỏ qua, xử lý bên dưới */
  }

  if (!res.ok) {
    return {
      ok: false,
      error: data?.error || "Không tạo được đơn hàng. Vui lòng liên hệ Zalo.",
    };
  }
  if (!data?.checkout_url || !data?.fields) {
    return { ok: false, error: "Phản hồi cổng thanh toán không hợp lệ." };
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
  return { ok: true };
}
