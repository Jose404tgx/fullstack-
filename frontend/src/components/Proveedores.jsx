import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Proveedores() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ razonsocial: '', direccion: '', telefono: '' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () => api.fetchProveedores().then(setData);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.updateProveedor(editId, form);
        setMsg('Proveedor actualizado');
      } else {
        await api.createProveedor(form);
        setMsg('Proveedor creado');
      }
      setForm({ razonsocial: '', direccion: '', telefono: '' });
      setEditId(null);
      load();
    } catch (err) { setMsg('Error: ' + err.message); }
  };

  const handleEdit = (item) => {
    setForm({ razonsocial: item.razonsocial, direccion: item.direccion, telefono: item.telefono });
    setEditId(item.id_proveedor);
  };

  const handleDelete = async (id) => {
    if (confirm('Eliminar proveedor?')) {
      await api.deleteProveedor(id);
      setMsg('Proveedor eliminado');
      load();
    }
  };

  return (
    <div>
      <h2>Proveedores</h2>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: 'grid', gap: 8, maxWidth: 400 }}>
        <input placeholder="Razón Social" value={form.razonsocial} onChange={e => setForm({...form, razonsocial: e.target.value})} required />
        <input placeholder="Dirección" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} required />
        <input placeholder="Teléfono" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} required />
        <button type="submit">{editId ? 'Actualizar' : 'Crear'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ razonsocial: '', direccion: '', telefono: '' }); }}>Cancelar</button>}
      </form>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th>ID</th><th>Razón Social</th><th>Dirección</th><th>Teléfono</th><th>Acciones</th></tr></thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id_proveedor}>
              <td>{item.id_proveedor}</td><td>{item.razonsocial}</td><td>{item.direccion}</td><td>{item.telefono}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Editar</button>
                <button onClick={() => handleDelete(item.id_proveedor)} style={{ marginLeft: 5 }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
