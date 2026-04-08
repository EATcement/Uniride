<?php
    include_once('../../php/conexao.php');


    $retorno = [
        'status' => '', //ok ou nok
        'mensagem' => '', // mensagem de sucesso ou erro
        'data' => [] // efetivamente o retorno
              
    ]; 


    //As variaveis que eu irei receber por $_POST, através do fetch feito em novo_evento.js;

    $titulo         = $_POST['titulo'];
    $descricao      = $_POST['descricao'];
    $dataHora       = $_POST['dataHora'];
    $pontoPartida   = $_POST['pontoPartida'];
    $pontoChegada   = $_POST['pontoChegada'];
    $preco          = $_POST['preco'];
    $tipoCarona     = $_POST['tipoCarona'];

    session_start();
    $usuario = $_SESSION['usuario'][0];
    $usuario_id = $usuario['id_usuario'];  

    $stmt = $conexao->prepare("INSERT INTO Viagem(titulo, dataHora, pontoPartida, pontoChegada, descricao, preco, tipoCarona, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssisi", $titulo, $dataHora, $pontoPartida, $pontoChegada, $descricao, $preco, $tipoCarona, $usuario_id); 
    $stmt->execute();
    
    if($stmt -> affected_rows > 0){
        $retorno = [
            'status' => 'ok', //ok ou nok
            'mensagem' => 'Registro inserido com sucesso', // mensagem de sucesso ou erro
            'data' => [] // efetivamente o retorno
            ]; 

    } else {
        $retorno = [
            'status' => 'nok', //ok ou nok
            'mensagem' => 'Não foi possível inserir o registro', // mensagem de sucesso ou erro
            'data' => [] // efetivamente o retorno
        ]; 

    }

    $stmt ->close();
    $conexao ->close();
    header("Content-type: application/json;charset:utf-8");
    echo json_encode($retorno);
?>