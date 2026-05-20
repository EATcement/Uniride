const urlParams = new URLSearchParams(window.location.search);
const grupoViagemId = urlParams.get('grupo_viagem_id');

let usuarioNome = null;

document.addEventListener('DOMContentLoaded', async () => {
    await buscarUsuarioLogado();

    if (!grupoViagemId) {
        await new Promise((resolve) => {
            Swal.fire({
                title: "ERRO!",
                text: "Grupo não identificado",
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            }).then(() => {
                window.location.href = "../perfilUsuario/html/perfil.html";
                resolve();
            });
        });
        return;
    }

    const acessoResponse = await fetch(`verificarAcesso.php?grupo_viagem_id=${grupoViagemId}`);
    const acessoData = await acessoResponse.json();

    if (acessoData.acesso !== true) {
            Swal.fire({
                title: "ERRO!",
                text: "Você não tem permissão para acessar esse grupo",
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            }).then(() => {
                window.location.href = "../perfilUsuario/html/perfil.html";
                return;
            })
        }
        
    document.getElementById('titulo-grupo').innerHTML = "Grupo de viagem: " + grupoViagemId;

    await carregarMensagens();
    setInterval(carregarMensagens, 3000);

    document.getElementById('btn-enviar').addEventListener('click', enviarMensagem);

    document.getElementById('input-mensagem').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') enviarMensagem();
    });
});

async function buscarUsuarioLogado() {
    try {
        const response = await fetch("../php/getSessao.php");
        const dados = await response.json();

        if (dados.logado || dados.id || dados.usuario_id) {
            usuarioNome = dados.nome;
        }
    } catch (e) {
        console.error("Erro ao buscar sessão:", e);
    }
}

async function carregarMensagens() {
    const response = await fetch(`getMensagens.php?grupo_viagem_id=${grupoViagemId}`);
    const resposta = await response.json();

    if (resposta.status !== 'ok') return;

    const area = document.getElementById('area-mensagens');
    const estaNoFundo = area.scrollHeight - area.scrollTop === area.clientHeight;

    let html = '';

    resposta.data.forEach(msg => {
        const ehMinha = msg.nome === usuarioNome;
        const classe  = ehMinha ? 'minha' : 'outra';
        const hora    = new Date(msg.enviado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        html += `
            <div class="mensagem ${classe}">
                <span class="nome">${msg.nome}</span>
                <span class="balao">${msg.conteudo}</span>
                <span class="hora">${hora}</span>
            </div>
        `;
    });

    area.innerHTML = html;

    if (estaNoFundo) {
        area.scrollTop = area.scrollHeight;
    }
}

async function enviarMensagem() {
    const input    = document.getElementById('input-mensagem');
    const conteudo = input.value.trim();

    if (!conteudo) return;

    const response = await fetch('postMensagens.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            conteudo: conteudo,
            grupo_viagem_id: grupoViagemId
        })
    });

    const resposta = await response.json();

    if (resposta.status === 'ok') {
        input.value = '';
        await carregarMensagens();
    } else {
        await Swal.fire({
            title: "Erro!",
            text: "Erro ao enviar mensagem.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff2448"
        });
    }
}