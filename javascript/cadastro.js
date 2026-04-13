document.getElementById("enviar").addEventListener('click', function () {
    event.preventDefault();
    novo();
});

async function novo() {
    var nome = document.getElementById("nome").value;
    var senha = document.getElementById("senha").value;
    var email = document.getElementById("email").value;
    var nascimento = document.getElementById("nascimento").value;
    var motorista = document.getElementById("motorista").checked ? 1 : 0 


    if (!email.endsWith(".edu.br")) {
        alert("Use seu email institucional!");
        return;
    };

    if (!email || !senha || !nome || !nascimento){
        mostrarErro();
        return;
    };

    /*
    if (email.includes("@")){
        console.log("Tem @")
    }else{
        const erro = document.getElementById("erro");
        erro.style.display = "block";
        alert("Não tem @")
       return;
    }*/

    const fd = new FormData();
    fd.append('email', email);

    const retornoEmail = await fetch("../php/verificarEmail.php", {
        method: "POST",
        body: fd
    });

    const respostaEmail = await retornoEmail.json();
    
    if (respostaEmail.status == "ok"){
        alert("Email já cadastrado!");
        return;
    };

    fd.append('nome', nome);
    fd.append('senha', senha);
    fd.append('nascimento', nascimento);
    fd.append('motorista', motorista);


    if (motorista ==  0) {
        const retorno = await fetch("../php/cadastro.php", {
            method: "POST",
            body: fd
        }); 

        const resposta = await retorno.json();
        if(resposta.status == "ok") {
            alert("Sucesso! " + resposta.mensagem);
            window.location.href="../home/index.html";
        } else {
            alert("ERRO! " + resposta.mensagem);
        }

    } else {
        var dataVencimento = document.getElementById("dataVencimento").value;
        var numeroRegistro = document.getElementById("numeroRegistro").value;
        var cpf = document.getElementById("cpf").value;

        /*
        if (cpf.length === 11 && !isNaN(cpf)) {
            console.log("Valido: 11 dígitos numéricos.");
        } else {
            alert("Invalido: Precisa ter exatamente 11 dígitos numéricos.");
            return;
        }
        */

        if (!dataVencimento || !numeroRegistro || !cpf){
            mostrarErro();
            return;
        }
        const retorno = await fetch("../php/cadastro.php", {
            method: "POST",
            body: fd
        });

        const resposta = await retorno.json();
        console.log("cadastrado")

        const fdMotorista = new FormData();
        fdMotorista.append('dataVencimento', dataVencimento);
        fdMotorista.append('numeroRegistro', numeroRegistro);
        fdMotorista.append('cpf', cpf);

        const retornoMotorista = await fetch("../php/cadastroMotorista.php", {
            method: "POST",
            body: fdMotorista
        });

        const respostaMotorista = await retornoMotorista.json();

        if(respostaMotorista.status == "ok" && resposta.status == "ok") {
            alert("Sucesso! redirecionando você para a página inicial.");
            window.location.href="../home/index.html";        
        } else {

            alert(resposta.mensagem + "/" + respostaMotorista.mensagem);
        }
    }
};

document.getElementById("motorista").addEventListener('change', function () {
    mostrarFormMotorista();
});


function mostrarFormMotorista() {
    var x = document.getElementById("formMotorista");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }

};

function mostrarErro(){
    const erro = document.getElementById("erro");
    erro.style.display = "block";
}