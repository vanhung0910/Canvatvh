<?php
/**
 * Paste this into Code Snippets plugin → Run everywhere → Activate
 * Endpoint: POST https://shop.tvhcanva.com/wp-json/tvh/v1/quick-order
 * Body: { name, phone, product_id, variation_id }
 * Returns: { pay_url } → redirect khách tới QR Sepay
 */

add_action('rest_api_init', function () {
    register_rest_route('tvh/v1', '/quick-order', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => 'tvh_quick_order_handler',
    ]);
});

function tvh_quick_order_handler($req) {
    $params = $req->get_json_params();
    $name = sanitize_text_field($params['name'] ?? '');
    $phone = sanitize_text_field($params['phone'] ?? '');
    $product_id = intval($params['product_id'] ?? 0);
    $variation_id = intval($params['variation_id'] ?? 0);

    if (!$name || !$phone || !$product_id) {
        return new WP_Error('missing', 'Thiếu thông tin', ['status' => 400]);
    }

    if (!class_exists('WC_Order')) {
        return new WP_Error('no_woo', 'WooCommerce chưa active', ['status' => 500]);
    }

    $order = wc_create_order();
    $product = wc_get_product($variation_id ?: $product_id);
    if (!$product) {
        return new WP_Error('no_product', 'Sản phẩm không tồn tại', ['status' => 404]);
    }

    $order->add_product($product, 1);

    $name_parts = explode(' ', $name, 2);
    $first = $name_parts[0];
    $last  = $name_parts[1] ?? '';

    $order->set_address([
        'first_name' => $first,
        'last_name'  => $last,
        'phone'      => $phone,
        'email'      => 'guest+' . time() . '@tvhcanva.com',
        'country'    => 'VN',
    ], 'billing');

    $order->set_payment_method('sepay');
    $order->set_payment_method_title('Sepay - QR Chuyển khoản');
    $order->calculate_totals();
    $order->update_status('pending', 'Đặt hàng từ tvhcanva.com');

    $pay_url = $order->get_checkout_payment_url();

    // ====== CẤU HÌNH NGÂN HÀNG (sửa cho khớp tài khoản Sepay) ======
    $bank_bin       = '970422';        // 970422=MB, 970436=VCB, 970418=BIDV, 970416=ACB
    $bank_account   = '0123456789';    // Số TK của bạn
    $account_name   = 'NGUYEN VAN A';  // Tên chủ TK (không dấu)
    // ===============================================================

    $amount = (int) $order->get_total();
    $order_code = 'SEVQR' . $order->get_id();

    return [
        'success'      => true,
        'order_id'     => $order->get_id(),
        'pay_url'      => $pay_url,
        'amount'       => $amount,
        'content'      => $order_code,
        'bank_bin'     => $bank_bin,
        'bank_account' => $bank_account,
        'account_name' => $account_name,
    ];
}

// Cho phép CORS từ tvhcanva.com
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        $origin = get_http_origin();
        $allowed = ['https://tvhcanva.com', 'https://www.tvhcanva.com'];
        if (in_array($origin, $allowed)) {
            header("Access-Control-Allow-Origin: $origin");
            header('Access-Control-Allow-Methods: POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type');
        }
        return $value;
    });
}, 15);
