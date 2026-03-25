import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../auth/jwt.js";

export type AuthedRequest = Request & {
  user?: { id: string; email: string; name: string; role: "user" | "admin" };
};

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const p = verifyToken(token);
    req.user = {
      id: p.sub,
      email: p.email,
      name: p.name,
      role: p.role,
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
