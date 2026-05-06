import { useState, useEffect } from 'react';
import api from '../services/api';

export default function DetalleVentas() {
  const [data, setData] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({ id_venta: '', id_producto: '', cantidad: '' });
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

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
      setShowForm(false);
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
      <div className="section-header">
        <h2>Detalle de Ventas</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Nuevo Detalle
        </button>
      </div>
      {msg && <div className="status-message status-success">{msg}</div>}
      {showForm && (
        <div className="card">
          <h3>Nuevo Detalle de Venta</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <select className="form-input" value={form.id_venta} onChange={e => setForm({...form, id_venta: e.target.value})} required>
              <option value="">Seleccionar Venta</option>
              {ventas.map(v => <option key={v.id_venta} value={v.id_venta}>Venta #{v.id_venta}</option>)}
            </select>
            <select className="form-input" value={form.id_producto} onChange={e => setForm({...form, id_producto: e.target.value})} required>
              <option value="">Seleccionar Producto</option>
              {productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.descripcion} - S/.{p.precio}</option>)}
            </select>
            <input className="form-input" placeholder="Cantidad" type="number" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} required />
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-success">Crear Detalle</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setForm({ id_venta: '', id_producto: '', cantidad: '' }); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      <div className="table-container">
        <table>
          <thead><tr><th>ID</th><th>Venta</th><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Acciones</th></tr></thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id_detventa}>
                <td>{item.id_detventa}</td>
                <td>#{item.id_venta}</td>
                <td>{item.producto?.descripcion || item.id_producto}</td>
                <td>${item.producto?.precio || '-'}</td>
                <td>{item.cantidad}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id_detventa)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
