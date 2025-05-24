document.addEventListener('DOMContentLoaded', () => {

    const menuContainer = document.getElementById('menu-container');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const emptyCartMsg = document.getElementById('empty-cart-msg');
    const whatsappButton = document.getElementById('whatsapp-button');
    const orderForm = document.getElementById('order-form');
    const navLinks = document.querySelector('.nav-links');
    const burger = document.querySelector('.burger');

    let cart = [];

    function saveCartToLocalStorage() {
        localStorage.setItem('milaPizzaCart', JSON.stringify(cart));
    }

    function loadCartFromLocalStorage() {
        const savedCart = localStorage.getItem('milaPizzaCart');
        cart = savedCart ? JSON.parse(savedCart) : [];
    }

    function renderMenu() {
        if (typeof menuData === 'undefined') {
            menuContainer.innerHTML = '<p>Error: No se pudieron cargar los datos del menú.</p>';
            console.error("Error: 'menuData' no está definido.");
            return;
        }
        menuContainer.innerHTML = '';
        for (const category in menuData) {
            const categoryTitle = document.createElement('div');
            categoryTitle.classList.add('menu-category');
            categoryTitle.innerHTML = `<h3>${category}</h3>`;
            menuContainer.appendChild(categoryTitle);
            menuData[category].forEach(item => {
                const menuItemElement = document.createElement('div');
                menuItemElement.classList.add('menu-item');
                const formattedPrice = item.precio ? item.precio.toFixed(2) : 'N/A';
                menuItemElement.innerHTML = `
                    ${item.img ? `<img src="${item.img}" alt="${item.nombre}">` : '<div style="height:150px; background:#eee; display:flex; align-items:center; justify-content:center;">Sin Imagen</div>'}
                    <h4>${item.nombre}</h4>
                    <p>${item.descripcion || ''}</p>
                    <span class="price">$${formattedPrice}</span>
                    <button class="add-to-cart-btn" data-id="${item.id}">Agregar</button>
                `;
                menuContainer.appendChild(menuItemElement);
            });
        }
    }

    function addToCart(itemId) {
        let foundItem = null;
        for (const category in menuData) {
            foundItem = menuData[category].find(item => item.id === itemId);
            if (foundItem) break;
        }
        if (foundItem) {
            const existingCartItem = cart.find(item => item.id === itemId);
            if (existingCartItem) {
                existingCartItem.quantity++;
            } else {
                cart.push({ ...foundItem, quantity: 1 });
            }
            renderCart();
            saveCartToLocalStorage();
        }
    }

    function increaseQuantity(itemId) {
        const item = cart.find(item => item.id === itemId);
        if (item) {
            item.quantity++;
            renderCart();
            saveCartToLocalStorage();
        }
    }

    function decreaseQuantity(itemId) {
        const item = cart.find(item => item.id === itemId);
        if (item) {
            item.quantity--;
            if (item.quantity === 0) {
                removeFromCart(itemId);
            } else {
                renderCart();
                saveCartToLocalStorage();
            }
        }
    }

    function removeFromCart(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        renderCart();
        saveCartToLocalStorage();
    }

    function renderCart() {
        cartItemsList.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            if(emptyCartMsg) emptyCartMsg.style.display = 'block';
        } else {
            if(emptyCartMsg) emptyCartMsg.style.display = 'none';
            cart.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="item-name">${item.nombre}</span>
                    <div class="item-controls">
                        <button class="qty-btn decrease-qty-btn" data-id="${item.id}">-</button>
                        <span class="item-qty">${item.quantity}</span>
                        <button class="qty-btn increase-qty-btn" data-id="${item.id}">+</button>
                    </div>
                    <span class="item-price">$${(item.precio * item.quantity).toFixed(2)}</span>
                    <button class="remove-item-btn" data-id="${item.id}">X</button>
                `;
                cartItemsList.appendChild(li);
                total += item.precio * item.quantity;
            });
        }
        cartTotalElement.textContent = `Total Estimado: $${total.toFixed(2)}`;
    }

    function sendWhatsAppOrder() {
        const nombre = document.getElementById('nombre').value.trim();
        const direccion = document.getElementById('direccion').value.trim();
        const pago = document.getElementById('pago').value.trim();
        const aclaraciones = document.getElementById('aclaraciones').value.trim();

        if (cart.length === 0) {
            alert('¡Tu carrito está vacío! Agregá algo antes de pedir.');
            return;
        }
        if (!nombre || !direccion) {
            alert('Por favor, completá tu Nombre y Dirección.');
            return;
        }

        let message = `¡Hola MilaPizza Memuno! 👋 Quiero hacer un pedido:\n\n`;
        let currentTotal = 0;

        cart.forEach(item => {
            message += `* ${item.quantity}x ${item.nombre}\n`;
            currentTotal += item.precio * item.quantity;
        });

        message += `\n*Total Estimado:* $${currentTotal.toFixed(2)}\n`;
        message += `\n*Datos del Pedido:*\n`;
        message += `*Nombre:* ${nombre}\n`;
        message += `*Dirección:* ${direccion}\n`;
        message += `*Pago:* ${pago || 'A definir'}\n`;
        if (aclaraciones) {
            message += `*Aclaraciones:* ${aclaraciones}\n`;
        }
        message += `\n¡Espero la confirmación y el link de pago! ¡Gracias!`;

        // ¡¡ASEGÚRATE DE QUE ESTE SEA EL NÚMERO CORRECTO!!
        const whatsappNumber = "+5491165785945"; 
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');

        cart = [];
        renderCart();
        saveCartToLocalStorage();
        orderForm.reset();
    }

    document.body.addEventListener('click', (e) => {
        const target = e.target;
        const itemId = target.getAttribute('data-id');

        if (!itemId) return; // Si no hay data-id, no hacemos nada

        if (target.classList.contains('add-to-cart-btn')) {
            addToCart(itemId);
        } else if (target.classList.contains('increase-qty-btn')) {
            increaseQuantity(itemId);
        } else if (target.classList.contains('decrease-qty-btn')) {
            decreaseQuantity(itemId);
        } else if (target.classList.contains('remove-item-btn')) {
            removeFromCart(itemId);
        }
    });

    if (whatsappButton) {
        whatsappButton.addEventListener('click', sendWhatsAppOrder);
    }

    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            burger.classList.toggle('toggle');
        });
        // Opcional: Cerrar menú al hacer clic en un link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                 navLinks.classList.remove('nav-active');
                 burger.classList.remove('toggle');
            });
        });
    }

    loadCartFromLocalStorage();
    renderMenu();
    renderCart();
});
