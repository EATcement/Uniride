<?php

include_once('conexao.php');

header("Content-Type: application/json; charset=utf-8");

$retorno = [
    'status'    => '',
    'mensagem'  => '',
    'data'      => []
];

$email = $_POST['email'] ?? '';

$stmt = $conexao->prepare("SELECT * FROM usuario WHERE email = ?");
$stmt->bind_param("s", $email);

$stmt->execute();
$resultado = $stmt->get_result();

if($resultado->num_rows > 0){

    $tabela = [];
    while($linha = $resultado->fetch_assoc()){
        $tabela[] = $linha;
    }

    session_start();
    $_SESSION['email'] = $tabela[0]['email']; // só o e-mail
    $_SESSION['usuario'] = $tabela;           // array de arrays


    $retorno = [
        'status'    => 'ok',
        'mensagem'  => 'Sucesso, consulta efetuada.',
        'data'      => $tabela
    ];

}else{
    $retorno = [
        'status'    => 'nok',
        'mensagem'  => 'Não há registros',
        'data'      => []
    ];
}

$stmt->close();
$conexao->close();

echo json_encode($retorno);
exit;