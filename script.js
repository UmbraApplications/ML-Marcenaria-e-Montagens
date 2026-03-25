// Adicionar novo material
function addMaterial() {
    const div = document.createElement("div");
    div.classList.add("item");

    div.innerHTML = `
        <input placeholder="Material" class="nome">

        <div class="linha">
            <input type="number" min="0" step="1" placeholder="Qtd" class="qtd" oninput="atualizarSubtotal(this)">
            <input type="number" min="0" step="0.01" placeholder="Preço" class="preco" oninput="atualizarSubtotal(this)">
        </div>

        <span class="subtotal">R$ 0.00</span>

        <button class="remover" onclick="remover(this)">Remover</button>
    `;

    document.getElementById("materiais").appendChild(div);
}

// Remover material
function remover(btn) {
    const item = btn.parentElement;

    item.classList.add("removendo");

    setTimeout(() => {
        item.remove();
    }, 250);
}

// Atualizar subtotal
function atualizarSubtotal(el) {
    const item = el.closest(".item");

    const qtdInput = item.querySelector(".qtd").value;
    const precoInput = item.querySelector(".preco").value;

    const qtd = Number(qtdInput);
    const preco = Number(precoInput) || 0;

    if (!Number.isInteger(qtd) || qtd < 0) {
        item.querySelector(".subtotal").innerText = "R$ 0.00";
        return;
    }

    const subtotal = qtd * preco;

    item.querySelector(".subtotal").innerText = "R$ " + subtotal.toFixed(2);
}

// Calcular total
function calcular() {
    const itens = document.querySelectorAll(".item");

    let total = 0;
    let temItem = false;

    for (let item of itens) {
        const qtdInput = item.querySelector(".qtd").value;
        const precoInput = item.querySelector(".preco").value;

        if (qtdInput === "" && precoInput === "") continue;

        const qtd = Number(qtdInput);
        const preco = Number(precoInput);

        if (!Number.isInteger(qtd) || qtd < 0) {
            alert("Quantidade deve ser um número inteiro válido!");
            return;
        }

        if (preco < 0) {
            alert("Preço não pode ser negativo!");
            return;
        }

        if (qtd > 0 && preco > 0) {
            temItem = true;
            total += qtd * preco;
        }
    }

    const maoObra = Number(document.getElementById("maoObra").value) || 0;

    if (maoObra < 0) {
        alert("Mão de obra não pode ser negativa!");
        return;
    }

    total += maoObra;

    if (!temItem) {
        alert("Preencha pelo menos 1 material!");
        return;
    }

    document.getElementById("total").innerText = "Total: R$ " + total.toFixed(2);
}

// Baixar orçamento
async function baixar() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const cliente = document.getElementById("cliente").value || "Não informado";
    const maoObra = Number(document.getElementById("maoObra").value) || 0;
    const itens = document.querySelectorAll(".item");

    let y = 20;
    let total = 0;

    // LOGO
    const img = new Image();
    img.src = "img/logoMarcenaria.jpg";

    await new Promise(resolve => img.onload = resolve);

    // CONVERTER PRA BASE64
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const base64 = canvas.toDataURL("image/png");

    // ADICIONAR NO PDF
    doc.addImage(base64, "PNG", 10, 10, 50, 25);
    y = 45;

    // TÍTULO
    doc.setFontSize(16);
    doc.text("ORÇAMENTO MARCENARIA", 105, y, null, null, "center");

    y += 10;

    // CLIENTE
    doc.setFontSize(12);
    doc.text(`Cliente: ${cliente}`, 10, y);

    y += 10;

    doc.text("Materiais:", 10, y);
    y += 8;

    let temItem = false;

    itens.forEach(item => {
        const nome = item.querySelector(".nome").value;
        const qtd = Number(item.querySelector(".qtd").value);
        const preco = Number(item.querySelector(".preco").value);

        if (qtd > 0 && preco > 0) {
            temItem = true;
            const subtotal = qtd * preco;
            total += subtotal;

            doc.text(`${nome}`, 10, y);
            doc.text(`Qtd: ${qtd}`, 120, y);
            doc.text(`R$ ${subtotal.toFixed(2)}`, 160, y);

            y += 8;
        }
    });

    if (!temItem) {
        alert("Adicione pelo menos 1 item!");
        return;
    }

    // MÃO DE OBRA
    y += 5;
    doc.text(`Mão de obra: R$ ${maoObra.toFixed(2)}`, 10, y);

    total += maoObra;

    // TOTAL
    y += 10;
    doc.setFontSize(14);
    doc.text(`TOTAL: R$ ${total.toFixed(2)}`, 10, y);

    // DOWNLOAD
// GERAR NOME DO ARQUIVO COM CLIENTE
const nomeCliente = cliente || "Cliente";

// remove caracteres inválidos
const nomeLimpo = nomeCliente.replace(/[^a-zA-Z0-9 ]/g, "");

// nome final
const nomeArquivo = `Orcamento ${nomeLimpo}.pdf`;

// DOWNLOAD
doc.save(nomeArquivo);}
