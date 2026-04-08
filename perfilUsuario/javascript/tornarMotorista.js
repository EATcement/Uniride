document.getElementById("enviar").addEventListener('click', async function () {
    
    var cpf = document.getElementById("cpf").value;
    var dataVencimento = document.getElementById("dataVencimento").value;
    var numeroRegistro = document.getElementById("numeroRegistro").value;

    if (!cpf || !dataVencimento || !numeroRegistro) {
        alert("Preencha todos os campos!");
        return;
    }

    const fd = new FormData();
    fd.append('cpf', cpf);
    fd.append('dataVencimento', dataVencimento);
    fd.append('numeroRegistro', numeroRegistro);

    const retorno = await fetch("../php/tornarMotorista.php", {
        method: "POST",
        body: fd
    });

    const resposta = await retorno.json();

    if(resposta.status == "ok") {
        alert("Sucesso! " + resposta.mensagem);
        // Redireciona de volta para o perfil
        window.location.href = "perfil.html"; 
    } else {
        alert("ERRO! " + resposta.mensagem);
    }
});