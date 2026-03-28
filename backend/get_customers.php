<?php
// backend/get_customers.php
header('Content-Type: application/json');
require_once '../config/api_keys.php';

// We increase per_page to 100 so your dashboard looks "Big Data" ready for the demo
$url = WC_STORE_URL . '/wp-json/wc/v3/customers?per_page=100&role=all';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, WC_CONSUMER_KEY . ':' . WC_CONSUMER_SECRET);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    echo json_encode([
        'error' => true, 
        'message' => 'WooCommerce API Connection Failed', 
        'code' => $httpCode
    ]);
    exit;
}

// Return the raw JSON from WooCommerce
echo $response;
?>