const campos = [
    { id: "cpf",            erro: "erroCpf",            msg: "*Informe o CPF." },
    { id: "dataVencimento", erro: "erroDataVencimento", msg: "*Informe a data de vencimento." },
    { id: "numeroRegistro", erro: "erroNumeroRegistro", msg: "*Informe o número de registro." },
];

document.addEventListener('DOMContentLoaded', () => {
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
            alert("Sucesso! " + resposta.mensagem);
            window.location.href = "perfil.html";
        } else {
            alert("ERRO! " + resposta.mensagem);
        }
    });
});

function validarCampos() {
    let valido = true;

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

    return valido;
}

function validarCpf() {
    const erroEl = document.getElementById("erroCpf");
    const cpf    = document.getElementById("cpf").value.trim().replace(/\D/g, "");

    if (cpf.length !== 11) {
        alert("ERRO: CPF inválido: deve conter 11 dígitos.");
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
            alert("ERRO: CPF inválido: dígito verificador incorreto.");
            return false;
        }
    }

    erroEl.style.display = "none";
    return true;
}