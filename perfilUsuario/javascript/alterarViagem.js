const url     = new URLSearchParams(window.location.search);
const idGrupo = url.get("id");

// Campos básicos (editáveis por criador e criador_motorista)
const CAMPOS_BASICOS = [
    { id: "titulo",       erro: "erroTitulo",       msg: "*Informe o título." },
    { id: "descricao",    erro: "erroDescricao",    msg: "*Informe a descrição." },
    { id: "pontoPartida", erro: "erroPontoPartida", msg: "*Informe o ponto de partida." },
    { id: "pontoChegada", erro: "erroPontoChegada", msg: "*Informe o ponto de chegada." },
];

let permissao = {
    papel: null,
    podeEditarBasico: false,
    podeEditarPrecoCapacidade: false
};


// INICIALIZAÇÃO ->

document.addEventListener("DOMContentLoaded", async () => {
    if (!idGrupo) {
        mostrarErroFatal("ID do grupo não encontrado na URL. Volte ao perfil e tente novamente.");
        return;
    }
    await inicializar();
});

async function inicializar() {
    try {
        // getPermissaoGrupo.php está em viagens/php/
        const resPermissao   = await fetch(`../../viagens/php/getPermissaoGrupo.php?id=${idGrupo}`);
        const dadosPermissao = await resPermissao.json();

        if (dadosPermissao.status !== "ok") {
            mostrarErroFatal("Erro ao verificar permissões: " + dadosPermissao.mensagem);
            return;
        }

        permissao.papel                     = dadosPermissao.papel;
        permissao.podeEditarBasico          = dadosPermissao.pode_editar_basico;
        permissao.podeEditarPrecoCapacidade = dadosPermissao.pode_editar_preco_capacidade;

        if (!permissao.podeEditarBasico && !permissao.podeEditarPrecoCapacidade) {
            await Swal.fire({
                title: "Acesso negado",
                text: "Você não tem permissão para editar este grupo.",
                icon: "warning",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
            window.location.href = "../html/perfil.html";
            return;
        }

        await preencherFormulario();
        configurarInterface();

        if (permissao.podeEditarPrecoCapacidade) {
            await carregarVeiculos();
        }

        document.getElementById("enviar").addEventListener("click", salvar);

        const selectRec = document.getElementById("tipoRecorrencia");
        if (selectRec) selectRec.addEventListener("change", toggleRecorrencia);

    } catch (e) {
        console.error("Erro na inicialização:", e);
        mostrarErroFatal("Erro inesperado ao carregar a página.");
    }
}


// PREENCHE OS CAMPOS
async function preencherFormulario() {
    // perfilViagem.php está em perfilUsuario/php/
    const res      = await fetch(`../php/perfilViagem.php?id=${idGrupo}`);
    const resposta = await res.json();

    if (resposta.status !== "ok") {
        mostrarErroFatal("Não foi possível carregar os dados do grupo.");
        return;
    }

    const reg = resposta.data[0];

    setValorSe("titulo",          reg.titulo);
    setValorSe("descricao",       reg.descricao);
    setValorSe("pontoPartida",    reg.pontoPartida);
    setValorSe("pontoChegada",    reg.pontoChegada);
    setValorSe("preco",           reg.preco);
    setValorSe("capacidade",      reg.capacidade);
    setValorSe("tipoRecorrencia", reg.tipoRecorrencia ?? "avulsa");

    if (reg.dataHora) {
        setValorSe("dataHora", reg.dataHora.replace(" ", "T").slice(0, 16));
    }

    if (reg.tipoRecorrencia === "recorrente") {
        setValorSe("hora",        reg.hora_recorrencia);
        setValorSe("data_inicio", reg.data_inicio);
        await marcarDiasSemana();
        toggleRecorrencia();
    }

    window._veiculoIdAtual = reg.veiculo_id;
}

async function marcarDiasSemana() {
    const res      = await fetch(`../php/perfilViagem.php?id=${idGrupo}`);
    const resposta = await res.json();
    if (resposta.status !== "ok") return;

    resposta.data.forEach(linha => {
        if (linha.dia_semana !== null && linha.dia_semana !== undefined) {
            const cb = document.querySelector(`input[name="dias[]"][value="${linha.dia_semana}"]`);
            if (cb) cb.checked = true;
        }
    });
}


// CONFIGURA INTERFACE
function configurarInterface() {
    const secaoBasica          = document.getElementById("secaoBasica");
    const secaoPrecoCapacidade = document.getElementById("secaoPrecoCapacidade");
    const badgePapel           = document.getElementById("badgePapel");

    const labels = {
        criador_motorista: "Você é o criador e o motorista deste grupo",
        criador:           "Você é o criador deste grupo",
        motorista:         "Você é o motorista deste grupo"
    };

    if (badgePapel) {
        badgePapel.textContent   = labels[permissao.papel] || "";
        badgePapel.style.display = "block";
    }

    if (secaoBasica) {
        secaoBasica.style.display = "block";
        habilitarCamposBasicos(permissao.podeEditarBasico);
    }

    if (secaoPrecoCapacidade) {
        secaoPrecoCapacidade.style.display =
            permissao.podeEditarPrecoCapacidade ? "block" : "none";
    }
}

function habilitarCamposBasicos(habilitar) {
    const ids = ["titulo", "descricao", "pontoPartida", "pontoChegada",
                 "dataHora", "tipoRecorrencia", "hora", "data_inicio"];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = !habilitar;
    });
    document.querySelectorAll('input[name="dias[]"]').forEach(cb => {
        cb.disabled = !habilitar;
    });
}


