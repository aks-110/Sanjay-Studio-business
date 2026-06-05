import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../users/UserRepository.js';
import { generateAccessToken, generateRefreshToken } from '../../shared/middleware/auth.js';
import appEvents from '../../shared/events/index.js';

export const authService = {
  async register({ email, password, first_name, last_name, phone }) {
    const existing = await UserRepository.getByEmail(email);
    if (existing) {
      throw new Error('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash(password, salt);
    const id = uuidv4();
    const defaultPermissions = [
      'products:read',
      'gallery:read',
      'bookings:create',
      'bookings:read-own',
      'rentals:create',
      'rentals:read-own',
      'orders:create',
      'orders:read-own'
    ];

    const user = await UserRepository.create({
      id,
      email,
      password_hash: passHash,
      first_name,
      last_name,
      phone,
      role: 'Customer',
      permissions: defaultPermissions
    });

    // Publish user.registered event
    appEvents.publish('user.registered', { user });

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return { user, token, refreshToken };
  },

  async login({ email, password }) {
    const user = await UserRepository.getByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw new Error('Invalid email or password');
    }

    const userSafe = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      permissions: user.permissions
    };

    const token = generateAccessToken(userSafe);
    const refreshToken = generateRefreshToken(userSafe);

    // Event: log login activity
    appEvents.publish('activity.logged', {
      userId: user.id,
      action: 'auth.login',
      details: { email }
    });

    return { user: userSafe, token, refreshToken };
  },

  async refresh(userId) {
    const user = await UserRepository.getById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const token = generateAccessToken(user);
    return { token };
  }
};

