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
    configurarLimitesCalendario(); // TRAVA OS CALENDÁRIOS CONTRA DATAS PASSADAS
});

// FUNÇÃO PARA TRAVAR CLIQUES EM DIAS PASSADOS
function configurarLimitesCalendario() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const horas = String(hoje.getHours()).padStart(2, '0');
    const minutos = String(hoje.getMinutes()).padStart(2, '0');

    const dataMinimaYMD = `${ano}-${mes}-${dia}`;
    const dataHoraMinimaLocal = `${dataMinimaYMD}T${horas}:${minutos}`;

    const campoDataHora = document.getElementById("dataHora");
    if (campoDataHora) campoDataHora.min = dataHoraMinimaLocal;

    const campoDataInicio = document.getElementById("data_inicio");
    if (campoDataInicio) campoDataInicio.min = dataMinimaYMD;
}

async function inicializar() {
    try {
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
        const dtFormatada = reg.dataHora.replace(" ", "T").slice(0, 16);
        setValorSe("dataHora", dtFormatada);
        // Guarda o valor original vindo do banco para comparar na validação
        window._dataHoraOriginal = dtFormatada;
    }

    if (reg.tipoRecorrencia === "recorrente") {
        setValorSe("hora",        reg.hora_recorrencia);
        setValorSe("data_inicio", reg.data_inicio);
        
        // Guarda os originais da recorrência
        window._dataInicioOriginal = reg.data_inicio;
        window._horaOriginal = reg.hora_recorrencia ? reg.hora_recorrencia.substring(0, 5) : "";

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


// TOGGLE DA RECORRÊNCIA
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


// VALIDAÇÃO COM FILTRO ANTI-PASSADO SEGURO
function validarFormulario() {
    let valido = true;

    if (permissao.podeEditarBasico) {
        const tipoRecorrencia = document.getElementById("tipoRecorrencia")?.value ?? "avulsa";

        // Captura o momento do clique para a validação numérica precisa
        const agora = new Date();
        const anoAtual   = agora.getFullYear();
        const mesAtual   = agora.getMonth() + 1;
        const diaAtual   = agora.getDate();
        const horaAtual  = agora.getHours();
        const minAtual   = agora.getMinutes();

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
                // SÓ VALIDA SE O USUÁRIO ALTEROU A DATA/HORA ORIGINAL DO BANCO
                if (dt !== window._dataHoraOriginal) {
                    const [dataPart, horaPart] = dt.split('T');
                    const [anoIn, mesIn, diaIn] = dataPart.split('-').map(Number);
                    const [horaIn, minIn] = horaPart.split(':').map(Number);

                    const dataPassada = (anoIn < anoAtual) || 
                                        (anoIn === anoAtual && mesIn < mesAtual) || 
                                        (anoIn === anoAtual && mesIn === mesAtual && diaIn < diaAtual);

                    const hojeMasHoraPassada = (anoIn === anoAtual && mesIn === mesAtual && diaIn === diaAtual) && 
                                               ((horaIn < horaAtual) || (horaIn === horaAtual && minIn < minAtual));

                    if (dataPassada || hojeMasHoraPassada) {
                        erroDataHora.textContent   = "*A nova data e hora não podem ser anteriores ao momento atual.";
                        erroDataHora.style.display = "block";
                        valido = false;
                    } else {
                        erroDataHora.style.display = "none";
                    }
                } else {
                    erroDataHora.style.display = "none";
                }
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
            } else {
                // SÓ VALIDA SE HOUVE ALTERAÇÃO NA DATA OU NA HORA DA RECORRÊNCIA
                const horaFormatadaIn = hora ? hora.substring(0, 5) : "";
                if (dataInicio !== window._dataInicioOriginal || horaFormatadaIn !== window._horaOriginal) {
                    const [anoIn, mesIn, diaIn] = dataInicio.split('-').map(Number);
                    const [horaIn, minIn] = horaFormatadaIn.split(':').map(Number);

                    const dataPassada = (anoIn < anoAtual) || 
                                        (anoIn === anoAtual && mesIn < mesAtual) || 
                                        (anoIn === anoAtual && mesIn === mesAtual && diaIn < diaAtual);

                    const hojeMasHoraPassada = (anoIn === anoAtual && mesIn === mesAtual && diaIn === diaAtual) && 
                                               ((horaIn < horaAtual) || (horaIn === horaAtual && minIn < minAtual));

                    if (dataPassada || hojeMasHoraPassada) {
                        erroDataIni.textContent = "*A nova data de início não pode ser menor que o momento atual.";
                        erroDataIni.style.display = "block";
                        valido = false;
                    } else {
                        erroDataIni.style.display = "none";
                    }
                } else {
                    erroDataIni.style.display = "none";
                }
            }
        }
    }

    if (permissao.podeEditarPrecoCapacidade) {
        const veiculoId = document.getElementById("veiculo_id")?.value;
        
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

        const capacidadedef     = document.getElementById("capacidade")?.value.trim();
        const erroCapacidadeDef = document.getElementById("erroCapacidade");
        if (capacidadedef && (isNaN(capacidadedef) || parseInt(capacidadedef) < 1)) {
            erroCapacidadeDef.textContent   = "*Capacidade deve ser um número maior que 0.";
            erroCapacidadeDef.style.display = "block";
            valido = false;
        } else {
            if (erroCapacidadeDef) erroCapacidadeDef.style.display = "none";
        }
    }

    return valido;
}


