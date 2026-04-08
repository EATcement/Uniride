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
    $stmt = $conexao->prepare("DELETE FROM Viagem WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();

    if($stmt -> affected_rows > 0){
        $retorno = [
            'status' => 'ok', //ok ou nok
            'mensagem' => 'Registro excluído com sucesso', // mensagem de sucesso ou erro
            'data' => [] // efetivamente o retorno
            ]; 

    } else {
        $retorno = [
            'status' => 'nok', //ok ou nok
            'mensagem' => 'Não foi possível excluir o registro', // mensagem de sucesso ou erro
            'data' => [] // efetivamente o retorno
        ]; 
    }

    $stmt->close();

} else {
    $retorno = [
        'status' => 'nok', //ok ou nok
        'mensagem' => 'É necessário informar o ID para excluir', // mensagem de sucesso ou erro
        'data' => [] // efetivamente o retorno
        
    ]; }

    $conexao ->close();
    header("Content-type: application/json;charset:utf-8");
    echo json_encode($retorno);
?>