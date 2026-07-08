/**
 * ARCHITECT: Joel Benjamin Durán Méndez (Benjamin Duran Mendez)
 * VERSION: 5.1 CORPORATIVE ROLEPLAY
 * DATE: 2026
 */

// ESTADO GLOBAL DE LA APLICACIÓN SPA
let catalogData = { vehiculos: [], motos: [] };
let cart = [];

// ELEMENTOS DEL DOM DE CARGA INICIAL
document.addEventListener("DOMContentLoaded", () => {
    initApp();
    setupEventListeners();
});

// CARGA ASÍNCRONA DE DATOS (REQUERIMIENTO OBLIGATORIO FETCH)
async function initApp() {
    try {
        const response = await fetch("vehiculo.json");
        if (!response.ok) throw new Error("No se localizó el archivo maestro de configuración vehicular.");
        
        catalogData = await response.json();
        
        // Renderizado inicial por lotes
        renderCards(catalogData.vehiculos, "container-vehiculos", "vehiculo");
        renderCards(catalogData.motos, "container-motos", "moto");
    } catch (error) {
        console.error("Critical Failure:", error);
        Swal.fire({
            icon: 'error',
            title: 'Fallo de Infraestructura TI',
            text: 'No se pudo cargar de forma correcta el JSON local de la base de datos.',
            background: '#0b0e14',
            color: '#fff'
        });
    }
}

// CONFIGURACIÓN DE ESCUCHADORES DE EVENTOS
function setupEventListeners() {
    // Buscador Dinámico Global en tiempo real (Barra Fija)
    document.getElementById("globalSearch").addEventListener("input", (e) => {
        const value = e.target.value.toLowerCase().trim();
        
        const filteredVehiculos = catalogData.vehiculos.filter(item => 
            item.marca.toLowerCase().includes(value) || 
            item.modelo.toLowerCase().includes(value) ||
            item.motor.toLowerCase().includes(value)
        );
        
        const filteredMotos = catalogData.motos.filter(item => 
            item.marca.toLowerCase().includes(value) || 
            item.modelo.toLowerCase().includes(value) ||
            item.motor.toLowerCase().includes(value)
        );
        
        renderCards(filteredVehiculos, "container-vehiculos", "vehiculo");
        renderCards(filteredMotos, "container-motos", "moto");
    });

    // Escuchador dinámico para el cálculo de subtotal en el modal de Alquiler
    document.getElementById("rentQuantity").addEventListener("input", updateRentModalSubtotal);
    document.getElementsByName("rentDurationType").forEach(radio => {
        radio.addEventListener("change", updateRentModalSubtotal);
    });

    // Confirmación de adición de alquiler al carrito
    document.getElementById("btnConfirmRent").addEventListener("click", executeAddRentToCart);

    // Botón de Checkout Final
    document.getElementById("btnCheckout").addEventListener("click", processCheckoutTransaction);
}

