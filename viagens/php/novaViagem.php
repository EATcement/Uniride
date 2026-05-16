<?php
    include_once('../../php/conexao.php');

    $retorno = [
        'status' => '',
        'mensagem' => '',
        'data' => []
    ];

    $titulo          = $_POST['titulo'];
    $descricao       = $_POST['descricao'];
    $dataHora        = $_POST['dataHora'] ?: null;
    $pontoPartida    = $_POST['pontoPartida'];
    $pontoChegada    = $_POST['pontoChegada'];
    $preco           = $_POST['preco'];
    $tipoCarona      = $_POST['tipoCarona'];
    $tipoRecorrencia = $_POST['tipoRecorrencia'];

    session_start();
    $usuario    = $_SESSION['usuario'][0];
    $usuario_id = $usuario['id_usuario'];

    $stmt = $conexao->prepare("INSERT INTO grupo_viagem(titulo, dataHora, pontoPartida, pontoChegada, descricao, preco, tipoCarona, tipoRecorrencia, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssdssi", $titulo, $dataHora, $pontoPartida, $pontoChegada, $descricao, $preco, $tipoCarona, $tipoRecorrencia, $usuario_id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        $grupo_viagem_id = $stmt->insert_id;

        if ($tipoRecorrencia === 'recorrente' && isset($_POST['dias'])) {
            $hora        = $_POST['hora'];
            $data_inicio = $_POST['data_inicio'];

            foreach ($_POST['dias'] as $dia) {
                $stmtRec = $conexao->prepare("INSERT INTO viagem_recorrencia(dia_semana, hora, data_inicio, viagem_id) VALUES (?, ?, ?, ?)");
                $stmtRec->bind_param("issi", $dia, $hora, $data_inicio, $grupo_viagem_id);
                $stmtRec->execute();
                $stmtRec->close();
            }
        }

        $retorno = [
            'status'   => 'ok',
            'mensagem' => 'Registro inserido com sucesso',
            'data'     => []
        ];
    } else {
        $retorno = [
            'status'   => 'nok',
            'mensagem' => 'Não foi possível inserir o registro',
            'data'     => []
        ];
    }

    $stmt->close();
    $conexao->close();
    header("Content-type: application/json;charset=utf-8");
    echo json_encode($retorno);
?>