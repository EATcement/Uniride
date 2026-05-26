<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header("Content-Type: application/json; charset=utf-8");

$isMotorista = (
    isset($_SESSION['usuario_id']) &&
    isset($_SESSION['motorista']) &&
    (int)$_SESSION['motorista'] === 1
);

echo json_encode(['logado' => $isMotorista]);
exit;
?>