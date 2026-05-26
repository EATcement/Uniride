<?php
header("Content-Type: application/json; charset=utf-8");
session_start();
include_once('../../php/conexao.php');

$retorno = ['status' => 'nok', 'mensagem' => '', 'data' => []];

if (!isset($_SESSION['usuario_id'])) {
    if (isset($_SESSION['usuario'][0])) {
        $_SESSION['usuario_id'] = (int)$_SESSION['usuario'][0]['id_usuario'];
    } else {
        $retorno['mensagem'] = 'Sessão expirada ou usuário não autenticado.';
        echo json_encode($retorno);
        exit;
    }
}

$avaliador_id = (int)$_SESSION['usuario_id'];

$dadosJson = file_get_contents("php://input");
$dados = json_decode($dadosJson, true);

if (!$dados) {
    $retorno['mensagem'] = 'Dados inválidos ou requisição vazia.';
    echo json_encode($retorno);
    exit;
}

$viagem_instancia_id = isset($dados['viagem_instancia_id']) ? intval($dados['viagem_instancia_id']) : 0;
$tipo_vaga           = isset($dados['tipo_vaga']) ? trim($dados['tipo_vaga']) : '';
$nota                = isset($dados['nota']) ? intval($dados['nota']) : 0;
$comentario          = !empty($dados['comentario']) ? trim($dados['comentario']) : null;

if ($viagem_instancia_id <= 0 || empty($tipo_vaga) || $nota < 1 || $nota > 5) {
    $retorno['mensagem'] = 'Preencha todos os campos obrigatórios corretamente.';
    echo json_encode($retorno);
    exit;
}

try {
    $sql_busca = "
        SELECT g.usuario_id AS id_dono_grupo 
        FROM viagem_instancia vi
        JOIN grupo_viagem g ON vi.viagem_id = g.id 
        WHERE vi.id = ?
    ";
    
    $stmt_busca = $conexao->prepare($sql_busca);
    $stmt_busca->bind_param("i", $viagem_instancia_id);
    $stmt_busca->execute();
    $resultado_busca = $stmt_busca->get_result();
    
    if ($resultado_busca->num_rows === 0) {
        $retorno['mensagem'] = 'Instância de viagem não encontrada no sistema.';
        echo json_encode($retorno);
        exit;
    }
    
    $viagem = $resultado_busca->fetch_assoc();
    $id_dono_grupo = (int)$viagem['id_dono_grupo'];
    $stmt_busca->close();

    $avaliado_id = ($tipo_vaga === 'motorista') ? $avaliador_id : $id_dono_grupo;

    $sql_checa = "SELECT id FROM avaliacao WHERE avaliador_id = ? AND viagem_instancia_id = ?";
    $stmt_checa = $conexao->prepare($sql_checa);
    $stmt_checa->bind_param("ii", $avaliador_id, $viagem_instancia_id);
    $stmt_checa->execute();
    $resultado_checa = $stmt_checa->get_result();
    
    if ($resultado_checa->num_rows > 0) {
        $avaliacao_existente = $resultado_checa->fetch_assoc();
        $id_avaliacao = (int)$avaliacao_existente['id'];
        $stmt_checa->close();

        $sql_update = "UPDATE avaliacao 
                       SET tipo_vaga = ?, nota = ?, comentario = ?, avaliado_id = ? 
                       WHERE id = ?";
                       
        $stmt = $conexao->prepare($sql_update);
        
        $stmt->bind_param("sisii", $tipo_vaga, $nota, $comentario, $avaliado_id, $id_avaliacao);
        
        if ($stmt->execute()) {
            $retorno['status'] = 'ok';
            $retorno['mensagem'] = 'Avaliação atualizada com sucesso!';
        } else {
            $retorno['mensagem'] = 'Erro ao atualizar avaliação no banco de dados.';
        }
        $stmt->close();

    } else {
        $stmt_checa->close();

        $sql_insert = "INSERT INTO avaliacao (tipo_vaga, nota, comentario, avaliador_id, avaliado_id, viagem_instancia_id, tipo) 
                       VALUES (?, ?, ?, ?, ?, ?, 'avaliacao')";
                       
        $stmt = $conexao->prepare($sql_insert);
        $stmt->bind_param("sisiii", $tipo_vaga, $nota, $comentario, $avaliador_id, $avaliado_id, $viagem_instancia_id);
        
        if ($stmt->execute()) {
            $retorno['status'] = 'ok';
            $retorno['mensagem'] = 'Avaliação registrada com sucesso!';
        } else {
            $retorno['mensagem'] = 'Erro ao salvar avaliação no banco de dados.';
        }
        $stmt->close();
    }

} catch (Exception $e) {
    $retorno['mensagem'] = 'Erro interno no servidor: ' . $e->getMessage();
}

$conexao->close();
echo json_encode($retorno);
exit;