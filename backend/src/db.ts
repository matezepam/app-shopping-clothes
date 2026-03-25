import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL is not set — API will fail DB operations.");
}

export const pool = new Pool({
  connectionString,
  max: 10,
});
