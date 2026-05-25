<?php
/**
 * Plugin Name: AV Headless — CORS & Revalidation
 * Description: CORS headers for headless frontend + webhook on post publish.
 * Version: 1.0
 */

/* ── CORS ──────────────────────────────────────────── */

add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        $origin = get_http_origin();
        $allowed = [
            'https://blog.avdesignintl.com',
            'https://www.avdesignintl.com',
            'http://localhost:3000',
        ];
        if (in_array($origin, $allowed)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: Authorization, X-WP-Nonce, Content-Type');
        }
        return $value;
    });
});

/* ── Harden REST API ──────────────────────────────── */

add_filter('rest_endpoints', function ($endpoints) {
    if (isset($endpoints['/wp/v2/users'])) {
        unset($endpoints['/wp/v2/users']);
    }
    return $endpoints;
});

/* ── Webhook revalidation ─────────────────────────── */

define('AV_REVALIDATION_SECRET', 'change-this-to-your-actual-secret');

add_action('publish_post', 'av_send_revalidation', 10, 2);
add_action('post_updated', 'av_send_revalidation', 10, 3);

function av_send_revalidation($post_id, $post, $update = null) {
    if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
        return;
    }

    $secret  = AV_REVALIDATION_SECRET;
    $slug    = get_post_field('post_name', $post_id);
    $site_url = 'https://blog.avdesignintl.com';

    // Revalidate single post
    $payload = json_encode([
        'secret' => $secret,
        'slug'   => $slug,
        'type'   => $update ? 'update' : 'new',
    ]);

    wp_remote_post($site_url . '/api/revalidate', [
        'headers' => [
            'Content-Type' => 'application/json',
            'X-Webhook-Signature' => hash_hmac('sha256', $payload, $secret),
        ],
        'body'    => $payload,
        'timeout' => 30,
    ]);

    // Also revalidate blog home
    $home_payload = json_encode([
        'secret' => $secret,
        'type'   => 'home',
    ]);

    wp_remote_post($site_url . '/api/revalidate', [
        'headers' => [
            'Content-Type' => 'application/json',
            'X-Webhook-Signature' => hash_hmac('sha256', $home_payload, $secret),
        ],
        'body'    => $home_payload,
        'timeout' => 30,
    ]);
}
