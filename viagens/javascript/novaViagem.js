document.addEventListener('DOMContentLoaded', () => {
    verificarMotorista();
});

document.getElementById("enviar").addEventListener('click', function () {
    novo();
});

async function verificarMotorista() { //está usando método GET por padrão, ideal pois não estamos utilizando servidor diretamente e sim lendo sessão salva. Não é um problema, pois não estamos passando dados via URL, apenas pegando dados de sessão do PHP que o usuário não consegue alterar.

    console.log("Verificando se usuário é motorista...");
    const retornoMotorista = await fetch("../php/verificaMotorista.php");
    const respostaMotorista= await retornoMotorista.json();
    console.log("Resposta do servidor:", respostaMotorista);

    if (respostaMotorista.motorista == true) {
            mostrarOpMotorista();

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

async function novo() {

    const fd = new FormData();

    var titulo = document.getElementById("titulo").value;
    var descricao = document.getElementById("descricao").value;
    var pontoPartida = document.getElementById("pontoPartida").value;
    var pontoChegada = document.getElementById("pontoChegada").value;
    var dataHora = document.getElementById("dataHora").value;
    var preco = document.getElementById("preco").value || 0; // Pega o valor do preço ou 0 se estiver vazio;
    var tipoCarona = document.getElementById("tipoCarona").value || "passageiro"; // Pega o valor do tipoCarona ou "passageiro" se estiver vazio;

    if (!dataHora || !titulo || !descricao || !pontoPartida || !pontoChegada) {
        alert("ERRO: Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    fd.append('titulo', titulo);
    fd.append('descricao', descricao);
    fd.append('pontoPartida', pontoPartida);
    fd.append('pontoChegada', pontoChegada);
    fd.append('dataHora', dataHora);
    fd.append('preco', preco);
    fd.append('tipoCarona', tipoCarona);


    const retorno = await fetch("../php/novaViagem.php", {
        method: "POST",
        body: fd
    });

    const resposta = await retorno.json();

    if(resposta.status == "ok") {
        alert("Sucesso! " + resposta.mensagem);
        window.location.href="../html/index.html";
    } else {
        alert("ERRO! " + resposta.mensagem);
    }
};



function mostrarOpMotorista() {
    var x = document.getElementById("OpMotorista");
    if (x.style.display === "none") {
            x.style.display = "block";
    } else {
            x.style.display = "none";
    }
};