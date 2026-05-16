<?php
header("Content-Type: application/json; charset=utf-8");
session_start();
include_once('conexao.php');

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Não logado']);
    exit;
}

$id_logado = $_SESSION['usuario_id'];

$sql = "SELECT 
            s.id AS solicitacao_id, 
            u.nome AS nome_passageiro, 
            v.titulo AS titulo_viagem,
            s.tipo_vaga 
        FROM solicitacao_viagem s
        JOIN viagem v ON s.viagem_id = v.id
        JOIN usuario u ON s.passageiro_id = u.id_usuario
        WHERE v.usuario_id = ? AND s.status = 'pendente'";

$stmt = $conexao->prepare($sql);
$stmt->bind_param("i", $id_logado);
$stmt->execute();
$resultado = $stmt->get_result();

$dados = [];
while ($linha = $resultado->fetch_assoc()) {
    $dados[] = $linha;
}

echo json_encode(['status' => 'ok', 'data' => $dados]);