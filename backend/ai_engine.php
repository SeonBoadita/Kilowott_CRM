<?php
// backend/ai_engine.php
header('Content-Type: application/json');
require_once '../config/api_keys.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

function fetch_wc_data($endpoint) {
    $ch = curl_init(WC_STORE_URL . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERPWD, WC_CONSUMER_KEY . ':' . WC_CONSUMER_SECRET);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $res = curl_exec($ch);
    curl_close($ch);
    return json_decode($res, true);
}

$customer = fetch_wc_data("/wp-json/wc/v3/customers/$id");
$orders = fetch_wc_data("/wp-json/wc/v3/orders?customer=$id");

// 1. DATA EXTRACTION
$ltv = (float)($customer['total_spent'] ?? 0);
$order_count = count($orders);
$has_pending = false;
$last_order_date = null;

if (is_array($orders) && $order_count > 0) {
    $last_order_date = $orders[0]['date_created']; // WooCommerce usually returns newest first
    foreach($orders as $o) {
        if(in_array($o['status'], ['pending', 'on-hold'])) {
            $has_pending = true;
        }
    }
}

// 2. RECENCY CALCULATION
$days_since_last = 999; 
if ($last_order_date) {
    $last_dt = new DateTime($last_order_date);
    $now = new DateTime();
    $days_since_last = $now->diff($last_dt)->format("%a");
}

// 3. THE INTELLIGENCE HEURISTICS (RFM Logic)
$insight = "New Lead"; 
$action = "Initial welcome sequence."; 
$color = "blue";

// Logic Tier: Priority Highest to Lowest
if ($has_pending) {
    // Immediate Priority: The user is stuck at checkout
    $insight = "Cart Abandoner";
    $action = "Send 10% 'Finish Purchase' code.";
    $color = "orange";
} 
else if ($ltv > 1000 || ($ltv > 500 && $order_count > 5)) {
    // High Value VIP
    $insight = "Whale / VIP";
    $action = "Priority Support + Birthday Gift.";
    $color = "purple";
}
else if ($days_since_last > 30 && $order_count > 1) {
    // Churn Risk: They used to buy, but stopped
    $insight = "Slipping Away";
    $action = "Win-back campaign required.";
    $color = "rose";
}
else if ($order_count >= 3 && $days_since_last < 7) {
    // High Frequency + Recent
    $insight = "Brand Fanatic";
    $action = "Request a Google Review.";
    $color = "emerald";
}
else if ($order_count > 0) {
    $insight = "Active Customer";
    $action = "Cross-sell related items.";
    $color = "indigo";
}

echo json_encode([
    'insight' => $insight, 
    'action' => $action, 
    'color' => $color,
    'meta' => [
        'days_last' => $days_since_last,
        'order_vol' => $order_count
    ]
]);
?>