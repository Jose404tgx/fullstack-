import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Productos() {
  const [data, setData] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState({ descripcion: '', precio: '', stock: '', id_categoria: '', id_proveedor: '', imagenes: '' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    api.fetchProductosAdmin().then(setData);
    api.fetchCategorias().then(setCategorias);
    api.fetchProveedores().then(setProveedores);
  };
  useEffect(() => { load(); }, []);

  const uploadImage = async () => {
    if (!file) return form.imagenes;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('imagen', file);
      const res = await fetch('/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        body: formData
      });
      const data = await res.json();
      setUploading(false);
      if (data.url) return data.url;
      throw new Error(data.error || 'Error al subir imagen');
    } catch (err) {
      setUploading(false);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imagenUrl = form.imagenes;
      if (file) {
        imagenUrl = await uploadImage();
      }
      const payload = {
        descripcion: form.descripcion,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock),
        id_categoria: parseInt(form.id_categoria),
        id_proveedor: parseInt(form.id_proveedor),
        imagenes: imagenUrl || null
      };
      if (editId) {
        await api.updateProducto(editId, payload);
        setMsg('Producto actualizado');
      } else {
        await api.createProducto(payload);
        setMsg('Producto creado');
      }
      setForm({ descripcion: '', precio: '', stock: '', id_categoria: '', id_proveedor: '', imagenes: '' });
      setFile(null);
      setEditId(null);
      setShowForm(false);
      load();
    } catch (err) { setMsg('Error: ' + err.message); }
  };

  const handleEdit = (item) => {
    setForm({
      descripcion: item.descripcion,
      precio: item.precio.toString(),
      stock: item.stock.toString(),
      id_categoria: item.id_categoria.toString(),
      id_proveedor: item.id_proveedor.toString(),
      imagenes: item.imagenes || ''
    });
    setEditId(item.id_producto);
    setFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Eliminar producto?')) {
      await api.deleteProducto(id);
      setMsg('Producto eliminado');
      load();
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>Productos</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm({ descripcion: '', precio: '', stock: '', id_categoria: '', id_proveedor: '', imagenes: '' }); setFile(null); }}>
          Nuevo Producto
        </button>
      </div>
      {msg && <div className="status-message status-success">{msg}</div>}
      {showForm && (
        <div className="card">
          <h3>{editId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <input className="form-input" placeholder="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} required />
            <input className="form-input" placeholder="Precio" type="number" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} required />
            <input className="form-input" placeholder="Stock" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
            <select className="form-input" value={form.id_categoria} onChange={e => setForm({...form, id_categoria: e.target.value})} required>
              <option value="">Seleccionar Categoría</option>
              {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.descripcion}</option>)}
            </select>
            <select className="form-input" value={form.id_proveedor} onChange={e => setForm({...form, id_proveedor: e.target.value})} required>
              <option value="">Seleccionar Proveedor</option>
              {proveedores.map(p => <option key={p.id_proveedor} value={p.id_proveedor}>{p.razonsocial}</option>)}
            </select>
            <div>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
              <div className="img-upload-area" style={{ marginTop: 12 }}>
                {form.imagenes && !file && <img src={form.imagenes} alt="preview" />}
                {file && <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Archivo: {file.name}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-success" disabled={uploading}>{uploading ? 'Subiendo...' : (editId ? 'Actualizar' : 'Crear')}</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditId(null); setForm({ descripcion: '', precio: '', stock: '', id_categoria: '', id_proveedor: '', imagenes: '' }); setFile(null); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      <div className="table-container">
        <table>
          <thead><tr><th>ID</th><th>Imagen</th><th>Descripción</th><th>Precio</th><th>Stock</th><th>Categoría</th><th>Proveedor</th><th>Acciones</th></tr></thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id_producto}>
                <td>{item.id_producto}</td>
                <td>{item.imagenes ? <img src={item.imagenes} alt={item.descripcion} className="img-preview" /> : <span style={{ color: 'var(--gray-400)' }}>Sin imagen</span>}</td>
                <td>{item.descripcion}</td>
                <td>${item.precio}</td>
                <td>{item.stock}</td>
                <td>{item.categoria?.descripcion || item.id_categoria}</td>
                <td>{item.proveedor?.razonsocial || item.id_proveedor}</td>
                <td>
                  <div className="action-btns">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(item)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id_producto)}>Eliminar</button>
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
