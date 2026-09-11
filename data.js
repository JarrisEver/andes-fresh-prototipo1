// initial mock data
const mockData = {
    usuarios: [
        { email: 'admin@andesfresh.com', pwd: '123', rol: 'Administrador', nombre: 'Admin User' },
        { email: 'vendedor@andesfresh.com', pwd: '123', rol: 'Vendedor', nombre: 'Juan Pérez' },
        { email: 'gerencia@andesfresh.com', pwd: '123', rol: 'Gerente', nombre: 'María Gómez' }
    ],
    clientes: [
        { id: 1, ruc: '20123456789', nombre: 'Bodega El Sol', zona: 'Norte' },
        { id: 2, ruc: '20987654321', nombre: 'Restaurante Sabor Peruano', zona: 'Centro' },
        { id: 3, ruc: '20456123789', nombre: 'Mercado Central', zona: 'Sur' }
    ],
    productos: [
        { id: 1, nombre: 'Plátano', categoria: 'Frutas', precio: 2.5, unidad: 'kg', stock: 150, minStock: 50 },
        { id: 2, nombre: 'Papa', categoria: 'Hortalizas', precio: 1.8, unidad: 'kg', stock: 500, minStock: 100 },
        { id: 3, nombre: 'Tomate', categoria: 'Hortalizas', precio: 3.2, unidad: 'kg', stock: 40, minStock: 60 },
        { id: 4, nombre: 'Zanahoria', categoria: 'Hortalizas', precio: 2.0, unidad: 'kg', stock: 120, minStock: 50 },
        { id: 5, nombre: 'Lechuga', categoria: 'Hortalizas', precio: 1.5, unidad: 'unidad', stock: 20, minStock: 30 },
        { id: 6, nombre: 'Manzana', categoria: 'Frutas', precio: 4.5, unidad: 'kg', stock: 200, minStock: 80 },
        { id: 7, nombre: 'Mandarina', categoria: 'Frutas', precio: 3.0, unidad: 'kg', stock: 15, minStock: 40 }
    ],
    pedidos: [
        { id: 'PED-001', cliente: 'Bodega El Sol', vendedor: 'Juan Pérez', fecha: '2023-10-25', total: 150.50, estado: 'Entregado' },
        { id: 'PED-002', cliente: 'Restaurante Sabor Peruano', vendedor: 'Juan Pérez', fecha: '2023-10-26', total: 320.00, estado: 'En preparación' },
        { id: 'PED-003', cliente: 'Mercado Central', vendedor: 'Ana López', fecha: '2023-10-26', total: 85.00, estado: 'Pendiente' }
    ]
};

function initData() {
    if (!localStorage.getItem('andes_data_init')) {
        localStorage.setItem('andes_usuarios', JSON.stringify(mockData.usuarios));
        localStorage.setItem('andes_clientes', JSON.stringify(mockData.clientes));
        localStorage.setItem('andes_productos', JSON.stringify(mockData.productos));
        localStorage.setItem('andes_pedidos', JSON.stringify(mockData.pedidos));
        localStorage.setItem('andes_data_init', 'true');
    }
}

initData();
