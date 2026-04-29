import { useState, useEffect } from 'react';
import { getProductos, createProducto, updateProducto, deleteProducto, getCategorias, getProveedores } from '../services/api';

export default function Productos() {
  const [data, setData] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState({ descripcion: '', precio: '', stock: '', id_categoria: '', id_proveedor: '' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () => {
    getProductos().then(setData);
    getCategorias().then(setCategorias);
    getProveedores().then(setProveedores);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        descripcion: form.descripcion,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock),
        id_categoria: parseInt(form.id_categoria),
        id_proveedor: parseInt(form.id_proveedor)
      };
      if (editId) {
        await updateProducto(editId, payload);
        setMsg('Producto actualizado');
      } else {
        await createProducto(payload);
        setMsg('Producto creado');
      }
      setForm({ descripcion: '', precio: '', stock: '', id_categoria: '', id_proveedor: '' });
      setEditId(null);
      load();
    } catch (err) { setMsg('Error: ' + err.message); }
  };

  const handleEdit = (item) => {
    setForm({
      descripcion: item.descripcion,
      precio: item.precio.toString(),
      stock: item.stock.toString(),
      id_categoria: item.id_categoria.toString(),
      id_proveedor: item.id_proveedor.toString()
    });
    setEditId(item.id_producto);
  };

  const handleDelete = async (id) => {
    if (confirm('Eliminar producto?')) {
      await deleteProducto(id);
      setMsg('Producto eliminado');
      load();
    }
  };

  return (
    <div>
      <h2>Productos</h2>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: 'grid', gap: 8, maxWidth: 400 }}>
        <input placeholder="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} required />
        <input placeholder="Precio" type="number" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} required />
        <input placeholder="Stock" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
        <select value={form.id_categoria} onChange={e => setForm({...form, id_categoria: e.target.value})} required>
          <option value="">Seleccionar Categoría</option>
          {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.descripcion}</option>)}
        </select>
        <select value={form.id_proveedor} onChange={e => setForm({...form, id_proveedor: e.target.value})} required>
          <option value="">Seleccionar Proveedor</option>
          {proveedores.map(p => <option key={p.id_proveedor} value={p.id_proveedor}>{p.razonsocial}</option>)}
        </select>
        <button type="submit">{editId ? 'Actualizar' : 'Crear'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ descripcion: '', precio: '', stock: '', id_categoria: '', id_proveedor: '' }); }}>Cancelar</button>}
      </form>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th>ID</th><th>Descripción</th><th>Precio</th><th>Stock</th><th>Categoría</th><th>Proveedor</th><th>Acciones</th></tr></thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id_producto}>
              <td>{item.id_producto}</td><td>{item.descripcion}</td><td>{item.precio}</td><td>{item.stock}</td>
              <td>{item.categoria_desc || item.id_categoria}</td>
               <td>{item.proveedor_desc || item.id_proveedor}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Editar</button>
                <button onClick={() => handleDelete(item.id_producto)} style={{ marginLeft: 5 }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
