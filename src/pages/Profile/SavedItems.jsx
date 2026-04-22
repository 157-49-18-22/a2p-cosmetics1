import React from 'react';
import './Profile.css';
import { ShoppingBag, X } from 'lucide-react';

const SavedItems = () => {
  const items = [
    { id: 1, name: 'Vitamin C Face Serum', price: '₹899', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200', inStock: true },
    { id: 2, name: 'Hyaluronic Acid Moisturizer', price: '₹1,250', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200', inStock: false },
    { id: 3, name: 'Charcoal Face Wash', price: '₹450', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200', inStock: true },
  ];

  return (
    <div className="profile-page-container">
      <div className="profile-header">
        <h1>Saved Items</h1>
        <p>Products you've saved to buy later.</p>
      </div>

      <div className="saved-items-grid">
        {items.map((item) => (
          <div key={item.id} className="saved-item-card">
            <button className="remove-item-btn"><X size={16} /></button>
            <div className="item-image">
              <img src={item.image} alt={item.name} />
            </div>
            <div className="item-info">
              <h3>{item.name}</h3>
              <p className="price">{item.price}</p>
              <div className={`stock-status ${item.inStock ? 'in-stock' : 'out-of-stock'}`}>
                {item.inStock ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>
            <button className="add-to-cart-btn" disabled={!item.inStock}>
              <ShoppingBag size={18} /> Add to Bag
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedItems;
