
document.addEventListener("DOMContentLoaded", () => {
    carregarGrupos();
});

async function carregarGrupos() {
    try {
        const response = await fetch("../php/getGruposConfirmados.php");
        const resposta = await response.json();
        const container = document.getElementById("listaGrupos");

        if (!container || resposta.status !== "ok") return;

        if (resposta.data.length === 0) {
            container.innerHTML = `<li style="color:#95a5a6; font-style:italic; text-align:center; list-style:none; margin-top:20px;">Nenhum grupo ativo ainda.</li>`;
            return;
        }

        let html = "";

        resposta.data.forEach(info => {
            const titulo = info.titulo;

            let listaPassageirosHTML = "";

            if (info.passageiros.length === 0) {
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

            // ── Botão de editar Aparece para info.sou_dono = true(CRIADOR) info.sou_motorista = true (MOTORISTA Q N CRIOU O GRUPO)
            let botaoEditar = "";
            if (info.sou_dono || info.sou_motorista) {
                botaoEditar = `
                    <a href="alterarViagem.html?id=${info.id}"
                       style="background:#e67e22; color:white; border:none; border-radius:4px;
                              padding:4px 10px; cursor:pointer; text-decoration:none;
                              font-size:0.9rem; margin-left:8px;">
                        ✏️ Editar
                    </a>`;
            }

            html += `
                <div style="background:#1e2d3b; border:1px solid #2a3b4c; padding:15px;
                            margin-bottom:15px; border-radius:8px; color:#ffffff;
                            font-family:sans-serif; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color:#3498db; margin-top:0; border-bottom:1px solid #2a3b4c; padding-bottom:8px;">
                        ${titulo}
                    </h2>

                    <p style="margin:8px 0;">
                        <strong style="color:#bdc3c7;">${info.papel_responsavel}:</strong>
                        <span style="color:#2ecc71; font-weight:bold;">${info.responsavel}</span>
                    </p>

                    <p style="margin:8px 0;">
                        <strong style="color:#bdc3c7;">Motorista do Carro:</strong>
                        <span style="color:#3498db; font-weight:bold;">${info.motorista}</span>
                    </p>

                    <p style="margin:15px 0 5px 0; text-align:center; color:#ecf0f1; font-weight:bold;">
                        Passageiros no grupo:
                    </p>
                    <ul style="list-style:none; padding-left:0; margin:0;">
                        ${listaPassageirosHTML}
                    </ul>

                    <br>

                    <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                        <a href="../../chatMensagens/chat.html?grupo_viagem_id=${info.id}"
                           style="background:#2980b9; color:white; border:none; border-radius:4px;
                                  padding:4px 10px; cursor:pointer; text-decoration:none; font-size:0.9rem;">
                            💬 Chat
                        </a>
                        ${botaoEditar}
                    </div>
                </div>`;
        });

        container.innerHTML = html;

    } catch (erro) {
        console.error("Erro ao renderizar grupos:", erro);
    }
}

async function removerMembro(nomePassageiro, tituloViagem) {
    if (!confirm(`Deseja realmente remover ${nomePassageiro} do grupo "${tituloViagem}"?`)) return;

    const response = await fetch("../php/removerMembro.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome_passageiro: nomePassageiro, titulo_viagem: tituloViagem })
    });

    const resultado = await response.json();
    if (resultado.status === "ok") {
        carregarGrupos();
    } else {
        alert("Erro ao remover: " + resultado.mensagem);
    }
}
