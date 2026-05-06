import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nombres: '', apellidos: '', direccion: '', telefono: '' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

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
      setShowForm(false);
      load();
    } catch (err) { setMsg('Error: ' + err.message); }
  };

  const handleEdit = (c) => {
    setForm({ nombres: c.nombres, apellidos: c.apellidos, direccion: c.direccion, telefono: c.telefono });
    setEditId(c.id_cliente);
    setShowForm(true);
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
      <div className="section-header">
        <h2>Clientes</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm({ nombres: '', apellidos: '', direccion: '', telefono: '' }); }}>
          Nuevo Cliente
        </button>
      </div>
      {msg && <div className="status-message status-success">{msg}</div>}
      {showForm && (
        <div className="card">
          <h3>{editId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <input className="form-input" placeholder="Nombres" value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})} required />
            <input className="form-input" placeholder="Apellidos" value={form.apellidos} onChange={e => setForm({...form, apellidos: e.target.value})} required />
            <input className="form-input" placeholder="Dirección" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} required />
            <input className="form-input" placeholder="Teléfono" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} required />
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-success">{editId ? 'Actualizar' : 'Crear'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditId(null); setForm({ nombres: '', apellidos: '', direccion: '', telefono: '' }); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      <div className="table-container">
        <table>
          <thead><tr><th>ID</th><th>Nombres</th><th>Apellidos</th><th>Dirección</th><th>Teléfono</th><th>Acciones</th></tr></thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id_cliente}>
                <td>{c.id_cliente}</td><td>{c.nombres}</td><td>{c.apellidos}</td><td>{c.direccion}</td><td>{c.telefono}</td>
                <td>
                  <div className="action-btns">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(c)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id_cliente)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
