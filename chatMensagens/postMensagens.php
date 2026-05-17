<?php
header("Content-Type: application/json; charset=utf-8");

session_start();
include_once('../php/conexao.php');

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

$usuario = $_SESSION['usuario'][0];
$usuario_id = $usuario['id_usuario'];

$dados = json_decode(file_get_contents('php://input'), true);

$grupo_viagem_id = $dados['grupo_viagem_id'] ?? null;
$conteudo        = $dados['conteudo'] ?? null;

if (!$grupo_viagem_id || !$conteudo) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Dados incompletos']);
    exit;
}

$stmt = $conexao->prepare("
    INSERT INTO mensagem(conteudo, viagem_id, usuario_id)
    VALUES (?, ?, ?)
");
$stmt->bind_param("sii", $conteudo, $grupo_viagem_id, $usuario_id);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    $retorno = ['status' => 'ok', 'mensagem' => 'Mensagem enviada'];
} else {
    $retorno = ['status' => 'nok', 'mensagem' => 'Erro ao enviar mensagem'];
}

$stmt->close();
$conexao->close();
echo json_encode($retorno);
?>