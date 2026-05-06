import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Proveedores() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ razonsocial: '', direccion: '', telefono: '' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

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
      setShowForm(false);
      load();
    } catch (err) { setMsg('Error: ' + err.message); }
  };

  const handleEdit = (item) => {
    setForm({ razonsocial: item.razonsocial, direccion: item.direccion, telefono: item.telefono });
    setEditId(item.id_proveedor);
    setShowForm(true);
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
      <div className="section-header">
        <h2>Proveedores</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm({ razonsocial: '', direccion: '', telefono: '' }); }}>
          Nuevo Proveedor
        </button>
      </div>
      {msg && <div className="status-message status-success">{msg}</div>}
      {showForm && (
        <div className="card">
          <h3>{editId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <input className="form-input" placeholder="Razón Social" value={form.razonsocial} onChange={e => setForm({...form, razonsocial: e.target.value})} required />
            <input className="form-input" placeholder="Dirección" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} required />
            <input className="form-input" placeholder="Teléfono" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} required />
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-success">{editId ? 'Actualizar' : 'Crear'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditId(null); setForm({ razonsocial: '', direccion: '', telefono: '' }); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      <div className="table-container">
        <table>
          <thead><tr><th>ID</th><th>Razón Social</th><th>Dirección</th><th>Teléfono</th><th>Acciones</th></tr></thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id_proveedor}>
                <td>{item.id_proveedor}</td><td>{item.razonsocial}</td><td>{item.direccion}</td><td>{item.telefono}</td>
                <td>
                  <div className="action-btns">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(item)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id_proveedor)}>Eliminar</button>
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
