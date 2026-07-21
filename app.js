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
            if (Math.ceil(carrusel.scrollLeft) >= scrollMaximo - 20) {
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
            const scrollMaximo = carrusel.scrollWidth - carrusel.clientWidth;

            if (direccion === 1 && Math.ceil(carrusel.scrollLeft) >= scrollMaximo - 20) {
                carrusel.scrollTo({ left: 0, behavior: 'smooth' });
            } else if (direccion === -1 && carrusel.scrollLeft <= 20) {
                carrusel.scrollTo({ left: scrollMaximo, behavior: 'smooth' });
            } else {
                carrusel.scrollBy({ left: avance * direccion, behavior: 'smooth' });
            }
            
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

        if (idSeccion === 'view-buscar' && registrosNube.length === 0) {
            cargarAfectadosNube();
        }
        if (idSeccion === 'view-colaborar' && colaboradoresNube.length === 0) {
            cargarColaboradoresNube();
        }
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
            if (document.getElementById('btn-auditoria-admin')) document.getElementById('btn-auditoria-admin').style.display = "none";
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
        const btn = document.getElementById('btn-login');
        btn.innerText = "Verificando..."; btn.disabled = true;

        const u = document.getElementById('adminUser').value.trim();
        const p = document.getElementById('adminPass').value.trim();

        try {
            const { data, error } = await supabaseClient
                .from('perfiles_admin')
                .select('*')
                .eq('usuario', u)
                .eq('clave', p);
            
            if (error) throw error;

            if (data && data.length > 0) {
                const usuarioBD = data[0]; 
                esAdministrador = true;
                perfilUsuarioActual = usuarioBD; 

                const formLogin = document.getElementById('loginForm');
                if (formLogin) {
                    const modalPadre = formLogin.closest('.modal') || formLogin.closest('[class*="modal"]') || formLogin.closest('[id*="modal"]');
                    if (modalPadre) modalPadre.style.display = 'none';
                    else {
                        formLogin.parentElement.style.display = 'none';
                        if(formLogin.parentElement.parentElement) formLogin.parentElement.parentElement.style.display = 'none';
                    }
                }
                document.body.style.overflow = "auto";

                const btnAdminFooter = document.getElementById('btn-toggle-role');
                if (btnAdminFooter) {
                    btnAdminFooter.innerHTML = '🚪 Cerrar Sesión';
                    btnAdminFooter.style.color = '#dc2626';
                    btnAdminFooter.style.fontWeight = 'bold';
                    btnAdminFooter.onclick = function() {
                        if(confirm("¿Seguro que deseas cerrar sesión?")) {
                            location.reload();
                        }
                    };
                }

                const panelAyuda = document.getElementById('panel-tabla-solicitudes');
                const panelForm = document.getElementById('panel-formulario-afectado');
                if(panelAyuda) panelAyuda.style.display = "block";
                if(panelForm) panelForm.style.display = "block";

                const rol = perfilUsuarioActual.rol;
                
                const dropAyuda = document.getElementById('dropZoneAyuda');
                const dropLogistica = document.getElementById('dropZoneLogistica');
                const filtroCen = document.getElementById('filtroCentro');
                
                const btnExpAyuda = document.getElementById('btnExportarAyuda');
                const btnExpBusqueda = document.getElementById('btnExportar');
                const btnExpColab = document.getElementById('btnExportarColab');

                if(dropAyuda) dropAyuda.style.display = "none";
                if(dropLogistica) dropLogistica.style.display = "none";
                if(filtroCen) filtroCen.style.display = "none";
                if(btnExpAyuda) btnExpAyuda.style.display = "none";
                if(btnExpBusqueda) btnExpBusqueda.style.display = "none";
                if(btnExpColab) btnExpColab.style.display = "none";

                try {
                    if(typeof navegarA === 'function') navegarA('view-home');

                    const elementosAyuda = document.querySelectorAll('[onclick*="view-necesito-ayuda"]');
                    const elementosLogistica = document.querySelectorAll('[onclick*="view-etiquetas-logistica"]');
                    const elementosBusqueda = document.querySelectorAll('[onclick*="view-buscar"]');
                    const elementosColaborar = document.querySelectorAll('[onclick*="view-colaborar"]');
                    const elementosInventario = document.querySelectorAll('[onclick*="view-inventario"]'); // <-- SE AÑADE INVENTARIO

                    const mostrarElementos = (nodos, mostrar) => {
                        nodos.forEach(nodo => { nodo.style.display = mostrar ? "" : "none"; });
                    };

                    if (rol === 'super_admin' || rol === 'auditor') {
                        mostrarElementos(elementosAyuda, true);
                        mostrarElementos(elementosLogistica, true);
                        mostrarElementos(elementosBusqueda, true);
                        mostrarElementos(elementosColaborar, true); 
                        mostrarElementos(elementosInventario, true);
                        
                        if (rol === 'super_admin') {
                            const btnAud = document.getElementById('btn-auditoria-admin');
                            if (btnAud) btnAud.style.display = "flex";
                        }
                        
                        if(dropAyuda) dropAyuda.style.display = "block";
                        if(dropLogistica) dropLogistica.style.display = "block";
                        if(filtroCen) filtroCen.style.display = "inline-block";
                        
                        if(btnExpAyuda) btnExpAyuda.style.display = "inline-block";
                        if(btnExpBusqueda) btnExpBusqueda.style.display = (rol === 'super_admin') ? "inline-block" : "none";
                        if(btnExpColab) btnExpColab.style.display = "inline-block";
                        
                        if(document.getElementById('panel-carga-inventario')) document.getElementById('panel-carga-inventario').style.display = "block";

                    } else if (rol === 'admin_busqueda') {
                        mostrarElementos(elementosAyuda, false);
                        mostrarElementos(elementosLogistica, false);
                        mostrarElementos(elementosBusqueda, true);
                        mostrarElementos(elementosColaborar, true);
                        mostrarElementos(elementosInventario, false);
                        
                        if(btnExpColab) btnExpColab.style.display = "inline-block";

                    } else if (rol === 'admin_centro') {
                    
                    }

                } catch(navErr) {
                    console.log("Aviso en la navegación:", navErr);
                }

                await cargarDatosDesdeNube();
                if (typeof cargarInventarioNube === 'function') await cargarInventarioNube();

            } else {
                alert("Usuario o contraseña incorrectos.");
            }
        } catch (err) {
            console.error("Error login:", err.message);
            alert("Error de conexión al verificar credenciales.");
        }
        btn.innerText = "Ingresar"; btn.disabled = false;
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

    // ==========================================
    // CARGA DE DATOS OPTIMIZADA (LAZY LOADING)
    // ==========================================
    async function cargarNoticiasNube() {
        try {
            const { data } = await supabaseClient.from('noticias_oficiales')
                .select('id, titulo, contenido, fecha_publicacion, etiqueta, imagen_url, imagen_miniatura')
                .order('fecha_publicacion', { ascending: false }).limit(15);
            
            if (data) {
                noticiasNube = data; 
                const contenedorCarrusel = document.getElementById('carrusel-noticias');
                const contenedorPagina = document.getElementById('contenedor-todas-noticias');
                
                if (data.length === 0) {
                    const msjVacio = '<div style="color: var(--text-muted);">No hay boletines.</div>';
                    if(contenedorCarrusel) contenedorCarrusel.innerHTML = msjVacio;
                    if(contenedorPagina) contenedorPagina.innerHTML = msjVacio;
                } else {
                    let htmlCarrusel = ''; let htmlPagina = '';
                    data.forEach((n, index) => {
                        const fString = new Date(n.fecha_publicacion).toLocaleDateString('es-VE', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
                        let colBorde = "var(--accent)"; let colFondo = "var(--primary)";
                        let eVal = n.etiqueta ? n.etiqueta.toLowerCase() : '';
                        if (eVal.includes('urgente')) { colBorde = "var(--danger)"; colFondo = "var(--danger)"; }
                        else if (eVal.includes('logro')||eVal.includes('buena')) { colBorde = "var(--success)"; colFondo = "var(--success)"; }
                        else if (eVal.includes('alerta')) { colBorde = "var(--warning)"; colFondo = "#ea580c"; }

                        let etiquetaLimpia = (n.etiqueta && n.etiqueta.trim() !== '') ? n.etiqueta.trim() : 'AVISO';

                        let thumbHtml = '';
                        let urlMini = (n.imagen_miniatura && n.imagen_miniatura.trim() !== '') ? n.imagen_miniatura : n.imagen_url;
                        
                        if (urlMini && urlMini.trim() !== '') {
                            thumbHtml = `<div class="news-thumbnail" style="background-image: url('${urlMini}'); display: block; background-size: cover; background-color: var(--gray-100); background-position: center;"></div>`;
                        } else {
                            thumbHtml = `<div class="news-thumbnail" style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); display: flex; align-items: center; justify-content: center; border-bottom: 3px solid ${colBorde};">
                                <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"></path>
                                    <line x1="8" y1="7" x2="16" y2="7"></line>
                                    <line x1="8" y1="11" x2="16" y2="11"></line>
                                    <line x1="8" y1="15" x2="12" y2="15"></line>
                                </svg>
                            </div>`;
                        }
                        
                        const tarjetaInterior = `${thumbHtml}<div style="display:flex; justify-content:space-between; align-items:center;"><span class="news-badge" style="background-color:${colFondo}; color: #ffffff;">${etiquetaLimpia}</span><span class="news-date">${fString}</span></div><h4 class="news-title">${n.titulo}</h4><div class="news-body">${n.contenido}</div><div class="leer-mas-link">Leer completo ➔</div>`;

                        if (index < 8) htmlCarrusel += `<div class="news-card" style="border-left-color:${colBorde};" onclick="abrirNoticiaCompleta('${n.id}')">${tarjetaInterior}</div>`;
                        htmlPagina += `<div class="news-card" style="border-left-color:${colBorde}; height:auto!important; min-height:280px;" onclick="abrirNoticiaCompleta('${n.id}')">${tarjetaInterior}</div>`;
                    });
                    
                    if(contenedorCarrusel) { contenedorCarrusel.innerHTML = htmlCarrusel; iniciarCarruselAutomatico(); }
                    if(contenedorPagina) contenedorPagina.innerHTML = htmlPagina;
                }
            }
        } catch(e) { console.error(e); }
    }

    async function cargarAfectadosNube() {
        if (registrosNube.length > 0) return;
        const cuerpo = document.getElementById('tablaCuerpo');
        if (cuerpo) cuerpo.innerHTML = '<tr><td colspan="10" style="text-align:center; padding: 3rem; color: var(--text-muted);"><strong>⏳ Descargando registros de la base de datos...</strong></td></tr>';

        try {
            let tempAfectados = [];
            let rangoInicio = 0;
            let rangoFin = 999;
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
            registrosNube = tempAfectados;
            filtrarYActualizarTablero();
        } catch (error) { console.error("Error en afectados:", error); }
    }

    async function cargarColaboradoresNube() {
        if (colaboradoresNube.length > 0) return;
        try {
            const { data } = await supabaseClient.from('colaboradores')
                .select('id, nombre, cargo_usb, ubicacion_geografica, area_apoyo, traslado_logistico, lugar_voluntariado, vehiculo, ofrecimiento_detallado, telefono, disponibilidad')
                .order('created_at', { ascending: false }).limit(500);
            if (data) {
                colaboradoresNube = data;
                actualizarInterfazColaboradores(colaboradoresNube);
            }
        } catch (error) { console.error("Error en colabs:", error); }
    }

    async function cargarDatosDesdeNube() {
        await cargarNoticiasNube();

        if (esAdministrador) {
            await Promise.all([ cargarAfectadosNube(), cargarColaboradoresNube() ]);

            try {
                const [resAyudas, resNov, resLogistica] = await Promise.all([
                    supabaseClient.from('solicitudes_ayuda').select('id, created_at, punto_usb, estado_despacho, nombre, cedula, telefono, correo, comunidad, grupo, estado, ubicacion, es_damnificado, requiere_atencion_medica, personas_hogar, ninos_hogar, adultos_mayores_hogar, req_medicina, req_alimentos, req_limpieza, req_general, descripcion_ayuda').order('created_at', { ascending: false }).limit(500),
                    supabaseClient.from('novedades_pendientes').select('*').order('created_at', { ascending: false }),
                    supabaseClient.from('etiquetas_logistica').select('id, solicitud_id, categoria_insumo, requerimiento, estado, encargado, punto_usb').order('created_at', { ascending: false })
                ]);

                ayudaNube = resAyudas.data || [];
                pedidosLogistica = resLogistica.data || [];

                if (typeof actualizarEstadisticasPuntos === 'function') actualizarEstadisticasPuntos();
                
                const btnAdmin = document.getElementById('btn-novedades-admin');
                let nov = resNov.data || [];
                
                if (nov && nov.length > 0) {
                    if (btnAdmin) { btnAdmin.style.setProperty('display', 'flex', 'important'); btnAdmin.style.zIndex = '999999'; }
                    document.getElementById('contador-novedades').innerText = nov.length;
                    
                    let htmlNovedades = '';
                    nov.forEach(n => {
                        let original = registrosNube.find(r => r.id == n.registro_id);
                        let nomOrig = original ? original.nombre : 'Usuario no encontrado';
                        let estOrig = original ? original.estado : 'Desconocido';
                        let cedOrig = 'No tiene';
                        if (original && original.cedula_identidad && original.cedula_identidad.trim() !== '' && original.cedula_identidad.trim() !== '-') cedOrig = original.cedula_identidad;
                        
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
                if (typeof filtrarYActualizarAyuda === 'function') filtrarYActualizarAyuda();
                else actualizarInterfazAyuda(ayudaNube);
            } catch (error) { console.error("Error admin en sincronización:", error); }
        } else {
            let viewActiva = document.querySelector('.app-view.active');
            if(viewActiva) {
                if (viewActiva.id === 'view-buscar') cargarAfectadosNube();
                if (viewActiva.id === 'view-colaborar') cargarColaboradoresNube();
            }
        }
    }

    // ==========================================
    // LÓGICA DE BOTONES PARA DUPLICADOS
    // ==========================================
    let viendoDuplicadosAfectados = false;
    let viendoDuplicadosAyuda = false;

    window.toggleDuplicadosAfectados = function() {
        viendoDuplicadosAfectados = !viendoDuplicadosAfectados;
        const btn = document.getElementById('btnFiltroDupAfectados');
        if(btn) {
            btn.innerText = viendoDuplicadosAfectados ? "❌ Quitar Filtro" : "🚨 Filtrar Duplicados";
            btn.style.backgroundColor = viendoDuplicadosAfectados ? "#dc2626" : "#f59e0b";
            btn.style.color = "#ffffff";
        }
        filtrarYActualizarTablero();
    };

    window.toggleDuplicadosAyuda = function() {
        viendoDuplicadosAyuda = !viendoDuplicadosAyuda;
        const btn = document.getElementById('btnFiltroDupAyuda');
        if(btn) {
            btn.innerText = viendoDuplicadosAyuda ? "❌ Quitar Filtro" : "🚨 Filtrar Duplicados";
            btn.style.backgroundColor = viendoDuplicadosAyuda ? "#dc2626" : "#f59e0b";
            btn.style.color = "#ffffff";
        }
        filtrarYActualizarAyuda();
    };

    // ==========================================
    // ACTUALIZACIÓN DE TABLA AFECTADOS (BÚSQUEDA)
    // ==========================================
    function filtrarYActualizarTablero() {
        const texto = document.getElementById('buscarInput') ? document.getElementById('buscarInput').value.toLowerCase() : '';
        const filterEst = document.getElementById('filtroEstado') ? document.getElementById('filtroEstado').value : 'Todos';
        const filterGrp = document.getElementById('filtroGrupo') ? document.getElementById('filtroGrupo').value : 'Todos';

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

        // Aplicamos el filtro de duplicados desde el botón dedicado
        if (viendoDuplicadosAfectados) {
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
        
        // 🔒 CANDADO DE SEGURIDAD: Solo Super Admin puede borrar
        const esSuperAdmin = perfilUsuarioActual && perfilUsuarioActual.rol === 'super_admin';

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

            let botonesAccion = '';
            if (esAdministrador) {
                let btnEditar = `<button class="btn-edit-table" onclick="activarEdiciónEnPagina('${reg.id}')">Editar</button>`;
                let btnBorrar = esSuperAdmin ? `<button class="btn-delete" onclick="eliminarFila('${reg.id}', this)">Eliminar</button>` : '';
                botonesAccion = `<td class="actions-cell admin-action-header" data-label="Acciones">${btnEditar}${btnBorrar}</td>`;
            }

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
                    ${botonesAccion}
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

    // ==========================================
    // ACTUALIZACIÓN DE TABLA AYUDA (CENSO)
    // ==========================================
    window.filtrarYActualizarAyuda = function() {
        if (!ayudaNube) return;
        
        const texto = document.getElementById('buscarAyudaInput') ? document.getElementById('buscarAyudaInput').value.toLowerCase() : '';
        const fDam = document.getElementById('filtroDamnificado') ? document.getElementById('filtroDamnificado').value : 'Todos';
        const fDesp = document.getElementById('filtroDespacho') ? document.getElementById('filtroDespacho').value : 'Todos';
        const fCen = document.getElementById('filtroCentro') ? document.getElementById('filtroCentro').value : 'Todos';

        let cedulasValidas = ayudaNube.map(a => String(a.cedula || '').trim()).filter(c => c !== '' && c !== '-');
        let nombresValidos = ayudaNube.map(a => String(a.nombre || '').trim().toLowerCase()).filter(n => n !== '');

        let filtrados = ayudaNube.filter(a => {
            // Aplicamos el filtro de duplicados desde el botón
            if (viendoDuplicadosAyuda) {
                let miCedula = String(a.cedula || '').trim();
                let miNombre = String(a.nombre || '').trim().toLowerCase();
                
                let dupCedula = miCedula !== '-' && miCedula !== '' && cedulasValidas.filter(c => c === miCedula).length > 1;
                let dupNombre = miNombre !== '' && nombresValidos.filter(n => n === miNombre).length > 1;
                
                if (!dupCedula && !dupNombre) return false;
            } else {
                if (perfilUsuarioActual && perfilUsuarioActual.rol !== 'super_admin' && perfilUsuarioActual.rol !== 'auditor' && perfilUsuarioActual.rol !== 'admin_busqueda') {
                    if (a.punto_usb !== perfilUsuarioActual.centro_acopio) return false;
                }
                if (perfilUsuarioActual && (perfilUsuarioActual.rol === 'super_admin' || perfilUsuarioActual.rol === 'auditor')) {
                    if (fCen !== 'Todos' && a.punto_usb !== fCen) return false;
                }
            }

            const cumpleTexto = String(a.nombre || '').toLowerCase().includes(texto) || String(a.cedula || '').toLowerCase().includes(texto);
            
            let isDamStr = (a.es_damnificado === true || String(a.damnificado).trim().toLowerCase() === 'sí' || String(a.damnificado).trim().toLowerCase() === 'si') ? "SÍ" : "NO";
            const cumpleDam = (fDam === 'Todos') || (isDamStr === fDam);

            let estadoCalculado = 'Sin Pedido';
            let ticketsPersona = pedidosLogistica.filter(p => p.solicitud_id === a.id);
            
            if (ticketsPersona.length > 0) {
                if (ticketsPersona.some(t => t.estado === 'Pendiente')) estadoCalculado = 'Pendiente';
                else if (ticketsPersona.some(t => t.estado === 'Empacando')) estadoCalculado = 'En Proceso';
                else estadoCalculado = 'Despachado';
            }
            a.estado_despacho_calculado = estadoCalculado; 
            
            const cumpleDesp = (fDesp === 'Todos') || (estadoCalculado === fDesp);

            return cumpleTexto && cumpleDam && cumpleDesp;
        });

        const thead = document.getElementById('theadAyuda');
        const tbody = document.getElementById('tablaAyudaCuerpo');
        if(!thead || !tbody) return;

        thead.innerHTML = `
            <tr>
                <th>PUNTO ACOPIO</th>
                <th>AFECTADO</th>
                <th>CONTACTO</th>
                <th>DAMNIFICADO</th>
                <th>ESTADO DESPACHO</th>
                <th>ACCIONES</th>
            </tr>
        `;

        tbody.innerHTML = '';
        if(filtrados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem;">No hay registros que coincidan con la búsqueda.</td></tr>';
            return;
        }

        filtrados.forEach(a => {
            let isDamStr = (a.es_damnificado === true || String(a.damnificado).trim().toLowerCase() === 'sí' || String(a.damnificado).trim().toLowerCase() === 'si') ? "SÍ" : "NO";
            let badgeDam = isDamStr === "SÍ" ? `<span class="badge" style="background:#dc3545; color:white;">SÍ</span>` : `NO`;
            
            let tieneMedicina = a.req_medicina && a.req_medicina !== '-' && String(a.req_medicina).trim() !== '';
            let alertaMedica = tieneMedicina ? `<div style="color:#dc2626; font-size:0.75rem; margin-top:4px; font-weight:bold;">🚨 Solicita Medicina</div>` : '';

            let colorDespacho = '#64748b'; 
            let estDespacho = a.estado_despacho_calculado || 'Sin Pedido';
            if(estDespacho === 'Pendiente') colorDespacho = '#dc2626';     
            if(estDespacho === 'En Proceso') colorDespacho = '#f59e0b';    
            if(estDespacho === 'Despachado') colorDespacho = '#10b981';    
            let badgeDespacho = `<span class="badge" style="background:${colorDespacho}; color:white; font-size: 0.8rem; padding: 4px 8px;">${estDespacho}</span>`;

            let btnAccionesContainer = '';
            let btnVerInfo = `<button class="btn btn-primary" style="padding:0.4rem; font-size:0.8rem; background-color:#0284c7; flex:1;" onclick="verDetallesAyuda('${a.id}')">👁️ Ver Info</button>`;

            if (perfilUsuarioActual && (perfilUsuarioActual.rol === 'auditor' || perfilUsuarioActual.rol === 'admin_busqueda' || perfilUsuarioActual.rol === 'especialista_cva')) {
                btnAccionesContainer = `<div style="display:flex; gap:5px; width:100%;">${btnVerInfo}</div>`;
            } else {
                let btnEditar = `<button class="btn btn-warning" style="padding:0.4rem; font-size:0.8rem; flex:1;" onclick="activarEdicionAyuda('${a.id}')">✏️ Editar</button>`;
                
                let btnEliminar = '';
                // 🔒 CANDADO SUPER ADMIN PARA LA TABLA DE AYUDA
                if (perfilUsuarioActual && perfilUsuarioActual.rol === 'super_admin') {
                    btnEliminar = `<button class="btn btn-delete" style="padding:0.4rem; font-size:0.8rem; flex:1; background-color:#fef2f2; color:#dc2626; border:1px solid #fecaca;" onclick="eliminarAyuda('${a.id}', this)">🗑️ Borrar</button>`;
                }
                
                btnAccionesContainer = `<div style="display:flex; gap:5px; width:100%; flex-wrap:wrap;">${btnVerInfo}${btnEditar}${btnEliminar}</div>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td data-label="Punto Acopio"><strong>${a.punto_usb || 'Sin Asignar'}</strong></td>
                    <td data-label="Afectado">
                        <div style="font-weight:bold;">${a.nombre || '-'}</div>
                        <div style="font-size:0.8rem; color:#64748b;">C.I: ${a.cedula || '-'}</div>
                    </td>
                    <td data-label="Contacto">
                        <div>${a.telefono || '-'}</div>
                        <div style="font-size:0.8rem; color:#64748b;">${a.ubicacion || '-'}</div>
                    </td>
                    <td data-label="Damnificado">${badgeDam} ${alertaMedica}</td>
                    <td data-label="Despacho">${badgeDespacho}</td>
                    <td data-label="Acciones" class="actions-cell">${btnAccionesContainer}</td>
                </tr>
            `;
        });
    };

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

            let esDam = a.es_damnificado === true || String(a.damnificado).trim().toLowerCase() === 'sí' || String(a.damnificado).trim().toLowerCase() === 'si';
            let badgeDamnificado = esDam ? `<span style="background: #dc3545; color: white; padding: 3px 6px; border-radius: 4px;">SÍ</span>` : `NO`;
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
        
        document.getElementById('puntoUsbForm').value = reg.punto_usb || '';
        document.getElementById('ubicacionAfectado').value = reg.ubicacion || '';
        document.getElementById('nombreAfectado').value = reg.nombre || '';
        document.getElementById('cedulaAfectado').value = reg.cedula === '-' ? '' : (reg.cedula || '');
        document.getElementById('telefonoAfectado').value = reg.telefono || '';
        document.getElementById('correoAfectado').value = reg.correo || '';
        document.getElementById('carnetAfectado').value = reg.carnet_estudiante === 'N/A' ? '' : (reg.carnet_estudiante || '');
        document.getElementById('grupoAfectado').value = reg.grupo || '';
        
        let esDamEdit = reg.es_damnificado === true;
        let radioSi = document.querySelector('input[name="damnificadoAfectado"][value="si"]');
        let radioNo = document.querySelector('input[name="damnificadoAfectado"][value="no"]');
        if(radioSi && radioNo) {
            if(esDamEdit) radioSi.checked = true;
            else radioNo.checked = true;
        }

        document.getElementById('atencionMedica').value = (reg.requiere_atencion_medica === true || reg.requiere_atencion_medica === 'true') ? "Sí requiere (Revisar obs.)" : (reg.requiere_atencion_medica || '');
        document.getElementById('personasHogar').value = reg.personas_hogar || 1;
        document.getElementById('ninosHogar').value = reg.ninos_hogar || 0;
        document.getElementById('adultosMayores').value = reg.adultos_mayores_hogar || 0;
        
        document.getElementById('reqMedicina').value = reg.req_medicina || '';
        document.getElementById('reqAliLim').value = reg.req_alimentos || '';
        document.getElementById('reqOtras').value = reg.req_general || '';
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

    window.verDetallesAyuda = function(id) {
        const persona = ayudaNube.find(a => String(a.id) === String(id));
        
        if (!persona) {
            console.error("Error: No se encontró la persona con ID", id);
            return; 
        }

        const ticketsPersona = pedidosLogistica.filter(p => String(p.solicitud_id) === String(id));
        
        let historialTickets = '';
        if(ticketsPersona.length === 0) {
            historialTickets = '<p style="color:var(--text-muted); font-size:0.9rem;">No tiene pedidos logísticos generados en el sistema.</p>';
        } else {
            historialTickets = '<table style="width:100%; border-collapse:collapse; font-size:0.85rem; border-radius:6px; overflow:hidden;"><thead><tr style="background:#f1f5f9;"><th style="padding:8px; border:1px solid #e2e8f0; text-align:left;">Insumo</th><th style="padding:8px; border:1px solid #e2e8f0; text-align:left;">Detalle</th><th style="padding:8px; border:1px solid #e2e8f0; text-align:left;">Estado</th></tr></thead><tbody>';
            ticketsPersona.forEach(t => {
                let colEst = t.estado === 'Despachado' ? '#16a34a' : (t.estado === 'Empacando' ? '#ca8a04' : '#dc2626');
                historialTickets += `<tr><td style="padding:8px; border:1px solid #e2e8f0; text-transform:capitalize;">${t.categoria_insumo}</td><td style="padding:8px; border:1px solid #e2e8f0;">${t.requerimiento}</td><td style="padding:8px; border:1px solid #e2e8f0; color:${colEst}; font-weight:bold;">${t.estado}</td></tr>`;
            });
            historialTickets += '</tbody></table>';
        }

        const isDam = (persona.es_damnificado === true || String(persona.damnificado).trim().toLowerCase() === 'sí' || String(persona.damnificado).trim().toLowerCase() === 'si') ? "SÍ" : "NO";
        const reqMed = persona.requiere_atencion_medica ? `<div style="background:#fef2f2; color:#dc2626; padding:10px; border-radius:6px; margin-top:10px; font-weight:bold;">🚨 Requiere Atención Médica: ${persona.requiere_atencion_medica}</div>` : '';

        document.getElementById('contenido-detalles-ayuda').innerHTML = `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:1.5rem;">
                <div><strong style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">Nombre Completo</strong><div style="font-size:1.1rem; font-weight:bold; color:var(--primary);">${persona.nombre}</div></div>
                <div><strong style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">Cédula</strong><div style="font-size:0.95rem;">${persona.cedula || '-'}</div></div>
                <div><strong style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">Teléfono</strong><div style="font-size:0.95rem;">${persona.telefono || '-'}</div></div>
                <div><strong style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">Ubicación Actual</strong><div style="font-size:0.95rem;">${persona.ubicacion || '-'}</div></div>
                <div><strong style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">Vínculo USB</strong><div style="font-size:0.95rem;">${persona.grupo || '-'}</div></div>
                <div><strong style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">Damnificado</strong><div style="font-size:0.95rem;">${isDam}</div></div>
            </div>
            
            <div style="background:#f8fafc; padding:15px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:1.5rem;">
                <h4 style="margin:0 0 10px 0; color:var(--primary); font-size:0.95rem;">👨‍👩‍👧‍👦 Composición Familiar</h4>
                <div style="display:flex; gap:20px; font-size:0.9rem;">
                    <div><strong>Total:</strong> ${persona.personas_hogar || 1}</div>
                    <div><strong>Niños:</strong> ${persona.ninos_hogar || 0}</div>
                    <div><strong>Adultos Mayores:</strong> ${persona.adultos_mayores_hogar || 0}</div>
                </div>
                ${reqMed}
            </div>

            <div style="margin-bottom:1.5rem;">
                <h4 style="margin:0 0 10px 0; color:var(--primary); font-size:0.95rem;">📦 Historial Logístico</h4>
                ${historialTickets}
            </div>
            
            <div>
                <h4 style="margin:0 0 5px 0; color:var(--primary); font-size:0.95rem;">📝 Observaciones del Caso</h4>
                <p style="font-size:0.9rem; color:var(--gray-700); background:#f1f5f9; padding:10px; border-radius:6px; margin:0;">${persona.descripcion_ayuda || 'Sin observaciones adicionales.'}</p>
            </div>
        `;
        
        document.getElementById('modal-detalles-ayuda').style.display = 'flex';
    };

    document.getElementById('formSolicitudAyuda').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const reqMed = document.getElementById('reqMedicina').value.trim();
        const reqAliLim = document.getElementById('reqAliLim').value.trim();
        const reqOtras = document.getElementById('reqOtras').value.trim();
        
        const puntoSeleccionado = document.getElementById('puntoUsbForm').value;
        const grupoSeleccionado = document.getElementById('grupoAfectado').value;
        
        const radioDam = document.querySelector('input[name="damnificadoAfectado"]:checked');
        const esDamnificadoForm = radioDam ? (radioDam.value === 'si') : false;

        const atencionTxt = document.getElementById('atencionMedica').value.trim();
        const obsOriginal = document.getElementById('observacionesAfectado').value.trim();
        
        const requiereMedicaBool = atencionTxt !== '';
        const observacionesFinales = requiereMedicaBool 
            ? `[ATENCIÓN MÉDICA REQUERIDA: ${atencionTxt}] \n${obsOriginal}`
            : obsOriginal;

        const payloadAyuda = {
            estado: 'Con vida',
            punto_usb: puntoSeleccionado,
            ubicacion: document.getElementById('ubicacionAfectado').value, 
            nombre: document.getElementById('nombreAfectado').value,
            cedula: document.getElementById('cedulaAfectado').value || '-',
            telefono: document.getElementById('telefonoAfectado').value || '-',
            correo: document.getElementById('correoAfectado').value,
            carnet_estudiante: document.getElementById('carnetAfectado').value || 'N/A', 
            grupo: grupoSeleccionado,
            comunidad: 'Universidad Simón Bolívar',
            es_damnificado: esDamnificadoForm, 
            requiere_atencion_medica: atencionTxt, 
            personas_hogar: parseInt(document.getElementById('personasHogar').value) || 1,
            ninos_hogar: parseInt(document.getElementById('ninosHogar').value) || 0,
            adultos_mayores_hogar: parseInt(document.getElementById('adultosMayores').value) || 0,
            req_medicina: reqMed,
            req_alimentos: reqAliLim,
            req_limpieza: '',
            req_general: reqOtras,
            descripcion_ayuda: observacionesFinales 
        };

        try {
            mostrarNotificacion("Procesando solicitud...", true);
            
            if (idEdicionAyuda !== null) {
                const { error: updateError } = await supabaseClient
                    .from('solicitudes_ayuda')
                    .update(payloadAyuda)
                    .eq('id', idEdicionAyuda);
                    
                if (updateError) throw updateError;

                const { data: ticketsExistentes } = await supabaseClient
                    .from('etiquetas_logistica')
                    .select('categoria_insumo, id, requerimiento')
                    .eq('solicitud_id', idEdicionAyuda);

                let ticketsAInsertar = [];
                const categorias = [
                    { cat: 'medicina', val: reqMed }, 
                    { cat: 'alimentos_limpieza', val: reqAliLim },
                    { cat: 'otras', val: reqOtras }
                ];

                for (let c of categorias) {
                    if (c.val) {
                        let ticketPrevio = ticketsExistentes ? ticketsExistentes.find(t => t.categoria_insumo === c.cat) : null;
                        if (!ticketPrevio) {
                            ticketsAInsertar.push({
                                solicitud_id: idEdicionAyuda, categoria_insumo: c.cat,
                                requerimiento: c.val, punto_usb: puntoSeleccionado,
                                estado: 'Pendiente', encargado: 'Sin Asignar'
                            });
                        } else if (ticketPrevio.requerimiento !== c.val) {
                            await supabaseClient.from('etiquetas_logistica').update({ requerimiento: c.val }).eq('id', ticketPrevio.id);
                        }
                    }
                }

                if (ticketsAInsertar.length > 0) {
                    await supabaseClient.from('etiquetas_logistica').insert(ticketsAInsertar);
                }
                
                mostrarNotificacion("✅ Información y pedidos actualizados.");
                cancelarEdicionAyuda();
            } else {
                payloadAyuda.estado_despacho = 'Pendiente';
                const { data: ayudaData, error: ayudaError } = await supabaseClient.from('solicitudes_ayuda').insert([payloadAyuda]).select();
                if (ayudaError) throw ayudaError;

                const solicitudId = ayudaData[0].id;
                const ticketsLogistica = [];
                
                if (reqMed) ticketsLogistica.push({ solicitud_id: solicitudId, categoria_insumo: 'medicina', requerimiento: reqMed, punto_usb: puntoSeleccionado, estado: 'Pendiente', encargado: 'Sin Asignar' });
                if (reqAliLim) ticketsLogistica.push({ solicitud_id: solicitudId, categoria_insumo: 'alimentos_limpieza', requerimiento: reqAliLim, punto_usb: puntoSeleccionado, estado: 'Pendiente', encargado: 'Sin Asignar' });
                if (reqOtras) ticketsLogistica.push({ solicitud_id: solicitudId, categoria_insumo: 'otras', requerimiento: reqOtras, punto_usb: puntoSeleccionado, estado: 'Pendiente', encargado: 'Sin Asignar' });

                if (ticketsLogistica.length > 0) {
                    await supabaseClient.from('etiquetas_logistica').insert(ticketsLogistica);
                }
                
                document.getElementById('formSolicitudAyuda').reset();
                mostrarNotificacion("✅ Solicitud registrada y enviada a almacenes.");
            }

            await cargarDatosDesdeNube(); 
            if (typeof cargarTablaLogisticaFuerza === "function") cargarTablaLogisticaFuerza();
            
        } catch (err) {
            console.error("Error guardando:", err);
            alert("Ocurrió un error al procesar tu solicitud. Intenta de nuevo.");
        }
    });

    document.getElementById('cedulaAfectado').addEventListener('blur', function() {
        if (idEdicionAyuda !== null) return;
        
        let ced = this.value.trim();
        if (ced.length < 5 || ced === '-') return;

        let personaAyuda = ayudaNube.find(a => String(a.cedula).trim() === ced);
        if (personaAyuda) {
            document.getElementById('nombreAfectado').value = personaAyuda.nombre || '';
            document.getElementById('telefonoAfectado').value = personaAyuda.telefono || '';
            document.getElementById('ubicacionAfectado').value = personaAyuda.ubicacion || '';
            document.getElementById('correoAfectado').value = personaAyuda.correo || '';
            document.getElementById('grupoAfectado').value = personaAyuda.grupo || 'Estudiante';
            if (personaAyuda.carnet_estudiante && personaAyuda.carnet_estudiante !== 'N/A') {
                document.getElementById('carnetAfectado').value = personaAyuda.carnet_estudiante;
            }
            mostrarNotificacion("✅ Datos precargados del historial de ayuda.");
            return;
        }

        let afectado = registrosNube.find(r => String(r.cedula_identidad).trim() === ced);
        if (afectado) {
            document.getElementById('nombreAfectado').value = afectado.nombre || '';
            if (afectado.telefono && afectado.telefono !== '-') document.getElementById('telefonoAfectado').value = afectado.telefono;
            if (afectado.ubicacion && afectado.ubicacion !== '-') document.getElementById('ubicacionAfectado').value = afectado.ubicacion;
            
            let gKey = String(afectado.edad).trim().toLowerCase();
            let grupoMapeado = "Estudiante";
            if(gKey.includes('prof')) grupoMapeado = "Profesor";
            if(gKey.includes('egr')) grupoMapeado = "Egresado";
            if(gKey.includes('adm')) grupoMapeado = "Administrativo";
            if(gKey.includes('obr')) grupoMapeado = "Obrero";
            if(gKey.includes('ext')) grupoMapeado = "Externo";
            document.getElementById('grupoAfectado').value = grupoMapeado;
            
            mostrarNotificacion("✅ Datos precargados del registro general.");
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
            registrarAuditoria('EDITAR', 'Registro General', `Editó los datos de: ${manual.nombre}`);
            cancelarEdicion();
        } else {
            await supabaseClient.from('registros_ciudadanos').insert([manual]);
            registrarAuditoria('CREAR', 'Registro General', `Registró a una nueva persona: ${manual.nombre}`);
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
                let nombresOmitidos = [];

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
                            nombresOmitidos.push(nomVal);
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
                
                let msgOmitidos = "";
                if (nombresOmitidos.length > 0) {
                    let unicos = [...new Set(nombresOmitidos)];
                    let tope = 15;
                    let listaStr = unicos.slice(0, tope).join(", ");
                    if (unicos.length > tope) listaStr += ` y ${unicos.length - tope} más...`;
                    msgOmitidos = `\n\nNombres omitidos (Repetidos/Sin cambios):\n${listaStr}`;
                }

                alert(`Plantilla procesada.\n✅ ${nuevosRegistros.length} registros nuevos.\n🔄 ${registrosActualizados} registros actualizados.\n⚠️ ${duplicadosOmitidos} filas omitidas.${msgOmitidos}`);
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
        registrarAuditoria('APROBAR', 'Novedades', `Aprobó el cambio de estado a '${nuevoEstado}' para el registro ID: ${idRegistro}`);
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

    document.getElementById('buscarAyudaInput').addEventListener('input', filtrarYActualizarAyuda);
    document.getElementById('filtroDamnificado').addEventListener('change', filtrarYActualizarAyuda);
    document.getElementById('filtroDespacho').addEventListener('change', filtrarYActualizarAyuda);
    document.getElementById('filtroCentro').addEventListener('change', filtrarYActualizarAyuda);

    document.getElementById('btnExportarAyuda').addEventListener('click', function() {
        if (!ayudaNube || ayudaNube.length === 0) { alert("No hay datos para exportar."); return; }

        let datosAExportar = ayudaNube;
        const fCen = document.getElementById('filtroCentro').value;
        const fDam = document.getElementById('filtroDamnificado').value;
        const fDesp = document.getElementById('filtroDespacho').value;
        const texto = document.getElementById('buscarAyudaInput').value.toLowerCase();

        if (perfilUsuarioActual && perfilUsuarioActual.rol !== 'super_admin' && perfilUsuarioActual.rol !== 'auditor' && perfilUsuarioActual.rol !== 'admin_busqueda') {
            datosAExportar = datosAExportar.filter(a => a.punto_usb === perfilUsuarioActual.centro_acopio);
        } else if (fCen !== 'Todos' && fCen !== 'Duplicados') {
            datosAExportar = datosAExportar.filter(a => a.punto_usb === fCen);
        }

        datosAExportar = datosAExportar.filter(a => {
            const cumpleTexto = String(a.nombre || '').toLowerCase().includes(texto) || String(a.cedula || '').toLowerCase().includes(texto);
            let isDamStr = (a.es_damnificado === true || String(a.damnificado).trim().toLowerCase() === 'sí' || String(a.damnificado).trim().toLowerCase() === 'si') ? "SÍ" : "NO";
            const cumpleDam = (fDam === 'Todos') || (isDamStr === fDam);
            const cumpleDesp = (fDesp === 'Todos') || (a.estado_despacho_calculado === fDesp);
            return cumpleTexto && cumpleDam && cumpleDesp;
        });

        if(datosAExportar.length === 0) { alert("No hay datos en pantalla para exportar."); return; }

        let matriz = [
            ["REPORTE OFICIAL DE SOLICITUDES DE AYUDA - ASOCIACIÓN DE EGRESADOS USB"],
            [],
            [
            "ID SOLICITUD", "FECHA REPORTE", "PUNTO ACOPIO", "ESTADO DESPACHO", 
            "AFECTADO", "CÉDULA", "TELÉFONO", "CORREO", "COMUNIDAD", "RELACIÓN USB", 
            "ESTADO VITAL", "UBICACIÓN", "ES DAMNIFICADO", 
            "ATENCIÓN MÉDICA", "TOTAL PERSONAS", "NIÑOS", "ADULTOS MAYORES", 
            "REQ. MEDICINA", "REQ. ALIMENTOS/AGUA/LIMPIEZA", "OTRAS SOLICITUDES", "OBSERVACIONES"
            ]
        ];

        datosAExportar.forEach(a => {
            let fecha = a.created_at ? new Date(a.created_at).toLocaleString('es-VE') : '';
            matriz.push([
                a.id, fecha, a.punto_usb || 'Sin Asignar', a.estado_despacho_calculado || 'Pendiente',
                a.nombre || '-', a.cedula || '-', a.telefono || '-', a.correo || '-', a.comunidad || '-',
                a.grupo || '-', a.estado || '-', a.ubicacion || '-',
                (a.es_damnificado === true || String(a.damnificado).trim().toLowerCase() === 'sí' || String(a.damnificado).trim().toLowerCase() === 'si') ? "SÍ" : "NO",
                a.requiere_atencion_medica ? "SÍ" : "NO",
                a.personas_hogar || 1, a.ninos_hogar || 0, a.adultos_mayores_hogar || 0,
                a.req_medicina || '-', a.req_alimentos || '-', a.req_general || '-', a.descripcion_ayuda || '-'
            ]);
        });

        const wb = XLSX.utils.book_new(); 
        const ws = XLSX.utils.aoa_to_sheet(matriz);

        ws['!merges'] = [ { s: {r:0, c:0}, e: {r:0, c:20} } ];

        ws['!cols'] = [
            {wch: 10}, {wch: 20}, {wch: 22}, {wch: 18}, {wch: 25}, {wch: 12}, 
            {wch: 15}, {wch: 25}, {wch: 25}, {wch: 15}, {wch: 15}, {wch: 35}, 
            {wch: 15}, {wch: 15}, {wch: 15}, {wch: 10}, {wch: 15}, {wch: 30}, 
            {wch: 30}, {wch: 30}, {wch: 40}
        ];

        let nombreCentro = perfilUsuarioActual && perfilUsuarioActual.rol !== 'super_admin' ? perfilUsuarioActual.centro_acopio.substring(0,8) : fCen.substring(0,8);
        if (nombreCentro === 'Todos') nombreCentro = 'General';

        XLSX.utils.book_append_sheet(wb, ws, "Censo_Ayuda");
        XLSX.writeFile(wb, `Reporte_Ayuda_${nombreCentro}_${new Date().toISOString().split('T')[0]}.xlsx`);
    });

    function descargarMatrizComoExcel(matriz, nombreArchivo) {
        const wb = XLSX.utils.book_new(); const ws = XLSX.utils.aoa_to_sheet(matriz);
        XLSX.utils.book_append_sheet(wb, ws, "Datos");
        XLSX.writeFile(wb, `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.xlsx`);
    }

    window.eliminarFila = async function(id, boton) {
        if (!boton) return;
        
        if (boton.dataset.estado !== "confirmar") {
            boton.dataset.textoOriginal = boton.innerText;
            boton.dataset.estado = "confirmar";
            boton.innerText = "¿Seguro?";
            boton.style.backgroundColor = "#dc2626";
            boton.style.color = "#ffffff";
            boton.style.borderColor = "#dc2626";
            
            boton.timeoutId = setTimeout(() => {
                restaurarBoton(boton);
            }, 3000);
        } else {
            if (boton.timeoutId) clearTimeout(boton.timeoutId);
            boton.innerText = "Borrando...";
            boton.disabled = true;
            
            try {
                const { error, count } = await supabaseClient
                    .from('registros_ciudadanos')
                    .delete({ count: 'exact' })
                    .eq('id', id);
                
                if (error) {
                    alert("Error en la Base de Datos: " + error.message);
                    restaurarBoton(boton);
                } else if (count === 0) {
                    alert("⚠️ Supabase bloqueó el borrado. \n\nVe a tu panel de Supabase > Authentication > Policies y asegúrate de que la política pública tenga el permiso 'DELETE' marcado.");
                    restaurarBoton(boton);
                } else {
                    mostrarNotificacion("✅ Registro general eliminado.");
                    registrarAuditoria('ELIMINAR', 'Registro General', `Se eliminó el registro ID: ${id}`);
                    await cargarDatosDesdeNube();
                }
            } catch(e) {
                alert("Error crítico: " + e.message);
                restaurarBoton(boton);
            }
        }
        
        function restaurarBoton(b) {
            b.innerText = b.dataset.textoOriginal || "Eliminar";
            b.dataset.estado = "";
            b.disabled = false;
            b.style.backgroundColor = "#fef2f2";
            b.style.color = "var(--danger)";
            b.style.borderColor = "#fecaca";
        }
    };

    window.eliminarAyuda = async function(id, boton) {
        if (!boton) return;
        
        if (boton.dataset.estado !== "confirmar") {
            boton.dataset.textoOriginal = boton.innerText;
            boton.dataset.estado = "confirmar";
            boton.innerText = "¿Seguro?";
            boton.style.backgroundColor = "#dc2626";
            boton.style.color = "#ffffff";
            boton.style.borderColor = "#dc2626";
            
            boton.timeoutId = setTimeout(() => {
                restaurarBoton(boton);
            }, 3000);
        } else {
            if (boton.timeoutId) clearTimeout(boton.timeoutId);
            boton.innerText = "Borrando...";
            boton.disabled = true;
            
            try {
                await supabaseClient.from('etiquetas_logistica').delete().eq('solicitud_id', id);
                
                const { error, count } = await supabaseClient
                    .from('solicitudes_ayuda')
                    .delete({ count: 'exact' })
                    .eq('id', id);
                
                if (error) {
                    alert("Error en la Base de Datos: " + error.message);
                    restaurarBoton(boton);
                } else if (count === 0) {
                    alert("⚠️ Supabase bloqueó el borrado de Ayuda. \n\nRevisa que la política RLS de la tabla 'solicitudes_ayuda' tenga permitido el DELETE público.");
                    restaurarBoton(boton);
               } else {
                    mostrarNotificacion("✅ Registro y pedidos eliminados.");
                    registrarAuditoria('ELIMINAR', 'Censo Ayuda', `Se eliminó la solicitud de ayuda ID: ${id}`);
                    await cargarDatosDesdeNube();
                }
            } catch(e) {
                alert("Error crítico en borrado: " + e.message);
                restaurarBoton(boton);
            }
        }
        
        function restaurarBoton(b) {
            b.innerText = b.dataset.textoOriginal || "🗑️ Borrar";
            b.dataset.estado = "";
            b.disabled = false;
            b.style.backgroundColor = "#fef2f2";
            b.style.color = "var(--danger)";
            b.style.borderColor = "#fecaca";
        }
    };

    window.eliminarColab = async function(id, boton) {
        if (!boton) return;
        
        if (boton.dataset.estado !== "confirmar") {
            boton.dataset.textoOriginal = boton.innerText;
            boton.dataset.estado = "confirmar";
            boton.innerText = "¿Seguro?";
            boton.style.backgroundColor = "#dc2626";
            boton.style.color = "#ffffff";
            boton.style.borderColor = "#dc2626";
            
            boton.timeoutId = setTimeout(() => {
                restaurarBoton(boton);
            }, 3000);
        } else {
            if (boton.timeoutId) clearTimeout(boton.timeoutId);
            boton.innerText = "Borrando...";
            boton.disabled = true;
            
            try {
                const { error, count } = await supabaseClient
                    .from('colaboradores')
                    .delete({ count: 'exact' })
                    .eq('id', id);
                
                if (error) {
                    alert("Error interno: " + error.message);
                    restaurarBoton(boton);
                } else if (count === 0) {
                    alert("⚠️ Supabase bloqueó el borrado de Colaboradores. Falta permiso DELETE en Supabase.");
                    restaurarBoton(boton);
                } else {
                    mostrarNotificacion("✅ Colaborador eliminado.");
                    registrarAuditoria('ELIMINAR', 'Voluntarios', `Se eliminó al voluntario ID: ${id}`);
                    await cargarDatosDesdeNube();
                }
            } catch(e) {
                alert("Error crítico: " + e.message);
                restaurarBoton(boton);
            }
        }
        
        function restaurarBoton(b) {
            b.innerText = b.dataset.textoOriginal || "Eliminar";
            b.dataset.estado = "";
            b.disabled = false;
            b.style.backgroundColor = "#fef2f2";
            b.style.color = "var(--danger)";
            b.style.borderColor = "#fecaca";
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
    
    window.agregarFilaInsumoManual = function() {
        const contenedor = document.getElementById('contenedor-insumos-manuales');
        const htmlFila = `
            <div class="insumo-row form-row" style="align-items: flex-end; margin-bottom: 10px; gap: 10px;">
                <div class="form-group" style="flex: 0 0 70px; margin-bottom: 0;">
                    <input type="number" class="form-input manual-cant" min="1" required placeholder="#">
                </div>
                <div class="form-group" style="flex: 2; margin-bottom: 0;">
                    <input type="text" class="form-input manual-nombre" required placeholder="Ej: Nombre de insumo...">
                </div>
                <div class="form-group" style="flex: 2; margin-bottom: 0;">
                    <select class="form-select manual-cat" required>
                        <option value="medicina">💊 Medicina</option>
                        <option value="alimentos_limpieza">🥫🧼 Alimentos, Agua y Limpieza</option>
                        <option value="otras">🛠️ Otras Solicitudes</option>
                    </select>
                </div>
                <div class="form-group" style="flex: 0 0 auto; margin-bottom: 0;">
                    <button type="button" class="btn btn-delete" style="padding: 0.6rem; height: 100%; font-weight: bold;" onclick="this.parentElement.parentElement.remove()" title="Eliminar fila">✖</button>
                </div>
            </div>
        `;
        contenedor.insertAdjacentHTML('beforeend', htmlFila);
    };

    document.getElementById('etiquetaForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const btn = this.querySelector('button[type="submit"]');
        btn.innerText = "Guardando..."; btn.disabled = true;
        
        const centro = document.getElementById('etiqueta_centro').value;
        const beneficiarioTxt = document.getElementById('etiqueta_beneficiario').value.trim();
        const nombreDestino = beneficiarioTxt ? `Para: ${beneficiarioTxt}` : 'Sin Asignar';
        const filas = document.querySelectorAll('.insumo-row');
        
        let agrupados = { medicina: [], alimentos_limpieza: [], otras: [] };
        
        filas.forEach(fila => {
            let cant = fila.querySelector('.manual-cant').value;
            let nom = fila.querySelector('.manual-nombre').value.trim();
            let cat = fila.querySelector('.manual-cat').value;
            if (cant && nom) {
                agrupados[cat].push(`${cant} x ${nom}`);
            }
        });
        
        let nuevosTickets = [];
        for (let cat in agrupados) {
            if (agrupados[cat].length > 0) {
                nuevosTickets.push({
                    punto_usb: centro,
                    categoria_insumo: cat,
                    requerimiento: agrupados[cat].join(', '),
                    estado: "Pendiente",
                    encargado: nombreDestino
                });
            }
        }
        
        if (nuevosTickets.length === 0) {
            alert("Debes agregar al menos un insumo válido.");
            btn.innerText = "CREAR PEDIDO EN EL SISTEMA"; btn.disabled = false;
            return;
        }
        
        const { error } = await supabaseClient.from('etiquetas_logistica').insert(nuevosTickets);
        
        if(error) { 
            alert("Error de guardado: " + error.message); 
        } else {
            mostrarNotificacion("¡Pedido logístico separado y añadido al almacén!");
            
            document.getElementById('contenedor-insumos-manuales').innerHTML = `
                <div class="insumo-row form-row" style="align-items: flex-end; margin-bottom: 10px; gap: 10px;">
                    <div class="form-group" style="flex: 0 0 70px; margin-bottom: 0;">
                        <label class="form-label" style="font-size: 0.75rem;">Cant.</label>
                        <input type="number" class="form-input manual-cant" min="1" required placeholder="#">
                    </div>
                    <div class="form-group" style="flex: 2; margin-bottom: 0;">
                        <label class="form-label" style="font-size: 0.75rem;">Nombre del Insumo</label>
                        <input type="text" class="form-input manual-nombre" required placeholder="Ej: Harina PAN">
                    </div>
                    <div class="form-group" style="flex: 2; margin-bottom: 0;">
                        <label class="form-label" style="font-size: 0.75rem;">Categoría</label>
                        <select class="form-select manual-cat" required>
                            <option value="medicina">💊 Medicina</option>
                            <option value="alimentos">🥫 Alimentos</option>
                            <option value="higiene">🧼 Limpieza</option>
                            <option value="general">🛠️ General</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 0 0 auto; margin-bottom: 0;">
                        <button type="button" class="btn btn-delete" style="padding: 0.6rem; height: 100%; font-weight: bold;" onclick="this.parentElement.parentElement.remove()" title="Eliminar fila">✖</button>
                    </div>
                </div>
            `;
            cargarTablaLogisticaFuerza();
        }
        btn.innerText = "CREAR PEDIDO EN EL SISTEMA"; btn.disabled = false;
    });

    // ==========================================
    // CARGAR TABLA LOGÍSTICA (AHORA CON FECHA)
    // ==========================================
    window.cargarTablaLogisticaFuerza = async function() {
        const cuerpo = document.getElementById('tablaLogisticaCuerpo');
        if(!cuerpo) return;

        let filtroCentro = document.getElementById('filtroCentroLogistica') ? document.getElementById('filtroCentroLogistica').value : 'Todos';
        let filtroCat = document.getElementById('filtroCategoriaLog') ? document.getElementById('filtroCategoriaLog').value : 'Todos';
        let filtroEst = document.getElementById('filtroEstadoLog') ? document.getElementById('filtroEstadoLog').value : 'Todos';
        let textoBusqueda = document.getElementById('buscarLogisticaInput') ? document.getElementById('buscarLogisticaInput').value.toLowerCase().trim() : '';

        if (perfilUsuarioActual && perfilUsuarioActual.rol === 'admin_centro') {
            filtroCentro = perfilUsuarioActual.centro_acopio;
            if(document.getElementById('filtroCentroLogistica')) document.getElementById('filtroCentroLogistica').disabled = true;
        }

        const thead = cuerpo.parentElement.querySelector('thead');
        if(thead) {
            thead.innerHTML = `
                <tr>
                    <th style="width: 40px; text-align: center;"><input type="checkbox" onclick="toggleSelectAllLogistica(this)" title="Seleccionar todos"></th>
                    <th>FECHA CREACIÓN</th>
                    <th>ESTADO</th>
                    <th>DESTINO</th>
                    <th>BENEFICIARIO</th>
                    <th>CATEGORÍA</th>
                    <th>REQUERIMIENTO</th>
                    <th>ENCARGADO</th>
                    <th>ACCIÓN LOGÍSTICA</th>
                </tr>
            `;
        }

        cuerpo.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; font-weight: bold; color: var(--primary);">⏳ Cargando inventario y pedidos...</td></tr>';

        const { data, error } = await supabaseClient
            .from('etiquetas_logistica')
            .select('id, created_at, solicitud_id, punto_usb, categoria_insumo, requerimiento, estado, encargado, fecha_despacho')
            .order('created_at', { ascending: false });

        if(error) { cuerpo.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 1rem; color: red;">Error: ${error.message}</td></tr>`; return; }
        if(!data || data.length === 0) { cuerpo.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">No hay tickets registrados en el almacén.</td></tr>'; return; }

        pedidosLogistica = data;

        let pedidosFiltrados = data.filter(p => {
            let c1 = (filtroCentro === 'Todos') || (p.punto_usb === filtroCentro);
            let c2 = (filtroCat === 'Todos') || (p.categoria_insumo === filtroCat);
            let c3 = (filtroEst === 'Todos') || (p.estado === filtroEst);
            
            let cTexto = true;
            if (textoBusqueda !== '') {
                let reqStr = String(p.requerimiento || '').toLowerCase();
                let encStr = String(p.encargado || '').toLowerCase();
                let idCortoStr = String(p.id || '').split('-')[0].toLowerCase();
                
                let persona = ayudaNube.find(a => a.id === p.solicitud_id);
                let nombreBen = persona ? String(persona.nombre).toLowerCase() : 'carga manual';
                let cedulaBen = persona ? String(persona.cedula).toLowerCase() : '';
                
                cTexto = reqStr.includes(textoBusqueda) || 
                         encStr.includes(textoBusqueda) || 
                         idCortoStr.includes(textoBusqueda) ||
                         nombreBen.includes(textoBusqueda) ||
                         cedulaBen.includes(textoBusqueda);
            }

            return c1 && c2 && c3 && cTexto;
        });

        if(document.getElementById('log-pendientes')) {
            document.getElementById('log-pendientes').innerText = pedidosFiltrados.filter(p => p.estado === 'Pendiente').length;
            document.getElementById('log-proceso').innerText = pedidosFiltrados.filter(p => p.estado === 'Empacando').length;
            document.getElementById('log-despachados').innerText = pedidosFiltrados.filter(p => p.estado === 'Despachado').length;
        }

        if(pedidosFiltrados.length === 0) {
            cuerpo.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">No hay tickets que coincidan con estos filtros.</td></tr>'; return;
        }

        cuerpo.innerHTML = pedidosFiltrados.map(p => {
            let badgeColor = p.estado === 'Pendiente' ? 'badge-danger' : (p.estado === 'Empacando' ? 'badge-warning' : 'badge-success');
            let icono = p.categoria_insumo === 'medicina' ? '💊' : (p.categoria_insumo === 'alimentos_limpieza' ? '🥫🧼' : '🛠️');
            
            let btnAccion = '';
            let checkboxHtml = `<input type="checkbox" class="cb-logistica" value="${p.id}" style="width:18px; height:18px;">`;
            
            let btnEditar = `<button class="btn" style="background-color:#0ea5e9; color:white; padding:0.4rem; font-size:0.8rem; flex:1; min-width: 50px;" onclick="editarRequerimientoLogistica('${p.id}')" title="Modificar Insumos">✏️ Editar</button>`;
            let btnDescartar = `<button class="btn" style="background-color:#dc2626; color:white; padding:0.4rem; font-size:0.8rem; flex:1; min-width: 50px;" onclick="eliminarTicketLogistica('${p.id}')" title="Descartar Pedido">🗑️ Descartar</button>`;
            
            if (perfilUsuarioActual && (perfilUsuarioActual.rol === 'auditor' || perfilUsuarioActual.rol === 'admin_busqueda')) {
                btnAccion = `<span class="badge" style="background:#e2e8f0; color:#475569; padding:4px 8px;">👁️ Solo Vista</span>`;
            } else {
                if (p.estado === 'Pendiente') {
                    btnAccion = `
                    <button class="btn" style="background-color:#3b82f6; color:white; padding:0.5rem; font-size:0.8rem; width:100%; margin-bottom:5px;" onclick="tomarPedidoLogistica('${p.id}')">✋ Tomar Pedido</button>
                    <div style="display:flex; gap:5px; width:100%; flex-wrap:wrap;">${btnEditar}${btnDescartar}</div>`;
                } else if (p.estado === 'Empacando') {
                    btnAccion = `
                    <button class="btn" style="background-color:#f59e0b; color:white; padding:0.5rem; font-size:0.8rem; width:100%; margin-bottom:5px;" onclick="finalizarDespacho('${p.id}')">📦 Finalizar y Despachar</button>
                    <div style="display:flex; gap:5px; width:100%; flex-wrap:wrap;">${btnEditar}${btnDescartar}</div>`;
                } else {
                    btnAccion = `<div style="display:flex; gap:5px; width:100%; flex-wrap:wrap;">
                        <span class="badge" style="background-color:#e2e8f0; color:#64748b; padding:0.4rem; flex:1; min-width: 50px; text-align:center; display:flex; align-items:center; justify-content:center; font-size:0.75rem;">✅ Listo</span>
                        <button class="btn" style="background-color:#0284c7; color:white; padding:0.4rem; font-size:0.8rem; flex:1; min-width: 50px;" onclick="imprimirTicketEmpaqueId('${p.id}')" title="Imprimir Etiqueta">🖨️ Ticket</button>
                        <button class="btn" style="background-color:#10b981; color:white; padding:0.4rem; font-size:0.8rem; flex:1; min-width: 50px;" onclick="generarNotaEntrega('${p.id}')" title="Generar Acta Individual">📄 Acta</button>
                    </div>`;
                }
            }

            let persona = ayudaNube.find(a => a.id === p.solicitud_id);
            let nombreBen = persona ? persona.nombre : 'Carga Manual';
            let cedulaBen = persona && persona.cedula !== '-' ? `C.I: ${persona.cedula}` : '';
            let htmlBeneficiario = `<div style="font-weight:bold; color:var(--primary);">${nombreBen}</div><div style="font-size:0.8rem; color:#64748b;">${cedulaBen}</div>`;

            let reqTexto = p.requerimiento || '-';
            if(reqTexto.length > 80) reqTexto = reqTexto.substring(0, 80) + '...';

            // Formatear la fecha
            let fechaCreaObj = new Date(p.created_at);
            let fechaStr = isNaN(fechaCreaObj) ? '-' : fechaCreaObj.toLocaleDateString('es-VE', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });

            return `
                <tr>
                    <td data-label="Sel." style="text-align: center;">${checkboxHtml}</td>
                    <td data-label="Fecha Creación"><span style="font-size:0.85rem; color:#475569; font-weight:600;">${fechaStr}</span></td>
                    <td data-label="Estado"><span class="badge ${badgeColor}">${p.estado || 'Pendiente'}</span></td>
                    <td data-label="Destino"><strong>${p.punto_usb || 'Sin Asignar'}</strong></td>
                    <td data-label="Beneficiario">${htmlBeneficiario}</td>
                    <td data-label="Categoría" style="text-transform: capitalize;">${icono} ${p.categoria_insumo || '-'}</td>
                    <td data-label="Requerimiento"><div class="text-truncate-clamp">${reqTexto}</div></td>
                    <td data-label="Encargado" style="color: #3b82f6; font-weight: bold;">${p.encargado || 'Sin Asignar'}</td>
                    <td data-label="Acción" class="actions-cell">${btnAccion}</td>
                </tr>
            `;
        }).join('');
    };

    // ==========================================
    // ACTA DE ENTREGA INDIVIDUAL (CON FECHA PEDIDO)
    // ==========================================
    window.generarNotaEntrega = function(idRegistro) {
        const pedido = pedidosLogistica.find(p => p.id === idRegistro);
        if(!pedido) return;
        const ventanita = window.open('', '_blank');
        if(!ventanita) return;

        const fechaEmision = new Date().toLocaleString('es-VE');
        let fechaPedidoObj = new Date(pedido.created_at);
        const fechaPedido = isNaN(fechaPedidoObj) ? 'N/A' : fechaPedidoObj.toLocaleString('es-VE');
        const idCorto = pedido.id.split('-')[0].toUpperCase();

        let personaVinculada = "Carga Manual / Reposición de Inventario";
        if(pedido.solicitud_id) {
            const reg = ayudaNube.find(a => a.id === pedido.solicitud_id);
            if(reg) personaVinculada = `${reg.nombre} (C.I: ${reg.cedula})`;
        }

        ventanita.document.write(`
            <html>
            <head>
                <title>Acta - #${idCorto}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; padding: 20px; color: #000; max-width: 800px; margin: 0 auto; line-height: 1.3; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
                    .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; color: #111; }
                    .header h3 { margin: 5px 0 0 0; color: #555; font-size: 13px; }
                    .order-info { text-align: right; }
                    .order-info h2 { margin: 0; font-size: 18px; }
                    .info-box { border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; border-radius: 6px; background-color: #f9f9f9; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; }
                    .req-box { border: 1px solid #000; padding: 15px; margin-bottom: 20px; min-height: 80px; font-size: 14px; }
                    .signatures { display: flex; justify-content: space-between; margin-top: 30px; gap: 20px; }
                    .sig-line { flex: 1; border-top: 1px solid #000; padding-top: 5px; text-align: center; font-size: 12px; }
                    .logo { height: 60px; margin-right: 15px; }
                    @media print { @page { margin: 0.5cm; } body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div style="display:flex; align-items:center;">
                        <img src="Logo-AEUSB-fondo-blanco.png" class="logo" onerror="this.style.display='none'">
                        <div>
                            <h1>ACTA DE ENTREGA DE DONATIVO</h1>
                            <h3>Asociación de Egresados de la Universidad Simón Bolívar</h3>
                        </div>
                    </div>
                    <div class="order-info">
                        <h2>Folio: #${idCorto}</h2>
                        <p style="margin:5px 0 0 0; font-size:12px;">Emisión: ${fechaEmision}</p>
                    </div>
                </div>

                <div class="info-box">
                    <div class="info-grid">
                        <div><strong>SEDE DE ORIGEN:</strong><br> Almacén CVA - Las Mercedes</div>
                        <div><strong>SEDE DESTINO:</strong><br> ${pedido.punto_usb || 'N/A'}</div>
                        <div><strong>FECHA DEL PEDIDO:</strong><br> ${fechaPedido}</div>
                        <div><strong>PREPARADOR:</strong><br> ${pedido.encargado || 'N/A'}</div>
                        <div style="grid-column: 1 / -1; padding: 10px; border: 1px dashed #000; margin-top: 5px;">
                            <strong>BENEFICIARIO:</strong> ${personaVinculada}<br><br>
                            <strong>Firma Beneficiario:</strong> ________________________
                        </div>
                        <div style="grid-column: 1 / -1; margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd;">
                            <strong>CATEGORÍA DE LOS INSUMOS:</strong> ${String(pedido.categoria_insumo).toUpperCase()}
                        </div>
                    </div>
                </div>

                <h3 style="margin-bottom: 8px; font-size: 14px;">DETALLE DE INSUMOS A ENTREGAR:</h3>
                <div class="req-box">
                    <div style="white-space: pre-wrap;">${pedido.requerimiento}</div>
                </div>

                <div class="signatures">
                    <div class="sig-line"><strong>ENTREGADO POR (ALMACÉN)</strong><br><br><br>Firma</div>
                    <div class="sig-line"><strong>CHOFER / TRANSPORTE</strong><br><br><br>Firma</div>
                    <div class="sig-line"><strong>RECIBIDO CONFORME (CENTRO ACOPIO)</strong><br><br><br>Firma</div>
                </div>
                <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); } }</script>
            </body>
            </html>
        `);
        ventanita.document.close();
    };

    // ==========================================
    // ACTA DE ENTREGA MASIVA (CON FECHA PEDIDO)
    // ==========================================
    window.generarNotaEntregaMasiva = function() {
        const seleccionados = Array.from(document.querySelectorAll('.cb-logistica:checked')).map(cb => cb.value);
        if (seleccionados.length === 0) { alert("Selecciona tickets primero."); return; }

        const pedidosSeleccionados = pedidosLogistica.filter(p => seleccionados.includes(p.id));
        const ventanita = window.open('', '_blank');
        if(!ventanita) return;

        const fechaEmision = new Date().toLocaleString('es-VE');
        
        let filasInsumos = '';
        pedidosSeleccionados.forEach(pedido => {
            let personaVinculada = "Carga Manual";
            if(pedido.solicitud_id) {
                const reg = ayudaNube.find(a => a.id === pedido.solicitud_id);
                if(reg) personaVinculada = `<strong>${reg.nombre}</strong><br><span style="font-size:11px; color:#555;">C.I: ${reg.cedula}</span>`;
            }
            const idCorto = pedido.id.split('-')[0].toUpperCase();
            
            // Extraer y formatear la fecha para la tabla masiva
            let fechaPedObj = new Date(pedido.created_at);
            let fechaPedStr = isNaN(fechaPedObj) ? '-' : fechaPedObj.toLocaleDateString('es-VE', {day: '2-digit', month: 'short'});
            
            filasInsumos += `
                <tr style="border-bottom: 1px solid #ccc;">
                    <td style="padding: 10px; font-size:12px;">#${idCorto}</td>
                    <td style="padding: 10px; font-size:12px;">${fechaPedStr}</td>
                    <td style="padding: 10px; font-size:12px;">${personaVinculada}</td>
                    <td style="padding: 10px; font-size:12px;">${String(pedido.categoria_insumo).toUpperCase()}</td>
                    <td style="padding: 10px; font-size:12px;">${pedido.requerimiento}</td>
                    <td style="padding: 10px; font-size:12px;">___________________</td>
                </tr>
            `;
        });

        ventanita.document.write(`
            <html>
            <head>
                <title>Acta de Entrega Masiva</title>
                <style>
                    body { font-family: 'Arial', sans-serif; padding: 30px; color: #000; max-width: 950px; margin: 0 auto; line-height: 1.4; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
                    .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; color: #111; }
                    .header h3 { margin: 5px 0 0 0; color: #555; font-size: 13px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { background-color: #f0f0f0; padding: 10px; border-bottom: 2px solid #000; text-align: left; font-size:13px; }
                    .signatures { display: flex; justify-content: space-between; margin-top: 40px; gap: 30px; }
                    .sig-line { flex: 1; border-top: 1px solid #000; padding-top: 10px; text-align: center; font-size: 12px; }
                    .logo { height: 60px; margin-right: 15px; }
                    @media print { @page { margin: 0; } body { margin: 1cm; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div style="display:flex; align-items:center;">
                        <img src="Logo-AEUSB-fondo-blanco.png" class="logo" onerror="this.style.display='none'">
                        <div>
                            <h1>ACTA DE ENTREGA DE DONATIVOS (MASIVA)</h1>
                            <h3>Asociación de Egresados de la Universidad Simón Bolívar</h3>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin:0; font-size:13px; font-weight:bold;">Fecha de Emisión:</p>
                        <p style="margin:5px 0 0 0; font-size:13px;">${fechaEmision}</p>
                    </div>
                </div>

                <div style="margin-bottom: 15px; background-color: #f9f9f9; padding: 10px; border: 1px solid #ccc; border-radius: 6px;">
                    <p style="margin: 0; font-size: 15px;"><strong>Total de Tickets a Despachar:</strong> <span style="font-size: 16px; color: #d32f2f;">${pedidosSeleccionados.length}</span></p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>CÓDIGO</th>
                            <th>FECHA PEDIDO</th>
                            <th>BENEFICIARIO</th>
                            <th>CATEGORÍA</th>
                            <th>DETALLE DEL INSUMO</th>
                            <th>FIRMA BENEFICIARIO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filasInsumos}
                    </tbody>
                </table>

                <div class="signatures">
                    <div class="sig-line"><strong>ENTREGADO POR (ALMACÉN)</strong><br><br><br>Firma</div>
                    <div class="sig-line"><strong>CHOFER / TRANSPORTE</strong><br><br><br>Firma</div>
                    <div class="sig-line"><strong>RECIBIDO CONFORME (CENTRO ACOPIO)</strong><br><br><br>Firma</div>
                </div>
                <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); } }</script>
            </body>
            </html>
        `);
        ventanita.document.close();
    };

    document.addEventListener('DOMContentLoaded', () => {
        const filtroLog = document.getElementById('filtroCentroLogistica');
        if (filtroLog) filtroLog.addEventListener('change', cargarTablaLogisticaFuerza);
    });

    window.imprimirTicketEmpaqueId = function(id) {
        const pedido = pedidosLogistica.find(p => p.id === id);
        if (pedido) imprimirTicketEmpaque(pedido);
    };

    // ====================================================
    // DESPACHO ASISTIDO: CONEXIÓN LOGÍSTICA -> INVENTARIO
    // ====================================================
    window.finalizarDespacho = function(idRegistro) {
        const pedido = pedidosLogistica.find(p => p.id === idRegistro);
        if(!pedido) return;

        // 1. Mostrar lo que pidió el afectado
        document.getElementById('despacho-ticket-id').value = idRegistro;
        document.getElementById('despacho-texto-pedido').innerText = pedido.requerimiento || 'Sin requerimiento especificado';
        
        // 2. Llenar el desplegable con el inventario actual (CVA)
        const selectItem = document.getElementById('despacho-item-select');
        selectItem.innerHTML = '<option value="">-- No descontar nada (Solo cerrar el pedido) --</option>';
        
        // Ordenamos alfabéticamente para que sea fácil de buscar
        let inventarioOrdenado = [...inventarioNube].sort((a, b) => String(a.item).localeCompare(String(b.item)));

        inventarioOrdenado.forEach(inv => {
            // Solo mostrar insumos que tengan más de 0 cantidades
            if (parseInt(inv.cantidad) > 0) {
                const opt = document.createElement('option');
                opt.value = inv.id;
                opt.dataset.max = inv.cantidad; // Guardamos el límite para validación
                opt.innerText = `[Quedan ${inv.cantidad}] - ${inv.item} (${inv.categoria}) | Caja ${inv.ubicacion_caja || 'N/A'}`;
                selectItem.appendChild(opt);
            }
        });

        document.getElementById('despacho-cantidad').value = 1;
        document.getElementById('modal-despacho-asistido').style.display = 'flex';
    };

    document.addEventListener('DOMContentLoaded', () => {
        const formDespacho = document.getElementById('form-despacho-asistido');
        if (formDespacho) {
            formDespacho.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const btn = document.getElementById('btn-procesar-despacho');
                btn.innerText = "Procesando Base de Datos..."; btn.disabled = true;

                const ticketId = document.getElementById('despacho-ticket-id').value;
                const itemId = document.getElementById('despacho-item-select').value;
                const cantidadDescontar = parseInt(document.getElementById('despacho-cantidad').value) || 0;
                const fechaActualISO = new Date().toISOString();

                try {
                    if (itemId && cantidadDescontar > 0) {
                        const selectElement = document.getElementById('despacho-item-select');
                        const opcionElegida = selectElement.options[selectElement.selectedIndex];
                        const stockActual = parseInt(opcionElegida.dataset.max);

                        if (cantidadDescontar > stockActual) {
                            alert(`⚠️ ERROR MATEMÁTICO:\nEstás intentando sacar ${cantidadDescontar} unidades, pero solo quedan ${stockActual} en el inventario físico.`);
                            btn.innerText = "Descontar y Despachar"; btn.disabled = false;
                            return;
                        }

                        const nuevoStock = stockActual - cantidadDescontar;

                        const { error: errInv } = await supabaseClient
                            .from('inventario_general')
                            .update({ cantidad: nuevoStock })
                            .eq('id', itemId);

                        if (errInv) throw new Error("Fallo al restar del inventario: " + errInv.message);
                    }

                    const { error: errTicket } = await supabaseClient
                        .from('etiquetas_logistica')
                        .update({ estado: 'Despachado', fecha_despacho: fechaActualISO })
                        .eq('id', ticketId);

                    if (errTicket) throw new Error("Fallo al cerrar el ticket logístico: " + errTicket.message);

                    mostrarNotificacion("✅ Pedido cerrado y descontado exitosamente del inventario.");
                    document.getElementById('modal-despacho-asistido').style.display = 'none';

                    await cargarTablaLogisticaFuerza();
                    if(typeof cargarInventarioNube === 'function') await cargarInventarioNube();

                    const pedido = pedidosLogistica.find(p => p.id === ticketId);
                    setTimeout(() => {
                        if(confirm("📦 ¡Operación Exitosa!\n\n¿Deseas imprimir la ETIQUETA PEQUEÑA para pegarla en la caja de entrega ahora mismo?")) {
                            imprimirTicketEmpaque(pedido);
                        }
                    }, 400);

                } catch (err) {
                    alert(err.message);
                } finally {
                    btn.innerText = "Descontar y Despachar"; btn.disabled = false;
                }
            });
        }
    });

    window.toggleSelectAllLogistica = function(source) {
        const checkboxes = document.querySelectorAll('.cb-logistica');
        checkboxes.forEach(cb => cb.checked = source.checked);
    };

    window.imprimirTicketEmpaque = function(pedido) {
        const ventanita = window.open('', '_blank');
        if(!ventanita) { alert("⚠️ Permite las ventanas emergentes para imprimir."); return; }

        const fecha = new Date().toLocaleString('es-VE');
        const idCorto = pedido.id.split('-')[0].toUpperCase();

        let personaVinculada = "Carga Manual / Reposición";
        if(pedido.solicitud_id) {
            const reg = ayudaNube.find(a => a.id === pedido.solicitud_id);
            if(reg) personaVinculada = `${reg.nombre} (C.I: ${reg.cedula || 'N/A'})`;
        }

        ventanita.document.write(`
            <html>
            <head>
                <title>Etiqueta Caja - ${pedido.punto_usb}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; padding: 20px; color: #000; }
                    .ticket { border: 2px dashed #000; padding: 20px; max-width: 500px; margin: 0 auto; page-break-inside: avoid; }
                    h1 { text-align: center; text-transform: uppercase; margin-bottom: 5px; font-size: 24px; }
                    .info-header { margin-bottom: 15px; font-size: 16px; line-height: 1.5; }
                    @media print { @page { margin: 0; } body { margin: 1cm; } }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <h1>ETIQUETA DE DESPACHO</h1>
                    <hr style="border: 1px solid #000; margin-bottom: 15px;">
                    <div class="info-header">
                        <strong>DESTINO:</strong> <span style="font-size: 20px; text-transform: uppercase;">${pedido.punto_usb || '-'}</span><br>
                        <strong>BENEFICIARIO:</strong> ${personaVinculada}<br>
                        <strong>CATEGORÍA:</strong> ${String(pedido.categoria_insumo).toUpperCase()}<br>
                        <strong>CÓDIGO:</strong> #${idCorto}
                    </div>
                    <p style="font-size: 16px; border: 1px solid #000; padding: 10px;">${pedido.requerimiento}</p>
                </div>
                <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); } }</script>
            </body>
            </html>
        `);
        ventanita.document.close();
    };

    window.imprimirTicketsIndividualesMasivos = function() {
        const seleccionados = Array.from(document.querySelectorAll('.cb-logistica:checked')).map(cb => cb.value);
        if (seleccionados.length === 0) { alert("Selecciona tickets primero."); return; }

        const pedidosSeleccionados = pedidosLogistica.filter(p => seleccionados.includes(p.id));
        const ventanita = window.open('', '_blank');
        if(!ventanita) { alert("⚠️ Permite las ventanas emergentes."); return; }

        let ticketsHtml = '';
        pedidosSeleccionados.forEach(pedido => {
            const idCorto = pedido.id.split('-')[0].toUpperCase();
            let personaVinculada = "Carga Manual";
            if(pedido.solicitud_id) {
                const reg = ayudaNube.find(a => a.id === pedido.solicitud_id);
                if(reg) personaVinculada = `${reg.nombre} (C.I: ${reg.cedula || 'N/A'})`;
            }

            ticketsHtml += `
                <div class="ticket">
                    <h1>ETIQUETA DESPACHO</h1>
                    <hr style="border: 1px solid #000; margin-bottom: 10px;">
                    <div class="info-header">
                        <strong>DESTINO:</strong> <span style="font-size: 16px;">${pedido.punto_usb || '-'}</span><br>
                        <strong>A NOMBRE DE:</strong> ${personaVinculada}<br>
                        <strong>CAT:</strong> ${String(pedido.categoria_insumo).toUpperCase()}<br>
                        <strong>CÓDIGO:</strong> #${idCorto}
                    </div>
                    <p style="font-size: 13px; border: 1px solid #000; padding: 8px;">${pedido.requerimiento}</p>
                </div>
            `;
        });

        ventanita.document.write(`
            <html>
            <head>
                <title>Tickets Individuales (Grilla)</title>
                <style>
                    body { font-family: 'Arial', sans-serif; padding: 10px; color: #000; }
                    .grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    .ticket { border: 2px dashed #000; padding: 15px; page-break-inside: avoid; }
                    h1 { text-align: center; margin: 0 0 5px 0; font-size: 18px; }
                    .info-header { margin-bottom: 10px; font-size: 14px; line-height: 1.4; }
                    @media print { @page { margin: 1cm; } body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="grid-container">
                    ${ticketsHtml}
                </div>
                <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); } }</script>
            </body>
            </html>
        `);
        ventanita.document.close();
    };

    window.imprimirTicketEmpaqueMasivo = function() {
        const seleccionados = Array.from(document.querySelectorAll('.cb-logistica:checked')).map(cb => cb.value);
        if (seleccionados.length === 0) {
            alert("Debes seleccionar al menos un ticket marcando las casillas de la izquierda.");
            return;
        }

        const pedidosSeleccionados = pedidosLogistica.filter(p => seleccionados.includes(p.id));
        
        const destinos = [...new Set(pedidosSeleccionados.map(p => p.punto_usb))];
        const destinoFinal = destinos.length === 1 ? destinos[0] : "⚠️ ATENCIÓN: MÚLTIPLES DESTINOS";
        
        const ventanita = window.open('', '_blank');
        if(!ventanita) { alert("⚠️ Permite las ventanas emergentes para imprimir."); return; }

        const fecha = new Date().toLocaleString('es-VE');
        const idsCortos = pedidosSeleccionados.map(p => "#" + p.id.split('-')[0].toUpperCase()).join(", ");
        
        let requerimientosHtml = "";
        pedidosSeleccionados.forEach(p => {
            requerimientosHtml += `
                <li style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #ccc;">
                    <strong>[${String(p.categoria_insumo).toUpperCase()}]</strong> ${p.requerimiento}
                </li>`;
        });

        ventanita.document.write(`
            <html>
            <head>
                <title>Etiqueta Caja Múltiple</title>
                <style>
                    body { font-family: 'Arial', sans-serif; padding: 15px; color: #000; }
                    .ticket { border: 2px dashed #000; padding: 15px; max-width: 550px; margin: 0 auto; }
                    h1 { text-align: center; text-transform: uppercase; margin-bottom: 5px; font-size: 22px; }
                    .info-header { margin-bottom: 15px; font-size: 16px; line-height: 1.5; }
                    ul { margin: 0; padding-left: 20px; font-size: 14px; list-style-type: square; }
                    @media print { @page { margin: 0; } body { margin: 0.5cm; } }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <h1>ETIQUETA DE DESPACHO GRUPAL</h1>
                    <hr style="border: 1px solid #000; margin-bottom: 10px;">
                    <div class="info-header">
                        <strong>DESTINO:</strong> <span style="font-size: 20px; text-transform: uppercase;">${destinoFinal}</span><br>
                        <strong>TICKETS INCLUIDOS:</strong> ${idsCortos}<br>
                        <span style="font-size: 12px; color: #555;">Agrupado el: ${fecha}</span>
                    </div>
                    <div style="border: 1px solid #000; padding: 10px; background-color: #fafafa;">
                        <strong style="font-size: 16px;">CONTENIDO DE LA CAJA:</strong>
                        <ul style="margin-top: 10px;">
                            ${requerimientosHtml}
                        </ul>
                    </div>
                </div>
                <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); } }</script>
            </body>
            </html>
        `);
        ventanita.document.close();
    };

    window.tomarPedidoLogistica = async function(id) {
        const nombreGuardia = document.getElementById('nombreGuardiaLogistica').value.trim();
        if(!nombreGuardia) {
            alert("⚠️ Por favor, ingresa tu nombre de guardia en la barra superior antes de tomar un pedido.");
            document.getElementById('nombreGuardiaLogistica').focus();
            return;
        }

        const { error } = await supabaseClient.from('etiquetas_logistica')
            .update({ estado: 'Empacando', encargado: nombreGuardia })
            .eq('id', id);

        if(error) {
            alert("Error: " + error.message);
        } else {
            mostrarNotificacion(`Pedido asignado a ${nombreGuardia}`);
            cargarTablaLogisticaFuerza();
        }
    };

    window.procesarExcelMaestro = async function(file, dropZoneId, inputId) {
        
        let nombreRaw = String(file.name).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        let sedeArchivo = 'Sin Asignar';
        
        if (nombreRaw.includes('catia')) sedeArchivo = 'Catia la Mar Centro';
        else if (nombreRaw.includes('tunita') || nombreRaw.includes('mamo')) sedeArchivo = 'Las Tunitas - Mamo';
        else if (nombreRaw.includes('caraballeda')) sedeArchivo = 'Caraballeda';
        else if (nombreRaw.includes('naiguata')) sedeArchivo = 'Naiguatá';
        else if (nombreRaw.includes('camuri')) sedeArchivo = 'Camurí Grande';
        else if (nombreRaw.includes('maiquetia')) sedeArchivo = 'Maiquetía';
        else if (nombreRaw.includes('macuto') || nombreRaw.includes('guaira')) sedeArchivo = 'La Guaira - Macuto';
        else if (nombreRaw.includes('cva') || nombreRaw.includes('mercedes') || nombreRaw.includes('caracas')) sedeArchivo = 'CVA Las Mercedes (Caracas)';
        else sedeArchivo = 'Maiquetía'; 

        const lector = new FileReader();
        lector.onload = async function(evt) {
            const dropZone = document.getElementById(dropZoneId);
            const pElement = dropZone.querySelector('p');
            const textoOriginal = pElement.innerHTML;
            
            try {
                if (!ayudaNube || ayudaNube.length === 0 || !pedidosLogistica) {
                    await cargarDatosDesdeNube();
                }

                pElement.innerHTML = "<strong>⏳ Analizando archivo y verificando registros...</strong>";

                const data = new Uint8Array(evt.target.result);
                const libro = XLSX.read(data, { type: 'array' });

                let ticketsNuevos = 0; let ticketsOmitidos = 0; let ticketsActualizados = 0;
                let personasNuevas = 0; let personasOmitidas = 0; let personasActualizadas = 0;

                let cedulasEnEsteExcel = new Set();
                let nombresEnEsteExcel = new Set();
                let ticketsEnEsteExcel = new Set();
                let nombresAyudaOmitidos = [];

                for (let nombreHoja of libro.SheetNames) {
                    const hoja = libro.Sheets[nombreHoja];
                    const rawData = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: "" });

                    let cabecera = [];
                    while (rawData.length > 0) {
                        let tempCabecera = rawData[0].map(c => String(c).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
                        if (tempCabecera.some(c => c.includes('nombre') || c.includes('requerimiento') || c.includes('afectado') || c.includes('id ticket') || c.includes('id solicitud'))) {
                            cabecera = tempCabecera;
                            break;
                        }
                        rawData.shift();
                    }

                    if(cabecera.length === 0) continue; 
                    rawData.shift(); 

                    let esExcelLogisticaExportado = cabecera.some(c => c.includes('id ticket'));
                    let esExcelAyudaExportado = cabecera.some(c => c.includes('id solicitud'));
                    let esPlantillaCenso = cabecera.some(c => c.includes('damnificado')) && !esExcelAyudaExportado;
                    let esPlantillaPedidos = cabecera.some(c => c.includes('fecha')) && (cabecera.some(c => c.includes('medicina')) || cabecera.some(c => c.includes('alimento'))) && !esPlantillaCenso && !esExcelAyudaExportado;

                    if (esExcelAyudaExportado) {
                        let iPun = cabecera.findIndex(c => c.includes('punto acopio'));
                        let iNom = cabecera.findIndex(c => c.includes('afectado'));
                        let iCed = cabecera.findIndex(c => c.includes('cédula') || c.includes('cedula'));
                        let iTel = cabecera.findIndex(c => c.includes('teléfono') || c.includes('telefono'));
                        let iCor = cabecera.findIndex(c => c.includes('correo'));
                        let iCom = cabecera.findIndex(c => c.includes('comunidad'));
                        let iGrp = cabecera.findIndex(c => c.includes('relación usb') || c.includes('grupo'));
                        let iEst = cabecera.findIndex(c => c.includes('estado vital'));
                        let iUbi = cabecera.findIndex(c => c.includes('ubicación') || c.includes('ubicacion'));
                        let iDam = cabecera.findIndex(c => c.includes('es damnificado') || c.includes('damnificado'));
                        let iMed = cabecera.findIndex(c => c.includes('atención médica'));
                        let iPer = cabecera.findIndex(c => c.includes('total personas'));
                        let iNin = cabecera.findIndex(c => c.includes('niños'));
                        let iAdu = cabecera.findIndex(c => c.includes('adultos mayores'));
                        let iReqM = cabecera.findIndex(c => c.includes('req. medicina'));
                        let iReqA = cabecera.findIndex(c => c.includes('req. alimentos'));
                        let iReqO = cabecera.findIndex(c => c.includes('otras solicitudes'));
                        let iObs = cabecera.findIndex(c => c.includes('observaciones'));

                        for (let row of rawData) {
                            let nomVal = iNom !== -1 ? String(row[iNom] || '').trim() : '';
                            if (!nomVal) continue;
                            let cedVal = iCed !== -1 ? String(row[iCed] || '-').trim() : '-';
                            let excelPuntoUsb = iPun !== -1 && row[iPun] ? String(row[iPun]).trim() : 'Sin Asignar';
                            
                            let personaExistente = ayudaNube.find(p => {
                                if (cedVal !== '-' && cedVal !== '') return String(p.cedula).trim() === cedVal;
                                else {
                                    let mismoNombre = String(p.nombre).trim().toLowerCase() === nomVal.toLowerCase();
                                    let mismoPunto = true;
                                    if (p.punto_usb && p.punto_usb !== 'Sin Asignar' && excelPuntoUsb !== 'Sin Asignar') {
                                        mismoPunto = (p.punto_usb === excelPuntoUsb);
                                    }
                                    return mismoNombre && mismoPunto;
                                }
                            });

                            let repetidoIntra = false;
                            if (cedVal !== '-' && cedVal !== '') {
                                if (cedulasEnEsteExcel.has(cedVal)) repetidoIntra = true;
                            } else {
                                let claveRepetido = nomVal.toLowerCase() + "|" + excelPuntoUsb;
                                if (nombresEnEsteExcel.has(claveRepetido)) repetidoIntra = true;
                            }

                            if (personaExistente || repetidoIntra) {
                                if (personaExistente) {
                                    let updateData = {};
                                    let hayCambios = false;
                                    
                                    let excelPuntoUsb = iPun !== -1 && row[iPun] ? String(row[iPun]).trim() : 'Sin Asignar';

                                    if (excelPuntoUsb !== 'Sin Asignar' && (!personaExistente.punto_usb || personaExistente.punto_usb === 'Sin Asignar')) {
                                        updateData.punto_usb = excelPuntoUsb;
                                        hayCambios = true;
                                    }
                                    
                                    if (cedVal !== '-' && cedVal !== '' && (!personaExistente.cedula || personaExistente.cedula === '-')) {
                                        updateData.cedula = cedVal;
                                        hayCambios = true;
                                    }

                                    if (hayCambios) {
                                        const { error } = await supabaseClient.from('solicitudes_ayuda').update(updateData).eq('id', personaExistente.id);
                                        if (!error) personasActualizadas++;
                                    } else {
                                        personasOmitidas++;
                                        nombresAyudaOmitidos.push(nomVal);
                                    }
                                } else {
                                    personasOmitidas++;
                                    nombresAyudaOmitidos.push(nomVal);
                                }

                                if (cedVal !== '-' && cedVal !== '') cedulasEnEsteExcel.add(cedVal);
                                nombresEnEsteExcel.add(nomVal.toLowerCase() + "|" + excelPuntoUsb);
                                continue; 
                            }

                            if (cedVal !== '-' && cedVal !== '') cedulasEnEsteExcel.add(cedVal);
                            nombresEnEsteExcel.add(nomVal.toLowerCase());

                            let payloadPersona = {
                                nombre: nomVal,
                                cedula: cedVal,
                                punto_usb: iPun !== -1 && row[iPun] ? String(row[iPun]).trim() : 'Sin Asignar',
                                telefono: iTel !== -1 && row[iTel] ? String(row[iTel]).trim() : '-',
                                correo: iCor !== -1 && row[iCor] ? String(row[iCor]).trim() : '',
                                comunidad: iCom !== -1 && row[iCom] ? String(row[iCom]).trim() : 'Universidad Simón Bolívar',
                                grupo: iGrp !== -1 && row[iGrp] ? String(row[iGrp]).trim() : 'Estudiante',
                                estado: iEst !== -1 && row[iEst] ? String(row[iEst]).trim() : 'Con vida',
                                ubicacion: iUbi !== -1 && row[iUbi] ? String(row[iUbi]).trim() : '-',
                                es_damnificado: iDam !== -1 ? (String(row[iDam]).toUpperCase().includes('SÍ') || String(row[iDam]).toUpperCase().includes('SI')) : false,
                                requiere_atencion_medica: iMed !== -1 ? String(row[iMed]).trim() : '',
                                personas_hogar: iPer !== -1 && row[iPer] ? (parseInt(row[iPer]) || 1) : 1,
                                ninos_hogar: iNin !== -1 && row[iNin] ? (parseInt(row[iNin]) || 0) : 0,
                                adultos_mayores_hogar: iAdu !== -1 && row[iAdu] ? (parseInt(row[iAdu]) || 0) : 0,
                                req_medicina: iReqM !== -1 && row[iReqM] ? String(row[iReqM]).trim() : '',
                                req_alimentos: iReqA !== -1 && row[iReqA] ? String(row[iReqA]).trim() : '',
                                req_general: iReqO !== -1 && row[iReqO] ? String(row[iReqO]).trim() : '',
                                descripcion_ayuda: iObs !== -1 && row[iObs] ? String(row[iObs]).trim() : '',
                                estado_despacho: 'Sin Pedido'
                            };

                            const { data, error } = await supabaseClient.from('solicitudes_ayuda').insert([payloadPersona]).select();
                            if (error) throw new Error("Ayuda Insert - " + error.message);
                            if (data && data.length > 0) ayudaNube.push(data[0]); 
                            personasNuevas++;
                        }
                    }

                    else if (esPlantillaCenso) {
                        let iNom = cabecera.findIndex(c => c.includes('nombre') || c.includes('afectado'));
                        let iCed = cabecera.findIndex(c => c.includes('cedula') || c.includes('cédula'));
                        let iDam = cabecera.findIndex(c => c.includes('damnificado'));
                        let iTel = cabecera.findIndex(c => c.includes('whatsapp') || c.includes('telefono'));
                        let iUbi = cabecera.findIndex(c => c.includes('direccion') || c.includes('ubicacion'));
                        let iGrp = cabecera.findIndex(c => c.includes('comunidad') || c.includes('grupo') || c.includes('vinculo'));
                        let iCor = cabecera.findIndex(c => c.includes('correo'));
                        let iCar = cabecera.findIndex(c => c.includes('carnet'));
                        let iPer = cabecera.findIndex(c => c.includes('personas'));
                        let iNin = cabecera.findIndex(c => c.includes('niños') || c.includes('ninos'));
                        let iAdu = cabecera.findIndex(c => c.includes('adultos'));
                        let iObs = cabecera.findIndex(c => c.includes('observaciones'));
                        let iMed = cabecera.findIndex(c => c.includes('medicina'));
                        let iAli = cabecera.findIndex(c => c.includes('alimento') || c.includes('agua'));

                        for (let row of rawData) {
                            let nomVal = iNom !== -1 ? String(row[iNom] || '').trim() : '';
                            if (!nomVal) continue;
                            let cedVal = iCed !== -1 ? String(row[iCed] || '-').trim() : '-';

                            let personaExistente = ayudaNube.find(p => {
                                if (cedVal !== '-' && cedVal !== '') return String(p.cedula).trim() === cedVal;
                                else {
                                    let mismoNombre = String(p.nombre).trim().toLowerCase() === nomVal.toLowerCase();
                                    let mismoPunto = true;
                                    if (p.punto_usb && p.punto_usb !== 'Sin Asignar' && sedeArchivo !== 'Sin Asignar') {
                                        mismoPunto = (p.punto_usb === sedeArchivo);
                                    }
                                    return mismoNombre && mismoPunto;
                                }
                            });

                            let repetidoIntra = false;
                            if (cedVal !== '-' && cedVal !== '') {
                                if (cedulasEnEsteExcel.has(cedVal)) repetidoIntra = true;
                            } else {
                                let claveRepetido = nomVal.toLowerCase() + "|" + sedeArchivo;
                                if (nombresEnEsteExcel.has(claveRepetido)) repetidoIntra = true;
                            }

                            if (personaExistente || repetidoIntra) {
                                if (personaExistente) {
                                    let updateData = {};
                                    let hayCambios = false;

                                    if ((!personaExistente.punto_usb || personaExistente.punto_usb === 'Sin Asignar') && sedeArchivo !== 'Sin Asignar') {
                                        updateData.punto_usb = sedeArchivo;
                                        hayCambios = true;
                                    }
                                    if (cedVal !== '-' && cedVal !== '' && (!personaExistente.cedula || personaExistente.cedula === '-')) {
                                        updateData.cedula = cedVal;
                                        hayCambios = true;
                                    }

                                    if (hayCambios) {
                                        const { error } = await supabaseClient.from('solicitudes_ayuda').update(updateData).eq('id', personaExistente.id);
                                        if (!error) personasActualizadas++;
                                    } else {
                                        personasOmitidas++;
                                        nombresAyudaOmitidos.push(nomVal);
                                    }
                                } else {
                                    personasOmitidas++;
                                    nombresAyudaOmitidos.push(nomVal);
                                }
                                
                                if (cedVal !== '-' && cedVal !== '') cedulasEnEsteExcel.add(cedVal);
                                nombresEnEsteExcel.add(nomVal.toLowerCase() + "|" + sedeArchivo);
                                continue; 
                            }

                            if (cedVal !== '-' && cedVal !== '') cedulasEnEsteExcel.add(cedVal);
                            nombresEnEsteExcel.add(nomVal.toLowerCase());

                            let payloadPersona = {
                                nombre: nomVal, 
                                cedula: cedVal,
                                es_damnificado: iDam !== -1 ? (String(row[iDam]).toLowerCase().includes('si') || String(row[iDam]).toLowerCase().includes('sí')) : false,
                                punto_usb: sedeArchivo,
                                estado: 'Con vida',
                                telefono: iTel !== -1 && row[iTel] ? String(row[iTel]).trim() : '-',
                                ubicacion: iUbi !== -1 && row[iUbi] ? String(row[iUbi]).trim() : '-',
                                descripcion_ayuda: iObs !== -1 && row[iObs] ? String(row[iObs]).trim() : '',
                                estado_despacho: 'Sin Pedido',
                                comunidad: 'Universidad Simón Bolívar', 
                                grupo: iGrp !== -1 && row[iGrp] ? String(row[iGrp]).trim() : 'Estudiante',
                                correo: iCor !== -1 && row[iCor] ? String(row[iCor]).trim() : '',
                                carnet_estudiante: iCar !== -1 && row[iCar] ? String(row[iCar]).trim() : 'N/A',
                                personas_hogar: iPer !== -1 && row[iPer] ? (parseInt(row[iPer]) || 1) : 1,
                                ninos_hogar: iNin !== -1 && row[iNin] ? (parseInt(row[iNin]) || 0) : 0,
                                adultos_mayores_hogar: iAdu !== -1 && row[iAdu] ? (parseInt(row[iAdu]) || 0) : 0,
                                requiere_atencion_medica: iMed !== -1 && row[iMed] ? String(row[iMed]).trim() : '', 
                                req_alimentos: iAli !== -1 && row[iAli] ? String(row[iAli]).trim() : '',
                                req_general: ''
                            };

                            const { data, error } = await supabaseClient.from('solicitudes_ayuda').insert([payloadPersona]).select();
                            if (error) throw new Error("Ayuda Insert - " + error.message);
                            if (data && data.length > 0) ayudaNube.push(data[0]); 
                            personasNuevas++;
                        }
                    } 

                    else if (esExcelLogisticaExportado) {
                        let iId = cabecera.findIndex(c => c.includes('id ticket'));
                        let iEst = cabecera.findIndex(c => c.includes('estado logistico') || c.includes('estado logístico'));
                        let iEnc = cabecera.findIndex(c => c.includes('voluntario encargado') || c.includes('encargado'));

                        for (let row of rawData) {
                            let idVal = iId !== -1 ? String(row[iId] || '').trim() : '';
                            if (!idVal || idVal === '-') continue;
                            
                            let updateData = {};
                            let estVal = iEst !== -1 ? String(row[iEst] || '').trim() : null;
                            let encVal = iEnc !== -1 ? String(row[iEnc] || '').trim() : null;

                            if (estVal && estVal !== '-') updateData.estado = estVal;
                            if (encVal && encVal !== '-') updateData.encargado = encVal;

                            if (Object.keys(updateData).length > 0) {
                                const { error } = await supabaseClient.from('etiquetas_logistica').update(updateData).eq('id', idVal);
                                if (error) throw new Error("Logística Update - " + error.message);
                                ticketsActualizados++;
                            }
                        }
                    }

                    else if (esPlantillaPedidos) {
                        let iCed = cabecera.findIndex(c => c.includes('cedula') || c.includes('cédula'));
                        let iNom = cabecera.findIndex(c => c.includes('nombre') || c.includes('afectado'));
                        let iMed = cabecera.findIndex(c => c.includes('medicina'));
                        let iAli = cabecera.findIndex(c => c.includes('alimento') || c.includes('agua'));
                        let iOtr = cabecera.findIndex(c => c.includes('otras') || c.includes('solicitudes'));

                        let ticketsAInsertar = [];

                        for (let row of rawData) {
                            let cedVal = iCed !== -1 ? String(row[iCed] || '-').trim() : '-';
                            let nomVal = iNom !== -1 ? String(row[iNom] || '').trim() : '';
                            if (!nomVal && cedVal === '-') continue;

                            let personaExistente = ayudaNube.find(p => {
                                if (cedVal !== '-' && cedVal !== '') return String(p.cedula).trim() === cedVal;
                                else return String(p.nombre).trim().toLowerCase() === nomVal.toLowerCase();
                            });
                            let idAsignado = personaExistente ? personaExistente.id : null;

                            let reqsObj = [
                                { cat: 'medicina', val: iMed !== -1 ? String(row[iMed] || '').trim() : '' },
                                { cat: 'alimentos_limpieza', val: iAli !== -1 ? String(row[iAli] || '').trim() : '' },
                                { cat: 'otras', val: iOtr !== -1 ? String(row[iOtr] || '').trim() : '' }
                            ];

                            for (let c of reqsObj) {
                                if (c.val && c.val !== '-' && c.val.toLowerCase() !== 'ninguno') {
                                    
                                    let ticketClave = `${idAsignado}-${c.cat}-${c.val.toLowerCase()}`;
                                    if (ticketsEnEsteExcel.has(ticketClave)) {
                                        ticketsOmitidos++;
                                        continue;
                                    }

                                    let ticketYaExiste = idAsignado ? pedidosLogistica.find(t => t.solicitud_id === idAsignado && t.categoria_insumo === c.cat && t.requerimiento.toLowerCase() === c.val.toLowerCase()) : null;
                                    
                                    if (ticketYaExiste) {
                                        ticketsOmitidos++;
                                        ticketsEnEsteExcel.add(ticketClave);
                                        continue; 
                                    }

                                    ticketsEnEsteExcel.add(ticketClave);

                                    ticketsAInsertar.push({ 
                                        solicitud_id: idAsignado, 
                                        categoria_insumo: c.cat, 
                                        requerimiento: c.val, 
                                        punto_usb: sedeArchivo, 
                                        estado: 'Pendiente',
                                        encargado: 'Carga Masiva Excel' 
                                    });
                                }
                            }
                        }
                        
                        if (ticketsAInsertar.length > 0) {
                            const { data, error } = await supabaseClient.from('etiquetas_logistica').insert(ticketsAInsertar).select();
                            if (error) throw new Error("Logística Insert Masivo - " + error.message);
                            if (data && data.length > 0) pedidosLogistica = pedidosLogistica.concat(data);
                            ticketsNuevos += ticketsAInsertar.length;
                        }
                    }
                } 

                let msgPersonasOmitidas = "";
                if (nombresAyudaOmitidos.length > 0) {
                    let unicos = [...new Set(nombresAyudaOmitidos)];
                    let tope = 15;
                    let listaStr = unicos.slice(0, tope).join(", ");
                    if (unicos.length > tope) listaStr += ` y ${unicos.length - tope} más...`;
                    msgPersonasOmitidas = `\n\n📝 Afectados Omitidos (Ya existían o repetidos):\n${listaStr}`;
                }

                alert(`✅ Base de datos verificada y actualizada.\n\n👤 Afectados Nuevos: ${personasNuevas}\n👤 Afectados Actualizados: ${personasActualizadas}\n\n📦 Pedidos Nuevos: ${ticketsNuevos}\n📦 Tickets Actualizados: ${ticketsActualizados}\n\n🛡️ OMITIDOS (DUPLICADOS):\n🚫 ${personasOmitidas} personas repetidas.${msgPersonasOmitidas}\n🚫 ${ticketsOmitidos} pedidos repetidos.`);
                
            } catch (err) { 
                alert('ERROR: ' + err.message); 
                console.error(err); 
            } finally {
                if (pElement) pElement.innerHTML = textoOriginal;
                if (document.getElementById(inputId)) document.getElementById(inputId).value = ''; 
                await cargarDatosDesdeNube();
                if(typeof filtrarYActualizarAyuda === "function") filtrarYActualizarAyuda();
                if(typeof cargarTablaLogisticaFuerza === "function") cargarTablaLogisticaFuerza();
                if(typeof actualizarEstadisticasPuntos === "function") actualizarEstadisticasPuntos();
            }
        };
        lector.readAsArrayBuffer(file);
    };

    const fileLogistica = document.getElementById('excelFileLogistica');
    if(fileLogistica) fileLogistica.addEventListener('change', function(e) { if(e.target.files[0]) procesarExcelMaestro(e.target.files[0], 'dropZoneLogistica', 'excelFileLogistica'); });

    const fileAyuda = document.getElementById('excelFileAyuda');
    if(fileAyuda) fileAyuda.addEventListener('change', function(e) { if(e.target.files[0]) procesarExcelMaestro(e.target.files[0], 'dropZoneAyuda', 'excelFileAyuda'); });

    window.descargarExcelLogistica = function() {
        if (!pedidosLogistica || pedidosLogistica.length === 0) {
            alert("No hay tickets en el almacén.");
            return;
        }
        
        // 1. LEER LOS FILTROS ACTUALES DEL MENÚ DESPLEGABLE
        let filtroCentro = document.getElementById('filtroCentroLogistica') ? document.getElementById('filtroCentroLogistica').value : 'Todos';
        let filtroCat = document.getElementById('filtroCategoriaLog') ? document.getElementById('filtroCategoriaLog').value : 'Todos';
        let filtroEst = document.getElementById('filtroEstadoLog') ? document.getElementById('filtroEstadoLog').value : 'Todos';

        // 2. 🔒 CANDADO DE SEGURIDAD POR ROLES (NUEVO)
        // Si es un admin de centro que por alguna razón logró entrar, lo forzamos a su centro
        if (perfilUsuarioActual && perfilUsuarioActual.rol === 'admin_centro') {
            filtroCentro = perfilUsuarioActual.centro_acopio;
        }
        // Si tienes un rol específico de especialista (ej. 'especialista_cva'), puedes forzarlo aquí:
        // if (perfilUsuarioActual && perfilUsuarioActual.rol === 'especialista_cva') {
        //    filtroCentro = 'CVA Las Mercedes (Caracas)'; 
        // }

        // 3. RECORTAR LA DATA SEGÚN LOS FILTROS
        let pedidosFiltrados = pedidosLogistica.filter(p => {
            let c1 = (filtroCentro === 'Todos') || (p.punto_usb === filtroCentro);
            let c2 = (filtroCat === 'Todos') || (p.categoria_insumo === filtroCat);
            let c3 = (filtroEst === 'Todos') || (p.estado === filtroEst);
            return c1 && c2 && c3;
        });

        if(pedidosFiltrados.length === 0) {
            alert("No hay datos para exportar con los filtros actuales."); return;
        }

        // 4. ESTRUCTURACIÓN LIMPIA DEL EXCEL
        let matriz = [
            ["REPORTE OFICIAL DE LOGÍSTICA - ASOCIACIÓN DE EGRESADOS USB"], // Fila de Título Principal
            [], // Fila de Separación
            [
            "ID TICKET", "FECHA CREACIÓN", "FECHA DESPACHO", "ESTADO", "ENCARGADO", 
            "CENTRO DESTINO", "CATEGORÍA", "REQUERIMIENTO SOLICITADO",
            "BENEFICIARIO", "CÉDULA", "TELÉFONO", "UBICACIÓN"
            ]
        ];
        
        pedidosFiltrados.forEach(p => {
            let fechaCrea = p.created_at ? new Date(p.created_at).toLocaleString('es-VE') : '';
            let fechaDesp = p.fecha_despacho ? new Date(p.fecha_despacho).toLocaleString('es-VE') : 'Pendiente';
            
            let persona = p.solicitud_id ? ayudaNube.find(a => a.id == p.solicitud_id) : null;
            let idCorto = p.id ? p.id.split('-')[0].toUpperCase() : '-';
            
            matriz.push([ 
                idCorto, 
                fechaCrea,
                fechaDesp, 
                p.estado || 'Pendiente', 
                p.encargado || 'Sin Asignar',
                p.punto_usb || '-', 
                String(p.categoria_insumo).toUpperCase() || '-', 
                p.requerimiento || '-',
                persona ? persona.nombre : 'Carga Manual',
                persona ? (persona.cedula || '-') : '-', 
                persona ? (persona.telefono || '-') : '-', 
                persona ? (persona.ubicacion || '-') : '-'
            ]);
        });
        
        const wb = XLSX.utils.book_new(); 
        const ws = XLSX.utils.aoa_to_sheet(matriz);

        // Combinar las celdas del título para que se vea como un encabezado real
        ws['!merges'] = [ { s: {r:0, c:0}, e: {r:0, c:11} } ];

        // 5. MEJORA VISUAL: Ajustar el ancho de cada columna para que nada salga cortado
        ws['!cols'] = [
            {wch: 12}, // ID
            {wch: 20}, // FECHA CREACION
            {wch: 20}, // FECHA DESPACHO
            {wch: 15}, // ESTADO
            {wch: 22}, // ENCARGADO
            {wch: 25}, // DESTINO
            {wch: 18}, // CATEGORIA
            {wch: 50}, // REQUERIMIENTO (Muy ancha)
            {wch: 25}, // BENEFICIARIO
            {wch: 15}, // CEDULA
            {wch: 15}, // TELEFONO
            {wch: 35}  // UBICACION
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Logistica");
        XLSX.writeFile(wb, `Reporte_Logistica_${filtroCentro.substring(0,8)}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    let inventarioNube = [];

    window.cargarInventarioNube = async function() {
        const cuerpo = document.getElementById('tablaInventarioCuerpo');
        if(cuerpo) cuerpo.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">⏳ Conectando con inventario...</td></tr>';
        
        const { data, error } = await supabaseClient
            .from('inventario_general')
            .select('*')
            .order('categoria', { ascending: true })
            .order('item', { ascending: true });
            
        if (error) {
            console.error("Error inventario:", error);
            if(cuerpo) cuerpo.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color:red;">Error cargando inventario.</td></tr>';
            return;
        }
        
        inventarioNube = data || [];
        filtrarYActualizarInventario();
    };

    window.filtrarYActualizarInventario = function() {
        const cuerpo = document.getElementById('tablaInventarioCuerpo');
        if(!cuerpo) return;

        const texto = (document.getElementById('buscarInventarioInput') ? document.getElementById('buscarInventarioInput').value : '').toLowerCase();
        const fCat = document.getElementById('filtroCategoriaInventario') ? document.getElementById('filtroCategoriaInventario').value : 'Todas';

        let filtrados = inventarioNube.filter(i => {
            let cumpleTexto = String(i.item || '').toLowerCase().includes(texto) || String(i.ubicacion_caja || '').toLowerCase().includes(texto);
            let cumpleCen = i.punto_usb === 'CVA Las Mercedes (Caracas)'; 
            let cumpleCat = (fCat === 'Todas') || (i.categoria === fCat);
            return cumpleTexto && cumpleCen && cumpleCat;
        });

        if(filtrados.length === 0) {
            cuerpo.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem;">No hay ítems en el inventario con esos filtros.</td></tr>';
            return;
        }

        const puedeEditar = perfilUsuarioActual && (perfilUsuarioActual.rol === 'super_admin' || perfilUsuarioActual.rol === 'especialista_cva');

        cuerpo.innerHTML = filtrados.map(i => {
            let icono = '📦';
            if(i.categoria === 'Salud') icono = '💊';
            if(i.categoria === 'Alimentos') icono = '🥫';
            if(i.categoria === 'Higiene') icono = '🧼';
            if(i.categoria === 'Otros') icono = '⛺';
            
            let btnAccion = puedeEditar 
                ? `<td class="admin-action-header" style="text-align:center;"><button class="btn-delete" style="padding:0.4rem; font-size:0.8rem; border-radius:4px;" onclick="eliminarItemInventario('${i.id}', this)">🗑️ Borrar</button></td>`
                : '';

            return `<tr>
                <td data-label="Categoría">${icono} ${i.categoria}</td>
                <td data-label="Ítem"><strong>${i.item}</strong></td>
                <td data-label="Presentación">${i.presentacion || '-'}</td>
                <td data-label="Cantidad" style="text-align: center; font-size: 1.1rem; font-weight: 800; color: var(--primary);">${i.cantidad || '0'}</td>
                <td data-label="Caja" style="text-align: center;"><span class="badge badge-gray" style="font-size:0.8rem;">Caja ${i.ubicacion_caja || '-'}</span></td>
                ${btnAccion}
            </tr>`;
        }).join('');
    };

    const fileInventario = document.getElementById('excelFileInventario');
    if(fileInventario) {
        fileInventario.addEventListener('change', function(e) {
            const file = e.target.files[0]; if (!file) return;
            
            const centro = 'CVA Las Mercedes (Caracas)'; 
            const categoriaGlobal = document.getElementById('inventario_categoria_carga').value;
            const pElement = document.querySelector('#dropZoneInventario p');
            const textoOriginal = pElement.innerHTML;

            const lector = new FileReader();
            lector.onload = async function(evt) {
                pElement.innerHTML = "<strong>⏳ Analizando pestañas y cruzando datos...</strong>";
                try {
                    if (!inventarioNube || inventarioNube.length === 0) {
                        await cargarInventarioNube();
                    }

                    const data = new Uint8Array(evt.target.result);
                    const libro = XLSX.read(data, { type: 'array' });
                    
                    let registrosAInsertar = [];
                    let registrosAActualizar = [];
                    
                    for (let nombreHoja of libro.SheetNames) {
                        
                        let categoriaHoja = categoriaGlobal;
                        if (categoriaGlobal === 'Todas') {
                            let n = nombreHoja.toLowerCase();
                            if (n.includes('higiene') || n.includes('aseo')) categoriaHoja = 'Higiene';
                            else if (n.includes('alimento') || n.includes('comida') || n.includes('agua')) categoriaHoja = 'Alimentos';
                            else if (n.includes('otros') || n.includes('refugio')) categoriaHoja = 'Otros';
                            else categoriaHoja = 'Salud'; 
                            
                            if (categoriaHoja === 'Salud' && n.includes('caja') && !n.includes('stock')) {
                                let tieneStock = libro.SheetNames.some(s => s.toLowerCase().includes('stock'));
                                if (tieneStock) continue; 
                            }
                        }

                        const hoja = libro.Sheets[nombreHoja];
                        const rawData = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: "" }); 
                        
                        let cabecera = [];
                        while (rawData.length > 0) {
                            let temp = rawData[0].map(c => String(c).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
                            if (temp.some(c => c.includes('medicamento') || c.includes('contenido') || c.includes('item'))) {
                                cabecera = temp;
                                break;
                            }
                            rawData.shift();
                        }
                        if (cabecera.length === 0) continue; 
                        rawData.shift(); 

                        let iItem = cabecera.indexOf('medicamento');
                        if (iItem === -1) iItem = cabecera.findIndex(c => c === 'contenido' || c.includes('contenido'));
                        if (iItem === -1) iItem = cabecera.findIndex(c => c === 'item' || c.includes('item'));

                        let iPres = cabecera.findIndex(c => c.includes('presentacion') || c.includes('presentación'));
                        if (iPres === -1) iPres = cabecera.findIndex(c => c === 'item' || c.includes('item/cantidad'));

                        let iCant = cabecera.findIndex(c => c.includes('cantidad'));
                        let iCaja = cabecera.findIndex(c => c.includes('ubicacion') || (c.includes('caja') && !c.includes('item')));

                        for (let row of rawData) {
                            let itemRaw = iItem !== -1 ? String(row[iItem] || '').trim() : '';
                            if (!itemRaw || itemRaw.toLowerCase().includes('item') || itemRaw.toLowerCase() === 'nan') continue;

                            let presentacionRaw = iPres !== -1 ? String(row[iPres] || '').trim() : '';
                            let cantidadRaw = iCant !== -1 ? parseInt(String(row[iCant] || '0').trim()) || 0 : 0;
                            let cajaRaw = iCaja !== -1 ? String(row[iCaja] || '').trim().replace(/caja/i, '').trim() : '';
                            
                            if (categoriaHoja === 'Higiene' && cantidadRaw === 0) {
                               let matchNum = presentacionRaw.match(/\d+/);
                               if (matchNum) cantidadRaw = parseInt(matchNum[0]);
                            }

                            let itemExistente = inventarioNube.find(i => 
                                i.categoria === categoriaHoja && 
                                String(i.item).trim().toLowerCase() === itemRaw.toLowerCase() &&
                                String(i.presentacion || '').trim().toLowerCase() === presentacionRaw.toLowerCase()
                            );

                            if (itemExistente) {
                                let yaEnActualizar = registrosAActualizar.find(r => r.id === itemExistente.id);
                                if (yaEnActualizar) {
                                    yaEnActualizar.cantidad += cantidadRaw; 
                                } else {
                                    registrosAActualizar.push({
                                        id: itemExistente.id,
                                        cantidad: cantidadRaw,
                                        presentacion: presentacionRaw !== '' ? presentacionRaw : itemExistente.presentacion,
                                        ubicacion_caja: cajaRaw !== '' ? cajaRaw : itemExistente.ubicacion_caja
                                    });
                                }
                            } else {
                                let yaEnInsertar = registrosAInsertar.find(r => r.item.toLowerCase() === itemRaw.toLowerCase() && r.presentacion.toLowerCase() === presentacionRaw.toLowerCase());
                                if (yaEnInsertar) {
                                    yaEnInsertar.cantidad += cantidadRaw;
                                } else {
                                    registrosAInsertar.push({
                                        punto_usb: centro,
                                        categoria: categoriaHoja,
                                        item: itemRaw,
                                        presentacion: presentacionRaw,
                                        cantidad: cantidadRaw,
                                        ubicacion_caja: cajaRaw
                                    });
                                }
                            }
                        }
                    }

                    pElement.innerHTML = "<strong>⏳ Subiendo y actualizando la base de datos...</strong>";

                    let insertados = 0;
                    let actualizados = 0;

                    if (registrosAInsertar.length > 0) {
                        const { error: errIns } = await supabaseClient.from('inventario_general').insert(registrosAInsertar);
                        if (errIns) throw errIns;
                        insertados = registrosAInsertar.length;
                    }

                    if (registrosAActualizar.length > 0) {
                        const promesasActualizacion = registrosAActualizar.map(reg => 
                            supabaseClient.from('inventario_general').update({
                                cantidad: reg.cantidad,
                                presentacion: reg.presentacion,
                                ubicacion_caja: reg.ubicacion_caja
                            }).eq('id', reg.id)
                        );
                        await Promise.all(promesasActualizacion);
                        actualizados = registrosAActualizar.length;
                    }

                    if (insertados > 0 || actualizados > 0) {
                        if(typeof registrarAuditoria === 'function') registrarAuditoria('IMPORTAR', 'Inventario', `Excel Multi-pestañas: ${insertados} creados, ${actualizados} actualizados`);
                        
                        alert(`✅ ¡Inventario procesado exitosamente!\n\n📦 Ítems nuevos añadidos: ${insertados}\n🔄 Ítems actualizados: ${actualizados}`);
                        await cargarInventarioNube(); 
                    } else {
                        alert("⚠️ Todo tu inventario estaba al día. No hubo cambios nuevos que procesar.");
                    }
                } catch(err) {
                    alert('Error cargando inventario: ' + err.message);
                    console.error(err);
                } finally {
                    pElement.innerHTML = textoOriginal;
                    document.getElementById('excelFileInventario').value = '';
                }
            };
            lector.readAsArrayBuffer(file);
        });
    }

    const buscadorInv = document.getElementById('buscarInventarioInput');
    if (buscadorInv) buscadorInv.addEventListener('input', filtrarYActualizarInventario);

    window.eliminarItemInventario = async function(id, boton) {
        boton.innerText = "Borrando...";
        boton.disabled = true;
        const { error } = await supabaseClient.from('inventario_general').delete().eq('id', id);
        if(error) { alert("Error: " + error.message); boton.innerText = "🗑️ Borrar"; boton.disabled = false; }
        else await cargarInventarioNube();
    };

    window.vaciarInventario = async function() {
        const centro = 'CVA Las Mercedes (Caracas)';
        const categoria = document.getElementById('filtroCategoriaInventario').value;
        
        if (categoria === 'Todas') {
            alert("⚠️ Para proteger la base de datos, debes seleccionar una CATEGORÍA ESPECÍFICA en el filtro antes de usar la función de Vaciar.");
            return;
        }
        
        let msg = `⚠️ ¡PELIGRO! Vas a borrar TODOS los ítems de ${categoria.toUpperCase()} del inventario general.\n\n¿Estás absolutamente seguro? Esto no se puede deshacer.`;
        if(!confirm(msg)) return;
        
        const { error } = await supabaseClient.from('inventario_general')
            .delete()
            .eq('punto_usb', centro)
            .eq('categoria', categoria);
            
        if(error) alert("Error: " + error.message);
        else {
            mostrarNotificacion("✅ Categoría vaciada con éxito.");
            await cargarInventarioNube();
        }
    };

    const loginOriginal = document.getElementById('btn-login');
    if(loginOriginal) {
        loginOriginal.addEventListener('click', () => {
            setTimeout(cargarInventarioNube, 2000); 
        });
    }

    window.actualizarBarraDonaciones = function() {
        const fechaInicio = new Date('2026-07-15T00:00:00').getTime(); 
        const ahora = new Date().getTime();
        
        const mediosDiasPasados = Math.max(0, Math.floor((ahora - fechaInicio) / (1000 * 60 * 60 * 12)));
        
        let montoActual = 3000 + (mediosDiasPasados * 69) + ((mediosDiasPasados % 3) * 8); 
        
        if (montoActual > 25000) montoActual = 25000;
        
        const porcentaje = Math.floor((montoActual / 25000) * 100);
        
        const elMonto = document.getElementById('monto-recaudado');
        const elPorcentaje = document.getElementById('porcentaje-recaudado');
        const elBarra = document.getElementById('barra-recaudado');
        
        if (elMonto) elMonto.innerText = '$' + montoActual.toLocaleString('en-US');
        if (elPorcentaje) elPorcentaje.innerText = porcentaje + '% Alcanzado';
        if (elBarra) elBarra.style.width = porcentaje + '%';
    };

    document.addEventListener('DOMContentLoaded', actualizarBarraDonaciones);

    window.editarRequerimientoLogistica = async function(id) {
        const ticket = pedidosLogistica.find(p => p.id === id);
        if(!ticket) return;

        let nuevoReq = prompt("Modifica los insumos de este pedido (ej. borra lo que no hay en inventario):", ticket.requerimiento);
        
        if(nuevoReq !== null && nuevoReq.trim() !== "") {
            const { error } = await supabaseClient
                .from('etiquetas_logistica')
                .update({ requerimiento: nuevoReq.trim() })
                .eq('id', id);
                
            if(error) {
                alert("Error al actualizar el pedido: " + error.message);
            } else {
                mostrarNotificacion("✅ Pedido modificado correctamente.");
                cargarTablaLogisticaFuerza();
            }
        }
    };

    window.eliminarTicketLogistica = async function(id) {
        if(confirm("🚨 ¿Estás absolutamente seguro de que deseas descartar y eliminar este pedido por completo? Esta acción no se puede deshacer.")) {
            const { error } = await supabaseClient
                .from('etiquetas_logistica')
                .delete()
                .eq('id', id);
                
            if(error) {
                alert("Error al descartar el pedido: " + error.message);
            } else {
                mostrarNotificacion("🗑️ Pedido descartado del sistema.");
                cargarTablaLogisticaFuerza();
            }
        }
    };

    window.actualizarEstadisticasPuntos = function() {
        const panel = document.getElementById('panel-estadisticas-admin');
        const contenedor = document.getElementById('stats-puntos-acopio');
        
        if (!contenedor) return;

        if (panel) panel.style.display = 'block';

        if (!ayudaNube || ayudaNube.length === 0) {
            contenedor.innerHTML = '<div style="color: #94a3b8; text-align: center; width: 100%;">Aún no hay registros de afectados en la base de datos.</div>';
            return;
        }

        let conteo = {};
        ayudaNube.forEach(a => {
            let punto = a.punto_usb || 'Sin Asignar';
            if (!conteo[punto]) conteo[punto] = 0;
            conteo[punto]++;
        });

        let puntosOrdenados = Object.keys(conteo).sort();
        
        let html = '';
        puntosOrdenados.forEach(p => {
            let colorBorde = p === 'Sin Asignar' ? 'var(--gray-700)' : 'var(--accent)';
            html += `
            <div class="stat-card" style="border-left-color: ${colorBorde}; background: rgba(255,255,255,0.05); text-align: left; flex: 1; min-width: 140px; padding: 1rem;">
                <span class="stat-value" style="font-size: 1.6rem; color: #fff;">${conteo[p]}</span>
                <span class="stat-label" style="color: #cbd5e1; font-size: 0.7rem; margin-top: 0.2rem;">${p}</span>
            </div>
            `;
        });

        contenedor.innerHTML = html;
    };

    // ==========================================
    // SISTEMA DE AUDITORÍA Y RASTREO
    // ==========================================
    window.registrarAuditoria = async function(accion, modulo, detalles) {
        if (!perfilUsuarioActual) return; // Solo rastrea si hay sesión iniciada
        try {
            await supabaseClient.from('registro_auditoria').insert([{
                usuario: perfilUsuarioActual.usuario || 'Desconocido',
                rol: perfilUsuarioActual.rol || 'N/A',
                accion: accion.toUpperCase(),
                modulo: modulo,
                detalles: detalles
            }]);
        } catch (e) {
            console.error("Fallo al guardar auditoría:", e);
        }
    };

    window.verAuditoria = async function() {
        if (!perfilUsuarioActual || perfilUsuarioActual.rol !== 'super_admin') {
            alert("Acceso denegado. Exclusivo para Super Administrador."); return;
        }

        const cuerpo = document.getElementById('tablaAuditoriaCuerpo');
        cuerpo.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">⏳ Recopilando historial...</td></tr>';
        document.getElementById('modal-auditoria').style.display = 'flex';

        const { data, error } = await supabaseClient.from('registro_auditoria').select('*').order('created_at', { ascending: false }).limit(100);

        if (error) { cuerpo.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Error: ${error.message}</td></tr>`; return; }
        if (!data || data.length === 0) { cuerpo.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">No hay registros de auditoría aún.</td></tr>'; return; }

        cuerpo.innerHTML = data.map(r => {
            const fecha = new Date(r.created_at).toLocaleString('es-VE', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
            let colorBadge = 'badge-gray';
            if(r.accion.includes('ELIMINAR')) colorBadge = 'badge-danger';
            if(r.accion.includes('CREAR') || r.accion.includes('IMPORTAR')) colorBadge = 'badge-success';
            if(r.accion.includes('EDITAR') || r.accion.includes('APROBAR')) colorBadge = 'badge-warning';

            return `<tr>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-size:0.8rem; color:#64748b;">${fecha}</td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;"><strong>${r.usuario}</strong> <span style="font-size:0.65rem; color:#94a3b8; display:block;">${r.rol}</span></td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;"><span class="badge ${colorBadge}">${r.accion}</span></td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #334155;">${r.modulo}</td>
                <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-size:0.85rem; color:#475569;">${r.detalles}</td>
            </tr>`;
        }).join('');
    };