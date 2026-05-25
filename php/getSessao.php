<?php
header("Content-Type: application/json; charset=utf-8");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$retorno = [
    'logado'      => false,
    'id'          => null,
    'nome'        => '',
    'isMotorista' => 0,
    'isAdmin'     => false
];

// ── Admin logado ───────────────────────────────────────────────────────────
if (!empty($_SESSION['isAdmin']) && $_SESSION['isAdmin'] === true) {
    $retorno['logado']   = true;
    $retorno['isAdmin']  = true;
    $retorno['id']       = (int)$_SESSION['admin_id'];
    $retorno['nome']     = $_SESSION['admin_nome'] ?? 'Admin';
    echo json_encode($retorno);
    exit;
}

// ── Usuário comum logado ───────────────────────────────────────────────────
if (isset($_SESSION['usuario_id'])) {
    $retorno['logado']      = true;
    $retorno['isAdmin']     = false;
    $retorno['id']          = (int)$_SESSION['usuario_id'];
    $retorno['isMotorista'] = isset($_SESSION['motorista']) ? (int)$_SESSION['motorista'] : 0;

    if (isset($_SESSION['usuario_nome'])) {
        $retorno['nome'] = $_SESSION['usuario_nome'];
    } elseif (isset($_SESSION['usuario'][0]['nome'])) {
        $retorno['nome'] = $_SESSION['usuario'][0]['nome'];
    } else {
        $retorno['nome'] = 'Usuário';
    }
}

echo json_encode($retorno);
exit;
?>