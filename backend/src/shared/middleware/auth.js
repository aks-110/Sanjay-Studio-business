import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'antigravity_master_key_super_secret_12345';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'antigravity_refresh_master_key_54321';

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: JSON.parse(user.permissions || '[]')
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired access token' });
    }
    req.user = decoded;
    next();
  });
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    return null;
  }
};
