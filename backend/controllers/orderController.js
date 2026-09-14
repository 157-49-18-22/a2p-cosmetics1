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
      items,
      referral_code,
      referral_agent_id
    } = req.body;

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Insert order with referral info and customer_id
    const [result] = await db.query(
      `INSERT INTO orders (
        order_number, customer_id, customer_name, customer_email, customer_phone, 
        address, city, state, zip_code, subtotal, discount, total_amount, 
        payment_status, order_status, referral_code, referral_agent_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paid', 'Processing', ?, ?)`,
      [
        orderNumber, req.user.id, customer_name, customer_email, customer_phone, 
        address, city, state, zip_code, subtotal, discount, total_amount,
        referral_code || null, referral_agent_id || null
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

    // If referral code used → increment usage_count + auto calculate commission
    if (referral_code && referral_agent_id) {
      // Increment usage count
      await db.query(
        `UPDATE agent_referral_codes SET usage_count = usage_count + 1 WHERE code = ?`,
        [referral_code]
      );

      // Auto-trigger commission calculation for the agent
      try {
        const category = items.length > 0 ? (items[0].category || 'General') : 'General';
        await db.query(
          `INSERT INTO agent_commissions 
           (agent_id, order_id, order_amount, commission_amount, commission_rate, category_name, referral_level, level_number, status, triggered_by)
           SELECT 
             a.id, ?, ?,
             ROUND(? * CAST(REPLACE(r.base_rate, '%', '') AS DECIMAL(5,2)) / 100, 2),
             r.base_rate, ?, 'Level 1 (Sales Rep)', 1, 'Earned', ?
           FROM agents a
           JOIN agent_commission_rules r ON (
             r.status = 'Active'
             AND (r.referral_level = 'Level 1 (Sales Rep)' OR r.referral_level = 'All Levels')
           )
           WHERE a.id = ?
           LIMIT 1`,
          [orderId, total_amount, total_amount, category, referral_agent_id, referral_agent_id]
        );
      } catch (commErr) {
        console.warn('Commission auto-calc skipped (no matching rule?):', commErr.message);
      }
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

// Get all orders (for admin) with items attached
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    if (orders.length === 0) return res.json([]);

    const orderIds = orders.map(o => o.id);
    const [items] = await db.query(
      `SELECT oi.*, p.image_url as fallback_product_image 
       FROM order_items oi 
       LEFT JOIN products p ON p.name = oi.product_name 
       WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    const itemsByOrder = {};
    items.forEach(item => {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push({
        id: item.id,
        order_id: item.order_id,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url || item.fallback_product_image || ''
      });
    });

    const ordersWithItems = orders.map(o => ({
      ...o,
      items: itemsByOrder[o.id] || []
    }));

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ success: false, message: 'Error fetching orders: ' + error.message });
  }
};

// Get my orders
exports.getMyOrders = async (req, res) => {
  try {
    const userEmail = req.user.email || '';
    const userId = req.user.id || 0;
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE customer_id = ? OR (customer_email IS NOT NULL AND customer_email != "" AND customer_email = ?) ORDER BY created_at DESC',
      [userId, userEmail]
    );
    if (orders.length === 0) return res.json([]);

    const orderIds = orders.map(o => o.id);
    const [items] = await db.query(
      `SELECT oi.*, p.image_url as fallback_product_image 
       FROM order_items oi 
       LEFT JOIN products p ON p.name = oi.product_name 
       WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    const itemsByOrder = {};
    items.forEach(item => {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push({
        id: item.id,
        order_id: item.order_id,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url || item.fallback_product_image || ''
      });
    });

    const ordersWithItems = orders.map(o => ({
      ...o,
      items: itemsByOrder[o.id] || []
    }));

    res.json(ordersWithItems);
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

// Cancel order with commission reversal
exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const customerId = req.user.id;

    // Get order details
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ? AND customer_id = ?', [orderId, customerId]);
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found or unauthorized' });
    }

    const order = orders[0];

    // Check if order can be cancelled
    const cancellableStatuses = ['Pending', 'Processing', 'Confirmed', 'Placed'];
    if (!cancellableStatuses.includes(order.order_status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled in current status' });
    }

    // Check if already cancelled
    if (order.order_status === 'Cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled' });
    }

    const previousStatus = order.order_status;

    // Restore inventory if stock was already deducted (before updating status)
    if (['Processing', 'Shipped', 'Delivered'].includes(previousStatus)) {
      const [orderItems] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
      
      for (const item of orderItems) {
        // Get product details to find distributor
        const [products] = await db.query('SELECT * FROM products WHERE name = ?', [item.product_name]);
        if (products.length > 0) {
          const product = products[0];
          
          // Restore stock in distributor inventory (assuming distributor_id = 1 for now, should be from order)
          await db.query(
            'UPDATE distributor_inventory SET stock_quantity = stock_quantity + ?, stock = stock + ? WHERE product_id = ? AND distributor_id = ?',
            [item.quantity, item.quantity, product.id, 1]
          );
          
          console.log(`Restored ${item.quantity} units of ${item.product_name} to distributor inventory`);
        }
      }
    }

    // Update order status to Cancelled
    await db.query('UPDATE orders SET order_status = ? WHERE id = ?', ['Cancelled', orderId]);

    // Reverse commissions associated with this order
    const [commissions] = await db.query(
      'SELECT * FROM agent_commissions WHERE order_id = ? AND status = ?',
      [orderId, 'Earned']
    );

    if (commissions.length > 0) {
      console.log(`Reversing ${commissions.length} commissions for order ${orderId}`);
      
      for (const commission of commissions) {
        // Update commission status to Reversed
        await db.query(
          'UPDATE agent_commissions SET status = ?, reversal_reason = ?, reversal_date = NOW() WHERE id = ?',
          ['Reversed', 'Order cancelled by customer', commission.id]
        );

        // Decrement referral code usage count if applicable
        if (order.referral_code) {
          await db.query(
            'UPDATE agent_referral_codes SET usage_count = GREATEST(usage_count - 1, 0) WHERE code = ?',
            [order.referral_code]
          );
        }

        console.log(`Commission ${commission.id} reversed for agent ${commission.agent_id}`);
      }
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      commissionsReversed: commissions.length
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};

// Update order status with inventory management
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Get current order details
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];
    const previousStatus = order.order_status;

    // Check if status is actually changing
    if (previousStatus === status) {
      return res.status(400).json({ error: 'Order is already in this status' });
    }

    // Valid status transitions
    const validTransitions = {
      'Pending': ['Processing', 'Confirmed', 'Cancelled'],
      'Processing': ['Shipped', 'Cancelled'],
      'Shipped': ['Delivered', 'Cancelled'],
      'Delivered': [],
      'Cancelled': []
    };

    if (!validTransitions[previousStatus]?.includes(status)) {
      return res.status(400).json({ error: `Invalid status transition from ${previousStatus} to ${status}` });
    }

    // Update order status
    await db.query('UPDATE orders SET order_status = ? WHERE id = ?', [status, orderId]);

    // Inventory management: deduct stock when moving from Pending to Processing/Shipped/Delivered
    if (previousStatus === 'Pending' && ['Processing', 'Shipped', 'Delivered'].includes(status)) {
      const [orderItems] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
      
      for (const item of orderItems) {
        // Get product details
        const [products] = await db.query('SELECT * FROM products WHERE name = ?', [item.product_name]);
        if (products.length > 0) {
          const product = products[0];
          
          // Check if distributor has enough stock
          const [inventory] = await db.query(
            'SELECT * FROM distributor_inventory WHERE product_id = ? AND distributor_id = ?',
            [product.id, 1]
          );

          if (inventory.length > 0) {
            const currentStock = inventory[0].stock_quantity;
            if (currentStock < item.quantity) {
              return res.status(400).json({ 
                error: `Insufficient stock for ${item.product_name}. Available: ${currentStock}, Required: ${item.quantity}` 
              });
            }

            // Deduct stock
            await db.query(
              'UPDATE distributor_inventory SET stock_quantity = GREATEST(0, stock_quantity - ?), stock = GREATEST(0, stock - ?) WHERE product_id = ? AND distributor_id = ?',
              [item.quantity, item.quantity, product.id, 1]
            );
            
            console.log(`Deducted ${item.quantity} units of ${item.product_name} from distributor inventory`);
          } else {
            return res.status(400).json({ error: `Product ${item.product_name} not found in distributor inventory` });
          }
        }
      }
    }

    res.json({
      success: true,
      message: `Order status updated from ${previousStatus} to ${status}`,
      previousStatus,
      newStatus: status
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};
