document.addEventListener("DOMContentLoaded", () => {
    carregarGrupos();
    carregarViagens();
});

function formatarDataBR(dataIso) {
    if (!dataIso || dataIso === '-') return '-';
    const apenasData = dataIso.split(' ')[0]; 
    if (!apenasData.includes('-')) return dataIso;

    const [ano, mes, dia] = apenasData.split('-');
    return `${dia}/${mes}/${ano}`;
}

async function carregarGrupos() {
    try {
        const response = await fetch("../php/getGruposConfirmados.php", {
            credentials: "include"
        });
        const resposta = await response.json();

        const containerConfirmados = document.getElementById("listaGruposConfirmados");
        const containerPendentes   = document.getElementById("abaSolicitacoesPendentes");
        const containerFinalizados = document.getElementById("listaViagemFinalizada");
        const semGrupos            = document.getElementById("SemGruposFinalizados");

        if (!containerConfirmados && !containerPendentes) {
            console.error("Os containers não foram encontrados no HTML!");
            return;
        }

        if (resposta.status !== "ok" || !resposta.data || resposta.data.length === 0) {
            if (containerConfirmados) containerConfirmados.innerHTML = `<p style="color:#95a5a6; font-style:italic; text-align:center;">Você não está em nenhum grupo confirmado ainda.</p>`;
            if (containerPendentes)   containerPendentes.innerHTML   = `<p style="color:#95a5a6; font-style:italic; text-align:center;">Nenhuma solicitação pendente.</p>`;
            if (containerFinalizados) containerFinalizados.innerHTML = "";
            if (semGrupos)            semGrupos.textContent          = "Você não possui grupos finalizados.";
            return;
        }

        let htmlConfirmados = "";
        let htmlPendentes   = "";
        let htmlFinalizados = "";

        resposta.data.forEach(info => {
            const titulo = info.titulo || "Sem título";

            if (info.statusGrupo === 'finalizado') {
                htmlFinalizados += `
                    <div style="background:#1a242f; border:1px solid rgba(255,255,255,0.05); padding:15px;
                                margin-bottom:15px; border-radius:8px; color:#ffffff; opacity:0.8;
                                font-family:sans-serif;">
                        <h2 style="color:rgba(52,152,219,0.6); margin-top:0; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">
                            ${titulo}
                        </h2>
                        <p style="margin:8px 0;">
                            <strong style="color:#bdc3c7;">Responsável:</strong>
                            <span style="color:#bdc3c7; font-weight:bold;">${info.responsavel}</span>
                        </p>
                        <p style="margin:8px 0;">
                            <strong style="color:#bdc3c7;">Motorista:</strong>
                            <span style="color:#bdc3c7;">${info.motorista || 'Sem motorista'}</span>
                        </p>
                        
                        <div style="margin-top:15px; display:flex; justify-content:center; gap:10px;">
                            <a href="../html/avaliacaoGrupo.html?id=${info.id}"
                                style="background:#f1c40f; color:#1a242f; padding:6px 14px;
                                    border-radius:4px; text-decoration:none; font-size:0.9rem;
                                    font-weight:bold; display:inline-flex; align-items:center; gap:5px;
                                    transition: background 0.2s;"
                            onmouseover="this.style.background='#f39c12'"
                            onmouseout="this.style.background='#f1c40f'">
                                ⭐ Avaliar Carona
                            </a>
                        </div>
                    </div>`;
            }

            if (info.statusGrupo !== 'active' && info.statusGrupo !== 'ativo') return;

            if (info.status_grupo === 'aceito') {
                let listaPassageirosHTML = "";

                if (!info.passageiros || info.passageiros.length === 0) {
                    listaPassageirosHTML = `
                        <li style="color:#95a5a6; font-style:italic; padding:10px 0; text-align:center; width:100%;">
                            🚫 Nenhum passageiro registrado neste grupo ainda.
                        </li>`;
                } else {
                    listaPassageirosHTML = info.passageiros.map(p => {
                        if (!p) return `<li style="color:#95a5a6; font-style:italic;">Vaga livre</li>`;

                        let botaoExcluir = "";
                        if (info.sou_dono && p !== info.responsavel) {
                            botaoExcluir = `
                                <button onclick="removerMembro('${p}', '${titulo}')"
                                        style="background:#dc3545; color:white; border:none; padding:2px 8px;
                                               border-radius:4px; cursor:pointer; font-size:11px;
                                               font-weight:bold; margin-left:10px;">
                                    Excluir
                                </button>`;
                        }

                        return `
                            <li style="padding:6px 0; border-bottom:1px dashed #2a3b4c; display:flex;
                                       align-items:center; justify-content:center; gap:10px; width:100%;
                                       max-width:350px; margin:0 auto; color:#ffffff;">
                                <span>👤 ${p}</span>
                                ${botaoExcluir}
                            </li>`;
                    }).join('');
                }

                let botaoEditar = "";
                if (info.sou_dono || info.sou_motorista) {
                    botaoEditar = `
                        <a href="alterarViagem.html?id=${info.id}"
                           style="background:#2980b9; color:white; border:none; border-radius:4px;
                                  padding:4px 10px; cursor:pointer; text-decoration:none;
                                  font-size:0.9rem; margin-left:8px;">
                            ✏️ Alterar
                        </a>`;
                }

                htmlConfirmados += `
                    <div style="background:#1e2d3b; border:1px solid #2a3b4c; padding:15px;
                                margin-bottom:15px; border-radius:8px; color:#ffffff;
                                font-family:sans-serif; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color:#3498db; margin-top:0; border-bottom:1px solid #2a3b4c; padding-bottom:8px;">
                            ${titulo}
                        </h2>
                        <p style="margin:8px 0;">
                            <strong style="color:#bdc3c7;">${info.papel_responsavel || 'Responsável'}:</strong>
                            <span style="color:#2ecc71; font-weight:bold;">${info.responsavel}</span>
                        </p>
                        <p style="margin:8px 0;">
                            <strong style="color:#bdc3c7;">Motorista do Veículo:</strong>
                            <span style="color:#3498db; font-weight:bold;">${info.motorista || 'Sem motorista'}</span>
                        </p>
                        <p style="margin:15px 0 5px 0; text-align:center; color:#ecf0f1; font-weight:bold;">
                            Passageiros no grupo:
                        </p>
                        <ul style="list-style:none; padding-left:0; margin:0;">
                            ${listaPassageirosHTML}
                        </ul>
                        <br>
                        <div style="margin-top:12px; display:flex; justify-content:center; gap:12px;">
                            ${botaoEditar}
                            <a href="../../chatMensagens/chat.html?grupo_viagem_id=${info.id}"
                               style="background:#dc3545; color:white; border:none; border-radius:4px;
                                      padding:4px 10px; cursor:pointer; text-decoration:none; font-size:0.9rem;">
                                💬 Chat
                            </a>
                        </div>
                    </div>`;

            } else if (info.status_grupo === 'pendente') {
                htmlPendentes += `
                    <div style="background:#1a242f; border:1px solid rgba(255,255,255,0.05); padding:15px;
                                margin-bottom:15px; border-radius:8px; color:#ffffff; opacity:0.8;
                                font-family:sans-serif; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                        <h2 style="color:rgba(52,152,219,0.6); margin-top:0; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">
                            ${titulo}
                        </h2>
                        <p style="margin:8px 0;">
                            <strong style="color:#bdc3c7;">Responsável:</strong>
                            <span style="color:#bdc3c7; font-weight:bold;">${info.responsavel}</span>
                        </p>
                        <div style="background:rgba(255,193,7,0.1); border:1px solid #ffc107; padding:10px;
                                    border-radius:6px; margin-top:15px; color:#ffc107; font-weight:bold;
                                    text-align:center; font-size:0.9rem;">
                            ⏳ Aguardando confirmação do motorista
                        </div>
                    </div>`;
            }
        });

        if (containerConfirmados) containerConfirmados.innerHTML = htmlConfirmados || `<p style="color:#95a5a6; font-style:italic; text-align:center;">Você não está em nenhum grupo confirmado ainda.</p>`;
        if (containerPendentes)   containerPendentes.innerHTML   = htmlPendentes || `<p style="color:#95a5a6; font-style:italic; text-align:center;">Nenhuma solicitação pendente.</p>`;
        if (containerFinalizados) containerFinalizados.innerHTML = htmlFinalizados || "";
        if (semGrupos)            semGrupos.textContent          = htmlFinalizados ? "" : "Você não possui grupos finalizados.";

    } catch (erro) {
        console.error("Erro ao renderizar grupos:", erro);
    }
}

