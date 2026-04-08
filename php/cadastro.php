<?php
    include_once('conexao.php');

    $retorno = [
        'status' => '',
        'mensagem' => '',
        'data' => []
    ];

    $nome           = $_POST['nome'];
    $email          = $_POST['email'];
    $senha          = $_POST['senha'];
    $nascimento     = $_POST['nascimento'];
    $motorista      = $_POST['motorista'];

    $stmt = $conexao->prepare("INSERT INTO Usuario(nome, email, senha, nascimento, motorista) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $nome, $email, $senha, $nascimento, $motorista);
    $stmt->execute();

    if($stmt -> affected_rows > 0){
        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Registro inserido com sucesso',
            'data' => []
            ]; 

    } else {
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'ERRO: Não foi possível inserir o registro de usuário',
            'data' => [] 
        ]; 

    }

    $stmt ->close();
    $conexao ->close();
    header("Content-type: application/json;charset:utf-8");
    echo json_encode($retorno);