let todosUsuarios = [];

async function verificarAdmin() {
    try {
        const res    = await fetch("../php/getSessao.php");
        const sessao = await res.json();

        if (!sessao.logado || !sessao.isAdmin) {
            // n é admin → redireciona p o login
            window.location.href = "../login/login.html";
            return;
        }

        // exibe o nome do admin na navbar
        const spanNome = document.getElementById("adminNome");
        if (spanNome) spanNome.textContent = "Olá, " + sessao.nome;

        // carrega os usuários
        await carregarUsuarios();

    } catch (e) {
        console.error("Erro ao verificar sessão:", e);
        window.location.href = "../login/login.html";
    }
}

// busca a lista de usuários no servidor
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
        console.error("Erro ao carregar usuários:", e);
        document.getElementById("loadingMsg").textContent = "Erro ao carregar usuários.";
    }
}

// renderiza as linhas da tabela
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

        // foto de perfil
        const fotoSrc = (u.foto_perfil && u.foto_perfil !== "null" && u.foto_perfil !== "")
            ? "/uniride/a-fotos-usuarios/" + u.foto_perfil
            : "../assets/icon-pessoa.png";

        // nascimento formatado
        const nascimento = u.nascimento
            ? new Date(u.nascimento + "T00:00:00").toLocaleDateString("pt-BR")
            : "—";

        // badge tipo
        const tipoHTML = Number(u.motorista) === 1
            ? `<span class="badge badge-motorista">Motorista</span>`
            : `<span class="badge badge-passageiro">Passageiro</span>`;

        // badge status
        const statusHTML = (u.status === "banido")
            ? `<span class="badge badge-banido">Banido</span>`
            : `<span class="badge badge-ativo">Ativo</span>`;

        tr.innerHTML = `
            <td><img src="${fotoSrc}" alt="Foto" class="user-foto"
                     onerror="this.src='../assets/icon-pessoa.png'"></td>
            <td>${escapeHTML(u.nome)}</td>
            <td>${escapeHTML(u.email)}</td>
            <td>${nascimento}</td>
            <td>${tipoHTML}</td>
            <td>${statusHTML}</td>
        `;

        tbody.appendChild(tr);
    });
}

// busca em tempo real
document.getElementById("buscarUsuario").addEventListener("input", function () {
    const termo = this.value.toLowerCase().trim();
    const filtrados = todosUsuarios.filter(u =>
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo)
    );
    renderizarTabela(filtrados);
});

// utilitário: escapa HTML para evitar XSS
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// inicializa
verificarAdmin();