// CARREGA VEÍCULOS
async function carregarVeiculos() {
    const select = document.getElementById("veiculo_id");
    if (!select) return;

    try {
        // getVeiculosMotorista.php está em viagens/php/
        const res      = await fetch("../../viagens/php/getVeiculosMotorista.php");
        const resposta = await res.json();

        if (resposta.status !== "ok" || resposta.data.length === 0) {
            select.innerHTML = `<option value="">Nenhum veículo cadastrado</option>`;
            return;
        }

        let options = `<option value="">-- Selecionar veículo --</option>`;
        resposta.data.forEach(v => {
            const cap      = v.capacidade ?? "?";
            const label    = `${v.marca} ${v.modelo} (${v.ano}) — ${v.placa} | Cap. ${cap}`;
            const selected = (window._veiculoIdAtual == v.id) ? "selected" : "";
            options += `<option value="${v.id}" data-capacidade="${v.capacidade ?? ''}" ${selected}>${label}</option>`;
        });

        select.innerHTML = options;

        select.addEventListener("change", function () {
            const opt = this.options[this.selectedIndex];
            const cap = opt.getAttribute("data-capacidade");
            const campoCap = document.getElementById("capacidade");
            if (campoCap && cap) campoCap.value = cap;
        });

    } catch (e) {
        console.error("Erro ao carregar veículos:", e);
    }
}


// TOGGLE  DA RECORRÊNCIA
function toggleRecorrencia() {
    const tipo         = document.getElementById("tipoRecorrencia")?.value;
    const camposRec    = document.getElementById("camposRecorrencia");
    const divDataHora  = document.getElementById("divDataHora");
    const erroDataHora = document.getElementById("erroDataHora");

    if (tipo === "recorrente") {
        if (camposRec)    camposRec.style.display    = "block";
        if (divDataHora)  divDataHora.style.display  = "none";
        if (erroDataHora) erroDataHora.style.display = "none";
    } else {
        if (camposRec)   camposRec.style.display   = "none";
        if (divDataHora) divDataHora.style.display = "block";
    }
}


