document.addEventListener("DOMContentLoaded", () => {
    carregarPerfil();
});

async function carregarPerfil() {
    try {
        const retorno = await fetch("../../php/getPerfil.php");
        const resposta = await retorno.json();

        if (resposta.status === "ok") {
            const usuario = resposta.data;
            
            // 1. Coloca o nome na mensagem de boas vindas com segurança
            const textoBoasVindas = document.getElementById("boasVindas");
            if (textoBoasVindas) {
                textoBoasVindas.innerHTML = `Bem vindo ao Uniride, <strong>${usuario.nome}</strong>!`;
            }

            // 2. Coloca a foto na Navbar usando o caminho absoluto (/uniride/)
            const imgNavbar = document.getElementById("navPerfilFoto");
            if (imgNavbar) {
                if (usuario.foto_perfil && usuario.foto_perfil !== "null" && usuario.foto_perfil !== "") {
                    imgNavbar.src = "/uniride/a-fotos-usuarios/" + usuario.foto_perfil;
                } else {
                    imgNavbar.src = "../../assets/icon-pessoa.png";
                }
            }
        }
    } catch (erro) {
        console.error("Erro ao carregar os dados do perfil na navbar:", erro);
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
    try {
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
                if (containerErro) containerErro.innerHTML = "Nenhuma carona disponível para o local pesquisado.";
            } else {
                if (containerErro) containerErro.innerHTML = "";
            }

            let html = '';

            for (const objeto of registros) {
                const ehMinhaCarona = (usuarioLogadoId && objeto.usuario_id == usuarioLogadoId);
                const jaEstaNoGrupo = (Number(objeto.ja_participa) === 1 || objeto.ja_participa === true);
                const temMotoristaAceito = Number(objeto.temMotorista);
                const vagaMotoristaOcupada = (temMotoristaAceito > 0 || objeto.tipoCarona === 'motorista');

                let footerEstatico = '';
                if (ehMinhaCarona) {
                    footerEstatico = `<span class="tag-minha-carona">Minha Carona</span>`;
                } else if (jaEstaNoGrupo) {
                    footerEstatico = `<button disabled class="btn-ja-solicitado">✓ Já solicitado</button>`;
                } else {
                    footerEstatico = `<span class="hint-selecionar">Clique para selecionar esta carona</span>`;
                }

                let botoesAcao = '';
                if (!ehMinhaCarona && !jaEstaNoGrupo) {
                    botoesAcao += `
                        <button class="btn-acao btn-passageiro" onclick="event.stopPropagation(); solicitarEntrada(${objeto.id}, 'passageiro')" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <img src="../../assets/icon-passageiro.png" alt="Ícone" style="width: 18px; height: 18px; object-fit: contain;">
                            Entrar como Passageiro
                        </button>`;

                    if (isMotoristaLogado) {
                        if (vagaMotoristaOcupada) {
                            botoesAcao += `<button disabled class="btn-acao btn-motorista-ocupado" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                                    <img src="../../assets/icon-bloqueado.png" alt="Ícone" style="width: 18px; height: 18px; object-fit: contain;">
                                    Motorista Ocupado
                                </button>`;
                        } else {
                            botoesAcao += `
                                <button class="btn-acao btn-motorista" onclick="event.stopPropagation(); solicitarEntrada(${objeto.id}, 'motorista')" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                                    <img src="../../assets/icon-carro.png" alt="Ícone" style="width: 18px; height: 18px; object-fit: contain;">
                                    Entrar como Motorista
                                </button>`;
                        }
                    }
                }

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

                const clicavel = (!ehMinhaCarona && !jaEstaNoGrupo) ? 'card-clicavel' : '';

                html += `
                    <div class="card-viagem ${clicavel}" data-id="${objeto.id}" onclick="selecionarCard(this)">
                        <div class="card-header">
                            <h3>${objeto.titulo}</h3>
                        </div>
                        <div class="card-body">
                            <p style="text-transform: capitalize;"><strong>Tipo do grupo:</strong><br>${tipoExibido}</p>
                            <p><strong>Descrição:</strong><br>${objeto.descricao}</p>
                            <p style="text-transform: capitalize;"><strong>Partida:</strong><br>${objeto.pontoPartida}</p>
                            <p style="text-transform: capitalize;"><strong>Chegada:</strong><br>${objeto.pontoChegada}</p>
                            <p><strong>Preço:</strong><br>R$ ${objeto.preco ?? '0'}</p>
                            ${recorrenciaHtml}
                        </div>
                        <div class="card-footer">
                            <div class="footer-estatico">${footerEstatico}</div>
                            <div class="footer-acoes" style="display:none;">
                                ${botoesAcao}
                            </div>
                        </div>
                    </div>`;
            }

            const listaHTML = document.getElementById("lista");
            if (listaHTML) listaHTML.innerHTML = html;

        } else {
            console.log("Erro ao carregar viagens: " + resposta.mensagem);
        }
    } catch (erro) {
        console.error("Erro na requisição de viagens:", erro);
    }
}

async function solicitarEntrada(viagemId, tipoVaga = 'passageiro') {
    if (!usuarioLogadoId) {
        await Swal.fire({
            title: "Atenção!",
            text: "Você precisa estar logado!",
            icon: "warning",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff2448"
        });
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

        // Se o status mapeado for o bloqueio por falta de vagas
        if (result.status === "vagas_esgotadas") {
            await Swal.fire({
                title: "Não foi possível solicitar entrada",
                text: "carona sem vagas disponíveis",
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
        } else {
            // Comportamento padrão para sucesso ou outros erros cadastrados
            await Swal.fire({
                title: result.status === "ok" ? "Sucesso!" : "Erro!",
                text: result.mensagem,
                icon: result.status === "ok" ? "success" : "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
        }
        carregarDados();
    } catch (error) {
        console.error(error);
        await Swal.fire({
            title: "Erro!",
            text: "Erro ao enviar solicitação.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff2448"
        });
    }
}

function selecionarCard(card) {
    if (!card.classList.contains('card-clicavel')) return;

    const jaSelecionado = card.classList.contains('card-selecionado');

    document.querySelectorAll('.card-viagem.card-selecionado').forEach(c => {
        c.classList.remove('card-selecionado');
        c.querySelector('.footer-estatico').style.display = '';
        c.querySelector('.footer-acoes').style.display = 'none';
    });

    if (!jaSelecionado) {
        card.classList.add('card-selecionado');
        card.querySelector('.footer-estatico').style.display = 'none';
        card.querySelector('.footer-acoes').style.display = 'flex';
    }
}