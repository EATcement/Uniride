<?php
header("Content-Type: application/json; charset=utf-8");

session_start();

include_once('../../php/conexao.php');

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
]; 

if ($conexao->connect_error) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro de conexão']);
    exit;
}

$id_logado = isset($_SESSION['usuario_id']) ? (int)$_SESSION['usuario_id'] : 0;

if (isset($_GET['id'])) {
    $id = $_GET['id'];
    
    // ADICIONADO: v.statusGrupo != 'finalizado' na query por ID
    $sql = "SELECT v.*, 
                   vr.id AS recorrencia_id,
                   vr.dia_semana,
                   vr.hora AS hora_recorrencia,
                   vr.data_inicio,
                   (SELECT COUNT(*) FROM solicitacao_viagem s 
                    WHERE s.viagem_id = v.id AND s.status = 'aceito' AND s.tipo_vaga = 'motorista') as temMotorista,
                   (SELECT COUNT(*) FROM solicitacao_viagem sv 
                    WHERE sv.viagem_id = v.id AND sv.passageiro_id = ? AND sv.status IN ('aceito', 'pendente')) as ja_participa
            FROM grupo_viagem v
            LEFT JOIN viagem_recorrencia vr ON vr.viagem_id = v.id
            WHERE v.id = ? AND v.statusGrupo != 'finalizado'";
            
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param("ii", $id_logado, $id);
} else {
    // ADICIONADO: WHERE v.statusGrupo != 'finalizado' na listagem geral da Home
    $sql = "SELECT v.*, 
                   vr.id AS recorrencia_id,
                   vr.dia_semana,
                   vr.hora AS hora_recorrencia,
                   vr.data_inicio,
                   (SELECT COUNT(*) FROM solicitacao_viagem s 
                    WHERE s.viagem_id = v.id AND s.status = 'aceito' AND s.tipo_vaga = 'motorista') as temMotorista,
                   (SELECT COUNT(*) FROM solicitacao_viagem sv 
                    WHERE sv.viagem_id = v.id AND sv.passageiro_id = ? AND sv.status IN ('aceito', 'pendente')) as ja_participa
            FROM grupo_viagem v
            LEFT JOIN viagem_recorrencia vr ON vr.viagem_id = v.id
            WHERE v.statusGrupo != 'finalizado'
            ORDER BY v.id, vr.dia_semana";
            
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param("i", $id_logado);
}

$stmt->execute();
$resultado = $stmt->get_result();

$tabela = [];
if($resultado->num_rows > 0){
    while($linha = $resultado->fetch_assoc()){
        $linha['ja_participa'] = ((int)$linha['ja_participa'] > 0) ? 1 : 0;
        $tabela[] = $linha;
    }

    $retorno = [
        'status' => 'ok',
        'mensagem' => 'registros encontrados',
        'data' => $tabela
    ];
    
} else {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Não encontrou nenhum registro',
        'data' => []
    ];
}

$stmt->close();
$conexao->close();

echo json_encode($retorno); 
?>