const campos = [
    { id: "titulo",       erro: "erroTitulo",       msg: "*Informe o título." },
    { id: "descricao",    erro: "erroDescricao",    msg: "*Informe a descrição." },
    { id: "pontoPartida", erro: "erroPontoPartida", msg: "*Informe o ponto de partida." },
    { id: "pontoChegada", erro: "erroPontoChegada", msg: "*Informe o ponto de chegada." },
];

const campoPreco = { id: "preco", erro: "erroPreco", msg: "*Informe o preço." };

document.addEventListener('DOMContentLoaded', () => {
    verificarMotorista();

    document.getElementById("enviar").addEventListener('click', function () {
        novo();
    });

    document.getElementById("tipoRecorrencia").addEventListener('change', function () {
        toggleRecorrencia();
    });
});

function toggleRecorrencia() {
    const tipo = document.getElementById('tipoRecorrencia').value;
    const camposRec = document.getElementById('camposRecorrencia');
    const dataHoraDiv = document.getElementById('dataHora').parentElement;

    if (tipo === 'recorrente') {
        camposRec.style.display = 'block';
        dataHoraDiv.style.display = 'none';
        document.getElementById('erroDataHora').style.display = 'none';
    } else {
        camposRec.style.display = 'none';
        dataHoraDiv.style.display = 'block';
    }
}

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
    var tipoRecorrencia = document.getElementById('tipoRecorrencia').value;

    fd.append('titulo',       titulo);
    fd.append('descricao',    descricao);
    fd.append('pontoPartida', pontoPartida);
    fd.append('pontoChegada', pontoChegada);
    fd.append('dataHora',     dataHora);
    fd.append('preco',        preco);
    fd.append('tipoCarona',   tipoCarona);
    fd.append('tipoRecorrencia',   tipoRecorrencia);


    if (tipoRecorrencia === 'recorrente') {
            const dias = Array.from(document.querySelectorAll('input[name="dias[]"]:checked')).map(cb => cb.value);
            fd.append('hora',        document.getElementById('hora').value);
            fd.append('data_inicio', document.getElementById('data_inicio').value);
            dias.forEach(dia => fd.append('dias[]', dia));
        }

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
    const tipoRecorrencia = document.getElementById("tipoRecorrencia").value;

    for (const campo of campos) {
        const valor  = document.getElementById(campo.id).value.trim();
        const erroEl = document.getElementById(campo.erro);

        if (!valor) {
            erroEl.textContent   = campo.msg;
            erroEl.style.display = "block";
            valido = false;
        } else {
            erroEl.style.display = "none";
        }
    }

    // Valida dataHora só se for avulsa
    const erroDataHora = document.getElementById("erroDataHora");
    if (tipoRecorrencia === 'avulsa') {
        const valorDataHora = document.getElementById("dataHora").value.trim();
        if (!valorDataHora) {
            erroDataHora.textContent   = "*Informe a data e hora.";
            erroDataHora.style.display = "block";
            valido = false;
        } else {
            erroDataHora.style.display = "none";
        }
    } else {
        erroDataHora.style.display = "none";
    }

    // Valida campos de recorrência se for recorrente
    if (tipoRecorrencia === 'recorrente') {
        const dias = document.querySelectorAll('input[name="dias[]"]:checked');
        const hora = document.getElementById('hora').value.trim();
        const data_inicio = document.getElementById('data_inicio').value.trim();

        const erroDias = document.getElementById('erroDias');
        if (dias.length === 0) {
            erroDias.textContent   = '*Selecione ao menos um dia.';
            erroDias.style.display = 'block';
            valido = false;
        } else {
            erroDias.style.display = 'none';
        }

        const erroHora = document.getElementById('erroHora');
        if (!hora) {
            erroHora.textContent   = '*Informe o horário.';
            erroHora.style.display = 'block';
            valido = false;
        } else {
            erroHora.style.display = 'none';
        }

        const erroDataInicio = document.getElementById('erroDataInicio');
        if (!data_inicio) {
            erroDataInicio.textContent   = '*Informe a data de início.';
            erroDataInicio.style.display = 'block';
            valido = false;
        } else {
            erroDataInicio.style.display = 'none';
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
        erroPreco.style.display = "none";
    }

    return valido;
}