// VALIDAÇÃO
function validarFormulario() {
    let valido = true;

    if (permissao.podeEditarBasico) {
        const tipoRecorrencia = document.getElementById("tipoRecorrencia")?.value ?? "avulsa";

        CAMPOS_BASICOS.forEach(campo => {
            const valor  = document.getElementById(campo.id)?.value.trim();
            const erroEl = document.getElementById(campo.erro);
            if (!valor) {
                erroEl.textContent   = campo.msg;
                erroEl.style.display = "block";
                valido = false;
            } else {
                erroEl.style.display = "none";
            }
        });

        const erroDataHora = document.getElementById("erroDataHora");
        if (tipoRecorrencia === "avulsa") {
            const dt = document.getElementById("dataHora")?.value.trim();
            if (!dt) {
                erroDataHora.textContent   = "*Informe a data e hora.";
                erroDataHora.style.display = "block";
                valido = false;
            } else {
                erroDataHora.style.display = "none";
            }
        } else {
            if (erroDataHora) erroDataHora.style.display = "none";

            const dias        = document.querySelectorAll('input[name="dias[]"]:checked');
            const hora        = document.getElementById("hora")?.value.trim();
            const dataInicio  = document.getElementById("data_inicio")?.value.trim();
            const erroDias    = document.getElementById("erroDias");
            const erroHora    = document.getElementById("erroHora");
            const erroDataIni = document.getElementById("erroDataInicio");

            if (dias.length === 0) {
                erroDias.textContent = "*Selecione ao menos um dia.";
                erroDias.style.display = "block";
                valido = false;
            } else { erroDias.style.display = "none"; }

            if (!hora) {
                erroHora.textContent = "*Informe o horário.";
                erroHora.style.display = "block";
                valido = false;
            } else { erroHora.style.display = "none"; }

            if (!dataInicio) {
                erroDataIni.textContent = "*Informe a data de início.";
                erroDataIni.style.display = "block";
                valido = false;
            } else { erroDataIni.style.display = "none"; }
        }
    }

    //VALIDAÇÃO DO PREÇO, CAPACIDADE E VEÍCULO
    if (permissao.podeEditarPrecoCapacidade) {
        const veiculoId = document.getElementById("veiculo_id")?.value;
        
        // Verifica se o usuário selecionou a opção vazia "-- Selecionar veículo --"
        if (!veiculoId || veiculoId === "") {
            Swal.fire({
                title: "Veículo obrigatório!",
                text: "Por favor, selecione um veículo válido para continuar.",
                icon: "warning",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
            valido = false;
        }

        const capacidade     = document.getElementById("capacidade")?.value.trim();
        const erroCapacidade = document.getElementById("erroCapacidade");
        if (capacidade && (isNaN(capacidade) || parseInt(capacidade) < 1)) {
            erroCapacidade.textContent   = "*Capacidade deve ser um número maior que 0.";
            erroCapacidade.style.display = "block";
            valido = false;
        } else {
            if (erroCapacidade) erroCapacidade.style.display = "none";
        }
    }

    return valido;
}


// SALVA ALTERAÇÕES

async function salvar() {
    if (!validarFormulario()) return;

    const fd = new FormData();

    if (permissao.podeEditarBasico) {
        const tipoRecorrencia = document.getElementById("tipoRecorrencia")?.value ?? "avulsa";
        fd.append("titulo",          document.getElementById("titulo").value);
        fd.append("descricao",       document.getElementById("descricao").value);
        fd.append("pontoPartida",    document.getElementById("pontoPartida").value);
        fd.append("pontoChegada",    document.getElementById("pontoChegada").value);
        fd.append("tipoRecorrencia", tipoRecorrencia);

        if (tipoRecorrencia === "avulsa") {
            fd.append("dataHora", document.getElementById("dataHora").value);
        } else {
            const dias = Array.from(document.querySelectorAll('input[name="dias[]"]:checked'))
                              .map(cb => cb.value);
            dias.forEach(d => fd.append("dias[]", d));
            fd.append("hora",        document.getElementById("hora").value);
            fd.append("data_inicio", document.getElementById("data_inicio").value);
        }
    }

    if (permissao.podeEditarPrecoCapacidade) {
        fd.append("preco",      document.getElementById("preco")?.value      ?? "");
        fd.append("capacidade", document.getElementById("capacidade")?.value ?? "");
        fd.append("veiculo_id", document.getElementById("veiculo_id")?.value ?? "");
    }

    try {
        // alterarViagem.php está em perfilUsuario/php/
        const retorno  = await fetch(`../php/alterarViagem.php?id=${idGrupo}`, {
            method: "POST",
            body: fd
        });
        const resposta = await retorno.json();

        if (resposta.status === "ok") {
            await Swal.fire({
                title: "Sucesso!",
                text: resposta.mensagem,
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
            window.location.href = "../html/perfil.html";
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
        console.error("Erro ao salvar:", e);
        Swal.fire({
            title: "Erro!",
            text: "Falha na comunicação com o servidor.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff2448"
        });
    }
}


// UTILITÁRIOS

function setValorSe(id, valor) {
    const el = document.getElementById(id);
    if (el && valor !== null && valor !== undefined) el.value = valor;
}

function mostrarErroFatal(msg) {
    document.body.innerHTML = `
        <div style="padding:40px; text-align:center; font-family:sans-serif;">
            <h2 style="color:#ff2448;">Erro</h2>
            <p>${msg}</p>
            <a href="../html/perfil.html" style="color:#ff2448;">← Voltar ao perfil</a>
        </div>`;
}
