document.getElementById("enviar").addEventListener("click", () => {
    login();
});

async function login() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const fd = new FormData();
    fd.append("email", email);
    fd.append("senha", senha);

    const retorno  = await fetch("../php/login.php", { method: "POST", body: fd });
    const resposta = await retorno.json();

    if (resposta.status === "ok") {
        if (resposta.isAdmin) {
            // redireciona p o painel do administrador
            window.location.href = "../admin/admin.html";
        } else {
            window.location.href = "../viagens/html/index.html";
        }
    } else {
        Swal.fire({
            title: "Erro!",
            text: "Credenciais inválidas.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#ff2448"
        });
    }
}