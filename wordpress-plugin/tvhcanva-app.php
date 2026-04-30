<?php
/**
 * Plugin Name: TVHCanva React App
 * Description: Embed React landing page via shortcode [tvhcanva_app]
 * Version: 1.0.0
 * Author: TVHCanva
 */

if (!defined('ABSPATH')) exit;

define('TVHCANVA_PLUGIN_URL', plugin_dir_url(__FILE__));
define('TVHCANVA_PLUGIN_PATH', plugin_dir_path(__FILE__));

function tvhcanva_enqueue_assets() {
    $manifest_path = TVHCANVA_PLUGIN_PATH . 'dist/.vite/manifest.json';
    if (!file_exists($manifest_path)) return;

    $manifest = json_decode(file_get_contents($manifest_path), true);
    $entry = $manifest['index.html'] ?? null;
    if (!$entry) return;

    if (!empty($entry['css'])) {
        foreach ($entry['css'] as $i => $css) {
            wp_enqueue_style('tvhcanva-css-' . $i, TVHCANVA_PLUGIN_URL . 'dist/' . $css, [], '1.0.0');
        }
    }
    if (!empty($entry['file'])) {
        wp_enqueue_script('tvhcanva-js', TVHCANVA_PLUGIN_URL . 'dist/' . $entry['file'], [], '1.0.0', true);
        add_filter('script_loader_tag', function($tag, $handle) {
            if ($handle === 'tvhcanva-js') {
                return str_replace('<script ', '<script type="module" ', $tag);
            }
            return $tag;
        }, 10, 2);
    }
}

function tvhcanva_shortcode($atts) {
    tvhcanva_enqueue_assets();
    return '<div id="root" style="min-height:100vh"></div>';
}
add_shortcode('tvhcanva_app', 'tvhcanva_shortcode');

function tvhcanva_remove_theme_wrap($content) {
    if (is_page() && has_shortcode($content, 'tvhcanva_app')) {
        echo '<style>body > *:not(#root):not(script):not(style){display:none!important}body{margin:0;padding:0}</style>';
    }
    return $content;
}
add_filter('the_content', 'tvhcanva_remove_theme_wrap', 1);
