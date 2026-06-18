CREATE TABLE products (
    id VARCHAR(120) PRIMARY KEY,
    sku VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    collection VARCHAR(30) NOT NULL,
    category VARCHAR(40) NOT NULL,
    subcategory VARCHAR(40) NOT NULL,
    concept VARCHAR(40) NOT NULL,
    price_usd NUMERIC(10, 2) NOT NULL,
    compare_at_price_usd NUMERIC(10, 2),
    image TEXT NOT NULL,
    images TEXT,
    description TEXT,
    story TEXT,
    gender VARCHAR(20) NOT NULL,
    color VARCHAR(30) NOT NULL,
    sizes TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (
    id, sku, name, collection, category, subcategory, concept, price_usd,
    compare_at_price_usd, image, images, description, story, gender, color, sizes, stock, status
) VALUES
('galapagos-tee', 'GLP-TEE-001', 'Galapagos Legacy Tee', 'men', 'shirts', 'camisetas', 'galapagos', 34, 42, '/templates/galapagos-tee.jpg', '/templates/galapagos-tee.jpg|/templates/galapagos-cap-black.jpg|/templates/galapagos-canvas-wide.jpg', 'Camiseta premium de algodón con gráfica inspirada en Galápagos.', 'Una camiseta que susurra las islas de Darwin con una historia gráfica limpia para quien caminó la lava.', 'male', 'azul', 'S|M|L|XL', 36, 'active'),
('quito-hoodie', 'QTO-HDY-002', 'Quito Skyline Hoodie', 'men', 'hoodies', 'camisetas', 'quito', 62, 78, '/templates/quito-hoodie.jpg', '/templates/quito-hoodie.jpg|/templates/quito-tee-classic.jpg|/templates/quito-poster-night.jpg', 'Hoodie suave con silueta urbana y detalle de skyline.', 'Quito de noche, en capas: piedra antigua, nuevo horizonte y aire fino.', 'male', 'negro', 'S|M|L|XL|XXL', 24, 'active'),
('otavalo-cap', 'OTV-CAP-003', 'Otavalo Weave Cap', 'men', 'caps', 'gorras', 'otavalo', 28, NULL, '/templates/otavalo-cap.jpg', '/templates/otavalo-cap.jpg|/templates/otavalo-cap-woven.jpg|/templates/otavalo-souvenir-kit.jpg', 'Gorra ajustable con patrón inspirado en textiles andinos.', 'Lenguaje de patrones tomado de textiles de mercado, mínimo y respetuoso.', 'male', 'beige', 'One Size', 18, 'active'),
('andes-canvas', 'AND-ART-004', 'Andes Memory Canvas', 'souvenirs', 'art', 'bolsos', 'andes', 95, 120, '/templates/andes-canvas.jpg', '/templates/andes-canvas.jpg|/templates/andes-tee-red.jpg|/templates/andes-souvenir-stamp.jpg', 'Canvas decorativo de montaña para recuerdos de viaje.', 'Pieza de pared para el recuerdo de cruces de cordillera.', 'male', 'gris', 'One Size', 10, 'active'),
('amazonia-tee-w', 'AMZ-TEE-005', 'Amazonia Mist Tee', 'women', 'shirts', 'camisetas', 'amazonia', 36, NULL, '/templates/amazonia-tee.jpg', '/templates/amazonia-tee.jpg|/templates/amazonia-cap-green.jpg|/templates/amazonia-canvas-river.jpg', 'Camiseta moderna con tonos suaves inspirados en la Amazonía.', 'Niebla y dosel traducidos a una silueta moderna.', 'female', 'blanco', 'XS|S|M|L', 31, 'active'),
('coast-souvenir', 'CST-SVN-006', 'Pacific Breeze Souvenir Pack', 'souvenirs', 'souvenirs', 'joyas', 'coast', 42, 52, '/templates/coast-pack.jpg', '/templates/coast-pack.jpg|/templates/coast-hoodie-cream.jpg|/templates/coast-cap-sun.jpg', 'Pack de recuerdos costeros con detalles de viaje.', 'Un pequeño bundle de señales costeras: sal, sol y calma del Pacífico.', 'female', 'plateado', 'One Size', 22, 'active'),
('galapagos-cap-black', 'GLP-CAP-007', 'Galapagos Black Cap', 'men', 'caps', 'gorras', 'galapagos', 29, NULL, '/templates/galapagos-cap-black.jpg', '/templates/galapagos-cap-black.jpg|/templates/galapagos-tee.jpg', 'Gorra negra con bordado sobrio.', 'Una pieza simple para llevar el concepto Galápagos todos los días.', 'male', 'negro', 'One Size', 28, 'active'),
('quito-tee-classic', 'QTO-TEE-008', 'Quito Classic Tee', 'men', 'shirts', 'camisetas', 'quito', 32, NULL, '/templates/quito-tee-classic.jpg', '/templates/quito-tee-classic.jpg|/templates/quito-tee-altitude.jpg', 'Camiseta clásica de Quito para uso diario.', 'Altitud, geometría colonial y energía contemporánea sobre las nubes.', 'male', 'blanco', 'S|M|L|XL', 39, 'active'),
('otavalo-hoodie-sand', 'OTV-HDY-009', 'Otavalo Sand Hoodie', 'women', 'hoodies', 'camisetas', 'otavalo', 64, 82, '/templates/otavalo-hoodie-sand.jpg', '/templates/otavalo-hoodie-sand.jpg|/templates/otavalo-cap-woven.jpg', 'Hoodie arena con textura visual inspirada en Otavalo.', 'Color de mercado y oficio andino reinterpretado para el viaje.', 'female', 'beige', 'XS|S|M|L|XL', 15, 'active'),
('andes-tee-red', 'AND-TEE-010', 'Andes Redline Tee', 'men', 'shirts', 'camisetas', 'andes', 37, NULL, '/templates/andes-tee-red.jpg', '/templates/andes-tee-red.jpg|/templates/andes-hoodie-trail.jpg', 'Camiseta roja con línea gráfica andina.', 'Cumbres, luz de páramo y una cadena montañosa hecha prenda.', 'male', 'rojo', 'S|M|L|XL', 25, 'active'),
('amazonia-cap-green', 'AMZ-CAP-011', 'Amazonia Green Cap', 'men', 'caps', 'gorras', 'amazonia', 27, NULL, '/templates/amazonia-cap-green.jpg', '/templates/amazonia-cap-green.jpg|/templates/amazonia-souvenir-leaves.jpg', 'Gorra verde con inspiración natural.', 'Humedad, verdor profundo e historias de río.', 'male', 'verde', 'One Size', 33, 'active'),
('coast-hoodie-cream', 'CST-HDY-012', 'Pacific Cream Hoodie', 'women', 'hoodies', 'camisetas', 'coast', 59, 74, '/templates/coast-hoodie-cream.jpg', '/templates/coast-hoodie-cream.jpg|/templates/coast-tee-wave.jpg', 'Hoodie crema de tacto suave para clima fresco.', 'Luz cálida, pueblos pesqueros y brisa oceánica suave.', 'female', 'beige', 'XS|S|M|L', 17, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE lower(u.email) = 'mateo@hotmail.com'
  AND r.name = 'ADMIN'
ON CONFLICT DO NOTHING;
