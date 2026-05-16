document.addEventListener("DOMContentLoaded", () => {
    carregarSolicitacoes();
});

async function carregarSolicitacoes() {
    const response = await fetch("../../php/getSolicitacoesPendentes.php");
    const resposta = await response.json();
    const container = document.getElementById("listaSolicitacoes");

    if (container && resposta.status === "ok") {
        if (resposta.data.length === 0) {
            container.innerHTML = "<p style='color: #ffffff; font-style: italic; margin-top: 10px;'>Nenhuma solicitação pendente.</p>";
            return;
        }

        let html = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-family: sans-serif; text-align: left;">
                <thead>
                    <tr style="border-bottom: 2px solid #dee2e6;">
                        <th style="padding: 12px 10px; color: #ffffff;">Nome</th>
                        <th style="padding: 12px 10px; color: #ffffff;">Tipo de Vaga</th>
                        <th style="padding: 12px 10px; color: #ffffff;">Viagem/Grupo</th>
                        <th style="padding: 12px 10px; color: #ffffff; text-align: center;">Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;

        resposta.data.forEach(sol => {
            const tipoLabel = (sol.tipo_vaga === 'motorista') ? 
                '<span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">Motorista</span>' : 
                '<span style="background: #007bff; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">Passageiro</span>';

            html += `
                <tr style="border-bottom: 1px solid #dee2e6; transition: background 0.2s;">
                    <td style="padding: 12px 10px; color: #ffffff;">${sol.nome_passageiro}</td>
                    <td style="padding: 12px 10px;">${tipoLabel}</td> 
                    <td style="padding: 12px 10px; color: #ffffff;">${sol.titulo_viagem}</td>
                    <td style="padding: 12px 10px; text-align: center;">
                        <button onclick="responderSolicitacao(${sol.solicitacao_id}, 'aceito')" 
                                style="background: #28a745; color: white; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px; margin-right: 5px;">
                            Aceitar
                        </button>
                        <button onclick="responderSolicitacao(${sol.solicitacao_id}, 'recusado')" 
                                style="background: #dc3545; color: white; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px;">
                            Recusar
                        </button>
                    </td>
                </tr>`;
        });
        html += `
                </tbody>
            </table>
        `;
        container.innerHTML = html;
    }
}

async function responderSolicitacao(idSolicitacao, novoStatus) {
    const dados = { id: idSolicitacao, status: novoStatus };

    try {
        const response = await fetch("../php/atualizarSolicitacao.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        const resultado = await response.json();
        if (resultado.status === "ok") {
            carregarSolicitacoes();
        } else {
            alert("Erro ao atualizar solicitação: " + resultado.mensagem);
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}