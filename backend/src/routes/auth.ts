import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool } from "../db.js";
import { signToken } from "../auth/jwt.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { email, password, name } = parsed.data;
  const hash = await bcrypt.hash(password, 10);
  try {
    const r = await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, email, name, role`,
      [email.toLowerCase(), hash, name],
    );
    const user = r.rows[0] as {
      id: string;
      email: string;
      name: string;
      role: "user" | "admin";
    };
    const token = signToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "23505") {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { email, password } = parsed.data;
  const r = await pool.query(
    `SELECT id, email, name, role, password_hash FROM users WHERE email = $1`,
    [email.toLowerCase()],
  );
  const row = r.rows[0] as
    | {
        id: string;
        email: string;
        name: string;
        role: "user" | "admin";
        password_hash: string;
      }
    | undefined;
  if (!row || !(await bcrypt.compare(password, row.password_hash))) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = signToken({
    sub: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
  });
  res.json({
    token,
    user: {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
    },
  });
});

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const u = req.user!;
  res.json({
    user: {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
    },
  });
});
