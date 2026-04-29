import { useState, useEffect } from 'react';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../services/api';

export default function Categorias() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ descripcion: '' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () => getCategorias().then(setData);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateCategoria(editId, form);
        setMsg('Categoría actualizada');
      } else {
        await createCategoria(form);
        setMsg('Categoría creada');
      }
      setForm({ descripcion: '' });
      setEditId(null);
      load();
    } catch (err) { setMsg('Error: ' + err.message); }
  };

  const handleEdit = (item) => {
    setForm({ descripcion: item.descripcion });
    setEditId(item.id_categoria);
  };

  const handleDelete = async (id) => {
    if (confirm('Eliminar categoría?')) {
      await deleteCategoria(id);
      setMsg('Categoría eliminada');
      load();
    }
  };

  return (
    <div>
      <h2>Categorías</h2>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: 'grid', gap: 8, maxWidth: 400 }}>
        <input placeholder="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} required />
        <button type="submit">{editId ? 'Actualizar' : 'Crear'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ descripcion: '' }); }}>Cancelar</button>}
      </form>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th>ID</th><th>Descripción</th><th>Acciones</th></tr></thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id_categoria}>
              <td>{item.id_categoria}</td><td>{item.descripcion}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Editar</button>
                <button onClick={() => handleDelete(item.id_categoria)} style={{ marginLeft: 5 }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
