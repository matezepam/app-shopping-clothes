import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const ordersRouter = Router();

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

ordersRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  try {
    const ordersR = await pool.query(
      `SELECT id, total_usd, status, created_at
       FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    const orders = ordersR.rows as {
      id: string;
      total_usd: string;
      status: string;
      created_at: Date;
    }[];
    if (orders.length === 0) {
      res.json({ orders: [] });
      return;
    }
    const itemsR = await pool.query(
      `SELECT oi.order_id, oi.product_id, oi.quantity, oi.unit_price_usd, p.name
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ANY($1::uuid[])`,
      [orders.map((o) => o.id)],
    );
    const byOrder = new Map<
      string,
      { productId: string; name: string; quantity: number; unitPriceUsd: number }[]
    >();
    for (const row of itemsR.rows as {
      order_id: string;
      product_id: string;
      quantity: number;
      unit_price_usd: string;
      name: string;
    }[]) {
      const list = byOrder.get(row.order_id) ?? [];
      list.push({
        productId: row.product_id,
        name: row.name,
        quantity: row.quantity,
        unitPriceUsd: Number(row.unit_price_usd),
      });
      byOrder.set(row.order_id, list);
    }
    res.json({
      orders: orders.map((o) => ({
        id: o.id,
        totalUsd: Number(o.total_usd),
        status: o.status,
        createdAt: o.created_at.toISOString(),
        items: byOrder.get(o.id) ?? [],
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Database error" });
  }
});

ordersRouter.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid cart" });
    return;
  }
  const userId = req.user!.id;
  const { items } = parsed.data;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let total = 0;
    const lines: {
      productId: string;
      name: string;
      quantity: number;
      unitPriceUsd: number;
    }[] = [];

    for (const line of items) {
      const pr = await client.query(
        `SELECT id, name, price_usd, stock FROM products WHERE id = $1 FOR UPDATE`,
        [line.productId],
      );
      const p = pr.rows[0] as
        | { id: string; name: string; price_usd: string; stock: number }
        | undefined;
      if (!p || p.stock < line.quantity) {
        await client.query("ROLLBACK");
        res.status(400).json({ error: `Insufficient stock for ${line.productId}` });
        return;
      }
      const unit = Number(p.price_usd);
      total += unit * line.quantity;
      lines.push({
        productId: p.id,
        name: p.name,
        quantity: line.quantity,
        unitPriceUsd: unit,
      });
      await client.query(`UPDATE products SET stock = stock - $1 WHERE id = $2`, [
        line.quantity,
        p.id,
      ]);
    }

    const orderIns = await client.query(
      `INSERT INTO orders (user_id, total_usd, status)
       VALUES ($1, $2, 'completed')
       RETURNING id, total_usd, status, created_at`,
      [userId, total],
    );
    const order = orderIns.rows[0] as {
      id: string;
      total_usd: string;
      status: string;
      created_at: Date;
    };

    for (const l of lines) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price_usd)
         VALUES ($1, $2, $3, $4)`,
        [order.id, l.productId, l.quantity, l.unitPriceUsd],
      );
    }

    await client.query("COMMIT");
    res.status(201).json({
      order: {
        id: order.id,
        totalUsd: Number(order.total_usd),
        status: order.status,
        createdAt: order.created_at.toISOString(),
        items: lines,
      },
    });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ error: "Checkout failed" });
  } finally {
    client.release();
  }
});
