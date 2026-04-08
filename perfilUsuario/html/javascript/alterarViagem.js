// Primeira etapa: receber o valor por GET e armazenar no input hidden id;
// Segunda etapa: fazer um fetch no projetoFinal_get.php e preencher os campos;
var url = new URLSearchParams(window.location.search);
var id = url.get("id");

document.addEventListener("DOMContentLoaded", () => {
    //Pegaa URL e grava na variável
    buscarDados(id);
    verificarMotorista();

});


async function buscarDados(id) {
    const retorno = await fetch("../php/perfilViagem.php?id="+id)
    const resposta = await retorno.json();

    if(resposta.status == "ok") {
        
        alert("Sucesso! " + resposta.mensagem);
        var reg = resposta.data[0]; //pega a partir da posição 0, já que vai ser a única existente, já que o dicionário só possui uma posição;

        document.getElementById("titulo").value = reg.titulo;
        document.getElementById("descricao").value = reg.descricao;
        document.getElementById("pontoPartida").value = reg.pontoPartida;
        document.getElementById("pontoChegada").value = reg.pontoChegada;
        document.getElementById("dataHora").value = reg.dataHora;
        document.getElementById("preco").value = reg.preco;
        document.getElementById("tipoCarona").value = reg.tipoCarona;
        

    } else {
        alert("ERRO! " + resposta.mensagem);
    }
    console.log(id)
};


async function verificarMotorista() { //está usando método GET por padrão, ideal pois não estamos utilizando servidor diretamente e sim lendo sessão salva. Não é um problema, pois não estamos passando dados via URL, apenas pegando dados de sessão do PHP que o usuário não consegue alterar.

    console.log("Verificando se usuário é motorista...");
    const retornoMotorista = await fetch("../../viagens/php/verificaMotorista.php");
    const respostaMotorista= await retornoMotorista.json();
    console.log("Resposta do servidor:", respostaMotorista);

    if (respostaMotorista.motorista == true) {
            mostrarOpViagem();

            document.getElementById("tipoCarona").addEventListener('change', function() {
                var tipoCarona = this.value;

                if (tipoCarona == "motorista") {
                    document.getElementById("OpPreco").style.display = "block";

                } else {
                    document.getElementById("OpPreco").style.display = "none";
            }

        });
    }
};

document.getElementById("enviar").addEventListener('click', function () {
    alterar();
});

async function alterar() {
    var titulo = document.getElementById("titulo").value;
    var descricao = document.getElementById("descricao").value;
    var pontoPartida = document.getElementById("pontoPartida").value;
    var pontoChegada = document.getElementById("pontoChegada").value;
    var dataHora = document.getElementById("dataHora").value;
    var preco = 0; // começa como 0
    var tipoCarona = document.getElementById("tipoCarona").value || "passageiro"; // Pega o valor do tipoCarona ou "passageiro" se estiver vazio;

    if (tipoCarona == "motorista") {
        preco = document.getElementById("preco").value || 0;
    }

    const fd = new FormData();
    fd.append('titulo', titulo);
    fd.append('descricao', descricao);
    fd.append('pontoPartida', pontoPartida);
    fd.append('pontoChegada', pontoChegada);
    fd.append('dataHora', dataHora);
    fd.append('preco', preco);
    fd.append('tipoCarona', tipoCarona);

    //envia para o php através do método post
    // ponto de interrogação (?) = estou passando uma variável por get

    const retorno = await fetch("../php/alterarViagem.php?id="+id, {
        method: "POST",
        body: fd
    });

    const resposta = await retorno.json();

    if(resposta.status == "ok") {
        alert("Sucesso! " + resposta.mensagem);
        window.location.href = '../html/perfil.html';
    } else {
        alert("ERRO! " + resposta.mensagem);
    }

};

function mostrarOpViagem() {
    var x = document.getElementById("OpViagem");
    if (x.style.display === "none") {
            x.style.display = "block";
    } else {
            x.style.display = "none";
    }
};