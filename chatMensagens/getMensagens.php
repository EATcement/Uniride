<?php
header("Content-Type: application/json; charset=utf-8");

session_start();
include_once('../php/conexao.php');

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

$grupo_viagem_id = $_GET['grupo_viagem_id'] ?? null;

if (!$grupo_viagem_id) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'ID do grupo não informado']);
    exit;
}

$stmt = $conexao->prepare("
    SELECT m.id, m.conteudo, m.enviado_em, u.nome
    FROM mensagem m
    JOIN usuario u ON u.id_usuario = m.usuario_id
    WHERE m.viagem_id = ?
    ORDER BY m.enviado_em ASC
");

$stmt->bind_param("i", $grupo_viagem_id);
$stmt->execute();
$resultado = $stmt->get_result();

$tabela = [];
while ($linha = $resultado->fetch_assoc()) {
    $tabela[] = $linha;
}

$retorno = [
    'status' => 'ok',
    'mensagem' => 'mensagens encontradas',
    'data' => $tabela
];

$stmt->close();
$conexao->close();
echo json_encode($retorno);
?>