INSERT INTO commerce.products (
    id, sku, name, collection, category, subcategory, concept, price_usd,
    compare_at_price_usd, image, images, description, story, gender, color,
    sizes, stock, status, moderation_status, moderation_note, moderated_by, moderated_at
) VALUES
    (
        'gorra-calavera-blanca',
        'GOR-CAL-BLA-00C5',
        'Gorra Calavera Blanca',
        'men',
        'caps',
        'gorras',
        'quito',
        27.00,
        29.99,
        '/images/catalog/store/gorra-calavera-blanca-1.png',
        '/images/catalog/store/gorra-calavera-blanca-1.png|/images/catalog/store/gorra-calavera-blanca-2.png|/images/catalog/store/gorra-calavera-blanca-3.png|/images/catalog/store/gorra-calavera-blanca-4.png',
        'Gorra blanca de estilo urbano con gráficos negros inspirados en calaveras, fuego y estética streetwear. Su diseño combina una base limpia con detalles oscuros distribuidos alrededor de la prenda, creando un contraste llamativo y fácil de combinar.',
        'Inspirada en la estética streetwear y dark, esta gorra combina una base limpia con detalles gráficos que representan actitud y personalidad.',
        'male',
        'negro',
        'Única',
        10,
        'active',
        'APPROVED',
        'Ficha, fotografías, precio y disponibilidad verificados.',
        'ROLE_MODERATOR',
        CURRENT_TIMESTAMP
    ),
    (
        'camiseta-negra',
        'CAM-NEG-D996',
        'Camiseta Negra',
        'men',
        'shirts',
        'camisetas',
        'quito',
        30.00,
        NULL,
        '/images/catalog/camiseta-galapagos-negra.png',
        '/images/catalog/camiseta-galapagos-negra.png',
        'Camiseta de color negro con diferentes estampados para una mejor moda al estilo urbano.',
        'Camiseta de color negro con diferentes estampados para una mejor moda al estilo urbano.',
        'male',
        'negro',
        'S|M|L|XL|XLL',
        4,
        'active',
        'APPROVED',
        'Ficha, fotografía, precio y disponibilidad verificados.',
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
) VALUES
    (
        '10000000-0000-4000-8000-000000000014',
        'gorra-calavera-blanca',
        NULL,
        'IN',
        10,
        10,
        'Ingreso inicial de inventario para publicación',
        'ROLE_VENDOR'
    ),
    (
        '10000000-0000-4000-8000-000000000015',
        'camiseta-negra',
        NULL,
        'IN',
        4,
        4,
        'Ingreso inicial de inventario para publicación',
        'ROLE_VENDOR'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO audit.moderation_history (
    id, product_id, moderator_identity_user_id, moderator_sub, decision, note,
    product_name, product_sku
) VALUES
    (
        '20000000-0000-4000-8000-000000000014',
        'gorra-calavera-blanca',
        NULL,
        'ROLE_MODERATOR',
        'APPROVED',
        'Ficha, fotografías, precio y disponibilidad verificados.',
        'Gorra Calavera Blanca',
        'GOR-CAL-BLA-00C5'
    ),
    (
        '20000000-0000-4000-8000-000000000015',
        'camiseta-negra',
        NULL,
        'ROLE_MODERATOR',
        'APPROVED',
        'Ficha, fotografía, precio y disponibilidad verificados.',
        'Camiseta Negra',
        'CAM-NEG-D996'
    )
ON CONFLICT (id) DO NOTHING;
