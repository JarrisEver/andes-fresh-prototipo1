document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    // Auth Check
    const currentUser = JSON.parse(localStorage.getItem('andes_currentUser'));
    if (!currentUser && !path.includes('login.html') && !path.endsWith('/') && !path.endsWith('index.html')) {
        window.location.href = 'login.html';
        return;
    }

    if (currentUser) {
        // Setup Layout info
        const nameEl = document.getElementById('user-name-display');
        const roleEl = document.getElementById('user-role-display');
        if (nameEl) nameEl.textContent = currentUser.nombre;
        if (roleEl) roleEl.textContent = currentUser.rol;

        // Hamburger Menu
        const hamburger = document.getElementById('hamburger-menu');
        const sidebar = document.getElementById('sidebar');
        if (hamburger && sidebar) {
            hamburger.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Active Link
        const links = document.querySelectorAll('.sidebar-menu a');
        links.forEach(link => {
            if (link.href === window.location.href) {
                link.classList.add('active');
            }
        });
    }

    // Routing by page content
    if (path.includes('login.html')) initLogin();
    else if (path.includes('dashboard.html')) initDashboard();
    else if (path.includes('nuevo-pedido.html')) initNuevoPedido();
    else if (path.includes('pedidos.html')) initPedidos();
    else if (path.includes('stock.html')) initStock();
    else if (path.includes('ventas.html')) initVentas();
    else if (path.endsWith('/') || path.endsWith('index.html')) {
        if (currentUser) window.location.href = 'pages/dashboard.html';
        else window.location.href = 'pages/login.html';
    }
});

function logout() {
    localStorage.removeItem('andes_currentUser');
    window.location.href = 'login.html';
}

function initLogin() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const pwd = document.getElementById('password').value;
        const errorMsg = document.getElementById('login-error');
        
        const users = JSON.parse(localStorage.getItem('andes_usuarios')) || [];
        const user = users.find(u => u.email === email && (pwd === '123' || pwd !== '')); // Simplified auth

        if (user) {
            localStorage.setItem('andes_currentUser', JSON.stringify(user));
            window.location.href = 'dashboard.html';
        } else {
            errorMsg.style.display = 'block';
            errorMsg.textContent = 'Credenciales incorrectas.';
        }
    });
}

function getBadgeClass(status) {
    status = status.toLowerCase();
    if (status.includes('pendiente')) return 'badge-pending';
    if (status.includes('confirmado')) return 'badge-confirmed';
    if (status.includes('preparación')) return 'badge-prep';
    if (status.includes('entregado')) return 'badge-delivered';
    if (status.includes('cancelado')) return 'badge-cancelled';
    return 'badge-pending';
}

