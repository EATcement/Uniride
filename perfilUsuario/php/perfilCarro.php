<?php
    include_once('../../php/conexao.php');

    $retorno = [
        'status' => '',
        'mensagem' => '',
        'data' => []
        
    ]; 

    session_start();
    $usuario = $_SESSION['usuario'][0];
    $usuario_id = $usuario['id_usuario'];  

    if (isset($_GET['id'])) {
        // Busca carro específico (tela de edição)
        $id = $_GET['id'];
        $stmt = $conexao->prepare("SELECT * FROM Veiculo WHERE usuario_id = ? AND id = ?");
        $stmt->bind_param("ii", $usuario_id, $id);
    } else {
        // Busca todos os carros (tabela do perfil)
        $stmt = $conexao->prepare("SELECT * FROM Veiculo WHERE usuario_id = ?");
        $stmt->bind_param("i", $usuario_id);
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