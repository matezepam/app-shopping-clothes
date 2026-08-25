UPDATE commerce.products
SET image = regexp_replace(image, '\.png$', '.webp'),
    images = regexp_replace(images, '\.png$', '.webp')
WHERE id IN (
    'costa-camiseta-marfil',
    'quito-hoodie-carbon',
    'andes-gorra-verde',
    'quito-cargo-negro',
    'otavalo-bolso-cruzado',
    'paramo-hoodie-rosa',
    'quito-pantalon-arena',
    'quito-tote-vino',
    'andes-taza-crema',
    'costa-taza-azul',
    'quito-recuadro-atardecer-v2',
    'amazonia-parche-colibri',
    'andes-aplique-cumbre'
);
