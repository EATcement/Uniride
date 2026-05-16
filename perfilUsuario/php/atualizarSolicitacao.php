<?php
header("Content-Type: application/json; charset=utf-8");
include_once('../../php/conexao.php');

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id']) && isset($data['status'])) {
    $id_sol = $data['id'];
    $status = $data['status'];

    $stmt = $conexao->prepare("UPDATE solicitacao_viagem SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $status, $id_sol);

    if ($stmt->execute()) {
        echo json_encode(["status" => "ok", "mensagem" => "Status atualizado com sucesso"]);
    } else {
        echo json_encode(["status" => "erro", "mensagem" => "Erro ao atualizar banco de dados"]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "erro", "mensagem" => "Dados incompletos"]);
}

$conexao->close();
?>