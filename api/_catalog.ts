/**
 * BẢNG GIÁ CHÍNH THỨC — NGUỒN DUY NHẤT ĐỂ TÍNH TIỀN.
 *
 * File bắt đầu bằng dấu "_" nên Vercel KHÔNG coi đây là một API endpoint,
 * nó chỉ là module dùng chung cho các function trong /api.
 *
 * QUY TẮC: số tiền khách phải trả LUÔN lấy từ bảng này, không bao giờ
 * lấy từ dữ liệu client gửi lên. Muốn đổi giá thì sửa ở đây (và sửa giá
 * hiển thị tương ứng trong src/app/App.tsx).
 *
 * Đơn vị: VND (số nguyên).
 */
export const PRICES: Record<string, Record<string, number>> = {
  "Capcut Pro":              { "7 Ngày": 25000, "1 Tháng": 80000 },
  "Canva Pro":               { "1 Tháng": 15000, "1 Năm": 200000 },
  "Google One 5TB":          { "1 Năm": 399000 },
  "ChatGPT Plus":            { "1 Tháng (Cấp tài khoản)": 275000, "1 Tháng (Chính chủ)": 420000 },
  "Spotify Premium":         { "1 Tháng": 80000, "3 Tháng": 230000, "1 Năm": 399000 },
  "Youtube Premium":         { "1 Năm": 599000 },
  "Netflix Premium 4K":      { "1 Tháng": 85000 },
  "Office 365":              { "1 Năm": 299000 },
  "Quillbot Premium":        { "1 Năm": 299000 },
  "Grammarly Pro + AI":      { "1 Tháng": 100000 },
  "Adobe Full App":          { "1 Năm": 799000 },
  "Autodesk AutoCAD":        { "1 Năm": 299000 },
  "Figma Pro":               { "1 Tháng": 179000 },
  "Meitu Vip":               { "1 Tháng": 80000, "3 Tháng": 239000 },
  "SuperGrok":               { "1 Tháng": 199000 },
  "Leonardo AI":             { "1 Tháng": 239000 },
  "Gamma AI Pro":            { "1 Tháng": 99000 },
  "Copilot Pro":             { "1 Tháng": 129000 },
  "GenSpark Plus":           { "1 Tháng": 500000 },
  "InVideo Plus":            { "1 Tháng": 699000, "3 Tháng": 1899000, "6 Tháng": 3499000, "1 Năm": 5999000 },
  "Vidu AI":                 { "1 Tháng": 199000, "3 Tháng": 549000, "6 Tháng": 999000, "1 Năm": 1799000 },
  "Hailuo AI Pro":           { "1 Tháng": 699000, "3 Tháng": 1899000, "6 Tháng": 3499000, "1 Năm": 5999000 },
  "Suno AI":                 { "1 Tháng": 199000, "3 Tháng": 549000, "6 Tháng": 999000, "1 Năm": 1799000 },
  "Claude AI":               { "1 Tháng": 129000, "3 Tháng": 349000, "6 Tháng": 649000, "1 Năm": 1199000 },
  "Kling AI":                { "1 Tháng": 150000, "3 Tháng": 399000, "6 Tháng": 749000, "1 Năm": 1299000 },
  "HeyGen AI":               { "1 Tháng": 599000, "3 Tháng": 1599000, "6 Tháng": 2899000, "1 Năm": 4999000 },
  "Runway AI":               { "1 Tháng": 699000, "3 Tháng": 1899000, "6 Tháng": 3499000, "1 Năm": 5999000 },
  "Monica AI Unlimited":     { "1 Tháng": 199000, "3 Tháng": 549000, "6 Tháng": 999000, "1 Năm": 1799000 },
  "Minimax Audio AI":        { "1 Tháng": 299000, "3 Tháng": 799000, "6 Tháng": 1399000, "1 Năm": 2499000 },
  "Google Meet + 2TB":       { "1 Tháng": 299000, "3 Tháng": 799000, "6 Tháng": 1399000, "1 Năm": 2499000 },
  "Zoom Pro":                { "1 Tháng": 119000, "3 Tháng": 319000, "6 Tháng": 599000, "1 Năm": 999000 },
  "Linkedin Business":       { "1 Tháng": 950000, "3 Tháng": 2599000, "6 Tháng": 4799000, "1 Năm": 8499000 },
  "CamScanner":              { "1 Tháng": 399000, "3 Tháng": 1099000, "6 Tháng": 1999000, "1 Năm": 3499000 },
  "VieON VIP HBO":           { "1 Tháng": 299000, "3 Tháng": 799000, "6 Tháng": 1399000, "1 Năm": 2499000 },
  "FPT Smax":                { "1 Tháng": 199000, "3 Tháng": 539000, "6 Tháng": 999000, "1 Năm": 1799000 },
  "MyTV Sport":              { "1 Tháng": 125000, "3 Tháng": 339000, "6 Tháng": 629000, "1 Năm": 1099000 },
  "iQIYI Premium":           { "1 Tháng": 299000, "3 Tháng": 799000, "6 Tháng": 1399000, "1 Năm": 2499000 },
  "Clip TV":                 { "1 Tháng": 359000, "3 Tháng": 979000, "6 Tháng": 1799000, "1 Năm": 3199000 },
  "TV360 Super VIP":         { "1 Tháng": 125000, "3 Tháng": 339000, "6 Tháng": 629000, "1 Năm": 1099000 },
  "Galaxy Play":             { "1 Năm": 399000 },
  "Youku VIP":               { "1 Tháng": 299000, "3 Tháng": 799000, "6 Tháng": 1399000, "1 Năm": 2499000 },
  "Chess.com Diamond":       { "1 Tháng": 500000, "3 Tháng": 1399000, "6 Tháng": 2499000, "1 Năm": 4499000 },
  "Tinder Platinum":         { "1 Tháng": 450000, "3 Tháng": 1199000, "6 Tháng": 2199000, "1 Năm": 3999000 },
  "Bumble Premium":          { "1 Tháng": 450000, "3 Tháng": 1199000, "6 Tháng": 2199000, "1 Năm": 3999000 },
  "ELSA Premium":            { "1 Tháng": 1350000, "3 Tháng": 3699000, "6 Tháng": 6799000, "1 Năm": 11999000 },
  "Duolingo Super":          { "1 Tháng": 199000, "3 Tháng": 549000, "6 Tháng": 999000, "1 Năm": 1799000 },
  "Udemy Business":          { "1 Tháng": 550000, "3 Tháng": 1499000, "6 Tháng": 2799000, "1 Năm": 4999000 },
  "Coursera Plus":           { "1 Tháng": 529000, "3 Tháng": 1449000, "6 Tháng": 2699000, "1 Năm": 4799000 },
  "Quizlet":                 { "1 Tháng": 299000, "3 Tháng": 799000, "6 Tháng": 1399000, "1 Năm": 2499000 },
  "Chegg":                   { "1 Tháng": 259000, "3 Tháng": 699000, "6 Tháng": 1299000, "1 Năm": 2299000 },
  "Notion Plus":             { "1 Tháng": 799000, "3 Tháng": 2199000, "6 Tháng": 3999000, "1 Năm": 6999000 },
  "Turnitin":                { "1 Tháng": 260000, "3 Tháng": 699000, "6 Tháng": 1299000, "1 Năm": 2299000 },
  "Quizizz Super":           { "1 Tháng": 450000, "3 Tháng": 1199000, "6 Tháng": 2199000, "1 Năm": 3999000 },
  "Kahoot Silver":           { "1 Tháng": 150000, "3 Tháng": 399000, "6 Tháng": 749000, "1 Năm": 1299000 },
  "StuDocu Premium":         { "1 Tháng": 350000, "3 Tháng": 949000, "6 Tháng": 1749000, "1 Năm": 2999000 },
  "Ejoy Pro-Voca":           { "1 Tháng": 399000, "3 Tháng": 1099000, "6 Tháng": 1999000, "1 Năm": 3499000 },
  "HMA VPN":                 { "1 Tháng": 69000, "3 Tháng": 189000, "6 Tháng": 349000, "1 Năm": 599000 },
  "Express VPN":             { "1 Tháng": 69000, "3 Tháng": 189000, "6 Tháng": 349000, "1 Năm": 599000 },
  "NordVPN":                 { "1 Tháng": 69000, "3 Tháng": 189000, "6 Tháng": 349000, "1 Năm": 599000 },
  "Surfshark VPN":           { "1 Tháng": 399000, "3 Tháng": 1099000, "6 Tháng": 1999000, "1 Năm": 3499000 },
};

/** Trả về giá hợp lệ, hoặc null nếu sản phẩm/gói không tồn tại. */
export function getPrice(
  productName: unknown,
  planLabel: unknown,
): number | null {
  if (typeof productName !== "string" || typeof planLabel !== "string") return null;
  const plans = PRICES[productName.trim()];
  if (!plans) return null;
  const amount = plans[planLabel.trim()];
  return typeof amount === "number" && amount > 0 ? amount : null;
}

/** Đơn Canva Pro 1 tháng — đơn duy nhất được trả link mời Canva tự động. */
export function isCanvaOrder(productName: string, planLabel: string): boolean {
  return productName.trim() === "Canva Pro" && planLabel.trim() === "1 Tháng";
}
