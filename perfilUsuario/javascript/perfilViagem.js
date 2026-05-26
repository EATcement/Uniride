document.addEventListener("DOMContentLoaded", () => {
    carregarViagens();
});

function formatarDataBR(dataBanco) {
    if (!dataBanco || dataBanco === '-') return '-';
    const apenasData = dataBanco.split(' ')[0]; 
    const dataObj = new Date(`${apenasData}T00:00:00`);
    
    if (isNaN(dataObj.getTime())) return dataBanco;
    return dataObj.toLocaleDateString('pt-BR'); 
}

function formatarDataHoraBR(dataHoraBanco) {
    if (!dataHoraBanco || dataHoraBanco === '-') return '-';
    const dataObj = new Date(dataHoraBanco.replace(' ', 'T'));
    
    if (isNaN(dataObj.getTime())) return dataHoraBanco;

    const dataFormatada = dataObj.toLocaleDateString('pt-BR');
    const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
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

        if (semViagens) semViagens.textContent = "";

        // Agrupa registros por id (viagens recorrentes têm uma linha por dia)
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

        Object.values(grupos).forEach(reg => {
            let recorrenciaHtml = '';
            if (reg.tipoRecorrencia === 'recorrente') {
                const primeiroDia = reg.dias[0] || {};
                
                const dataBruta = primeiroDia.data_inicio || reg.data_inicio;
                const dataInicioFormatada = formatarDataBR(dataBruta);
                
                const horaBruta = primeiroDia.hora || reg.hora_recorrencia || '-';
                const horaFormatada = horaBruta !== '-' ? horaBruta.substring(0, 5) : '-';
                
                const textoDias = reg.dias.length > 0 
                    ? reg.dias.map(d => diasSemana[d.dia]).join(', ') 
                    : 'Dias não definidos';

                recorrenciaHtml = `
                    <p><strong>Dias:</strong> ${textoDias}</p>
                    <p><strong>Horário:</strong> ${horaFormatada}</p>
                    <p><strong>A partir de:</strong> ${dataInicioFormatada}</p>`;
            } else {
                // Formata a carona avulsa usando a função correspondente
                const dataHoraFormatada = formatarDataHoraBR(reg.dataHora);
                recorrenciaHtml = `<p><strong>Data e Hora:</strong> ${dataHoraFormatada}</p>`;
            }

            const tipoExibido = (reg.tipoCarona === 'motorista')
                ? 'Oferta de carona'
                : 'Solicitação de carona';

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

        container.innerHTML = html;

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
            Swal.fire({
                title: "Finalizado!",
                text: resultado.mensagem,
                icon: "success",
                confirmButtonColor: "#ff2448"
            });
            carregarViagens();
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