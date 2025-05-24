document.addEventListener('DOMContentLoaded', () => {

    const menuContainer = document.getElementById('menu-container');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const emptyCartMsg = document.getElementById('empty-cart-msg');
    const whatsappButton = document.getElementById('whatsapp-button');
    const orderForm = document.getElementById('order-form');
    const navLinks = document.querySelector('.nav-links');
    const burger = document.querySelector('.burger');

    let cart = []; // Nuestro carrito de compras

    // --- NUEVA FUNCIÓN: Guardar Carrito en Local Storage ---
    function saveCartToLocalStorage() {
        // LocalStorage solo guarda texto, así que convertimos el array a JSON
        localStorage.setItem('milaPizzaCart', JSON.stringify(cart));
    }

    // --- NUEVA FUNCIÓN: Cargar Carrito desde Local Storage ---
    function loadCartFromLocalStorage() {
        const savedCart = localStorage.getItem('milaPizzaCart');
        if (savedCart) {
            // Si hay algo guardado, lo convertimos de vuelta a un array
            cart = JSON.parse(savedCart);
        } else {
            // Si no hay nada, nos aseguramos que el carrito esté vacío
            cart = [];
        }
    }

    // --- Cargar y Mostrar el Menú ---
    function renderMenu() {
        if (typeof menuData === 'undefined') {
            menuContainer.innerHTML = '<p>Error: No se pudieron cargar los datos del menú. Revisa el archivo menu-data.js y la consola.</p>';
            console.error("La variable 'menuData' no está definida. ¿Está cargado 'menu-data.js' correctamente antes que 'script.js'?");
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

    // --- Lógica del Carrito (MODIFICADA) ---
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
            saveCartToLocalStorage(); // <--- GUARDAMOS AL AÑADIR
        }
    }

    function removeFromCart(itemId) {
         const itemIndex = cart.findIndex(item => item.id === itemId);
         if (itemIndex > -1) {
            cart[itemIndex].quantity--;
            if (cart[itemIndex].quantity === 0) {
                cart.splice(itemIndex, 1);
            }
         }
         renderCart();
         saveCartToLocalStorage(); // <--- GUARDAMOS AL QUITAR
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
                    <span>${item.quantity}x ${item.nombre}</span>
                    <span>$${(item.precio * item.quantity).toFixed(2)}</span>
                    <button class="remove-from-cart-btn" data-id="${item.id}" style="background:red; color:white; border:none; padding: 2px 5px; cursor:pointer; margin-left: 5px; border-radius: 3px;">X</button>
                `;
                cartItemsList.appendChild(li);
                total += item.precio * item.quantity;
            });
        }
        cartTotalElement.textContent = `Total Estimado: $${total.toFixed(2)}`;
    }

    // --- Integración con WhatsApp (MODIFICADA) ---
    function sendWhatsAppOrder() {
        // ... (resto de la función igual) ...

        if (cart.length === 0) {
            alert('¡Tu carrito está vacío! Agregá algo antes de pedir.');
            return;
        }
        // ... (resto de la validación y construcción del mensaje igual) ...
         const nombre = document.getElementById('nombre').value.trim();
        const direccion = document.getElementById('direccion').value.trim();
        const pago = document.getElementById('pago').value.trim();
        const aclaraciones = document.getElementById('aclaraciones').value.trim();

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

        const whatsappNumber = "+549116578945";
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');

        // --- NUEVO: Limpiar carrito después de enviar ---
        cart = [];
        renderCart();
        saveCartToLocalStorage(); // Guardamos el carrito vacío
        orderForm.reset(); // Limpia los campos del formulario
    }

    // --- Event Listeners ---
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const itemId = e.target.getAttribute('data-id');
            addToCart(itemId);
        }
        if (e.target.classList.contains('remove-from-cart-btn')) {
            const itemId = e.target.getAttribute('data-id');
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
    }

    // --- Inicializar (MODIFICADO) ---
    loadCartFromLocalStorage(); // <--- CARGAMOS AL INICIAR
    renderMenu();
    renderCart(); // <--- MOSTRAMOS EL CARRITO CARGADO O VACÍO
});
