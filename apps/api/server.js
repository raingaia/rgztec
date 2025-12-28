const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors()); // Frontend'in (statik tarafın) API'ye erişebilmesi için şart

// API Giriş Testi
app.get('/api/status', (req, res) => {
    res.json({ status: "RGZ API Online", stores: 90 });
});

// MAĞAZA VERİSİNİ GETİREN ANA ENDPOINT
app.get('/api/v1/store/:slug', (req, res) => {
    const storeSlug = req.params.slug;
    const dataPath = path.join(__dirname, '../data', `${storeSlug}.json`);

    // Dosya var mı kontrol et
    if (fs.existsSync(dataPath)) {
        const rawData = fs.readFileSync(dataPath);
        const storeData = JSON.parse(rawData);
        
        // Buraya "Logic" ekliyoruz: Fiyatları JSON'dan alıp işlemden geçiriyoruz
        const processedData = storeData.items.map(item => ({
            ...item,
            final_price: (item.price * 1.18).toFixed(2), // Örn: %18 KDV ekli hali
            stock_status: item.qty > 0 ? "In Stock" : "Out of Stock"
        }));

        res.json({
            success: true,
            store: storeSlug,
            items: processedData
        });
    } else {
        res.status(404).json({ success: false, message: "Mağaza datası bulunamadı." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RGZ API ${PORT} üzerinde gazlıyor!`));
