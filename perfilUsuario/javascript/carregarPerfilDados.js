document.addEventListener("DOMContentLoaded", () => {
    carregarInformacoesPessoais();
});

// Lógica para mostrar/esconder a senha
const iconeOlho = document.getElementById('iconeOlho');
const inputSenha = document.getElementById('perfilSenha');

iconeOlho.addEventListener('click', () => {
    if (inputSenha.type === 'password') {
        inputSenha.type = 'text'; 
        iconeOlho.src = '../../assets/olho-fechado.png'; 
    } else {
        inputSenha.type = 'password'; 
        iconeOlho.src = '../../assets/olho.png';
    }
});

async function carregarInformacoesPessoais() {
    try {
        const retorno = await fetch("../php/getDadosPerfil.php");
        const resposta = await retorno.json();

        if (resposta.status === "ok") {
            const dados = resposta.data;

            document.getElementById("perfilNome").innerText = dados.nome;
            document.getElementById("perfilEmail").innerText = dados.email;
            document.getElementById("perfilSenha").value = dados.senha;
            
            if(dados.nascimento) {
                const dataNasc = dados.nascimento.split('-');
                document.getElementById("perfilDataNasc").innerText = `${dataNasc[2]}/${dataNasc[1]}/${dataNasc[0]}`;
            }
            if (dados.foto_perfil && 
            dados.foto_perfil !== "" && 
            dados.foto_perfil !== "null" && 
            dados.foto_perfil !== "undefined") {
    
            document.getElementById("perfilFoto").src = "../../a-fotos-usuarios/" + dados.foto_perfil;
            } else {
            document.getElementById("perfilFoto").src = "../../assets/icon-pessoa.png";
            }

            if (dados.motorista == 1) {
                document.getElementById("perfilStatus").innerText = "Motorista";
                document.getElementById("dadosMotorista").style.display = "grid";
                document.getElementById("perfilCNH").innerText = dados.numeroRegistro || "Não informada";
                
                if(document.getElementById("areaCarros")) {
                    document.getElementById("areaCarros").style.display = "block";
                }
                
                if(document.getElementById("areaTornarMotorista")) {
                    document.getElementById("areaTornarMotorista").style.display = "none";
                }
                
            } else {
                document.getElementById("perfilStatus").innerText = "Passageiro";
                document.getElementById("dadosMotorista").style.display = "none";
                
                if(document.getElementById("areaCarros")) {
                    document.getElementById("areaCarros").style.display = "none";
                }
                
                if(document.getElementById("areaTornarMotorista")) {
                    document.getElementById("areaTornarMotorista").style.display = "block";
                }
            }

       } else {
            console.error("Erro retornado pelo PHP: ", resposta.mensagem);
            document.getElementById("perfilNome").innerText = "Erro ao carregar";
            document.getElementById("perfilEmail").innerText = resposta.mensagem;
        }
    } catch (erro) {
        console.error("Erro crítico na requisição AJAX: ", erro);
        document.getElementById("perfilNome").innerText = "Undefined";
    }
}

document.getElementById('inputFoto').addEventListener('change', async function(evento) {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;

    const formData = new FormData();
    formData.append('foto', arquivo);

    try {
        const retorno = await fetch('../php/uploadFoto.php', {
            method: 'POST',
            body: formData
        });
        
        const resposta = await retorno.json();

        if (resposta.status === 'ok') {
            document.getElementById('perfilFoto').src = "../../a-fotos-usuarios/" + resposta.nome_arquivo;
            
            await Swal.fire({
                title: "Sucesso!",
                text: "Foto de perfil atualizada com sucesso!",
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
        } else {
            await Swal.fire({
                title: "Erro!",
                text: resposta.mensagem,
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
    }
} catch (erro) {
        console.error("Erro ao enviar foto:", erro);
        await Swal.fire({
            title: "Erro!",
            text: "Falha na conexão ao tentar enviar a foto.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff2448"
        });
    }
});

document.getElementById('btnRemoverFoto').addEventListener('click', async () => {
    const confirmacao = await Swal.fire({
        title: "Remover foto?",
        text: "Tem certeza que deseja remover sua foto de perfil?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, remover",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#ff2448"
    });
    if (!confirmacao.isConfirmed) return;

    try {
        const retorno = await fetch('../php/removerFoto.php', {
            method: 'POST'
        });
        const resposta = await retorno.json();

        if (resposta.status === 'ok') {
            document.getElementById('perfilFoto').src = "../../assets/icon-pessoa.png";
            await Swal.fire({
                title: "Sucesso!",
                text: "Foto de perfil removida com sucesso!",
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
        } else {
            await Swal.fire({
                title: "Erro!",
                text: resposta.mensagem,
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
        }
    } catch (erro) {
        console.error("Erro ao remover foto:", erro);
        await Swal.fire({
            title: "Erro!",
            text: "Falha na conexão ao tentar remover a foto.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff2448"
        });
    }
});