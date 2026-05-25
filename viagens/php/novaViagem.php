<?php

header("Content-type: application/json; charset=utf-8");
session_start();
include_once('../../php/conexao.php');

$retorno = [
    'status'   => '',
    'mensagem' => '',
    'data'     => []
];


if (!isset($_SESSION['usuario_id'])) {

    if (isset($_SESSION['usuario'][0])) {
        $usuario_id = (int) $_SESSION['usuario'][0]['id_usuario'];
    } else {
        $retorno['status']   = 'nok';
        $retorno['mensagem'] = 'Usuário não autenticado.';
        echo json_encode($retorno);
        exit;
    }
} else {
    $usuario_id = (int) $_SESSION['usuario_id'];
}


$titulo          = $_POST['titulo']          ?? '';
$descricao       = $_POST['descricao']       ?? '';
$dataHora        = ($_POST['dataHora']       ?? '') ?: null;
$pontoPartida    = $_POST['pontoPartida']    ?? '';
$pontoChegada    = $_POST['pontoChegada']    ?? '';
$preco           = isset($_POST['preco'])    ? (float)$_POST['preco']    : 0;
$tipoCarona      = $_POST['tipoCarona']      ?? 'passageiro';
$tipoRecorrencia = $_POST['tipoRecorrencia'] ?? 'avulsa';


$capacidade = isset($_POST['capacidade']) && $_POST['capacidade'] !== ''
              ? (int)$_POST['capacidade']
              : null;

$veiculo_id = isset($_POST['veiculo_id']) && is_numeric($_POST['veiculo_id'])
              ? (int)$_POST['veiculo_id']
              : null;


if ($tipoCarona === 'motorista') {

    // adicionado filtro para que não se possa criar uma oferta sem selecionar um veiculo.
    if ($veiculo_id === null) {
        $retorno['status']   = 'nok';
        $retorno['mensagem'] = 'Selecione um veículo para criar uma oferta de carona.';
        echo json_encode($retorno);
        exit;
    }

    if ($capacidade !== null) {
        $stmtCapVeic = $conexao->prepare("SELECT capacidade FROM veiculo WHERE id = ? AND usuario_id = ?");
        $stmtCapVeic->bind_param("ii", $veiculo_id, $usuario_id);
        $stmtCapVeic->execute();
        $rowCapVeic = $stmtCapVeic->get_result()->fetch_assoc();
        $stmtCapVeic->close();

        if ($rowCapVeic && $capacidade > (int)$rowCapVeic['capacidade']) {
            $retorno['status']   = 'nok';
            $retorno['mensagem'] = "Capacidade $capacidade excede a do veículo selecionado ({$rowCapVeic['capacidade']} lugares).";
            echo json_encode($retorno);
            exit;
        }
    }
}


$stmt = $conexao->prepare("
    INSERT INTO grupo_viagem
        (titulo, dataHora, pontoPartida, pontoChegada, descricao,
         preco, tipoCarona, tipoRecorrencia, capacidade, veiculo_id, usuario_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");
$stmt->bind_param(
    "sssssdssiii",
    $titulo, $dataHora, $pontoPartida, $pontoChegada, $descricao,
    $preco, $tipoCarona, $tipoRecorrencia, $capacidade, $veiculo_id, $usuario_id
);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    $grupo_viagem_id = $stmt->insert_id;

    if ($tipoRecorrencia === 'recorrente' && !empty($_POST['dias'])) {
        $hora        = $_POST['hora']        ?? '';
        $data_inicio = $_POST['data_inicio'] ?? '';

        $stmtRec = $conexao->prepare("
            INSERT INTO viagem_recorrencia (dia_semana, hora, data_inicio, viagem_id)
            VALUES (?, ?, ?, ?)
        ");

        foreach ($_POST['dias'] as $dia) {
            $diaInt = (int)$dia;
            $stmtRec->bind_param("issi", $diaInt, $hora, $data_inicio, $grupo_viagem_id);
            $stmtRec->execute();
        }
        $stmtRec->close();
    }

    $retorno = [
        'status'   => 'ok',
        'mensagem' => 'Grupo de viagem criado com sucesso!',
        'data'     => ['id' => $grupo_viagem_id]
    ];
} else {
    $retorno = [
        'status'   => 'nok',
        'mensagem' => 'Não foi possível criar o grupo de viagem.',
        'data'     => []
    ];
}

$stmt->close();
$conexao->close();
echo json_encode($retorno);
?>