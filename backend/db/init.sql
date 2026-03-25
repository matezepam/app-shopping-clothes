CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(32) NOT NULL,
  concept VARCHAR(64) NOT NULL,
  price_usd NUMERIC(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  stock INT NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  total_usd NUMERIC(12, 2) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id VARCHAR(64) NOT NULL REFERENCES products (id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price_usd NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id VARCHAR(64) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  reason TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'requested',
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO products (id, name, category, concept, price_usd, image_url, stock)
VALUES
  ('galapagos-tee', 'Galapagos Legacy Tee', 'shirts', 'galapagos', 34.00, '/templates/galapagos-tee.jpg', 100),
  ('quito-hoodie', 'Quito Skyline Hoodie', 'hoodies', 'quito', 62.00, '/templates/quito-hoodie.jpg', 100),
  ('otavalo-cap', 'Otavalo Weave Cap', 'caps', 'otavalo', 28.00, '/templates/otavalo-cap.jpg', 100),
  ('andes-canvas', 'Andes Memory Canvas', 'art', 'andes', 95.00, '/templates/andes-canvas.jpg', 100),
  ('amazonia-tee-w', 'Amazonia Mist Tee', 'shirts', 'amazonia', 36.00, '/templates/amazonia-tee.jpg', 100),
  ('coast-souvenir', 'Pacific Breeze Souvenir Pack', 'souvenirs', 'coast', 42.00, '/templates/coast-pack.jpg', 100)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (email, password_hash, name, role)
VALUES (
  'admin@eagle.store',
  '$2b$10$/SroIsaYx9vd9wDiLpqahu0dHMyfDHOCNbuvTZ9QVd.8H983BhCfK',
  'Eagle Admin',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
