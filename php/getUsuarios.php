<?php // código (endpoint) exclusivo para admin buscar usuários
include_once('conexao.php');
header("Content-Type: application/json; charset=utf-8");

if (session_status() === PHP_SESSION_NONE) session_start();

// só administrador pode acessar esse endpoint
if (empty($_SESSION['isAdmin']) || $_SESSION['isAdmin'] !== true) {
    http_response_code(403);
    echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso negado.', 'data' => []]);
    exit;
}

$sql = "SELECT id_usuario, nome, email, nascimento, motorista, status, foto_perfil
        FROM usuario
        ORDER BY nome ASC";

$resultado = $conexao->query($sql);

$usuarios = [];
while ($linha = $resultado->fetch_assoc()) {
    $usuarios[] = $linha;
}

$conexao->close();

echo json_encode(['status' => 'ok', 'data' => $usuarios]);
exit;
?>