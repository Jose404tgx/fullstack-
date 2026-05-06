import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Clientes from './components/Clientes';
import Categorias from './components/Categorias';
import Proveedores from './components/Proveedores';
import Productos from './components/Productos';
import Ventas from './components/Ventas';
import DetalleVentas from './components/DetalleVentas';
import Tienda from './components/Tienda';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AdminLayout() {
  const [activeTab, setActiveTab] = useState('clientes');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  const tabs = [
    { id: 'clientes', label: 'Clientes' },
    { id: 'categorias', label: 'Categorías' },
    { id: 'proveedores', label: 'Proveedores' },
    { id: 'productos', label: 'Productos' },
    { id: 'ventas', label: 'Ventas' },
    { id: 'detalles', label: 'Detalle Ventas' }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Panel Administrativo</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span>Bienvenido, {localStorage.getItem('adminUser')}</span>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>
      </div>
      <nav style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              background: activeTab === tab.id ? '#007bff' : '#f0f0f0',
              color: activeTab === tab.id ? 'white' : 'black',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {activeTab === 'clientes' && <Clientes />}
      {activeTab === 'categorias' && <Categorias />}
      {activeTab === 'proveedores' && <Proveedores />}
      {activeTab === 'productos' && <Productos />}
      {activeTab === 'ventas' && <Ventas />}
      {activeTab === 'detalles' && <DetalleVentas />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Tienda />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
