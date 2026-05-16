const campos = [
    { id: "nome",       erro: "erroNome",       msg: "*Informe seu nome." },
    { id: "email",      erro: "erroEmail",       msg: "*Informe seu email." },
    { id: "senha",      erro: "erroSenha",       msg: "*Informe sua senha." },
    { id: "nascimento", erro: "erroNascimento",  msg: "*Informe sua data de nascimento." },
];

const camposMotorista = [
    {id: "dataVencimento",  erro: "erroDataVencimento",     msg: "*Informe a data de vencimento." },
    {id: "numeroRegistro",  erro: "erroNumeroRegistro",         msg: "*Informe o número de registro da sua CNH." },
    {id: "cpf",             erro: "erroCpf",                    msg: "*Informe o seu cpf." },
];

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

    if (!validarCampos()) {
        if (motorista == 1) {
            if (!validarCamposMotorista()) 
                return;
        } else {
            return;
        }
    }

    
    if (!email.endsWith(".edu.br") || !email.includes("@")){
        Swal.fire({
            title: "Aviso!",
            text: "Use seu email institucional!",
            icon: "warning",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff2448"
        });
        return;
    }

    const fd = new FormData();
    fd.append('email', email);

    const retornoEmail = await fetch("../php/verificarEmail.php", {
        method: "POST",
        body: fd
    });

    const respostaEmail = await retornoEmail.json();
    
    if (respostaEmail.status == "ok"){
        Swal.fire({
            title: "Aviso!",
            text: "Email já cadastrado!",
            icon: "warning",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff2448"
        });
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
            await Swal.fire({
                title: "Sucesso!",
                text: resposta.mensagem,
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
            window.location.href="../home/index.html";
        } else {
            Swal.fire({
                title: "ERRO!",
                text: resposta.mensagem,
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
        }

    } else {
        var dataVencimento = document.getElementById("dataVencimento").value;
        var numeroRegistro = document.getElementById("numeroRegistro").value;
        var cpf = document.getElementById("cpf").value;

        if (!validarCpf(cpf)){
            Swal.fire({
                title: "CPF inválido!",
                text: "CPF inválido",
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
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
            await Swal.fire({
                title: "Sucesso!",
                text: "Redirecionando você para a página inicial.",
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
            window.location.href="../home/index.html";        
        } else {

            Swal.fire({
                title: "Erro!",
                text: resposta.mensagem + "/" + respostaMotorista.mensagem,
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
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

function validarCpf(cpf){

    for (let t = 9; t < 11; t++) {
        let sum = 0;
        for (let i = 0; i < t; i++) {
            sum += parseInt(cpf[i]) * (t + 1 - i);
        }
        let digito = (sum * 10) % 11;
        if (digito === 10) digito = 0;
        if (digito !== parseInt(cpf[t])) return false;
    }
    return true;
}

function validarCampos() {
    let valido = true;

    for (const campo of campos) {
        const valor = document.getElementById(campo.id).value.trim();
        const erroEl = document.getElementById(campo.erro);

        if (!valor) {
            erroEl.textContent = campo.msg;
            erroEl.style.display = "block";
            valido = false;
        } else {
            erroEl.style.display = "none";
        }
    }

    return valido;
}

function validarCamposMotorista() {
    console.log("validarCamposMotorista chamada!");

    let valido = true;

    for (const campo of camposMotorista) {
        const valor = document.getElementById(campo.id).value.trim();
        const erroEl = document.getElementById(campo.erro);
    
        if (!valor) {
            erroEl.textContent = campo.msg;
            erroEl.style.display = "block";
            valido = false;
        } else {
                erroEl.style.display = "none";
            }
    }

    return valido;
}