const campos = [
    { id: "cpf",            erro: "erroCpf",            msg: "*Informe o CPF." },
    { id: "dataVencimento", erro: "erroDataVencimento", msg: "*Informe a data de vencimento." },
    { id: "numeroRegistro", erro: "erroNumeroRegistro", msg: "*Informe o número de registro." },
];

document.addEventListener('DOMContentLoaded', () => {
    configurarLimiteDataVencimento();

    document.getElementById("enviar").addEventListener('click', async function () {
        if (!validarCampos()) return;
        if (!validarCpf()) return;

        const fd = new FormData();
        fd.append('cpf',            document.getElementById("cpf").value);
        fd.append('dataVencimento', document.getElementById("dataVencimento").value);
        fd.append('numeroRegistro', document.getElementById("numeroRegistro").value);

        const retorno  = await fetch("../php/tornarMotorista.php", { method: "POST", body: fd });
        const resposta = await retorno.json();

        if (resposta.status == "ok") {
            await Swal.fire({
                title: "Sucesso!",
                text: resposta.mensagem,
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
            window.location.href = "perfil.html";
        } else {
            Swal.fire({
                title: "ERRO!",
                text: resposta.mensagem,
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
        }
    });
});

function configurarLimiteDataVencimento() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    
    const campoData = document.getElementById("dataVencimento");
    if (campoData) {
        campoData.min = `${ano}-${mes}-${dia}`;
    }
}

function validarCampos() {
    let valido = true;

    // Obtém o dia atual local para validação numérica limpa
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;
    const diaAtual = hoje.getDate();

    for (const campo of campos) {
        const valor  = document.getElementById(campo.id).value.trim();
        const erroEl = document.getElementById(campo.erro);

        if (!valor) {
            erroEl.textContent   = campo.msg;
            erroEl.style.display = "block";
            valido = false;
        } else {
            erroEl.style.display = "none";
        }
    }

    // Se os campos básicos estão preenchidos, valida se a CNH está vencida hoje
    if (valido) {
        const dtVencimento = document.getElementById("dataVencimento").value.trim();
        const erroVencimento = document.getElementById("erroDataVencimento");

        // Quebra a string "YYYY-MM-DD" com segurança
        const [anoIn, mesIn, diaIn] = dtVencimento.split('-').map(Number);

        const estaVencido = (anoIn < anoAtual) || 
                            (anoIn === anoAtual && mesIn < mesAtual) || 
                            (anoIn === anoAtual && mesIn === mesAtual && diaIn < diaAtual);

        if (estaVencido) {
            erroVencimento.textContent   = "*A habilitação/documento informado está vencido.";
            erroVencimento.style.display = "block";
            valido = false;
        } else {
            erroVencimento.style.display = "none";
        }
    }

    return valido;
}

function validarCpf() {
    const erroEl = document.getElementById("erroCpf");
    const cpf    = document.getElementById("cpf").value.trim().replace(/\D/g, "");

    if (cpf.length !== 11) {
        Swal.fire({
            title: "ERRO!",
            text: "CPF inválido: deve conter 11 dígitos.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff2448"
        });
        return false;
    }

    for (let t = 9; t < 11; t++) {
        let sum = 0;
        for (let i = 0; i < t; i++) {
            sum += parseInt(cpf[i]) * (t + 1 - i);
        }
        let digito = (sum * 10) % 11;
        if (digito === 10) digito = 0;
        if (digito !== parseInt(cpf[t])) {
            Swal.fire({
                title: "ERRO!",
                text: "CPF inválido: dígito verificador incorreto.",
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff2448"
            });
            return false;
        }
    }

    erroEl.style.display = "none";
    return true;
}