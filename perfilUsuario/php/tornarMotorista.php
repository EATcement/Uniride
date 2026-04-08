<?php
    session_start();
    include_once('../../php/conexao.php');

    $retorno = [
        'status' => 'nok',
        'mensagem' => '',
        'data' => []
    ];

    if (!isset($_SESSION['usuario'])) {
        $retorno['mensagem'] = 'Usuário não autenticado.';
        echo json_encode($retorno);
        exit;
    }

    $usuario = $_SESSION['usuario'][0];
    $usuario_id = $usuario['id_usuario'];  

    $cpf            = $_POST['cpf'];
    $dataVencimento = $_POST['dataVencimento'];
    $numeroRegistro = $_POST['numeroRegistro'];

    

    $stmt1 = $conexao->prepare("INSERT INTO motorista(cpf, dataVencimento, numeroRegistro, usuario_id) VALUES (?, ?, ?, ?)");
    $stmt1->bind_param("sssi", $cpf, $dataVencimento, $numeroRegistro, $usuario_id);
    
    $stmt2 = $conexao->prepare("UPDATE usuario SET motorista = 1 WHERE id_usuario = ?");
    $stmt2->bind_param("i", $usuario_id);

    if ($stmt1->execute() && $stmt2->execute()) {
        
        $_SESSION['usuario'][0]['motorista'] = 1;

        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Agora você é um motorista cadastrado!',
            'data' => []
        ];
    } else {
        $retorno['mensagem'] = 'ERRO: Não foi possível atualizar o cadastro.';
    }

    $stmt1->close();
    $stmt2->close();
    $conexao->close();

    header("Content-type: application/json;charset=utf-8");
    echo json_encode($retorno);
?>