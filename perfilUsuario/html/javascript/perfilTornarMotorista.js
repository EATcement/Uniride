async function verificarMotorista() { //está usando método GET por padrão, ideal pois não estamos utilizando servidor diretamente e sim lendo sessão salva. Não é um problema, pois não estamos passando dados via URL, apenas pegando dados de sessão do PHP que o usuário não consegue alterar.

    console.log("Verificando se usuário é motorista...");
    const retornoMotorista = await fetch("../../viagens/php/verificaMotorista.php");
    const respostaMotorista= await retornoMotorista.json();
    console.log("Resposta do servidor:", respostaMotorista);
    const ehMotorista = respostaMotorista.motorista;
    console.log(ehMotorista);

    // Verifica se é true (booleano) ou se é a string "true"
    if (ehMotorista === false) {
        document.getElementById("areaTornarMotorista").style.display = "block";
        console.log("Caiu no IF: Não é motorista");
    } else {
        document.getElementById("areaCarros").style.display = "block";
        console.log("Caiu no ELSE: É motorista");
    }

};