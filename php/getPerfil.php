<?php
include_once('conexao.php');
session_start();
header("Content-Type: application/json; charset=utf-8");

if(isset($_SESSION['usuario'])) {
    $id_usuario = $_SESSION['usuario'][0]['id_usuario'];

    // Busca o nome e a foto de perfil DIRETO DO BANCO DE DADOS
    $sql = "SELECT nome, foto_perfil FROM usuario WHERE id_usuario = ?";
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if($resultado->num_rows > 0) {
        $dados = $resultado->fetch_assoc();
        echo json_encode(['status' => 'ok', 'data' => $dados]);
    } else {
        echo json_encode(['status' => 'ok', 'data' => $_SESSION['usuario'][0]]);
    }
} else {
    echo json_encode(['status' => 'nok', 'data' => []]);
}
?>