const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");

const deliveryInformationBtn = document.getElementById("Delivery-information");
const checkoutModal = document.getElementById("checkout-modal");

const closeModalBtn = document.getElementById("close-cart-btn");
const closeCheckoutBtn = document.getElementById("close-checkout-btn");
const backToCartBtn = document.getElementById("back-to-cart-btn");
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
    const hour = new Date().getHours();
    return hour >= 18 && hour <= 21; // Altere conforme o horário real do seu restaurante
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

// Fechar modais
closeModalBtn.addEventListener("click", () => cartModal.style.display = "none");
closeCheckoutBtn.addEventListener("click", () => checkoutModal.style.display = "none");

backToCartBtn.addEventListener("click", () => {
    checkoutModal.style.display = "none";
    cartModal.style.display = "flex";
});

// Fechar o carrinho ao clicar fora
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
    mostrarPopupItemAdicionado(name);
}

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
                    <div class="flex items-center space-x-4">
                        <button class="change-quantity-btn" data-name="${item.name}" data-action="decrease">-</button>
                        <p class="quantity-text">${item.quantity}</p>
                        <button class="change-quantity-btn" data-name="${item.name}" data-action="increase">+</button>
                    </div>
                    <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
                </div>
            </div>
        `;
        cartItemContainer.appendChild(itemElement);
        total += item.price * item.quantity;
    });

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    // CORREÇÃO APLICADA: contador agora soma a quantidade total de unidades
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCounter.textContent = totalItems;
}

// Alterar quantidade
cartItemContainer.addEventListener("click", (event) => {
    const button = event.target;
    if (!button.classList.contains("change-quantity-btn")) return;

    const name = button.getAttribute("data-name");
    const action = button.getAttribute("data-action");

    if (action === "decrease") {
        removeItemCart(name);
    } else if (action === "increase") {
        addToCart(name, getItemPrice(name));
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
        mostrarPopupItemRemovido(name);
    }
}

function getItemPrice(name) {
    const item = cart.find(item => item.name === name);
    return item ? item.price : 0;
}

// Ir para o checkout
deliveryInformationBtn.addEventListener("click", () => {
    if (cart.length > 0) {
        cartModal.style.display = "none";
        checkoutModal.style.display = "flex";
    } else {
        mostrarPopupCarrinhoVazio();
    }
});


// Remover avisos ao digitar
nameInput.addEventListener("input", () => {
    nameWarn.classList.add("hidden");
    nameInput.classList.remove("border-red-500");
});

addressInput.addEventListener("input", () => {
    addressWarn.classList.add("hidden");
    addressInput.classList.remove("border-red-500");
});

// Finalizar pedido
checkoutBtn.addEventListener("click", () => {
    const isOpen = checkRestaurantOpen();
    if (!isOpen) {
        mostrarPopupRestauranteFechado();
        return;
    }

    if (cart.length === 0) return;

    const name = nameInput.value.trim();
    const address = addressInput.value.trim();
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked');

    if (!name) {
        nameWarn.classList.remove("hidden");
        nameInput.classList.add("border-red-500");
        return;
    }

    if (!address) {
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        return;
    }

    if (!paymentMethod) {
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
        `Cliente: ${name}\n` +
        `Endereço: ${address}\n` +
        `Pagamento: ${paymentMethod.value}`
    );

    const phone = "5588921485651";
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
});

// Popups
function mostrarPopupRestauranteFechado() {
    const popup = document.getElementById("popup-fechado");
    const overlay = document.getElementById("overlay");

    popup.classList.remove("hidden");
    overlay.classList.remove("hidden");

    setTimeout(() => {
        popup.classList.add("hidden");
        overlay.classList.add("hidden");
    }, 3000);
}

function mostrarPopupItemAdicionado(nome) {
    const item = cart.find(item => item.name === nome);
    const quantidade = item ? item.quantity : 1;

    const popup = document.getElementById("popup-adicionado");
    popup.textContent = `✔️ ${quantidade}x ${nome} adicionado ao carrinho!`;

    popup.classList.remove("hidden", "opacity-0");
    popup.classList.add("opacity-100");

    setTimeout(() => {
        popup.classList.add("opacity-0");
        setTimeout(() => popup.classList.add("hidden"), 500);
    }, 5000);
}

function mostrarPopupItemRemovido(nome) {
    const item = cart.find(item => item.name === nome);
    const quantidadeRestante = item ? item.quantity : 0;

    const popup = document.getElementById("popup-removido");
    popup.textContent = `❌ ${quantidadeRestante}x ${nome} no carrinho!`;

    popup.classList.remove("hidden", "opacity-0");
    popup.classList.add("opacity-100");

    setTimeout(() => {
        popup.classList.add("opacity-0");
        setTimeout(() => popup.classList.add("hidden"), 500);
    }, 4000);
}

function mostrarPopupCarrinhoVazio() {
    const popup = document.getElementById("popup-carrinho-vazio");
    popup.classList.remove("hidden", "opacity-0");
    popup.classList.add("opacity-100");

    setTimeout(() => {
        popup.classList.add("opacity-0");
        setTimeout(() => popup.classList.add("hidden"), 500);
    }, 5000);
}