async function salvar() {
    if (!validarFormulario()) return;

    const fd = new FormData();

    // Captura os valores atuais da tela
    const tipoRecorrencia = document.getElementById("tipoRecorrencia")?.value ?? "avulsa";
    let valorDataHora = document.getElementById("dataHora")?.value;
    let valorHora = document.getElementById("hora")?.value;
    let valorDataInicio = document.getElementById("data_inicio")?.value;

    // ESTRATÉGIA ANTI-DISABLED: Se o campo estiver desabilitado, recupera o valor original do banco
    if (document.getElementById("dataHora")?.disabled) {
        valorDataHora = window._dataHoraOriginal;
    }
    if (document.getElementById("hora")?.disabled) {
        valorHora = window._horaOriginal;
    }
    if (document.getElementById("data_inicio")?.disabled) {
        valorDataInicio = window._dataInicioOriginal;
    }

    if (permissao.podeEditarBasico) {
        fd.append("titulo",          document.getElementById("titulo").value);
        fd.append("descricao",       document.getElementById("descricao").value);
        fd.append("pontoPartida",    document.getElementById("pontoPartida").value);
        fd.append("pontoChegada",    document.getElementById("pontoChegada").value);
        fd.append("tipoRecorrencia", tipoRecorrencia);

        if (tipoRecorrencia === "avulsa") {
            fd.append("dataHora", valorDataHora);
        } else {
            const dias = Array.from(document.querySelectorAll('input[name="dias[]"]:checked'))
                              .map(cb => cb.value);
            dias.forEach(d => fd.append("dias[]", d));
            fd.append("hora",        valorHora);
            fd.append("data_inicio", valorDataInicio);
        }
    } else {
        // Se ele NÃO pode editar o básico (ex: papel de motorista puro), 
        // ainda precisamos enviar as datas originais para o PHP não zerar o banco!
        fd.append("tipoRecorrencia", tipoRecorrencia);
        if (tipoRecorrencia === "avulsa") {
            fd.append("dataHora", valorDataHora);
        } else {
            fd.append("hora",        valorHora);
            fd.append("data_inicio", valorDataInicio);
        }
    }

    if (permissao.podeEditarPrecoCapacidade) {
        fd.append("preco",      document.getElementById("preco")?.value      ?? "");
        fd.append("capacidade", document.getElementById("capacidade")?.value ?? "");
        fd.append("veiculo_id", document.getElementById("veiculo_id")?.value ?? "");
    }

    try {
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