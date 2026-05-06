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
    <div className="admin-layout">
      <header className="admin-header">
        <h1>Panel Admin</h1>
        <div className="admin-header-right">
          <Link to="/" className="back-home-btn">Tienda</Link>
          <span className="admin-user">{localStorage.getItem('adminUser')}</span>
          <button onClick={handleLogout} className="logout-btn">Salir</button>
        </div>
      </header>
      <nav className="admin-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'tab-btn active' : 'tab-btn'}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <main className="admin-content">
        {activeTab === 'clientes' && <Clientes />}
        {activeTab === 'categorias' && <Categorias />}
        {activeTab === 'proveedores' && <Proveedores />}
        {activeTab === 'productos' && <Productos />}
        {activeTab === 'ventas' && <Ventas />}
        {activeTab === 'detalles' && <DetalleVentas />}
      </main>
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
