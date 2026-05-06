import { useState, useEffect } from 'react';
import api from '../services/api';

export default function DetalleVentas() {
  const [data, setData] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({ id_venta: '', id_producto: '', cantidad: '' });
  const [msg, setMsg] = useState('');

  const load = () => {
    api.fetchDetalleVentas().then(setData);
    api.fetchVentas().then(setVentas);
    api.fetchProductosAdmin().then(setProductos);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createDetalleVenta({
        id_venta: parseInt(form.id_venta),
        id_producto: parseInt(form.id_producto),
        cantidad: parseInt(form.cantidad)
      });
      setMsg('Detalle creado');
      setForm({ id_venta: '', id_producto: '', cantidad: '' });
      load();
    } catch (err) { setMsg('Error: ' + err.message); }
  };

  const handleDelete = async (id) => {
    if (confirm('Eliminar detalle?')) {
      await api.deleteDetalleVenta(id);
      setMsg('Detalle eliminado');
      load();
    }
  };

  return (
    <div>
      <h2>Detalle de Ventas</h2>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: 'grid', gap: 8, maxWidth: 400 }}>
        <select value={form.id_venta} onChange={e => setForm({...form, id_venta: e.target.value})} required>
          <option value="">Seleccionar Venta</option>
          {ventas.map(v => <option key={v.id_venta} value={v.id_venta}>Venta #{v.id_venta}</option>)}
        </select>
        <select value={form.id_producto} onChange={e => setForm({...form, id_producto: e.target.value})} required>
          <option value="">Seleccionar Producto</option>
          {productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.descripcion} - S/.{p.precio}</option>)}
        </select>
        <input placeholder="Cantidad" type="number" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} required />
        <button type="submit">Crear Detalle</button>
      </form>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th>ID</th><th>Venta</th><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Acciones</th></tr></thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id_detventa}>
              <td>{item.id_detventa}</td>
              <td>{item.id_venta}</td>
               <td>{item.producto?.descripcion || item.id_producto}</td>
               <td>{item.producto?.precio || '-'}</td>
              <td>{item.cantidad}</td>
              <td>
                <button onClick={() => handleDelete(item.id_detventa)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
