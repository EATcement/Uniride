<?php


header("Content-type: application/json; charset=utf-8");
session_start();
include_once('../../php/conexao.php');

$retorno = ['status' => '', 'mensagem' => '', 'data' => []];


if (!isset($_SESSION['usuario_id'])) {
    if (isset($_SESSION['usuario'][0])) {
        $_SESSION['usuario_id'] = (int)$_SESSION['usuario'][0]['id_usuario'];
    } else {
        $retorno['status']   = 'nok';
        $retorno['mensagem'] = 'Usuário não autenticado.';
        echo json_encode($retorno);
        exit;
    }
}

$usuario_id = (int) $_SESSION['usuario_id'];


if (isset($_GET['id']) && is_numeric($_GET['id'])) {
    $id   = (int)$_GET['id'];
    $stmt = $conexao->prepare("
        SELECT gv.*, vr.id AS recorrencia_id, vr.dia_semana,
               vr.hora AS hora_recorrencia, vr.data_inicio
        FROM grupo_viagem gv
        LEFT JOIN viagem_recorrencia vr ON vr.viagem_id = gv.id
        WHERE gv.id = ?
        ORDER BY vr.dia_semana
    ");

    $stmt->bind_param("i", $id);
} else {
    $stmt = $conexao->prepare("
        SELECT gv.*, vr.id AS recorrencia_id, vr.dia_semana,
               vr.hora AS hora_recorrencia, vr.data_inicio
        FROM grupo_viagem gv
        LEFT JOIN viagem_recorrencia vr ON vr.viagem_id = gv.id
        WHERE gv.usuario_id = ?
        ORDER BY gv.id, vr.dia_semana
    ");
    $stmt->bind_param("i", $usuario_id);
}

$stmt->execute();
$resultado = $stmt->get_result();

$tabela = [];
if ($resultado->num_rows > 0) {
    while ($linha = $resultado->fetch_assoc()) {
        $tabela[] = $linha;
    }
    $retorno = ['status' => 'ok', 'mensagem' => 'registros encontrados', 'data' => $tabela];
} else {
    $retorno = ['status' => 'nok', 'mensagem' => 'Não encontrou nenhum registro', 'data' => []];
}

$stmt->close();
$conexao->close();
echo json_encode($retorno);
?>
