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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Ventas</h2>
        <button onClick={() => setShowCreate(true)} style={{ padding: '8px 16px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          + Nueva Venta
        </button>
      </div>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}

      {showCreate && (
        <div style={{ background: 'white', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: 20 }}>
          <h3>Nueva Venta</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 15, maxWidth: 600 }}>
            <select value={form.id_cliente} onChange={e => setForm({...form, id_cliente: e.target.value})} required>
              <option value="">Seleccionar Cliente</option>
              {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombres} {c.apellidos}</option>)}
            </select>
            <h4>Detalles</h4>
            {form.detalles.map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <select value={d.id_producto} onChange={e => updateDetalle(i, 'id_producto', e.target.value)} style={{ flex: 1 }}>
                  <option value="">Producto</option>
                  {productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.descripcion} - S/.{p.precio}</option>)}
                </select>
                <input placeholder="Cant" type="number" value={d.cantidad} onChange={e => updateDetalle(i, 'cantidad', e.target.value)} style={{ width: 80 }} />
                <button type="button" onClick={() => removeDetalle(i)} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', padding: '6px 12px' }}>X</button>
              </div>
            ))}
            <button type="button" onClick={addDetalle} style={{ background: '#3498db', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', padding: '8px 16px' }}>
              + Agregar Producto
            </button>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={{ background: '#2ecc71', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', padding: '10px 20px' }}>Crear Venta</button>
              <button type="button" onClick={() => { setShowCreate(false); setForm({ id_cliente: '', detalles: [] }); }} style={{ background: '#95a5a6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', padding: '10px 20px' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#667eea', color: 'white' }}>
            <th>ID</th><th>Fecha</th><th>Cliente</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id_venta} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td>{item.id_venta}</td>
              <td>{new Date(item.fecha).toLocaleString()}</td>
              <td>{item.clientes ? `${item.clientes.nombres} ${item.clientes.apellidos}` : item.id_cliente}</td>
              <td>
                <button onClick={() => handleDelete(item.id_venta)} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', padding: '6px 12px' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
