const campos = [
    { id: "titulo",       erro: "erroTitulo",       msg: "*Informe o título." },
    { id: "descricao",    erro: "erroDescricao",    msg: "*Informe a descrição." },
    { id: "pontoPartida", erro: "erroPontoPartida", msg: "*Informe o ponto de partida." },
    { id: "pontoChegada", erro: "erroPontoChegada", msg: "*Informe o ponto de chegada." },
    { id: "dataHora",     erro: "erroDataHora",     msg: "*Informe a data e hora." },
];

const campoPreco = { id: "preco", erro: "erroPreco", msg: "*Informe o preço." };

document.addEventListener('DOMContentLoaded', () => {
    verificarMotorista();

    document.getElementById("enviar").addEventListener('click', function () {
        novo();
    });
});

async function verificarMotorista() {
    console.log("Verificando se usuário é motorista...");
    const retornoMotorista = await fetch("../php/verificaMotorista.php");
    const respostaMotorista = await retornoMotorista.json();
    console.log("Resposta do servidor:", respostaMotorista);

    if (respostaMotorista.motorista == true) {
        mostrarOpMotorista();

        document.getElementById("tipoCarona").addEventListener('change', function () {
            var tipoCarona = this.value;

            if (tipoCarona == "motorista") {
                document.getElementById("OpPreco").style.display = "block";
            } else {
                document.getElementById("OpPreco").style.display = "none";
                document.getElementById(campoPreco.erro).style.display = "none"; // limpa erro ao esconder
            }
        });
    }
}

async function novo() {
    if (!validarCampos()) return;

    const fd = new FormData();

    var titulo       = document.getElementById("titulo").value;
    var descricao    = document.getElementById("descricao").value;
    var pontoPartida = document.getElementById("pontoPartida").value;
    var pontoChegada = document.getElementById("pontoChegada").value;
    var dataHora     = document.getElementById("dataHora").value;
    var tipoCarona   = document.getElementById("tipoCarona").value || "passageiro";
    var preco        = tipoCarona == "motorista" ? document.getElementById("preco").value : 0;

    fd.append('titulo',       titulo);
    fd.append('descricao',    descricao);
    fd.append('pontoPartida', pontoPartida);
    fd.append('pontoChegada', pontoChegada);
    fd.append('dataHora',     dataHora);
    fd.append('preco',        preco);
    fd.append('tipoCarona',   tipoCarona);

    const retorno  = await fetch("../php/novaViagem.php", { method: "POST", body: fd });
    const resposta = await retorno.json();

    if (resposta.status == "ok") {
        await Swal.fire({
            title: "Sucesso!",
            text: resposta.mensagem,
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff2448"
        });
        window.location.href = "../html/index.html";
    } else {
        Swal.fire({
            title: "ERRO!",
            text: resposta.mensagem,
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff2448"
        });
    }
}

function mostrarOpMotorista() {
    var x = document.getElementById("OpMotorista");
    x.style.display = x.style.display === "none" ? "block" : "none";
}

function validarCampos() {
    let valido = true;
    const tipoCarona = document.getElementById("tipoCarona").value;

    for (const campo of campos) {
        const valor   = document.getElementById(campo.id).value.trim();
        const erroEl  = document.getElementById(campo.erro);

        if (!valor) {
            erroEl.textContent    = campo.msg;
            erroEl.style.display  = "block";
            valido = false;
        } else {
            erroEl.style.display = "none";
        }
    }

    // Valida preço apenas se for motorista
    const erroPreco = document.getElementById(campoPreco.erro);
    if (tipoCarona == "motorista") {
        const valorPreco = document.getElementById(campoPreco.id).value.trim();
        if (!valorPreco) {
            erroPreco.textContent   = campoPreco.msg;
            erroPreco.style.display = "block";
            valido = false;
        } else {
            erroPreco.style.display = "none";
        }
    } else {
        erroPreco.style.display = "none"; // garante que não aparece pra passageiro
    }

    return valido;
}