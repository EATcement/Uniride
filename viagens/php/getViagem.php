<?php
    include_once('../../php/conexao.php');

    $retorno = [
        'status' => '',
        'mensagem' => '',
        'data' => []
        
    ]; 

if (isset($_GET['id'])) {
    $id = $_GET['id'];
    $stmt = $conexao->prepare("SELECT * FROM Viagem WHERE id = ?");
    $stmt->bind_param("i", $id);

} else {
    $stmt = $conexao->prepare("SELECT * FROM Viagem");

}

    $stmt->execute();
    $resultado = $stmt->get_result();

    $tabela = [];
    if($resultado->num_rows > 0){
        while($linha = $resultado->fetch_assoc()){
            $tabela[] = $linha;
        }

        $retorno = [
            'status' => 'ok',
            'mensagem' => 'registros encontrados',
            'data' => $tabela
        ];
        
    } else {
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Não encontrou nenhum registro',
            'data' => []
        ];
    }

    $stmt->close();
    $conexao->close();

header("Content-type: application/json; charset:utf-8"); 
echo json_encode($retorno); 

?>