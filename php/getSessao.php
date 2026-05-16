<?php
// Garante que o navegador entenda que isso é um JSON puro, sem HTML de erro no meio
header("Content-Type: application/json; charset=utf-8");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$retorno = [
    'logado'      => false,
    'id'          => null,
    'nome'        => '',
    'isMotorista' => 0
];

// Verificamos se a sessão essencial do ID existe
if (isset($_SESSION['usuario_id'])) {
    $retorno['logado'] = true;
    $retorno['id']     = (int)$_SESSION['usuario_id'];
    
    // Pegando o motorista de forma segura
    $retorno['isMotorista'] = isset($_SESSION['motorista']) ? (int)$_SESSION['motorista'] : 0;
    
    // Tratamento seguro para o nome: se não achar 'usuario_nome', tenta buscar de dentro do array do usuário
    if (isset($_SESSION['usuario_nome'])) {
        $retorno['nome'] = $_SESSION['usuario_nome'];
    } elseif (isset($_SESSION['usuario'][0]['nome'])) {
        $retorno['nome'] = $_SESSION['usuario'][0]['nome'];
    } else {
        $retorno['nome'] = 'Usuário';
    }
}

// Retorna APENAS o JSON limpo, sem warnings atrapalhando
echo json_encode($retorno);
exit;
?>