const BASE_URL = '';

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('adminToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const api = {
  fetchClientes: () => fetch('/clientes', { headers: getHeaders() }).then(r => r.json()),
  createCliente: (data) => fetch('/clientes', { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  updateCliente: (id, data) => fetch(`/clientes/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  deleteCliente: (id) => fetch(`/clientes/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),

  fetchCategorias: () => fetch('/categoria', { headers: getHeaders() }).then(r => r.json()),
  createCategoria: (data) => fetch('/categoria', { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  updateCategoria: (id, data) => fetch(`/categoria/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  deleteCategoria: (id) => fetch(`/categoria/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),

  fetchProveedores: () => fetch('/proveedor', { headers: getHeaders() }).then(r => r.json()),
  createProveedor: (data) => fetch('/proveedor', { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  updateProveedor: (id, data) => fetch(`/proveedor/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  deleteProveedor: (id) => fetch(`/proveedor/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),

  fetchProductos: () => fetch('/producto', { headers: getHeaders() }).then(r => r.json()),
  fetchProductosAdmin: () => fetch('/producto/admin', { headers: getHeaders() }).then(r => r.json()),
  createProducto: (data) => fetch('/producto', { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  updateProducto: (id, data) => fetch(`/producto/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  deleteProducto: (id) => fetch(`/producto/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),

  fetchVentas: () => fetch('/ventas', { headers: getHeaders() }).then(r => r.json()),
  createVenta: (data) => fetch('/ventas', { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  deleteVenta: (id) => fetch(`/ventas/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),

  fetchDetalleVentas: () => fetch('/detalle_venta', { headers: getHeaders() }).then(r => r.json()),
  createDetalleVenta: (data) => fetch('/detalle_venta', { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  deleteDetalleVenta: (id) => fetch(`/detalle_venta/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),

  createStorePurchase: (data) => fetch('/store/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
};

export default api;