function initDashboard() {
    const pedidos = JSON.parse(localStorage.getItem('andes_pedidos')) || [];
    const productos = JSON.parse(localStorage.getItem('andes_productos')) || [];
    
    // Stats
    const today = new Date().toISOString().split('T')[0];
    const pedidosHoy = pedidos.filter(p => p.fecha === today).length;
    const pendientes = pedidos.filter(p => p.estado === 'Pendiente').length;
    const ventasHoy = pedidos.filter(p => p.fecha === today && p.estado !== 'Cancelado').reduce((acc, p) => acc + p.total, 0);
    const stockCritico = productos.filter(p => p.stock <= p.minStock).length;

    document.getElementById('stat-pedidos-hoy').textContent = pedidosHoy || 0;
    document.getElementById('stat-pendientes').textContent = pendientes;
    document.getElementById('stat-ventas').textContent = 'S/ ' + ventasHoy.toFixed(2);
    document.getElementById('stat-stock').textContent = stockCritico;

    // Recientes
    const tbody = document.getElementById('dashboard-pedidos-body');
    if (tbody) {
        tbody.innerHTML = '';
        pedidos.slice(-5).reverse().forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.cliente}</td>
                    <td>${p.vendedor}</td>
                    <td>${p.fecha}</td>
                    <td>S/ ${p.total.toFixed(2)}</td>
                    <td><span class="badge ${getBadgeClass(p.estado)}">${p.estado}</span></td>
                </tr>
            `;
        });
    }

    // Chart mock
    const chart = document.getElementById('chart-ventas');
    if (chart) {
        chart.innerHTML = `
            <div class="bar" style="height: 60%">60%<span>Norte</span></div>
            <div class="bar" style="height: 85%">85%<span>Sur</span></div>
            <div class="bar" style="height: 40%">40%<span>Centro</span></div>
            <div class="bar" style="height: 70%">70%<span>Este</span></div>
        `;
    }
}

function initNuevoPedido() {
    const form = document.getElementById('form-nuevo-pedido');
    const tbody = document.getElementById('tabla-detalle-body');
    const selectProducto = document.getElementById('select-producto');
    const selectCliente = document.getElementById('select-cliente');
    const btnAgregar = document.getElementById('btn-agregar-producto');
    
    let detalle = [];
    
    const productos = JSON.parse(localStorage.getItem('andes_productos')) || [];
    const clientes = JSON.parse(localStorage.getItem('andes_clientes')) || [];
    const currentUser = JSON.parse(localStorage.getItem('andes_currentUser'));

    // Populate selects
    clientes.forEach(c => {
        selectCliente.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
    });
    
    productos.forEach(p => {
        selectProducto.innerHTML += `<option value="${p.id}">${p.nombre} - S/${p.precio}</option>`;
    });

    selectCliente.addEventListener('change', (e) => {
        const c = clientes.find(x => x.nombre === e.target.value);
        if(c) {
            document.getElementById('ruc').value = c.ruc;
            document.getElementById('zona').value = c.zona;
        } else {
            document.getElementById('ruc').value = '';
            document.getElementById('zona').value = '';
        }
    });

    const renderDetalle = () => {
        tbody.innerHTML = '';
        let total = 0;
        detalle.forEach((item, index) => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;
            tbody.innerHTML += `
                <tr>
                    <td>${item.nombre}</td>
                    <td>${item.categoria}</td>
                    <td><input type="number" min="1" class="form-control" style="width:80px" value="${item.cantidad}" onchange="actualizarCant(${index}, this.value)"></td>
                    <td>${item.unidad}</td>
                    <td>S/ ${item.precio.toFixed(2)}</td>
                    <td>S/ ${subtotal.toFixed(2)}</td>
                    <td><button type="button" class="btn btn-danger btn-sm" onclick="eliminarItem(${index})">X</button></td>
                </tr>
            `;
        });
        document.getElementById('total-pedido').textContent = `S/ ${total.toFixed(2)}`;
    };

    window.actualizarCant = (index, val) => {
        detalle[index].cantidad = parseFloat(val);
        renderDetalle();
    };

    window.eliminarItem = (index) => {
        detalle.splice(index, 1);
        renderDetalle();
    };

    btnAgregar.addEventListener('click', () => {
        const prodId = selectProducto.value;
        const cant = parseFloat(document.getElementById('input-cantidad').value);
        
        if (!prodId) { alert("Seleccione un producto."); return; }
        if (isNaN(cant) || cant <= 0) { alert("La cantidad debe ser mayor que cero."); return; }
        
        const p = productos.find(x => x.id == prodId);
        
        if (p.stock < cant) { alert("El producto no cuenta con stock suficiente."); return; }

        const existe = detalle.find(x => x.id == prodId);
        if (existe) {
            existe.cantidad += cant;
        } else {
            detalle.push({ ...p, cantidad: cant });
        }
        renderDetalle();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const cliente = selectCliente.value;
        const fecha = document.getElementById('fecha-entrega').value;

        if (!cliente) { alert("Seleccione un cliente."); return; }
        if (!fecha) { alert("Ingrese una fecha de entrega válida."); return; }
        if (detalle.length === 0) { alert("Seleccione al menos un producto."); return; }

        const total = detalle.reduce((acc, i) => acc + (i.precio * i.cantidad), 0);
        const pedidos = JSON.parse(localStorage.getItem('andes_pedidos')) || [];
        
        const nuevo = {
            id: 'PED-' + String(pedidos.length + 1).padStart(3, '0'),
            cliente,
            vendedor: currentUser.nombre,
            fecha,
            total,
            estado: 'Pendiente'
        };

        pedidos.push(nuevo);
        localStorage.setItem('andes_pedidos', JSON.stringify(pedidos));
        
        alert("Pedido guardado con éxito: " + nuevo.id);
        window.location.href = 'dashboard.html';
    });
}

function initPedidos() {
    const pedidos = JSON.parse(localStorage.getItem('andes_pedidos')) || [];
    const tbody = document.getElementById('tabla-pedidos-body');
    const inputBuscar = document.getElementById('buscar-pedido');
    const filterEstado = document.getElementById('filtro-estado');

    const render = (filtroTxt = '', filtroEst = '') => {
        tbody.innerHTML = '';
        let count = 0;
        pedidos.forEach((p, index) => {
            if (filtroTxt && !p.cliente.toLowerCase().includes(filtroTxt.toLowerCase()) && !p.id.toLowerCase().includes(filtroTxt.toLowerCase())) return;
            if (filtroEst && p.estado !== filtroEst) return;
            count++;

            const btnCancel = p.estado !== 'Entregado' && p.estado !== 'Cancelado' 
                ? `<button class="btn btn-outline btn-sm" onclick="cancelarPedido(${index})">Cancelar</button>`
                : '';

            tbody.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.cliente}</td>
                    <td>${p.fecha}</td>
                    <td>S/ ${p.total.toFixed(2)}</td>
                    <td><span class="badge ${getBadgeClass(p.estado)}">${p.estado}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm">Ver</button>
                        ${btnCancel}
                    </td>
                </tr>
            `;
        });
        if(count === 0) tbody.innerHTML = `<tr><td colspan="6" class="text-center">No se encontraron pedidos.</td></tr>`;
    };

    window.cancelarPedido = (index) => {
        if(confirm('¿Seguro que desea cancelar este pedido?')) {
            pedidos[index].estado = 'Cancelado';
            localStorage.setItem('andes_pedidos', JSON.stringify(pedidos));
            render(inputBuscar.value, filterEstado.value);
        }
    };

    inputBuscar.addEventListener('input', (e) => render(e.target.value, filterEstado.value));
    filterEstado.addEventListener('change', (e) => render(inputBuscar.value, e.target.value));

    render();
}

