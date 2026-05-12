const campos = [
    { id: "placa",      erro: "erroPlaca",      msg: "*Informe a placa." },
    { id: "marca",      erro: "erroMarca",      msg: "*Informe a marca." },
    { id: "modelo",     erro: "erroModelo",     msg: "*Informe o modelo." },
    { id: "ano",        erro: "erroAno",        msg: "*Informe o ano." },
    { id: "cor",        erro: "erroCor",        msg: "*Informe a cor." },
    { id: "capacidade", erro: "erroCapacidade", msg: "*Informe a capacidade." },
    { id: "renavam",    erro: "erroRenavam",    msg: "*Informe o renavam." },
    { id: "categoria",  erro: "erroCategoria",  msg: "*Informe a categoria." },
];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("enviar").addEventListener('click', function () {
        novo();
    });
});

async function novo() {
    if (!validarCampos()) return;
    if (!validarRenavam()) return;

    const fd = new FormData();

    fd.append('placa',            document.getElementById("placa").value);
    fd.append('marca',            document.getElementById("marca").value);
    fd.append('modelo',           document.getElementById("modelo").value);
    fd.append('ano',              document.getElementById("ano").value);
    fd.append('cor',              document.getElementById("cor").value);
    fd.append('renavam',          document.getElementById("renavam").value);
    fd.append('capacidade',       document.getElementById("capacidade").value);
    fd.append('gastoCombustivel', document.getElementById("gastoCombustivel").value);
    fd.append('categoria',        document.getElementById("categoria").value);

    const retorno  = await fetch("../php/novoCarro.php", { method: "POST", body: fd });
    const resposta = await retorno.json();

    if (resposta.status == "ok") {
        alert("Sucesso! " + resposta.mensagem);
        window.location.href = "../html/perfil.html";
    } else {
        alert("ERRO! " + resposta.mensagem);
    }
}

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


function validarRenavam() {
    const erroEl = document.getElementById("erroRenavam");
    const renavam = document.getElementById("renavam").value.trim().replace(/\D/g, "");

    if (renavam.length !== 9 && renavam.length !== 11) {
        erroEl.style.display = "none";
        alert("ERRO: RENAVAM inválido: deve conter 9 ou 11 dígitos.");
        return false;
    }

    const renavamPadded      = renavam.padStart(11, "0");
    const pesos              = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const digitos            = renavamPadded.split("").map(Number);
    const digitoVerificador  = digitos[10];
    let soma = 0;

    for (let i = 0; i < 10; i++) {
        soma += digitos[i] * pesos[i];
    }

    const resto          = soma % 11;
    const digitoEsperado = resto < 2 ? 0 : 11 - resto;

    if (digitoVerificador !== digitoEsperado) {
        erroEl.style.display = "none";
        alert("ERRO: RENAVAM inválido: dígito verificador incorreto.");
        return false;
    }

    erroEl.style.display = "none";
    return true;
}