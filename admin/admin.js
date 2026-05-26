let todosUsuarios = [];

async function verificarAdmin() {
    try {
        const res    = await fetch("../php/getSessao.php");
        const sessao = await res.json();

        if (!sessao.logado || !sessao.isAdmin) {
            window.location.href = "../home/index.html";
            return;
        }

        const spanNome = document.getElementById("adminNome");
        if (spanNome) spanNome.textContent = "Olá, " + sessao.nome;

        await carregarUsuarios();
    } catch (e) {
        console.error("Erro:", e);
        window.location.href = "../home/index.html";
    }
}

async function carregarUsuarios() {
    try {
        const res     = await fetch("../php/getUsuarios.php");
        const retorno = await res.json();

        document.getElementById("loadingMsg").style.display = "none";

        if (retorno.status === "ok") {
            todosUsuarios = retorno.data;
            renderizarTabela(todosUsuarios);
        } else {
            document.getElementById("emptyState").style.display = "block";
        }
    } catch (e) {
        document.getElementById("loadingMsg").textContent = "Erro ao carregar usuários.";
    }
}

function renderizarTabela(usuarios) {
    const tbody      = document.getElementById("corpoTabela");
    const tabela     = document.getElementById("tabelaUsuarios");
    const emptyState = document.getElementById("emptyState");
    const countLabel = document.getElementById("countLabel");

    tbody.innerHTML = "";

    if (usuarios.length === 0) {
        tabela.style.display     = "none";
        emptyState.style.display = "block";
        countLabel.textContent   = "";
        return;
    }

    tabela.style.display     = "table";
    emptyState.style.display = "none";
    countLabel.textContent   = `${usuarios.length} usuário(s) encontrado(s)`;

    usuarios.forEach(u => {
        const tr = document.createElement("tr");
        tr.style.cursor = "pointer";
        tr.style.transition = "background-color 0.2s ease";
        
        // Configura o clique para selecionar a linha
        tr.onclick = () => selecionarUsuario(tr);

        const fotoSrc = (u.foto_perfil && u.foto_perfil !== "null" && u.foto_perfil !== "")
            ? "/uniride/a-fotos-usuarios/" + u.foto_perfil
            : "../assets/icon-pessoa.png";

        const nascimento = u.nascimento
            ? new Date(u.nascimento + "T00:00:00").toLocaleDateString("pt-BR")
            : "—";

        const tipoHTML = Number(u.motorista) === 1
            ? `<span class="badge badge-motorista">Motorista</span>`
            : `<span class="badge badge-passageiro">Passageiro</span>`;

        const statusHTML = (u.status === "banido")
            ? `<span class="badge badge-banido">Banido</span>`
            : `<span class="badge badge-ativo">Ativo</span>`;

        // botao
        tr.innerHTML = `
            <td><img src="${fotoSrc}" alt="Foto" class="user-foto" onerror="this.src='../assets/icon-pessoa.png'"></td>
            <td>${escapeHTML(u.nome)}</td>
            <td>${escapeHTML(u.email)}</td>
            <td>${nascimento}</td>
            <td>${tipoHTML}</td>
            <td>${statusHTML}</td>
            <td style="text-align: center; vertical-align: middle; width: 60px;">
                <button class="btn-info-plus" 
                        style="display: none; background-color: #ef233e; color: white; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 1.3rem; cursor: pointer; font-weight: bold; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3); padding: 0; line-height: 1;" 
                        onclick="event.stopPropagation(); abrirCardUsuario(${u.id_usuario || u.id})">+</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// selecionar usuario
function selecionarUsuario(linhaClicada) {

    const todasLinhas = document.querySelectorAll("#corpoTabela tr");
    todasLinhas.forEach(tr => {
        tr.style.setProperty("background-color", "", "important");
        tr.style.setProperty("border-left", "none", "important");
        
        const btn = tr.querySelector(".btn-info-plus");
        if (btn) {
            btn.style.setProperty("display", "none", "important");
        }
    });
    
    linhaClicada.style.setProperty("background-color", "rgba(239, 35, 62, 0.15)", "important");
    linhaClicada.style.setProperty("border-left", "4px solid #ef233e", "important");
    
    const btnAtivo = linhaClicada.querySelector(".btn-info-plus");
    if (btnAtivo) {
        btnAtivo.style.setProperty("display", "inline-flex", "important");
    }
}

document.getElementById("buscarUsuario").addEventListener("input", function () {
    const termo = this.value.toLowerCase().trim();
    const filtrados = todosUsuarios.filter(u =>
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo)
    );
    renderizarTabela(filtrados);
});

function escapeHTML(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// modal
async function abrirCardUsuario(usuarioId) {
    const modal = document.getElementById("modalUsuario");
    const loading = document.getElementById("loadingModal");
    const conteudo = document.getElementById("conteudoModal");
    
    const listaCriadas = document.getElementById("listaCriadas");
    const listaPassageiro = document.getElementById("listaPassageiro");
    const listaMotorista = document.getElementById("listaMotorista");

    modal.style.display = "flex";
    loading.style.display = "block";
    conteudo.style.display = "none";
    listaCriadas.innerHTML = "";
    listaPassageiro.innerHTML = "";
    listaMotorista.innerHTML = "";

    try {
        const res = await fetch(`../php/getViagensUsuarioAdmin.php?id_usuario=${usuarioId}`);
        const retorno = await res.json();
        
        if (retorno.status === "ok") {
            const gerarCardHtmlCompleto = (g, statusSolicitacao = '') => {
                const precoFormatado = g.preco ? `R$ ${Number(g.preco).toFixed(2)}` : 'R$ 0,00';
                const vagasDisponiveis = g.capacidade ? `${g.capacidade} vagas` : '—';
                const descricaoTexto = g.descricao ? g.descricao : 'Sem descrição informada.';
                const dataTexto = g.dataHora ? g.dataHora : '—';
                const recorrenciaTexto = g.tipoRecorrencia ? g.tipoRecorrencia : 'avulsa';
                
                let badgeStatus = '';
                if (statusSolicitacao) {
                    const corBg = statusSolicitacao === 'criador' ? '#4CAF50' : '#E63946';
                    badgeStatus = `<span style="font-size: 0.7rem; background: ${corBg}; padding: 2px 6px; border-radius: 3px; color: white; text-transform: capitalize; font-weight: bold;">${statusSolicitacao}</span>`;
                }

                let htmlParticipantes = '';
                if (g.participantes && g.participantes.length > 0) {
                    htmlParticipantes = g.participantes.map(part => {
                        let corStatus = '#f39c12'; 
                        if (part.status === 'aceito') corStatus = '#2ed573'; 
                        if (part.status === 'criador') corStatus = '#4CAF50'; 
                        
                        return `<div style="font-size: 0.8rem; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px; display: inline-block; margin: 2px;">
                            👤 ${escapeHTML(part.nome)} (<span style="text-transform: capitalize;">${part.tipo_vaga}</span>) - <span style="color: ${corStatus}; text-transform: capitalize; font-weight: bold;">${part.status}</span>
                        </div>`;
                    }).join('');
                } else {
                    htmlParticipantes = '<span style="font-size: 0.8rem; color: #8d99ae;">Nenhuma solicitação/participante ainda.</span>';
                }

                return `
                    <div style="background: #2a2d3e; padding: 15px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #ef233e;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong style="font-size: 1rem; color: #fff;">${g.titulo}</strong>
                            <div>${badgeStatus}</div>
                        </div>
                        
                        <p style="font-size: 0.85rem; color: #8d99ae; margin-bottom: 8px; line-height: 1.4;">
                            <strong>Descrição:</strong> ${descricaoTexto}
                        </p>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; font-size: 0.8rem; color: #eef2f5; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; margin-bottom: 12px;">
                            <div><strong>Partida:</strong> <span style="text-transform: capitalize;">${g.pontoPartida}</span></div>
                            <div><strong>Chegada:</strong> <span style="text-transform: capitalize;">${g.pontoChegada}</span></div>
                            <div><strong>Preço:</strong> <span style="color: #2ed573; font-weight: bold;">${precoFormatado}</span></div>
                            <div><strong>Capacidade:</strong> ${vagasDisponiveis}</div>
                            <div><strong>Data/Hora:</strong> ${dataTexto}</div>
                            <div><strong>Recorrência:</strong> <span style="text-transform: capitalize;">${recorrenciaTexto}</span></div>
                        </div>

                        <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px;">
                            <strong style="font-size: 0.85rem; color: #fff; display: block; margin-bottom: 4px;">Pessoas neste grupo:</strong>
                            ${htmlParticipantes}
                        </div>
                    </div>
                `;
            };

            if (retorno.data.criadas.length > 0) {
                retorno.data.criadas.forEach(c => {
                    listaCriadas.innerHTML += gerarCardHtmlCompleto(c, c.tipoCarona);
                });
            } else {
                listaCriadas.innerHTML = `<p style="color: #8d99ae; font-size: 0.9rem;">Nenhuma carona criada.</p>`;
            }

            const entrouPassageiro = retorno.data.participa.filter(p => p.tipo_vaga === 'passageiro');
            const entrouMotorista = retorno.data.participa.filter(p => p.tipo_vaga === 'motorista');

            const criouPassageiro = retorno.data.criadas
                .filter(c => c.tipoCarona === 'passageiro')
                .map(c => ({ ...c, status_solicitacao: 'criador' }));
                
            const criouMotorista = retorno.data.criadas
                .filter(c => c.tipoCarona === 'motorista')
                .map(c => ({ ...c, status_solicitacao: 'criador' }));

            const comoPassageiro = [...criouPassageiro, ...entrouPassageiro];
            const comoMotorista = [...criouMotorista, ...entrouMotorista];

            if (comoPassageiro.length > 0) {
                comoPassageiro.forEach(p => {
                    listaPassageiro.innerHTML += gerarCardHtmlCompleto(p, p.status_solicitacao);
                });
            } else {
                listaPassageiro.innerHTML = `<p style="color: #8d99ae; font-size: 0.9rem;">Não participa como passageiro.</p>`;
            }

            if (comoMotorista.length > 0) {
                comoMotorista.forEach(p => {
                    listaMotorista.innerHTML += gerarCardHtmlCompleto(p, p.status_solicitacao);
                });
            } else {
                listaMotorista.innerHTML = `<p style="color: #8d99ae; font-size: 0.9rem;">Não participa como motorista.</p>`;
            }
        } else {
            listaCriadas.innerHTML = `<p style="color: #E63946;">Erro ao carregar: ${retorno.mensagem}</p>`;
        }
    } catch (e) {
        console.error(e);
        listaCriadas.innerHTML = `<p style="color: #E63946;">Erro de processamento.</p>`;
    } finally {
        loading.style.display = "none";
        conteudo.style.display = "block";
    }
}

function fecharModal() {
    document.getElementById("modalUsuario").style.display = "none";
}

verificarAdmin();