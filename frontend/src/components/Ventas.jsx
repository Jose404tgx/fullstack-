import { useState, useEffect } from 'react';
import { getVentas, createVenta, deleteVenta, getClientes, getProductos } from '../services/api';

export default function Ventas() {
  const [data, setData] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({ id_cliente: '', detalles: [] });
  const [msg, setMsg] = useState('');

  const load = () => {
    getVentas().then(setData);
    getClientes().then(setClientes);
    getProductos().then(setProductos);
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
      await createVenta({
        id_cliente: parseInt(form.id_cliente),
        detalles: form.detalles.map(d => ({ id_producto: parseInt(d.id_producto), cantidad: parseInt(d.cantidad) }))
      });
      setMsg('Venta creada');
      setForm({ id_cliente: '', detalles: [] });
      load();
    } catch (err) { setMsg('Error: ' + err.message); }
  };

  const handleDelete = async (id) => {
    if (confirm('Eliminar venta?')) {
      await deleteVenta(id);
      setMsg('Venta eliminada');
      load();
    }
  };

  return (
    <div>
      <h2>Ventas</h2>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: 'grid', gap: 8, maxWidth: 500 }}>
        <select value={form.id_cliente} onChange={e => setForm({...form, id_cliente: e.target.value})} required>
          <option value="">Seleccionar Cliente</option>
          {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombres} {c.apellidos}</option>)}
        </select>
        <h4>Detalles</h4>
        {form.detalles.map((d, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={d.id_producto} onChange={e => updateDetalle(i, 'id_producto', e.target.value)} style={{ flex: 1 }}>
              <option value="">Producto</option>
              {productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.descripcion} - S/.{p.precio}</option>)}
            </select>
            <input placeholder="Cant" type="number" value={d.cantidad} onChange={e => updateDetalle(i, 'cantidad', e.target.value)} style={{ width: 80 }} />
            <button type="button" onClick={() => removeDetalle(i)}>X</button>
          </div>
        ))}
        <button type="button" onClick={addDetalle}>Agregar Producto</button>
        <button type="submit">Crear Venta</button>
      </form>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>Acciones</th></tr></thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id_venta}>
              <td>{item.id_venta}</td>
              <td>{new Date(item.fecha).toLocaleString()}</td>
               <td>{item.nombres ? `${item.nombres} ${item.apellidos}` : item.id_cliente}</td>
              <td>
                <button onClick={() => handleDelete(item.id_venta)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
