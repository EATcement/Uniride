const campos = [
    { id: "nome",       erro: "erroNome",       msg: "*Informe seu nome." },
    { id: "email",      erro: "erroEmail",      msg: "*Informe seu email." },
    { id: "senha",      erro: "erroSenha",      msg: "*Informe sua senha." },
    { id: "nascimento", erro: "erroNascimento",  msg: "*Informe sua data de nascimento." },
];

const camposMotorista = [
    { id: "dataVencimento", erro: "erroDataVencimento", msg: "*Informe a data de vencimento." },
    { id: "numeroRegistro", erro: "erroNumeroRegistro", msg: "*Informe o número de registro da sua CNH." },
    { id: "cpf",            erro: "erroCpf",            msg: "*Informe o seu cpf." },
];

// Executa assim que a página estiver pronta
document.addEventListener('DOMContentLoaded', () => {
    configurarLimitesCalendarios();

    document.getElementById("enviar").addEventListener('click', function (event) {
        event.preventDefault();
        novo();
    });

    document.getElementById("motorista").addEventListener('change', function () {
        mostrarFormMotorista();
    });
});

// 🕒 Trava os inputs do HTML para evitar escolhas absurdas por cliques
function configurarLimitesCalendarios() {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
    const diaAtual = String(hoje.getDate()).padStart(2, '0');

    // 18 anos atrás a partir de hoje (Data Máxima para nascer)
    const campoNascimento = document.getElementById("nascimento");
    if (campoNascimento) {
        campoNascimento.max = `${anoAtual - 18}-${mesAtual}-${diaAtual}`;
    }

    // CNH deve vencer de hoje para frente (Data Mínima)
    const campoVencimento = document.getElementById("dataVencimento");
    if (campoVencimento) {
        campoVencimento.min = `${anoAtual}-${mesAtual}-${diaAtual}`;
    }
}

async function novo() {
    var nome = document.getElementById("nome").value;
    var senha = document.getElementById("senha").value;
    var email = document.getElementById("email").value;
    var nascimento = document.getElementById("nascimento").value;
    var motorista = document.getElementById("motorista").checked ? 1 : 0;

    // FLUXO DE VALIDAÇÃO CORRIGIDO: Se qualquer um falhar, cancela o envio
    if (!validarCampos()) return;
    
    if (motorista === 1) {
        if (!validarCamposMotorista()) return;
        
        var cpf = document.getElementById("cpf").value.trim().replace(/\D/g, "");
        if (!validarCpf(cpf)){
            Swal.fire({
                title: "CPF inválido!",
                text: "Dígito verificador do CPF incorreto.",
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
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
    }

    fd.append('nome', nome);
    fd.append('senha', senha);
    fd.append('nascimento', nascimento);
    fd.append('motorista', motorista);

    if (motorista == 0) {
        const retorno = await fetch("../php/cadastro.php", { method: "POST", body: fd }); 
        const resposta = await retorno.json();
        
        if(resposta.status == "ok") {
            await msgSucesso();
        } else {
            msgErro(resposta.mensagem);
        }
    } else {
        var dataVencimento = document.getElementById("dataVencimento").value;
        var numeroRegistro = document.getElementById("numeroRegistro").value;

        const retorno = await fetch("../php/cadastro.php", { method: "POST", body: fd });
        const resposta = await retorno.json();

        const fdMotorista = new FormData();
        fdMotorista.append('dataVencimento', dataVencimento);
        fdMotorista.append('numeroRegistro', numeroRegistro);
        fdMotorista.append('cpf', cpf);

        const retornoMotorista = await fetch("../php/cadastroMotorista.php", { method: "POST", body: fdMotorista });
        const respostaMotorista = await retornoMotorista.json();

        if(respostaMotorista.status == "ok" && resposta.status == "ok") {
            await msgSucesso();
        } else {
            msgErro((resposta.mensagem ?? "") + " " + (respostaMotorista.mensagem ?? ""));
        }
    }
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

    // Validação de maioridade (Sua lógica original preservada)
    if (valido) {
        const nascimento = document.getElementById("nascimento").value;
        const erroNasc = document.getElementById("erroNascimento");
        
        const hoje = new Date();
        const [anoIn, mesIn, diaIn] = nascimento.split('-').map(Number);
        
        let idade = hoje.getFullYear() - anoIn;
        const m = (hoje.getMonth() + 1) - mesIn;
        
        if (m < 0 || (m === 0 && hoje.getDate() < diaIn)) {
            idade--;
        }

        if (idade < 18) {
            erroNasc.textContent = "*Você precisa ter pelo menos 18 anos para se cadastrar.";
            erroNasc.style.display = "block";
            valido = false;
        } else {
            erroNasc.style.display = "none";
        }
    }

    return valido;
}

function validarCamposMotorista() {
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

    // INTERCEPTADOR ANTI-VENCIMENTO (Igual ao tornarmotorista)
    if (valido) {
        const dtVencimento = document.getElementById("dataVencimento").value;
        const erroVencimento = document.getElementById("erroDataVencimento");
        
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const mesAtual = hoje.getMonth() + 1;
        const diaAtual = hoje.getDate();

        const [anoIn, mesIn, diaIn] = dtVencimento.split('-').map(Number);

        const estaVencido = (anoIn < anoAtual) || 
                            (anoIn === anoAtual && mesIn < mesAtual) || 
                            (anoIn === anoAtual && mesIn === mesAtual && diaIn < diaAtual);

        if (estaVencido) {
            erroVencimento.textContent = "*A CNH informada está vencida.";
            erroVencimento.style.display = "block";
            valido = false;
        } else {
            erroVencimento.style.display = "none";
        }
    }

    return valido;
}

function mostrarFormMotorista() {
    var x = document.getElementById("formMotorista");
    var check = document.getElementById("motorista");
    if (check.checked) {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function validarCpf(cpf) {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    for (let t = 9; t < 11; t++) {
        let sum = 0;
        for (let i = 0; i < t; i++) {
            sum += parseInt(cpf[i]) * (t + 1 - i);
        }
        let digito = (sum * 10) % 11;
        if (digito === 10 || digito === 11) digito = 0;
        if (digito !== parseInt(cpf[t])) return false;
    }
    return true;
}

async function msgSucesso() {
    await Swal.fire({
        title: "Sucesso!",
        text: "Redirecionando você para a página inicial.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#ff2448"
    });
    window.location.href="../home/index.html"; 
}

function msgErro(msg) {
    Swal.fire({
        title: "ERRO!",
        text: msg,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ff2448"
    });
}