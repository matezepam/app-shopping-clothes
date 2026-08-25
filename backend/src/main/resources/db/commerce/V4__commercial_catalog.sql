-- Retira del escaparate registros técnicos creados durante validaciones manuales.
-- Se conservan para no romper pedidos, movimientos o trazabilidad existentes.
UPDATE commerce.products
SET status = 'disabled',
    moderation_status = 'REJECTED',
    moderation_note = 'Registro técnico retirado del catálogo comercial.'
WHERE lower(name) LIKE '%postman%'
   OR lower(COALESCE(description, '')) LIKE '%postman%'
   OR lower(name) LIKE '%producto evidencia%'
   OR upper(sku) LIKE 'TEST-%'
   OR upper(sku) LIKE 'DEMO-%';

INSERT INTO commerce.categories (name, slug) VALUES
    ('Pantalones', 'pants'),
    ('Bolsos', 'bags'),
    ('Tazas', 'mugs'),
    ('Bordados', 'embroidery')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO commerce.products (
    id, sku, name, collection, category, subcategory, concept, price_usd,
    compare_at_price_usd, image, images, description, story, gender, color,
    sizes, stock, status, moderation_status
) VALUES
    (
        'galapagos-tee', 'GLP-CAM-001', 'Camiseta Galápagos Origen', 'men', 'shirts', 'camisetas', 'galapagos', 29.90,
        34.90, '/images/catalog/camiseta-galapagos-negra.png', '/images/catalog/camiseta-galapagos-negra.png',
        'Camiseta gráfica de algodón suave y peso medio. El corte regular funciona bien con jean o pantalón cargo y el bordado discreto suma identidad sin recargar el look.',
        'La ilustración reúne tres formas reconocibles de las islas en un bordado pequeño, pensado para usar a diario y no solo como recuerdo de viaje.',
        'male', 'negro', 'S|M|L|XL|XXL', 42, 'active', 'APPROVED'
    ),
    (
        'galapagos-tee-oversize', 'GLP-CAM-002', 'Camiseta Galápagos Oversize', 'men', 'shirts', 'camisetas', 'galapagos', 32.90,
        NULL, '/images/catalog/camiseta-galapagos-negra.png', '/images/catalog/camiseta-galapagos-negra.png',
        'Versión oversize con hombro caído, cuello reforzado y tela firme. Una camiseta cómoda para armar un outfit urbano sin perder una referencia sutil a Galápagos.',
        'Nació como una alternativa más relajada de la línea Origen: la misma gráfica limpia en una silueta amplia y fácil de combinar.',
        'male', 'negro', 'S|M|L|XL', 31, 'active', 'APPROVED'
    ),
    (
        'quito-hoodie', 'AND-HOD-003', 'Hoodie Andes Arena', 'men', 'hoodies', 'camisetas', 'andes', 54.90,
        62.90, '/images/catalog/hoodie-andes-beige.png', '/images/catalog/hoodie-andes-beige.png',
        'Hoodie beige de felpa suave, capucha amplia y bolsillo canguro. El detalle textil de la manga aporta carácter y mantiene una apariencia sobria.',
        'El patrón lateral toma el ritmo geométrico de los tejidos de altura y lo lleva a una prenda abrigada para tardes frescas.',
        'male', 'beige', 'S|M|L|XL|XXL', 27, 'active', 'APPROVED'
    ),
    (
        'andes-hoodie-relaxed', 'AND-HOD-004', 'Hoodie Páramo Relaxed', 'men', 'hoodies', 'camisetas', 'andes', 57.90,
        NULL, '/images/catalog/hoodie-andes-beige.png', '/images/catalog/hoodie-andes-beige.png',
        'Sudadera beige de ajuste relajado con interior afelpado y puños acanalados. Abriga sin sentirse pesada y combina con prendas oscuras o tonos tierra.',
        'Su paleta recuerda la luz seca del páramo y deja que la textura de la manga sea el detalle principal.',
        'male', 'beige', 'M|L|XL|XXL', 19, 'active', 'APPROVED'
    ),
    (
        'amazonia-cargo-verde', 'AMZ-PAN-005', 'Pantalón Cargo Amazonía', 'men', 'pants', 'pantalones', 'amazonia', 49.90,
        56.90, '/images/catalog/pantalon-cargo-verde.png', '/images/catalog/pantalon-cargo-verde.png',
        'Pantalón cargo verde oliva de corte recto, con bolsillos amplios y tela resistente. Está pensado para caminar, viajar y resolver un look casual con una sola pieza.',
        'El verde profundo conecta con el paisaje amazónico, mientras el diseño prioriza comodidad y uso real.',
        'male', 'verde', '28|30|32|34|36', 35, 'active', 'APPROVED'
    ),
    (
        'andes-cargo-recto', 'AND-PAN-006', 'Cargo Ruta Andina', 'men', 'pants', 'pantalones', 'andes', 52.90,
        NULL, '/images/catalog/pantalon-cargo-verde.png', '/images/catalog/pantalon-cargo-verde.png',
        'Cargo recto en verde oliva, con tiro medio y bolsillos laterales funcionales. La silueta queda limpia con camiseta básica, hoodie o chaqueta ligera.',
        'Una prenda práctica inspirada en los trayectos largos: cómoda al moverse y sencilla de combinar al llegar.',
        'male', 'verde', '30|32|34|36|38', 24, 'active', 'APPROVED'
    ),
    (
        'otavalo-cap', 'OTV-GOR-007', 'Gorra Otavalo Azul', 'men', 'caps', 'gorras', 'otavalo', 24.90,
        29.90, '/images/catalog/gorra-otavalo-azul.png', '/images/catalog/gorra-otavalo-azul.png',
        'Gorra azul tipo dad cap, ajustable y bordada en el lateral. La visera curva y el algodón de buen cuerpo la hacen cómoda desde el primer uso.',
        'El acento tejido toma colores de mercado y los concentra en una franja pequeña para acompañar, no dominar, el outfit.',
        'male', 'azul', 'Única', 38, 'active', 'APPROVED'
    ),
    (
        'otavalo-cap-urbana', 'OTV-GOR-008', 'Gorra Mercado Urbano', 'men', 'caps', 'gorras', 'otavalo', 26.90,
        NULL, '/images/catalog/gorra-otavalo-azul.png', '/images/catalog/gorra-otavalo-azul.png',
        'Gorra bordada azul marino con ajuste posterior y estructura ligera. Un accesorio fácil de llevar con ropa neutra y looks de fin de semana.',
        'La composición lateral reinterpreta el ritmo de los textiles de Otavalo con una lectura contemporánea.',
        'male', 'azul', 'Única', 29, 'active', 'APPROVED'
    ),
    (
        'amazonia-tee-w', 'QTO-CAM-009', 'Camiseta Quito Vino', 'women', 'shirts', 'camisetas', 'quito', 28.90,
        33.90, '/images/catalog/camiseta-quito-vino.png', '/images/catalog/camiseta-quito-vino.png',
        'Camiseta color vino de corte relajado, algodón ligero y caída suave. El bordado tonal del perfil urbano aparece al acercarse y mantiene el diseño elegante.',
        'El horizonte de Quito se dibuja en el borde inferior como un detalle que se descubre mientras se usa.',
        'female', 'rojo', 'XS|S|M|L|XL', 44, 'active', 'APPROVED'
    ),
    (
        'quito-tee-relaxed', 'QTO-CAM-010', 'Camiseta Altura Relaxed', 'women', 'shirts', 'camisetas', 'quito', 31.90,
        NULL, '/images/catalog/camiseta-quito-vino.png', '/images/catalog/camiseta-quito-vino.png',
        'Camiseta gráfica de silueta amplia y cuello redondo. Su tono vino combina especialmente bien con denim, beige y negro para un outfit limpio.',
        'La línea bordada recorre la ciudad desde una mirada cotidiana: reconocible, discreta y lista para acompañar el viaje.',
        'female', 'rojo', 'XS|S|M|L', 33, 'active', 'APPROVED'
    ),
    (
        'quito-tee-basica', 'QTO-CAM-011', 'Camiseta Centro Histórico', 'women', 'shirts', 'camisetas', 'quito', 27.90,
        NULL, '/images/catalog/camiseta-quito-vino.png', '/images/catalog/camiseta-quito-vino.png',
        'Camiseta básica color vino con acabado suave y largo cómodo. Tiene suficiente personalidad para usarla sola y una paleta fácil de repetir en distintos looks.',
        'El bordado recorre tejados y torres sin convertir la prenda en una postal; se siente parte del diseño.',
        'female', 'rojo', 'S|M|L|XL', 26, 'active', 'APPROVED'
    ),
    (
        'otavalo-hoodie-sand', 'OTV-HOD-012', 'Hoodie Otavalo Arena', 'women', 'hoodies', 'camisetas', 'otavalo', 56.90,
        64.90, '/images/catalog/hoodie-andes-beige.png', '/images/catalog/hoodie-andes-beige.png',
        'Hoodie beige de corte cómodo, interior suave y detalle artesanal en la manga. Funciona como capa principal en clima fresco y mantiene un perfil limpio.',
        'El patrón lateral reconoce el trabajo textil de Otavalo desde una aplicación pequeña y fácil de usar.',
        'female', 'beige', 'XS|S|M|L|XL', 28, 'active', 'APPROVED'
    ),
    (
        'andes-hoodie-women', 'AND-HOD-013', 'Hoodie Cumbre Suave', 'women', 'hoodies', 'camisetas', 'andes', 58.90,
        NULL, '/images/catalog/hoodie-andes-beige.png', '/images/catalog/hoodie-andes-beige.png',
        'Sudadera beige de ajuste relajado, capucha envolvente y puños firmes. Una pieza neutra para combinar con jeans, leggings o cargo.',
        'Su color recoge los tonos de caminos y pajonales; el detalle de manga añade el punto justo de contraste.',
        'female', 'beige', 'XS|S|M|L', 21, 'active', 'APPROVED'
    ),
    (
        'amazonia-cargo-women', 'AMZ-PAN-014', 'Cargo Selva Recto', 'women', 'pants', 'pantalones', 'amazonia', 48.90,
        54.90, '/images/catalog/pantalon-cargo-verde.png', '/images/catalog/pantalon-cargo-verde.png',
        'Pantalón cargo verde de corte recto y bolsillos funcionales. La tela mantiene la forma sin limitar el movimiento y se adapta a looks casuales o de viaje.',
        'Diseñado para acompañar días largos: práctico, cómodo y con un verde que funciona como neutro.',
        'female', 'verde', '26|28|30|32|34', 32, 'active', 'APPROVED'
    ),
    (
        'otavalo-cap-women', 'OTV-GOR-015', 'Gorra Trama Andina', 'women', 'caps', 'gorras', 'otavalo', 25.90,
        NULL, '/images/catalog/gorra-otavalo-azul.png', '/images/catalog/gorra-otavalo-azul.png',
        'Gorra azul bordada de visera curva y ajuste posterior. Protege del sol, suma color y cabe fácilmente en el equipaje sin perder estructura.',
        'Una franja geométrica conecta el azul profundo con tonos tierra para acompañar prendas claras u oscuras.',
        'female', 'azul', 'Única', 34, 'active', 'APPROVED'
    ),
    (
        'galapagos-tee-women', 'GLP-CAM-016', 'Camiseta Islas Negra', 'women', 'shirts', 'camisetas', 'galapagos', 30.90,
        NULL, '/images/catalog/camiseta-galapagos-negra.png', '/images/catalog/camiseta-galapagos-negra.png',
        'Camiseta negra de algodón, corte relajado y gráfica bordada en el pecho. Es una base versátil para usar con jean, falda o pantalón amplio.',
        'La composición de fauna y costa se mantiene pequeña para que la historia acompañe a la prenda sin convertirla en disfraz.',
        'female', 'negro', 'XS|S|M|L|XL', 30, 'active', 'APPROVED'
    ),
    (
        'andes-canvas', 'AND-REC-017', 'Lámina Andes Silencioso', 'souvenirs', 'art', 'recuadros', 'andes', 34.90,
        39.90, '/images/catalog/coleccion-recuerdos-andes.png', '/images/catalog/coleccion-recuerdos-andes.png',
        'Lámina decorativa de paisaje andino en tonos arena, gris y carbón. El formato compacto queda bien en escritorio, recibidor o una pared de recuerdos.',
        'La ilustración reduce la cordillera a capas de color para conservar la sensación de profundidad sin recargar el espacio.',
        'female', 'beige', '30 x 40 cm', 23, 'active', 'APPROVED'
    ),
    (
        'quito-recuadro-minimal', 'QTO-REC-018', 'Recuadro Quito al Atardecer', 'souvenirs', 'art', 'recuadros', 'quito', 38.90,
        NULL, '/images/catalog/coleccion-recuerdos-andes.png', '/images/catalog/coleccion-recuerdos-andes.png',
        'Recuadro minimalista con marco claro y paleta cálida. Una pieza fácil de integrar en espacios modernos y regalar sin preocuparse por combinaciones difíciles.',
        'La ciudad se interpreta desde la luz de la tarde y las montañas que siempre aparecen detrás del recorrido urbano.',
        'female', 'beige', '30 x 40 cm', 18, 'active', 'APPROVED'
    ),
    (
        'galapagos-poster-volcanico', 'GLP-REC-019', 'Póster Costa Volcánica', 'souvenirs', 'art', 'recuadros', 'galapagos', 21.90,
        26.90, '/images/catalog/coleccion-recuerdos-andes.png', '/images/catalog/coleccion-recuerdos-andes.png',
        'Póster de acabado mate con formas volcánicas y colores naturales. Se entrega listo para enmarcar y aporta un recuerdo visual sin el aspecto típico de una postal.',
        'El paisaje se construye con líneas y capas sencillas para recordar la costa, la roca y la luz abierta de las islas.',
        'male', 'beige', '40 x 50 cm', 37, 'active', 'APPROVED'
    ),
    (
        'coast-souvenir', 'AND-TAZ-020', 'Taza Térmica Ruta de los Andes', 'souvenirs', 'mugs', 'tazas', 'andes', 26.90,
        31.90, '/images/catalog/coleccion-recuerdos-andes.png', '/images/catalog/coleccion-recuerdos-andes.png',
        'Taza térmica ilustrada con tapa, acabado mate y capacidad cómoda para café o té. Su base en tonos tierra funciona tanto en la oficina como durante un viaje.',
        'Las montañas rodean la pieza en una gráfica continua que recuerda el camino, no un destino específico.',
        'male', 'beige', '450 ml', 41, 'active', 'APPROVED'
    ),
    (
        'quito-taza-ceramica', 'QTO-TAZ-021', 'Taza Cerámica Luz de Quito', 'souvenirs', 'mugs', 'tazas', 'quito', 18.90,
        NULL, '/images/catalog/coleccion-recuerdos-andes.png', '/images/catalog/coleccion-recuerdos-andes.png',
        'Taza de cerámica ilustrada, asa amplia y acabado satinado. Es un regalo útil, fácil de empacar y pensado para entrar de verdad en la rutina diaria.',
        'La paleta cálida recoge la luz sobre las montañas y la convierte en una escena serena para la mesa.',
        'female', 'beige', '350 ml', 52, 'active', 'APPROVED'
    ),
    (
        'amazonia-travel-mug', 'AMZ-TAZ-022', 'Travel Mug Sendero Verde', 'souvenirs', 'mugs', 'tazas', 'amazonia', 28.90,
        NULL, '/images/catalog/coleccion-recuerdos-andes.png', '/images/catalog/coleccion-recuerdos-andes.png',
        'Vaso térmico ilustrado con tapa segura y cuerpo fácil de sostener. Mantiene la bebida protegida durante trayectos cortos y cabe en portavasos estándar.',
        'La línea de paisaje usa verdes apagados y tierra para acompañar la rutina con una referencia natural y discreta.',
        'male', 'beige', '450 ml', 29, 'active', 'APPROVED'
    ),
    (
        'otavalo-bordado-parche', 'OTV-BOR-023', 'Parche Bordado Trama Otavalo', 'souvenirs', 'embroidery', 'bordados', 'otavalo', 9.90,
        NULL, '/images/catalog/coleccion-recuerdos-andes.png', '/images/catalog/coleccion-recuerdos-andes.png',
        'Parche bordado termoadhesivo con acabado firme y colores sobrios. Permite personalizar una chaqueta, mochila o tote sin cambiar toda la prenda.',
        'El patrón concentra una trama geométrica en una pieza pequeña que el usuario puede llevar a su manera.',
        'female', 'beige', '8 cm', 64, 'active', 'APPROVED'
    ),
    (
        'andes-bordado-textil', 'AND-BOR-024', 'Bordado Textil Cumbre', 'souvenirs', 'embroidery', 'bordados', 'andes', 14.90,
        17.90, '/images/catalog/coleccion-recuerdos-andes.png', '/images/catalog/coleccion-recuerdos-andes.png',
        'Aplicación textil bordada con reverso para coser, bordes limpios y motivo de montaña. Un detalle resistente para bolsos, prendas o proyectos personales.',
        'La silueta de cumbre se simplifica para conservar su fuerza incluso en un formato pequeño.',
        'male', 'beige', '12 cm', 47, 'active', 'APPROVED'
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
    status = EXCLUDED.status,
    moderation_status = EXCLUDED.moderation_status,
    moderation_note = NULL;
