export default async function handler(req, res) {
    // 1. Obtener el ID de la noticia desde la URL
    const { id } = req.query;

    // Si no hay ID, mandar al inicio
    if (!id) {
        return res.redirect(302, '/');
    }

    // 2. Conectarnos a tu base de datos Supabase
    const SUPABASE_URL = `https://idirgqiruxvdbgnlrgrp.supabase.co/rest/v1/noticias_oficiales?id=eq.${id}&select=*`;
    const SUPABASE_KEY = "sb_publishable_ECurpyGW8jSgTMe30r89xA_o-WRwADV";

    try {
        const response = await fetch(SUPABASE_URL, {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        });
        
        const data = await response.json();
        const noticia = (data && data.length > 0) ? data[0] : null;

        // Si la noticia no existe, mandar al inicio
        if (!noticia) {
            return res.redirect(302, '/');
        }

        // 3. Preparar los datos limpios para WhatsApp
        const titulo = noticia.titulo.replace(/"/g, '&quot;');
        // Quitar etiquetas HTML del contenido para la descripción
        const descLimpia = noticia.contenido.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';
        
        // Usar la miniatura si existe, si no la imagen grande
        const img = (noticia.imagen_miniatura && noticia.imagen_miniatura.trim() !== '') 
            ? noticia.imagen_miniatura 
            : noticia.imagen_url;

        // 4. Dibujar el HTML invisible con las etiquetas para WhatsApp
        const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>${titulo}</title>
            
            <!-- ETIQUETAS MÁGICAS PARA WHATSAPP Y REDES -->
            <meta property="og:type" content="article" />
            <meta property="og:title" content="${titulo}" />
            <meta property="og:description" content="${descLimpia}" />
            ${img ? `<meta property="og:image" content="${img}" />\n<meta name="twitter:image" content="${img}" />` : ''}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${titulo}" />
            <meta name="twitter:description" content="${descLimpia}" />

            <!-- REDIRECCIÓN INVISIBLE PARA USUARIOS REALES -->
            <script>
                window.location.replace("/index.html?noticia=${id}");
            </script>
        </head>
        <body style="background-color: #f8fafc; font-family: sans-serif; text-align: center; padding-top: 50px;">
            <p>Abriendo boletín oficial...</p>
        </body>
        </html>
        `;

        // Enviar la página al robot de WhatsApp o al navegador
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(html);

    } catch (error) {
        console.error(error);
        return res.redirect(302, '/');
    }
}