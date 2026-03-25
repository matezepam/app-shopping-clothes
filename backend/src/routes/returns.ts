import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const returnsRouter = Router();

const createSchema = z.object({
  orderId: z.string().uuid(),
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  reason: z.string().min(3),
});

returnsRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  try {
    const r = await pool.query(
      `SELECT id, order_id, product_id, quantity, reason, status, created_at
       FROM return_requests WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    res.json({
      returns: (r.rows as {
        id: string;
        order_id: string;
        product_id: string;
        quantity: number;
        reason: string;
        status: string;
        created_at: Date;
      }[]).map((row) => ({
        id: row.id,
        orderId: row.order_id,
        productId: row.product_id,
        quantity: row.quantity,
        reason: row.reason,
        status: row.status,
        createdAt: row.created_at.toISOString(),
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Database error" });
  }
});

returnsRouter.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid return request" });
    return;
  }
  const userId = req.user!.id;
  const { orderId, productId, quantity, reason } = parsed.data;
  try {
    const own = await pool.query(
      `SELECT o.id FROM orders o
       WHERE o.id = $1 AND o.user_id = $2`,
      [orderId, userId],
    );
    if (own.rowCount === 0) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    const item = await pool.query(
      `SELECT quantity FROM order_items WHERE order_id = $1 AND product_id = $2`,
      [orderId, productId],
    );
    const bought = item.rows[0]?.quantity as number | undefined;
    if (!bought || quantity > bought) {
      res.status(400).json({ error: "Invalid quantity for this order" });
      return;
    }
    const ins = await pool.query(
      `INSERT INTO return_requests (user_id, order_id, product_id, quantity, reason, status)
       VALUES ($1, $2, $3, $4, $5, 'requested')
       RETURNING id, order_id, product_id, quantity, reason, status, created_at`,
      [userId, orderId, productId, quantity, reason],
    );
    const row = ins.rows[0] as {
      id: string;
      order_id: string;
      product_id: string;
      quantity: number;
      reason: string;
      status: string;
      created_at: Date;
    };
    res.status(201).json({
      return: {
        id: row.id,
        orderId: row.order_id,
        productId: row.product_id,
        quantity: row.quantity,
        reason: row.reason,
        status: row.status,
        createdAt: row.created_at.toISOString(),
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not create return" });
  }
});
