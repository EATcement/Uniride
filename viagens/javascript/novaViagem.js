
const campos = [
    { id: "titulo",       erro: "erroTitulo",       msg: "*Informe o título." },
    { id: "descricao",    erro: "erroDescricao",    msg: "*Informe a descrição." },
    { id: "pontoPartida", erro: "erroPontoPartida", msg: "*Informe o ponto de partida." },
    { id: "pontoChegada", erro: "erroPontoChegada", msg: "*Informe o ponto de chegada." },
];

document.addEventListener('DOMContentLoaded', () => {
    verificarMotorista();
    toggleRecorrencia(); // garante estado inicial correto

    document.getElementById("enviar").addEventListener('click', novo);

    document.getElementById("tipoRecorrencia").addEventListener('change', toggleRecorrencia);
});


function toggleRecorrencia() {
    const tipo        = document.getElementById('tipoRecorrencia').value;
    const camposRec   = document.getElementById('camposRecorrencia');
    const divDataHora = document.getElementById('divDataHora');
    const erroDataHora = document.getElementById('erroDataHora');

    if (tipo === 'recorrente') {
        camposRec.style.display   = 'block';
        divDataHora.style.display = 'none';
        erroDataHora.style.display = 'none';
    } else {
        camposRec.style.display   = 'none';
        divDataHora.style.display = 'block';
    }
}

async function verificarMotorista() {
    try {
        const retorno  = await fetch("../php/verificaMotorista.php");
        const resposta = await retorno.json();

        if (resposta.motorista == true) {

            document.getElementById("OpMotorista").style.display = "block";


            await carregarVeiculos();

            document.getElementById("tipoCarona").addEventListener('change', function () {
                const opSection = document.getElementById("OpPrecoCapacidade");
                if (this.value === "motorista") {
                    opSection.style.display = "block";
                } else {
                    opSection.style.display = "none";
   
                    document.getElementById("erroPreco").style.display      = "none";
                    document.getElementById("erroCapacidade").style.display = "none";
                }
            });
        }
    } catch (e) {
        console.error("Erro ao verificar motorista:", e);
    }
}

// CARREGA VEÍCULOS DO MOTORISTA PRA PODER ESCOLHER

async function carregarVeiculos() {
    const select = document.getElementById("veiculo_id");
    if (!select) return;

    try {
        const res      = await fetch("../php/getVeiculosMotorista.php");
        const resposta = await res.json();

        if (resposta.status !== "ok" || resposta.data.length === 0) {
            select.innerHTML = `<option value="">Nenhum veículo cadastrado — cadastre um em seu perfil</option>`;
            return;
        }

        let options = `<option value="">-- Selecionar veículo --</option>`;
        resposta.data.forEach(v => {
            const cap   = v.capacidade ?? "?";
            const label = `${v.marca} ${v.modelo} (${v.ano}) — ${v.placa} | Cap. ${cap}`;
            options += `<option value="${v.id}" data-capacidade="${v.capacidade ?? ''}">${label}</option>`;
        });

        select.innerHTML = options;

        // PEGA A CAPACIDADE DO VEICULO E PREENCHE AUTOMATICAMENTE O CAMPO DE CAPACIDADE
        select.addEventListener("change", function () {
            const opt = this.options[this.selectedIndex];
            const cap = opt.getAttribute("data-capacidade");
            const campoCap = document.getElementById("capacidade");
            if (campoCap && cap) campoCap.value = cap;
        });

    } catch (e) {
        console.error("Erro ao carregar veículos:", e);
        if (select) select.innerHTML = `<option value="">Erro ao carregar veículos</option>`;
    }
}


