<?php

header("Content-Type: application/json; charset=utf-8");
session_start();
include_once('../../php/conexao.php');

if (!isset($_SESSION['usuario_id'])) {
    if (isset($_SESSION['usuario'][0])) {
        $_SESSION['usuario_id'] = (int)$_SESSION['usuario'][0]['id_usuario'];
    } else {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Não logado']);
        exit;
    }
}

$id_logado = (int) $_SESSION['usuario_id'];

$stmt = $conexao->prepare("
    SELECT id, marca, modelo, ano, placa, capacidade
    FROM veiculo
    WHERE usuario_id = ?
    ORDER BY marca, modelo
");
$stmt->bind_param("i", $id_logado);
$stmt->execute();
$resultado = $stmt->get_result();

$veiculos = [];
while ($linha = $resultado->fetch_assoc()) {
    $veiculos[] = $linha;
}

$stmt->close();
$conexao->close();

echo json_encode(['status' => 'ok', 'data' => $veiculos]);
?>
