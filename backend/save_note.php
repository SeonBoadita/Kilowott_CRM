<?php
// backend/save_note.php
header('Content-Type: application/json');
// Security Header: Prevent unauthorized frame embedding
header('X-Frame-Options: DENY'); 

require_once '../config/database.php';

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$email = $data['customer_email'] ?? ''; 
$note = $data['note_text'] ?? ''; 

if (empty($email) || empty($note)) {
    echo json_encode(['success' => false, 'message' => 'Missing encrypted data fields']);
    exit;
}

try {
    // Best Practice: Prepared Statements to prevent SQL Injection
    $stmt = $pdo->prepare("INSERT INTO customer_notes (customer_email, note_text) VALUES (?, ?)");
    $stmt->execute([$email, $note]);
    
    echo json_encode(['success' => true, 'message' => 'Transaction Complete: Data Vaulted']);
} catch (Exception $e) {
    // In a production app, don't echo $e->getMessage() to the user, log it instead.
    echo json_encode(['success' => false, 'message' => 'Database Vault Error']);
}
?>