<?php
    include_once('../../php/conexao.php');


    $retorno = [
        'status' => '', //ok ou nok
        'mensagem' => '', // mensagem de sucesso ou erro
        'data' => [] // efetivamente o retorno
              
    ]; 


    $placa              = $_POST['placa'];
    $marca              = $_POST['marca'];
    $modelo             = $_POST['modelo'];
    $ano                = $_POST['ano'];
    $cor                = $_POST['cor'];
    $renavam            = $_POST['renavam'];
    $capacidade         = $_POST['capacidade'];
    $gastoCombustivel   = $_POST['gastoCombustivel'];
    $categoria          = $_POST['categoria'];

    session_start();
    $usuario = $_SESSION['usuario'][0];
    $usuario_id = $usuario['id_usuario'];


    $stmt = $conexao->prepare("INSERT INTO veiculo(placa, marca, modelo, ano, cor, renavam, capacidade, gastoCombustivel, categoria, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $stmt->bind_param("ssssssidsi",$placa, $marca, $modelo, $ano, $cor, $renavam, $capacidade, $gastoCombustivel, $categoria, $usuario_id);
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