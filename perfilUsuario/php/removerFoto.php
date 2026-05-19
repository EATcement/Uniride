<?php
include_once('../../php/conexao.php'); 
session_start();

if (!isset($_SESSION['usuario'])) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Não logado']);
    exit;
}

$id_usuario = $_SESSION['usuario'][0]['id_usuario'];

$sqlBusca = "SELECT foto_perfil FROM usuario WHERE id_usuario = ?";
$stmtBusca = $conexao->prepare($sqlBusca);
$stmtBusca->bind_param("i", $id_usuario);
$stmtBusca->execute();
$resultado = $stmtBusca->get_result();

if ($resultado->num_rows > 0) {
    $dados = $resultado->fetch_assoc();
    $fotoAntiga = $dados['foto_perfil'];
    
    if (!empty($fotoAntiga)) {
        $caminhoArquivo = __DIR__ . "/../../a-fotos-usuarios/" . $fotoAntiga;

        if (file_exists($caminhoArquivo)) {
            unlink($caminhoArquivo);
        }
    }
}
$stmtBusca->close();

$sqlScript = "UPDATE usuario SET foto_perfil = NULL WHERE id_usuario = ?";
$stmtUpdate = $conexao->prepare($sqlScript);
$stmtUpdate->bind_param("i", $id_usuario);

if ($stmtUpdate->execute()) {
    echo json_encode(['status' => 'ok', 'mensagem' => 'Foto removida com sucesso.']);
} else {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro ao limpar o banco de dados.']);
}

$stmtUpdate->close();
$conexao->close();
?>