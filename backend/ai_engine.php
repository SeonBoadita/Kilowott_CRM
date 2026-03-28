<?php
header('Content-Type: application/json');
require_once '../config/api_keys.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

function fetch_wc($endpoint) {
    $ch = curl_init(WC_STORE_URL . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERPWD, WC_CONSUMER_KEY . ':' . WC_CONSUMER_SECRET);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $res = curl_exec($ch);
    curl_close($ch);
    return json_decode($res, true);
}

// 1. Fetch all orders for this specific customer
$orders = fetch_wc("/wp-json/wc/v3/orders?customer=$id");

$calculated_ltv = 0;
$has_pending = false;

// 2. MANUALLY CALCULATE the total spent right here
if (is_array($orders)) {
    foreach($orders as $o) {
        $calculated_ltv += (float)$o['total'];
        if(in_array($o['status'], ['pending', 'on-hold'])) $has_pending = true;
    }
}

// 3. Logic Tier
$insight = "New Lead"; $action = "Intro sequence."; $color = "blue";

if($calculated_ltv > 200) { 
    $insight = "Whale / VIP"; $action = "Priority Support."; $color = "purple"; 
} else if($has_pending) { 
    $insight = "Risk"; $action = "Payment Follow-up."; $color = "orange"; 
} else if(count($orders) > 1) { 
    $insight = "Loyal Fan"; $action = "Request Review."; $color = "emerald"; 
}

// 4. Return everything including the new LTV
echo json_encode([
    'insight' => $insight, 
    'action' => $action, 
    'color' => $color,
    'real_ltv' => $calculated_ltv
]);
?>