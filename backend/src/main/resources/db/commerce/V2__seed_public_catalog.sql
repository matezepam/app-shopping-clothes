INSERT INTO commerce.products (
    id, sku, name, collection, category, subcategory, concept, price_usd,
    compare_at_price_usd, image, images, description, story, gender, color, sizes, stock, status
) VALUES
(
    'galapagos-tee', 'GLP-TEE-001', 'Galapagos Legacy Tee', 'men', 'shirts', 'camisetas', 'galapagos', 34, 42,
    '/templates/galapagos-tee.jpg',
    '/templates/galapagos-tee.jpg|/templates/galapagos-cap-black.jpg|/templates/galapagos-canvas-wide.jpg',
    'Camiseta premium de algodón con gráfica inspirada en Galápagos.',
    'Una camiseta que recoge la identidad natural de las islas con una composición gráfica limpia.',
    'male', 'azul', 'S|M|L|XL', 36, 'active'
),
(
    'quito-hoodie', 'QTO-HDY-002', 'Quito Skyline Hoodie', 'men', 'hoodies', 'camisetas', 'quito', 62, 78,
    '/templates/quito-hoodie.jpg',
    '/templates/quito-hoodie.jpg|/templates/quito-tee-classic.jpg|/templates/quito-poster-night.jpg',
    'Hoodie suave con silueta urbana y detalle de skyline.',
    'Una interpretación contemporánea de la arquitectura y el horizonte de Quito.',
    'male', 'negro', 'S|M|L|XL|XXL', 24, 'active'
),
(
    'otavalo-cap', 'OTV-CAP-003', 'Otavalo Weave Cap', 'men', 'caps', 'gorras', 'otavalo', 28, NULL,
    '/templates/otavalo-cap.jpg',
    '/templates/otavalo-cap.jpg|/templates/otavalo-cap-woven.jpg|/templates/otavalo-souvenir-kit.jpg',
    'Gorra ajustable con patrón inspirado en textiles andinos.',
    'Patrones textiles reinterpretados con un acabado sobrio y funcional.',
    'male', 'beige', 'One Size', 18, 'active'
),
(
    'andes-canvas', 'AND-ART-004', 'Andes Memory Canvas', 'souvenirs', 'art', 'bolsos', 'andes', 95, 120,
    '/templates/andes-canvas.jpg',
    '/templates/andes-canvas.jpg|/templates/andes-tee-red.jpg|/templates/andes-souvenir-stamp.jpg',
    'Canvas decorativo de montaña para recuerdos de viaje.',
    'Pieza visual inspirada en los recorridos y paisajes de la cordillera.',
    'male', 'gris', 'One Size', 10, 'active'
),
(
    'amazonia-tee-w', 'AMZ-TEE-005', 'Amazonia Mist Tee', 'women', 'shirts', 'camisetas', 'amazonia', 36, NULL,
    '/templates/amazonia-tee.jpg',
    '/templates/amazonia-tee.jpg|/templates/amazonia-cap-green.jpg|/templates/amazonia-canvas-river.jpg',
    'Camiseta moderna con tonos suaves inspirados en la Amazonía.',
    'El paisaje amazónico traducido a una prenda ligera y contemporánea.',
    'female', 'blanco', 'XS|S|M|L', 31, 'active'
),
(
    'coast-souvenir', 'CST-SVN-006', 'Pacific Breeze Souvenir Pack', 'souvenirs', 'souvenirs', 'joyas', 'coast', 42, 52,
    '/templates/coast-pack.jpg',
    '/templates/coast-pack.jpg|/templates/coast-hoodie-cream.jpg|/templates/coast-cap-sun.jpg',
    'Pack de recuerdos costeros con detalles de viaje.',
    'Una selección inspirada en la luz, la calma y la identidad del Pacífico.',
    'female', 'plateado', 'One Size', 22, 'active'
)
ON CONFLICT (id) DO NOTHING;
