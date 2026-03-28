<?php
// backend/get_products.php
header('Content-Type: application/json');
require_once '../config/api_keys.php';

// Fetching top 100 products from your store
$url = WC_STORE_URL . '/wp-json/wc/v3/products?per_page=100';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, WC_CONSUMER_KEY . ':' . WC_CONSUMER_SECRET);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    echo json_encode(['error' => 'API Connection Failed', 'code' => $httpCode]);
    exit;
}

echo $response;
?>