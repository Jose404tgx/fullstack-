const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const upload = multer({ storage: multer.memoryStorage() });
const app = express();
const port = process.env.PORT || 3127;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/upload', (req, res, next) => {
    if (req.method === 'POST') {
        delete req.headers['content-type'];
    }
    next();
});

// Admin credentials (in production, use environment variables and hashed passwords)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_TOKEN = 'admin-secret-token-2026';

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        res.json({ 
            success: true, 
            token: ADMIN_TOKEN,
            message: 'Login exitoso' 
        });
    } else {
        res.status(401).json({ 
            success: false, 
            error: 'Credenciales inválidas' 
        });
    }
});

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token === ADMIN_TOKEN) {
        next();
    } else {
        res.status(403).json({ error: 'Acceso denegado. Token inválido.' });
    }
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_BUCKET = 'productos';
const TAYPI_API_URL = process.env.TAYPI_API_URL;
const TAYPI_SECRET_KEY = process.env.TAYPI_SECRET_KEY;

const headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

// Upload image to Supabase Storage
app.post('/upload', verifyAdminToken, upload.single('imagen'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No se envió ninguna imagen' });
        const fileName = `producto_${Date.now()}_${req.file.originalname}`;
        const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${fileName}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': req.file.mimetype || 'image/jpeg',
                'x-upsert': 'false'
            },
            body: req.file.buffer
        });
        const uploadText = await uploadRes.text();
        if (!uploadRes.ok) return res.status(400).json({ error: 'Error al subir imagen: ' + uploadText });
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${fileName}`;
        res.json({ url: publicUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
            const uploadText = await uploadRes.text();
            if (!uploadRes.ok) return res.status(400).json({ error: 'Error al subir imagen: ' + uploadText });
            const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${fileName}`;
            res.json({ url: publicUrl });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    })();
});
        fs.unlinkSync(file.filepath);
        const uploadText = await uploadRes.text();
        if (!uploadRes.ok) return res.status(400).json({ error: 'Error al subir imagen: ' + uploadText });
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${fileName}`;
        res.json({ url: publicUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== API ROUTES (Protected) ====================

app.get('/clientes', verifyAdminToken, async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/clientes?select=*&order=id_cliente.asc`, { headers });
        res.json(await response.json());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/clientes/:id', verifyAdminToken, async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/clientes?id_cliente=eq.${req.params.id}&select=*`, { headers });
        const data = await response.json();
        if (data.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/clientes', verifyAdminToken, async (req, res) => {
    try {
        const { nombres, apellidos, direccion, telefono } = req.body;
        if (!nombres || !apellidos || !direccion || !telefono) return res.status(400).json({ error: 'Todos los campos son requeridos' });
        const nextId = await getNextId('clientes', 'id_cliente');
        const response = await fetch(`${SUPABASE_URL}/rest/v1/clientes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                id_cliente: nextId,
                nombres: nombres.toString().trim().substring(0, 50),
                apellidos: apellidos.toString().trim().substring(0, 50),
                direccion: direccion.toString().trim().substring(0, 50),
                telefono: telefono.toString().trim().substring(0, 50)
            })
        });
        const text = await response.text();
        if (!response.ok) return res.status(response.status).json({ error: text });
        res.status(201).json(JSON.parse(text)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/clientes/:id', verifyAdminToken, async (req, res) => {
    try {
        const { nombres, apellidos, direccion, telefono } = req.body;
        const response = await fetch(`${SUPABASE_URL}/rest/v1/clientes?id_cliente=eq.${req.params.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                nombres: (nombres?.trim() || '').substring(0, 50),
                apellidos: (apellidos?.trim() || '').substring(0, 50),
                direccion: (direccion?.trim() || '').substring(0, 50),
                telefono: (telefono?.trim() || '').substring(0, 50)
            })
        });
        const text = await response.text();
        if (!response.ok) return res.status(response.status).json({ error: text });
        const data = JSON.parse(text);
        if (data.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/clientes/:id', verifyAdminToken, async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/clientes?id_cliente=eq.${req.params.id}`, {
            method: 'DELETE',
            headers
        });
        if (response.status === 204) res.json({ mensaje: 'Cliente eliminado' });
        else res.status(404).json({ error: 'Cliente no encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/categoria', verifyAdminToken, async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/categoria?select=*&order=id_categoria.asc`, { headers });
        res.json(await response.json());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/categoria', verifyAdminToken, async (req, res) => {
    try {
        const { descripcion } = req.body;
        if (!descripcion) return res.status(400).json({ error: 'La descripción es requerida' });
        const nextId = await getNextId('categoria', 'id_categoria');
        const response = await fetch(`${SUPABASE_URL}/rest/v1/categoria`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ id_categoria: nextId, descripcion: descripcion.toString().trim().substring(0, 100) })
        });
        const text = await response.text();
        if (!response.ok) return res.status(response.status).json({ error: text });
        res.status(201).json(JSON.parse(text)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/categoria/:id', verifyAdminToken, async (req, res) => {
    try {
        const { descripcion } = req.body;
        const response = await fetch(`${SUPABASE_URL}/rest/v1/categoria?id_categoria=eq.${req.params.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ descripcion: (descripcion?.trim() || '').substring(0, 100) })
        });
        const text = await response.text();
        if (!response.ok) return res.status(response.status).json({ error: text });
        const data = JSON.parse(text);
        if (data.length === 0) return res.status(404).json({ error: 'Categoria no encontrada' });
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/categoria/:id', verifyAdminToken, async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/categoria?id_categoria=eq.${req.params.id}`, {
            method: 'DELETE',
            headers
        });
        if (response.status === 204) res.json({ mensaje: 'Categoria eliminada' });
        else res.status(404).json({ error: 'Categoria no encontrada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/proveedor', verifyAdminToken, async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/proveedor?select=*&order=id_proveedor.asc`, { headers });
        res.json(await response.json());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/proveedor', verifyAdminToken, async (req, res) => {
    try {
        const { razonsocial, direccion, telefono } = req.body;
        if (!razonsocial || !direccion || !telefono) return res.status(400).json({ error: 'Todos los campos son requeridos' });
        const nextId = await getNextId('proveedor', 'id_proveedor');
        const response = await fetch(`${SUPABASE_URL}/rest/v1/proveedor`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                id_proveedor: nextId,
                razonsocial: razonsocial.toString().trim().substring(0, 50),
                direccion: direccion.toString().trim().substring(0, 50),
                telefono: telefono.toString().trim().substring(0, 50)
            })
        });
        const text = await response.text();
        if (!response.ok) return res.status(response.status).json({ error: text });
        res.status(201).json(JSON.parse(text)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/proveedor/:id', verifyAdminToken, async (req, res) => {
    try {
        const { razonsocial, direccion, telefono } = req.body;
        const response = await fetch(`${SUPABASE_URL}/rest/v1/proveedor?id_proveedor=eq.${req.params.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                razonsocial: (razonsocial?.trim() || '').substring(0, 50),
                direccion: (direccion?.trim() || '').substring(0, 50),
                telefono: (telefono?.trim() || '').substring(0, 50)
            })
        });
        const text = await response.text();
        if (!response.ok) return res.status(response.status).json({ error: text });
        const data = JSON.parse(text);
        if (data.length === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/proveedor/:id', verifyAdminToken, async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/proveedor?id_proveedor=eq.${req.params.id}`, {
            method: 'DELETE',
            headers
        });
        if (response.status === 204) res.json({ mensaje: 'Proveedor eliminado' });
        else res.status(404).json({ error: 'Proveedor no encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Public product route for the store (no token required)
app.get('/producto', async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/producto?select=*,categoria(descripcion),proveedor(razonsocial)&order=id_producto.asc`, { headers });
        res.json(await response.json());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Protected product routes for admin
app.get('/producto/admin', verifyAdminToken, async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/producto?select=*,categoria(descripcion),proveedor(razonsocial)&order=id_producto.asc`, { headers });
        res.json(await response.json());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/producto', verifyAdminToken, async (req, res) => {
    try {
        const { descripcion, precio, stock, id_categoria, id_proveedor, imagenes } = req.body;
        if (!descripcion || !precio || !stock || !id_categoria || !id_proveedor) return res.status(400).json({ error: 'Todos los campos son requeridos' });
        const nextId = await getNextId('producto', 'id_producto');
        const response = await fetch(`${SUPABASE_URL}/rest/v1/producto`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                id_producto: nextId,
                descripcion: descripcion.toString().trim().substring(0, 50),
                precio: parseFloat(precio),
                stock: parseInt(stock),
                id_categoria: parseInt(id_categoria),
                id_proveedor: parseInt(id_proveedor),
                imagenes: imagenes || null
            })
        });
        const text = await response.text();
        if (!response.ok) return res.status(response.status).json({ error: text });
        res.status(201).json(JSON.parse(text)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/producto/:id', verifyAdminToken, async (req, res) => {
    try {
        const { descripcion, precio, stock, id_categoria, id_proveedor, imagenes } = req.body;
        const response = await fetch(`${SUPABASE_URL}/rest/v1/producto?id_producto=eq.${req.params.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                descripcion: (descripcion?.trim() || '').substring(0, 50),
                precio: precio !== undefined ? parseFloat(precio) : undefined,
                stock: stock !== undefined ? parseInt(stock) : undefined,
                id_categoria: id_categoria !== undefined ? parseInt(id_categoria) : undefined,
                id_proveedor: id_proveedor !== undefined ? parseInt(id_proveedor) : undefined,
                imagenes: imagenes !== undefined ? imagenes : undefined
            })
        });
        const text = await response.text();
        if (!response.ok) return res.status(response.status).json({ error: text });
        const data = JSON.parse(text);
        if (data.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/producto/:id', verifyAdminToken, async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/producto?id_producto=eq.${req.params.id}`, {
            method: 'DELETE',
            headers
        });
        if (response.status === 204) res.json({ mensaje: 'Producto eliminado' });
        else res.status(404).json({ error: 'Producto no encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/ventas', verifyAdminToken, async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/ventas?select=*,clientes(nombres,apellidos)&order=id_venta.desc`, { headers });
        res.json(await response.json());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/ventas', verifyAdminToken, async (req, res) => {
    try {
        const { id_cliente, fecha, detalles } = req.body;
        if (!id_cliente) return res.status(400).json({ error: 'El cliente es requerido' });
        const nextVentaId = await getNextId('ventas', 'id_venta');
        const ventaResponse = await fetch(`${SUPABASE_URL}/rest/v1/ventas`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                id_venta: nextVentaId,
                id_cliente: parseInt(id_cliente),
                fecha: fecha || new Date().toISOString()
            })
        });
        const text = await ventaResponse.text();
        if (!ventaResponse.ok) return res.status(ventaResponse.status).json({ error: text });
        const venta = JSON.parse(text)[0];
        if (detalles && Array.isArray(detalles) && detalles.length > 0) {
            for (const d of detalles) {
                const nextDetId = await getNextId('detalle_venta', 'id_detventa');
                await fetch(`${SUPABASE_URL}/rest/v1/detalle_venta`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        id_detventa: nextDetId,
                        id_venta: venta.id_venta,
                        id_producto: parseInt(d.id_producto),
                        cantidad: parseInt(d.cantidad)
                    })
                });
            }
        }
        res.status(201).json(venta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper to get next ID for a table
const getNextId = async (table, idColumn) => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${idColumn}&order=${idColumn}.desc&limit=1`, { headers });
    const data = await response.json();
    return data.length > 0 ? parseInt(data[0][idColumn]) + 1 : 1;
};

// Public store purchase endpoint (no admin token required)
app.post('/store/purchase', async (req, res) => {
    try {
        const { cliente, detalles } = req.body;
        if (!cliente || !cliente.nombres || !cliente.apellidos || !cliente.direccion || !cliente.telefono) {
            return res.status(400).json({ error: 'Datos del cliente son requeridos' });
        }
        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({ error: 'Detalles de la compra son requeridos' });
        }
        const nextClienteId = await getNextId('clientes', 'id_cliente');
        const clientResponse = await fetch(`${SUPABASE_URL}/rest/v1/clientes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                id_cliente: nextClienteId,
                nombres: cliente.nombres.toString().trim().substring(0, 50),
                apellidos: cliente.apellidos.toString().trim().substring(0, 50),
                direccion: cliente.direccion.toString().trim().substring(0, 50),
                telefono: cliente.telefono.toString().trim().substring(0, 50)
            })
        });
        const clientText = await clientResponse.text();
        if (!clientResponse.ok) return res.status(400).json({ error: 'Error al crear cliente: ' + clientText });
        const newClient = JSON.parse(clientText)[0];
        const nextVentaId = await getNextId('ventas', 'id_venta');
        const ventaResponse = await fetch(`${SUPABASE_URL}/rest/v1/ventas`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                id_venta: nextVentaId,
                id_cliente: newClient.id_cliente,
                fecha: new Date().toISOString()
            })
        });
        const ventaText = await ventaResponse.text();
        if (!ventaResponse.ok) return res.status(400).json({ error: 'Error al crear venta: ' + ventaText });
        const venta = JSON.parse(ventaText)[0];
        for (const d of detalles) {
            const nextDetId = await getNextId('detalle_venta', 'id_detventa');
            await fetch(`${SUPABASE_URL}/rest/v1/detalle_venta`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    id_detventa: nextDetId,
                    id_venta: venta.id_venta,
                    id_producto: parseInt(d.id_producto),
                    cantidad: parseInt(d.cantidad)
                })
            });
            const prodResponse = await fetch(`${SUPABASE_URL}/rest/v1/producto?id_producto=eq.${d.id_producto}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ stock: parseInt(d.stock_actual) - parseInt(d.cantidad) })
            });
            if (!prodResponse.ok) console.error('Error updating stock for product', d.id_producto);
        }
        res.status(201).json({ mensaje: 'Compra realizada con éxito', venta_id: venta.id_venta });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/ventas/:id', verifyAdminToken, async (req, res) => {
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/detalle_venta?id_venta=eq.${req.params.id}`, {
            method: 'DELETE',
            headers
        });
        const response = await fetch(`${SUPABASE_URL}/rest/v1/ventas?id_venta=eq.${req.params.id}`, {
            method: 'DELETE',
            headers
        });
        if (response.status === 204) res.json({ mensaje: 'Venta eliminada' });
        else res.status(404).json({ error: 'Venta no encontrada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/detalle_venta', verifyAdminToken, async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/detalle_venta?select=*,producto(descripcion,precio),ventas(id_venta)&order=id_detventa.asc`, { headers });
        res.json(await response.json());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/detalle_venta', verifyAdminToken, async (req, res) => {
    try {
        const { id_venta, id_producto, cantidad } = req.body;
        if (!id_venta || !id_producto || !cantidad) return res.status(400).json({ error: 'Todos los campos son requeridos' });
        const nextId = await getNextId('detalle_venta', 'id_detventa');
        const response = await fetch(`${SUPABASE_URL}/rest/v1/detalle_venta`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                id_detventa: nextId,
                id_venta: parseInt(id_venta),
                id_producto: parseInt(id_producto),
                cantidad: parseInt(cantidad)
            })
        });
        const text = await response.text();
        if (!response.ok) return res.status(response.status).json({ error: text });
        res.status(201).json(JSON.parse(text)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== TAYPI PAYMENT ENDPOINTS ====================

app.post('/taypi/create', async (req, res) => {
    try {
        const { amount, reference, description } = req.body;
        if (!amount || !reference) return res.status(400).json({ error: 'Monto y referencia son requeridos' });
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const response = await fetch(`${TAYPI_API_URL}/payments`, {
            method: 'POST',
            headers: {
                'Taypi-Signature': TAYPI_SECRET_KEY,
                'Taypi-Timestamp': timestamp,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount.toFixed(2),
                reference: reference,
                description: description || 'Compra en tienda online'
            })
        });
        const data = await response.json();
        if (!response.ok) return res.status(response.status).json({ error: data.message || 'Error al crear pago' });
        res.json(data.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/taypi/payment/:id', async (req, res) => {
    try {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const response = await fetch(`${TAYPI_API_URL}/payments/${req.params.id}`, {
            method: 'GET',
            headers: {
                'Taypi-Signature': TAYPI_SECRET_KEY,
                'Taypi-Timestamp': timestamp
            }
        });
        const data = await response.json();
        if (!response.ok) return res.status(response.status).json({ error: data.message || 'Error al consultar pago' });
        res.json(data.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/taypi/cancel/:id', async (req, res) => {
    try {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const response = await fetch(`${TAYPI_API_URL}/payments/${req.params.id}/cancel`, {
            method: 'POST',
            headers: {
                'Taypi-Signature': TAYPI_SECRET_KEY,
                'Taypi-Timestamp': timestamp
            }
        });
        const data = await response.json();
        if (!response.ok) return res.status(response.status).json({ error: data.message || 'Error al cancelar pago' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/detalle_venta/:id', verifyAdminToken, async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/detalle_venta?id_detventa=eq.${req.params.id}`, {
            method: 'DELETE',
            headers
        });
        if (response.status === 204) res.json({ mensaje: 'Detalle eliminado' });
        else res.status(404).json({ error: 'Detalle no encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SERVE REACT APP ====================
const distPath = path.join(__dirname, 'frontend', 'dist');
const indexPath = path.join(distPath, 'index.html');

console.log('Serving frontend from:', distPath);
console.log('Dist path exists:', fs.existsSync(distPath));

if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.use((req, res, next) => {
        const pathname = req.path;
        if (!pathname.startsWith('/login') &&
            !pathname.startsWith('/clientes') && !pathname.startsWith('/categoria') &&
            !pathname.startsWith('/proveedor') && !pathname.startsWith('/producto') &&
            !pathname.startsWith('/ventas') && !pathname.startsWith('/detalle_venta')) {
            res.sendFile(indexPath);
        } else {
            next();
        }
    });
} else {
    app.get('/', (req, res) => {
        res.json({
            status: 'Backend running',
            frontend: 'Not built - dist folder missing',
            distPath: distPath,
            message: 'Tienda pública disponible en /producto'
        });
    });
}

app.listen(port, '0.0.0.0', () => {
    console.log('Servidor escuchando en http://localhost:' + port);
});
