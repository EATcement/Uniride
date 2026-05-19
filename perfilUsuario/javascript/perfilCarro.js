document.addEventListener("DOMContentLoaded", () => {
    verificarMotorista();

    if (document.getElementById("lista")) {
        carregarDados();
    }
});

const botaoNovo = document.getElementById("novoCarro");
if (botaoNovo) {
    botaoNovo.addEventListener("click", () => {
        window.location.href = '../html/novoCarro.html';
    });
}

async function carregarDados() {
    const retorno = await fetch("../php/perfilCarro.php");
    const resposta = await retorno.json();

    const container = document.getElementById("lista");

    if (resposta.status === "ok") {
        const registros = resposta.data;

        if (registros.length === 0) {
            container.innerHTML = `
                <p style="color: #95a5a6; font-style: italic; text-align: center; margin-top: 20px;">
                    Nenhum carro cadastrado no momento.
                </p>`;
            return;
        }

        let html = "";

        registros.forEach(objeto => {
            html += `
                <div style="background: #1e2d3b; border: 1px solid #2a3b4c; padding: 15px; margin-bottom: 15px; border-radius: 8px; color: #ffffff; font-family: sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    
                    <h2 style="color: #3498db; margin-top: 0; border-bottom: 1px solid #2a3b4c; padding-bottom: 8px; text-transform: capitalize;">
                        🚗 ${objeto.marca} ${objeto.modelo}
                    </h2>

                    <p style="margin: 8px 0;">
                        <strong style="color: #bdc3c7; ">Placa:</strong>
                        <span style="color: #2ecc71; font-weight: bold; text-transform: uppercase;">${objeto.placa}</span>
                    </p>

                    <p style="margin: 8px 0;">
                        <strong style="color: #bdc3c7;">Renavam:</strong>
                        <span style="color: #ffffff;">${objeto.renavam}</span>
                    </p>

                    <p style="margin: 8px 0;">
                        <strong style="color: #bdc3c7;">Ano:</strong>
                        <span style="color: #ffffff;">${objeto.ano}</span>
                    </p>

                    <p style="margin: 8px 0;">
                        <strong style="color: #bdc3c7;">Cor:</strong>
                        <span style="color: #ffffff; text-transform: capitalize;">${objeto.cor}</span>
                    </p>

                    <p style="margin: 8px 0;">
                        <strong style="color: #bdc3c7;">Capacidade:</strong>
                        <span style="color: #ffffff;">${objeto.capacidade} passageiros</span>
                    </p>

                    <p style="margin: 8px 0;">
                        <strong style="color: #bdc3c7;">Gasto de Combustível:</strong>
                        <span style="color: #ffffff;">${objeto.gastoCombustivel} km/l</span>
                    </p>

                    <p style="margin: 8px 0;">
                        <strong style="color: #bdc3c7;">Categoria:</strong>
                        <span style="color: #ffffff; text-transform: uppercase;">${objeto.categoria}</span>
                    </p>
                    
                    <div style="margin-top: 20px; display: flex; justify-content: center; gap: 12px;">                        
                        
                        <a href="alterarCarro.html?id=${objeto.id}" 
                           style="background: #2980b9; color: white; border-radius: 4px; padding: 4px 10px; cursor:pointer; text-decoration: none; font-size: 0.9rem;">
                            ✏️ Alterar
                        </a>

                        <a href="#" onclick="excluirCarro(${objeto.id})"
                           style="background: #dc3545; color: white; border-radius: 4px; padding: 4px 10px; text-decoration: none; font-size: 0.9rem;">
                            🗑️ Excluir
                        </a>
                    </div>
                </div>`;
        });

        container.innerHTML = html;

    } else {
        console.log("Erro: " + resposta.mensagem);
        container.innerHTML = `
            <p style="color: #95a5a6; font-style: italic; text-align: center; margin-top: 20px;">
                Nenhum carro cadastrado no momento.
            </p>`;
    }
}

async function verificarMotorista() {
    const retornoMotorista = await fetch("../../viagens/php/verificaMotorista.php");
    const respostaMotorista = await retornoMotorista.json();

    if (respostaMotorista.motorista == true) {
        mostrarCarrosCadastrados();
    }
}

function mostrarCarrosCadastrados() {
    var x = document.getElementById("carrosCadastrados");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

async function excluirCarro(id) {
    const retorno = await fetch("../php/excluirCarro.php?id=" + id);
    const resposta = await retorno.json();
    if (resposta.status == "ok") {
        carregarDados();
    } else {
        console.log("Erro: " + resposta.mensagem);
    }
}