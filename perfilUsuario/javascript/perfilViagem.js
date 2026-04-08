document.addEventListener("DOMContentLoaded", () => {
    //valida_sessao();
    
    if (document.getElementById("listaViagem")) {
        carregarDadosViagem();
    }
});

async function carregarDadosViagem() {
    const retorno = await fetch("../php/perfilViagem.php");
    const resposta = await retorno.json();

    if (resposta.status == "ok") {
        const registros = resposta.data;

        var html = `<table>
        <tr>
            <th>Ações</th>
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
                        <td> 
                            <a href='../html/alterarViagem.html?id=${objeto.id}' class='alterar'>Alterar</a>
                            <a href='#' onclick='excluirViagem(${objeto.id})' class='excluir'>Excluir</a>
                        </td>
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

        document.getElementById("listaViagem").innerHTML = html;

    } else {
        console.log("Erro: " + resposta.mensagem);
    }
};

async function excluirViagem(id) {
    const retorno = await fetch("../php/excluirViagem.php?id=" + id);
    const resposta = await retorno.json();
    if (resposta.status == "ok") {
        console.log(resposta.mensagem);
        window.location.reload();
    } else {
        console.log("Erro: " + resposta.mensagem)
    }
}
