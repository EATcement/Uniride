<?php
header("Content-Type: application/json; charset=utf-8");
session_start();
include_once('../../php/conexao.php');

$retorno = ['status' => 'nok', 'dados' => null];

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode($retorno);
    exit;
}

$avaliador_id = (int)$_SESSION['usuario_id'];
$viagem_instancia_id = isset($_GET['viagem_instancia_id']) ? (int)$_GET['viagem_instancia_id'] : 0;

if ($viagem_instancia_id > 0) {
    // Busca se já existe uma avaliação desse usuário para essa instância de viagem
    $sql = "SELECT id, nota, comentario, tipo_vaga 
            FROM avaliacao 
            WHERE avaliador_id = ? AND viagem_instancia_id = ?";
            
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param("ii", $avaliador_id, $viagem_instancia_id);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $retorno['status'] = 'ok';
        $retorno['dados'] = $resultado->fetch_assoc(); // Traz a nota e o comentário antigos
    }
    $stmt->close();
}

$conexao->close();
echo json_encode($retorno);