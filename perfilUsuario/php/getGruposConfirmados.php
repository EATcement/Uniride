<?php

header("Content-Type: application/json; charset=utf-8");
session_start();
include_once('../../php/conexao.php');


if (!isset($_SESSION['usuario_id'])) {
    if (isset($_SESSION['usuario'][0])) {
        $_SESSION['usuario_id'] = (int)$_SESSION['usuario'][0]['id_usuario'];
    } else {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Não logado']);
        exit;
    }
}

$id_logado = (int) $_SESSION['usuario_id'];

// Substitua o bloco da query antiga por este:
$sql = "SELECT
            v.id AS id_viagem,
            v.titulo AS titulo_viagem,
            v.usuario_id AS criador_id,
            u_criador.nome AS nome_criador,
            u_passageiro.nome AS nome_membro,
            v.tipoCarona,
            s.tipo_vaga,
            s.passageiro_id AS membro_id,
            s.status AS status_solicitacao
        FROM solicitacao_viagem s
        JOIN grupo_viagem v ON s.viagem_id = v.id
        JOIN usuario u_passageiro ON s.passageiro_id = u_passageiro.id_usuario
        JOIN usuario u_criador ON v.usuario_id = u_criador.id_usuario
        WHERE v.id IN (
            SELECT DISTINCT v2.id
            FROM grupo_viagem v2
            LEFT JOIN solicitacao_viagem s2 ON v2.id = s2.viagem_id
            WHERE v2.usuario_id = ? 
               OR (s2.passageiro_id = ? AND s2.status IN ('aceito', 'pendente')) -- Corrigido aqui!
        )
        AND s.status IN ('aceito', 'pendente') -- Corrigido aqui!
        ORDER BY v.titulo";

$stmt = $conexao->prepare($sql);
$stmt->bind_param("ii", $id_logado, $id_logado);
$stmt->execute();
$resultado = $stmt->get_result();

$grupos = [];
while ($linha = $resultado->fetch_assoc()) {
    // Agrupamos estritamente pelo ID da viagem para NUNCA duplicar o card na tela
    $id_viagem = $linha['id_viagem']; 

    if (!isset($grupos[$id_viagem])) {
        $criadorEhMotorista = ($linha['tipoCarona'] === 'motorista');

        $grupos[$id_viagem] = [
            "id"               => $linha['id_viagem'],
            "titulo"           => $linha['titulo_viagem'],
            "sou_dono"         => ((int)$linha['criador_id'] === $id_logado),
            "sou_motorista"    => false,
            "responsavel"      => $linha['nome_criador'],
            "papel_responsavel"=> $criadorEhMotorista ? "Motorista" : "Organizador (Passageiro)",
            "motorista"        => $criadorEhMotorista ? $linha['nome_criador'] : "Sem motorista",
            "status_grupo"     => 'aceito', // Padrão inicial
            "passageiros"      => []
        ];
    }

    // Se a linha atual for referente ao usuário logado, definimos o status real dele no grupo
    if ((int)$linha['membro_id'] === $id_logado) {
        $grupos[$id_viagem]["status_grupo"] = $linha['status_solicitacao'];
    }

    // Alimenta a listagem de motorista e passageiros normalmente
    if ($linha['tipo_vaga'] === 'motorista') {
        $grupos[$id_viagem]["motorista"] = $linha['nome_membro'];

        if ((int)$linha['membro_id'] === $id_logado) {
            $grupos[$id_viagem]["sou_motorista"] = true;
        }
    } else {
        // Só adiciona na lista de passageiros se o membro já foi aceito (evita expor pendentes)
        if ($linha['status_solicitacao'] === 'aceito') {
            if (!in_array($linha['nome_membro'], $grupos[$id_viagem]["passageiros"])) {
                $grupos[$id_viagem]["passageiros"][] = $linha['nome_membro'];
            }
        }
    }
}

$stmt->close();
$conexao->close();

echo json_encode(['status' => 'ok', 'data' => array_values($grupos)]);
?>