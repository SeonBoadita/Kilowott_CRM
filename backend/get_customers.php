<?php
header('Content-Type: application/json');
require_once '../config/api_keys.php';

$ch = curl_init(WC_STORE_URL . '/wp-json/wc/v3/customers');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, WC_CONSUMER_KEY . ':' . WC_CONSUMER_SECRET);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 

$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>