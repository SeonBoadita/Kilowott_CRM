<?php
header('Content-Type: application/json');
require_once '../config/api_keys.php';
$id = $_GET['customer_id'] ?? 0;
$ch = curl_init(WC_STORE_URL . "/wp-json/wc/v3/orders?customer=$id");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, WC_CONSUMER_KEY . ':' . WC_CONSUMER_SECRET);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
echo curl_exec($ch);
curl_close($ch);
?>