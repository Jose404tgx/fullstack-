const express = require('express');
const path = require('path');
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

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bezcodjjxvwqimvejegh.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlemNvZGpqeHZ3cWltdmVqZWdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njg1ODIwMCwiZXhwIjoyMDkyNDM0MjAwfQ.dG1xmikYXDd2ciRt7VtAHpZ05fEqErOzBb8363O6LwE';

const headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

// ==================== API ROUTES ====================

app.get('/clientes', async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/clientes?select=*&order=id_cliente.asc`, { headers });
        res.json(await response.json());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/clientes/:id', async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/clientes?id_cliente=eq.${req.params.id}&select=*`, { headers });
        const data = await response.json();
        if (data.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/clientes', async (req, res) => {
    try {
        const { nombres, apellidos, direccion, telefono } = req.body;
        if (!nombres || !apellidos || !direccion || !telefono) return res.status(400).json({ error: 'Todos los campos son requeridos' });
        const response = await fetch(`${SUPABASE_URL}/rest/v1/clientes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
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

app.put('/clientes/:id', async (req, res) => {
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

app.delete('/clientes/:id', async (req, res) => {
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

app.get('/categoria', async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/categoria?select=*&order=id_categoria.asc`, { headers });
        res.json(await response.json());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/categoria', async (req, res) => {
    try {
        const { descripcion } = req.body;
        if (!descripcion) return res.status(400).json({ error: 'La descripción es requerida' });
        const response = await fetch(`${SUPABASE_URL}/rest/v1/categoria`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ descripcion: descripcion.toString().trim().substring(0, 100) })
        });
        const text = await response.text();
        if (!response.ok) return res.status(response.status).json({ error: text });
        res.status(201).json(JSON.parse(text)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/categoria/:id', async (req, res) => {
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

app.delete('/categoria/:id', async (req, res) => {
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

app.get('/proveedor', async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/proveedor?select=*&order=id_proveedor.asc`, { headers });
        res.json(await response.json());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/proveedor', async (req, res) => {
    try {
        const { razonsocial, direccion, telefono } = req.body;
        if (!razonsocial || !direccion || !telefono) return res.status(400).json({ error: 'Todos los campos son requeridos' });
        const response = await fetch(`${SUPABASE_URL}/rest/v1/proveedor`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
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

app.put('/proveedor/:id', async (req, res) => {
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

app.delete('/proveedor/:id', async (req, res) => {
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

app.get('/producto', async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/producto?select=*,categoria(descripcion),proveedor(razonsocial)&order=id_producto.asc`, { headers });
        res.json(await response.json());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/producto', async (req, res) => {
    try {
        const { descripcion, precio, stock, id_categoria, id_proveedor } = req.body;
        if (!descripcion || !precio || !stock || !id_categoria || !id_proveedor) return res.status(400).json({ error: 'Todos los campos son requeridos' });
        const response = await fetch(`${SUPABASE_URL}/rest/v1/producto`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                descripcion: descripcion.toString().trim().substring(0, 50),
                precio: parseFloat(precio),
                stock: parseInt(stock),
                id_categoria: parseInt(id_categoria),
                id_proveedor: parseInt(id_proveedor)
            })
        });
        const text = await response.text();
        if (!response.ok) return res.status(response.status).json({ error: text });
        res.status(201).json(JSON.parse(text)[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/producto/:id', async (req, res) => {
    try {
        const { descripcion, precio, stock, id_categoria, id_proveedor } = req.body;
        const response = await fetch(`${SUPABASE_URL}/rest/v1/producto?id_producto=eq.${req.params.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                descripcion: (descripcion?.trim() || '').substring(0, 50),
                precio: precio !== undefined ? parseFloat(precio) : undefined,
                stock: stock !== undefined ? parseInt(stock) : undefined,
                id_categoria: id_categoria !== undefined ? parseInt(id_categoria) : undefined,
                id_proveedor: id_proveedor !== undefined ? parseInt(id_proveedor) : undefined
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

app.delete('/producto/:id', async (req, res) => {
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

app.get('/ventas', async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/ventas?select=*,clientes(nombres,apellidos)&order=id_venta.desc`, { headers });
        res.json(await response.json());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/ventas', async (req, res) => {
    try {
        const { id_cliente, fecha, detalles } = req.body;
        if (!id_cliente) return res.status(400).json({ error: 'El cliente es requerido' });
        const ventaResponse = await fetch(`${SUPABASE_URL}/rest/v1/ventas`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                id_cliente: parseInt(id_cliente),
                fecha: fecha || new Date().toISOString()
            })
        });
        const text = await ventaResponse.text();
        if (!ventaResponse.ok) return res.status(ventaResponse.status).json({ error: text });
        const venta = JSON.parse(text)[0];
        if (detalles && Array.isArray(detalles) && detalles.length > 0) {
            for (const d of detalles) {
                await fetch(`${SUPABASE_URL}/rest/v1/detalle_venta`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
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

app.delete('/ventas/:id', async (req, res) => {
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

app.get('/detalle_venta', async (req, res) => {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/detalle_venta?select=*,producto(descripcion,precio),ventas(id_venta)&order=id_detventa.asc`, { headers });
        res.json(await response.json());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/detalle_venta', async (req, res) => {
    try {
        const { id_venta, id_producto, cantidad } = req.body;
        if (!id_venta || !id_producto || !cantidad) return res.status(400).json({ error: 'Todos los campos son requeridos' });
        const response = await fetch(`${SUPABASE_URL}/rest/v1/detalle_venta`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
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

app.delete('/detalle_venta/:id', async (req, res) => {
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
const fs = require('fs');
const distPath = path.join(__dirname, 'frontend', 'dist');

if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api') && !req.path.startsWith('/clientes') && 
            !req.path.startsWith('/categoria') && !req.path.startsWith('/proveedor') &&
            !req.path.startsWith('/producto') && !req.path.startsWith('/ventas') && 
            !req.path.startsWith('/detalle_venta')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
}

app.listen(port, '0.0.0.0', () => {
    console.log('Servidor escuchando en http://localhost:' + port);
});
