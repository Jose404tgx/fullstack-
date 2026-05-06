import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Categorias() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ descripcion: '' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => api.fetchCategorias().then(setData);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.updateCategoria(editId, form);
        setMsg('Categoría actualizada');
      } else {
        await api.createCategoria(form);
        setMsg('Categoría creada');
      }
      setForm({ descripcion: '' });
      setEditId(null);
      setShowForm(false);
      load();
    } catch (err) { setMsg('Error: ' + err.message); }
  };

  const handleEdit = (item) => {
    setForm({ descripcion: item.descripcion });
    setEditId(item.id_categoria);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Eliminar categoría?')) {
      await api.deleteCategoria(id);
      setMsg('Categoría eliminada');
      load();
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>Categorías</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm({ descripcion: '' }); }}>
          Nueva Categoría
        </button>
      </div>
      {msg && <div className="status-message status-success">{msg}</div>}
      {showForm && (
        <div className="card">
          <h3>{editId ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <input className="form-input" placeholder="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} required />
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-success">{editId ? 'Actualizar' : 'Crear'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditId(null); setForm({ descripcion: '' }); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      <div className="table-container">
        <table>
          <thead><tr><th>ID</th><th>Descripción</th><th>Acciones</th></tr></thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id_categoria}>
                <td>{item.id_categoria}</td><td>{item.descripcion}</td>
                <td>
                  <div className="action-btns">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(item)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id_categoria)}>Eliminar</button>
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
