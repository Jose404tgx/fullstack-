const API = '';

export const getClientes = () => fetch(`${API}/clientes`).then(r => r.json());
export const getCliente = (id) => fetch(`${API}/clientes/${id}`).then(r => r.json());
export const createCliente = (d) => fetch(`${API}/clientes`, {
  method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(d)
}).then(r => r.json());
export const updateCliente = (id, d) => fetch(`${API}/clientes/${id}`, {
  method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(d)
}).then(r => r.json());
export const deleteCliente = (id) => fetch(`${API}/clientes/${id}`, { method: 'DELETE' }).then(r => r.json());

export const getCategorias = () => fetch(`${API}/categoria`).then(r => r.json());
export const getCategoria = (id) => fetch(`${API}/categoria/${id}`).then(r => r.json());
export const createCategoria = (d) => fetch(`${API}/categoria`, {
  method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(d)
}).then(r => r.json());
export const updateCategoria = (id, d) => fetch(`${API}/categoria/${id}`, {
  method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(d)
}).then(r => r.json());
export const deleteCategoria = (id) => fetch(`${API}/categoria/${id}`, { method: 'DELETE' }).then(r => r.json());

export const getProveedores = () => fetch(`${API}/proveedor`).then(r => r.json());
export const getProveedor = (id) => fetch(`${API}/proveedor/${id}`).then(r => r.json());
export const createProveedor = (d) => fetch(`${API}/proveedor`, {
  method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(d)
}).then(r => r.json());
export const updateProveedor = (id, d) => fetch(`${API}/proveedor/${id}`, {
  method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(d)
}).then(r => r.json());
export const deleteProveedor = (id) => fetch(`${API}/proveedor/${id}`, { method: 'DELETE' }).then(r => r.json());

export const getProductos = () => fetch(`${API}/producto`).then(r => r.json());
export const getProducto = (id) => fetch(`${API}/producto/${id}`).then(r => r.json());
export const createProducto = (d) => fetch(`${API}/producto`, {
  method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(d)
}).then(r => r.json());
export const updateProducto = (id, d) => fetch(`${API}/producto/${id}`, {
  method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(d)
}).then(r => r.json());
export const deleteProducto = (id) => fetch(`${API}/producto/${id}`, { method: 'DELETE' }).then(r => r.json());

export const getVentas = () => fetch(`${API}/ventas`).then(r => r.json());
export const getVenta = (id) => fetch(`${API}/ventas/${id}`).then(r => r.json());
export const createVenta = (d) => fetch(`${API}/ventas`, {
  method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(d)
}).then(r => r.json());
export const deleteVenta = (id) => fetch(`${API}/ventas/${id}`, { method: 'DELETE' }).then(r => r.json());

export const getDetalleVentas = () => fetch(`${API}/detalle_venta`).then(r => r.json());
export const createDetalleVenta = (d) => fetch(`${API}/detalle_venta`, {
  method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(d)
}).then(r => r.json());
export const deleteDetalleVenta = (id) => fetch(`${API}/detalle_venta/${id}`, { method: 'DELETE' }).then(r => r.json());
