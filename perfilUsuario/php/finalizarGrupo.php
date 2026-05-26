<?php
header("Content-Type: application/json; charset=utf-8");
session_start();
include_once('../../php/conexao.php');

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Não autenticado.']);
    exit;
}

$usuario_id = (int) $_SESSION['usuario_id'];
$body       = json_decode(file_get_contents("php://input"), true);
$id_grupo   = isset($body['id']) ? (int)$body['id'] : 0;

if (!$id_grupo) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'ID inválido.']);
    exit;
}

try {
    $stmt = $conexao->prepare("
        UPDATE grupo_viagem SET statusGrupo = 'finalizado'
        WHERE id = ? AND usuario_id = ?
    ");
    $stmt->bind_param("ii", $id_grupo, $usuario_id);
    $stmt->execute();

    if ($stmt->errno) {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Erro na consulta ao banco de dados.']);
        $stmt->close();
        exit;
    }

    if ($stmt->affected_rows > 0) {
        
        $data_hoje = date('Y-m-d');
        $hora_agora = date('H:i:s');
        
        $stmt_instancia = $conexao->prepare("
            INSERT INTO viagem_instancia (data, hora, status, viagem_id) 
            VALUES (?, ?, 'finalizada', ?)
        ");
        $stmt_instancia->bind_param("ssi", $data_hoje, $hora_agora, $id_grupo);
        $stmt_instancia->execute();
        
        $id_instancia_gerada = $conexao->insert_id;
        $stmt_instancia->close();

        echo json_encode([
            'status' => 'ok', 
            'mensagem' => 'Grupo finalizado e instância gerada com sucesso.',
            'id_instancia' => $id_instancia_gerada
        ]);

    } else {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Grupo não encontrado, já finalizado ou você não tem permissão.']);
    }

    $stmt->close();

} catch (Exception $e) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro interno: ' . $e->getMessage()]);
}

$conexao->close();
ob_end_flush();
?>