async function removerMembro(nomePassageiro, tituloViagem) {
    const confirmacao = await Swal.fire({
        title: "Remover passageiro?",
        text: `Deseja realmente remover ${nomePassageiro} do grupo "${tituloViagem}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, remover",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#ff2448",
    });

    if (!confirmacao.isConfirmed) return;

    try {
        const response = await fetch("../php/removerMembro.php", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome_passageiro: nomePassageiro, titulo_viagem: tituloViagem })
        });

        const resultado = await response.json();

        if (resultado.status === "ok") {
            carregarGrupos();
        } else {
            await Swal.fire({
                title: "Erro!",
                text: "Erro ao remover: " + resultado.mensagem,
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
        }
    } catch (e) {
        console.error("Erro ao remover membro:", e);
        await Swal.fire({
            title: "Erro de conexão!",
            text: "Não foi possível conectar ao servidor. Tente novamente.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff2448"
        });
    }
}

function formatarDataHoraBR(dataHoraIso) {
    if (!dataHoraIso || dataHoraIso === '-') return '-';
    
    if (!dataHoraIso.includes(' ')) {
        return formatarDataBR(dataHoraIso); 
    }

    const [dataParte, horaParte] = dataHoraIso.split(' ');

    const [ano, mes, dia] = dataParte.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;

    const [hora, minuto] = horaParte.split(':');
    const horaFormatada = `${hora}:${minuto}`;

    return `${dataFormatada} às ${horaFormatada}`;
}

async function carregarViagens() {
    try {
        const response = await fetch("../php/perfilViagem.php", {
            credentials: "include"
        });
        const resposta = await response.json();

        const container   = document.getElementById("listaViagem");
        const semViagens  = document.getElementById("SemViagensCadastradas");

        if (!container) return;

        if (resposta.status !== "ok" || resposta.data.length === 0) {
            if (semViagens) semViagens.textContent = "Você ainda não cadastrou nenhum grupo.";
            container.innerHTML = "";
            return;
        }

        const grupos = {};
        resposta.data.forEach(reg => {
            if (!grupos[reg.id]) {
                grupos[reg.id] = { ...reg, dias: [] };
            }
            if (reg.dia_semana !== null && reg.dia_semana !== undefined) {
                grupos[reg.id].dias.push({
                    dia:         reg.dia_semana,
                    hora:        reg.hora_recorrencia,
                    data_inicio: reg.data_inicio
                });
            }
        });

        const diasSemana = {
            0: 'Domingo', 1: 'Segunda', 2: 'Terça', 3: 'Quarta',
            4: 'Quinta',  5: 'Sexta',   6: 'Sábado'
        };

        let html = '';
        let temGrupoAtivo = false;

        Object.values(grupos).forEach(reg => {
            if (reg.statusGrupo === 'finalizado') return;

            temGrupoAtivo = true;

            let recorrenciaHtml = '';
            if (reg.tipoRecorrencia === 'recorrente' && reg.dias.length > 0) {
                const dataFormatada = formatarDataBR(reg.dias[0].data_inicio);

                const horaRecorrente = reg.dias[0].hora ? reg.dias[0].hora.slice(0, 5) : '-';

                recorrenciaHtml = `
                    <p><strong>Dias:</strong> ${reg.dias.map(d => diasSemana[d.dia]).join(', ')}</p>
                    <p><strong>Horário:</strong> ${horaRecorrente}</p>
                    <p><strong>A partir de:</strong> ${dataFormatada}</p>`;
            } else {
                const dataHoraFormatada = formatarDataHoraBR(reg.dataHora);
                recorrenciaHtml = `<p><strong>Data e Hora:</strong> ${dataHoraFormatada}</p>`;
            }

            const tipoExibido = (reg.tipoCarona === 'motorista') ? 'Oferta de carona' : 'Solicitação de carona';

            html += `
                <div class="card-viagem" style="margin-bottom:16px; padding:14px;
                     background:#1e2d3b; border:1px solid #2a3b4c; border-radius:8px; color:#fff;">
                    <h3 style="color:#3498db; margin-top:0;">${reg.titulo}</h3>
                    <p><strong>Tipo:</strong> ${tipoExibido}</p>
                    <p><strong>Descrição:</strong> ${reg.descricao ?? '-'}</p>
                    <p><strong>Partida:</strong> ${reg.pontoPartida}</p>
                    <p><strong>Chegada:</strong> ${reg.pontoChegada}</p>
                    ${recorrenciaHtml}
                    
                    <div style="margin-top: 20px; display: flex; justify-content: center; gap: 12px;">                        
                        <a href="alterarViagem.html?id=${reg.id}"
                           style="background:#2980b9; color:white; padding:4px 10px;
                                  border-radius:4px; text-decoration:none; font-size:0.9rem;">
                            ✏️ Alterar
                        </a>
                        <button onclick="excluirViagem(${reg.id})"
                                style="background:#dc3545; color:white; padding:4px 10px;
                                       border:none; border-radius:4px; cursor:pointer; font-size:0.9rem;">
                            🗑️ Excluir
                        </button>
                        <button onclick="finalizarGrupo(${reg.id})"
                                style="background:#e67e22; color:white; padding:4px 10px;
                                border:none; border-radius:4px; cursor:pointer; font-size:0.9rem;">
                            ✅ Finalizar
                        </button>
                    </div>
                </div>`;
        });

        if (!temGrupoAtivo) {
            if (semViagens) semViagens.textContent = "Você ainda não cadastrou nenhum grupo ativo.";
            container.innerHTML = "";
        } else {
            if (semViagens) semViagens.textContent = "";
            container.innerHTML = html;
        }

    } catch (e) {
        console.error("Erro ao carregar viagens:", e);
    }
}

async function excluirViagem(id) {
    const confirmado = await Swal.fire({
        title: "Tem certeza?",
        text: "Isso removerá o grupo e todas as solicitações associadas.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#636e72"
    });

    if (!confirmado.isConfirmed) return;

    try {
        const response = await fetch(`../php/excluirViagem.php?id=${id}`, {
            method: "POST",
            credentials: "include"
        });
        const resultado = await response.json();

        if (resultado.status === "ok") {
            Swal.fire({
                title: "Excluído!",
                text: resultado.mensagem,
                icon: "success",
                confirmButtonColor: "#ff2448"
            });
            carregarViagens();
            carregarGrupos();
        } else {
            Swal.fire({
                title: "Erro!",
                text: resultado.mensagem,
                icon: "error",
                confirmButtonColor: "#ff2448"
            });
        }
    } catch (e) {
        console.error("Erro ao excluir:", e);
    }
}

async function finalizarGrupo(id) {
    const confirmacao = await Swal.fire({
        title: "Finalizar grupo?",
        text: "Essa ação marcará o grupo como finalizado.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, finalizar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#e67e22"
    });

    if (!confirmacao.isConfirmed) return;

    try {
        const response = await fetch("../php/finalizarGrupo.php", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });

        const resultado = await response.json();

        if (resultado.status === "ok") {
            // Alerta limpo e direto, sem forçar avaliação
            await Swal.fire({
                title: "Finalizado!",
                text: "Grupo concluído com sucesso.",
                icon: "success",
                confirmButtonColor: "#2a3b4c",
                confirmButtonText: "OK"
            });
            
            // Em vez de redirecionar para a avaliação, atualiza os dados na tela atual
            carregarViagens();
            carregarGrupos();
            
        } else {
            Swal.fire({
                title: "Erro!",
                text: resultado.mensagem,
                icon: "error",
                confirmButtonColor: "#ff2448"
            });
        }
    } catch (e) {
        console.error("Erro ao finalizar:", e);
    }
}