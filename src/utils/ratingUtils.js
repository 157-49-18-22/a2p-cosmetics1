export const calculateRatingFromLikes = (likes = 0) => {
  const baseRating = 3.5;
  const ratingIncrement = Math.min((likes / 100) * 1.5, 1.5); // Max 5.0
  let rating = baseRating + ratingIncrement;
  
  // Round to 1 decimal place
  rating = Math.round(rating * 10) / 10;
  
  if (rating > 5.0) rating = 5.0;

  // Let reviews be proportional to likes so it looks realistic
  const reviews = Math.floor(likes * 4.3) + 12; // Base 12 reviews even if 0 likes
  
  return { rating, reviews };
};
