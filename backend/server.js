const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Route Imports
const agentRoutes = require('./routes/agentRoutes');
const distributorRoutes = require('./routes/distributorRoutes');
const dealerRoutes = require('./routes/dealerRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const generalRoutes = require('./routes/generalRoutes');
const customerRoutes = require('./routes/customerRoutes');
const supportRoutes = require('./routes/supportRoutes');
const orderRoutes = require('./routes/orderRoutes');
const wishlistTrackingRoutes = require('./routes/wishlistTrackingRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true  // Required for cookies to work cross-origin
}));
app.use(cookieParser());
app.use(bodyParser.json());

// File Upload Setup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });
app.use('/uploads', express.static(uploadDir));

// Upload Route
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  res.json({ imageUrl: `${baseUrl}/uploads/${req.file.filename}` });
});

// API Modules
app.use('/api/agent', agentRoutes);
app.use('/api/distributors', distributorRoutes);
app.use('/api/dealers', dealerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist-tracker', wishlistTrackingRoutes);

const promoRoutes = require('./routes/promoRoutes');

app.use('/api', cmsRoutes);
app.use('/api', generalRoutes);
app.use('/api/promos', promoRoutes);

// ─── Auth: /me + /logout (JWT Cookie) ────────────────────────────────────────
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'a2p_super_secret_key_2024';

app.get('/api/auth/me', async (req, res) => {
  const token = req.cookies?.a2p_token;
  if (!token) return res.status(401).json({ error: 'Not logged in' });
  try {
    const user = jwt.verify(token, JWT_SECRET);
    if (user.type === 'customer' || !user.type) {
      try {
        const [rows] = await db.query('SELECT name, email, tier, role FROM customers WHERE id = ?', [user.id]);
        if (rows.length > 0) {
          const fresh = rows[0];
          return res.json({
            ...user,
            name: fresh.name || user.name,
            email: fresh.email || user.email,
            tier: fresh.tier || user.tier,
            role: fresh.role || (fresh.email?.includes('admin') ? 'Admin' : 'Customer')
          });
        }
      } catch (dbErr) {}
    }
    res.json(user);
  } catch {
    res.clearCookie('a2p_token');
    res.status(401).json({ error: 'Session expired' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('a2p_token', { httpOnly: true, sameSite: 'Lax' });
  res.json({ message: 'Logged out' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// ─── Root-level SEO files (Google crawler expects these at the domain root) ───
const db = require('./db');

app.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://a2pcosmetics.com';
    const [products] = await db.query('SELECT id, updated_at FROM products WHERE status = "Active"');
    const [articles] = await db.query('SELECT id, slug, updated_at FROM articles WHERE status = "Published"');

    const staticPages = [
      { url: '/',             priority: '1.0', changefreq: 'daily'  },
      { url: '/new-arrivals', priority: '0.9', changefreq: 'daily'  },
      { url: '/all-products', priority: '0.9', changefreq: 'daily'  },
      { url: '/facewash',     priority: '0.8', changefreq: 'weekly' },
      { url: '/faceserum',    priority: '0.8', changefreq: 'weekly' },
      { url: '/facecream',    priority: '0.8', changefreq: 'weekly' },
      { url: '/bodywash',     priority: '0.8', changefreq: 'weekly' },
      { url: '/articles',     priority: '0.8', changefreq: 'daily' },
      { url: '/contact',      priority: '0.5', changefreq: 'monthly'},
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    staticPages.forEach(p => {
      xml += `  <url><loc>${baseUrl}${p.url}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority><lastmod>${new Date().toISOString().split('T')[0]}</lastmod></url>\n`;
    });

    products.forEach(p => {
      const lastmod = p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `  <url><loc>${baseUrl}/product/${p.id}</loc><changefreq>weekly</changefreq><priority>0.85</priority><lastmod>${lastmod}</lastmod></url>\n`;
    });

    articles.forEach(a => {
      const lastmod = a.updated_at ? new Date(a.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `  <url><loc>${baseUrl}/articles#${a.slug || a.id}</loc><changefreq>weekly</changefreq><priority>0.8</priority><lastmod>${lastmod}</lastmod></url>\n`;
    });

    xml += `</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (e) {
    res.status(500).send(`<error>${e.message}</error>`);
  }
});

app.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://a2pcosmetics.com';
  res.header('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /distributor/\nDisallow: /agent/\nDisallow: /dealer/\nDisallow: /checkout\nDisallow: /my-orders\nDisallow: /my-addresses\n\nSitemap: ${baseUrl}/sitemap.xml\n`);
});

