<?php
header("Content-Type: application/json; charset=utf-8");
session_start();
include_once('../../php/conexao.php'); 

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Não logado']);
    exit;
}

$id_logado = (int)$_SESSION['usuario_id'];

$sql = "SELECT 
            v.titulo AS titulo_viagem, 
            v.usuario_id AS criador_id,
            u_criador.nome AS nome_criador,
            u_passageiro.nome AS nome_membro,
            v.tipoCarona,
            s.tipo_vaga
        FROM solicitacao_viagem s
        JOIN viagem v ON s.viagem_id = v.id
        JOIN usuario u_passageiro ON s.passageiro_id = u_passageiro.id_usuario
        JOIN usuario u_criador ON v.usuario_id = u_criador.id_usuario
        WHERE v.id IN (
            SELECT DISTINCT v2.id 
            FROM viagem v2
            LEFT JOIN solicitacao_viagem s2 ON v2.id = s2.viagem_id
            WHERE v2.usuario_id = ? OR (s2.passageiro_id = ? AND s2.status = 'aceito')
        ) 
        AND s.status = 'aceito'
        ORDER BY v.titulo";

$stmt = $conexao->prepare($sql);
$stmt->bind_param("ii", $id_logado, $id_logado);
$stmt->execute();
$resultado = $stmt->get_result();

$grupos = [];
while ($linha = $resultado->fetch_assoc()) {
    $id_viagem = $linha['id_viagem'] ?? $linha['criador_id'] . '_' . $linha['titulo_viagem']; 
    $chave_grupo = $linha['criador_id'] . '_' . $linha['titulo_viagem'];

    if (!isset($grupos[$chave_grupo])) {
        $criadorEhMotorista = ($linha['tipoCarona'] === 'motorista');
        
        $grupos[$chave_grupo] = [
            "titulo" => $linha['titulo_viagem'], // Guardamos o título aqui dentro agora
            "sou_dono" => ((int)$linha['criador_id'] === $id_logado),
            "responsavel" => $linha['nome_criador'],
            "papel_responsavel" => $criadorEhMotorista ? "Motorista" : "Organizador (Passageiro)",
            "motorista" => $criadorEhMotorista ? $linha['nome_criador'] : "Sem motorista",
            "passageiros" => []
        ];
    }
    
    if ($linha['tipo_vaga'] === 'motorista') {
        $grupos[$chave_grupo]["motorista"] = $linha['nome_membro'];
    } else {
        if (!in_array($linha['nome_membro'], $grupos[$chave_grupo]["passageiros"])) {
            $grupos[$chave_grupo]["passageiros"][] = $linha['nome_membro'];
        }
    }
}

$stmt->close();
$conexao->close();

echo json_encode(['status' => 'ok', 'data' => array_values($grupos)]);
?>