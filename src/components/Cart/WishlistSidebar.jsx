import React from 'react';
import { X, Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import './WishlistSidebar.css';

const WishlistSidebar = () => {
  const { 
    wishlistItems, 
    isWishlistOpen, 
    setIsWishlistOpen, 
    removeFromWishlist 
  } = useWishlist();

  const { addToCart } = useCart();

  const handleMoveToCart = (item) => {
    addToCart(item);
    removeFromWishlist(item.id);
  };

  if (!isWishlistOpen) return null;

  return (
    <div className={`wishlist-overlay ${isWishlistOpen ? 'active' : ''}`} onClick={() => setIsWishlistOpen(false)}>
      <div className="wishlist-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="wishlist-header">
          <div className="wishlist-title">
            <Heart size={24} fill="#ff4d6d" color="#ff4d6d" />
            <h2>Your Favorites <span>({wishlistItems.length})</span></h2>
          </div>
          <button className="close-wishlist" onClick={() => setIsWishlistOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="wishlist-content">
          {wishlistItems.length === 0 ? (
            <div className="empty-wishlist-premium">
              <div className="empty-wishlist-header">
                <h1>FAVORITES</h1>
                <div className="empty-divider"></div>
              </div>
              
              <div className="empty-wishlist-content">
                <div className="empty-message-wrap">
                  <h2>Nothing saved yet?</h2>
                  <h2 className="sad-text">That's lonely.</h2>
                </div>
              </div>

              <button className="start-exploring-btn" onClick={() => setIsWishlistOpen(false)}>
                BROWSE PRODUCTS <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="wishlist-items-list">
              {wishlistItems.map((item) => (
                <div key={item.id} className="wishlist-item">
                  <div className="wishlist-img">
                    <img src={item.image_url} alt={item.name} />
                  </div>
                  <div className="wishlist-details">
                    <div className="item-name-row">
                      <h4>{item.name}</h4>
                      <button className="remove-wishlist-item" onClick={() => removeFromWishlist(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="wishlist-price">Rs. {item.price}</div>
                    <div className="wishlist-actions">
                      <button className="move-to-cart-btn" onClick={() => handleMoveToCart(item)}>
                        <ShoppingBag size={14} /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistSidebar;
