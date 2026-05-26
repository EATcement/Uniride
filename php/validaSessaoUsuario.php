<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header("Content-Type: application/json; charset=utf-8");

$isAdmin   = (!empty($_SESSION['isAdmin']) && $_SESSION['isAdmin'] === true);
$isUsuario = isset($_SESSION['usuario_id']);

echo json_encode(['logado' => ($isAdmin || $isUsuario)]);
exit;
?>