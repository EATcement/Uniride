document.documentElement.style.display = 'none';

fetch('../../php/validaSessaoMotorista.php')
    .then(response => response.json())
    .then(dados => {
        if (!dados.logado) {
            window.location.href = '../../home/index.html';
        } else {
            document.documentElement.style.display = 'block';
        }
    })
    .catch(() => {
        window.location.href = '../../home/index.html';
    });