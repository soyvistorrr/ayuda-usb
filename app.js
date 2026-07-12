const SUPABASE_URL = "https://idirgqiruxvdbgnlrgrp.supabase.co";
        const SUPABASE_KEY = "sb_publishable_ECurpyGW8jSgTMe30r89xA_o-WRwADV";
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        let registrosNube = [];
        let pedidosLogistica = [];
        let noticiasNube = [];
        let intervaloCarrusel;
        let colaboradoresNube = [];
        let ayudaNube = [];
        let esAdministrador = false; 
        
        let idEnEdicion = null;
        let idEdicionAyuda = null;
        let idEdicionColab = null;

        let sortConfigAfectados = { key: null, direction: 'none' };
        let sortConfigAyuda = { key: null, direction: 'none' };
        let sortConfigColab = { key: null, direction: 'none' };

        const mapaComunidad = { 'usb': 'Universidad Simón Bolívar', 'ext': 'Externo', 'externo': 'Externo', 'universidad simon bolivar': 'Universidad Simón Bolívar' };
        const mapaGrupo = { 'est': 'Estudiante', 'estudiante': 'Estudiante', 'prof': 'Profesor', 'profesor': 'Profesor', 'egr': 'Egresado', 'egresado': 'Egresado', 'adm': 'Administrativo', 'administrativo': 'Administrativo', 'obr': 'Obrero', 'obrero': 'Obrero', 'ext': 'Externo', 'externo': 'Externo' };

        function iniciarCarruselAutomatico() {
            const carrusel = document.getElementById('carrusel-noticias');
            if (!carrusel) return;
            if (intervaloCarrusel) clearInterval(intervaloCarrusel);

            intervaloCarrusel = setInterval(() => {
                const scrollMaximo = carrusel.scrollWidth - carrusel.clientWidth;
                if (carrusel.scrollLeft >= scrollMaximo - 10) {
                    carrusel.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    const tarjeta = carrusel.querySelector('.news-card');
                    if (tarjeta) {
                        const distanciaAvance = tarjeta.offsetWidth + 24; 
                        carrusel.scrollBy({ left: distanciaAvance, behavior: 'smooth' });
                    }
                }
            }, 4000);

            carrusel.addEventListener('mouseenter', () => clearInterval(intervaloCarrusel));
            carrusel.addEventListener('mouseleave', iniciarCarruselAutomatico);
            carrusel.addEventListener('touchstart', () => clearInterval(intervaloCarrusel), {passive: true});
            carrusel.addEventListener('touchend', iniciarCarruselAutomatico, {passive: true});
        }

        window.moverCarrusel = function(direccion) {
            const carrusel = document.getElementById('carrusel-noticias');
            if(carrusel) {
                if (intervaloCarrusel) clearInterval(intervaloCarrusel);
                const tarjeta = carrusel.querySelector('.news-card');
                const avance = tarjeta ? tarjeta.offsetWidth + 24 : 320;
                carrusel.scrollBy({ left: avance * direccion, behavior: 'smooth' });
                setTimeout(iniciarCarruselAutomatico, 6000);
            }
        };

        function hacerLinksClicables(texto) {
            const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
            return texto.replace(urlRegex, function(url) {
                let enlace = url;
                if (!enlace.match('^https?:\/\/')) { enlace = 'https://' + enlace; }
                return `<a href="${enlace}" target="_blank" style="color: #0284c7; text-decoration: underline; font-weight: 700;">${url}</a>`;
            });
        }

        window.abrirNoticiaCompleta = function(id) {
            const n = noticiasNube.find(x => x.id == id);
            if (!n) return;
            if (intervaloCarrusel) clearInterval(intervaloCarrusel);
            
            const fechaObj = new Date(n.fecha_publicacion);
            const fechaString = isNaN(fechaObj) ? '' : fechaObj.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            
            let colorBorde = "var(--primary)"; let colorFondoEtiqueta = "var(--primary)";
            let etiquetaVal = n.etiqueta ? n.etiqueta.toLowerCase() : '';
            if (etiquetaVal.includes('urgente')) { colorBorde = "var(--danger)"; colorFondoEtiqueta = "var(--danger)"; }
            else if (etiquetaVal.includes('logro') || etiquetaVal.includes('buena')) { colorBorde = "var(--success)"; colorFondoEtiqueta = "var(--success)"; }
            else if (etiquetaVal.includes('alerta')) { colorBorde = "var(--warning)"; colorFondoEtiqueta = "#ea580c"; }

            document.getElementById('pagina-noticia-borde').style.borderTopColor = colorBorde;
            const elEtiqueta = document.getElementById('pagina-noticia-etiqueta');
            elEtiqueta.innerText = n.etiqueta || 'Aviso'; elEtiqueta.style.backgroundColor = colorFondoEtiqueta;
            document.getElementById('pagina-noticia-fecha').innerText = fechaString;
            document.getElementById('pagina-noticia-titulo').innerText = n.titulo;
            document.getElementById('pagina-noticia-contenido').innerHTML = hacerLinksClicables(n.contenido);
            
            const imgEl = document.getElementById('pagina-noticia-imagen');
            if (n.imagen_url) { imgEl.src = n.imagen_url; imgEl.style.display = 'block'; }
            else { imgEl.style.display = 'none'; imgEl.src = ''; }
            
            const urlSitioDirecta = window.location.origin + `/api/noticia?id=${n.id}&v=${Date.now()}`;
            
            const textoACompartir = `*Noticias AEUSB*\n*${n.titulo}*\n\nLee los detalles aquí:\n${urlSitioDirecta}`;
            
            const btnWP = `<a href="https://api.whatsapp.com/send?text=${encodeURIComponent(textoACompartir)}" target="_blank" class="btn-share btn-whatsapp">📱 WhatsApp</a>`;
            const btnX = `<a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(textoACompartir)}" target="_blank" class="btn-share btn-twitter">𝕏 Twitter</a>`;
            const btnFB = `<a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlSitioDirecta)}" target="_blank" class="btn-share btn-facebook">👥 Facebook</a>`;
            const btnCopy = `<button onclick="navigator.clipboard.writeText('${urlSitioDirecta}'); mostrarNotificacion('¡Enlace copiado!');" class="btn-share btn-copy">🔗 Copiar Enlace</button>`;
            
            document.getElementById('pagina-botones-compartir').innerHTML = btnWP + btnX + btnFB + btnCopy;

            navegarA('view-noticia-detalle');
            window.history.pushState({ vistaActiva: 'view-noticia-detalle', idNoticia: n.id }, "", `?noticia=${n.id}`);
        };

        function mostrarNotificacion(mensaje, exito = true) {
            const toast = document.getElementById("toast-notificacion");
            const toastMsj = document.getElementById("toast-mensaje");
            const toastIcono = document.getElementById("toast-icono");
            
            toastMsj.innerText = mensaje;
            toastIcono.innerText = exito ? "✅" : "⚠️";
            toast.style.backgroundColor = exito ? "#10b981" : "#dc2626";

            toast.classList.add("mostrar");
            
            setTimeout(function(){ 
                toast.classList.remove("mostrar"); 
            }, 4000);
        }

        function normalizarTexto(txt) {
            return String(txt || '')
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") 
                .trim()
                .replace(/\s+/g, ' '); 
        }

        function sonNombresSimilares(nom1, nom2) {
            const n1 = normalizarTexto(nom1);
            const n2 = normalizarTexto(nom2);
            if (!n1 || !n2) return false;
            if (n1 === n2 || n1.includes(n2) || n2.includes(n1)) return true;

            const tokens1 = n1.split(' ').filter(t => t.length > 2);
            const tokens2 = n2.split(' ').filter(t => t.length > 2);
            if (tokens1.length === 0 || tokens2.length === 0) return false;
            
            const shorter = tokens1.length <= tokens2.length ? tokens1 : tokens2;
            const longer = tokens1.length <= tokens2.length ? tokens2 : tokens1;

            let coincidencias = 0;
            for (let t of shorter) {
                if (longer.includes(t)) coincidencias++;
            }
            return coincidencias === shorter.length;
        }

        function procesarCicloOrden(config, key) {
            if (config.key !== key) {
                config.key = key;
                config.direction = 'asc';
            } else {
                if (config.direction === 'asc') {
                    config.direction = 'desc';
                } else if (config.direction === 'desc') {
                    config.direction = 'none';
                    config.key = null;
                } else {
                    config.direction = 'asc';
                }
            }
        }

        function obtenerSimboloOrden(config, key) {
            if (config.key !== key || config.direction === 'none') return '↕';
            return config.direction === 'asc' ? '▲' : '▼';
        }

        function ordenarColeccion(array, config) {
            if (!config.key || config.direction === 'none') return [...array];
            return [...array].sort((a, b) => {
                let valA = String(a[config.key] || '');
                let valB = String(b[config.key] || '');
                return config.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            });
        }

        window.ordenarTablaAfectados = function(key) {
            procesarCicloOrden(sortConfigAfectados, key);
            
            const mapaIds = {
                'estado': 'sort-af-estado', 'cedula_identidad': 'sort-af-cedula_identidad', 'nombre': 'sort-af-nombre',
                'cedula': 'sort-af-cedula', 'edad': 'sort-af-edad', 'damnificado': 'sort-af-damnificado',
                'ubicacion': 'sort-af-ubicacion', 'telefono': 'sort-af-telefono', 'observaciones': 'sort-af-observaciones'
            };
            
            for (let k in mapaIds) {
                const el = document.getElementById(mapaIds[k]);
                if (el) {
                    el.innerText = obtenerSimboloOrden(sortConfigAfectados, k);
                }
            }
            
            filtrarYActualizarTablero();
        };

        window.ordenarTablaAyuda = function(key) {
            procesarCicloOrden(sortConfigAyuda, key);
            actualizarInterfazAyuda(ayudaNube);
        };

        window.ordenarTablaColab = function(key) {
            procesarCicloOrden(sortConfigColab, key);
            actualizarInterfazColaboradores(colaboradoresNube);
        };

        function navegarA(idSeccion, desdeHistorial = false) {
            document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active'));
            const seccionDestino = document.getElementById(idSeccion);
            if (seccionDestino) seccionDestino.classList.add('active');
            
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active-nav'));
            const navActivo = document.querySelector(`.nav-item[onclick*="${idSeccion}"]`);
            if (navActivo) navActivo.classList.add('active-nav');
            
            if (!desdeHistorial) {
                let nuevaUrl = idSeccion === 'view-home' ? window.location.pathname : "#" + idSeccion;
                window.history.pushState({ vistaActiva: idSeccion }, "", nuevaUrl);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        let perfilUsuarioActual = null;

        window.conmutarAccesoSeguro = async function() {
            if (!esAdministrador) {
                document.getElementById('modal-login').style.display = 'flex';
            } else {
                if(!confirm("¿Seguro que deseas cerrar sesión?")) return;
                
                await supabaseClient.auth.signOut();
                esAdministrador = false;
                perfilUsuarioActual = null;
                
                document.getElementById('btn-toggle-role').innerHTML = "🔒 Acceso Administrador";
                
                const malla = document.getElementById('mallaPrincipal');
                const mallaAyuda = document.getElementById('mallaAyuda');
                const mallaColab = document.getElementById('mallaColaboradores');
                
                if (malla) malla.classList.remove('admin-columns-layout');
                if (mallaAyuda) mallaAyuda.classList.remove('admin-columns-layout');
                if (mallaColab) mallaColab.classList.remove('admin-columns-layout');
                
                document.getElementById('panel-formulario-afectado').style.display = "none";
                document.getElementById('panel-tabla-solicitudes').style.display = "none";
                document.getElementById('dropZone').style.display = "none";
                document.getElementById('btn-acceso-logistica').style.display = "none";
                
                document.getElementById('btnExportar').style.display = "none";
                document.getElementById('btnExportarColab').style.display = "none";
                document.getElementById('btnExportarAyuda').style.display = "none";

                document.querySelectorAll('.admin-action-header').forEach(el => el.style.display = "none");
                
                const btnAdmin = document.getElementById('btn-novedades-admin');
                if (btnAdmin) btnAdmin.style.setProperty('display', 'none', 'important');
                document.getElementById('modal-admin-novedades').style.display = 'none';

                cancelarEdicion();
                filtrarYActualizarTablero();
                actualizarInterfazColaboradores(colaboradoresNube);
                actualizarInterfazAyuda(ayudaNube);
                
                mostrarNotificacion("Sesión cerrada correctamente.");
            }
        };

        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login_email').value.trim();
            const password = document.getElementById('login_password').value;
            const btnSubmit = document.getElementById('btn-login-submit');
            
            btnSubmit.innerText = "Verificando...";
            btnSubmit.disabled = true;

            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) throw error;

                const { data: perfilData, error: perfilError } = await supabaseClient
                    .from('perfiles_admin')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                if (perfilError) throw new Error("No se encontró un perfil asignado a este usuario.");

                perfilUsuarioActual = perfilData;
                esAdministrador = true;
                
                document.getElementById('modal-login').style.display = 'none';
                document.getElementById('loginForm').reset();
                document.getElementById('btn-toggle-role').innerText = `Cerrar Sesión (${perfilUsuarioActual.rol})`;
                
                const malla = document.getElementById('mallaPrincipal');
                const mallaAyuda = document.getElementById('mallaAyuda');
                const mallaColab = document.getElementById('mallaColaboradores');
                
                if (malla) malla.classList.add('admin-columns-layout');
                if (mallaAyuda) mallaAyuda.classList.add('admin-columns-layout');
                if (mallaColab) mallaColab.classList.add('admin-columns-layout');
                
                document.getElementById('panel-formulario-afectado').style.display = "block";
                document.getElementById('btn-acceso-logistica').style.display = "flex";
                document.getElementById('panel-tabla-solicitudes').style.display = "block";
                document.getElementById('dropZone').style.display = "block";
                
                document.getElementById('btnExportar').style.display = "inline-flex";
                document.getElementById('btnExportarColab').style.display = "inline-flex";
                document.getElementById('btnExportarAyuda').style.display = "inline-flex";

                document.querySelectorAll('.admin-action-header').forEach(el => el.style.display = "table-cell");
                
                mostrarNotificacion(`¡Bienvenido! Sede asignada: ${perfilUsuarioActual.centro_acopio}`);
                
                await cargarDatosDesdeNube();

            } catch (err) {
                alert("Error de acceso: " + (err.message === "Invalid login credentials" ? "Correo o contraseña incorrectos." : err.message));
            } finally {
                btnSubmit.innerText = "Ingresar al Sistema";
                btnSubmit.disabled = false;
            }
        });

        function enmascararTelefono(tlf) {
            let t = String(tlf || '').trim();
            if (!t || t === '-') return '-';
            if (esAdministrador) return t; 
            return t.length > 4 ? t.substring(0, 4) + "-***" + t.substring(t.length - 4) : "****";
        }

        function enmascararCedula(ced) {
            let c = String(ced || '').trim();
            if (!c || c === '-') return '-';
            if (esAdministrador) return c; 
            return c.length > 4 ? c.substring(0, c.length - 4) + "****" : "****";
        }

        async function cargarDatosDesdeNube() {
            if (registrosNube.length === 0) {
                const cuerpo = document.getElementById('tablaCuerpo');
                if (cuerpo) cuerpo.innerHTML = '<tr><td colspan="10" style="text-align:center; padding: 3rem; color: var(--text-muted);"><strong>⏳ Conectando con la base de datos...</strong></td></tr>';
            }

            try {
                const [resAfectados, resNoticias] = await Promise.all([
                    supabaseClient
                        .from('registros_ciudadanos')
                        .select('id, nombre, cedula_identidad, cedula, edad, estado, damnificado, ubicacion, telefono, observaciones')
                        .order('created_at', { ascending: false })
                        .limit(1000),
                    supabaseClient
                        .from('noticias_oficiales')
                        .select('id, titulo, contenido, fecha_publicacion, etiqueta, imagen_url, imagen_miniatura')
                        .order('fecha_publicacion', { ascending: false })
                        .limit(15)
                ]);

                let tempAfectados = resAfectados.data || [];
                if (tempAfectados.length === 1000) {
                    let rangoInicio = 1000;
                    let rangoFin = 1999;
                    let hayMasDatos = true;
                    while (hayMasDatos) {
                        const { data } = await supabaseClient.from('registros_ciudadanos')
                            .select('id, nombre, cedula_identidad, cedula, edad, estado, damnificado, ubicacion, telefono, observaciones')
                            .order('created_at', { ascending: false }).range(rangoInicio, rangoFin);
                        
                        if (data && data.length > 0) {
                            tempAfectados = tempAfectados.concat(data);
                            rangoInicio += 1000;
                            rangoFin += 1000;
                        }
                        if (!data || data.length < 1000) hayMasDatos = false; 
                    }
                }
                registrosNube = tempAfectados;

                if (resNoticias && resNoticias.data) {
                    noticiasNube = resNoticias.data; 
                    const contenedorCarrusel = document.getElementById('carrusel-noticias');
                    const contenedorPagina = document.getElementById('contenedor-todas-noticias');
                    
                    if (resNoticias.data.length === 0) {
                        const msjVacio = '<div style="color: var(--text-muted);">No hay boletines.</div>';
                        if(contenedorCarrusel) contenedorCarrusel.innerHTML = msjVacio;
                        if(contenedorPagina) contenedorPagina.innerHTML = msjVacio;
                    } else {
                        let htmlCarrusel = ''; let htmlPagina = '';
                        resNoticias.data.forEach((n, index) => {
                            const fString = new Date(n.fecha_publicacion).toLocaleDateString('es-VE', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
                            let colBorde = "var(--accent)"; let colFondo = "var(--primary)";
                            let eVal = n.etiqueta ? n.etiqueta.toLowerCase() : '';
                            if (eVal.includes('urgente')) { colBorde = "var(--danger)"; colFondo = "var(--danger)"; }
                            else if (eVal.includes('logro')||eVal.includes('buena')) { colBorde = "var(--success)"; colFondo = "var(--success)"; }
                            else if (eVal.includes('alerta')) { colBorde = "var(--warning)"; colFondo = "#ea580c"; }

                            let thumbHtml = '';
                            let urlMini = (n.imagen_miniatura && n.imagen_miniatura.trim() !== '') ? n.imagen_miniatura : n.imagen_url;
                            
                            if (urlMini && urlMini.trim() !== '') {
                                thumbHtml = `<div class="news-thumbnail" style="background-image: url('${urlMini}'); display: block; background-size: contain; background-color: var(--gray-100); background-repeat: no-repeat;"></div>`;
                            } else {
                                thumbHtml = `
                                <div class="news-thumbnail" style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); display: flex; align-items: center; justify-content: center; border-bottom: 3px solid ${colBorde};">
                                    <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"></path>
                                        <line x1="8" y1="7" x2="16" y2="7"></line>
                                        <line x1="8" y1="11" x2="16" y2="11"></line>
                                        <line x1="8" y1="15" x2="12" y2="15"></line>
                                    </svg>
                                </div>`;
                            }
                            const tarjetaInterior = `${thumbHtml}<div style="display:flex; justify-content:space-between; align-items:center;"><span class="news-badge" style="background-color:${colFondo};">${n.etiqueta || 'Aviso'}</span><span class="news-date">${fString}</span></div><h4 class="news-title">${n.titulo}</h4><div class="news-body">${n.contenido}</div><div class="leer-mas-link">Leer completo ➔</div>`;

                            if (index < 8) htmlCarrusel += `<div class="news-card" style="border-left-color:${colBorde};" onclick="abrirNoticiaCompleta('${n.id}')">${tarjetaInterior}</div>`;
                            htmlPagina += `<div class="news-card" style="border-left-color:${colBorde}; height:auto!important; min-height:280px;" onclick="abrirNoticiaCompleta('${n.id}')">${tarjetaInterior}</div>`;
                        });
                        
                        if(contenedorCarrusel) { contenedorCarrusel.innerHTML = htmlCarrusel; iniciarCarruselAutomatico(); }
                        if(contenedorPagina) contenedorPagina.innerHTML = htmlPagina;
                    }
                }

                filtrarYActualizarTablero();

                if (esAdministrador) {
                    const [resColabs, resAyudas, resNov] = await Promise.all([
                        supabaseClient.from('colaboradores')
                            .select('id, nombre, cargo_usb, ubicacion_geografica, area_apoyo, traslado_logistico, lugar_voluntariado, vehiculo, ofrecimiento_detallado, telefono, disponibilidad')
                            .order('created_at', { ascending: false }).limit(500),
                        supabaseClient.from('solicitudes_ayuda')
                            .select('id, tipo_reporte, nombre, cedula, telefono, correo, sede_usb, carnet_estudiante, comunidad, grupo, estado_residencial, eje_logistico, direccion_residencial, afectacion_vivienda, requiere_refugio, servicios_afectados, estado, lesiones_fisicas, damnificado, ubicacion, descripcion_ayuda')
                            .order('created_at', { ascending: false }).limit(500),
                        supabaseClient.from('novedades_pendientes').select('*').order('created_at', { ascending: false })
                    ]);

                    colaboradoresNube = resColabs.data || [];
                    ayudaNube = resAyudas.data || [];
                    
                    const btnAdmin = document.getElementById('btn-novedades-admin');
                    let nov = resNov.data || [];
                    
                    if (nov && nov.length > 0) {
                        if (btnAdmin) {
                            btnAdmin.style.setProperty('display', 'flex', 'important');
                            btnAdmin.style.zIndex = '999999';
                        }
                        
                        document.getElementById('contador-novedades').innerText = nov.length;
                        
                        let htmlNovedades = '';
                        nov.forEach(n => {
                            let original = registrosNube.find(r => r.id == n.registro_id);
                            let nomOrig = original ? original.nombre : 'Usuario no encontrado';
                            let estOrig = original ? original.estado : 'Desconocido';
                            
                            let cedOrig = 'No tiene';
                            if (original && original.cedula_identidad && original.cedula_identidad.trim() !== '' && original.cedula_identidad.trim() !== '-') {
                                cedOrig = original.cedula_identidad;
                            }
                            
                            let comBruto = original ? (original.cedula || '-') : '-';
                            let grpBruto = original ? (original.edad || '-') : '-';
                            let comLimpia = mapaComunidad[comBruto.trim().toLowerCase()] || comBruto;
                            let grpLimpio = mapaGrupo[grpBruto.trim().toLowerCase()] || grpBruto;
                            
                            htmlNovedades += `
                            <div style="border:1px solid #e5e7eb; padding:15px; border-radius:8px; margin-bottom:15px; background:#f8fafc; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                                    <h4 style="margin: 0 0 8px 0; color: var(--primary); font-size: 1.05rem;">👤 Afectado: ${nomOrig}</h4>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85rem; color: #475569;">
                                        <div><strong>Cédula:</strong> ${cedOrig}</div>
                                        <div><strong>Vínculo:</strong> ${comLimpia} / ${grpLimpio}</div>
                                        <div style="grid-column: span 2;"><strong>ESTADO ACTUAL:</strong> <span class="badge" style="background:#64748b; color:white; padding:3px 6px;">${estOrig}</span></div>
                                    </div>
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <h5 style="margin: 0 0 8px 0; color: #0284c7; font-size: 0.95rem;">📢 Cambio Sugerido:</h5>
                                    <div style="background: #fff; padding: 10px; border: 1px dashed #cbd5e1; border-radius: 6px;">
                                        <p style="font-size: 0.85rem; margin: 0 0 4px 0;"><strong>Reporta:</strong> ${n.nombre_reportante} (${n.relacion})</p>
                                        <p style="font-size: 0.85rem; margin: 0 0 4px 0;"><strong>Teléfono:</strong> 📞 ${n.telefono_reportante}</p>
                                        <p style="font-size: 0.85rem; margin: 0 0 4px 0;"><strong>NUEVO ESTADO:</strong> <span class="badge" style="background:#10b981; color:white; padding:3px 6px;">${n.estado_sugerido}</span></p>
                                        <p style="font-size: 0.85rem; margin: 4px 0 0 0; color: #333;"><strong>Observaciones:</strong> ${n.observaciones}</p>
                                    </div>
                                </div>
                                <div style="display:flex; gap:10px;">
                                    <button class="btn" style="background:#10b981; color:white; padding:8px 10px; flex:1; font-weight:bold; border-radius:6px;" onclick="aprobarNovedad('${n.id}', '${n.registro_id}', '${n.estado_sugerido}', '${n.observaciones.replace(/'/g, "\\'")}')">✅ Aprobar</button>
                                    <button class="btn" style="background:#dc2626; color:white; padding:8px 10px; flex:1; font-weight:bold; border-radius:6px;" onclick="rechazarNovedad('${n.id}')">❌ Rechazar</button>
                                </div>
                            </div>`;
                        });
                        document.getElementById('contenedor-lista-novedades').innerHTML = htmlNovedades;
                    } else {
                        if (btnAdmin) btnAdmin.style.setProperty('display', 'none', 'important');
                        document.getElementById('contenedor-lista-novedades').innerHTML = '<p style="text-align:center; padding: 20px; color: #64748b;">✅ No hay reportes pendientes de revisión.</p>';
                    }
                    actualizarInterfazColaboradores(colaboradoresNube);
                    actualizarInterfazAyuda(ayudaNube);
                }

            } catch (error) {
                console.error("Error en sincronización:", error);
            }
        }

        function filtrarYActualizarTablero() {
            const texto = document.getElementById('buscarInput').value.toLowerCase();
            const filterEst = document.getElementById('filtroEstado').value;
            const filterGrp = document.getElementById('filtroGrupo').value;
            const filterDup = document.getElementById('filtroDuplicados').value;

            let registrosFiltrados = registrosNube.filter(r => {
                const cumpleTexto = String(r.nombre || '').toLowerCase().includes(texto);
                
                let estStr = String(r.estado || 'Sin Información').toLowerCase();
                let cumpleEst = true;
                if (filterEst !== 'Todos') {
                    if (filterEst === 'Sin Información') cumpleEst = estStr.includes('informacion') || estStr.includes('información') || estStr.includes('❓');
                    if (filterEst === 'Desaparecido') cumpleEst = estStr.includes('desaparecido');
                    if (filterEst === 'Con Vida') cumpleEst = estStr.includes('vida') || estStr.includes('bien') || estStr.includes('✅');
                    if (filterEst === 'Atrapado') cumpleEst = estStr.includes('atrapado') || estStr.includes('emergencia') || estStr.includes('⚠️');
                    if (filterEst === 'Fallecido') cumpleEst = estStr.includes('fallecido') || estStr.includes('🕊️');
                }

                let grpStr = mapaGrupo[String(r.edad).trim().toLowerCase()] || r.edad || 'Estudiante';
                let cumpleGrp = (filterGrp === 'Todos') || (grpStr.toLowerCase() === filterGrp.toLowerCase());

                return cumpleTexto && cumpleEst && cumpleGrp;
            });

            if (filterDup === 'Duplicados') {
                registrosFiltrados = registrosFiltrados.filter(r1 => {
                    return registrosNube.some(r2 => r1.id !== r2.id && sonNombresSimilares(r1.nombre, r2.nombre));
                });
            }

            actualizarInterfazTablero(registrosFiltrados);
        }

        function actualizarInterfazTablero(datosFiltrados) {
            const cuerpo = document.getElementById('tablaCuerpo');
            if (!cuerpo) return;
            
            let htmlFinal = '';
            let datosOrdenados = ordenarColeccion(datosFiltrados, sortConfigAfectados);
            
            datosOrdenados.forEach(reg => {
                let badgeClass = 'badge-info';
                let est = String(reg.estado || 'Sin Información').trim();
                if (est.toLowerCase().includes('desaparecido') || est.toLowerCase().includes('informacion') || est.toLowerCase().includes('información') || est.includes('❓')) badgeClass = 'badge-warning';
                if (est.toLowerCase().includes('vida') || est.toLowerCase().includes('bien') || est.includes('✅')) badgeClass = 'badge-success';
                if (est.toLowerCase().includes('atrapado') || est.toLowerCase().includes('emergencia') || est.includes('⚠️')) badgeClass = 'badge-danger';
                if (est.toLowerCase().includes('fallecido') || est.includes('🕊️')) badgeClass = 'badge-gray';

                let comLimpia = mapaComunidad[String(reg.cedula).trim().toLowerCase()] || reg.cedula || '-';
                let grpLimpio = mapaGrupo[String(reg.edad).trim().toLowerCase()] || reg.edad || '-';
                let damLimpio = reg.damnificado || 'No sé';

                htmlFinal += `
                    <tr>
                        <td data-label="Situación">
                            <span class="badge ${badgeClass}">${est}</span><br>
                            <button onclick="abrirFormularioNovedad('${reg.id}', '${reg.nombre.replace(/'/g, "\\'")}')" class="link-actualizar">📝 Sugerir Cambio</button>
                        </td>
                        <td data-label="Cédula">${enmascararCedula(reg.cedula_identidad)}</td>
                        <td data-label="Nombre" style="position: relative;">
                            <strong>${reg.nombre}</strong>
                        </td>
                        <td data-label="Comunidad">${comLimpia}</td>
                        <td data-label="Grupo">${grpLimpio}</td>
                        <td data-label="Damnificado">${damLimpio}</td>
                        <td data-label="Ubicación"><div class="text-truncate-clamp">${reg.ubicacion || '-'}</div></td>
                        <td data-label="Teléfono">${enmascararTelefono(reg.telefono)}</td>
                        <td data-label="Observación"><div class="text-truncate-clamp">${reg.observaciones || '-'}</div></td>
                        ${esAdministrador ? `<td class="actions-cell admin-action-header" data-label="Acciones"><button class="btn-edit-table" onclick="activarEdiciónEnPagina('${reg.id}')">Editar</button><button class="btn-delete" onclick="eliminarFila('${reg.id}', this)">Eliminar</button></td>` : ''}
                    </tr>
                `;
            });
            
            cuerpo.innerHTML = htmlFinal;

            let total = registrosNube.length;
            let trap = registrosNube.filter(r => r.estado && (String(r.estado).toLowerCase().includes('atrapado') || String(r.estado).includes('⚠️'))).length;
            let vivos = registrosNube.filter(r => r.estado && (String(r.estado).toLowerCase().includes('vida') || String(r.estado).toLowerCase().includes('bien') || String(r.estado).includes('✅'))).length;
            let sinInfo = registrosNube.filter(r => r.estado && (String(r.estado).toLowerCase().includes('informacion') || String(r.estado).toLowerCase().includes('información') || String(r.estado).includes('❓'))).length;
            let desaparecidosReal = registrosNube.filter(r => r.estado && String(r.estado).toLowerCase().includes('desaparecido')).length;
            let fall = registrosNube.filter(r => r.estado && (String(r.estado).toLowerCase().includes('fallecido') || String(r.estado).includes('🕊️'))).length;

            const elTotal = document.getElementById('stat-total'); if (elTotal) elTotal.innerText = total;
            const elTrap = document.getElementById('stat-atrapados'); if (elTrap) elTrap.innerText = trap;
            const elVivos = document.getElementById('stat-vivos'); if (elVivos) elVivos.innerText = vivos;
            const elDes = document.getElementById('stat-desaparecidos'); if (elDes) elDes.innerText = sinInfo;
            const elDesReal = document.getElementById('stat-desaparecidos-real'); if (elDesReal) elDesReal.innerText = desaparecidosReal;
            const elFall = document.getElementById('stat-fallecidos'); if (elFall) elFall.innerText = fall;
        }

        function actualizarInterfazColaboradores(datos) {
            const thead = document.getElementById('theadColab');
            const cuerpo = document.getElementById('tablaColabCuerpo');
            if (!thead || !cuerpo) return;

            if (esAdministrador) {
                thead.innerHTML = `<tr>
                    <th onclick="ordenarTablaColab('nombre')" style="cursor:pointer">VOLUNTARIO ${obtenerSimboloOrden(sortConfigColab, 'nombre')}</th>
                    <th onclick="ordenarTablaColab('cargo_usb')" style="cursor:pointer">VÍNCULO USB ${obtenerSimboloOrden(sortConfigColab, 'cargo_usb')}</th>
                    <th onclick="ordenarTablaColab('ubicacion_geografica')" style="cursor:pointer">UBICACIÓN BASE ${obtenerSimboloOrden(sortConfigColab, 'ubicacion_geografica')}</th>
                    <th onclick="ordenarTablaColab('area_apoyo')" style="cursor:pointer">ÁREA DE APOYO ${obtenerSimboloOrden(sortConfigColab, 'area_apoyo')}</th>
                    <th onclick="ordenarTablaColab('traslado_logistico')" style="cursor:pointer">LOGÍSTICA TRASLADO ${obtenerSimboloOrden(sortConfigColab, 'traslado_logistico')}</th>
                    <th onclick="ordenarTablaColab('lugar_voluntariado')" style="cursor:pointer">LUGAR DESTINO ${obtenerSimboloOrden(sortConfigColab, 'lugar_voluntariado')}</th>
                    <th onclick="ordenarTablaColab('vehiculo')" style="cursor:pointer">VEHÍCULO ${obtenerSimboloOrden(sortConfigColab, 'vehiculo')}</th>
                    <th onclick="ordenarTablaColab('ofrecimiento_detallado')" style="cursor:pointer">OFRECIMIENTO ${obtenerSimboloOrden(sortConfigColab, 'ofrecimiento_detallado')}</th>
                    <th onclick="ordenarTablaColab('telefono')" style="cursor:pointer">TELÉFONO ${obtenerSimboloOrden(sortConfigColab, 'telefono')}</th>
                    <th onclick="ordenarTablaColab('disponibilidad')" style="cursor:pointer">NOTAS ${obtenerSimboloOrden(sortConfigColab, 'disponibilidad')}</th>
                    <th class="admin-action-header">ACCIONES</th>
                </tr>`;
            } else {
                thead.innerHTML = `<tr>
                    <th onclick="ordenarTablaColab('nombre')" style="cursor:pointer">VOLUNTARIO ${obtenerSimboloOrden(sortConfigColab, 'nombre')}</th>
                    <th onclick="ordenarTablaColab('cargo_usb')" style="cursor:pointer">VÍNCULO USB ${obtenerSimboloOrden(sortConfigColab, 'cargo_usb')}</th>
                    <th onclick="ordenarTablaColab('ubicacion_geografica')" style="cursor:pointer">UBICACIÓN BASE ${obtenerSimboloOrden(sortConfigColab, 'ubicacion_geografica')}</th>
                    <th onclick="ordenarTablaColab('area_apoyo')" style="cursor:pointer">ÁREA DE APOYO ${obtenerSimboloOrden(sortConfigColab, 'area_apoyo')}</th>
                    <th onclick="ordenarTablaColab('traslado_logistico')" style="cursor:pointer">LOGÍSTICA TRASLADO ${obtenerSimboloOrden(sortConfigColab, 'traslado_logistico')}</th>
                    <th onclick="ordenarTablaColab('lugar_voluntariado')" style="cursor:pointer">LUGAR DESTINO ${obtenerSimboloOrden(sortConfigColab, 'lugar_voluntariado')}</th>
                    <th onclick="ordenarTablaColab('vehiculo')" style="cursor:pointer">VEHÍCULO ${obtenerSimboloOrden(sortConfigColab, 'vehiculo')}</th>
                    <th onclick="ordenarTablaColab('ofrecimiento_detallado')" style="cursor:pointer">OFRECIMIENTO ${obtenerSimboloOrden(sortConfigColab, 'ofrecimiento_detallado')}</th>
                    <th onclick="ordenarTablaColab('disponibilidad')" style="cursor:pointer">NOTAS ${obtenerSimboloOrden(sortConfigColab, 'disponibilidad')}</th>
                </tr>`;
            }

            let htmlFinal = '';
            let datosOrdenados = ordenarColeccion(datos, sortConfigColab);

            datosOrdenados.forEach(c => {
                let grpVoluntario = mapaGrupo[String(c.cargo_usb).trim().toLowerCase()] || c.cargo_usb || 'Estudiante';
                
                if (esAdministrador) {
                    htmlFinal += `<tr>
                        <td data-label="Voluntario"><strong>${c.nombre}</strong></td>
                        <td data-label="Vínculo USB">${grpVoluntario}</td>
                        <td data-label="Ubicación Base">${c.ubicacion_geografica || '-'}</td>
                        <td data-label="ÁREA APOYO"><span class="badge badge-success" style="background-color:#e0f2fe; color:#0369a1;">${c.area_apoyo}</span></td>
                        <td data-label="Logística Traslado">${c.traslado_logistico || '-'}</td>
                        <td data-label="Lugar Destino">${c.lugar_voluntariado || 'Punto de Acopio USB'}</td>
                        <td data-label="Vehículo">${c.vehiculo || 'No'}</td>
                        <td data-label="Ofrecimiento Detallado"><div class="text-truncate-clamp">${c.ofrecimiento_detallado || '-'}</div></td>
                        <td data-label="Teléfono">${c.telefono || '-'}</td>
                        <td data-label="Notas"><div class="text-truncate-clamp">${c.disponibilidad || '-'}</div></td>
                        <td class="actions-cell admin-action-header" data-label="Acciones"><button class="btn-edit-table" onclick="activarEdicionColab('${c.id}')">Editar</button><button class="btn-delete" onclick="eliminarColab('${c.id}', this)">Eliminar</button></td>
                    </tr>`;
                } else {
                    htmlFinal += `<tr>
                        <td data-label="Voluntario"><strong>${c.nombre}</strong></td>
                        <td data-label="Vínculo USB">${grpVoluntario}</td>
                        <td data-label="Ubicación Base">${c.ubicacion_geografica || '-'}</td>
                        <td data-label="ÁREA APOYO"><span class="badge badge-success" style="background-color:#e0f2fe; color:#0369a1;">${c.area_apoyo}</span></td>
                        <td data-label="Logística Traslado">${c.traslado_logistico || '-'}</td>
                        <td data-label="Lugar Destino">${c.lugar_voluntariado || 'Punto de Acopio USB'}</td>
                        <td data-label="Vehículo">${c.vehiculo || 'No'}</td>
                        <td data-label="Ofrecimiento Detallado"><div class="text-truncate-clamp">${c.ofrecimiento_detallado || '-'}</div></td>
                        <td data-label="Notas"><div class="text-truncate-clamp">${c.disponibilidad || '-'}</div></td>
                    </tr>`;
                }
            });
            cuerpo.innerHTML = htmlFinal;
        }

        function actualizarInterfazAyuda(datos) {
            const thead = document.getElementById('theadAyuda');
            const cuerpo = document.getElementById('tablaAyudaCuerpo');
            if (!thead || !cuerpo) return;

            const puedeEditar = perfilUsuarioActual && perfilUsuarioActual.rol === 'super_admin';
            let encabezadoAcciones = puedeEditar ? `<th class="admin-action-header">ACCIONES</th>` : '';

            thead.innerHTML = `<tr>
                <th onclick="ordenarTablaAyuda('punto_usb')" style="cursor:pointer">PUNTO ACOPIO ↕</th>
                <th onclick="ordenarTablaAyuda('nombre')" style="cursor:pointer">AFECTADO ↕</th>
                <th onclick="ordenarTablaAyuda('cedula')" style="cursor:pointer">CÉDULA ↕</th>
                <th onclick="ordenarTablaAyuda('telefono')" style="cursor:pointer">TELÉFONO ↕</th>
                <th onclick="ordenarTablaAyuda('grupo')" style="cursor:pointer">RELACIÓN USB ↕</th>
                <th onclick="ordenarTablaAyuda('estado')" style="cursor:pointer">VITAL ↕</th>
                <th onclick="ordenarTablaAyuda('ubicacion')" style="cursor:pointer">UBICACIÓN ↕</th>
                <th onclick="ordenarTablaAyuda('servicios_afectados')" style="cursor:pointer">SERVICIOS ↕</th>
                <th onclick="ordenarTablaAyuda('es_damnificado')" style="cursor:pointer">DAMNIFICADO ↕</th>
                <th onclick="ordenarTablaAyuda('requiere_atencion_medica')" style="cursor:pointer">MÉDICO URG. ↕</th>
                <th onclick="ordenarTablaAyuda('personas_hogar')" style="cursor:pointer">FAMILIA ↕</th>
                <th onclick="ordenarTablaAyuda('req_medicina')" style="cursor:pointer">MEDICINA ↕</th>
                <th onclick="ordenarTablaAyuda('req_alimentos')" style="cursor:pointer">ALIMENTOS ↕</th>
                <th onclick="ordenarTablaAyuda('req_limpieza')" style="cursor:pointer">LIMPIEZA ↕</th>
                <th onclick="ordenarTablaAyuda('req_general')" style="cursor:pointer">GENERAL ↕</th>
                <th onclick="ordenarTablaAyuda('descripcion_ayuda')" style="cursor:pointer">OBSERVACIONES ↕</th>
                ${encabezadoAcciones}
            </tr>`;

            let htmlFinal = '';
            let datosOrdenados = ordenarColeccion(datos, sortConfigAyuda);

            datosOrdenados.forEach(a => {
                let botonesAccion = puedeEditar 
                    ? `<td class="actions-cell admin-action-header">
                        <button class="btn-edit-table" onclick="activarEdicionAyuda('${a.id}')">Editar</button>
                        <button class="btn-delete" onclick="eliminarAyuda('${a.id}', this)">Eliminar</button>
                    </td>` : '';

                let badgeDamnificado = a.es_damnificado ? `<span style="background: #dc3545; color: white; padding: 3px 6px; border-radius: 4px;">SÍ</span>` : `NO`;
                let badgeMedico = a.requiere_atencion_medica ? `<span style="background: #ff9800; color: white; padding: 3px 6px; border-radius: 4px;">SÍ</span>` : `NO`;

                htmlFinal += `<tr>
                    <td><strong>${a.punto_usb || '-'}</strong></td>
                    <td><strong>${a.nombre}</strong></td>
                    <td>${a.cedula || '-'}</td>
                    <td>${a.telefono || '-'}</td>
                    <td>${a.grupo || '-'}</td>
                    <td><strong>${a.estado || '-'}</strong></td>
                    <td><div class="text-truncate-clamp" title="${a.ubicacion || ''}">${a.ubicacion || '-'}</div></td>
                    <td><div class="text-truncate-clamp">${a.servicios_afectados || '-'}</div></td>
                    <td>${badgeDamnificado}</td>
                    <td>${badgeMedico}</td>
                    <td>${a.personas_hogar || '-'}</td>
                    <td><div class="text-truncate-clamp">${a.req_medicina || '-'}</div></td>
                    <td><div class="text-truncate-clamp">${a.req_alimentos || '-'}</div></td>
                    <td><div class="text-truncate-clamp">${a.req_limpieza || '-'}</div></td>
                    <td><div class="text-truncate-clamp">${a.req_general || '-'}</div></td>
                    <td><div class="text-truncate-clamp">${a.descripcion_ayuda || '-'}</div></td>
                    ${botonesAccion}
                </tr>`;
            });
            cuerpo.innerHTML = htmlFinal;
        }

        window.activarEdicionAyuda = function(id) {
            const reg = ayudaNube.find(r => r.id == id);
            if (!reg) return;
            idEdicionAyuda = id;
            
            document.getElementById('tipoReporteForm').value = reg.tipo_reporte || 'Para mí';
            document.getElementById('estadoVitalForm').value = reg.estado || 'Con vida';
            document.getElementById('puntoUsbForm').value = reg.punto_usb || '';
            document.getElementById('ubicacionAfectado').value = reg.ubicacion || '';
            document.getElementById('nombreAfectado').value = reg.nombre || '';
            document.getElementById('cedulaAfectado').value = reg.cedula === '-' ? '' : (reg.cedula || '');
            document.getElementById('telefonoAfectado').value = reg.telefono || '';
            document.getElementById('correoAfectado').value = reg.correo || '';
            document.getElementById('carnetAfectado').value = reg.carnet_estudiante === 'N/A' ? '' : (reg.carnet_estudiante || '');
            document.getElementById('grupoAfectado').value = reg.grupo || '';
            
            document.getElementById('damnificadoAfectado').checked = reg.es_damnificado || false;
            document.getElementById('atencionMedica').checked = reg.requiere_atencion_medica || false;
            document.getElementById('serviciosAfectados').value = reg.servicios_afectados || '';
            
            document.getElementById('personasHogar').value = reg.personas_hogar || 1;
            document.getElementById('ninosHogar').value = reg.ninos_hogar || 0;
            document.getElementById('adultosMayores').value = reg.adultos_mayores_hogar || 0;
            
            document.getElementById('reqMedicina').value = reg.req_medicina || '';
            document.getElementById('reqAlimentos').value = reg.req_alimentos || '';
            document.getElementById('reqLimpieza').value = reg.req_limpieza || '';
            document.getElementById('reqGeneral').value = reg.req_general || '';
            document.getElementById('observacionesAfectado').value = reg.descripcion_ayuda || '';

            const formSubmitBtn = document.querySelector('#formSolicitudAyuda button[type="submit"]');
            if(formSubmitBtn) formSubmitBtn.innerText = "Actualizar Solicitud";
            
            let cancelBtn = document.getElementById('btn-cancelar-edicion-ayuda');
            if(!cancelBtn) {
                cancelBtn = document.createElement('button');
                cancelBtn.id = 'btn-cancelar-edicion-ayuda';
                cancelBtn.type = 'button';
                cancelBtn.className = 'btn btn-delete btn-block';
                cancelBtn.style.marginTop = '0.5rem';
                cancelBtn.innerText = 'Cancelar Edición';
                cancelBtn.onclick = cancelarEdicionAyuda;
                document.getElementById('formSolicitudAyuda').appendChild(cancelBtn);
            }
            cancelBtn.style.display = 'block';
            
            window.scrollTo({ top: document.getElementById('formSolicitudAyuda').offsetTop - 20, behavior: 'smooth' });
        };

        function cancelarEdicionAyuda() {
            idEdicionAyuda = null;
            document.getElementById('formSolicitudAyuda').reset();
            const formSubmitBtn = document.querySelector('#formSolicitudAyuda button[type="submit"]');
            if(formSubmitBtn) formSubmitBtn.innerText = "Registrar Solicitud";
            const cancelBtn = document.getElementById('btn-cancelar-edicion-ayuda');
            if(cancelBtn) cancelBtn.style.display = 'none';
        }

        document.getElementById('formSolicitudAyuda').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const reqMed = document.getElementById('reqMedicina').value.trim();
            const reqAli = document.getElementById('reqAlimentos').value.trim();
            const reqHig = document.getElementById('reqLimpieza').value.trim();
            const reqGen = document.getElementById('reqGeneral').value.trim();
            const puntoSeleccionado = document.getElementById('puntoUsbForm').value;
            const grupoSeleccionado = document.getElementById('grupoAfectado').value;

            const payloadAyuda = {
                tipo_reporte: document.getElementById('tipoReporteForm').value,
                estado: document.getElementById('estadoVitalForm').value,
                estado_despacho: 'Pendiente', 
                punto_usb: puntoSeleccionado,
                ubicacion: document.getElementById('ubicacionAfectado').value, 
                nombre: document.getElementById('nombreAfectado').value,
                cedula: document.getElementById('cedulaAfectado').value || '-',
                telefono: document.getElementById('telefonoAfectado').value || '-',
                correo: document.getElementById('correoAfectado').value,
                carnet_estudiante: document.getElementById('carnetAfectado').value || 'N/A', 
                grupo: grupoSeleccionado,
                comunidad: (grupoSeleccionado === 'Externo') ? 'Externo' : 'Universidad Simón Bolívar',
                es_damnificado: document.getElementById('damnificadoAfectado').checked, 
                requiere_atencion_medica: document.getElementById('atencionMedica').checked,
                servicios_afectados: document.getElementById('serviciosAfectados').value || 'Ninguno',
                personas_hogar: parseInt(document.getElementById('personasHogar').value) || 1,
                ninos_hogar: parseInt(document.getElementById('ninosHogar').value) || 0,
                adultos_mayores_hogar: parseInt(document.getElementById('adultosMayores').value) || 0,
                req_medicina: reqMed,
                req_alimentos: reqAli,
                req_limpieza: reqHig,
                req_general: reqGen,
                descripcion_ayuda: document.getElementById('observacionesAfectado').value 
            };

            try {
                mostrarNotificacion("Procesando solicitud...", true);
                
                if (idEdicionAyuda !== null) {
                    const { error: updateError } = await supabaseClient
                        .from('solicitudes_ayuda')
                        .update(payloadAyuda)
                        .eq('id', idEdicionAyuda);
                        
                    if (updateError) throw updateError;
                    
                    mostrarNotificacion("✅ Solicitud actualizada correctamente.");
                    cancelarEdicionAyuda();
                } else {
                    const { data: ayudaData, error: ayudaError } = await supabaseClient
                        .from('solicitudes_ayuda')
                        .insert([payloadAyuda])
                        .select();

                    if (ayudaError) throw ayudaError;

                    const solicitudId = ayudaData[0].id;

                    const ticketsLogistica = [];
                    if (reqMed) ticketsLogistica.push({ solicitud_id: solicitudId, categoria_insumo: 'medicina', requerimiento: reqMed, punto_usb: puntoSeleccionado, estado: 'Pendiente' });
                    if (reqAli) ticketsLogistica.push({ solicitud_id: solicitudId, categoria_insumo: 'alimentos', requerimiento: reqAli, punto_usb: puntoSeleccionado, estado: 'Pendiente' });
                    if (reqHig) ticketsLogistica.push({ solicitud_id: solicitudId, categoria_insumo: 'higiene', requerimiento: reqHig, punto_usb: puntoSeleccionado, estado: 'Pendiente' });
                    if (reqGen) ticketsLogistica.push({ solicitud_id: solicitudId, categoria_insumo: 'general', requerimiento: reqGen, punto_usb: puntoSeleccionado, estado: 'Pendiente' });

                    if (ticketsLogistica.length > 0) {
                        const { error: logisticaError } = await supabaseClient
                            .from('etiquetas_logistica')
                            .insert(ticketsLogistica);
                        if (logisticaError) console.error("Error al generar tickets:", logisticaError);
                    }
                    
                    document.getElementById('formSolicitudAyuda').reset();
                    mostrarNotificacion("✅ Solicitud registrada y enviada a almacenes.");
                }

                await cargarDatosDesdeNube(); 
                
            } catch (err) {
                console.error("Error guardando:", err);
                alert("Ocurrió un error al enviar tu solicitud. Intenta de nuevo.");
            }
        });

        document.getElementById('colaboradorForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const payload = {
                nombre: document.getElementById('colab_nombre').value.trim(),
                telefono: document.getElementById('colab_telefono').value.trim(),
                cargo_usb: document.getElementById('colab_cargo').value,
                area_apoyo: document.getElementById('colab_area').value,
                lugar_voluntariado: document.getElementById('colab_lugar').value,
                vehiculo: document.getElementById('colab_vehiculo').value,
                disponibilidad: document.getElementById('colab_notas').value.trim()
            };
            if (idEdicionColab !== null) {
                await supabaseClient.from('colaboradores').update(payload).eq('id', idEdicionColab);
                cancelarEdicionColab();
            } else {
                await supabaseClient.from('colaboradores').insert([payload]);
                document.getElementById('colaboradorForm').reset();
                mostrarNotificacion("¡Solicitud registrada exitosamente!");
            }
            await cargarDatosDesdeNube();
        });

        window.activarEdiciónEnPagina = function(id) {
            const reg = registrosNube.find(r => r.id == id);
            if (!reg) return;
            idEnEdicion = id;
            document.getElementById('form-mode-title-afectado').innerText = "Modificar Registro Afectado";
            document.getElementById('nombre').value = reg.nombre;
            document.getElementById('cedula_id').value = reg.cedula_identidad === '-' ? '' : reg.cedula_identidad;
            document.getElementById('telefono_id').value = reg.telefono === '-' ? '' : reg.telefono;
            document.getElementById('ubicacion').value = reg.ubicacion === '-' ? '' : reg.ubicacion;
            document.getElementById('observaciones').value = reg.observaciones === '-' ? '' : reg.observaciones;
            document.getElementById('estado').value = reg.estado;
            document.getElementById('es_damnificado').value = reg.damnificado || 'No';
            
            let cKey = String(reg.cedula).trim().toLowerCase();
            document.getElementById('comunidad').value = (cKey === 'usb' || cKey.includes('simon')) ? "Universidad Simón Bolívar" : "Externo";
            
            let gKey = String(reg.edad).trim().toLowerCase();
            let grupoMapeado = "Estudiante";
            if(gKey.includes('prof')) grupoMapeado = "Profesor";
            if(gKey.includes('egr')) grupoMapeado = "Egresado";
            if(gKey.includes('adm')) grupoMapeado = "Administrativo";
            if(gKey.includes('obr')) grupoMapeado = "Obrero";
            if(gKey.includes('ext')) grupoMapeado = "Externo";
            document.getElementById('grupo').value = grupoMapeado;

            document.getElementById('btn-submit-form').innerText = "Actualizar Estatus en la Nube";
            document.getElementById('cancel-edit-container').innerHTML = `<button type="button" class="btn btn-delete btn-block" style="margin-top:0.5rem" onclick="cancelarEdicion()">Cancelar</button>`;
            
            window.scrollTo({ top: document.getElementById('registroForm').offsetTop - 20, behavior: 'smooth' });
        };

        window.cancelarEdicion = function() {
            idEnEdicion = null; document.getElementById('registroForm').reset();
            document.getElementById('form-mode-title-afectado').innerText = "Registro Afectado";
            document.getElementById('btn-submit-form').innerText = "Guardar en la Nube";
            document.getElementById('cancel-edit-container').innerHTML = '';
        };

        document.getElementById('registroForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const manual = {
                nombre: document.getElementById('nombre').value.trim(),
                cedula_identidad: document.getElementById('cedula_id').value.trim() || '-',
                telefono: document.getElementById('telefono_id').value.trim() || '-',
                cedula: document.getElementById('comunidad').value === "Universidad Simón Bolívar" ? "USB" : "EXT",
                edad: document.getElementById('grupo').value,
                estado: document.getElementById('estado').value,
                damnificado: document.getElementById('es_damnificado').value,
                ubicacion: document.getElementById('ubicacion').value.trim() || '-',
                observaciones: document.getElementById('observaciones').value.trim() || '-'
            };

            if (idEnEdicion !== null) {
                await supabaseClient.from('registros_ciudadanos').update(manual).eq('id', idEnEdicion);
                cancelarEdicion();
            } else {
                await supabaseClient.from('registros_ciudadanos').insert([manual]);
                document.getElementById('registroForm').reset();
                mostrarNotificacion("¡Solicitud registrada exitosamente!");
            }
            await cargarDatosDesdeNube();
        });

        function obtenerRaizAtributo(txt) {
            let t = String(txt || '').toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (!t || t === '-' || t === 'no se' || t === 'n/a') return 'indefinido';
            if (t.includes('est')) return 'estudiante';
            if (t.includes('prof')) return 'profesor';
            if (t.includes('obr')) return 'obrero';
            if (t.includes('adm')) return 'administrativo';
            if (t.includes('egr')) return 'egresado';
            if (t.includes('ext')) return 'externo';
            if (t.includes('usb') || t.includes('simon') || t.includes('sartenejas')) return 'usb';
            return t;
        }

        document.getElementById('excelFile').addEventListener('change', function(e) {
            const file = e.target.files[0]; if (!file) return;
            const lector = new FileReader();
            lector.onload = async function(evt) {
                try {
                    const data = new Uint8Array(evt.target.result);
                    const libro = XLSX.read(data, { type: 'array' });
                    const hoja = libro.Sheets[libro.SheetNames[0]];
                    const rawData = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: "" });
                    
                    while (rawData.length > 0 && !rawData[0].some(c => String(c).toLowerCase().trim().includes('nombre') || String(c).toLowerCase().trim().includes('situacion'))) {
                        rawData.shift();
                    }

                    let cabecera = rawData.shift().map(c => String(c).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
                    
                    let iEst = cabecera.indexOf('situacion');
                    let iNumId = cabecera.indexOf('cedula'); 
                    let iNom = cabecera.indexOf('nombre');
                    let iCom = cabecera.indexOf('comunidad');
                    let iGru = cabecera.indexOf('grupo');
                    let iUbi = cabecera.indexOf('ubicacion');
                    let iObs = cabecera.indexOf('observacion');
                    let iDam = cabecera.indexOf('damnificado');
                    let iTel = cabecera.indexOf('telefono'); 
                    let todosLosRegistros = [];
                    let inicioRango = 0;
                    let finRango = 999;
                    let descargarMas = true;

                    while (descargarMas) {
                        const { data: chunk, error: errChunk } = await supabaseClient
                            .from('registros_ciudadanos')
                            .select('*')
                            .range(inicioRango, finRango);
                        
                        if (chunk && chunk.length > 0) {
                            todosLosRegistros = todosLosRegistros.concat(chunk);
                            inicioRango += 1000;
                            finRango += 1000;
                        }
                        if (!chunk || chunk.length < 1000 || errChunk) {
                            descargarMas = false;
                        }
                    }
                    registrosNube = todosLosRegistros;

                    let duplicadosOmitidos = 0;
                    let registrosActualizados = 0;
                    let nuevosRegistros = [];
                    let listaParaActualizar = []; 
                    let validacionCombinada = [...registrosNube]; 

                    for (let row of rawData) {
                        let nomVal = String(row[iNom] || '').trim();
                        if (!nomVal || nomVal.toLowerCase().includes('nombre')) continue;

                        let rawEst = String(row[iEst] || '').trim().toLowerCase();
                        let estadoFinal = 'Sin Información';
                        
                        if (rawEst.includes('atrapado') || rawEst.includes('emergencia') || rawEst.includes('⚠️')) {
                            estadoFinal = 'Atrapado';
                        } else if (rawEst.includes('bien') || rawEst.includes('vida') || rawEst.includes('✅') || rawEst.includes('salvo') || rawEst.includes('rescatado') || rawEst.includes('ileso')) {
                            estadoFinal = 'Con Vida';
                        } else if (rawEst.includes('fallecido') || rawEst.includes('💀') || rawEst.includes('🕊️')) {
                            estadoFinal = 'Fallecido';
                        } else if (rawEst.includes('informacion') || rawEst.includes('información') || rawEst.includes('❓')) {
                            estadoFinal = 'Sin Información';
                        } else if (rawEst.includes('desaparecido')) {
                            estadoFinal = 'Desaparecido';
                        }

                        let comExcelRaw = iCom !== -1 ? String(row[iCom] || 'USB').trim() : 'USB';
                        let gruExcelRaw = iGru !== -1 ? String(row[iGru] || 'EST').trim() : 'EST';
                        let idExcelReal = iNumId !== -1 ? String(row[iNumId] || '-').trim() : '-';
                        let telExcelReal = iTel !== -1 ? String(row[iTel] || '-').trim() : '-';
                        let ubiExcelReal = iUbi !== -1 ? String(row[iUbi] || '-').trim() : '-';

                        let registroExistente = validacionCombinada.find(r => {
                            if (idExcelReal !== '-' && r.cedula_identidad && r.cedula_identidad !== '-' && idExcelReal === String(r.cedula_identidad).trim()) {
                                return true;
                            }
                            
                            let nombresSimilares = sonNombresSimilares(r.nombre, nomVal);
                            if (!nombresSimilares) return false;

                            let cNube = obtenerRaizAtributo(r.cedula);
                            let cExcel = obtenerRaizAtributo(comExcelRaw);
                            let gNube = obtenerRaizAtributo(r.edad);
                            let gExcel = obtenerRaizAtributo(gruExcelRaw);

                            let comCoincide = (cNube === 'indefinido' || cExcel === 'indefinido' || cNube === cExcel);
                            let gruCoincide = (gNube === 'indefinido' || gExcel === 'indefinido' || gNube === gExcel);

                            return comCoincide && gruCoincide;
                        });

                        if (registroExistente) {
                            if (estadoFinal !== 'Sin Información' && registroExistente.estado !== estadoFinal) {
                                if (registroExistente.id) {
                                    listaParaActualizar.push({
                                        id: registroExistente.id,
                                        estado: estadoFinal,
                                        ubicacion: ubiExcelReal !== '-' ? ubiExcelReal : registroExistente.ubicacion
                                    });
                                }
                                registroExistente.estado = estadoFinal; 
                                registrosActualizados++;
                            } else {
                                duplicadosOmitidos++; 
                            }
                            continue; 
                        }

                        let nuevoDato = {
                            nombre: nomVal,
                            cedula: comExcelRaw,
                            edad: gruExcelRaw,
                            estado: estadoFinal,
                            damnificado: iDam !== -1 ? String(row[iDam] || 'No sé').trim() : 'No sé',
                            ubicacion: ubiExcelReal,
                            observaciones: iObs !== -1 ? String(row[iObs] || '-').trim() : '-',
                            cedula_identidad: idExcelReal,
                            telefono: telExcelReal
                        };

                        nuevosRegistros.push(nuevoDato);
                        validacionCombinada.push(nuevoDato); 
                    }
                    
                    if (nuevosRegistros.length > 0) {
                        await supabaseClient.from('registros_ciudadanos').insert(nuevosRegistros);
                    }

                    if (listaParaActualizar.length > 0) {
                        for (let act of listaParaActualizar) {
                            await supabaseClient.from('registros_ciudadanos')
                                .update({ estado: act.estado, ubicacion: act.ubicacion })
                                .eq('id', act.id);
                        }
                    }
                    
                    alert(`Plantilla procesada.\n✅ ${nuevosRegistros.length} registros nuevos.\n🔄 ${registrosActualizados} registros actualizados.\n⚠️ ${duplicadosOmitidos} filas omitidas.`);
                    document.getElementById('excelFile').value = ''; 
                    await cargarDatosDesdeNube();
                } catch (err) { alert('Error de lectura de archivo. Asegúrate de usar la plantilla correcta.'); console.error(err); }
            };
            lector.readAsArrayBuffer(file);
        });

        let temporizadorBusqueda;
        document.getElementById('buscarInput').addEventListener('input', function() {
            document.getElementById('tablaCuerpo').innerHTML = '<tr><td colspan="10" style="text-align:center; padding: 3rem; color: var(--primary);"><strong>⏳ Buscando registros...</strong></td></tr>';
            clearTimeout(temporizadorBusqueda);
            temporizadorBusqueda = setTimeout(() => {
                filtrarYActualizarTablero();
            }, 300);
        });

        window.abrirFormularioNovedad = function(id, nombre) {
            document.getElementById('novedad_registro_id').value = id;
            document.getElementById('novedad-persona-nombre').innerText = "Afectado: " + nombre;
            document.getElementById('modal-novedad').style.display = 'flex';
        };

        document.getElementById('novedadForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const botones = this.getElementsByTagName('button');
            const btnSubmit = botones.length > 0 ? botones[0] : null;
            let textoOriginal = "Enviar Reporte";
            
            if (btnSubmit) {
                textoOriginal = btnSubmit.innerText;
                btnSubmit.innerText = "Enviando...";
                btnSubmit.disabled = true;
            }

            try {
                const payload = {
                    registro_id: parseInt(document.getElementById('novedad_registro_id').value),
                    nombre_reportante: document.getElementById('novedad_reportante').value.trim(),
                    telefono_reportante: document.getElementById('novedad_telefono').value.trim(),
                    relacion: document.getElementById('novedad_relacion').value,
                    estado_sugerido: document.getElementById('novedad_estado').value,
                    observaciones: document.getElementById('novedad_obs').value.trim()
                };
                
                const { error } = await supabaseClient.from('novedades_pendientes').insert([payload]);
                
                if (error) {
                    alert("Error enviando reporte a Supabase: " + error.message);
                } else {
                    mostrarNotificacion("¡Reporte enviado! Un administrador lo revisará pronto.");
                    document.getElementById('novedadForm').reset();
                    document.getElementById('modal-novedad').style.display = 'none';
                }
            } catch (err) {
                alert("Error interno: " + err.message);
            } finally {
                if (btnSubmit) {
                    btnSubmit.innerText = textoOriginal;
                    btnSubmit.disabled = false;
                }
            }
        });

        window.aprobarNovedad = async function(idNovedad, idRegistro, nuevoEstado, observacionesNuevas) {
            if(!confirm("¿Aprobar y cambiar el estado en la base de datos oficial?")) return;
            
            const { error: errUpdate } = await supabaseClient.from('registros_ciudadanos')
                .update({ estado: nuevoEstado })
                .eq('id', idRegistro);
            
            if (errUpdate) { alert("Error al actualizar: " + errUpdate.message); return; }

            await supabaseClient.from('novedades_pendientes').delete().eq('id', idNovedad);
            
            mostrarNotificacion("¡Estado actualizado y aprobado!");
            await cargarDatosDesdeNube(); 
        };

        window.rechazarNovedad = async function(idNovedad) {
            if(!confirm("¿Rechazar y eliminar este reporte falso/inválido?")) return;
            await supabaseClient.from('novedades_pendientes').delete().eq('id', idNovedad);
            mostrarNotificacion("Reporte eliminado exitosamente");
            await cargarDatosDesdeNube();
        };

        function mostrarCargaYFiltrar() {
            document.getElementById('tablaCuerpo').innerHTML = '<tr><td colspan="10" style="text-align:center; padding: 3rem; color: var(--primary);"><strong>⏳ Aplicando filtros...</strong></td></tr>';
            setTimeout(filtrarYActualizarTablero, 50);
        }

        document.getElementById('filtroEstado').addEventListener('change', mostrarCargaYFiltrar);
        document.getElementById('filtroGrupo').addEventListener('change', mostrarCargaYFiltrar);
        document.getElementById('filtroDuplicados').addEventListener('change', mostrarCargaYFiltrar);

        document.getElementById('btnExportar').addEventListener('click', function() {
            let matriz = [["Situacion", "Cedula", "Nombre", "Comunidad", "Grupo", "Damnificado", "Ubicacion", "Telefono", "Observacion"]];
            registrosNube.forEach(r => matriz.push([r.estado, r.cedula_identidad || '-', r.nombre, r.cedula, r.edad, r.damnificado || 'No sé', r.ubicacion, r.telefono, r.observaciones]));
            descargarMatrizComoExcel(matriz, "Reporte_USB_Afectados");
        });

        document.getElementById('btnExportarColab').addEventListener('click', function() {
            let matriz = [["Voluntario", "Cargo/Vinculo", "Ubicación Residencial Base", "Area de Apoyo", "Logística Traslado", "Lugar Voluntariado Destinado", "Vehiculo", "Ofrecimiento Detallado", "Telefono Móvil", "Disponibilidad / Notas"]];
            colaboradoresNube.forEach(c => matriz.push([c.nombre, c.cargo_usb, c.ubicacion_geografica || '-', c.area_apoyo, c.traslado_logistico || '-', c.lugar_voluntariado || 'Punto de Acopio USB', c.vehiculo || 'No', c.ofrecimiento_detallado || '-', c.telefono, c.disponibilidad]));
            descargarMatrizComoExcel(matriz, "Data_Ofrecimientos_Colaboradores_USB");
        });

        document.getElementById('btnExportarAyuda').addEventListener('click', function() {
            if (!ayudaNube || ayudaNube.length === 0) {
                alert("No hay datos para exportar.");
                return;
            }

            let matriz = [[
                "Fecha Reporte", "Punto Acopio", "Estado Despacho", "Tipo Reporte", 
                "Afectado", "Cédula", "Teléfono", "Correo", "Comunidad", "Relación USB", 
                "Estado Vital", "Ubicación", "Servicios Afectados", "Es Damnificado", 
                "Atención Médica", "Total Personas", "Niños", "Adultos Mayores", 
                "Req. Medicina", "Req. Alimentos", "Req. Limpieza", "Req. General", "Observaciones"
            ]];

            ayudaNube.forEach(a => {
                let fecha = a.created_at ? new Date(a.created_at).toLocaleString('es-VE') : '';
                matriz.push([
                    fecha,
                    a.punto_usb || 'Sin Asignar',
                    a.estado_despacho || 'Pendiente',
                    a.tipo_reporte || '-',
                    a.nombre || '-',
                    a.cedula || '-',
                    a.telefono || '-',
                    a.correo || '-',
                    a.comunidad || '-',
                    a.grupo || '-',
                    a.estado || '-',
                    a.ubicacion || '-',
                    a.servicios_afectados || '-',
                    a.es_damnificado ? "SÍ" : "NO",
                    a.requiere_atencion_medica ? "SÍ" : "NO",
                    a.personas_hogar || 1,
                    a.ninos_hogar || 0,
                    a.adultos_mayores_hogar || 0,
                    a.req_medicina || '-',
                    a.req_alimentos || '-',
                    a.req_limpieza || '-',
                    a.req_general || '-',
                    a.descripcion_ayuda || '-'
                ]);
            });

            descargarMatrizComoExcel(matriz, "Reporte_Ayuda_USB");
        });

        function descargarMatrizComoExcel(matriz, nombreArchivo) {
            const wb = XLSX.utils.book_new(); const ws = XLSX.utils.aoa_to_sheet(matriz);
            XLSX.utils.book_append_sheet(wb, ws, "Datos");
            XLSX.writeFile(wb, `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.xlsx`);
        }

        window.eliminarFila = async function(id, boton) {
            if (!boton) return;
            let texto = boton.innerText.trim();
            if (texto === "Eliminar") {
                boton.innerText = "¿Seguro?";
                boton.style.backgroundColor = "#dc2626";
                boton.style.color = "#ffffff";
                boton.style.borderColor = "#dc2626";
                boton.timeoutId = setTimeout(() => {
                    boton.innerText = "Eliminar";
                    boton.style.backgroundColor = "#fef2f2";
                    boton.style.color = "var(--danger)";
                    boton.style.borderColor = "#fecaca";
                }, 3000);
            } else if (texto.includes("Seguro")) {
                if (boton.timeoutId) clearTimeout(boton.timeoutId);
                boton.innerText = "Borrando...";
                boton.disabled = true;
                
                const { data, error } = await supabaseClient.from('registros_ciudadanos').delete().eq('id', id).select();
                
                if (error) {
                    alert("Error interno: " + error.message);
                    boton.innerText = "Eliminar";
                    boton.disabled = false;
                } else if (!data || data.length === 0) {
                    alert("⚠️ Supabase bloqueó el borrado. Debes ir a tu panel de Supabase y habilitar el permiso de ELIMINAR (DELETE) en las políticas RLS de esta tabla.");
                    boton.innerText = "Eliminar";
                    boton.disabled = false;
                } else {
                    await cargarDatosDesdeNube();
                }
            }
        };

        window.eliminarAyuda = async function(id, boton) {
            if (!boton) return;
            let texto = boton.innerText.trim();
            if (texto === "Eliminar") {
                boton.innerText = "¿Seguro?";
                boton.style.backgroundColor = "#dc2626";
                boton.style.color = "#ffffff";
                boton.style.borderColor = "#dc2626";
                boton.timeoutId = setTimeout(() => {
                    boton.innerText = "Eliminar";
                    boton.style.backgroundColor = "#fef2f2";
                    boton.style.color = "var(--danger)";
                    boton.style.borderColor = "#fecaca";
                }, 3000);
            } else if (texto.includes("Seguro")) {
                if (boton.timeoutId) clearTimeout(boton.timeoutId);
                boton.innerText = "Borrando...";
                boton.disabled = true;
                
                const { data, error } = await supabaseClient.from('solicitudes_ayuda').delete().eq('id', id).select();
                
                if (error) {
                    alert("Error interno: " + error.message);
                    boton.innerText = "Eliminar";
                    boton.disabled = false;
                } else if (!data || data.length === 0) {
                    alert("⚠️ Supabase bloqueó el borrado. Debes ir a tu panel de Supabase y habilitar el permiso de ELIMINAR (DELETE) en las políticas RLS de la tabla 'solicitudes_ayuda'.");
                    boton.innerText = "Eliminar";
                    boton.disabled = false;
                } else {
                    await cargarDatosDesdeNube();
                }
            }
        };

        window.eliminarColab = async function(id, boton) {
            if (!boton) return;
            let texto = boton.innerText.trim();
            if (texto === "Eliminar") {
                boton.innerText = "¿Seguro?";
                boton.style.backgroundColor = "#dc2626";
                boton.style.color = "#ffffff";
                boton.style.borderColor = "#dc2626";
                boton.timeoutId = setTimeout(() => {
                    boton.innerText = "Eliminar";
                    boton.style.backgroundColor = "#fef2f2";
                    boton.style.color = "var(--danger)";
                    boton.style.borderColor = "#fecaca";
                }, 3000);
            } else if (texto.includes("Seguro")) {
                if (boton.timeoutId) clearTimeout(boton.timeoutId);
                boton.innerText = "Borrando...";
                boton.disabled = true;
                
                const { data, error } = await supabaseClient.from('colaboradores').delete().eq('id', id).select();
                
                if (error) {
                    alert("Error interno: " + error.message);
                    boton.innerText = "Eliminar";
                    boton.disabled = false;
                } else if (!data || data.length === 0) {
                    alert("⚠️ Supabase bloqueó el borrado. Debes ir a tu panel de Supabase y habilitar el permiso de ELIMINAR (DELETE) en las políticas RLS de la tabla 'colaboradores'.");
                    boton.innerText = "Eliminar";
                    boton.disabled = false;
                } else {
                    await cargarDatosDesdeNube();
                }
            }
        };

        window.addEventListener('popstate', function(event) {
            if (event.state && event.state.vistaActiva) {
                navegarA(event.state.vistaActiva, true);
            } else {
                navegarA('view-home', true);
            }
        });

        const hashParams = window.location.hash.substring(1);

        if (hashParams && document.getElementById(hashParams)) {
            window.history.replaceState({ vistaActiva: hashParams }, "", "#" + hashParams);
            navegarA(hashParams, true);
        } else if (!window.history.state) {
            window.history.replaceState({ vistaActiva: 'view-home' }, "", "#view-home");
            navegarA('view-home', true);
        }

        cargarDatosDesdeNube();

        window.agregarFilaInsumo = function() {
            const contenedor = document.getElementById('contenedor-filas-insumos');
            const div = document.createElement('div');
            div.className = 'fila-insumo';
            div.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px;';
            div.innerHTML = `
                <input type="number" class="form-control input-cantidad" placeholder="Cant." style="width: 100px; box-sizing: border-box; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.95rem; height: 42px;" min="1" required>
                <input type="text" class="form-control input-nombre-insumo" placeholder="Descripción (Ej. Bulto de Harina)" style="flex: 1; box-sizing: border-box; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.95rem; height: 42px;" required>
                <button type="button" class="btn btn-delete" style="padding: 0 0.8rem; background-color: #fee2e2; border: 1px solid #fca5a5; border-radius: 4px; cursor: pointer; color: #b91c1c; font-size: 0.85rem; height: 42px;" onclick="this.parentElement.remove()">❌</button>
            `;
            contenedor.appendChild(div);
        };

        document.getElementById('etiquetaForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const encargado = document.getElementById('etiqueta_encargado').value.trim();
            const centro = document.getElementById('etiqueta_centro').value;
            
            let insumos = [];
            document.querySelectorAll('.fila-insumo').forEach(fila => {
                const cant = fila.querySelector('.input-cantidad').value;
                const desc = fila.querySelector('.input-nombre-insumo').value.trim();
                if(cant && desc) insumos.push({ cantidad: cant, descripcion: desc });
            });
            
            if(insumos.length === 0) return alert("Debes agregar al menos un insumo.");
            
            const btn = this.querySelector('button[type="submit"]');
            btn.innerText = "Guardando..."; btn.disabled = true;
            
            const payload = {
                encargado: encargado,
                centro_acopio: centro,
                lista_insumos: insumos,
                estado: "Pendiente"
            };
            
            const { error } = await supabaseClient.from('etiquetas_logistica').insert([payload]);
            
            if(error) { alert("Error: " + error.message); } 
            else {
                mostrarNotificacion("¡Pedido guardado en la bandeja!");
                this.reset();
                document.getElementById('contenedor-filas-insumos').innerHTML = `
                    <div class="fila-insumo" style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <input type="number" class="form-control input-cantidad" placeholder="Cant." style="width: 90px;" min="1" required>
                        <input type="text" class="form-control input-nombre-insumo" placeholder="Descripción (Ej. Bulto de Harina)" style="flex: 1;" required>
                    </div>`;
                cargarTablaLogisticaFuerza();
            }
            btn.innerText = "Guardar Petición en el Sistema"; btn.disabled = false;
        });

        function renderizarTablaLogistica() {
            const cuerpo = document.getElementById('tablaLogisticaCuerpo');
            if(!cuerpo || !pedidosLogistica) return;
            
            cuerpo.innerHTML = pedidosLogistica.map(p => {
                let badgeColor = p.estado === 'Despachado' ? 'badge-success' : 'badge-warning';
                let resumenInsumos = p.lista_insumos.map(i => `${i.cantidad}x ${i.descripcion}`).join(', ');
                if(resumenInsumos.length > 50) resumenInsumos = resumenInsumos.substring(0, 50) + '...';

                let btnAccion = p.estado === 'Pendiente' 
                    ? `<button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="imprimirYDespachar('${p.id}')">🖨️ Imprimir y Enviar</button>`
                    : `<button class="btn" style="background-color: #e2e8f0; color: #64748b; padding: 0.4rem 0.8rem; font-size: 0.8rem; cursor: not-allowed;" disabled>✅ Ya enviado</button>`;

                return `
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 1rem;"><span class="badge ${badgeColor}">${p.estado || 'Pendiente'}</span></td>
                        <td style="padding: 1rem;"><strong>${p.centro_acopio}</strong><br><span style="font-size:0.8rem; color:#64748b;">${p.encargado}</span></td>
                        <td style="padding: 1rem; font-size: 0.9rem;">${resumenInsumos}</td>
                        <td style="padding: 1rem;">${btnAccion}</td>
                    </tr>
                `;
            }).join('');
        }

        window.imprimirYDespachar = async function(idRegistro) {
            try {
                const pedido = pedidosLogistica.find(p => p.id === idRegistro);
                if(!pedido) {
                    alert("Error: No se encontró el pedido.");
                    return;
                }

                if(!confirm(`¿Generar factura de despacho para ${pedido.centro_acopio}? Esto marcará el pedido como enviado.`)) return;

                const ventanita = window.open('', '_blank');
                if(!ventanita) {
                    alert("⚠️ Tu navegador bloqueó la ventana. Por favor, permite las ventanas emergentes en esta página.");
                    return;
                }

                const { error } = await supabaseClient
                    .from('etiquetas_logistica')
                    .update({ estado: 'Despachado' })
                    .eq('id', idRegistro);

                if(error) {
                    ventanita.close();
                    alert("Error al actualizar la base de datos: " + error.message);
                    return;
                }

                if (typeof cargarTablaLogisticaFuerza === "function") {
                    cargarTablaLogisticaFuerza();
                }

                let insumosArray = pedido.lista_insumos;
                if (typeof insumosArray === 'string') {
                    try { insumosArray = JSON.parse(insumosArray); } catch(e) { insumosArray = []; }
                }

                let filasHTML = insumosArray.map(i => `
                    <tr style="border-bottom: 1px solid #000;">
                        <td style="padding: 8px; text-align: center; border-right: 1px solid #000; font-weight: bold; font-size: 18px;">${i.cantidad}</td>
                        <td style="padding: 8px; font-size: 18px;">${i.descripcion}</td>
                    </tr>
                `).join('');
                
                const fecha = new Date().toLocaleString('es-VE');
                const idCorto = idRegistro.split('-')[0].toUpperCase();

                ventanita.document.write(`
                    <html>
                    <head>
                        <title>Guía de Despacho - ${pedido.centro_acopio}</title>
                        <style>
                            body { font-family: 'Arial', sans-serif; padding: 20px; color: #000; }
                            .ticket { border: 2px dashed #000; padding: 20px; max-width: 600px; margin: 0 auto; }
                            h1 { text-align: center; text-transform: uppercase; margin-bottom: 5px; font-size: 26px; }
                            .info-header { margin-bottom: 20px; font-size: 18px; line-height: 1.5; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 2px solid #000; }
                            th { background-color: #f0f0f0; padding: 12px; border-bottom: 2px solid #000; text-align: left; border-right: 2px solid #000; }
                            td { border-right: 2px solid #000; border-bottom: 2px solid #000;}
                            @media print { @page { margin: 0; } body { margin: 1cm; } }
                        </style>
                    </head>
                    <body>
                        <div class="ticket">
                            <h1>TICKET DE DESPACHO</h1>
                            <hr style="border: 1px solid #000; margin-bottom: 15px;">
                            <div class="info-header">
                                <strong>DESTINO:</strong> <span style="font-size: 24px; text-transform: uppercase;">${pedido.centro_acopio}</span><br>
                                <strong>ENCARGADO:</strong> ${pedido.encargado}<br>
                                <strong>FECHA:</strong> ${fecha}<br>
                                <strong>CÓDIGO:</strong> #${idCorto}
                            </div>
                            <table>
                                <thead><tr><th style="width: 80px; text-align: center;">CANT.</th><th>DESCRIPCIÓN</th></tr></thead>
                                <tbody>${filasHTML}</tbody>
                            </table>
                        </div>
                        <script>
                            // Activa la impresora de inmediato y cierra al terminar
                            window.onload = function() { 
                                window.print(); 
                                window.onafterprint = function() { window.close(); } 
                            }
                        </script>
                    </body>
                    </html>
                `);
                ventanita.document.close();

            } catch (error) {
                console.error("Error crítico: ", error);
                alert("Hubo un fallo en el sistema. Revisa la consola.");
            }
        };

        window.cargarTablaLogisticaFuerza = async function() {
            const cuerpo = document.getElementById('tablaLogisticaCuerpo');
            if(!cuerpo) return;

            cuerpo.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 1rem; font-weight: bold;">Cargando base de datos...</td></tr>';

            const { data, error } = await supabaseClient
                .from('etiquetas_logistica')
                .select('*')
                .order('created_at', { ascending: false });
            
            if(error) {
                console.error(error);
                cuerpo.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 1rem; color: red;">Error Supabase: ${error.message}</td></tr>`;
                return;
            }

            if(!data || data.length === 0) {
                cuerpo.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 1rem;">No hay pedidos registrados en la nube.</td></tr>';
                return;
            }

            pedidosLogistica = data;

            cuerpo.innerHTML = data.map(p => {
                let badgeColor = p.estado === 'Despachado' ? 'badge-success' : 'badge-warning';
                let insumosArray = p.lista_insumos;
                
                if (typeof insumosArray === 'string') {
                    try { insumosArray = JSON.parse(insumosArray); } 
                    catch(e) { insumosArray = []; }
                }

                let resumenInsumos = Array.isArray(insumosArray) 
                    ? insumosArray.map(i => `${i.cantidad}x ${i.descripcion}`).join(', ')
                    : 'Error de lectura';
                
                if(resumenInsumos.length > 50) resumenInsumos = resumenInsumos.substring(0, 50) + '...';

                let btnAccion = p.estado === 'Pendiente' 
                    ? `<button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="imprimirYDespachar('${p.id}')">🖨️ Imprimir y Enviar</button>`
                    : `<button class="btn" style="background-color: #e2e8f0; color: #64748b; padding: 0.4rem 0.8rem; font-size: 0.8rem; cursor: not-allowed;" disabled>✅ Ya enviado</button>`;

                return `
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 1rem;"><span class="badge ${badgeColor}">${p.estado || 'Pendiente'}</span></td>
                        <td style="padding: 1rem;"><strong>${p.centro_acopio}</strong><br><span style="font-size:0.8rem; color:#64748b;">${p.encargado}</span></td>
                        <td style="padding: 1rem; font-size: 0.9rem;">${resumenInsumos}</td>
                        <td style="padding: 1rem;">${btnAccion}</td>
                    </tr>
                `;
            }).join('');
        };

        window.descargarExcelLogistica = function() {
            if (!pedidosLogistica || pedidosLogistica.length === 0) {
                alert("No hay pedidos registrados para descargar.");
                return;
            }

            let csvContent = "\uFEFF"; 
            csvContent += "ID del Pedido,Fecha de Registro,Encargado,Centro de Acopio Destino,Estado,Resumen de Insumos\n";

            pedidosLogistica.forEach(p => {
                let fecha = p.created_at ? new Date(p.created_at).toLocaleString('es-VE') : 'Fecha no disponible';
                
                let insumosArray = p.lista_insumos;
                if (typeof insumosArray === 'string') {
                    try { insumosArray = JSON.parse(insumosArray); } catch(e) { insumosArray = []; }
                }
                
                let insumosTexto = Array.isArray(insumosArray) 
                    ? insumosArray.map(i => `${i.cantidad}x ${i.descripcion}`).join(' | ') 
                    : 'Error de lectura';

                let fila = [
                    p.id,
                    fecha,
                    `"${(p.encargado || '').replace(/"/g, '""')}"`,
                    `"${(p.centro_acopio || '').replace(/"/g, '""')}"`,
                    p.estado || 'Pendiente',
                    `"${insumosTexto.replace(/"/g, '""')}"`
                ].join(",");

                csvContent += fila + "\n";
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Reporte_Logistica_Despachos_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };