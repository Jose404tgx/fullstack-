import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Ventas() {
  const [data, setData] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({ id_cliente: '', detalles: [] });
  const [msg, setMsg] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = () => {
    api.fetchVentas().then(setData);
    api.fetchClientes().then(setClientes);
    api.fetchProductosAdmin().then(setProductos);
  };
  useEffect(() => { load(); }, []);

  const addDetalle = () => {
    setForm({ ...form, detalles: [...form.detalles, { id_producto: '', cantidad: '' }] });
  };

  const updateDetalle = (index, field, value) => {
    const detalles = [...form.detalles];
    detalles[index][field] = value;
    setForm({ ...form, detalles });
  };

  const removeDetalle = (index) => {
    setForm({ ...form, detalles: form.detalles.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const detalles = form.detalles.map(d => ({
        id_producto: parseInt(d.id_producto),
        cantidad: parseInt(d.cantidad)
      }));
      await api.createVenta({
        id_cliente: parseInt(form.id_cliente),
        detalles
      });
      setMsg('Venta creada');
      setForm({ id_cliente: '', detalles: [] });
      setShowCreate(false);
      load();
    } catch (err) { setMsg('Error: ' + err.message); }
  };

  const handleDelete = async (id) => {
    if (confirm('Eliminar venta?')) {
      await api.deleteVenta(id);
      setMsg('Venta eliminada');
      load();
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>Ventas</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          Nueva Venta
        </button>
      </div>
      {msg && <div className="status-message status-success">{msg}</div>}

      {showCreate && (
        <div className="card">
          <h3>Nueva Venta</h3>
          <form onSubmit={handleSubmit} className="form-grid" style={{ maxWidth: '100%' }}>
            <select className="form-input" value={form.id_cliente} onChange={e => setForm({...form, id_cliente: e.target.value})} required style={{ maxWidth: 400 }}>
              <option value="">Seleccionar Cliente</option>
              {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombres} {c.apellidos}</option>)}
            </select>
            <div>
              <h3>Detalles</h3>
              {form.detalles.map((d, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12, maxWidth: 600 }}>
                  <select className="form-input" value={d.id_producto} onChange={e => updateDetalle(i, 'id_producto', e.target.value)}>
                    <option value="">Producto</option>
                    {productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.descripcion} - S/.{p.precio}</option>)}
                  </select>
                  <input className="form-input" placeholder="Cant" type="number" value={d.cantidad} onChange={e => updateDetalle(i, 'cantidad', e.target.value)} style={{ width: 80 }} />
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeDetalle(i)}>Eliminar</button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={addDetalle} style={{ marginTop: 12 }}>
                Agregar Producto
              </button>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-success">Crear Venta</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowCreate(false); setForm({ id_cliente: '', detalles: [] }); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id_venta}>
                <td>{item.id_venta}</td>
                <td>{new Date(item.fecha).toLocaleString()}</td>
                <td>{item.clientes ? `${item.clientes.nombres} ${item.clientes.apellidos}` : item.id_cliente}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id_venta)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
