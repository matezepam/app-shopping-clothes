import { Router } from "express";
import { pool } from "../db.js";

export const productsRouter = Router();

productsRouter.get("/", async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, name, category, concept, price_usd, image_url AS image, stock
       FROM products ORDER BY name`,
    );
    res.json({ products: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Database error" });
  }
});
