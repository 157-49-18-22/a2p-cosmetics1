const express = require('express');
const router = express.Router();
const db = require('../db');
const productController = require('../controllers/productController');
const { verifyToken } = require('../middleware/auth');

const optionalAuth = (req, res, next) => {
  const token = req.cookies?.a2p_token;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    req.user = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'a2p_super_secret_key_2024');
    next();
  } catch {
    req.user = null;
    next();
  }
};

// Cart
router.get('/cart', optionalAuth, async (req, res) => {
  try {
    if (!req.user) return res.json([]);
    const [rows] = await db.query('SELECT * FROM cart WHERE customer_id = ?', [req.user.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/cart', verifyToken, async (req, res) => {
  // Allow all logged-in users to use cart
  const { name, price, image_url, quantity } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM cart WHERE name = ? AND customer_id = ?', [name, req.user.id]);
    if (existing.length > 0) {
      await db.query('UPDATE cart SET quantity = quantity + ? WHERE name = ? AND customer_id = ?', [quantity || 1, name, req.user.id]);
      res.json({ message: 'Cart updated' });
    } else {
      await db.query('INSERT INTO cart (name, price, image_url, quantity, customer_id) VALUES (?, ?, ?, ?, ?)', [name, price, image_url, quantity || 1, req.user.id]);
      res.json({ message: 'Added to cart' });
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/cart/clear/all', verifyToken, async (req, res) => {
  // Allow all logged-in users
  try {
    await db.query('DELETE FROM cart WHERE customer_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/cart/:id', verifyToken, async (req, res) => {
  // Allow all logged-in users
  try {
    await db.query('DELETE FROM cart WHERE id = ? AND customer_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Item removed from cart' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/cart/:id', verifyToken, async (req, res) => {
  // Allow all logged-in users
  const { quantity } = req.body;
  try {
    await db.query('UPDATE cart SET quantity = ? WHERE id = ? AND customer_id = ?', [quantity, req.params.id, req.user.id]);
    res.json({ message: 'Cart item updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});



// Wishlist
router.get('/wishlist', optionalAuth, async (req, res) => {
  try {
    if (!req.user) return res.json([]);
    const [rows] = await db.query('SELECT * FROM wishlist WHERE customer_id = ?', [req.user.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/wishlist', verifyToken, async (req, res) => {
  // Allow all logged-in users
  const { name, price, image_url } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM wishlist WHERE name = ? AND customer_id = ?', [name, req.user.id]);
    if (existing.length === 0) {
      await db.query('INSERT INTO wishlist (name, price, image_url, customer_id) VALUES (?, ?, ?, ?)', [name, price, image_url, req.user.id]);
    }
    res.json({ message: 'Added to wishlist' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/wishlist/:id', verifyToken, async (req, res) => {
  // Allow all logged-in users
  try {
    await db.query('DELETE FROM wishlist WHERE id = ? AND customer_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Removed from wishlist' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Inventory (Direct access from /api)
router.get('/inventory', productController.getInventory);
router.put('/inventory/:id', productController.updateInventory);

// Admin Global Stats
router.get('/admin/stats', async (req, res) => {
  try {
    const [[{ total_products }]] = await db.query('SELECT COUNT(*) as total_products FROM products');
    const [[{ total_categories }]] = await db.query('SELECT COUNT(*) as total_categories FROM categories');
    const [[{ low_stock }]] = await db.query('SELECT COUNT(*) as low_stock FROM products WHERE stock < 50 AND stock > 0');
    
    // User counts
    const [[{ total_customers }]] = await db.query('SELECT COUNT(*) as total_customers FROM customers');
    const [[{ total_agents }]] = await db.query('SELECT COUNT(*) as total_agents FROM agents');
    const [[{ total_distributors }]] = await db.query('SELECT COUNT(*) as total_distributors FROM distributors');
    
    // Order stats
    const [[{ total_orders }]] = await db.query('SELECT COUNT(*) as total_orders FROM orders');
    const [recent_orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');

    // Recent Users
    const [latest_cust] = await db.query('SELECT name, email, joined_at as created_at, "Customer" as type FROM customers ORDER BY joined_at DESC LIMIT 5');
    const [latest_ag] = await db.query('SELECT name, email, created_at, "Agent" as type FROM agents ORDER BY created_at DESC LIMIT 5');
    const [latest_dist] = await db.query('SELECT name, email, created_at, "Distributor" as type FROM distributors ORDER BY created_at DESC LIMIT 5');
    
    const recent_users = [...latest_cust, ...latest_ag, ...latest_dist]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    res.json({ 
      total_products, 
      total_categories, 
      low_stock,
      total_customers,
      total_agents,
      total_distributors,
      total_orders,
      recent_orders,
      recent_users
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Unified User Management (Customer & Admin)
router.get('/users/all', async (req, res) => {
  try {
    const [cust] = await db.query(
      "SELECT id, name, email, phone, COALESCE(role, 'Customer') as role, joined_at as created_at, status FROM customers ORDER BY joined_at DESC"
    );
    res.json(cust || []);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/users/add', async (req, res) => {
  const { name, email, phone, role, password } = req.body;
  try {
    const pwd = password || 'a2p123';
    const userRole = role === 'Admin' ? 'Admin' : 'Customer';
    await db.query(
      'INSERT INTO customers (name, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, "Active")',
      [name, email, phone || '', pwd, userRole]
    );
    res.json({ message: 'User added successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  try {
    const userRole = role === 'Admin' ? 'Admin' : 'Customer';
    await db.query('UPDATE customers SET role = ? WHERE id = ?', [userRole, req.params.id]);
    res.json({ success: true, message: `User role updated to ${userRole}` });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Google Merchant Center RSS XML Feed
router.get('/google/merchant-feed', async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products WHERE status = "Active"');
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const serverUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>A2P Cosmetics Product Feed</title>
    <link>${baseUrl}</link>
    <description>Luxury Skincare &amp; Beauty Products from A2P Cosmetics</description>
`;

    products.forEach(p => {
      const prodUrl = `${baseUrl}/product/${p.id}`;
      const imgUrl = p.image_url?.startsWith('http') ? p.image_url : `${serverUrl}${p.image_url}`;
      const desc = p.description ? p.description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
      const name = p.name ? p.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
      
      xml += `    <item>
      <g:id>${p.id}</g:id>
      <g:title>${name}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${prodUrl}</g:link>
      <g:image_link>${imgUrl}</g:image_link>
      <g:price>${p.price} INR</g:price>
      <g:condition>new</g:condition>
      <g:availability>${p.stock > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:brand>A2P Cosmetics</g:brand>
      <g:google_product_category>Health &amp; Beauty &gt; Personal Care &gt; Cosmetics</g:google_product_category>
    </item>\n`;
    });

    xml += `  </channel>
</rss>`;

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    res.status(500).send(`<error>${error.message}</error>`);
  }
});

// WhatsApp Alert / Approach Simulation
router.post('/whatsapp/send-notification', async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) return res.status(400).json({ error: 'phone and message are required' });
  try {
    console.log(`[WhatsApp Simulation] Message sent to ${phone}: "${message}"`);
    res.json({
      success: true,
      message: 'Simulated WhatsApp notification sent successfully!',
      details: { phone, message, sent_at: new Date(), provider: 'WhatsApp Business Platform (Simulated)' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Email newsletter subscription
router.post('/email/newsletter-subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    console.log(`[Email Subscription] ${email} subscribed to newsletters.`);
    res.json({
      success: true,
      message: 'Subscribed to newsletters successfully!'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Abandoned cart email simulator
router.post('/email/send-abandoned-cart', async (req, res) => {
  const { email, customerName, cartItems } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    console.log(`[Email Campaign] Sending abandoned cart alert to ${email}...`);
    const itemsList = cartItems ? cartItems.map(item => `${item.name} (Qty: ${item.quantity})`).join(', ') : 'items';
    res.json({
      success: true,
      message: `Abandoned cart email campaign simulated for ${email}!`,
      details: `Hi ${customerName || 'Customer'}, you left some items in your cart: ${itemsList}. Buy now for 10% off!`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Customer Analysis (CRM Module)
router.get('/admin/customer-ai-analysis/:id', async (req, res) => {
  const customerId = req.params.id;
  try {
    const [[customer]] = await db.query('SELECT * FROM customers WHERE id = ?', [customerId]);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const [activities] = await db.query('SELECT * FROM customer_activity WHERE customer_id = ? ORDER BY timestamp DESC', [customerId]);
    const [orders] = await db.query('SELECT * FROM orders WHERE customer_email = ?', [customer.email]);

    const viewCount = activities.filter(a => a.type === 'View' || a.type === 'view_product').length;
    const cartCount = activities.filter(a => a.type === 'Cart' || a.type === 'add_to_cart').length;
    const wishlistCount = activities.filter(a => a.type === 'Wishlist' || a.type === 'add_to_wishlist').length;
    
    const categoryCounts = {};
    activities.forEach(act => {
      if (act.product_name) {
        let category = 'Skincare';
        if (act.product_name.toLowerCase().includes('wash')) category = 'Face Wash';
        else if (act.product_name.toLowerCase().includes('serum')) category = 'Face Serum';
        else if (act.product_name.toLowerCase().includes('cream')) category = 'Face Cream';
        else if (act.product_name.toLowerCase().includes('body')) category = 'Body Wash';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });

    const topCategory = Object.keys(categoryCounts).sort((a,b) => categoryCounts[b] - categoryCounts[a])[0] || 'Skincare';

    let purchaseLikelihood = 'Low';
    let intentScore = 20; 
    
    if (orders.length > 0) intentScore += 30; 
    intentScore += Math.min(20, viewCount * 2);
    intentScore += Math.min(20, wishlistCount * 5);
    intentScore += Math.min(30, cartCount * 10);
    
    if (intentScore > 75) purchaseLikelihood = 'High';
    else if (intentScore > 45) purchaseLikelihood = 'Medium';

    let persona = 'Casual Browser';
    if (orders.length >= 3) {
      persona = 'Brand Loyalist';
    } else if (cartCount > 0 && orders.length === 0) {
      persona = 'Cart Abandoner';
    } else if (wishlistCount > 2) {
      persona = 'Aspirational Shopper';
    } else if (customer.total_spend > 5000) {
      persona = 'Premium Spender';
    }

    let couponSuggestion = 'A2P10 (10% Off)';
    if (persona === 'Cart Abandoner') couponSuggestion = 'SAVE15 (15% Off)';
    else if (persona === 'Brand Loyalist') couponSuggestion = 'LOYAL20 (20% Off)';
    
    const aiAnalysis = {
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      persona,
      intentScore: Math.min(100, intentScore),
      purchaseLikelihood,
      topInterests: [topCategory, 'Hydration', 'Anti-aging'],
      activitySummary: {
        totalViews: viewCount,
        addedToCart: cartCount,
        addedToWishlist: wishlistCount,
        totalOrders: orders.length,
        totalSpend: customer.total_spend
      },
      nextMarketingStep: persona === 'Cart Abandoner' 
        ? 'Send automated discount code via WhatsApp/Email to recover cart.' 
        : 'Recommend new arrivals in the ' + topCategory + ' category.',
      suggestedPromoCode: couponSuggestion,
      analyzedAt: new Date()
    };

    res.json(aiAnalysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Dynamic Sitemap.xml ──────────────────────────────────────────────────────
// Generates a Google-friendly XML sitemap with all static pages + every product
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://a2pcosmetics.com';
    const [products] = await db.query('SELECT id, updated_at FROM products WHERE status = "Active"');

    const staticPages = [
      { url: '/',             priority: '1.0', changefreq: 'daily'   },
      { url: '/new-arrivals', priority: '0.9', changefreq: 'daily'   },
      { url: '/all-products', priority: '0.9', changefreq: 'daily'   },
      { url: '/facewash',     priority: '0.8', changefreq: 'weekly'  },
      { url: '/faceserum',    priority: '0.8', changefreq: 'weekly'  },
      { url: '/facecream',    priority: '0.8', changefreq: 'weekly'  },
      { url: '/bodywash',     priority: '0.8', changefreq: 'weekly'  },
      { url: '/articles',     priority: '0.7', changefreq: 'weekly'  },
      { url: '/contact',      priority: '0.5', changefreq: 'monthly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Static pages
    staticPages.forEach(page => {
      xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>\n`;
    });

    // Dynamic product pages
    products.forEach(p => {
      const lastmod = p.updated_at
        ? new Date(p.updated_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      xml += `  <url>
    <loc>${baseUrl}/product/${p.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
    <lastmod>${lastmod}</lastmod>
  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    res.status(500).send(`<error>${error.message}</error>`);
  }
});

// ─── robots.txt ───────────────────────────────────────────────────────────────
// Tells Google crawler what to index and where the sitemap is
router.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://a2pcosmetics.com';
  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /distributor/
Disallow: /agent/
Disallow: /dealer/
Disallow: /checkout
Disallow: /my-orders
Disallow: /my-addresses

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.status(200).send(robots);
});

module.exports = router;

