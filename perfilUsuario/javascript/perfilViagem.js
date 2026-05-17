document.addEventListener("DOMContentLoaded", () => {
    //valida_sessao();
    
    if (document.getElementById("listaViagem")) {
        carregarDadosViagem();
    }
});

const diasSemana = {
    0: 'Domingo',
    1: 'Segunda',
    2: 'Terça',
    3: 'Quarta',
    4: 'Quinta',
    5: 'Sexta',
    6: 'Sábado'
};

async function carregarDadosViagem() {
    const retorno = await fetch("../php/perfilViagem.php");
    const resposta = await retorno.json();

    if (resposta.status == "ok") {
        const registros = resposta.data;

        // agrupa por id da viagem
        const grupos = {};
        registros.forEach(objeto => {
            if (!grupos[objeto.id]) {
                grupos[objeto.id] = { ...objeto, dias: [] };
            }
            if (objeto.dia_semana !== null) {
                grupos[objeto.id].dias.push({
                    dia: objeto.dia_semana,
                    hora: objeto.hora_recorrencia,
                    data_inicio: objeto.data_inicio
                });
            }
        });

        let html = "";

        Object.values(grupos).forEach(objeto => {
            let recorrenciaHTML = "";

            if (objeto.tipoRecorrencia === 'recorrente' && objeto.dias.length > 0) {
                recorrenciaHTML = `
                    <p style="margin: 8px 0;">
                        <strong style="color: #bdc3c7;">Dias:</strong>
                        <span style="color: #ffffff;">${objeto.dias.map(d => diasSemana[d.dia]).join(', ')}</span>
                    </p>
                    <p style="margin: 8px 0;">
                        <strong style="color: #bdc3c7;">Horário:</strong>
                        <span style="color: #ffffff;">${objeto.dias[0].hora}</span>
                    </p>
                    <p style="margin: 8px 0;">
                        <strong style="color: #bdc3c7;">A partir de:</strong>
                        <span style="color: #ffffff;">${objeto.dias[0].data_inicio}</span>
                    </p>`;
            } else {
                recorrenciaHTML = `
                    <p style="margin: 8px 0;">
                        <strong style="color: #bdc3c7;">Data e Hora:</strong>
                        <span style="color: #ffffff;">${objeto.dataHora ?? '-'}</span>
                    </p>`;
            }

            html += `
                <div style="background: #1e2d3b; border: 1px solid #2a3b4c; padding: 15px; margin-bottom: 15px; border-radius: 8px; color: #ffffff; font-family: sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #3498db; margin-top: 0; border-bottom: 1px solid #2a3b4c; padding-bottom: 8px;">${objeto.titulo}</h2>

                    <p style="margin: 8px 0;">
                        <strong style="color: #bdc3c7;">Tipo de carona:</strong>
                        <span style="color: #2ecc71; font-weight: bold;">${objeto.tipoCarona}</span>
                    </p>
                    <p style="margin: 8px 0;">
                        <strong style="color: #bdc3c7;">Descrição:</strong>
                        <span style="color: #ffffff;">${objeto.descricao}</span>
                    </p>
                    <p style="margin: 8px 0;">
                        <strong style="color: #bdc3c7;">Partida:</strong>
                        <span style="color: #ffffff;">${objeto.pontoPartida}</span>
                    </p>
                    <p style="margin: 8px 0;">
                        <strong style="color: #bdc3c7;">Chegada:</strong>
                        <span style="color: #ffffff;">${objeto.pontoChegada}</span>
                    </p>
                    <p style="margin: 8px 0;">
                        <strong style="color: #bdc3c7;">Preço:</strong>
                        <span style="color: #ffffff;">R$ ${objeto.preco}</span>
                    </p>

                    ${recorrenciaHTML}


                    <div style="margin-top: 12px; display: center; gap: 8px;">
                        <a href="../html/alterarViagem.html?id=${objeto.id}'" 
                           style="background: #2980b9; color: white; border-radius: 4px; padding: 4px 10px; text-decoration: none; font-size: 0.9rem;">
                            ✏️ Alterar
                        </a>
                        <a href="#" onclick="excluirViagem(${objeto.id}"
                           style="background: #dc3545; color: white; border-radius: 4px; padding: 4px 10px; text-decoration: none; font-size: 0.9rem;">
                            🗑️ Excluir
                        </a>
                    </div>
                    
                </div>`;
        });

        document.getElementById("listaViagem").innerHTML = html;

    } else {
        console.log("Erro: " + resposta.mensagem);
        document.getElementById("SemViagensCadastradas").innerHTML = "Nenhuma viagem cadastrada no momento.";
    }
};

async function excluirViagem(id) {
    const retorno = await fetch("../php/excluirViagem.php?id=" + id);
    const resposta = await retorno.json();
    if (resposta.status == "ok") {
        console.log(resposta.mensagem);
        window.location.reload();
    } else {
        console.log("Erro: " + resposta.mensagem);
    }
}