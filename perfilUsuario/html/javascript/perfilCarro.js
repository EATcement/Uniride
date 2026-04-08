
document.addEventListener("DOMContentLoaded", () => {
    verificarMotorista();

    if (document.getElementById("lista")) {
        carregarDados();
    }
});

const botaoNovo = document.getElementById("novoCarro");
if (botaoNovo) {
    botaoNovo.addEventListener("click", () => {
        window.location.href = '../html/novoCarro.html';
    });
}

async function carregarDados() {
    const retorno = await fetch("../php/perfilCarro.php");
    const resposta = await retorno.json();

    if (resposta.status == "ok") {
        const registros = resposta.data;

        var html = `<table>
            <tr>
                <th>Ações</th>
                <th>Placa</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Ano</th>
                <th>Cor</th>
                <th>Capacidade</th>
                <th>Gasto de Combustível</th>
                <th>Categoria</th>
            </tr>`;

        for (var i = 0; i < registros.length; i++) {
            var objeto = registros[i];

            html += `<tr>
                        <td> 
                            <a href='alterarCarro.html?id=${objeto.id}' class='alterar'>Alterar</a>
                            <a href='#' onclick='excluirCarro(${objeto.id})' class='excluir'>Excluir</a>
                        </td>
                        <td>${objeto.placa}</td>
                        <td>${objeto.marca}</td>
                        <td>${objeto.modelo}</td>
                        <td>${objeto.ano}</td>
                        <td>${objeto.cor}</td>
                        <td>${objeto.capacidade}</td>
                        <td>${objeto.gastoCombustivel}</td>
                        <td>${objeto.categoria}</td>
                    </tr>`;
        }

        html += "</table>";

        document.getElementById("lista").innerHTML = html;

    } else {
        console.log("Erro: " + resposta.mensagem);
    }
};


async function verificarMotorista() { //está usando método GET por padrão, ideal pois não estamos utilizando servidor diretamente e sim lendo sessão salva. Não é um problema, pois não estamos passando dados via URL, apenas pegando dados de sessão do PHP que o usuário não consegue alterar.

    console.log("Verificando se usuário é motorista...");
    const retornoMotorista = await fetch("../../viagens/php/verificaMotorista.php");
    const respostaMotorista= await retornoMotorista.json();
    console.log("Resposta do servidor:", respostaMotorista);

    if (respostaMotorista.motorista == true) {
            mostrarCarrosCadastrados();
    }
};

function mostrarCarrosCadastrados() {
    var x = document.getElementById("carrosCadastrados");
    if (x.style.display === "none") {
            x.style.display = "block";
    } else {
            x.style.display = "none";
    }
};

async function excluirCarro(id) {
    const retorno = await fetch("../php/excluirCarro.php?id=" + id);
    const resposta = await retorno.json();
    if (resposta.status == "ok") {
        console.log(resposta.mensagem);
        window.location.reload();
    } else {
        console.log("Erro: " + resposta.mensagem)
    }
}