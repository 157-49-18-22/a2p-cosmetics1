import React from 'react';
import './Profile.css';
import { ShoppingBag, X, Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

const SavedItems = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const formatPrice = (price) => {
    const num = typeof price === 'string'
      ? parseFloat(price.replace(/[^\d.]/g, ''))
      : Number(price);
    if (Number.isNaN(num)) return `₹${price}`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const handleAddToBag = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image_url || item.image,
      image_url: item.image_url || item.image,
    });
  };

  return (
    <div className="profile-page-container">
      <div className="profile-header">
        <h1>Wishlist</h1>
        <p>
          {wishlistItems.length === 0
            ? 'Products you heart will show up here.'
            : `${wishlistItems.length} item${wishlistItems.length === 1 ? '' : 's'} saved in your wishlist.`}
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="wishlist-empty-state" style={{
          textAlign: 'center',
          padding: '64px 24px',
          background: '#fff',
          borderRadius: '16px',
          border: '1px dashed #e5e7eb'
        }}>
          <Heart size={40} color="#ff4d6d" style={{ marginBottom: 16 }} />
          <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>Your wishlist is empty</h3>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>Browse products and tap the heart to save them here.</p>
          <Link to="/" className="add-to-cart-btn" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="saved-items-grid">
          {wishlistItems.map((item) => (
            <div key={item.id} className="saved-item-card">
              <button
                className="remove-item-btn"
                aria-label="Remove from wishlist"
                onClick={() => removeFromWishlist(item.id)}
              >
                <X size={16} />
              </button>
              <div className="item-image">
                <img
                  src={item.image_url || item.image || 'https://via.placeholder.com/200'}
                  alt={item.name}
                />
              </div>
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="price">{formatPrice(item.price)}</p>
                <div className="stock-status in-stock">In Stock</div>
              </div>
              <button className="add-to-cart-btn" onClick={() => handleAddToBag(item)}>
                <ShoppingBag size={18} /> Add to Bag
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedItems;
