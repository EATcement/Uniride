<?php
ob_start(); // Previne saídas acidentais de warnings que quebram o JSON
header("Content-Type: application/json; charset=utf-8");
session_start();
include_once('../../php/conexao.php');

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Não autenticado.']);
    exit;
}

$usuario_id = (int) $_SESSION['usuario_id'];
$body       = json_decode(file_get_contents("php://input"), true);
$id_grupo   = isset($body['id']) ? (int)$body['id'] : 0;

if (!$id_grupo) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'ID inválido.']);
    exit;
}

$stmt = $conexao->prepare("
    UPDATE grupo_viagem SET statusGrupo = 'finalizado'
    WHERE id = ? AND usuario_id = ?
");
$stmt->bind_param("ii", $id_grupo, $usuario_id);
$stmt->execute();

if ($stmt->errno) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro na consulta ao banco de dados.']);
} elseif ($stmt->affected_rows > 0) {
    echo json_encode(['status' => 'ok', 'mensagem' => 'Grupo finalizado com sucesso.']);
} else {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Grupo não encontrado, já finalizado ou você não tem permissão.']);
}

$stmt->close();
$conexao->close();
ob_end_flush();
?>