<?php
header("Content-Type: application/json; charset=utf-8");
session_start();
include_once('../php/conexao.php');

$usuario = $_SESSION['usuario'][0];
$usuario_id = $usuario['id_usuario'];

$grupo_viagem_id = $_GET['grupo_viagem_id'] ?? null;

if (!$grupo_viagem_id) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'ID não informado']);
    exit;
}

// verifica se é dono do grupo ou membro aceito
$stmt = $conexao->prepare("
    SELECT COUNT(*) as total
    FROM (
        SELECT usuario_id FROM grupo_viagem WHERE id = ? AND usuario_id = ?
        UNION
        SELECT passageiro_id FROM solicitacao_viagem WHERE viagem_id = ? AND passageiro_id = ? AND status = 'aceito'
    ) AS membros
");
$stmt->bind_param("iiii", $grupo_viagem_id, $usuario_id, $grupo_viagem_id, $usuario_id);
$stmt->execute();
$resultado = $stmt->get_result()->fetch_assoc();

if ($resultado['total'] > 0) {
    echo json_encode(['status' => 'ok', 'acesso' => true]);
} else {
    echo json_encode(['status' => 'nok', 'acesso' => false, 'mensagem' => 'Sem acesso a este grupo']);
}

$stmt->close();
$conexao->close();
?>