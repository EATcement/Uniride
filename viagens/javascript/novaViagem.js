const campos = [
    { id: "titulo",       erro: "erroTitulo",       msg: "*Informe o título." },
    { id: "descricao",    erro: "erroDescricao",    msg: "*Informe a descrição." },
    { id: "pontoPartida", erro: "erroPontoPartida", msg: "*Informe o ponto de partida." },
    { id: "pontoChegada", erro: "erroPontoChegada", msg: "*Informe o ponto de chegada." },
];

document.addEventListener('DOMContentLoaded', () => {
    verificarMotorista();
    toggleRecorrencia(); // garante estado inicial correto
    configurarLimitesCalendario(); // IMPEDE SELECIONAR DATAS PASSADAS VISUALMENTE

    document.getElementById("enviar").addEventListener('click', novo);
    document.getElementById("tipoRecorrencia").addEventListener('change', toggleRecorrencia);
});

// FUNÇÃO PARA BLOQUEAR DIAS PASSADOS NO CALENDÁRIO VISUALMENTE
function configurarLimitesCalendario() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const horas = String(hoje.getHours()).padStart(2, '0');
    const minutos = String(hoje.getMinutes()).padStart(2, '0');

    const dataMinimaYMD = `${ano}-${mes}-${dia}`; // Formato: YYYY-MM-DD
    const dataHoraMinimaLocal = `${dataMinimaYMD}T${horas}:${minutos}`; // Formato: YYYY-MM-DDTHH:MM

    // Aplica o limite no input de data/hora avulsa
    const campoDataHora = document.getElementById("dataHora");
    if (campoDataHora) campoDataHora.min = dataHoraMinimaLocal;

    // Aplica o limite no input de data recorrente
    const campoDataInicio = document.getElementById("data_inicio");
    if (campoDataInicio) campoDataInicio.min = dataMinimaYMD;
}

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
                    document.getElementById("erroVeiculo").style.display    = "none";
                }
            });
        }
    } catch (e) {
        console.error("Erro ao verificar motorista:", e);
    }
}

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

        select.addEventListener("change", function () {
            const opt = this.options[this.selectedIndex];
            const cap = opt.getAttribute("data-capacidade");
            const campoCap = document.getElementById("capacidade");
            if (campoCap && cap) campoCap.value = cap;

            if (this.value) {
                document.getElementById("erroVeiculo").style.display = "none";
            }
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

    const agora = new Date(); // Objeto de tempo exato de AGORA para comparar milisegundos

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
            // 🛑 VALIDAÇÃO DE DATA/HORA PASSADA PARA AVULSA
            const dataInserida = new Date(dt);
            if (dataInserida < agora) {
                erroDataHora.textContent   = "*A data e hora não podem ser anteriores ao momento atual.";
                erroDataHora.style.display = "block";
                valido = false;
            } else {
                erroDataHora.style.display = "none";
            }
        }
    } else {
        erroDataHora.style.display = "none";

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
            // 🛑 VALIDAÇÃO DE DATA/HORA PASSADA PARA GRUPOS RECORRENTES
            if (hora) {
                // Junta a data de início e a hora de recorrência em uma string padrão ISO
                const dataHoraInserida = new Date(`${dataInicio}T${hora}`);
                if (dataHoraInserida < agora) {
                    erroDataIni.textContent   = '*O início do grupo recorrente não pode ser menor que o momento atual.';
                    erroDataIni.style.display = 'block';
                    valido = false;
                } else {
                    erroDataIni.style.display = 'none';
                }
            } else {
                erroDataIni.style.display = 'none';
            }
        }
    }

    if (tipoCarona === "motorista") {
        const preco          = document.getElementById("preco").value.trim();
        const capacidade     = document.getElementById("capacidade").value.trim();
        const veiculoSelect  = document.getElementById("veiculo_id");

        const erroPreco      = document.getElementById("erroPreco");
        const erroCapacidade = document.getElementById("erroCapacidade");
        const erroVeiculo    = document.getElementById("erroVeiculo");

        if (!preco) {
            erroPreco.textContent   = "*Informe o preço.";
            erroPreco.style.display = "block";
            valido = false;
        } else {
            erroPreco.style.display = "none";
        }

        if (!veiculoSelect || !veiculoSelect.value) {
            erroVeiculo.textContent   = "*Selecione um veículo cadastrado.";
            erroVeiculo.style.display = "block";
            valido = false;
        } else {
            erroVeiculo.style.display = "none";
        }

        if (!capacidade || parseInt(capacidade) < 1) {
            erroCapacidade.textContent   = "*Informe a capacidade (mínimo 1).";
            erroCapacidade.style.display = "block";
            valido = false;
        } else if (veiculoSelect && veiculoSelect.value) {
            const opt        = veiculoSelect.options[veiculoSelect.selectedIndex];
            const capVeiculo = parseInt(opt.getAttribute("data-capacidade"));

            if (!isNaN(capVeiculo) && parseInt(capacidade) > capVeiculo) {
                erroCapacidade.textContent   = `*Capacidade não pode ser maior que a do veículo selecionado (${capVeiculo} lugares).`;
                erroCapacidade.style.display = "block";
                valido = false;
            } else {
                erroCapacidade.style.display = "none";
            }
        } else {
            erroCapacidade.style.display = "none";
        }
    }

    return valido;
}