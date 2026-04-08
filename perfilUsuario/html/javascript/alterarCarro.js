// Primeira etapa: receber o valor por GET e armazenar no input hidden id;
// Segunda etapa: fazer um fetch no projetoFinal_get.php e preencher os campos;
var url = new URLSearchParams(window.location.search);
var id = url.get("id");

document.addEventListener("DOMContentLoaded", () => {
    //Pegaa URL e grava na variável
    buscarDados(id);
});

async function buscarDados(id) {
    const retorno = await fetch("../php/perfilCarro.php?id="+id)
    const resposta = await retorno.json();

    if(resposta.status == "ok") {
        
        alert("Sucesso! " + resposta.mensagem);
        var reg = resposta.data[0]; //pega a partir da posição 0, já que vai ser a única existente, já que o dicionário só possui uma posição;

        document.getElementById("placa").value = reg.placa;
        document.getElementById("marca").value = reg.marca;
        document.getElementById("modelo").value = reg.modelo;
        document.getElementById("ano").value = reg.ano;
        document.getElementById("cor").value = reg.cor;
        document.getElementById("renavam").value = reg.renavam;
        document.getElementById("capacidade").value = reg.capacidade;
        document.getElementById("gastoCombustivel").value = reg.gastoCombustivel;
        document.getElementById("categoria").value = reg.categoria;
        

    } else {
        alert("ERRO! " + resposta.mensagem);
    }
    console.log(id)
};


document.getElementById("enviar").addEventListener('click', function () {
    alterar();
});

async function alterar() {
    var placa = document.getElementById("placa").value;
    var marca = document.getElementById("marca").value;
    var modelo = document.getElementById("modelo").value;
    var ano = document.getElementById("ano").value;
    var cor = document.getElementById("cor").value;
    var renavam = document.getElementById("renavam").value;
    var capacidade = document.getElementById("capacidade").value;
    var gastoCombustivel = document.getElementById("gastoCombustivel").value;
    var categoria = document.getElementById("categoria").value;


    const fd = new FormData();
    fd.append('placa', placa);
    fd.append('marca', marca);
    fd.append('modelo', modelo);
    fd.append('ano', ano);
    fd.append('cor', cor);
    fd.append('renavam', renavam);
    fd.append('capacidade', capacidade);
    fd.append('gastoCombustivel', gastoCombustivel);
    fd.append('categoria', categoria);



    //envia para o php através do método post
    // ponto de interrogação (?) = estou passando uma variável por get

    const retorno = await fetch("../php/alterarCarro.php?id="+id, {
        method: "POST",
        body: fd
    });

    const resposta = await retorno.json();

    if(resposta.status == "ok") {
        alert("Sucesso! " + resposta.mensagem);
        window.location.href = '../html/perfil.html';
    } else {
        alert("ERRO! " + resposta.mensagem);
    }

};