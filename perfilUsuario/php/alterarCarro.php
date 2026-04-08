<?php
    include_once('../../php/conexao.php');

    $retorno = [
        'status' => '', //ok ou nok
        'mensagem' => '', // mensagem de sucesso ou erro
        'data' => [] // efetivamente o retorno
    ]; 

    //vamos montar o select
    // 1a situação - sem receber o id por get
    // 2a situação - recebendo o id por get

if (isset($_GET['id'])) {
    $id = $_GET['id'];

    //As variaveis que eu irei receber por $_POST;
    $placa              = $_POST['placa'];
    $marca              = $_POST['marca'];
    $modelo             = $_POST['modelo'];
    $ano                = $_POST['ano'];
    $cor                = $_POST['cor'];
    $renavam            = $_POST['renavam'];
    $capacidade         = $_POST['capacidade'];
    $gastoCombustivel   = $_POST['gastoCombustivel'];
    $categoria          = $_POST['categoria'];

    $stmt = $conexao->prepare("UPDATE Veiculo SET placa = ?, marca = ?, modelo = ?, ano = ?, cor = ?, renavam = ?, capacidade = ?, gastoCombustivel = ?, categoria = ? WHERE id = ?");
    $stmt->bind_param("ssssssiiis", $placa, $marca, $modelo, $ano, $cor, $renavam, $capacidade, $gastoCombustivel, $categoria, $id);
    $stmt->execute(); //executa a query

    if($stmt -> affected_rows > 0){
        $retorno = [
            'status' => 'ok', //ok ou nok
            'mensagem' => 'Registro alterado com sucesso', // mensagem de sucesso ou erro
            'data' => [] // efetivamente o retorno
            ]; 

    } else {
        $retorno = [
            'status' => 'nok', //ok ou nok
            'mensagem' => 'Não foi possível alterar o registro', // mensagem de sucesso ou erro
            'data' => [] // efetivamente o retorno
        ]; 
    }
    $stmt ->close();

} else {
    $retorno = [
        'status' => 'nok', //ok ou nok
        'mensagem' => 'Não foi possível alterar  o registro, sem ID', // mensagem de sucesso ou erro
        'data' => [] // efetivamente o retorno
    ]; }

    $conexao ->close();
    header("Content-type: application/json;charset:utf-8");
    echo json_encode($retorno);

?>