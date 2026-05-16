let usuarioLogadoId = null;
let isMotoristaLogado = false;

document.addEventListener("DOMContentLoaded", async () => {
    await buscarUsuarioLogado();

    if (document.getElementById("lista")) {
        await carregarDados(); 
        
        const campoBusca = document.getElementById("buscarCarona");
        if (campoBusca) {
            campoBusca.addEventListener("input", carregarDados);
        }
    }
});

async function buscarUsuarioLogado() {
    try {
        const response = await fetch("../../php/getSessao.php"); 
        
        if (!response.ok) {
            console.error("Não encontrou o arquivo de sessão. Status:", response.status);
            return;
        }

        const dados = await response.json();
        console.log("Dados recebidos da sessão:", dados); 

        if (dados.logado || dados.id || dados.usuario_id) {
            usuarioLogadoId = dados.id || dados.usuario_id || $_SESSION['usuario_id'];
            
            const statusMotorista = dados.isMotorista ?? dados.motorista ?? 0;
            isMotoristaLogado = (Number(statusMotorista) === 1);
            
            console.log("ID do Usuário Carregado:", usuarioLogadoId);
            console.log("É Motorista?", isMotoristaLogado);
        }
    } catch (e) {
        console.error("Erro ao ler a sessão no JS:", e);
    }
}

const botaoNovo = document.getElementById("novaViagem");

if (botaoNovo) {

    botaoNovo.addEventListener("click", () => {

        window.location.href = '../html/novaViagem.html';

    });

} 

async function carregarDados() {
    const retorno = await fetch("../php/getViagem.php");
    const resposta = await retorno.json();

    if (resposta.status == "ok") {
        const filtro = document.getElementById("buscarCarona").value.toLowerCase().trim();

        const registros = resposta.data.filter(objeto =>
            objeto.pontoPartida.toLowerCase().includes(filtro) ||
            objeto.pontoChegada.toLowerCase().includes(filtro)
        );
        
        const containerErro = document.getElementById("semCaronasDisponiveis");
        if (registros.length === 0) {
            containerErro.innerHTML = "Nenhuma carona disponível para o local pesquisado.";
        } else {
            containerErro.innerHTML = "";
        }

        let html = `<table>
        <tr>
            <th>Título</th>
            <th>Descrição</th>
            <th>Ponto de Partida</th>
            <th>Ponto de Chegada</th>
            <th>Data e Hora</th>
            <th>Preço</th>
            <th>Ação</th>
        </tr>`;

        for (let i = 0; i < registros.length; i++) {
            let objeto = registros[i];
            let acaoBotao = "";

            if (usuarioLogadoId && objeto.usuario_id == usuarioLogadoId) {
                acaoBotao = "<span>Minha Carona</span>";
            } else {
                // --- TRAVA DO PASSAGEIRO ---
                // Verifica se o PHP retornou que este usuário já participa ou solicitou a vaga
                const jaEstaNoGrupo = (Number(objeto.ja_participa) === 1 || objeto.ja_participa === true);

                if (jaEstaNoGrupo) {
                    acaoBotao = `<button disabled style="background:#7f8c8d; color:white; cursor:not-allowed;" title="Você já solicitou ou entrou nesta carona">✓</button>`;
                } else {
                    acaoBotao = `<button onclick="solicitarEntrada(${objeto.id}, 'passageiro')">Entrar como Passageiro</button>`;
                }

                // --- TRAVA DO MOTORISTA (Se mantém caso ele seja motorista) ---
                if (isMotoristaLogado && !jaEstaNoGrupo) { 
                    const temMotoristaAceito = Number(objeto.temMotorista);
                    const vagaMotoristaOcupada = (temMotoristaAceito > 0 || objeto.tipoCarona === 'motorista');

                    if (vagaMotoristaOcupada) {
                        acaoBotao += `<button disabled style="background:gray; color:white;" title="Esta carona já possui um motorista">Motorista Ocupado</button>`;                     
                    } else {
                        acaoBotao += `<button onclick="solicitarEntrada(${objeto.id}, 'motorista')" style="background:green; color:white; margin-left:5px;">Entrar como Motorista</button>`;                     
                    }
                }
            }

            html += `<tr>
                        <td>${objeto.titulo}</td>
                        <td>${objeto.descricao}</td>
                        <td>${objeto.pontoPartida}</td>
                        <td>${objeto.pontoChegada}</td>
                        <td>${objeto.dataHora}</td>
                        <td>${objeto.preco}</td>
                        <td style="white-space: nowrap; padding: 10px; text-align: center;">${acaoBotao}</td>                    
                        </tr>`;
        }
        html += "</table>";

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
        viagem_id: viagemId,
        solicitante_id: usuarioLogadoId,
        tipo_vaga: tipoVaga
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