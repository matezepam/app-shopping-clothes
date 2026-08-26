INSERT INTO commerce.products (
    id, sku, name, collection, category, subcategory, concept, price_usd,
    compare_at_price_usd, image, images, description, story, gender, color,
    sizes, stock, status, moderation_status, moderation_note, moderated_by, moderated_at
) VALUES (
    'hoodie-kids-violeta',
    'EGB-SUD-KID-001',
    'Hoodie Kids Violeta',
    'women',
    'hoodies',
    'chompas',
    'quito',
    45.90,
    NULL,
    '/images/catalog/store/hoodie-kids-violeta-1.webp',
    '/images/catalog/store/hoodie-kids-violeta-1.webp|/images/catalog/store/hoodie-kids-violeta-2.webp|/images/catalog/store/hoodie-kids-violeta-3.webp|/images/catalog/store/hoodie-kids-violeta-4.webp',
    'Sudadera infantil violeta con cierre frontal amarillo, capucha y bordado multicolor en el pecho. Confeccionada en tejido afelpado de tacto suave, con bolsillos delanteros y terminaciones acanaladas en puños y cintura.',
    'El contraste entre el tono violeta, el cierre amarillo y el bordado multicolor crea una prenda cómoda y alegre para el uso diario.',
    'female',
    'violeta',
    '6|8|10|12|14',
    18,
    'active',
    'APPROVED',
    'Ficha e imágenes aprobadas para publicación.',
    'ROLE_MODERATOR',
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    collection = EXCLUDED.collection,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    concept = EXCLUDED.concept,
    price_usd = EXCLUDED.price_usd,
    compare_at_price_usd = EXCLUDED.compare_at_price_usd,
    image = EXCLUDED.image,
    images = EXCLUDED.images,
    description = EXCLUDED.description,
    story = EXCLUDED.story,
    gender = EXCLUDED.gender,
    color = EXCLUDED.color,
    sizes = EXCLUDED.sizes,
    stock = EXCLUDED.stock,
    status = EXCLUDED.status,
    moderation_status = EXCLUDED.moderation_status,
    moderation_note = EXCLUDED.moderation_note,
    moderated_by = EXCLUDED.moderated_by,
    moderated_at = EXCLUDED.moderated_at;

INSERT INTO commerce.inventory_movements (
    id, product_id, supplier_id, type, quantity, resulting_stock, reference, created_by
) VALUES (
    '10000000-0000-4000-8000-000000000001',
    'hoodie-kids-violeta',
    NULL,
    'IN',
    18,
    18,
    'Ingreso inicial de inventario para publicación',
    'ROLE_VENDOR'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO audit.moderation_history (
    id, product_id, moderator_identity_user_id, moderator_sub, decision, note
) VALUES (
    '20000000-0000-4000-8000-000000000001',
    'hoodie-kids-violeta',
    NULL,
    'ROLE_MODERATOR',
    'APPROVED',
    'Ficha e imágenes aprobadas para publicación.'
)
ON CONFLICT (id) DO NOTHING;
