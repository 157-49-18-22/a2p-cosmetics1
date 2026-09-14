-- Create product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  customer_id VARCHAR(255),
  user_name VARCHAR(255) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_rating (rating)
);

-- Add rating and review_count columns to products table if they don't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,1) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0;