document.getElementById("enviar").addEventListener('click', function () {
    novo();
});

async function novo() {

    const fd = new FormData();

    var placa = document.getElementById("placa").value;
    var marca = document.getElementById("marca").value;
    var modelo = document.getElementById("modelo").value;
    var ano = document.getElementById("ano").value;
    var cor = document.getElementById("cor").value;
    var renavam = document.getElementById("renavam").value;
    var capacidade = document.getElementById("capacidade").value;
    var gastoCombustivel = document.getElementById("gastoCombustivel").value;
    var categoria = document.getElementById("categoria").value;

    // validação básica
    if (!placa || !marca || !modelo || !ano || !cor || !capacidade) {
        alert("ERRO: Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    // append no FormData
    fd.append('placa', placa);
    fd.append('marca', marca);
    fd.append('modelo', modelo);
    fd.append('ano', ano);
    fd.append('cor', cor);
    fd.append('renavam', renavam);
    fd.append('capacidade', capacidade);
    fd.append('gastoCombustivel', gastoCombustivel);
    fd.append('categoria', categoria);

    const retorno = await fetch("../php/novoCarro.php", {
        method: "POST",
        body: fd
    });

    const resposta = await retorno.json();

    if(resposta.status == "ok") {
        alert("Sucesso! " + resposta.mensagem);
        window.location.href="../html/perfil.html";
    } else {
        alert("ERRO! " + resposta.mensagem);
    }
};


