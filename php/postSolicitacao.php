<?php
header("Content-Type: application/json; charset=utf-8");
include_once('conexao.php');

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['viagem_id']) && isset($data['solicitante_id']) && isset($data['tipo_vaga'])) {
    $viagem_id = $data['viagem_id'];
    $passageiro_id = $data['solicitante_id'];
    $tipo_vaga = $data['tipo_vaga']; // 'passageiro' ou 'motorista'

    $check = $conexao->prepare("SELECT id FROM solicitacao_viagem WHERE viagem_id = ? AND passageiro_id = ?");
    $check->bind_param("ii", $viagem_id, $passageiro_id);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["status" => "erro", "mensagem" => "Você já possui uma solicitação ativa nesta carona!"]);
    } else {
        $stmt = $conexao->prepare("INSERT INTO solicitacao_viagem (viagem_id, passageiro_id, tipo_vaga, status) VALUES (?, ?, ?, 'pendente')");
        $stmt->bind_param("iis", $viagem_id, $passageiro_id, $tipo_vaga);

        if ($stmt->execute()) {
            echo json_encode(["status" => "ok", "mensagem" => "Solicitação para $tipo_vaga enviada com sucesso!"]);
        } else {
            echo json_encode(["status" => "erro", "mensagem" => "Erro ao processar no banco de dados."]);
        }
        $stmt->close();
    }
    $check->close();
} else {
    echo json_encode(["status" => "erro", "mensagem" => "Dados incompletos para a solicitação."]);
}

$conexao->close();
?>