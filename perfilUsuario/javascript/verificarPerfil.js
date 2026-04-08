 document.addEventListener('DOMContentLoaded', async () => {
            const retorno = await fetch("../../viagens/php/verificaMotorista.php");
            const resposta = await retorno.json();

            if (resposta.motorista == true) {
                // Se for motorista, mostra a área de carros e viagens
                document.getElementById("carrosCadastrados").style.display = "block";
            } else {
                // Se não for, mostra o botão para se tornar motorista
                document.getElementById("areaTornarMotorista").style.display = "block";
            }
        });