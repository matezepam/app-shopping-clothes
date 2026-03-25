import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/stats", async (_req: AuthedRequest, res) => {
  try {
    const summaryR = await pool.query(`
      SELECT
        COUNT(*)::int AS orders_count,
        COALESCE(SUM(total_usd), 0)::numeric AS revenue_usd
      FROM orders
      WHERE status IN ('completed', 'paid')
    `);
    const unitsR = await pool.query(`
      SELECT COALESCE(SUM(quantity), 0)::int AS units_sold
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status IN ('completed', 'paid')
    `);
    const pendingReturnsR = await pool.query(`
      SELECT COUNT(*)::int AS c FROM return_requests WHERE status = 'requested'
    `);
    const topR = await pool.query(`
      SELECT oi.product_id, p.name,
        SUM(oi.quantity)::int AS units_sold,
        SUM(oi.quantity * oi.unit_price_usd)::numeric AS revenue_usd
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      WHERE o.status IN ('completed', 'paid')
      GROUP BY oi.product_id, p.name
      ORDER BY units_sold DESC
      LIMIT 12
    `);
    const byDayR = await pool.query(`
      SELECT to_char(date_trunc('day', created_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day,
        COALESCE(SUM(total_usd), 0)::numeric AS revenue_usd
      FROM orders
      WHERE status IN ('completed', 'paid')
        AND created_at >= now() - interval '14 days'
      GROUP BY 1
      ORDER BY 1 ASC
    `);

    const s = summaryR.rows[0] as { orders_count: number; revenue_usd: string };
    const u = unitsR.rows[0] as { units_sold: number };
    const pr = pendingReturnsR.rows[0] as { c: number };

    res.json({
      summary: {
        ordersCount: s.orders_count,
        revenueUsd: Number(s.revenue_usd),
        unitsSold: u.units_sold,
        returnsPending: pr.c,
      },
      topProducts: (topR.rows as {
        product_id: string;
        name: string;
        units_sold: number;
        revenue_usd: string;
      }[]).map((row) => ({
        productId: row.product_id,
        name: row.name,
        unitsSold: row.units_sold,
        revenueUsd: Number(row.revenue_usd),
      })),
      revenueByDay: (byDayR.rows as { day: string; revenue_usd: string }[]).map(
        (row) => ({
          day: row.day,
          revenueUsd: Number(row.revenue_usd),
        }),
      ),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Stats error" });
  }
});

adminRouter.get("/returns", async (_req, res) => {
  try {
    const r = await pool.query(`
      SELECT rr.id, rr.order_id, rr.product_id, rr.quantity, rr.reason, rr.status,
        rr.created_at, rr.admin_note, u.email AS user_email
      FROM return_requests rr
      JOIN users u ON u.id = rr.user_id
      ORDER BY rr.created_at DESC
    `);
    res.json({
      returns: (r.rows as {
        id: string;
        order_id: string;
        product_id: string;
        quantity: number;
        reason: string;
        status: string;
        created_at: Date;
        admin_note: string | null;
        user_email: string;
      }[]).map((row) => ({
        id: row.id,
        orderId: row.order_id,
        productId: row.product_id,
        quantity: row.quantity,
        reason: row.reason,
        status: row.status,
        createdAt: row.created_at.toISOString(),
        adminNote: row.admin_note,
        userEmail: row.user_email,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Database error" });
  }
});

const patchSchema = z.object({
  status: z.enum(["requested", "approved", "rejected", "refunded"]),
  adminNote: z.string().optional(),
});

adminRouter.patch("/returns/:id", async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { id } = req.params;
  const { status, adminNote } = parsed.data;
  try {
    const r = await pool.query(
      `UPDATE return_requests
       SET status = $1, admin_note = COALESCE($2, admin_note)
       WHERE id = $3
       RETURNING id, order_id, product_id, quantity, reason, status, created_at, admin_note`,
      [status, adminNote ?? null, id],
    );
    if (r.rowCount === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const row = r.rows[0] as {
      id: string;
      order_id: string;
      product_id: string;
      quantity: number;
      reason: string;
      status: string;
      created_at: Date;
      admin_note: string | null;
    };
    res.json({
      return: {
        id: row.id,
        orderId: row.order_id,
        productId: row.product_id,
        quantity: row.quantity,
        reason: row.reason,
        status: row.status,
        createdAt: row.created_at.toISOString(),
        adminNote: row.admin_note,
        userEmail: "",
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Update failed" });
  }
});
