const db = require('../db');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

console.log("Razorpay initialized with ID:", process.env.RAZORPAY_KEY_ID?.substring(0, 12) + "...");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { 
      customer_name, 
      customer_email, 
      customer_phone, 
      address, 
      city, 
      state, 
      zip_code, 
      subtotal, 
      discount, 
      total_amount, 
      items 
    } = req.body;

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Start transaction
    const [result] = await db.query(
      `INSERT INTO orders (
        order_number, customer_name, customer_email, customer_phone, 
        address, city, state, zip_code, subtotal, discount, total_amount, 
        payment_status, order_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paid', 'Processing')`,
      [
        orderNumber, customer_name, customer_email, customer_phone, 
        address, city, state, zip_code, subtotal, discount, total_amount
      ]
    );

    const orderId = result.insertId;

    // Insert order items
    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (order_id, product_name, price, quantity, image_url) 
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.name, item.price, item.quantity, item.image_url]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId: orderNumber,
      id: orderId
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

// Create Razorpay Order ID
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    
    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) return res.status(500).send("Some error occured");

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ success: false, message: "Could not create Razorpay order" });
  }
};

// Get all orders (for admin)
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const [order] = await db.query('SELECT * FROM orders WHERE order_number = ?', [req.params.id]);
    if (order.length === 0) return res.status(404).json({ message: 'Order not found' });

    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order[0].id]);
    
    res.json({ ...order[0], items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching order' });
  }
};
