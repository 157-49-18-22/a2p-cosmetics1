const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Route Imports
const agentRoutes = require('./routes/agentRoutes');
const distributorRoutes = require('./routes/distributorRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const generalRoutes = require('./routes/generalRoutes');
const customerRoutes = require('./routes/customerRoutes');
const supportRoutes = require('./routes/supportRoutes');
const orderRoutes = require('./routes/orderRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/orders', orderRoutes);

app.use('/api', cmsRoutes);
app.use('/api', generalRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
