UPDATE commerce.products
SET status = 'disabled'
WHERE category IN ('shirts', 'caps');

INSERT INTO commerce.products (
    id, sku, name, collection, category, subcategory, concept, price_usd,
    compare_at_price_usd, image, images, description, story, gender, color,
    sizes, stock, status, moderation_status
) VALUES
    (
        'camiseta-futbol-7', 'EGB-CAM-041', 'Camiseta Fútbol 7', 'men', 'shirts', 'camisetas', 'coast', 29.90,
        34.90, '/images/catalog/store/camiseta-futbol-7-1.webp',
        '/images/catalog/store/camiseta-futbol-7-1.webp|/images/catalog/store/camiseta-futbol-7-4.webp|/images/catalog/store/camiseta-futbol-7-2.webp|/images/catalog/store/camiseta-futbol-7-3.webp',
        'Camiseta negra de algodón con estampado deportivo frontal, cuello reforzado y corte relajado. Disponible para uso diario en tallas S a XXL.',
        'Una prenda de inspiración futbolera preparada con impresión de alta definición sobre algodón suave y resistente.',
        'male', 'negro', 'S|M|L|XL|XXL', 28, 'active', 'APPROVED'
    ),
    (
        'camiseta-arte-gotico', 'EGB-CAM-042', 'Camiseta Arte Gótico', 'women', 'shirts', 'camisetas', 'quito', 28.90,
        NULL, '/images/catalog/store/camiseta-arte-gotico-1.webp',
        '/images/catalog/store/camiseta-arte-gotico-1.webp|/images/catalog/store/camiseta-arte-gotico-4.webp|/images/catalog/store/camiseta-arte-gotico-2.webp|/images/catalog/store/camiseta-arte-gotico-3.webp',
        'Camiseta negra oversize con ilustración monocromática, manga amplia y tejido de algodón de tacto suave. El estampado mantiene líneas definidas y buen contraste.',
        'La composición gráfica combina retrato y formas orgánicas en una prenda urbana de presencia marcada.',
        'female', 'negro', 'XS|S|M|L|XL', 24, 'active', 'APPROVED'
    ),
    (
        'camiseta-leyenda-23', 'EGB-CAM-043', 'Camiseta Leyenda 23', 'men', 'shirts', 'camisetas', 'quito', 29.90,
        34.90, '/images/catalog/store/camiseta-leyenda-23-1.webp',
        '/images/catalog/store/camiseta-leyenda-23-1.webp|/images/catalog/store/camiseta-leyenda-23-4.webp|/images/catalog/store/camiseta-leyenda-23-2.webp|/images/catalog/store/camiseta-leyenda-23-3.webp',
        'Camiseta negra de corte regular con gráfico deportivo en rojo y gris. El cuello acanalado y las costuras dobles mejoran la durabilidad de la prenda.',
        'Diseñada para quienes prefieren gráficos clásicos de baloncesto con un acabado ligeramente desgastado.',
        'male', 'negro', 'S|M|L|XL|XXL', 30, 'active', 'APPROVED'
    ),
    (
        'camiseta-ruta-outdoor', 'EGB-CAM-044', 'Camiseta Ruta Outdoor', 'men', 'shirts', 'camisetas', 'andes', 27.90,
        NULL, '/images/catalog/store/camiseta-ruta-outdoor-1.webp',
        '/images/catalog/store/camiseta-ruta-outdoor-1.webp|/images/catalog/store/camiseta-ruta-outdoor-4.webp|/images/catalog/store/camiseta-ruta-outdoor-2.webp|/images/catalog/store/camiseta-ruta-outdoor-3.webp',
        'Camiseta negra de algodón con gráfica frontal en tonos crema, azul y terracota. Su corte cómodo funciona para ciudad, viaje o actividades informales.',
        'El diseño reúne caminos, montaña y aventura en una composición de apariencia editorial y fácil combinación.',
        'male', 'negro', 'S|M|L|XL|XXL', 26, 'active', 'APPROVED'
    ),
    (
        'gorra-ecuador-tricolor', 'EGB-GOR-045', 'Gorra Ecuador Tricolor', 'men', 'caps', 'gorras', 'coast', 21.90,
        NULL, '/images/catalog/store/gorra-ecuador-tricolor-1.webp',
        '/images/catalog/store/gorra-ecuador-tricolor-1.webp|/images/catalog/store/gorra-ecuador-tricolor-4.webp|/images/catalog/store/gorra-ecuador-tricolor-2.webp|/images/catalog/store/gorra-ecuador-tricolor-3.webp',
        'Gorra azul marino de seis paneles con bordado Ecuador en amarillo, azul y rojo. Incluye visera curva y correa posterior ajustable con hebilla metálica.',
        'Una pieza directa y reconocible que incorpora los colores nacionales mediante bordado de alto relieve.',
        'male', 'azul', 'Única', 35, 'active', 'APPROVED'
    ),
    (
        'gorra-pepe-bordada', 'EGB-GOR-046', 'Gorra Pepe Bordada', 'men', 'caps', 'gorras', 'quito', 22.90,
        26.90, '/images/catalog/store/gorra-pepe-bordada-1.webp',
        '/images/catalog/store/gorra-pepe-bordada-1.webp|/images/catalog/store/gorra-pepe-bordada-4.webp|/images/catalog/store/gorra-pepe-bordada-2.webp|/images/catalog/store/gorra-pepe-bordada-3.webp',
        'Gorra color vino de seis paneles con ilustración bordada en hilo dorado. La visera curva y el ajuste posterior permiten un uso cómodo y cotidiano.',
        'El bordado frontal reproduce un gesto de celebración con líneas sencillas y contraste cálido sobre la tela vino.',
        'male', 'rojo', 'Única', 32, 'active', 'APPROVED'
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
    moderation_note = NULL;
