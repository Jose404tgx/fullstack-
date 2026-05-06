import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './Tienda.css';

function Tienda() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cliente, setCliente] = useState({ nombres: '', apellidos: '', direccion: '', telefono: '' });
  const [voucher, setVoucher] = useState(null);
  const voucherRef = useRef(null);

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
      const result = await api.createStorePurchase({ cliente, detalles });
      setShowCheckout(false);
      setShowCart(false);
      setVoucher({
        venta_id: result.venta_id,
        cliente,
        productos: cart,
        total: getTotal(),
        fecha: new Date().toLocaleString()
      });
      setCart([]);
      setCliente({ nombres: '', apellidos: '', direccion: '', telefono: '' });
    } catch (err) {
      alert('Error al registrar la venta: ' + err.message);
    }
  };

  const downloadVoucher = async () => {
    if (!voucherRef.current) return;
    const canvas = await html2canvas(voucherRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`Boleta-${voucher.venta_id}.pdf`);
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
          <div className="header-actions">
            <button className="cart-btn" onClick={() => setShowCart(true)}>
              Carrito ({getCartCount()})
            </button>
            <Link to="/login" className="admin-link">Admin</Link>
          </div>
        </div>
      </header>

      <div className="productos-grid">
        {productos.map(producto => (
          <div key={producto.id_producto} className="producto-card">
            <div className="producto-imagen-wrapper">
              {producto.imagenes ? (
                <img src={producto.imagenes} alt={producto.descripcion} className="producto-imagen" />
              ) : (
                <div className="producto-imagen-placeholder">Sin imagen</div>
              )}
            </div>
            <div className="producto-info">
              <h3>{producto.descripcion}</h3>
              {producto.categoria?.descripcion && (
                <span className="categoria">{producto.categoria.descripcion}</span>
              )}
              <div className="precio-row">
                <span className="precio">${producto.precio.toFixed(2)}</span>
                <span className="stock">{producto.stock} disponibles</span>
              </div>
              <button
                className="btn-agregar"
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
              <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--gray-500)' }}>
                El carrito está vacío
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id_producto} className="cart-item">
                      <div className="cart-item-info">
                        <h4>{item.descripcion}</h4>
                        <p>${(item.precio * item.cantidad).toFixed(2)}</p>
                      </div>
                      <div className="cart-item-actions">
                        <button className="qty-btn" onClick={() => updateCantidad(item.id_producto, item.cantidad - 1)}>-</button>
                        <span className="qty-value">{item.cantidad}</span>
                        <button className="qty-btn" onClick={() => updateCantidad(item.id_producto, item.cantidad + 1)}>+</button>
                        <button className="qty-btn remove-btn" onClick={() => removeFromCart(item.id_producto)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-total">
                    <h3>Total</h3>
                    <span className="total-price">${getTotal().toFixed(2)}</span>
                  </div>
                  <button className="btn-checkout" onClick={() => { setShowCart(false); setShowCheckout(true); }}>
                    Finalizar compra
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
              <input className="form-input" placeholder="Nombres" value={cliente.nombres} onChange={e => setCliente({...cliente, nombres: e.target.value})} required />
              <input className="form-input" placeholder="Apellidos" value={cliente.apellidos} onChange={e => setCliente({...cliente, apellidos: e.target.value})} required />
              <input className="form-input" placeholder="Dirección" value={cliente.direccion} onChange={e => setCliente({...cliente, direccion: e.target.value})} required />
              <input className="form-input" placeholder="Teléfono" value={cliente.telefono} onChange={e => setCliente({...cliente, telefono: e.target.value})} required />
              <h3>Resumen</h3>
              <div className="checkout-summary">
                {cart.map(item => (
                  <div key={item.id_producto} className="checkout-summary-item">
                    <span>{item.descripcion} x {item.cantidad}</span>
                    <span>${(item.precio * item.cantidad).toFixed(2)}</span>
                  </div>
                ))}
                <div className="checkout-total">
                  <span>Total</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
              </div>
              <button type="submit" className="btn-checkout">Registrar Venta</button>
            </form>
          </div>
        </div>
      )}

      {voucher && (
        <div className="cart-overlay" onClick={() => setVoucher(null)}>
          <div className="voucher-modal" onClick={e => e.stopPropagation()}>
            <div className="voucher-header">
              <h2>Compra Realizada</h2>
              <button onClick={() => setVoucher(null)}>✕</button>
            </div>
            <div className="voucher-content" ref={voucherRef}>
              <h3>BOLETA DE VENTA</h3>
              <p><strong>N° Venta:</strong> {voucher.venta_id}</p>
              <p><strong>Fecha:</strong> {voucher.fecha}</p>
              <hr/>
              <p><strong>Cliente:</strong> {voucher.cliente.nombres} {voucher.cliente.apellidos}</p>
              <p><strong>Dirección:</strong> {voucher.cliente.direccion}</p>
              <p><strong>Teléfono:</strong> {voucher.cliente.telefono}</p>
              <hr/>
              <h4>Productos:</h4>
              {voucher.productos.map(item => (
                <div key={item.id_producto} className="checkout-summary-item">
                  <span>{item.descripcion} x {item.cantidad}</span>
                  <span>${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
              <hr/>
              <div className="checkout-total">
                <span>Total</span>
                <span>${voucher.total.toFixed(2)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn-checkout" onClick={downloadVoucher} style={{ flex: 1 }}>
                Descargar PDF
              </button>
              <button className="btn-checkout" onClick={() => setVoucher(null)} style={{ flex: 1, background: 'var(--gray-500)' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tienda;
