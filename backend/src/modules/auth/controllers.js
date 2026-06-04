import { authService } from './services.js';
import { verifyRefreshToken } from '../../shared/middleware/auth.js';

export const authController = {
  async register(req, res) {
    try {
      const { email, password, first_name, last_name, phone } = req.body;
      if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ error: 'Missing required field registration data' });
      }
      const data = await authService.register({ email, password, first_name, last_name, phone });
      
      // Store refresh token in secure cookie
      res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return res.status(201).json({ user: data.user, token: data.token });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      const data = await authService.login({ email, password });

      res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(200).json({ user: data.user, token: data.token });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async refresh(req, res) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        return res.status(401).json({ error: 'Refresh token is required' });
      }

      const decoded = verifyRefreshToken(token);
      if (!decoded) {
        return res.status(403).json({ error: 'Invalid or expired refresh token' });
      }

      const data = await authService.refresh(decoded.id);
      return res.status(200).json({ token: data.token });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async logout(req, res) {
    res.clearCookie('refreshToken');
    return res.status(204).send();
  }
};
