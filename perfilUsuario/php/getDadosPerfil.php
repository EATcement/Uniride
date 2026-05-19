<?php
    include_once('../../php/conexao.php');
    session_start();

    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Erro desconhecido',
        'data' => null
    ]; 

    if (!isset($_SESSION['usuario'])) {
        $retorno['mensagem'] = 'Sessão expirada ou usuário não autenticado';
        header("Content-type: application/json; charset=utf-8"); 
        echo json_encode($retorno);
        exit;
    }



$usuario = $_SESSION['usuario'][0];
$usuario_id = $usuario['id_usuario'];  

$sql = "
    SELECT u.nome, u.email, u.senha, u.nascimento, u.motorista, u.foto_perfil, m.numeroRegistro
    FROM usuario u
    LEFT JOIN motorista m ON u.id_usuario = m.usuario_id
    WHERE u.id_usuario = ?
    LIMIT 1
";

$stmt = $conexao->prepare($sql);
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $dados = $resultado->fetch_assoc();
        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Dados recuperados com sucesso',
            'data' => $dados
        ];
    } else {
        $retorno['mensagem'] = 'Nenhum dado encontrado para o ID fornecido';
    }

    $stmt->close();
    $conexao->close();

    header("Content-type: application/json; charset=utf-8"); 
    echo json_encode($retorno); 
?>