<?php
header('Content-Type: application/json');
require_once '../config/database.php';

// Get JSON data from frontend
$input = file_get_contents('php://input');
$data = json_decode($input, true);

$email = $data['customer_email'] ?? ''; // Match JS key
$note = $data['note_text'] ?? '';        // Match JS key

if (empty($email) || empty($note)) {
    echo json_encode(['success' => false, 'message' => 'Missing data fields']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO customer_notes (customer_email, note_text) VALUES (?, ?)");
    $result = $stmt->execute([$email, $note]);
    
    echo json_encode(['success' => true, 'message' => 'Stored successfully']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>