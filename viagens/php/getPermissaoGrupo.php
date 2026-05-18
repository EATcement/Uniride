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

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'ID inválido']);
    exit;
}

$id_logado = (int) $_SESSION['usuario_id'];
$id_grupo  = (int) $_GET['id'];

//Busca dados do grupo 
$stmt = $conexao->prepare("SELECT usuario_id, tipoCarona FROM grupo_viagem WHERE id = ?");
$stmt->bind_param("i", $id_grupo);
$stmt->execute();
$grupo = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$grupo) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Grupo não encontrado']);
    exit;
}

$eh_criador = ((int)$grupo['usuario_id'] === $id_logado);

// Motorista aceito no grupo
$stmt2 = $conexao->prepare("
    SELECT id FROM solicitacao_viagem
    WHERE viagem_id = ? AND passageiro_id = ? AND tipo_vaga = 'motorista' AND status = 'aceito'
    LIMIT 1
");
$stmt2->bind_param("ii", $id_grupo, $id_logado);
$stmt2->execute();
$eh_motorista_aceito = ($stmt2->get_result()->num_rows > 0);
$stmt2->close();

//Passageiro aceito
$stmt3 = $conexao->prepare("
    SELECT id FROM solicitacao_viagem
    WHERE viagem_id = ? AND passageiro_id = ? AND tipo_vaga = 'passageiro' AND status = 'aceito'
    LIMIT 1
");
$stmt3->bind_param("ii", $id_grupo, $id_logado);
$stmt3->execute();
$eh_passageiro_aceito = ($stmt3->get_result()->num_rows > 0);
$stmt3->close();


$criador_eh_motorista_do_grupo = $eh_criador && ($grupo['tipoCarona'] === 'motorista');

//Determina o perfil de edição
if ($eh_criador && ($eh_motorista_aceito || $criador_eh_motorista_do_grupo)) {
    $papel                        = 'criador_motorista';
    $pode_editar_basico           = true;
    $pode_editar_preco_capacidade = true;
} elseif ($eh_criador) {
    $papel                        = 'criador';
    $pode_editar_basico           = true;
    $pode_editar_preco_capacidade = false;
} elseif ($eh_motorista_aceito) {
    $papel                        = 'motorista';
    $pode_editar_basico           = false;
    $pode_editar_preco_capacidade = true;
} elseif ($eh_passageiro_aceito) {
    $papel                        = 'passageiro';
    $pode_editar_basico           = false;
    $pode_editar_preco_capacidade = false;
} else {
    $papel                        = 'nenhum';
    $pode_editar_basico           = false;
    $pode_editar_preco_capacidade = false;
}

$conexao->close();

echo json_encode([
    'status'                       => 'ok',
    'papel'                        => $papel,
    'pode_editar_basico'           => $pode_editar_basico,
    'pode_editar_preco_capacidade' => $pode_editar_preco_capacidade
]);
?>
