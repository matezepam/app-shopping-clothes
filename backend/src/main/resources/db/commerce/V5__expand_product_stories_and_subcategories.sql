UPDATE commerce.products
SET subcategory = 'sudaderas'
WHERE category = 'hoodies';

UPDATE commerce.products
SET story = trim(COALESCE(story, '')) || ' ' ||
    CASE concept
        WHEN 'galapagos' THEN
            'La propuesta evita convertir Galápagos en una imagen turística repetida. Las formas se mantienen pequeñas, los colores son fáciles de combinar y el acabado está pensado para acompañar un guardarropa cotidiano. Así, el recuerdo conserva su origen, pero también funciona mucho tiempo después de terminar el viaje.'
        WHEN 'quito' THEN
            'La idea nace de recorrer Quito a pie: los cambios de altura, los tejados, las torres y las montañas que aparecen entre las calles. Esos elementos se simplifican para que el producto se sienta urbano y actual, sin parecer una postal impresa ni depender de una tendencia pasajera.'
        WHEN 'otavalo' THEN
            'El patrón se utiliza como un acento medido y no como decoración excesiva. La intención es reconocer el ritmo visual de los textiles de Otavalo y trasladarlo a una pieza cómoda, fácil de combinar y suficientemente versátil para el uso frecuente.'
        WHEN 'andes' THEN
            'Los tonos tierra y las líneas de montaña recuerdan los trayectos por la cordillera ecuatoriana. Cada detalle busca transmitir abrigo, movimiento y paisaje sin recargar la pieza. El resultado combina bien con colores neutros y mantiene su utilidad fuera del contexto del viaje.'
        WHEN 'amazonia' THEN
            'Los verdes profundos y las formas orgánicas parten del paisaje del oriente ecuatoriano. La colección prioriza comodidad, resistencia y bolsillos o cortes que sirvan durante un día largo. La referencia natural está presente, pero el uso real sigue siendo lo más importante.'
        WHEN 'coast' THEN
            'La colección toma la luz cálida, los tonos suaves y la tranquilidad del Pacífico ecuatoriano. Las piezas se diseñan para sentirse frescas, útiles y sencillas de llevar en el equipaje o de regalar, sin recurrir a gráficos demasiado evidentes.'
        ELSE
            'El diseño busca mantener una identidad clara, materiales agradables y una apariencia fácil de integrar en la vida diaria. Cada detalle tiene una función y la presentación evita adornos que no aporten al uso real del producto.'
    END
WHERE length(trim(COALESCE(story, ''))) < 500;
