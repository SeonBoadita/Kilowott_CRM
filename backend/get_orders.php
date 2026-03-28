<?php
// backend/get_orders.php
header('Content-Type: application/json');
require_once '../config/api_keys.php';

// 1. Sanitize the input (Security Best Practice)
$id = isset($_GET['customer_id']) ? intval($_GET['customer_id']) : 0;

if ($id === 0) {
    echo json_encode(['error' => true, 'message' => 'Invalid Customer ID']);
    exit;
}

// 2. Initialize Tunnel to WooCommerce
// We fetch the most recent orders first
$url = WC_STORE_URL . "/wp-json/wc/v3/orders?customer=$id&per_page=50";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, WC_CONSUMER_KEY . ':' . WC_CONSUMER_SECRET);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// 3. Robust Error Handling
if ($httpCode !== 200) {
    echo json_encode([
        'success' => false,
        'message' => 'API Error',
        'code' => $httpCode
    ]);
    exit;
}

// 4. Return Clean Data
echo $response;
?>