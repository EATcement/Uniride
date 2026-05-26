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

// Mudamos para LEFT JOIN em u_passageiro para listar o grupo mesmo se não houver solicitações aprovadas ainda
$sql = "SELECT
            v.id AS id_viagem,
            v.titulo AS titulo_viagem,
            v.usuario_id AS criador_id,
            v.statusGrupo,
            u_criador.nome AS nome_criador,
            u_passageiro.nome AS nome_membro,
            v.tipoCarona,
            s.tipo_vaga,
            s.passageiro_id AS membro_id,
            s.status AS status_solicitacao
        FROM grupo_viagem v
        JOIN usuario u_criador ON v.usuario_id = u_criador.id_usuario
        LEFT JOIN solicitacao_viagem s ON s.viagem_id = v.id
        LEFT JOIN usuario u_passageiro ON s.passageiro_id = u_passageiro.id_usuario
        WHERE v.id IN (
            SELECT DISTINCT v2.id
            FROM grupo_viagem v2
            LEFT JOIN solicitacao_viagem s2 ON v2.id = s2.viagem_id
            WHERE v2.usuario_id = ?
               OR (s2.passageiro_id = ? AND s2.status IN ('aceito', 'pendente'))
        )
        ORDER BY v.titulo";

$stmt = $conexao->prepare($sql);
$stmt->bind_param("ii", $id_logado, $id_logado);
$stmt->execute();
$resultado = $stmt->get_result();

$grupos = [];
while ($linha = $resultado->fetch_assoc()) {
    $id_viagem = $linha['id_viagem'];

    if (!isset($grupos[$id_viagem])) {
        $criadorEhMotorista = ($linha['tipoCarona'] === 'motorista');

        $grupos[$id_viagem] = [
            "id"                => $linha['id_viagem'],
            "titulo"            => $linha['titulo_viagem'],
            "statusGrupo"       => $linha['statusGrupo'], // Mantido padrão banco
            "sou_dono"          => ((int)$linha['criador_id'] === $id_logado),
            "sou_motorista"     => false,
            "responsavel"       => $linha['nome_criador'],
            "papel_responsavel" => "Organizador",
            "motorista"         => $criadorEhMotorista ? $linha['nome_criador'] : "Sem motorista",
            "status_grupo"      => 'aceito', // Valor padrão para controle do dono
            "passageiros"       => [],
        ];
    }

    // Se a linha atual for a solicitação do usuário logado, atualiza o status que ele vê
    if ($linha['membro_id'] !== null && (int)$linha['membro_id'] === $id_logado) {
        $grupos[$id_viagem]["status_grupo"] = $linha['status_solicitacao'];
    }

    // Processa os membros vinculados se existirem
    if ($linha['membro_id'] !== null) {
        if ($linha['tipo_vaga'] === 'motorista' && $linha['status_solicitacao'] === 'aceito') {
            $grupos[$id_viagem]["motorista"] = $linha['nome_membro'];

            if ((int)$linha['membro_id'] === $id_logado) {
                $grupos[$id_viagem]["sou_motorista"] = true;
            }
        } elseif ($linha['tipo_vaga'] === 'passageiro' && $linha['status_solicitacao'] === 'aceito') {
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