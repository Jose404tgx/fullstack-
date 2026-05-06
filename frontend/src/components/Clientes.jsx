import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nombres: '', apellidos: '', direccion: '', telefono: '' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () => api.fetchClientes().then(setClientes);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.updateCliente(editId, form);
        setMsg('Cliente actualizado');
      } else {
        await api.createCliente(form);
        setMsg('Cliente creado');
      }
      setForm({ nombres: '', apellidos: '', direccion: '', telefono: '' });
      setEditId(null);
      load();
    } catch (err) { setMsg('Error: ' + err.message); }
  };

  const handleEdit = (c) => {
    setForm({ nombres: c.nombres, apellidos: c.apellidos, direccion: c.direccion, telefono: c.telefono });
    setEditId(c.id_cliente);
  };

  const handleDelete = async (id) => {
    if (confirm('Eliminar cliente?')) {
      await api.deleteCliente(id);
      setMsg('Cliente eliminado');
      load();
    }
  };

  return (
    <div>
      <h2>Clientes</h2>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: 'grid', gap: 8, maxWidth: 400 }}>
        <input placeholder="Nombres" value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})} required />
        <input placeholder="Apellidos" value={form.apellidos} onChange={e => setForm({...form, apellidos: e.target.value})} required />
        <input placeholder="Dirección" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} required />
        <input placeholder="Teléfono" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} required />
        <button type="submit">{editId ? 'Actualizar' : 'Crear'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ nombres: '', apellidos: '', direccion: '', telefono: '' }); }}>Cancelar</button>}
      </form>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th>ID</th><th>Nombres</th><th>Apellidos</th><th>Dirección</th><th>Teléfono</th><th>Acciones</th></tr></thead>
        <tbody>
          {clientes.map(c => (
            <tr key={c.id_cliente}>
              <td>{c.id_cliente}</td><td>{c.nombres}</td><td>{c.apellidos}</td><td>{c.direccion}</td><td>{c.telefono}</td>
              <td>
                <button onClick={() => handleEdit(c)}>Editar</button>
                <button onClick={() => handleDelete(c.id_cliente)} style={{ marginLeft: 5 }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
