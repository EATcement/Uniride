<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

if(isset($_SESSION['usuario'])) {
    echo json_encode([
        'status' => 'ok',
        'data'   => $_SESSION['usuario'][0]
    ]);
} else {
    echo json_encode([
        'status' => 'nok',
        'data'   => []
    ]);
}