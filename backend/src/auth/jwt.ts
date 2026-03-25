import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET ?? "dev-insecure-change-me";

export type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  role: "user" | "admin";
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}
