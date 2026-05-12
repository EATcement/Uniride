document.addEventListener("DOMContentLoaded", () => {
    //valida_sessao();
    
    if (document.getElementById("lista")) {
        carregarDados();
        document.getElementById("buscarCarona").addEventListener("input", carregarDados);

    }
});

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
        
        if (registros == "" || registros == null) {
            document.getElementById("semCaronasDisponiveis").innerHTML = "Nenhuma carona disponível para o local pesquisado.";
        } else {
            document.getElementById("semCaronasDisponiveis").innerHTML = "";
        }

        html = "";

        for (var i = 0; i < registros.length; i++) {
            var objeto = registros[i];
            
            if (!objeto) continue;

            var tipoLabel = objeto.tipoCarona === "passageiro" ? "Solicitação" : "Oferta";


            html += 
                `<div class="card">
                    
                    <h3>${objeto.titulo}</h3>

                    <strong>Descrição</strong>
                    <p>${objeto.descricao}</p>

                    <strong>Ponto de Partida</strong>
                    <p>${objeto.pontoPartida}</p>

                    <strong>Ponto de Chegada</strong>
                    <p>${objeto.pontoChegada}</p>

                    <strong>Data e Hora</strong>
                    <p>${objeto.dataHora}</p>

                    <strong>Preço</strong>
                    <p>${objeto.preco}</p>

                    <strong>Tipo de carona</strong>
                    <p>${tipoLabel}</p>

                </div>
                `;
        }

        document.getElementById("lista").innerHTML = html;

    } else {
        console.log("Erro: " + resposta.mensagem);
    }
};