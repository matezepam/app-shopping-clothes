-- Colección ampliada para la demostración comercial de Sprint.
-- Las fotografías son recursos provisionales y pueden sustituirse sin cambiar los productos.
INSERT INTO commerce.products (
    id, sku, name, collection, category, subcategory, concept, price_usd,
    compare_at_price_usd, image, images, description, story, gender, color,
    sizes, stock, status, moderation_status
) VALUES
    (
        'costa-camiseta-marfil', 'CST-CAM-025', 'Camiseta Costa Marfil', 'men', 'shirts', 'camisetas', 'coast', 27.90,
        NULL, '/images/catalog/camiseta-costa-marfil.png', '/images/catalog/camiseta-costa-marfil.png',
        'Camiseta de algodón color marfil, cuello redondo y corte regular. Su tono claro funciona con jean, cargo o bermuda y mantiene una apariencia limpia para el uso diario.',
        'La pequeña cinta tejida recuerda los colores de la costa ecuatoriana sin convertir la prenda en un souvenir evidente.',
        'male', 'blanco', 'S|M|L|XL|XXL', 48, 'active', 'APPROVED'
    ),
    (
        'quito-hoodie-carbon', 'QTO-HOD-026', 'Hoodie Quito Carbón', 'men', 'hoodies', 'sudaderas', 'quito', 59.90,
        66.90, '/images/catalog/hoodie-quito-carbon.png', '/images/catalog/hoodie-quito-carbon.png',
        'Hoodie gris carbón de felpa media, capucha amplia y bolsillo canguro. El color oscuro y el corte relajado permiten combinarlo fácilmente con prendas claras.',
        'El detalle de la manga toma una paleta urbana de Quito y la reduce a un acento discreto para una prenda de todos los días.',
        'male', 'gris', 'S|M|L|XL|XXL', 22, 'active', 'APPROVED'
    ),
    (
        'andes-gorra-verde', 'AND-GOR-027', 'Gorra Sendero Verde', 'men', 'caps', 'gorras', 'andes', 23.90,
        NULL, '/images/catalog/gorra-andes-verde.png', '/images/catalog/gorra-andes-verde.png',
        'Gorra verde oliva de algodón, visera curva y cierre ajustable. La estructura suave se adapta desde el primer uso y resulta práctica para viaje o ciudad.',
        'Su color nace de los caminos de montaña y el tejido lateral añade identidad sin competir con el resto del conjunto.',
        'male', 'verde', 'Única', 39, 'active', 'APPROVED'
    ),
    (
        'quito-cargo-negro', 'QTO-PAN-028', 'Cargo Urbano Negro', 'men', 'pants', 'pantalones', 'quito', 51.90,
        58.90, '/images/catalog/cargo-urbano-negro.png', '/images/catalog/cargo-urbano-negro.png',
        'Pantalón cargo negro de pierna recta, tiro medio y bolsillos laterales funcionales. La tela de algodón conserva la forma y permite moverse con comodidad.',
        'Fue pensado para recorridos largos por la ciudad: sobrio, resistente y suficientemente versátil para repetirlo durante la semana.',
        'male', 'negro', '28|30|32|34|36|38', 31, 'active', 'APPROVED'
    ),
    (
        'otavalo-bolso-cruzado', 'OTV-BOL-029', 'Bolso Cruzado Otavalo', 'men', 'bags', 'bolsos', 'otavalo', 34.90,
        NULL, '/images/catalog/bolso-otavalo-azul.png', '/images/catalog/bolso-otavalo-azul.png',
        'Bolso cruzado de lona azul marino con correa regulable y compartimento interior. Tiene espacio para teléfono, billetera, llaves y documentos pequeños.',
        'Una franja tejida aporta el vínculo con Otavalo mientras el formato compacto responde a una necesidad cotidiana y práctica.',
        'male', 'azul', 'Única', 26, 'active', 'APPROVED'
    ),
    (
        'paramo-hoodie-rosa', 'AND-HOD-030', 'Hoodie Páramo Rosa', 'women', 'hoodies', 'sudaderas', 'andes', 57.90,
        64.90, '/images/catalog/hoodie-paramo-rosa.png', '/images/catalog/hoodie-paramo-rosa.png',
        'Hoodie rosa apagado de corte relajado, interior afelpado y puños firmes. El tono suave combina con denim, negro y colores tierra sin verse demasiado deportivo.',
        'La paleta recoge la luz fría de la montaña y la lleva a una prenda abrigada con un detalle textil pequeño en la manga.',
        'female', 'rosa', 'XS|S|M|L|XL', 25, 'active', 'APPROVED'
    ),
    (
        'quito-pantalon-arena', 'QTO-PAN-031', 'Pantalón Quito Arena', 'women', 'pants', 'pantalones', 'quito', 46.90,
        NULL, '/images/catalog/pantalon-quito-arena.png', '/images/catalog/pantalon-quito-arena.png',
        'Pantalón arena de pierna amplia, tiro alto y bolsillos laterales. La tela de algodón tiene buena caída y mantiene una silueta cómoda durante todo el día.',
        'Su color se inspira en las fachadas claras del centro y fue elegido para combinar con camisetas, blusas o sudaderas de la colección.',
        'female', 'beige', '26|28|30|32|34', 29, 'active', 'APPROVED'
    ),
    (
        'quito-tote-vino', 'QTO-BOL-032', 'Tote Centro Vino', 'women', 'bags', 'bolsos', 'quito', 29.90,
        34.90, '/images/catalog/tote-quito-vino.png', '/images/catalog/tote-quito-vino.png',
        'Bolso tote de lona color vino, asas reforzadas y bolsillo interior. Su tamaño permite llevar cuaderno, botella y objetos personales sin perder una forma compacta.',
        'El detalle claro cerca de la base recuerda los tonos de la ciudad y mantiene el bolso sencillo para usarlo con frecuencia.',
        'female', 'rojo', 'Única', 35, 'active', 'APPROVED'
    ),
    (
        'andes-taza-crema', 'AND-TAZ-033', 'Taza Cumbre Crema', 'souvenirs', 'mugs', 'tazas', 'andes', 17.90,
        NULL, '/images/catalog/taza-andes-crema.png', '/images/catalog/taza-andes-crema.png',
        'Taza de cerámica color crema, asa amplia y capacidad de 350 ml. La línea de montaña pintada cerca de la base mantiene el diseño sereno y fácil de regalar.',
        'Una pieza útil inspirada en el perfil de la cordillera, pensada para conservar el recuerdo dentro de una rutina real.',
        'female', 'beige', '350 ml', 46, 'active', 'APPROVED'
    ),
    (
        'costa-taza-azul', 'CST-TAZ-034', 'Taza Marea Azul', 'souvenirs', 'mugs', 'tazas', 'coast', 18.90,
        21.90, '/images/catalog/taza-costa-azul.png', '/images/catalog/taza-costa-azul.png',
        'Taza de cerámica azul profundo con acabado satinado y asa cómoda. Una línea en tono arena aporta contraste sin recargar la pieza.',
        'Los colores recuerdan el encuentro entre mar y playa, pero el resultado sigue siendo una taza sobria para la casa o la oficina.',
        'male', 'azul', '350 ml', 38, 'active', 'APPROVED'
    ),
    (
        'quito-recuadro-atardecer-v2', 'QTO-REC-035', 'Recuadro Tejados de Quito', 'souvenirs', 'art', 'recuadros', 'quito', 41.90,
        NULL, '/images/catalog/recuadro-quito-atardecer.png', '/images/catalog/recuadro-quito-atardecer.png',
        'Recuadro con marco de madera clara e ilustración de tejados y montañas en tonos vino, arena y carbón. El formato mediano se adapta a espacios modernos.',
        'La composición parte de una tarde común en Quito y evita la postal típica para conservar una lectura más personal del paisaje urbano.',
        'female', 'beige', '30 x 40 cm', 16, 'active', 'APPROVED'
    ),
    (
        'amazonia-parche-colibri', 'AMZ-BOR-036', 'Parche Colibrí Andino', 'souvenirs', 'embroidery', 'bordados', 'amazonia', 10.90,
        NULL, '/images/catalog/parche-colibri.png', '/images/catalog/parche-colibri.png',
        'Parche circular bordado con figura de colibrí y reverso termoadhesivo. Puede aplicarse en mochilas, chaquetas o estuches y mantiene visibles las texturas del hilo.',
        'El colibrí se representa con pocos colores para conservar el carácter artesanal y permitir que cada persona lo integre a su manera.',
        'female', 'verde', '8 cm', 58, 'active', 'APPROVED'
    ),
    (
        'andes-aplique-cumbre', 'AND-BOR-037', 'Aplique Cumbre Andina', 'souvenirs', 'embroidery', 'bordados', 'andes', 13.90,
        16.90, '/images/catalog/bordado-cumbre.png', '/images/catalog/bordado-cumbre.png',
        'Aplique rectangular bordado con línea de montaña, borde reforzado y reverso listo para coser. Funciona en bolsos, prendas o proyectos textiles personales.',
        'Las formas se reducen a una línea de cumbre y tres tonos naturales para mantener un acabado artesanal, sencillo y duradero.',
        'male', 'beige', '12 cm', 43, 'active', 'APPROVED'
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