async function novo() {
    if (!validarCampos()) return;

    const fd = new FormData();

    const tipoRecorrencia = document.getElementById("tipoRecorrencia").value;

    const selectTipo  = document.getElementById("tipoCarona");
    const tipoCarona  = (selectTipo && document.getElementById("OpMotorista").style.display !== "none")
                        ? selectTipo.value
                        : "passageiro";

    fd.append('titulo',          document.getElementById("titulo").value);
    fd.append('descricao',       document.getElementById("descricao").value);
    fd.append('pontoPartida',    document.getElementById("pontoPartida").value);
    fd.append('pontoChegada',    document.getElementById("pontoChegada").value);
    fd.append('tipoRecorrencia', tipoRecorrencia);
    fd.append('tipoCarona',      tipoCarona);

    if (tipoRecorrencia === 'avulsa') {
        fd.append('dataHora', document.getElementById("dataHora").value);
    } else {
        const dias = Array.from(document.querySelectorAll('input[name="dias[]"]:checked'))
                         .map(cb => cb.value);
        dias.forEach(dia => fd.append('dias[]', dia));
        fd.append('hora',        document.getElementById('hora').value);
        fd.append('data_inicio', document.getElementById('data_inicio').value);
    }

    // Campos exclusivos do motorista
    if (tipoCarona === "motorista") {
        fd.append('preco',      document.getElementById("preco").value || 0);
        fd.append('capacidade', document.getElementById("capacidade").value || "");
        fd.append('veiculo_id', document.getElementById("veiculo_id").value || "");
    } else {
        fd.append('preco', 0);
    }

    try {
        const retorno  = await fetch("../php/novaViagem.php", { method: "POST", body: fd });
        const resposta = await retorno.json();

        if (resposta.status === "ok") {
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
                title: "Erro!",
                text: resposta.mensagem,
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
        }
    } catch (e) {
        console.error("Erro ao enviar:", e);
        Swal.fire({
            title: "Erro!",
            text: "Falha na comunicação com o servidor.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff2448"
        });
    }
}


function validarCampos() {
    let valido = true;
    const tipoRecorrencia = document.getElementById("tipoRecorrencia").value;
    const selectTipo      = document.getElementById("tipoCarona");
    const tipoCarona      = (selectTipo && document.getElementById("OpMotorista").style.display !== "none")
                            ? selectTipo.value
                            : "passageiro";

    // Campos obrigatórios básicos
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

    const erroDataHora = document.getElementById("erroDataHora");
    if (tipoRecorrencia === 'avulsa') {
        const dt = document.getElementById("dataHora").value.trim();
        if (!dt) {
            erroDataHora.textContent   = "*Informe a data e hora.";
            erroDataHora.style.display = "block";
            valido = false;
        } else {
            erroDataHora.style.display = "none";
        }
    } else {
        erroDataHora.style.display = "none";

        // Valida campos de recorrência
        const dias       = document.querySelectorAll('input[name="dias[]"]:checked');
        const hora       = document.getElementById('hora').value.trim();
        const dataInicio = document.getElementById('data_inicio').value.trim();

        const erroDias    = document.getElementById('erroDias');
        const erroHora    = document.getElementById('erroHora');
        const erroDataIni = document.getElementById('erroDataInicio');

        if (dias.length === 0) {
            erroDias.textContent   = '*Selecione ao menos um dia.';
            erroDias.style.display = 'block';
            valido = false;
        } else {
            erroDias.style.display = 'none';
        }
        if (!hora) {
            erroHora.textContent   = '*Informe o horário.';
            erroHora.style.display = 'block';
            valido = false;
        } else {
            erroHora.style.display = 'none';
        }
        if (!dataInicio) {
            erroDataIni.textContent   = '*Informe a data de início.';
            erroDataIni.style.display = 'block';
            valido = false;
        } else {
            erroDataIni.style.display = 'none';
        }
    }

    // Validações exclusivas do motorista
    if (tipoCarona === "motorista") {
        const preco      = document.getElementById("preco").value.trim();
        const capacidade = document.getElementById("capacidade").value.trim();

        const erroPreco      = document.getElementById("erroPreco");
        const erroCapacidade = document.getElementById("erroCapacidade");

        if (!preco) {
            erroPreco.textContent   = "*Informe o preço.";
            erroPreco.style.display = "block";
            valido = false;
        } else {
            erroPreco.style.display = "none";
        }

        if (!capacidade || parseInt(capacidade) < 1) {
            erroCapacidade.textContent   = "*Informe a capacidade (mínimo 1).";
            erroCapacidade.style.display = "block";
            valido = false;
        } else {
            erroCapacidade.style.display = "none";
        }
    }

    return valido;
}
