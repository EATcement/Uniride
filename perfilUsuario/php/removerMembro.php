<?php
header("Content-Type: application/json; charset=utf-8");
session_start();
include_once('../../php/conexao.php');

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Não logado']);
    exit;
}

$id_criador = (int)$_SESSION['usuario_id'];

$dadosInput = json_decode(file_get_contents("php://input"), true);

if (!isset($dadosInput['nome_passageiro']) || !isset($dadosInput['titulo_viagem'])) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Dados incompletos recebidos pelo PHP']);
    exit;
}

$nome_passageiro = $dadosInput['nome_passageiro'];
$titulo_viagem = $dadosInput['titulo_viagem'];

try {

    $sql = "UPDATE solicitacao_viagem s
            JOIN grupo_viagem v ON s.viagem_id = v.id
            JOIN usuario u_pass ON s.passageiro_id = u_pass.id_usuario
            SET s.status = 'recusado'
            WHERE u_pass.nome = ? 
            AND v.titulo = ? 
            AND v.usuario_id = ? 
            AND s.status = 'aceito'";

    $stmt = $conexao->prepare($sql);
    $stmt->bind_param("ssi", $nome_passageiro, $titulo_viagem, $id_criador);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0) {
        echo json_encode(['status' => 'ok', 'mensagem' => 'Membro removido com sucesso']);
    } else {
        echo json_encode([
            'status' => 'erro', 
            'mensagem' => 'Nenhum registro encontrado para atualizar. Verifique se os dados estão corretos.'
        ]);
    }
    
    $stmt->close();
} catch (Exception $e) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro interno no servidor: ' . $e->getMessage()]);
}

$conexao->close();
?>