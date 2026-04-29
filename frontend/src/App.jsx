import { useState } from 'react';
import Clientes from './components/Clientes';
import Categorias from './components/Categorias';
import Proveedores from './components/Proveedores';
import Productos from './components/Productos';
import Ventas from './components/Ventas';
import DetalleVentas from './components/DetalleVentas';

const tabs = [
  { id: 'clientes', label: 'Clientes' },
  { id: 'categorias', label: 'Categorías' },
  { id: 'proveedores', label: 'Proveedores' },
  { id: 'productos', label: 'Productos' },
  { id: 'ventas', label: 'Ventas' },
  { id: 'detalles', label: 'Detalle Ventas' }
];

function App() {
  const [activeTab, setActiveTab] = useState('clientes');

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Sistema de Ventas</h1>
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

export default App;
