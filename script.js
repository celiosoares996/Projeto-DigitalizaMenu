const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");

const deliveryInformationBtn = document.getElementById("Delivery-information");
const checkoutModal = document.getElementById("checkout-modal");

const closeModalBtn = document.getElementById("close-cart-btn");
const closeCheckoutBtn = document.getElementById("close-checkout-btn"); // Botão de fechar checkout
const backToCartBtn = document.getElementById("back-to-cart-btn"); // Botão de voltar ao carrinho
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const nameInput = document.getElementById("name-client");

const addressWarn = document.getElementById("address-warn");
const nameWarn = document.getElementById("name-warn");
const paymentWarn = document.getElementById("payment-warn");

const spanItem = document.getElementById("date-span");

let cart = [];

// Verifica horário e atualiza status de funcionamento
function checkRestaurantOpen() {
    const date = new Date();
    const hour = date.getHours();
    return hour >= 18 && hour <= 21;
}

function updateOpenStatus() {
    const isOpen = checkRestaurantOpen();
    spanItem.classList.toggle("bg-green-500", isOpen);
    spanItem.classList.toggle("bg-red-500", !isOpen);
}

updateOpenStatus();

// Ações do botão de abrir carrinho
cartBtn.addEventListener("click", () => {
    updateCartModal();
    cartModal.style.display = "flex";
});

// Fechar modal do carrinho
closeModalBtn.addEventListener("click", () => {
    cartModal.style.display = "none";
});

// Fechar modal do checkout
closeCheckoutBtn.addEventListener("click", () => {
    checkoutModal.style.display = "none";
});

// Voltar ao carrinho
backToCartBtn.addEventListener("click", () => {
    checkoutModal.style.display = "none";
    cartModal.style.display = "flex"; // Mostrar o carrinho novamente
});

cartModal.addEventListener("click", (event) => {
    if (event.target === cartModal) {
        cartModal.style.display = "none";
    }
});

// Adicionar item ao carrinho
menu.addEventListener("click", (event) => {
    const button = event.target.closest(".add-to-cart-btn");
    if (button) {
        const name = button.getAttribute("data-name");
        const price = parseFloat(button.getAttribute("data-price"));
        addToCart(name, price);
    }
});

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCartModal();
}

// Atualizar carrinho
function updateCartModal() {
    cartItemContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

        itemElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">${item.name}</p>
                    <p>Qtd: ${item.quantity}</p>
                    <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
                </div>
                <button class="remove-from-cart-btn" data-name="${item.name}">Remover</button>
            </div>
        `;

        cartItemContainer.appendChild(itemElement);
        total += item.price * item.quantity;
    });

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    cartCounter.textContent = cart.length;
}

// Remover item
cartItemContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name");
        removeItemCart(name);
    }
});

function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);
    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        updateCartModal();
    }
}

// Ir para o checkout
deliveryInformationBtn.addEventListener("click", () => {
    cartModal.style.display = "none";
    checkoutModal.style.display = "flex";
});

// Esconder aviso ao digitar nome
nameInput.addEventListener("input", () => {
    nameWarn.classList.add("hidden");
    nameInput.classList.remove("border-red-500");
});

// Esconder aviso ao digitar endereço
addressInput.addEventListener("input", () => {
    addressWarn.classList.add("hidden");
    addressInput.classList.remove("border-red-500");
});

// Finalizar pedido e enviar para WhatsApp
checkoutBtn.addEventListener("click", () => {
    const isOpen = checkRestaurantOpen();
    if (!isOpen) {
        mostrarPopupRestauranteFechado();
        return;
    }

    if (cart.length === 0) return;

    // Validação do campo nome
    if (nameInput.value.trim() === "") {
        nameWarn.classList.remove("hidden");
        nameInput.classList.add("border-red-500");
        return;
    }

    // Validação do campo endereço
    if (addressInput.value.trim() === "") {
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        return;
    }

    const selectedPayment = document.querySelector('input[name="payment-method"]:checked');
    if (!selectedPayment) {
        paymentWarn.classList.remove("hidden");
        return;
    } else {
        paymentWarn.classList.add("hidden");
    }

    const cartItems = cart.map(item => `${item.quantity}x ${item.name} - R$${item.price.toFixed(2)}`).join("\n");
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const message = encodeURIComponent(
        `*Comanda do Pedido*\n\n` +
        `*Itens do Pedido:*\n${cartItems}\n` +
        `*Total:* R$ ${totalAmount.toFixed(2)}\n\n` +
        `*Informações de Entrega:*\n` +
        `Cliente: ${nameInput.value}\n` +
        `Endereço: ${addressInput.value}\n` +
        `Pagamento: ${selectedPayment.value}`
    );

    const phone = "5588921485651";
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
});

// Popup restaurante fechado
function mostrarPopupRestauranteFechado() {
    document.getElementById("popup-fechado").classList.remove("hidden");
    document.getElementById("overlay").classList.remove("hidden");

    setTimeout(() => {
        document.getElementById("popup-fechado").classList.add("hidden");
        document.getElementById("overlay").classList.add("hidden");
    }, 3000);
}
