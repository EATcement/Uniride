document.addEventListener("DOMContentLoaded", () => {
    carregarGrupos();
});

async function carregarGrupos() {
    try {
        const response = await fetch("../php/getGruposConfirmados.php");
        const resposta = await response.json();
        
        const containerConfirmados = document.getElementById("listaGruposConfirmados");
        const containerPendentes = document.getElementById("abaSolicitacoesPendentes");

        if (!containerConfirmados && !containerPendentes) {
            console.error("Os containers não foram encontrados no HTML!");
            return;
        }

        if (resposta.status !== "ok") return;

        let htmlConfirmados = "";
        let htmlPendentes = "";

        if (!resposta.data || resposta.data.length === 0) {
            if (containerConfirmados) containerConfirmados.innerHTML = `<p style="color:#95a5a6; font-style:italic; text-align:center;">Você não está em nenhum grupo confirmado ainda.</p>`;
            if (containerPendentes) containerPendentes.innerHTML = `<p style="color:#95a5a6; font-style:italic; text-align:center;">Nenhuma solicitação pendente.</p>`;
            return;
        }

        resposta.data.forEach(info => {
            const titulo = info.titulo || "Sem título";

            // ── CASO 1: SE O STATUS FOR ACEITO ──
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

                        <div style="margin-top: 12px; display: flex; justify-content: center; gap: 12px;">
                            ${botaoEditar}
                            <a href="../../chatMensagens/chat.html?grupo_viagem_id=${info.id}"
                               style="background:#dc3545; color:white; border:none; border-radius:4px;
                                      padding:4px 10px; cursor:pointer; text-decoration:none; font-size:0.9rem;">
                                💬 Chat
                            </a>
                        </div>
                    </div>`;
            } 
            
            // ── CASO 2: SE O STATUS FOR PENDENTE ──
            else {
                htmlPendentes += `
                    <div style="background:#1a242f; border:1px solid rgba(255,255,255,0.05); padding:15px;
                                margin-bottom:15px; border-radius:8px; color:#ffffff; opacity: 0.8;
                                font-family:sans-serif; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                        <h2 style="color:rgba(52, 152, 219, 0.6); margin-top:0; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">
                            ${titulo}
                        </h2>

                        <p style="margin:8px 0;">
                            <strong style="color:#bdc3c7;">Responsável:</strong>
                            <span style="color:#bdc3c7; font-weight:bold;">${info.responsavel}</span>
                        </p>

                        <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; padding: 10px; 
                                    border-radius: 6px; margin-top: 15px; color: #ffc107; font-weight: bold; text-align: center; font-size: 0.9rem;">
                            ⏳ Aguardando confirmação do motorista
                        </div>
                    </div>`;
            }
        });

        if (containerConfirmados) {
            containerConfirmados.innerHTML = htmlConfirmados || `<p style="color:#95a5a6; font-style:italic; text-align:center;">Você não está em nenhum grupo confirmado ainda.</p>`;
        }
        if (containerPendentes) {
            containerPendentes.innerHTML = htmlPendentes || `<p style="color:#95a5a6; font-style:italic; text-align:center;">Nenhuma solicitação pendente.</p>`;
        }

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

    const response = await fetch("../php/removerMembro.php", {
        method: "POST",
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
}