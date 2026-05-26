<?php
header("Content-Type: application/json; charset=utf-8");
session_start();
include_once('conexao.php');

if ($conexao->connect_error) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro de conexão com o banco']);
    exit;
}

if (empty($_SESSION)) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Sessão expirada ou não logado.']);
    exit;
}

$id_alvo = isset($_GET['id_usuario']) ? (int)$_GET['id_usuario'] : 0;

$retorno = [
    'status' => 'ok',
    'data' => [
        'criadas' => [],
        'participa' => []
    ]
];

// FUNÇÃO ATUALIZADA: Pega o criador do grupo E os participantes
function getParticipantes($conn, $viagem_id) {
    $lista = [];

    // 1. Pega o CRIADOR do grupo
    $sqlCriador = "SELECT u.nome, g.tipoCarona as tipo_vaga, 'criador' as status 
                   FROM grupo_viagem g
                   INNER JOIN usuario u ON g.usuario_id = u.id_usuario
                   WHERE g.id = ?";
    if ($stmtC = $conn->prepare($sqlCriador)) {
        $stmtC->bind_param("i", $viagem_id);
        $stmtC->execute();
        $resC = $stmtC->get_result();
        if ($linhaC = $resC->fetch_assoc()) {
            $lista[] = $linhaC;
        }
        $stmtC->close();
    }

    // 2. Pega quem SOLICITOU entrada (aceitos ou pendentes)
    $sqlParts = "SELECT u.nome, sv.tipo_vaga, sv.status 
                 FROM solicitacao_viagem sv
                 INNER JOIN usuario u ON sv.passageiro_id = u.id_usuario
                 WHERE sv.viagem_id = ? AND sv.status IN ('aceito', 'pendente')";
    if ($stmtP = $conn->prepare($sqlParts)) {
        $stmtP->bind_param("i", $viagem_id);
        $stmtP->execute();
        $resP = $stmtP->get_result();
        while($linhaP = $resP->fetch_assoc()) {
            $lista[] = $linhaP;
        }
        $stmtP->close();
    }

    return $lista;
}

// 1. Busca as caronas CRIADAS
$sqlCriadas = "SELECT * FROM grupo_viagem WHERE usuario_id = ?";
if ($stmt = $conexao->prepare($sqlCriadas)) {
    $stmt->bind_param("i", $id_alvo);
    $stmt->execute();
    $resCriadas = $stmt->get_result();
    while ($linha = $resCriadas->fetch_assoc()) {
        $linha['participantes'] = getParticipantes($conexao, $linha['id']);
        $retorno['data']['criadas'][] = $linha;
    }
    $stmt->close();
} else {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro na tabela: ' . $conexao->error]);
    exit;
}

// 2. Busca as caronas que PARTICIPA
$sqlParticipa = "SELECT v.*, sv.status as status_solicitacao, sv.tipo_vaga 
                 FROM grupo_viagem v 
                 INNER JOIN solicitacao_viagem sv ON v.id = sv.viagem_id 
                 WHERE sv.passageiro_id = ? AND sv.status IN ('aceito', 'pendente')";
if ($stmt2 = $conexao->prepare($sqlParticipa)) {
    $stmt2->bind_param("i", $id_alvo);
    $stmt2->execute();
    $resParticipa = $stmt2->get_result();
    while ($linha = $resParticipa->fetch_assoc()) {
        $linha['participantes'] = getParticipantes($conexao, $linha['id']);
        $retorno['data']['participa'][] = $linha;
    }
    $stmt2->close();
} else {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro na tabela: ' . $conexao->error]);
    exit;
}

$conexao->close();
echo json_encode($retorno);
?>