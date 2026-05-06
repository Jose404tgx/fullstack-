import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Tienda.css';

function Tienda() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [cliente, setCliente] = useState({ nombres: '', apellidos: '', direccion: '', telefono: '' });
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await api.fetchProductos();
        setProductos(data);
      } catch (err) {
        setError('Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  const addToCart = (producto) => {
    setCart(prev => {
      const existing = prev.find(item => item.id_producto === producto.id_producto);
      if (existing) {
        if (existing.cantidad < producto.stock) {
          return prev.map(item =>
            item.id_producto === producto.id_producto
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          );
        }
        return prev;
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id_producto !== id));
  };

  const updateCantidad = (id, cantidad) => {
    if (cantidad < 1) return;
    setCart(prev => prev.map(item =>
      item.id_producto === id ? { ...item, cantidad: Math.min(cantidad, item.stock) } : item
    ));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.cantidad, 0);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!cliente.nombres || !cliente.apellidos || !cliente.direccion || !cliente.telefono) {
      alert('Todos los campos del cliente son requeridos');
      return;
    }
    try {
      const detalles = cart.map(item => ({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        stock_actual: item.stock
      }));
      const result = await api.createStorePurchase({
        cliente,
        detalles
      });
      if (result.error) {
        alert('Error: ' + result.error);
        return;
      }
      setCheckoutSuccess(true);
      setCart([]);
      setShowCheckout(false);
      setCliente({ nombres: '', apellidos: '', direccion: '', telefono: '' });
    } catch (err) {
      alert('Error al procesar la venta');
    }
  };

  if (loading) return <div className="loading">Cargando productos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="tienda-container">
      <header className="tienda-header">
        <div className="header-content">
          <div>
            <h1>Nuestra Tienda</h1>
            <p>Productos frescos y de calidad</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="cart-btn" onClick={() => setShowCart(true)}>
              🛒 Carrito ({getCartCount()})
            </button>
            <Link to="/login" className="admin-btn">Admin</Link>
          </div>
        </div>
      </header>

      <div className="productos-grid">
        {productos.map(producto => (
          <div key={producto.id_producto} className="producto-card">
            {producto.imagenes && (
              <img src={producto.imagenes} alt={producto.descripcion} className="producto-imagen" />
            )}
            <div className="producto-info">
              <h3>{producto.descripcion}</h3>
              <p className="categoria">{producto.categoria?.descripcion}</p>
              <p className="precio">${producto.precio.toFixed(2)}</p>
              <p className="stock">Stock: {producto.stock}</p>
              <button
                className="btn-comprar"
                disabled={producto.stock === 0}
                onClick={() => addToCart(producto)}
              >
                {producto.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Carrito de Compras</h2>
              <button onClick={() => setShowCart(false)}>✕</button>
            </div>
            {cart.length === 0 ? (
              <p>El carrito está vacío</p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id_producto} className="cart-item">
                      <div>
                        <h4>{item.descripcion}</h4>
                        <p>${item.precio.toFixed(2)} x {item.cantidad}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <button onClick={() => updateCantidad(item.id_producto, item.cantidad - 1)}>-</button>
                        <span>{item.cantidad}</span>
                        <button onClick={() => updateCantidad(item.id_producto, item.cantidad + 1)}>+</button>
                        <button onClick={() => removeFromCart(item.id_producto)} style={{ color: 'red' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <h3>Total: ${getTotal().toFixed(2)}</h3>
                  <button className="btn-checkout" onClick={() => { setShowCart(false); setShowCheckout(true); }}>
                    Proceder al pago
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="cart-overlay" onClick={() => setShowCheckout(false)}>
          <div className="checkout-modal" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Finalizar Compra</h2>
              <button onClick={() => setShowCheckout(false)}>✕</button>
            </div>
            <form onSubmit={handleCheckout} className="checkout-form">
              <h3>Datos del Cliente</h3>
              <input placeholder="Nombres" value={cliente.nombres} onChange={e => setCliente({...cliente, nombres: e.target.value})} required />
              <input placeholder="Apellidos" value={cliente.apellidos} onChange={e => setCliente({...cliente, apellidos: e.target.value})} required />
              <input placeholder="Dirección" value={cliente.direccion} onChange={e => setCliente({...cliente, direccion: e.target.value})} required />
              <input placeholder="Teléfono" value={cliente.telefono} onChange={e => setCliente({...cliente, telefono: e.target.value})} required />
              <h3>Resumen</h3>
              {cart.map(item => (
                <div key={item.id_producto} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.descripcion} x {item.cantidad}</span>
                  <span>${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
              <h3>Total: ${getTotal().toFixed(2)}</h3>
              <button type="submit" className="btn-checkout">Confirmar Compra</button>
            </form>
          </div>
        </div>
      )}

      {checkoutSuccess && (
        <div className="cart-overlay" onClick={() => setCheckoutSuccess(false)}>
          <div className="success-modal" onClick={e => e.stopPropagation()}>
            <h2>✓ Compra Realizada</h2>
            <p>Su compra ha sido procesada con éxito.</p>
            <button onClick={() => setCheckoutSuccess(false)}>Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tienda;
