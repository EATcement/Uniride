// Esconde a página temporariamente para evitar "piscadas" de conteúdo
document.documentElement.style.display = 'none';

fetch('../../php/validaSessaoUsuario.php')
    .then(response => response.json())
    .then(dados => {
        // Se não estiver logado de nenhuma forma, expulsa para o login
        if (!dados.logado) {
            window.location.href = '../../home/index.html';
        } else {
            // Se estiver logado, libera a visualização da página
            document.documentElement.style.display = 'block';
        }
    })
    .catch(() => {
        window.location.href = '../../home/index.html';
    });