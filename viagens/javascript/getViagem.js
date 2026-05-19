
document.addEventListener("DOMContentLoaded", () => {
    carregarPerfil();
});

async function carregarPerfil() {
    const retorno  = await fetch("../../php/getPerfil.php");
    const resposta = await retorno.json();

    if (resposta.status === "ok") {
        const usuario = resposta.data;
        document.getElementById("boasVindas").innerHTML =
            `Bem vindo ao Uniride, <strong>${usuario.nome}</strong>!`;
    }
}

let usuarioLogadoId   = null;
let isMotoristaLogado = false;

const diasSemana = {
    0: 'Domingo', 1: 'Segunda', 2: 'Terça', 3: 'Quarta',
    4: 'Quinta',  5: 'Sexta',   6: 'Sábado'
};

document.addEventListener("DOMContentLoaded", async () => {
    await buscarUsuarioLogado();

    if (document.getElementById("lista")) {
        await carregarDados();

        const campoBusca = document.getElementById("buscarCarona");
        if (campoBusca) campoBusca.addEventListener("input", carregarDados);
    }
});

async function buscarUsuarioLogado() {
    try {
        const response = await fetch("../../php/getSessao.php");
        if (!response.ok) {
            console.error("Sessão não encontrada. Status:", response.status);
            return;
        }
        const dados = await response.json();
        if (dados.logado || dados.id || dados.usuario_id) {
            usuarioLogadoId   = dados.id || dados.usuario_id;
            const statusMot   = dados.isMotorista ?? dados.motorista ?? 0;
            isMotoristaLogado = (Number(statusMot) === 1);
        }
    } catch (e) {
        console.error("Erro ao ler a sessão:", e);
    }
}

const botaoNovo = document.getElementById("novaViagem");
if (botaoNovo) {
    botaoNovo.addEventListener("click", () => {
        window.location.href = '../html/novaViagem.html';
    });
}

async function carregarDados() {
    const retorno  = await fetch("../php/getViagem.php");
    const resposta = await retorno.json();

    if (resposta.status === "ok") {
        const filtro = document.getElementById("buscarCarona").value.toLowerCase().trim();

   
        const grupos = {};
        resposta.data.forEach(objeto => {
            if (!grupos[objeto.id]) {
                grupos[objeto.id] = { ...objeto, dias: [] };
            }
            if (objeto.dia_semana !== null) {
                grupos[objeto.id].dias.push({
                    dia:         objeto.dia_semana,
                    hora:        objeto.hora_recorrencia,
                    data_inicio: objeto.data_inicio
                });
            }
        });

        const registros = Object.values(grupos).filter(objeto =>
            objeto.pontoPartida.toLowerCase().includes(filtro) ||
            objeto.pontoChegada.toLowerCase().includes(filtro)
        );

        const containerErro = document.getElementById("semCaronasDisponiveis");
        if (registros.length === 0) {
            containerErro.innerHTML = "Nenhuma carona disponível para o local pesquisado.";
        } else {
            containerErro.innerHTML = "";
        }

        let html = '';

        for (const objeto of registros) {
            let acaoBotao = "";

            if (usuarioLogadoId && objeto.usuario_id == usuarioLogadoId) {
                acaoBotao = "<span>Minha Carona</span>";
            } else {
                const jaEstaNoGrupo = (Number(objeto.ja_participa) === 1 || objeto.ja_participa === true);

                if (jaEstaNoGrupo) {
                    acaoBotao = `<button disabled style="background:#7f8c8d; color:white; cursor:not-allowed;">✓ Já solicitado</button>`;
                } else {
                    acaoBotao = `<button onclick="solicitarEntrada(${objeto.id}, 'passageiro')">Entrar como Passageiro</button>`;
                }

                if (isMotoristaLogado && !jaEstaNoGrupo) {
                    const temMotoristaAceito  = Number(objeto.temMotorista);
                    // Vaga de motorista ocupada se: já tem motorista aceito OU o próprio criador é o motorista (oferta)
                    const vagaMotoristaOcupada = (temMotoristaAceito > 0 || objeto.tipoCarona === 'motorista');

                    if (vagaMotoristaOcupada) {
                        acaoBotao += `<button disabled style="background:gray; color:white;">Motorista Ocupado</button>`;
                    } else {
                        acaoBotao += `<button onclick="solicitarEntrada(${objeto.id}, 'motorista')" style="background:green; color:white;">Entrar como Motorista</button>`;
                    }
                }
            }

            // Recorrência
            let recorrenciaHtml = '';
            if (objeto.tipoRecorrencia === 'recorrente' && objeto.dias.length > 0) {
                recorrenciaHtml = `
                    <p><strong>Dias:</strong><br>${objeto.dias.map(d => diasSemana[d.dia]).join(', ')}</p>
                    <p><strong>Horário:</strong><br>${objeto.dias[0].hora}</p>
                    <p><strong>A partir de:</strong><br>${objeto.dias[0].data_inicio}</p>`;
            } else {
                recorrenciaHtml = `<p><strong>Data e Hora:</strong><br>${objeto.dataHora ?? '-'}</p>`;
            }

            const tipoExibido = (objeto.tipoCarona === 'motorista')
                ? 'Oferta de carona'
                : 'Solicitação de carona';

            html += `
                <div class="card-viagem">
                    <div class="card-header">
                        <h3>${objeto.titulo}</h3>
                    </div>
                    <div class="card-body">
                        <p><strong>Tipo do grupo:</strong><br>${tipoExibido}</p>
                        <p><strong>Descrição:</strong><br>${objeto.descricao}</p>
                        <p><strong>Partida:</strong><br>${objeto.pontoPartida}</p>
                        <p><strong>Chegada:</strong><br>${objeto.pontoChegada}</p>
                        <p><strong>Preço:</strong><br>R$ ${objeto.preco ?? '0'}</p>
                        ${recorrenciaHtml}
                    </div>
                    <div class="card-footer">
                        ${acaoBotao}
                    </div>
                </div>`;
        }

        document.getElementById("lista").innerHTML = html;

    } else {
        console.log("Erro: " + resposta.mensagem);
    }
}

async function solicitarEntrada(viagemId, tipoVaga = 'passageiro') {
    if (!usuarioLogadoId) {
        alert("Você precisa estar logado!");
        return;
    }

    const dados = {
        viagem_id:      viagemId,
        solicitante_id: usuarioLogadoId,
        tipo_vaga:      tipoVaga
    };

    try {
        const response = await fetch("../../php/postSolicitacao.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
        const result = await response.json();
        alert(result.mensagem);
        carregarDados();
    } catch (error) {
        console.error(error);
        alert("Erro ao enviar solicitação.");
    }
}
