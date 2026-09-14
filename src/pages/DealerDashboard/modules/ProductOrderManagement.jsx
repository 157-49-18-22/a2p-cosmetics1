import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, Search, Plus, Minus, Trash2, Box, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import API_BASE_URL from '../../../apiConfig.js';
import { useAuth } from '../../../context/AuthContext';

const API = API_BASE_URL;

const ProductOrderManagement = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [assignedProducts, setAssignedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [ordersList, setOrdersList] = useState([]);
  
  // New Order Form States
  const [requiredDate, setRequiredDate] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const localDealer = JSON.parse(localStorage.getItem('active_dealer') || '{}');
  const dealer = user || localDealer;
  const dealerZone = dealer?.zone || 'Zone A';
  const distributorId = dealer?.distributor_id || 1;
  const dealerId = dealer?.id || 1;

  useEffect(() => {
    fetchZoneProducts();
    fetchMyOrders();
    const interval = setInterval(fetchMyOrders, 5000);
    return () => clearInterval(interval);
  }, [dealerZone, distributorId, dealerId]);

  const fetchMyOrders = async () => {
    try {
      const currentDealerId = dealerId || 1;
      const res = await fetch(`${API}/dealers/${currentDealerId}/orders`);
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map(o => ({
          id: o.order_number,
          date: new Date(o.created_at).toLocaleDateString('en-IN'),
          required_by: o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : 'Asap',
          items: o.total_items,
          total: `₹${parseFloat(o.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          status: o.status
        }));
        setOrdersList(formatted);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const res = await fetch(`${API}/dealers/orders-details/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrderDetails({ id: orderId, items: data });
        setShowDetailsModal(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchZoneProducts = async () => {
    try {
      setLoading(true);
      const currentDistId = distributorId || 1;
      const res = await fetch(`${API}/distributors/${currentDistId}/inventory`);
      if (res.ok) {
        const data = await res.json();
        const prods = data.products || (Array.isArray(data) ? data : []);
        const transformedProducts = prods.map(product => {
          const stockCount = parseInt(product.stock) || 0;
          return {
            id: product.id || `PRD-${product.id}`,
            name: product.name || product.product_name,
            category: product.category || product.product_category || 'General',
            stock: stockCount,
            price: product.price ? `₹${parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0',
            rawPrice: parseFloat(product.price) || 0,
            status: stockCount > 10 ? 'In Stock' : stockCount > 0 ? 'Low Stock' : 'Out of Stock'
          };
        });
        setAssignedProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = assignedProducts.filter(prod => 
    prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = ordersList.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      alert(`⚠️ "${product.name}" is currently Out of Stock with your distributor.`);
      return;
    }
    const existing = cart.find(item => item.id === product.id);
    const currentInCart = existing ? existing.quantity : 0;
    if (currentInCart + 1 > product.stock) {
      alert(`⚠️ Cannot add more than available distributor stock (${product.stock} units).`);
      return;
    }

    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    alert(`✅ ${product.name} (1 unit) added to order cart!`);
  };

  const updateCartQty = (productId, newQty) => {
    const prod = assignedProducts.find(p => p.id === productId);
    const maxStock = prod ? prod.stock : 999;

    if (newQty <= 0) {
      setCart(cart.filter(item => item.id !== productId));
      return;
    }

    if (newQty > maxStock) {
      alert(`⚠️ Cannot exceed distributor available stock of ${maxStock} units.`);
      return;
    }

    setCart(cart.map(item => item.id === productId ? { ...item, quantity: newQty } : item));
  };

  const handlePlaceOrder = () => {
    setIsOrderModalOpen(true);
  };

  const confirmOrder = async () => {
    if (cart.length === 0) return;
    
    // Stock validation check before submitting
    for (const item of cart) {
      const liveProd = assignedProducts.find(p => p.id === item.id);
      const maxAllowed = liveProd ? liveProd.stock : item.stock;
      if (item.quantity > maxAllowed) {
        alert(`⚠️ Order quantity for "${item.name}" (${item.quantity}) exceeds available distributor stock (${maxAllowed} units). Please reduce quantity.`);
        return;
      }
    }

    let totalValue = 0;
    cart.forEach(item => {
      const priceVal = parseFloat(String(item.price || '0').replace(/[^0-9.]/g, ''));
      totalValue += priceVal * item.quantity;
    });

    try {
      const res = await fetch(`${API}/dealers/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealer_id: dealerId || 1,
          distributor_id: distributorId || 1,
          total_amount: totalValue,
          required_by: requiredDate || 'Asap',
          items: cart.map(i => ({ id: String(i.id).replace('PRD-', ''), name: i.name, quantity: i.quantity, price: i.price }))
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchMyOrders();
        await fetchZoneProducts();
        setCart([]);
        setRequiredDate('');
        setIsOrderModalOpen(false);
        setActiveTab('orders');
        alert(`✅ Order ${data.order_number} placed successfully to your distributor!`);
      } else {
        alert(data.error || 'Failed to place order.');
      }
    } catch (e) {
      alert('Error placing order: ' + e.message);
    }
  };

  return (
    <div className="dl-enter">
      <div className="dl-module-header">
        <div className="dl-header-info">
          <h2 className="dl-module-title">Product & Order Management</h2>
          <p className="dl-module-subtitle">View assigned products and manage your orders</p>
        </div>
        <div className="dl-header-btns">
          <button className="dl-btn dl-btn-primary" onClick={handlePlaceOrder}>
            <Plus size={16} /> Place New Order
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button 
          className={`dl-btn ${activeTab === 'products' ? 'dl-btn-primary' : 'dl-btn-outline'}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={16} /> Assigned Products
        </button>
        <button 
          className={`dl-btn ${activeTab === 'orders' ? 'dl-btn-primary' : 'dl-btn-outline'}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingCart size={16} /> My Orders
        </button>
      </div>

      {/* Search */}
      <div className="dl-search-inline" style={{ marginBottom: '20px', maxWidth: '400px' }}>
        <Search size={14} />
        <input 
          type="text" 
          placeholder={activeTab === 'products' ? 'Search products...' : 'Search orders...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {activeTab === 'products' ? (
        <>
          {/* Products Stats */}
          <div className="dl-stats-grid">
            <div className="dl-stat-card">
              <div className="dl-stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <Box size={20} />
              </div>
              <div className="dl-stat-value">{assignedProducts.length}</div>
              <div className="dl-stat-label">Total Products</div>
            </div>
            <div className="dl-stat-card">
              <div className="dl-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
                <CheckCircle size={20} />
              </div>
              <div className="dl-stat-value">{assignedProducts.filter(p => p.status === 'In Stock').length}</div>
              <div className="dl-stat-label">In Stock</div>
            </div>
            <div className="dl-stat-card">
              <div className="dl-stat-icon" style={{ background: '#fef9c3', color: '#ca8a04' }}>
                <AlertCircle size={20} />
              </div>
              <div className="dl-stat-value">{assignedProducts.filter(p => p.status === 'Low Stock').length}</div>
              <div className="dl-stat-label">Low Stock</div>
            </div>
            <div className="dl-stat-card">
              <div className="dl-stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                <Clock size={20} />
              </div>
              <div className="dl-stat-value">{assignedProducts.filter(p => p.status === 'Out of Stock').length}</div>
              <div className="dl-stat-label">Out of Stock</div>
            </div>
          </div>

          {/* Products Table */}
          <div className="dl-card">
            <div className="dl-card-header">
              <h3 className="dl-card-title">Products Available to Order</h3>
            </div>
            <div className="dl-card-body">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <p>Loading products from your distributor...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <Package size={48} style={{ marginBottom: '16px', color: '#cbd5e1' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>No Products Available</h3>
                  <p style={{ fontSize: '0.9rem' }}>
                    Your distributor currently has no products listed.
                  </p>
                </div>
              ) : (
                <div className="dl-table-wrap">
                  <table className="dl-table">
                    <thead>
                      <tr>
                        <th>Product ID</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: '600' }}>{product.id}</td>
                          <td>{product.name}</td>
                          <td>{product.category}</td>
                          <td style={{ fontWeight: '600' }}>{product.price}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 700, color: product.stock > 10 ? '#16a34a' : product.stock > 0 ? '#d97706' : '#dc2626' }}>
                                {product.stock}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>units available</span>
                            </div>
                          </td>
                          <td>
                            <span className={`dl-badge ${
                              product.status === 'In Stock' ? 'dl-badge-green' : 
                              product.status === 'Low Stock' ? 'dl-badge-yellow' : 'dl-badge-red'
                            }`}>
                              {product.status}
                            </span>
                          </td>
                          <td>
                            <button 
                              className={`dl-btn ${product.stock > 0 ? 'dl-btn-primary' : 'dl-btn-outline'}`}
                              style={{ 
                                padding: '6px 12px', 
                                fontSize: '0.75rem', 
                                opacity: product.stock <= 0 ? 0.5 : 1,
                                cursor: product.stock <= 0 ? 'not-allowed' : 'pointer'
                              }}
                              disabled={product.stock <= 0}
                              onClick={() => handleAddToCart(product)}
                              title={product.stock <= 0 ? 'Out of Stock' : 'Add to Order'}
                            >
                              {product.stock <= 0 ? 'Out of Stock' : 'Add to Order'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Orders Stats */}
          <div className="dl-stats-grid">
            <div className="dl-stat-card">
              <div className="dl-stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <ShoppingCart size={20} />
              </div>
              <div className="dl-stat-value">{ordersList.length}</div>
              <div className="dl-stat-label">Total Orders</div>
            </div>
            <div className="dl-stat-card">
              <div className="dl-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
                <Clock size={20} />
              </div>
              <div className="dl-stat-value">{ordersList.filter(o => o.status === 'Processing' || o.status === 'Shipped').length}</div>
              <div className="dl-stat-label">In Progress</div>
            </div>
            <div className="dl-stat-card">
              <div className="dl-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                <CheckCircle size={20} />
              </div>
              <div className="dl-stat-value">{ordersList.filter(o => o.status === 'Delivered').length}</div>
              <div className="dl-stat-label">Delivered</div>
            </div>
            <div className="dl-stat-card">
              <div className="dl-stat-icon" style={{ background: '#fef9c3', color: '#ca8a04' }}>
                <AlertCircle size={20} />
              </div>
              <div className="dl-stat-value">{ordersList.filter(o => o.status === 'Pending').length}</div>
              <div className="dl-stat-label">Pending</div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="dl-card">
            <div className="dl-card-header">
              <h3 className="dl-card-title">My Orders</h3>
            </div>
            <div className="dl-card-body">
              <div className="dl-table-wrap">
                <table className="dl-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Order Date</th>
                      <th>Required By</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                          No orders placed yet.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: '600' }}>{order.id}</td>
                          <td>{order.date}</td>
                          <td style={{ color: '#059669', fontWeight: '500' }}>{order.required_by}</td>
                          <td>{order.items} items</td>
                          <td style={{ fontWeight: '600' }}>{order.total}</td>
                        <td>
                          <span className={`dl-badge ${
                            order.status === 'Delivered' ? 'dl-badge-green' : 
                            order.status === 'Shipped' ? 'dl-badge-blue' :
                            order.status === 'Processing' ? 'dl-badge-indigo' : 'dl-badge-yellow'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="dl-btn dl-btn-outline" 
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            onClick={() => handleViewDetails(order.id)}
                          >
                            View Details
                          </button>
                        </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Checkout Modal */}
      {isOrderModalOpen && (() => {
        const activeSelectedProd = assignedProducts.find(p => String(p.id) === String(selectedProductId));
        const inCartForSelected = activeSelectedProd ? (cart.find(i => i.id === activeSelectedProd.id)?.quantity || 0) : 0;
        const remainingStock = activeSelectedProd ? Math.max(0, activeSelectedProd.stock - inCartForSelected) : 0;

        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', width: '92%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Place New Order</h2>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Order stock directly from your assigned distributor</p>
                </div>
                <button 
                  onClick={() => setIsOrderModalOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8', fontWeight: 'bold' }}
                >
                  ✕
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>Required By Date</label>
                  <input 
                    type="date" 
                    value={requiredDate} 
                    onChange={(e) => setRequiredDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>Select Product</label>
                    <select 
                      value={selectedProductId} 
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        setOrderQuantity(1);
                      }}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                      <option value="">-- Choose a Product --</option>
                      {assignedProducts.map(p => {
                        const inCart = cart.find(i => i.id === p.id)?.quantity || 0;
                        return (
                          <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                            {p.name} ({p.price}) — Stock: {p.stock} units {p.stock <= 0 ? '(Out of Stock)' : inCart > 0 ? `[${inCart} in cart]` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div style={{ width: '110px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>Quantity</label>
                    <input 
                      type="number" 
                      min="1" 
                      max={remainingStock > 0 ? remainingStock : 1}
                      value={orderQuantity} 
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '') {
                          setOrderQuantity('');
                          return;
                        }
                        const val = parseInt(raw, 10);
                        if (isNaN(val)) return;
                        if (remainingStock > 0 && val > remainingStock) {
                          setOrderQuantity(remainingStock);
                        } else {
                          setOrderQuantity(val);
                        }
                      }}
                      onBlur={() => {
                        if (!orderQuantity || parseInt(orderQuantity, 10) < 1) {
                          setOrderQuantity(1);
                        }
                      }}
                      disabled={!activeSelectedProd || remainingStock <= 0}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                  <button 
                    className="dl-btn dl-btn-primary" 
                    disabled={!activeSelectedProd || remainingStock <= 0 || (orderQuantity !== '' && parseInt(orderQuantity, 10) < 1)}
                    onClick={() => {
                      if (!activeSelectedProd) return;
                      const qtyToAdd = parseInt(orderQuantity, 10) || 1;
                      if (activeSelectedProd.stock <= 0) {
                        alert(`⚠️ "${activeSelectedProd.name}" is out of stock.`);
                        return;
                      }
                      if (qtyToAdd > remainingStock) {
                        alert(`⚠️ You can only add up to ${remainingStock} units of this item based on distributor stock.`);
                        return;
                      }
                      const existing = cart.find(item => item.id === activeSelectedProd.id);
                      if (existing) {
                        setCart(cart.map(item => item.id === activeSelectedProd.id ? { ...item, quantity: item.quantity + qtyToAdd } : item));
                      } else {
                        setCart([...cart, { ...activeSelectedProd, quantity: qtyToAdd }]);
                      }
                      setSelectedProductId('');
                      setOrderQuantity(1);
                    }}
                    style={{ height: '42px', padding: '0 16px', opacity: (!activeSelectedProd || remainingStock <= 0) ? 0.5 : 1 }}
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>

                {/* Stock Feedback Helper Box */}
                {activeSelectedProd && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: activeSelectedProd.stock <= 0 ? '#fee2e2' : remainingStock <= 0 ? '#fef3c7' : '#ecfdf5',
                    border: `1px solid ${activeSelectedProd.stock <= 0 ? '#fca5a5' : remainingStock <= 0 ? '#fde68a' : '#a7f3d0'}`,
                    color: activeSelectedProd.stock <= 0 ? '#b91c1c' : remainingStock <= 0 ? '#b45309' : '#047857',
                    fontWeight: 600
                  }}>
                    <span>
                      {activeSelectedProd.stock <= 0 
                        ? '❌ Out of stock with distributor' 
                        : `📦 Distributor Stock: ${activeSelectedProd.stock} units`}
                    </span>
                    <span>
                      {activeSelectedProd.stock > 0 && (
                        remainingStock > 0 
                          ? `Max orderable: ${remainingStock} units` 
                          : `⚠️ All ${activeSelectedProd.stock} units added to cart`
                      )}
                    </span>
                  </div>
                )}
              </div>

              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid #e2e8f0', color: '#1e293b' }}>
                Items in Order ({cart.reduce((s, i) => s + i.quantity, 0)} Total Units)
              </h3>
              
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No items added yet. Choose a product and quantity above.
                </div>
              ) : (
                <div style={{ marginBottom: '20px' }}>
                  {cart.map((item, idx) => {
                    const prod = assignedProducts.find(p => p.id === item.id);
                    const maxStock = prod ? prod.stock : item.stock;
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{item.name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                            <span>{item.price} each</span>
                            <span style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, fontWeight: 600, color: '#475569', fontSize: '0.72rem' }}>
                              Distributor Stock: {maxStock}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {/* Quantity Changer */}
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 6, overflow: 'hidden', background: '#fff' }}>
                            <button 
                              onClick={() => updateCartQty(item.id, item.quantity - 1)}
                              style={{ border: 'none', background: '#f8fafc', padding: '4px 8px', cursor: 'pointer', color: '#475569' }}
                              title="Decrease"
                            >
                              <Minus size={12} />
                            </button>
                            <span style={{ padding: '0 8px', fontSize: '0.82rem', fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                            <button 
                              onClick={() => updateCartQty(item.id, item.quantity + 1)}
                              disabled={item.quantity >= maxStock}
                              style={{ border: 'none', background: item.quantity >= maxStock ? '#f1f5f9' : '#f8fafc', padding: '4px 8px', cursor: item.quantity >= maxStock ? 'not-allowed' : 'pointer', opacity: item.quantity >= maxStock ? 0.3 : 1, color: '#475569' }}
                              title={item.quantity >= maxStock ? 'Max stock reached' : 'Increase'}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <div style={{ fontWeight: '800', color: '#059669', minWidth: 80, textAlign: 'right', fontSize: '0.88rem' }}>
                            ₹{(parseFloat(String(item.price || '0').replace(/[^0-9.]/g, '')) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>

                          <button 
                            onClick={() => updateCartQty(item.id, 0)}
                            style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0 0', marginTop: '6px', fontWeight: '800', fontSize: '1.05rem', color: '#0f172a' }}>
                    <span>Total Order Amount</span>
                    <span style={{ color: '#059669' }}>
                      ₹{cart.reduce((total, item) => total + (parseFloat(String(item.price || '0').replace(/[^0-9.]/g, '')) * item.quantity), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  className="dl-btn" 
                  style={{ background: '#f1f5f9', color: '#475569', border: 'none' }}
                  onClick={() => setIsOrderModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="dl-btn dl-btn-primary" 
                  onClick={confirmOrder}
                  disabled={cart.length === 0}
                  style={{ opacity: cart.length === 0 ? 0.6 : 1 }}
                >
                  Confirm & Place Order
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {showDetailsModal && selectedOrderDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px' }}>Order Details: {selectedOrderDetails.id}</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
              {selectedOrderDetails.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <div>
                    <div style={{ fontWeight: '600' }}>{item.product_name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Qty: {item.quantity} x ₹{item.price}</div>
                  </div>
                  <div style={{ fontWeight: '700', color: '#059669' }}>₹{(item.quantity * item.price).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="dl-btn dl-btn-primary" onClick={() => { setShowDetailsModal(false); setSelectedOrderDetails(null); }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductOrderManagement;
