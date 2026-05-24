<?php
header("Content-Type: application/json; charset=utf-8");
include_once('conexao.php');

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['viagem_id']) && isset($data['solicitante_id']) && isset($data['tipo_vaga'])) {
    $viagem_id = $data['viagem_id'];
    $passageiro_id = $data['solicitante_id'];
    $tipo_vaga = $data['tipo_vaga'];

    $check = $conexao->prepare("SELECT id FROM solicitacao_viagem WHERE viagem_id = ? AND passageiro_id = ?");
    $check->bind_param("ii", $viagem_id, $passageiro_id);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["status" => "erro", "mensagem" => "Você já possui uma solicitação ativa nesta carona!"]);
        $check->close();
        $conexao->close();
        exit;
    }
    $check->close();

    $stmtVagas = $conexao->prepare("SELECT capacidade, tipoCarona FROM grupo_viagem WHERE id = ?");
    $stmtVagas->bind_param("i", $viagem_id);
    $stmtVagas->execute();
    $resVagas = $stmtVagas->get_result()->fetch_assoc();
    $stmtVagas->close();

    if ($resVagas && !is_null($resVagas['capacidade']) && $tipo_vaga === 'passageiro') {
        $capacidadeMaxima = (int)$resVagas['capacidade'];

        $stmtCont = $conexao->prepare("
            SELECT COUNT(*) AS total FROM solicitacao_viagem 
            WHERE viagem_id = ? AND tipo_vaga = 'passageiro' AND status = 'aceito'
        ");
        $stmtCont->bind_param("i", $viagem_id);
        $stmtCont->execute();
        $totalAceitos = (int)$stmtCont->get_result()->fetch_assoc()['total'];
        $stmtCont->close();

        if ($resVagas['tipoCarona'] === 'passageiro') {
            $totalAceitos += 1;
        }

        if ($totalAceitos >= $capacidadeMaxima) {
            echo json_encode([
                "status" => "vagas_esgotadas", 
                "mensagem" => "Não foi possível solicitar entrada: carona sem vagas disponíveis"
            ]);
            $conexao->close();
            exit;
        }
    }

    $stmt = $conexao->prepare("INSERT INTO solicitacao_viagem (viagem_id, passageiro_id, tipo_vaga, status) VALUES (?, ?, ?, 'pendente')");
    $stmt->bind_param("iis", $viagem_id, $passageiro_id, $tipo_vaga);

    if ($stmt->execute()) {
        echo json_encode(["status" => "ok", "mensagem" => "Solicitação como $tipo_vaga enviada com sucesso!"]);
    } else {
        echo json_encode(["status" => "erro", "mensagem" => "Erro ao processar no banco de dados."]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "erro", "mensagem" => "Dados incompletos para a solicitação."]);
}

$conexao->close();
?>