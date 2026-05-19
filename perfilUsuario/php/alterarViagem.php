<?php

header("Content-Type: application/json; charset=utf-8");
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

//ID do grupo
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    $retorno['status']   = 'nok';
    $retorno['mensagem'] = 'ID do grupo inválido ou ausente.';
    echo json_encode($retorno);
    exit;
}

$id_logado = (int) $_SESSION['usuario_id'];
$id_grupo  = (int) $_GET['id'];

// Busca dados atuais do grup
$stmt = $conexao->prepare("SELECT usuario_id, tipoCarona FROM grupo_viagem WHERE id = ?");
$stmt->bind_param("i", $id_grupo);
$stmt->execute();
$grupo = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$grupo) {
    $retorno['status']   = 'nok';
    $retorno['mensagem'] = 'Grupo de viagem não encontrado.';
    echo json_encode($retorno);
    exit;
}

//Determina permissões
$eh_criador = ((int)$grupo['usuario_id'] === $id_logado);

$stmt2 = $conexao->prepare("
    SELECT id FROM solicitacao_viagem
    WHERE viagem_id = ? AND passageiro_id = ? AND tipo_vaga = 'motorista' AND status = 'aceito'
    LIMIT 1
");
$stmt2->bind_param("ii", $id_grupo, $id_logado);
$stmt2->execute();
$eh_motorista_aceito = ($stmt2->get_result()->num_rows > 0);
$stmt2->close();

$criador_eh_motorista_do_grupo = $eh_criador && ($grupo['tipoCarona'] === 'motorista');

if ($eh_criador && ($eh_motorista_aceito || $criador_eh_motorista_do_grupo)) {
    $pode_editar_basico           = true;
    $pode_editar_preco_capacidade = true;
} elseif ($eh_criador) {
    $pode_editar_basico           = true;
    $pode_editar_preco_capacidade = false;
} elseif ($eh_motorista_aceito) {
    $pode_editar_basico           = false;
    $pode_editar_preco_capacidade = true;
} else {
    $retorno['status']   = 'nok';
    $retorno['mensagem'] = 'Sem permissão para editar este grupo.';
    echo json_encode($retorno);
    exit;
}

// Monta o UPDATE conforme permissão 
$setClauses = [];
$types      = '';
$valores    = [];

if ($pode_editar_basico) {
    $campos_obrigatorios = ['titulo', 'descricao', 'pontoPartida', 'pontoChegada'];
    foreach ($campos_obrigatorios as $campo) {
        if (empty($_POST[$campo])) {
            $retorno['status']   = 'nok';
            $retorno['mensagem'] = "Campo obrigatório ausente: $campo";
            echo json_encode($retorno);
            exit;
        }
    }

    $setClauses[] = 'titulo = ?';        $types .= 's'; $valores[] = $_POST['titulo'];
    $setClauses[] = 'descricao = ?';     $types .= 's'; $valores[] = $_POST['descricao'];
    $setClauses[] = 'pontoPartida = ?';  $types .= 's'; $valores[] = $_POST['pontoPartida'];
    $setClauses[] = 'pontoChegada = ?';  $types .= 's'; $valores[] = $_POST['pontoChegada'];

    $tipoRecorrencia  = $_POST['tipoRecorrencia'] ?? 'avulsa';
    $setClauses[] = 'tipoRecorrencia = ?'; $types .= 's'; $valores[] = $tipoRecorrencia;

 

    if ($tipoRecorrencia === 'avulsa') {
        if (empty($_POST['dataHora'])) {
            $retorno['status']   = 'nok';
            $retorno['mensagem'] = 'Data e hora são obrigatórias para viagens avulsas.';
            echo json_encode($retorno);
            exit;
        }
        $setClauses[] = 'dataHora = ?'; $types .= 's'; $valores[] = $_POST['dataHora'];
    }
}

if ($pode_editar_preco_capacidade) {
    // Preço
    if (isset($_POST['preco']) && $_POST['preco'] !== '') {
        $preco = str_replace(',', '.', $_POST['preco']);
        if (is_numeric($preco) && (float)$preco >= 0) {
            $setClauses[] = 'preco = ?'; $types .= 'd'; $valores[] = (float)$preco;
        }
    }

    // Capacidade — valida limite mínimo de passageiros já aceitos
    if (isset($_POST['capacidade']) && $_POST['capacidade'] !== '') {
        $capacidade = (int)$_POST['capacidade'];

        if ($capacidade < 1) {
            $retorno['status']   = 'nok';
            $retorno['mensagem'] = 'Capacidade deve ser pelo menos 1.';
            echo json_encode($retorno);
            exit;
        }

        $stmtCont = $conexao->prepare("
            SELECT COUNT(*) AS total FROM solicitacao_viagem
            WHERE viagem_id = ? AND tipo_vaga = 'passageiro' AND status = 'aceito'
        ");
        $stmtCont->bind_param("i", $id_grupo);
        $stmtCont->execute();
        $totalPassageiros = (int)$stmtCont->get_result()->fetch_assoc()['total'];
        $stmtCont->close();

        if ($capacidade < $totalPassageiros) {
            $retorno['status']   = 'nok';
            $retorno['mensagem'] = "Não é possível definir capacidade para $capacidade: já há $totalPassageiros passageiro(s) aceito(s) no grupo.";
            echo json_encode($retorno);
            exit;
        }

        $setClauses[] = 'capacidade = ?'; $types .= 'i'; $valores[] = $capacidade;
    }

    // Veículo
    if (!empty($_POST['veiculo_id']) && is_numeric($_POST['veiculo_id'])) {
        $veiculo_id = (int)$_POST['veiculo_id'];

        $stmtVeic = $conexao->prepare("SELECT capacidade FROM veiculo WHERE id = ? AND usuario_id = ?");
        $stmtVeic->bind_param("ii", $veiculo_id, $id_logado);
        $stmtVeic->execute();
        $veiculoRow = $stmtVeic->get_result()->fetch_assoc();
        $stmtVeic->close();

        if (!$veiculoRow) {
            $retorno['status']   = 'nok';
            $retorno['mensagem'] = 'Veículo inválido ou não pertence ao usuário.';
            echo json_encode($retorno);
            exit;
        }

        $setClauses[] = 'veiculo_id = ?'; $types .= 'i'; $valores[] = $veiculo_id;

        // Se não foi enviada capacidade manual, usa a do veículo
        if (!isset($_POST['capacidade']) || $_POST['capacidade'] === '') {
            $setClauses[] = 'capacidade = ?'; $types .= 'i'; $valores[] = (int)$veiculoRow['capacidade'];
        }
    }
}

if (empty($setClauses)) {
    $retorno['status']   = 'nok';
    $retorno['mensagem'] = 'Nenhum dado foi enviado para atualização.';
    echo json_encode($retorno);
    exit;
}

// ── 6. Executa o UPDATE ───────────────────────────────────────────────────────
$sql     = "UPDATE grupo_viagem SET " . implode(', ', $setClauses) . " WHERE id = ?";
$types  .= 'i';
$valores[] = $id_grupo;

$stmtUp = $conexao->prepare($sql);
$stmtUp->bind_param($types, ...$valores);
$stmtUp->execute();

$retorno['status']   = 'ok';
$retorno['mensagem'] = 'Grupo atualizado com sucesso!';

$stmtUp->close();
$conexao->close();
echo json_encode($retorno);
?>
