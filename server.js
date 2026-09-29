const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data.json');

// دالة لقراءة البيانات من ملف الـ JSON
function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        // هيكل افتراضي أولي إذا لم يكن الملف موجوداً
        const initialData = { products: [], orders: [], about: [] };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    const fileData = fs.readFileSync(DATA_FILE, 'utf8');
    try {
        return JSON.parse(fileData);
    } catch (e) {
        return { products: [], orders: [], about: [] };
    }
}

// دالة لحفظ البيانات في ملف الـ JSON
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ==================== APIs المنتجات ====================
app.get('/api/products', (req, res) => {
    try {
        const data = readData();
        res.json(data.products || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', (req, res) => {
    try {
        const data = readData();
        const newProduct = { _id: Date.now().toString(), ...req.body };
        data.products.push(newProduct);
        writeData(data);
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', (req, res) => {
    try {
        const data = readData();
        data.products = data.products.filter(p => p._id !== req.params.id);
        writeData(data);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== APIs الطلبات ====================
app.get('/api/orders', (req, res) => {
    try {
        const data = readData();
        // ترتيب الطلبات من الأحدث للأقدم
        const sortedOrders = (data.orders || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(sortedOrders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', (req, res) => {
    try {
        const data = readData();
        const newOrder = { 
            _id: Date.now().toString(), 
            status: 'جديد',
            createdAt: new Date().toISOString(),
            ...req.body 
        };
        data.orders.push(newOrder);
        writeData(data);
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/orders/:id', (req, res) => {
    try {
        const data = readData();
        const order = data.orders.find(o => o._id === req.params.id);
        if (order) {
            order.status = req.body.status || order.status;
            writeData(data);
            res.json(order);
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/orders/:id', (req, res) => {
    try {
        const data = readData();
        data.orders = data.orders.filter(o => o._id !== req.params.id);
        writeData(data);
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== APIs قسم "حول كارما" ====================
app.get('/api/about', (req, res) => {
    try {
        const data = readData();
        res.json(data.about || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/about', (req, res) => {
    try {
        const data = readData();
        const newItem = { _id: Date.now().toString(), ...req.body };
        data.about.push(newItem);
        writeData(data);
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/about/:id', (req, res) => {
    try {
        const data = readData();
        const item = data.about.find(i => i._id === req.params.id);
        if (item) {
            item.image = req.body.image || item.image;
            item.description = req.body.description || item.description;
            writeData(data);
            res.json(item);
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/about/:id', (req, res) => {
    try {
        const data = readData();
        data.about = data.about.filter(i => i._id !== req.params.id);
        writeData(data);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT} using JSON file!`);
});
