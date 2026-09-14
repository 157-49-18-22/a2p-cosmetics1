const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'a2p_super_secret_key_2024';

const verifyToken = (req, res, next) => {
  const token = req.cookies?.a2p_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired, please login again' });
  }
};

module.exports = { verifyToken, JWT_SECRET };
