document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const viagemInstanciaId = urlParams.get('id');

    if (!viagemInstanciaId) {
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Instância da viagem não identificada.',
            confirmButtonColor: '#E63946'
        }).then(() => {
            window.location.href = 'perfil.html';
        });
        return;
    }

    document.getElementById('viagem_instancia_id').value = viagemInstanciaId;
    carregarDadosMinimosViagem(viagemInstanciaId);

    // NOVA FUNÇÃO: Verifica se já foi avaliado para carregar os dados
    await verificarAvaliacaoExistente(viagemInstanciaId);
});

async function verificarAvaliacaoExistente(idInstancia) {
    try {
        const response = await fetch(`../php/getAvaliacaoExistente.php?viagem_instancia_id=${idInstancia}`);
        const resultado = await response.json();

        if (resultado.status === 'ok' && resultado.dados) {
            // 1. Preenche os campos do formulário automaticamente com o que estava salvo
            document.getElementById('tipo_vaga').value = resultado.dados.tipo_vaga;
            document.getElementById('nota').value = resultado.dados.nota;
            document.getElementById('comentario').value = resultado.dados.comentario || '';

            // 2. Muda o visual do botão para o usuário saber que está editando
            const btnEnviar = document.querySelector("form button[type='submit']");
            if (btnEnviar) {
                btnEnviar.innerText = "Atualizar Avaliação";
                btnEnviar.style.background = "#27ae60"; // Muda para um verde de atualização, por exemplo
            }
        }
    } catch (erro) {
        console.error("Erro ao verificar avaliação existente:", erro);
    }
}

function carregarDadosMinimosViagem(id) {
    document.getElementById('nomeGrupoAvaliacao').innerText = `Grupo de Carona #${id}`;
}

function enviarAvaliacao(event) {
    event.preventDefault();

    const viagemInstanciaId = document.getElementById('viagem_instancia_id').value;
    const tipoVaga = document.getElementById('tipo_vaga').value;
    const nota = document.getElementById('nota').value;
    const comentario = document.getElementById('comentario').value;

    if (!tipoVaga || tipoVaga.trim() === "" || !nota || nota === "0" || nota.trim() === "") {
        Swal.fire({
            icon: 'error',
            title: 'ERRO:',
            text: 'Preencha todos os campos',
            confirmButtonColor: '#E63946'
        });
        return;
    }

    const dadosForm = {
        viagem_instancia_id: viagemInstanciaId,
        tipo_vaga: tipoVaga,
        nota: nota,
        comentario: comentario
    };

    fetch('../php/avaliacaoGrupo.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(dadosForm)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "ok") {
            Swal.fire({
                icon: 'success',
                title: 'Sucesso',
                text: data.mensagem || 'Avaliação registrada com sucesso',
                confirmButtonColor: '#2a3b4c'
            }).then(() => {
                window.location.href = 'perfil.html';
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro no servidor',
                text: data.mensagem || 'Não foi possível salvar sua avaliação.',
                confirmButtonColor: '#E63946'
            });
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro técnico',
            text: 'Erro ao tentar se comunicar com o servidor.',
            confirmButtonColor: '#E63946'
        });
    });
}