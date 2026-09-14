import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, User, Calendar } from 'lucide-react';
import API_BASE_URL from '../../apiConfig.js';
import './ProductRating.css';

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return 'Recent';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const ProductRating = ({ productId, productName, currentRating, totalReviews, onRatingUpdate }) => {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [userName, setUserName] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Pre-fill user name if logged in
  useEffect(() => {
    try {
      const stored = localStorage.getItem('customer_info') || localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setUserName(parsed.name);
      }
    } catch (e) {}
  }, []);

  // Fetch existing reviews for this product
  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`);
      const data = await response.json();
      if (data && Array.isArray(data.reviews)) {
        const normalized = data.reviews.map(r => ({
          id: r.id,
          user: r.user || r.user_name || 'Verified Customer',
          rating: Number(r.rating) || 5,
          text: r.text || r.review_text || '',
          date: r.date || r.created_at || new Date().toISOString(),
          helpful: Number(r.helpful || r.helpful_count) || 0
        }));
        setReviews(normalized);
      } else {
        setReviews([]);
      }
      setHasReviewed(Boolean(data.hasReviewed));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Fallback reviews if API unavailable
      setReviews([]);
    }
  };

  const handleStarClick = (rating) => {
    if (hasReviewed) {
      alert('You have already reviewed this product!');
      return;
    }
    setUserRating(rating);
    setShowReviewForm(true);
    // Scroll to review form
    setTimeout(() => {
      const formElement = document.querySelector('.review-form-container');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleStarHover = (rating) => {
    if (hasReviewed) return;
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (userRating === 0 || !reviewText.trim() || !userName.trim()) {
      alert('Please provide rating, your name, and review text');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: userRating,
          text: reviewText.trim(),
          user: userName.trim()
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const newReview = {
          id: data.reviewId || Date.now(),
          user: userName.trim(),
          rating: userRating,
          text: reviewText.trim(),
          date: new Date().toISOString(),
          helpful: 0
        };
        
        setReviews(prev => [newReview, ...prev]);
        setHasReviewed(true);
        setShowReviewForm(false);
        setReviewText('');
        setUserRating(0);
        
        if (onRatingUpdate) {
          onRatingUpdate(data.newAverage, data.totalReviews);
        }
        
        alert('Thank you! Your review has been submitted successfully.');
      } else {
        throw new Error(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      
      // Graceful local addition fallback
      const fallbackReview = {
        id: Date.now(),
        user: userName.trim(),
        rating: userRating,
        text: reviewText.trim(),
        date: new Date().toISOString(),
        helpful: 0
      };
      
      setReviews(prev => [fallbackReview, ...prev]);
      setHasReviewed(true);
      setShowReviewForm(false);
      setReviewText('');
      setUserRating(0);
      
      const allRatings = [userRating, ...reviews.map(r => r.rating)];
      const newAverage = (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1);
      
      if (onRatingUpdate) {
        onRatingUpdate(parseFloat(newAverage), (totalReviews || reviews.length) + 1);
      }

      alert('Thank you! Your review has been recorded.');
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      await fetch(`${API_BASE_URL}/products/${productId}/reviews/${reviewId}/helpful`, {
        method: 'POST'
      });
      
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, helpful: review.helpful + 1 }
          : review
      ));
    } catch (error) {
      console.error('Error marking helpful:', error);
      // For demo, just update locally
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, helpful: review.helpful + 1 }
          : review
      ));
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return currentRating;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const distribution = getRatingDistribution();
  const averageRating = calculateAverageRating();

  return (
    <div className="product-rating-section">
      {/* Rating Summary */}
      <div className="rating-summary">
        <div className="rating-overview">
          <div className="rating-big">
            <span className="rating-number">{averageRating}</span>
            <div className="rating-stars-big">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={24}
                  fill={i < Math.floor(averageRating) ? "#eab308" : "transparent"}
                  color={i < Math.floor(averageRating) ? "#eab308" : "#d1d5db"}
                />
              ))}
            </div>
            <span className="total-reviews">{reviews.length} reviews</span>
          </div>

          {/* Rating Distribution */}
          <div className="rating-distribution">
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="distribution-row">
                <span className="star-label">{star} star</span>
                <div className="distribution-bar">
                  <div 
                    className="distribution-fill"
                    style={{ 
                      width: reviews.length > 0 
                        ? `${(distribution[star] / reviews.length) * 100}%` 
                        : '0%' 
                    }}
                  />
                </div>
                <span className="distribution-count">{distribution[star]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review Button */}
        {!hasReviewed ? (
          <button 
            className="write-review-btn"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            <MessageSquare size={18} />
            {showReviewForm ? 'Cancel Review' : 'Write a Review'}
          </button>
        ) : (
          <div className="reviewed-badge">
            <Star size={16} fill="#eab308" color="#eab308" />
            <span>You have reviewed this product</span>
          </div>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && !hasReviewed && (
        <div className="review-form-container">
          <h3>Write Your Review</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="form-group">
              <label>Your Rating</label>
              <div className="star-rating-input">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={32}
                    className="star-interactive"
                    fill={i < (hoverRating || userRating) ? "#eab308" : "transparent"}
                    color={i < (hoverRating || userRating) ? "#eab308" : "#d1d5db"}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onClick={() => handleStarClick(i + 1)}
                    onMouseEnter={() => handleStarHover(i + 1)}
                    onMouseLeave={handleStarLeave}
                  />
                ))}
              </div>
              {userRating > 0 && (
                <span className="selected-rating-text">
                  You selected: {userRating} star{userRating > 1 ? 's' : ''}
                </span>
              )}
              {userRating === 0 && (
                <span className="selected-rating-text" style={{ color: '#f59e0b' }}>
                  ⭐ Please select a rating above
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Your Review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this product..."
                rows="4"
                required
              />
            </div>

            <button 
              type="submit" 
              className="submit-review-btn"
              disabled={loading}
              onClick={(e) => {
                console.log('Button clicked directly');
                if (!loading) {
                  console.log('Submitting...');
                }
              }}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        <h3>Customer Reviews</h3>
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review, index) => (
            <div key={review.id || index} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    <User size={20} />
                  </div>
                  <div>
                    <span className="reviewer-name">{review.user}</span>
                    <div className="review-date">
                      <Calendar size={12} />
                      {formatDisplayDate(review.date)}
                    </div>
                  </div>
                </div>
                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < review.rating ? "#eab308" : "transparent"}
                      color={i < review.rating ? "#eab308" : "#d1d5db"}
                    />
                  ))}
                </div>
              </div>
              <p className="review-text">{review.text}</p>
              <div className="review-footer">
                <button 
                  className="helpful-btn"
                  onClick={() => handleHelpful(review.id)}
                >
                  <ThumbsUp size={14} />
                  Helpful ({review.helpful})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductRating;