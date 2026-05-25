<?php
include_once('conexao.php');

header("Content-Type: application/json; charset=utf-8");

$retorno = [
    'status'   => '',
    'mensagem' => '',
    'isAdmin'  => false,
    'data'     => []
];

$email = $_POST['email'] ?? '';
$senha = $_POST['senha'] ?? '';

$stmtAdm = $conexao->prepare("SELECT * FROM administrador WHERE email = ?");
$stmtAdm->bind_param("s", $email);
$stmtAdm->execute();
$resAdm = $stmtAdm->get_result();

if ($resAdm->num_rows > 0) {
    $adm = $resAdm->fetch_assoc();

    if ($senha === $adm['senha']) {

        if (session_status() === PHP_SESSION_NONE) session_start();

        $_SESSION['isAdmin']  = true;
        $_SESSION['admin_id'] = $adm['id_adm'];
        $_SESSION['admin_nome'] = $adm['nome'];

        $retorno = [
            'status'   => 'ok',
            'mensagem' => 'Admin logado com sucesso.',
            'isAdmin'  => true,
            'data'     => [['nome' => $adm['nome'], 'email' => $adm['email']]]
        ];
    } else {
        $retorno = [
            'status'   => 'nok',
            'mensagem' => 'Senha incorreta.',
            'isAdmin'  => false,
            'data'     => []
        ];
    }

    $stmtAdm->close();
    $conexao->close();
    echo json_encode($retorno);
    exit;
}
$stmtAdm->close();

$stmt = $conexao->prepare("SELECT * FROM usuario WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    $dadosUsuario = $resultado->fetch_assoc();

    if ($senha === $dadosUsuario['senha']) {

        if (session_status() === PHP_SESSION_NONE) session_start();

        $tabelaOriginal = [[
            'id_usuario' => $dadosUsuario['id_usuario'],
            'nome'       => $dadosUsuario['nome'],
            'email'      => $dadosUsuario['email'],
            'motorista'  => $dadosUsuario['motorista']
        ]];

        $_SESSION['usuario']    = $tabelaOriginal;
        $_SESSION['email']      = $dadosUsuario['email'];
        $_SESSION['usuario_id'] = $dadosUsuario['id_usuario'];
        $_SESSION['motorista']  = (int)$dadosUsuario['motorista'];
        $_SESSION['isAdmin']    = false;

        $retorno = [
            'status'   => 'ok',
            'mensagem' => 'Sucesso, logado com sucesso.',
            'isAdmin'  => false,
            'data'     => $tabelaOriginal
        ];
    } else {
        $retorno = [
            'status'   => 'nok',
            'mensagem' => 'Senha incorreta.',
            'isAdmin'  => false,
            'data'     => []
        ];
    }
} else {
    $retorno = [
        'status'   => 'nok',
        'mensagem' => 'Usuário não encontrado.',
        'isAdmin'  => false,
        'data'     => []
    ];
}

$stmt->close();
$conexao->close();

echo json_encode($retorno);
exit;