import { authService } from "./services.js";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "../../shared/middleware/auth.js";
import { UserRepository } from "../users/UserRepository.js";
import { Webhook } from "svix";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const authController = {
  async register(req, res) {
    try {
      const { email, password, first_name, last_name, phone } = req.body;
      if (!email || !password || !first_name || !last_name) {
        return res
          .status(400)
          .json({ error: "Missing required field registration data" });
      }
      const data = await authService.register({
        email,
        password,
        first_name,
        last_name,
        phone,
      });

      // Store refresh token in secure cookie
      res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }
      const data = await authService.login({ email, password });

      res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
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
        return res.status(401).json({ error: "Refresh token is required" });
      }

      const decoded = verifyRefreshToken(token);
      if (!decoded) {
        return res
          .status(403)
          .json({ error: "Invalid or expired refresh token" });
      }

      const data = await authService.refresh(decoded.id);
      return res.status(200).json({ token: data.token });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async logout(req, res) {
    res.clearCookie("refreshToken");
    return res.status(204).send();
  },

  async clerkSync(req, res) {
    try {
      const { id, email, first_name, last_name, phone } = req.body;

      if (!id || !email) {
        return res
          .status(400)
          .json({
            error: "Clerk User ID and email are required for synchronization",
          });
      }

      let user = await UserRepository.getByClerkId(id);

      const defaultPermissions = [
        "products:read",
        "gallery:read",
        "bookings:create",
        "bookings:read-own",
        "rentals:create",
        "rentals:read-own",
        "orders:create",
        "orders:read-own",
      ];

      if (!user) {
        // Generate a random dummy password hash for the PostgreSQL schema constraint
        const salt = await bcrypt.genSalt(10);
        const dummyPasswordHash = await bcrypt.hash(uuidv4(), salt);

        const role = email === process.env.ADMIN_EMAIL ? "Admin" : "Customer";

        user = await UserRepository.create({
          clerk_id: id,
          email,
          password_hash: dummyPasswordHash,
          first_name: first_name || "Gmail User",
          last_name: last_name || "",
          phone: phone || "",
          role,
          permissions: defaultPermissions,
        });
      } else {
        await UserRepository.updateLastLogin(user.id);

        // Ensure Admin role is enforced if email matches config
        const expectedRole =
          email === process.env.ADMIN_EMAIL ? "Admin" : "Customer";
        if (user.role !== expectedRole) {
          await UserRepository.updateRoleAndPermissions(user.id, {
            role: expectedRole,
            permissions: defaultPermissions,
          });
          user.role = expectedRole;
        }
      }

      const token = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ user, token });
    } catch (err) {
      console.error("[Clerk Sync Error]:", err);
      return res.status(500).json({ error: err.message });
    }
  },

  async clerkWebhook(req, res) {
    try {
      // req.body will be a Buffer if express.raw({ type: 'application/json' }) is used
      const payload = req.body ? req.body.toString() : "";
      const headers = req.headers;

      const svix_id = headers["svix-id"];
      const svix_timestamp = headers["svix-timestamp"];
      const svix_signature = headers["svix-signature"];

      if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ error: "Missing svix headers" });
      }

      const secret = process.env.CLERK_WEBHOOK_SECRET;
      if (!secret) {
        return res
          .status(500)
          .json({ error: "Clerk webhook secret not configured" });
      }

      const wh = new Webhook(secret);
      let evt;
      try {
        evt = wh.verify(payload, {
          "svix-id": svix_id,
          "svix-timestamp": svix_timestamp,
          "svix-signature": svix_signature,
        });
      } catch (err) {
        return res.status(400).json({ error: "Invalid signature" });
      }

      const { id } = evt.data;
      const eventType = evt.type;

      if (eventType === "user.created" || eventType === "user.updated") {
        const { email_addresses, first_name, last_name, phone_numbers } =
          evt.data;
        const email = email_addresses?.[0]?.email_address;
        const phone = phone_numbers?.[0]?.phone_number;

        let user = await UserRepository.getByClerkId(id);
        const expectedRole =
          email === process.env.ADMIN_EMAIL ? "Admin" : "Customer";

        if (!user) {
          const salt = await bcrypt.genSalt(10);
          const dummyPasswordHash = await bcrypt.hash(uuidv4(), salt);

          await UserRepository.create({
            clerk_id: id,
            email,
            password_hash: dummyPasswordHash,
            first_name: first_name || "Gmail User",
            last_name: last_name || "",
            phone: phone || "",
            role: expectedRole,
            permissions: [
              "products:read",
              "gallery:read",
              "bookings:create",
              "bookings:read-own",
              "rentals:create",
              "rentals:read-own",
              "orders:create",
              "orders:read-own",
            ],
          });
        } else {
          await UserRepository.updateProfile(user.id, {
            first_name: first_name || user.first_name,
            last_name: last_name || user.last_name,
            phone: phone || user.phone,
          });

          if (user.role !== expectedRole) {
            await UserRepository.updateRoleAndPermissions(user.id, {
              role: expectedRole,
              permissions: [
                "products:read",
                "gallery:read",
                "bookings:create",
                "bookings:read-own",
                "rentals:create",
                "rentals:read-own",
                "orders:create",
                "orders:read-own",
              ],
            });
          }
        }
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("[Clerk Webhook Error]:", err);
      return res.status(500).json({ error: err.message });
    }
  },
};
