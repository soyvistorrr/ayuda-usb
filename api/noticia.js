export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.redirect(302, '/');
    }

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

        if (!noticia) {
            return res.redirect(302, '/');
        }

        const titulo = noticia.titulo.replace(/"/g, '&quot;');
        const descLimpia = noticia.contenido.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';
        
        const img = noticia.imagen_url;

        const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>${titulo}</title>
            
            <meta property="og:type" content="article" />
            <meta property="og:title" content="${titulo}" />
            <meta property="og:description" content="${descLimpia}" />
            ${img ? `<meta property="og:image" content="${img}" />\n<meta name="twitter:image" content="${img}" />` : ''}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${titulo}" />
            <meta name="twitter:description" content="${descLimpia}" />

            <script>
                window.location.replace("/index.html?noticia=${id}");
            </script>
        </head>
        <body style="background-color: #f8fafc; font-family: sans-serif; text-align: center; padding-top: 50px;">
            <p>Abriendo boletín oficial...</p>
        </body>
        </html>
        `;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(html);

    } catch (error) {
        console.error(error);
        return res.redirect(302, '/');
    }
}