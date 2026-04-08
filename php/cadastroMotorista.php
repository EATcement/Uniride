<?php
    include_once('conexao.php');

    $retorno = [
        'status' => '',
        'mensagem' => '',
        'data' => []
    ];

    $dataVencimento     = $_POST['dataVencimento'];
    $numeroRegistro     = $_POST['numeroRegistro'];
    $cpf                = $_POST['cpf'];

    $stmt = $conexao->prepare("INSERT INTO Motorista(dataVencimento, numeroRegistro, cpf) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $dataVencimento, $numeroRegistro, $cpf);
    $stmt->execute();

    if($stmt -> affected_rows > 0){
        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Registro de motoristainserido com sucesso',
            'data' => []
            ]; 

    } else {
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'ERRO: Não foi possível inserir o registro de motorista',
            'data' => [] 
        ]; 

    }

    $stmt ->close();
    $conexao ->close();
    header("Content-type: application/json;charset:utf-8");
    echo json_encode($retorno);