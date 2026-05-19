<?php
include_once('../../php/conexao.php'); 
session_start();

if (!isset($_SESSION['usuario'])) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Não logado']);
    exit;
}

$id_usuario = $_SESSION['usuario'][0]['id_usuario'];

if (isset($_FILES['foto'])) {
    $arquivo = $_FILES['foto'];
    
    if ($arquivo['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Erro interno no upload da imagem.']);
        exit;
    }

    $extensao = strtolower(pathinfo($arquivo['name'], PATHINFO_EXTENSION));
 
    $nomeNovo = "perfil_" . $id_usuario . "_" . time() . "." . $extensao;
    
    $pastaDestino = __DIR__ . "/../../a-fotos-usuarios/";

    if (!file_exists($pastaDestino)) {
        mkdir($pastaDestino, 0777, true);
    }

    $caminhoDestino = $pastaDestino . $nomeNovo;

    if (move_uploaded_file($arquivo['tmp_name'], $caminhoDestino)) {

        $sql = "UPDATE usuario SET foto_perfil = ? WHERE id_usuario = ?";
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("si", $nomeNovo, $id_usuario);
        $stmt->execute();

        echo json_encode(['status' => 'ok', 'nome_arquivo' => $nomeNovo]);
    } else {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Erro de permissão. Tentou salvar em: ' . $caminhoDestino]);
    }
} else {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Nenhum arquivo recebido pelo servidor.']);
}
?>