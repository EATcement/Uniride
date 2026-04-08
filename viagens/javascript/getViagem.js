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

        var html = `<table>
        <tr>
            <th>Título</th>
            <th>Descrição</th>
            <th>Ponto de Partida</th>
            <th>Ponto de Chegada</th>
            <th>Data e Hora</th>
            <th>Preço</th>
            <th>Tipo de carona</th>
        </tr>`;

        for (var i = 0; i < registros.length; i++) {
            var objeto = registros[i]

            html += `<tr>
                        <td>${objeto.titulo}</td>
                        <td>${objeto.descricao}</td>
                        <td>${objeto.pontoPartida}</td>
                        <td>${objeto.pontoChegada}</td>
                        <td>${objeto.dataHora}</td>
                        <td>${objeto.preco}</td>
                        <td>${objeto.tipoCarona}</td>

                    </tr>`;
        }
        html += "</table>"

        document.getElementById("lista").innerHTML = html;

    } else {
        console.log("Erro: " + resposta.mensagem);
    }
};