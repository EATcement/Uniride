<?php
include_once('conexao.php');

header("Content-Type: application/json; charset=utf-8");

$retorno = [
    'status'    => '',
    'mensagem'  => '',
    'data'      => []
];

$email = $_POST['email'] ?? '';
$senha = $_POST['senha'] ?? '';

$stmt = $conexao->prepare("SELECT * FROM usuario WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$resultado = $stmt->get_result();

if($resultado->num_rows > 0){
    $dadosUsuario = $resultado->fetch_assoc();

    if ($senha === $dadosUsuario['senha']) {
        
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $tabelaOriginal = [
            [
                'id_usuario' => $dadosUsuario['id_usuario'],
                'nome'       => $dadosUsuario['nome'],
                'email'      => $dadosUsuario['email'],
                'motorista'  => $dadosUsuario['motorista']
            ]
        ];

        $_SESSION['usuario']    = $tabelaOriginal; 
        $_SESSION['email']      = $dadosUsuario['email'];
        $_SESSION['usuario_id'] = $dadosUsuario['id_usuario'];
        $_SESSION['motorista']  = (int)$dadosUsuario['motorista']; 

        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Sucesso, logado com sucesso.',
            'data'      => $tabelaOriginal
        ];
    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Senha incorreta.',
            'data'      => []
        ];
    }

} else {
    $retorno = [
        'status'    => 'nok',
        'mensagem'  => 'Usuário não encontrado.',
        'data'      => []
    ];
}

$stmt->close();
$conexao->close();

echo json_encode($retorno);
exit;