function initStock() {
    const productos = JSON.parse(localStorage.getItem('andes_productos')) || [];
    const tbody = document.getElementById('tabla-stock-body');
    const search = document.getElementById('buscar-stock');
    
    const getStockBadge = (stock, min) => {
        if (stock === 0) return '<span class="badge badge-out">Agotado</span>';
        if (stock <= min) return '<span class="badge badge-low">Stock bajo</span>';
        return '<span class="badge badge-ok">Disponible</span>';
    };

    const render = (filtro = '') => {
        tbody.innerHTML = '';
        productos.forEach(p => {
            if (filtro && !p.nombre.toLowerCase().includes(filtro.toLowerCase())) return;
            tbody.innerHTML += `
                <tr>
                    <td>${p.nombre}</td>
                    <td>${p.categoria}</td>
                    <td>Almacén Principal</td>
                    <td>${p.stock} ${p.unidad}</td>
                    <td>${p.minStock} ${p.unidad}</td>
                    <td>${getStockBadge(p.stock, p.minStock)}</td>
                </tr>
            `;
        });
    };

    search.addEventListener('input', (e) => render(e.target.value));
    render();
}

function initVentas() {
    const pedidos = JSON.parse(localStorage.getItem('andes_pedidos')) || [];
    const tbody = document.getElementById('tabla-ventas-body');
    
    // Aggregate by vendor
    const ventasObj = {};
    pedidos.forEach(p => {
        if (p.estado === 'Cancelado') return;
        if (!ventasObj[p.vendedor]) {
            ventasObj[p.vendedor] = { ped: 0, tot: 0, zona: 'Varios' };
        }
        ventasObj[p.vendedor].ped += 1;
        ventasObj[p.vendedor].tot += p.total;
    });

    let best = { v: '-', t: 0 };
    Object.keys(ventasObj).forEach(v => {
        const item = ventasObj[v];
        if(item.tot > best.t) best = { v, t: item.tot };
        tbody.innerHTML += `
            <tr>
                <td>${v}</td>
                <td>${item.zona}</td>
                <td>${item.ped}</td>
                <td>S/ ${item.tot.toFixed(2)}</td>
            </tr>
        `;
    });

    document.getElementById('stat-mejor-vendedor').textContent = best.v;

    // chart mock
    const chart = document.getElementById('chart-vendedores');
    if (chart) {
        chart.innerHTML = '';
        Object.keys(ventasObj).forEach(v => {
            const h = (ventasObj[v].tot / (best.t || 1)) * 100;
            chart.innerHTML += `<div class="bar" style="height: ${h}%">${h.toFixed(0)}%<span>${v.split(' ')[0]}</span></div>`;
        });
    }
}
