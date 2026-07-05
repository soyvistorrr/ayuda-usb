const SUPABASE_URL = "https://idirgqiruxvdbgnlrgrp.supabase.co";
        const SUPABASE_KEY = "sb_publishable_ECurpyGW8jSgTMe30r89xA_o-WRwADV";
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        let registrosNube = [];
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
            
            const urlSitioDirecta = window.location.origin + window.location.pathname + `?noticia=${n.id}`;
            const textoACompartir = `📢 Boletín Oficial USB: ${n.titulo}\n\nLee los detalles aquí: ${urlSitioDirecta}`;
            
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

        function conmutarAccesoSeguro() {
            const malla = document.getElementById('mallaPrincipal');
            const mallaAyuda = document.getElementById('mallaAyuda');
            const mallaColab = document.getElementById('mallaColaboradores');

            if (!esAdministrador) {
                let pass = prompt("Introduzca la clave de seguridad de Administrador de la USB:");
                if (pass === "USB2026") {
                    esAdministrador = true;
                    document.getElementById('btn-toggle-role').innerText = "Cerrar Sesión";
                    
                    if (malla) malla.classList.add('admin-columns-layout');
                    if (mallaAyuda) mallaAyuda.classList.add('admin-columns-layout');
                    if (mallaColab) mallaColab.classList.add('admin-columns-layout');
                    
                    document.getElementById('panel-formulario-afectado').style.display = "block";
                    document.getElementById('panel-tabla-solicitudes').style.display = "block";
                    document.getElementById('dropZone').style.display = "block";
                    
                    document.getElementById('btnExportar').style.display = "inline-flex";
                    document.getElementById('btnExportarColab').style.display = "inline-flex";
                    document.getElementById('btnExportarAyuda').style.display = "inline-flex";

                    document.querySelectorAll('.admin-action-header').forEach(el => el.style.display = "table-cell");
                } else { alert("Clave incorrecta. Acceso denegado."); }
            } else {
                esAdministrador = false;
                document.getElementById('btn-toggle-role').innerText = "Acceso Admin";
                
                if (malla) malla.classList.remove('admin-columns-layout');
                if (mallaAyuda) mallaAyuda.classList.remove('admin-columns-layout');
                if (mallaColab) mallaColab.classList.remove('admin-columns-layout');
                
                document.getElementById('panel-formulario-afectado').style.display = "none";
                document.getElementById('panel-tabla-solicitudes').style.display = "none";
                document.getElementById('dropZone').style.display = "none";
                
                document.getElementById('btnExportar').style.display = "none";
                document.getElementById('btnExportarColab').style.display = "none";
                document.getElementById('btnExportarAyuda').style.display = "none";

                document.querySelectorAll('.admin-action-header').forEach(el => el.style.display = "none");
                cancelarEdicion();
            }
            filtrarYActualizarTablero();
            actualizarInterfazColaboradores(colaboradoresNube);
            actualizarInterfazAyuda(ayudaNube);
        }

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
                const [resAfectados, resColabs, resAyudas, resNoticias] = await Promise.all([
                    supabaseClient.from('registros_ciudadanos').select('*').order('created_at', { ascending: false }).range(0, 999),
                    supabaseClient.from('colaboradores').select('*').order('created_at', { ascending: false }),
                    supabaseClient.from('solicitudes_ayuda').select('*').order('created_at', { ascending: false }),
                    supabaseClient.from('noticias_oficiales').select('*').order('fecha_publicacion', { ascending: false })
                ]);

                let tempAfectados = resAfectados.data || [];
                
                if (tempAfectados.length === 1000) {
                    let rangoInicio = 1000;
                    let rangoFin = 1999;
                    let hayMasDatos = true;
                    while (hayMasDatos) {
                        const { data } = await supabaseClient.from('registros_ciudadanos').select('*').order('created_at', { ascending: false }).range(rangoInicio, rangoFin);
                        if (data && data.length > 0) {
                            tempAfectados = tempAfectados.concat(data);
                            rangoInicio += 1000;
                            rangoFin += 1000;
                        }
                        if (!data || data.length < 1000) hayMasDatos = false; 
                    }
                }

                registrosNube = tempAfectados;
                if (resColabs.data) colaboradoresNube = resColabs.data;
                if (resAyudas.data) ayudaNube = resAyudas.data;

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
                            if (n.imagen_url && n.imagen_url.trim() !== '') {
                                thumbHtml = `<div class="news-thumbnail" style="background-image: url('${n.imagen_url}'); display: block;"></div>`;
                            } else {
                                thumbHtml = `
                                <div class="news-thumbnail" style="background-color: #f8fafc; background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px); background-size: 18px 18px; display: flex; align-items: center; justify-content: center; border-bottom: 3px solid ${colBorde};">
                                    <img src="images.png" alt="Logo USB" style="height: 65px; opacity: 0.12; filter: grayscale(100%);">
                                </div>`;
                            }
                            const tarjetaInterior = `${thumbHtml}<div style="display:flex; justify-content:space-between; align-items:center;"><span class="news-badge" style="background-color:${colFondo};">${n.etiqueta || 'Aviso'}</span><span class="news-date">${fString}</span></div><h4 class="news-title">${n.titulo}</h4><div class="news-body">${n.contenido}</div><div class="leer-mas-link">Leer completo ➔</div>`;

                            if (index < 8) htmlCarrusel += `<div class="news-card" style="border-left-color:${colBorde};" onclick="abrirNoticiaCompleta('${n.id}')">${tarjetaInterior}</div>`;
                            htmlPagina += `<div class="news-card" style="border-left-color:${colBorde}; height:auto!important; min-height:280px;" onclick="abrirNoticiaCompleta('${n.id}')">${tarjetaInterior}</div>`;
                        });
                        
                        if(contenedorCarrusel) { contenedorCarrusel.innerHTML = htmlCarrusel; iniciarCarruselAutomatico(); }
                        if(contenedorPagina) contenedorPagina.innerHTML = htmlPagina;
                        
                        const urlParams = new URLSearchParams(window.location.search);
                        const idNoticiaParam = urlParams.get('noticia');
                        if (idNoticiaParam && !window.noticiaAutoAbierta) {
                            window.noticiaAutoAbierta = true;
                            setTimeout(() => abrirNoticiaCompleta(idNoticiaParam), 600);
                        }
                    }
                }

                if (esAdministrador) {
                    const { data: nov } = await supabaseClient.from('novedades_pendientes').select('*').order('created_at', { ascending: false });
                    const btnAdmin = document.getElementById('btn-novedades-admin');
                    
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
                }

                filtrarYActualizarTablero();
                actualizarInterfazColaboradores(colaboradoresNube);
                actualizarInterfazAyuda(ayudaNube);

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

            thead.innerHTML = `<tr>
                <th onclick="ordenarTablaAyuda('tipo_reporte')" style="cursor:pointer">TIPO ${obtenerSimboloOrden(sortConfigAyuda, 'tipo_reporte')}</th>
                <th onclick="ordenarTablaAyuda('nombre')" style="cursor:pointer">AFECTADO ${obtenerSimboloOrden(sortConfigAyuda, 'nombre')}</th>
                <th onclick="ordenarTablaAyuda('cedula')" style="cursor:pointer">CÉDULA ${obtenerSimboloOrden(sortConfigAyuda, 'cedula')}</th>
                <th onclick="ordenarTablaAyuda('telefono')" style="cursor:pointer">TELÉFONO ${obtenerSimboloOrden(sortConfigAyuda, 'telefono')}</th>
                <th onclick="ordenarTablaAyuda('correo')" style="cursor:pointer">CORREO ${obtenerSimboloOrden(sortConfigAyuda, 'correo')}</th>
                <th onclick="ordenarTablaAyuda('sede_usb')" style="cursor:pointer">SEDE ${obtenerSimboloOrden(sortConfigAyuda, 'sede_usb')}</th>
                <th onclick="ordenarTablaAyuda('carnet_estudiante')" style="cursor:pointer">CARNET ${obtenerSimboloOrden(sortConfigAyuda, 'carnet_estudiante')}</th>
                <th onclick="ordenarTablaAyuda('comunidad')" style="cursor:pointer">COMUNIDAD ${obtenerSimboloOrden(sortConfigAyuda, 'comunidad')}</th>
                <th onclick="ordenarTablaAyuda('grupo')" style="cursor:pointer">GRUPO ${obtenerSimboloOrden(sortConfigAyuda, 'grupo')}</th>
                <th onclick="ordenarTablaAyuda('estado_residencial')" style="cursor:pointer">ESTADO RES. ${obtenerSimboloOrden(sortConfigAyuda, 'estado_residencial')}</th>
                <th onclick="ordenarTablaAyuda('eje_logistico')" style="cursor:pointer">EJE ${obtenerSimboloOrden(sortConfigAyuda, 'eje_logistico')}</th>
                <th onclick="ordenarTablaAyuda('direccion_residencial')" style="cursor:pointer">DIRECCIÓN ${obtenerSimboloOrden(sortConfigAyuda, 'direccion_residencial')}</th>
                <th onclick="ordenarTablaAyuda('afectacion_vivienda')" style="cursor:pointer">AFECTACIÓN VIV. ${obtenerSimboloOrden(sortConfigAyuda, 'afectacion_vivienda')}</th>
                <th onclick="ordenarTablaAyuda('requiere_refugio')" style="cursor:pointer">REFUGIO ${obtenerSimboloOrden(sortConfigAyuda, 'requiere_refugio')}</th>
                <th onclick="ordenarTablaAyuda('servicios_afectados')" style="cursor:pointer">SERVICIOS ${obtenerSimboloOrden(sortConfigAyuda, 'servicios_afectados')}</th>
                <th onclick="ordenarTablaAyuda('estado')" style="cursor:pointer">SITUACIÓN ${obtenerSimboloOrden(sortConfigAyuda, 'estado')}</th>
                <th onclick="ordenarTablaAyuda('lesiones_fisicas')" style="cursor:pointer">LESIONES ${obtenerSimboloOrden(sortConfigAyuda, 'lesiones_fisicas')}</th>
                <th onclick="ordenarTablaAyuda('damnificado')" style="cursor:pointer">DAMNIFICADO ${obtenerSimboloOrden(sortConfigAyuda, 'damnificado')}</th>
                <th onclick="ordenarTablaAyuda('ubicacion')" style="cursor:pointer">UBICACIÓN ACTUAL ${obtenerSimboloOrden(sortConfigAyuda, 'ubicacion')}</th>
                <th onclick="ordenarTablaAyuda('descripcion_ayuda')" style="cursor:pointer">REQUERIMIENTO ${obtenerSimboloOrden(sortConfigAyuda, 'descripcion_ayuda')}</th>
                <th class="admin-action-header">ACCIONES</th>
            </tr>`;

            let htmlFinal = '';
            let datosOrdenados = ordenarColeccion(datos, sortConfigAyuda);

            datosOrdenados.forEach(a => {
                htmlFinal += `<tr>
                    <td data-label="Tipo">${a.tipo_reporte || '-'}</td>
                    <td data-label="Afectado"><strong>${a.nombre}</strong></td>
                    <td data-label="Cédula">${enmascararCedula(a.cedula)}</td>
                    <td data-label="Teléfono">${enmascararTelefono(a.telefono)}</td>
                    <td data-label="Correo">${a.correo || '-'}</td>
                    <td data-label="Sede">${a.sede_usb || '-'}</td>
                    <td data-label="Carnet">${a.carnet_estudiante || '-'}</td>
                    <td data-label="Comunidad">${a.comunidad || '-'}</td>
                    <td data-label="Grupo">${a.grupo || '-'}</td>
                    <td data-label="Estado Res.">${a.estado_residencial || '-'}</td>
                    <td data-label="Eje">${a.eje_logistico || '-'}</td>
                    <td data-label="Dirección"><div class="text-truncate-clamp">${a.direccion_residencial || '-'}</div></td>
                    <td data-label="Afectación Viv.">${a.afectacion_vivienda || '-'}</td>
                    <td data-label="Refugio">${a.requiere_refugio || '-'}</td>
                    <td data-label="Servicios">${a.servicios_afectados || '-'}</td>
                    <td data-label="Situación">${a.estado || '-'}</td>
                    <td data-label="Lesiones">${a.lesiones_fisicas || '-'}</td>
                    <td data-label="Damnificado">${a.damnificado || '-'}</td>
                    <td data-label="Ubicación Actual"><div class="text-truncate-clamp">${a.ubicacion || '-'}</div></td>
                    <td data-label="Requerimiento"><div class="text-truncate-clamp">${a.descripcion_ayuda || '-'}</div></td>
                    <td class="actions-cell admin-action-header" data-label="Acciones"><button class="btn-edit-table" onclick="activarEdicionAyuda('${a.id}')">Editar</button><button class="btn-delete" onclick="eliminarAyuda('${a.id}', this)">Eliminar</button></td>
                </tr>`;
            });
            cuerpo.innerHTML = htmlFinal;
        }

        window.activarEdicionAyuda = function(id) {
            const reg = ayudaNube.find(r => r.id == id);
            if (!reg) return;
            idEdicionAyuda = id;
            document.getElementById('form-mode-title-ayuda').innerText = "Modificar Solicitud de Auxilio";

            document.getElementById('ayuda_tipo').value = reg.tipo_reporte || 'Para mí';
            document.getElementById('ayuda_nombre').value = reg.nombre || '';
            document.getElementById('ayuda_cedula').value = reg.cedula === '-' ? '' : (reg.cedula || '');
            document.getElementById('ayuda_telefono').value = reg.telefono || '';
            document.getElementById('ayuda_sede_usb').value = reg.sede_usb || 'Sartenejas';
            document.getElementById('ayuda_carnet').value = reg.carnet_estudiante === 'N/A' ? '' : (reg.carnet_estudiante || '');
            document.getElementById('comunidad_ayuda').value = reg.comunidad || 'Universidad Simón Bolívar';
            document.getElementById('grupo_ayuda').value = reg.grupo || 'Estudiante';
            document.getElementById('ayuda_state_res').value = reg.estado_residencial || 'La Guaira';
            document.getElementById('ayuda_eje').value = reg.eje_logistico || 'Eje 1. Naiguatá-Camurí Grande';
            document.getElementById('ayuda_direccion_res').value = reg.direccion_residencial || '';
            document.getElementById('ayuda_afectacion_viv').value = reg.afectacion_vivienda || 'Afectación parcial';
            document.getElementById('ayuda_refugio').value = reg.requiere_refugio || 'No';
            document.getElementById('ayuda_estado').value = reg.estado || 'Sin Información';
            document.getElementById('ayuda_lesiones').value = reg.lesiones_fisicas || 'No';
            document.getElementById('ayuda_damnificado').value = reg.damnificado || 'No';
            document.getElementById('ayuda_correo').value = reg.correo || '';
            document.getElementById('ayuda_ubicacion').value = reg.ubicacion || '';
            document.getElementById('ayuda_descripcion').value = reg.descripcion_ayuda || '';

            let servs = reg.servicios_afectados ? reg.servicios_afectados.split(', ') : [];
            document.querySelectorAll('input[name="servicio_afectado"]').forEach(cb => {
                cb.checked = servs.includes(cb.value);
            });

            document.getElementById('btn-submit-ayuda').innerText = "Actualizar Solicitud";
            document.getElementById('cancel-edit-container-ayuda').innerHTML = `<button type="button" class="btn btn-delete btn-block" style="margin-top:0.5rem" onclick="cancelarEdicionAyuda()">Cancelar</button>`;
            
            window.scrollTo({ top: document.getElementById('ayudaForm').offsetTop - 20, behavior: 'smooth' });
        };

        function cancelarEdicionAyuda() {
            idEdicionAyuda = null;
            document.getElementById('ayudaForm').reset();
            document.getElementById('form-mode-title-ayuda').innerText = "Formulario de Solicitud de Auxilio";
            document.getElementById('btn-submit-ayuda').innerText = "Enviar Requerimiento";
            document.getElementById('cancel-edit-container-ayuda').innerHTML = '';
        }

        window.activarEdicionColab = function(id) {
            const reg = colaboradoresNube.find(r => r.id == id);
            if (!reg) return;
            idEdicionColab = id;
            document.getElementById('form-mode-title-colab').innerText = "Modificar Ficha Voluntario";
            document.getElementById('colab_nombre').value = reg.nombre;
            document.getElementById('colab_telefono').value = reg.telefono;
            document.getElementById('colab_cargo').value = reg.cargo_usb;
            document.getElementById('colab_area').value = reg.area_apoyo;
            document.getElementById('colab_lugar').value = reg.lugar_voluntariado;
            document.getElementById('colab_vehiculo').value = reg.vehiculo;
            document.getElementById('colab_notas').value = reg.disponibilidad;

            document.getElementById('btn-submit-colab').innerText = "Actualizar Voluntario";
            document.getElementById('cancel-edit-container-colab').innerHTML = `<button type="button" class="btn btn-delete btn-block" style="margin-top:0.5rem" onclick="cancelarEdicionColab()">Cancelar</button>`;
            
            window.scrollTo({ top: document.getElementById('colaboradorForm').offsetTop - 20, behavior: 'smooth' });
        };

        function cancelarEdicionColab() {
            idEdicionColab = null;
            document.getElementById('colaboradorForm').reset();
            document.getElementById('form-mode-title-colab').innerText = "Inscripción de Voluntarios";
            document.getElementById('btn-submit-colab').innerText = "Registrarse como Voluntario";
            document.getElementById('cancel-edit-container-colab').innerHTML = '';
        }

        document.getElementById('ayudaForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            let serviciosMarcados = [];
            document.querySelectorAll('input[name="servicio_afectado"]:checked').forEach(cb => {
                serviciosMarcados.push(cb.value);
            });

            const payload = {
                nombre: document.getElementById('ayuda_nombre').value.trim(),
                cedula: document.getElementById('ayuda_cedula').value.trim() || '-',
                telefono: document.getElementById('ayuda_telefono').value.trim(),
                ubicacion: document.getElementById('ayuda_ubicacion').value.trim(),
                descripcion_ayuda: document.getElementById('ayuda_descripcion').value.trim(),
                tipo_reporte: document.getElementById('ayuda_tipo').value,
                comunidad: document.getElementById('comunidad_ayuda').value,
                grupo: document.getElementById('grupo_ayuda').value,
                estado: document.getElementById('ayuda_estado').value,
                damnificado: document.getElementById('ayuda_damnificado').value,
                sede_usb: document.getElementById('ayuda_sede_usb').value,
                carnet_estudiante: document.getElementById('ayuda_carnet').value.trim() || 'N/A',
                estado_residencial: document.getElementById('ayuda_state_res').value,
                eje_logistico: document.getElementById('ayuda_eje').value,
                direccion_residencial: document.getElementById('ayuda_direccion_res').value.trim(),
                afectacion_vivienda: document.getElementById('ayuda_afectacion_viv').value,
                requiere_refugio: document.getElementById('ayuda_refugio').value,
                lesiones_fisicas: document.getElementById('ayuda_lesiones').value,
                servicios_afectados: serviciosMarcados.join(', ') || 'Ninguno',
                correo: document.getElementById('ayuda_correo').value.trim()
            };

            if (idEdicionAyuda !== null) {
                await supabaseClient.from('solicitudes_ayuda').update(payload).eq('id', idEdicionAyuda);
                cancelarEdicionAyuda();
            } else {
                await supabaseClient.from('solicitudes_ayuda').insert([payload]);
                document.getElementById('ayudaForm').reset();
                mostrarNotificacion("¡Solicitud registrada exitosamente!");
            }
            await cargarDatosDesdeNube();
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
            let matriz = [["Tipo Reporte", "Afectado/Solicitante", "Cedula", "Teléfono Móvil", "Correo Electrónico", "Sede USB", "Carnet", "Comunidad", "Grupo", "Estado Residencial", "Eje Logístico", "Dirección Completa", "Afectación Vivienda", "Requieres Refugio", "Servicios Afectados", "Situación Actual", "Lesiones Físicas", "Damnificado", "Ubicacion Actual Exacta", "Descripción Requerimiento"]];
            ayudaNube.forEach(a => matriz.push([
                a.tipo_reporte || '-', a.nombre, a.cedula || '-', a.telefono || '-', a.correo || '-', a.sede_usb || '-', a.carnet_estudiante || '-', a.comunidad || '-', a.grupo || '-', a.estado_residencial || '-', a.eje_logistico || '-', a.direccion_residencial || '-', a.afectacion_vivienda || '-', a.requiere_refugio || '-', a.servicios_afectados || '-', a.estado || '-', a.lesiones_fisicas || '-', a.damnificado || '-', a.ubicacion, a.descripcion_ayuda
            ]));
            descargarMatrizComoExcel(matriz, "Data_Ayudas_Afectados_Vivienda_USB");
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

        setInterval(cargarDatosDesdeNube, 15000);

        window.addEventListener('popstate', function(event) {
            if (event.state && event.state.vistaActiva) {
                navegarA(event.state.vistaActiva, true);
            } else {
                navegarA('view-home', true);
            }
        });

        if (!window.history.state) {
            window.history.replaceState({ vistaActiva: 'view-home' }, "", "#view-home");
        }

        cargarDatosDesdeNube();