// RENDERIZADOR DINÁMICO DE TARJETAS DE ACUERDO CON LA GUÍA DE DISEÑO
function renderCards(items, containerId, itemType) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (items.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted fs-5"><i class="fas fa-exclamation-triangle me-2"></i>No se encontraron activos bajo este parámetro de búsqueda.</p>
            </div>`;
        return;
    }

    items.forEach(item => {
        const cardCol = document.createElement("div");
        cardCol.className = "col-xl-4 col-md-6 col-12";
        
        cardCol.innerHTML = `
            <div class="luxury-card h-100 d-flex flex-column">
                ${item.oferta_alquiler ? `<span class="offer-badge"><i class="fas fa-tag me-1"></i> ${item.oferta_alquiler}</span>` : ''}
                
                <div class="card-img-wrapper" onclick="openImageModal('${item.imagen}')">
                    <img src="${item.imagen}" alt="${item.marca} ${item.modelo}">
                </div>
                
                <div class="card-body d-flex flex-column p-4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="text-muted small">CÓD: #${item.codigo}</span>
                        <div class="d-flex align-items-center">
                            <img src="${item.logo}" alt="Logo Brand" style="width:20px; height:20px; object-fit:contain;" class="me-2">
                            <span class="fw-bold text-uppercase text-white">${item.marca}</span>
                        </div>
                    </div>
                    
                    <h4 class="card-title fw-bold text-cyan-glow mb-3">${item.modelo}</h4>
                    <p class="text-muted small mb-3 flex-grow-1">${item.caracteristicas} | <span class="text-white">Motor:</span> ${item.motor}</p>
                    
                    <ul class="list-group list-group-flush bg-transparent mb-4">
                        <li class="list-group-item bg-transparent text-white border-secondary d-flex justify-content-between px-0 py-2">
                            <span><i class="fas fa-tags text-purple me-2"></i>Precio Venta:</span>
                            <span class="fw-bold text-white">$${item.precio_venta.toLocaleString()} USD</span>
                        </li>
                        <li class="list-group-item bg-transparent text-white border-secondary d-flex justify-content-between px-0 py-2">
                            <span><i class="fas fa-calendar-day text-cyan me-2"></i>Alquiler Diario:</span>
                            <span class="fw-bold text-cyan">$${item.precio_alquiler_dia.toLocaleString()} USD</span>
                        </li>
                        <li class="list-group-item bg-transparent text-white border-secondary-element-no d-flex justify-content-between px-0 py-2">
                            <span><i class="fas fa-clock text-cyan me-2"></i>Alquiler Hora:</span>
                            <span class="fw-bold text-cyan">$${item.precio_alquiler_hora.toLocaleString()} USD</span>
                        </li>
                    </ul>
                    
                    <div class="row g-2 mt-auto">
                        <div class="col-6">
                            <button class="btn btn-gradient-cyan w-100 py-2" onclick="openRentConfigModal(${item.codigo}, '${itemType}')">
                                <i class="fas fa-key me-2"></i>Alquilar
                            </button>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-gradient-purple w-100 py-2" onclick="addPurchaseToCart(${item.codigo}, '${itemType}')">
                                <i class="fas fa-wallet me-2"></i>Comprar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(cardCol);
    });
}

// APERTURA DEL MODAL DE IMÁGENES REQUERIDO PARA REVISIÓN DE DETALLES EN ALTA RESOLUCIÓN
function openImageModal(imgSrc) {
    document.getElementById("expandedModalImage").src = imgSrc;
    const instance = new bootstrap.Modal(document.getElementById('imageModal'));
    instance.show();
}

// AGREGAR AL CARRITO DIRECTO COMO MÓDULO DE COMPRA TOTAL
function addPurchaseToCart(codigo, itemType) {
    const dataset = itemType === "vehiculo" ? catalogData.vehiculos : catalogData.motos;
    const targetItem = dataset.find(i => i.codigo === codigo);

    if (targetItem.existencia <= 0) {
        Swal.fire({ icon: 'warning', title: 'Sin Existencia', text: 'Esta unidad ha sido reservada o vendida en su totalidad.', background: '#0b0e14', color: '#fff' });
        return;
    }

    // Buscamos si ya está en el carrito bajo la modalidad de Compra
    const cartIndex = cart.findIndex(i => i.codigo === codigo && i.operation === "Venta");
    if (cartIndex > -1) {
        Swal.fire({ icon: 'info', title: 'Ítem en proceso', text: 'Esta unidad exclusiva ya se encuentra en su panel de facturación.', background: '#0b0e14', color: '#fff' });
        return;
    }

    cart.push({
        ...targetItem,
        operation: "Venta",
        quantity: 1,
        durationType: "N/A",
        calculatedPrice: targetItem.precio_venta
    });

    updateCartUI();
    Swal.fire({
        icon: 'success',
        title: 'Agregado para Venta',
        text: `${targetItem.marca} ${targetItem.modelo} listo en mesa de transacciones.`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        background: '#0d1117',
        color: '#fff'
    });
}

// CONTROLADORES DE APERTURA DEL MODAL INTERACTIVO DE ALQUILER
function openRentConfigModal(codigo, itemType) {
    const dataset = itemType === "vehiculo" ? catalogData.vehiculos : catalogData.motos;
    const targetItem = dataset.find(i => i.codigo === codigo);

    document.getElementById("rentItemCode").value = codigo;
    document.getElementById("rentItemType").value = itemType;
    document.getElementById("rentItemDetails").innerText = `${targetItem.marca} ${targetItem.modelo} (Disponibles: ${targetItem.existencia} unidades)`;
    document.getElementById("rentQuantity").value = 1;
    
    updateRentModalSubtotal();
    
    const rentModal = new bootstrap.Modal(document.getElementById('rentModal'));
    rentModal.show();
}

// CÁLCULO ARITMÉTICO EN TIEMPO REAL DEL SUB-TOTAL DE RENTA
function updateRentModalSubtotal() {
    const codigo = parseInt(document.getElementById("rentItemCode").value);
    const itemType = document.getElementById("rentItemType").value;
    const durationType = document.querySelector('input[name="rentDurationType"]:checked').value;
    const quantity = parseInt(document.getElementById("rentQuantity").value) || 1;

    if (!codigo) return;

    const dataset = itemType === "vehiculo" ? catalogData.vehiculos : catalogData.motos;
    const targetItem = dataset.find(i => i.codigo === codigo);

    const unitPrice = durationType === "hours" ? targetItem.precio_alquiler_hora : targetItem.precio_alquiler_dia;
    const subtotal = unitPrice * quantity;

    document.getElementById("rentSubtotalDisplay").innerText = `$${subtotal.toLocaleString()} USD`;
}

// ACCIÓN DE ASIGNACIÓN INTERNA DE RENTAS HACIA LA MATRIZ DEL CARRITO
function executeAddRentToCart() {
    const codigo = parseInt(document.getElementById("rentItemCode").value);
    const itemType = document.getElementById("rentItemType").value;
    const durationType = document.querySelector('input[name="rentDurationType"]:checked').value;
    const quantity = parseInt(document.getElementById("rentQuantity").value) || 1;

    const dataset = itemType === "vehiculo" ? catalogData.vehiculos : catalogData.motos;
    const targetItem = dataset.find(i => i.codigo === codigo);

    const unitPrice = durationType === "hours" ? targetItem.precio_alquiler_hora : targetItem.precio_alquiler_dia;
    const calculatedPrice = unitPrice * quantity;

    cart.push({
        ...targetItem,
        operation: "Alquiler",
        quantity: quantity,
        durationType: durationType === "hours" ? "Horas" : "Días",
        calculatedPrice: calculatedPrice
    });

    updateCartUI();
    
    // Ocultar modal de forma segura mediante instancia Bootstrap nativa
    const modalElement = document.getElementById('rentModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if(modalInstance) modalInstance.hide();

    Swal.fire({
        icon: 'success',
        title: 'Contrato de Alquiler Listado',
        text: `Se agregaron ${quantity} ${durationType === 'hours' ? 'horas' : 'días'} de reserva para el activo.`,
        background: '#060709',
        color: '#fff'
    });
}

// RE-RENDER DE LA INTERFAZ DE CARRITO Y CONTADORES NUMÉRICOS
function updateCartUI() {
    // Actualizar Contador Flotante Badge
    document.getElementById("cartBadge").innerText = cart.length;

    const tableBody = document.getElementById("cartTableBody");
    tableBody.innerHTML = "";

    let totalNeto = 0;

    if (cart.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Mesa de facturación vacía. Elija una unidad.</td></tr>`;
        document.getElementById("cartTotalDisplay").innerText = "$0.00 USD";
        return;
    }

    cart.forEach((item, index) => {
        totalNeto += item.calculatedPrice;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="${item.imagen}" alt="Thumbnail" style="width:60px; height:40px; object-fit:cover; border-radius:4px; border: 1px solid #333;"></td>
            <td>
                <span class="fw-bold text-white">${item.marca} ${item.modelo}</span><br>
                <small class="text-muted">Cód: #${item.codigo} | Motor: ${item.motor}</small>
            </td>
            <td>
                <span class="badge ${item.operation === 'Venta' ? 'bg-neon-purple' : 'bg-info'}">${item.operation}</span>
                ${item.operation === 'Alquiler' ? `<br><small class="text-muted">${item.quantity} ${item.durationType}</small>` : ''}
            </td>
            <td class="fw-bold text-green">$${item.calculatedPrice.toLocaleString()} USD</td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-danger" onclick="removeCartItem(${index})"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById("cartTotalDisplay").innerText = `$${totalNeto.toLocaleString()} USD`;
}

// BORRADO SELECTIVO DE ELEMENTOS CONTENIDOS EN EL CARRITO
function removeCartItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// PROCESADOR GLOBAL DE PAGOS, VALIDACIÓN FORMULARIO Y GENERACIÓN DE ARCHIVOS PDF MEDIANTE STRING LITERAL
function processCheckoutTransaction() {
    if (cart.length === 0) {
        Swal.fire({ icon: 'error', title: 'Operación Inválida', text: 'No existen activos dentro de la mesa de transacciones.', background: '#0b0e14', color: '#fff' });
        return;
    }

    // Validación Nativa de Requerimientos de campos obligatorios
    const customerName = document.getElementById("customerName").value.trim();
    const paymentMethod = document.getElementById("paymentMethod").value;
    const deliveryDate = document.getElementById("deliveryDate").value;

    if (!customerName || !paymentMethod || !deliveryDate) {
        Swal.fire({ icon: 'warning', title: 'Campos Requeridos', text: 'Por favor complete todos los campos de facturación obligatorios.', background: '#0b0e14', color: '#fff' });
        return;
    }

    // 1. ANÁLISIS DINÁMICO DEL COMPORTAMIENTO CONTRACTUAL
    const hasVenta = cart.some(i => i.operation === "Venta");
    const hasAlquiler = cart.some(i => i.operation === "Alquiler");

    let docTitle = "";
    if (hasVenta && !hasAlquiler) docTitle = "FACTURA DE VENTA CORPORATIVA";
    else if (!hasVenta && hasAlquiler) docTitle = "CONTRATO DE ALQUILER Y ACUERDO DE RESPONSABILIDAD MULTILATERAL";
    else docTitle = "FACTURA DE VENTA Y CONTRATO DE ALQUILER INTEGRADO";

    // 2. CONSTRUCCIÓN ASÍNCRONA DE FILAS HTML INTERNAS PARA LA TABLA DEL PDF
    let rowsHtml = "";
    let totalAcumulado = 0;

    cart.forEach(item => {
        totalAcumulado += item.calculatedPrice;
        rowsHtml += `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; text-align: center;">
                    <img src="${item.imagen}" style="width: 75px; height: 45px; object-fit: cover; border-radius: 4px;" alt="Asset Visual">
                </td>
                <td style="padding: 10px; font-weight: bold;">#${item.codigo}</td>
                <td style="padding: 10px;">${item.marca} - ${item.modelo}<br><small style="color:#555;">${item.motor}</small></td>
                <td style="padding: 10px; text-align: center; text-transform: uppercase;">${item.operation} ${item.operation === 'Alquiler' ? `(${item.quantity} ${item.durationType})` : ''}</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">$${item.calculatedPrice.toLocaleString()} USD</td>
            </tr>
        `;
    });

    // 3. SECCIÓN REQUERIDA DE CLÁUSULA CONTRACTUAL CON CRITERIOS DE SALTO DE PÁGINA EVITADO
    let contractSection = "";
    if (hasAlquiler) {
        contractSection = `
            <div style="margin-top: 30px; padding: 20px; border: 1px solid #000; background-color: #fff; page-break-inside: avoid;">
                <h4 style="margin-top: 0; border-bottom: 1px solid #000; padding-bottom: 5px;">ACUERDO DE RESPONSABILIDAD CIVIL Y PENAL</h4>
                <p style="font-size: 11px; text-align: justify; line-height: 1.4; color: #111;">
                    Por medio del presente instrumento jurídico de alta gama, el firmante denominado <b>${customerName}</b> asume total y absoluta responsabilidad civil, contractual, extracontractual y penal sobre la integridad física de las unidades automotrices descritas en el balance superior. El uso de las mismas queda restringido a vías idóneas autorizadas por la firma constructora. Luxury Motors Elite Corp. se reserva el derecho de rastreo satelital telemático automatizado. Cualquier alteración de los módulos de inyección electrónica C#/.NET o telemetría resultará en la rescisión de garantías y confiscación inmediata sin reintegro de fondos.
                </p>
                <div style="margin-top: 40px; display: flex; justify-content: space-between;">
                    <div style="width: 45%; text-align: center;">
                        <div style="border-top: 1px solid #000; margin-top: 40px; font-size: 12px; font-weight: bold;">Firma del Cliente Autorizado</div>
                        <div style="font-size: 10px; color: #555;">D.I. / Pasaporte</div>
                    </div>
                    <div style="width: 45%; text-align: center;">
                        <div style="border-top: 1px solid #000; margin-top: 40px; font-size: 12px; font-weight: bold;">Luxury Motors Elite Corp.</div>
                        <div style="font-size: 10px; color: #555;">Mesa de Control de Activos Directos</div>
                    </div>
                </div>
            </div>
        `;
    }

    // OBTENCIÓN DE FECHA LOCAL FORMATO CORTO
    const dateStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    // Ruta del Logotipo corporativo centrado obligado en el header
    const logoSrc = "assets/logo_pagina.png";

    // 4. EL TRUCO INFALIBLE: COMPOSICIÓN DINÁMICA DEL PLANTILLADO TEMPLATE STRING (NO HIDDEN DIVS BUG PREVENT)
    const htmlString = `
        <div style="padding: 40px; font-family: Arial, sans-serif; color: #000; background: #fff; width: 100%; box-sizing: border-box;">
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px;">
                <img src="${logoSrc}" style="height: 60px; margin-bottom: 10px; border-radius: 4px;" alt="Luxury Motors Logo" onerror="this.src='https://img.icons8.com/fluency/120/luxury.png';">
                <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px;">${docTitle}</h1>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #555;">Luxury Motors Elite Corp. | Santo Domingo, Rep. Dom.</p>
                <p style="margin: 3px 0 0 0; font-size: 11px; font-weight: bold; color: #333;">Fecha Emisión: ${dateStr}</p>
            </div>
            
            <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #bbb; background-color: #f9f9f9; font-size: 13px; border-radius: 4px;">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #111; border-bottom: 1px solid #ddd; padding-bottom: 3px;">DATOS DEL CLIENTE & TRANSACCIÓN</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 3px 0; width: 50%;"><b>Cliente:</b> ${customerName}</td>
                        <td style="padding: 3px 0; width: 50%;"><b>Vía Liquidación:</b> ${paymentMethod}</td>
                    </tr>
                    <tr>
                        <td style="padding: 3px 0; colspan='2'"><b>Fecha de Compromiso de Devolución/Entrega:</b> ${deliveryDate}</td>
                    </tr>
                </table>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px;">
                <thead>
                    <tr style="background-color: #111; color: #fff; font-weight: bold;">
                        <th style="padding: 10px; text-align: center; width: 15%;">FOTO</th>
                        <th style="padding: 10px; text-align: left; width: 15%;">CÓDIGO</th>
                        <th style="padding: 10px; text-align: left; width: 40%;">DESCRIPCIÓN DEL ACTIVO</th>
                        <th style="padding: 10px; text-align: center; width: 15%;">OPERACIÓN</th>
                        <th style="padding: 10px; text-align: right; width: 15%;">MONTO BRUTO</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
                <tfoot>
                    <tr style="background-color: #f0f0f0; font-size: 14px; font-weight: bold;">
                        <td colspan="4" style="padding: 12px; text-align: right;">TOTAL GENERAL LIQUIDADO:</td>
                        <td style="padding: 12px; text-align: right; color: #000; font-size: 15px;">$${totalAcumulado.toLocaleString()} USD</td>
                    </tr>
                </tfoot>
            </table>

            ${contractSection}
        </div>
    `;

    // 5. CIERRE DE MODALES Y LIMPIEZA DE BACKDROPS PARA EVITAR PANTALLAS CONGELADAS
    const cartModalElement = document.getElementById('cartModal');
    const cartModalInstance = bootstrap.Modal.getInstance(cartModalElement);
    if (cartModalInstance) cartModalInstance.hide();

    // Remoción estricta forzada de residuos en el DOM de Bootstrap
    document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "auto";

    // Muestra pantalla de carga de procesamiento analítico
    Swal.fire({
        title: 'Generando Lote Documental Legal...',
        text: 'Compilando matrices de imágenes y firmas directas.',
        allowOutsideClick: false,
        background: '#0b0e14',
        color: '#fff',
        didOpen: () => { Swal.showLoading(); }
    });

    // 6. DISPARO DE CONFIGURACIÓN ANTI-SCROLL BUG (html2pdf CONFIG)
    const opt = {
        margin:       10,
        filename:     `LuxuryMotors_Transaccion_${Date.now()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Forzar scroll al origen absoluto (Obligatorio para evitar corte blanco en librerías Canvas)
    window.scrollTo(0, 0);

    setTimeout(() => {
        html2pdf().set(opt).from(htmlString).save().then(() => {
            // Cierre exitoso, vaciado de estados y feedback al usuario de la suite directiva
            cart = [];
            updateCartUI();
            document.getElementById("billingForm").reset();

            Swal.fire({
                icon: 'success',
                title: 'Transacción Ejecutada de Forma Exitosa',
                text: 'Se ha descargado el lote de facturas y acuerdos con firmas integradas. Enhorabuena.',
                confirmButtonColor: '#8a2be2',
                background: '#0d1117',
                color: '#fff'
            });
        }).catch(err => {
            console.error("PDF Render Failure:", err);
            Swal.fire({ icon: 'error', title: 'Fallo de Renderizado', text: 'Error interno al procesar el lienzo del archivo PDF.', background: '#0b0e14', color: '#fff' });
        });
    }, 800); // Pequeño delay de estabilización de asincronía del DOM
}