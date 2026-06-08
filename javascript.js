function parsearXML(xml) {
  const parser = new DOMParser();
  const doc    = parser.parseFromString(xml, 'text/xml');
  const nodos  = doc.querySelectorAll('libro');
  const libros = [];

  nodos.forEach(nodo => {
    const get = tag => nodo.querySelector(tag)?.textContent.trim() ?? '';

    libros.push({
      id          : nodo.getAttribute('id'),
      destacado   : nodo.getAttribute('destacado') === 'true',
      bestseller  : nodo.getAttribute('bestseller') === 'true',
      titulo      : get('titulo'),
      autor       : get('autor'),
      genero      : get('genero'),
      precio      : parseFloat(get('precio')),
      calificacion: parseFloat(get('calificacion')),
      resenas     : parseInt(get('resenas')),
      paginas     : get('paginas'),
      editorial   : get('editorial'),
      año         : get('año'),
      isbn        : get('isbn'),
      descripcion : get('descripcion'),
      badge       : get('badge'),
      imagen      : get('imagen'),
    });
  });

  return libros;
}


let todosLosLibros   = [];
let carrito          = [];
let generoActivo     = 'Todos';
let pantallaAnterior = 'home';


fetch('libro.xml')
  .then(response => response.text())
  .then(xml => {
    todosLosLibros = parsearXML(xml);
    console.log('Libros cargados:', todosLosLibros.length);
    renderizarGeneros('genre-pills-home');
    renderizarGeneros('genre-pills-catalog');
    renderizarDestacados();
    renderizarBestsellers();
    renderizarCatalogo();
  })
  .catch(error => console.error('Error cargando XML:', error));


function showScreen(nombre) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + nombre).classList.add('active');

  if (nombre === 'home')    { renderizarDestacados(); renderizarBestsellers(); }
  if (nombre === 'catalog') { renderizarCatalogo(); }
  if (nombre === 'cart')    { renderizarCarrito(); }

  window.scrollTo(0, 0);
}

function setNav(btn) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-nav'));
  btn.classList.add('active-nav');
}

function setNavByName(name) {
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active-nav', b.textContent.trim() === name);
  });
}

function abrirDetalle(id) {
  pantallaAnterior = document.querySelector('.screen.active')?.id?.replace('screen-', '') || 'catalog';
  document.getElementById('back-btn').onclick = () => showScreen(pantallaAnterior);
  renderizarDetalle(id);
  showScreen('detail');
}

function actualizarEstadoUsuario() {
  const userInfo = document.getElementById('user-info');
  const authBtn = document.getElementById('auth-btn');

  if (!userInfo || !authBtn) return;

  if (usuarioActual) {
    userInfo.textContent = 'Hola, ' + usuarioActual.nombre;
    authBtn.textContent = 'Cerrar sesión';
    authBtn.onclick = cerrarSesion;
  } else {
    userInfo.textContent = 'Sin sesión';
    authBtn.textContent = 'Iniciar sesión';
    authBtn.onclick = function() {
      showScreen('login');
    };
  }
}

function parsearUsuariosXML(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const nodos = doc.querySelectorAll('usuario');
  const usuarios = [];

  nodos.forEach(nodo => {
    const get = tag => nodo.querySelector(tag)?.textContent.trim() ?? '';

    usuarios.push({
      nombre: get('nombre'),
      correo: get('correo').toLowerCase(),
      password: get('password')
    });
  });

  return usuarios;
}

function registrarUsuario() {
  alert('Simulación de registro. Para iniciar sesión usa el usuario creado en usuarios.xml:\n\nCorreo: daniel@gmail.com\nContraseña: 12345');

  document.getElementById('register-name').value = '';
  document.getElementById('register-email').value = '';
  document.getElementById('register-password').value = '';
}

function iniciarSesion() {
  const correo = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value.trim();

  if (!correo || !password) {
    showToast('Ingresa correo y contraseña.');
    return;
  }

  fetch('usuarios.xml')
    .then(response => response.text())
    .then(xml => {
      const usuarios = parsearUsuariosXML(xml);

      const usuario = usuarios.find(u =>
        u.correo === correo && u.password === password
      );

      if (!usuario) {
        showToast('El usuario no existe. Usa el usuario creado en usuarios.xml.');
        return;
      }

      usuarioActual = {
        nombre: usuario.nombre,
        correo: usuario.correo
      };

      localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
      actualizarEstadoUsuario();

      document.getElementById('login-email').value = '';
      document.getElementById('login-password').value = '';

      showToast('Sesión iniciada correctamente.');
      showScreen('cart');
    })
    .catch(error => {
      console.error(error);
      showToast('No se pudo leer usuarios.xml. Usa Live Server o un servidor local.');
    });
}

function cerrarSesion() {
  usuarioActual = null;
  localStorage.removeItem('usuarioActual');
  actualizarEstadoUsuario();
  showToast('Sesión cerrada.');
  showScreen('home');
}


// Generos

function renderizarGeneros(contenedorId) {
  const generos = ['Todos', ...new Set(todosLosLibros.map(l => l.genero))];
  const el = document.getElementById(contenedorId);
  if (!el) return;

  el.innerHTML = generos.map(g => `
    <button class="genre-pill ${g === generoActivo ? 'active-pill' : ''}"
            onclick="filtrarGenero('${g}')">
      ${g}
    </button>
  `).join('');
}

function filtrarGenero(genero) {
  generoActivo = genero;
  document.querySelectorAll('.genre-pill').forEach(p => {
    p.classList.toggle('active-pill', p.textContent.trim() === genero);
  });
  renderizarDestacados();
  renderizarCatalogo();
}

//icono para todos los libros 

function svgLibro(color, fondo) {
  color = color || '#1f2937';
  fondo = fondo || '#f3f4f6';
  return `
    <svg width="90" height="90" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" rx="20" fill="${fondo}"/>
      <path d="M60 30 C48 22, 32 22, 22 30 V88 C32 80, 48 80, 60 88 Z"
            fill="#ffffff" stroke="${color}" stroke-width="4"/>
      <path d="M60 30 C72 22, 88 22, 98 30 V88 C88 80, 72 80, 60 88 Z"
            fill="#ffffff" stroke="${color}" stroke-width="4"/>
      <line x1="60" y1="30" x2="60" y2="88" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      <line x1="32" y1="45" x2="50" y2="45" stroke="#6b7280" stroke-width="3" stroke-linecap="round"/>
      <line x1="32" y1="58" x2="50" y2="58" stroke="#6b7280" stroke-width="3" stroke-linecap="round"/>
      <line x1="32" y1="71" x2="46" y2="71" stroke="#6b7280" stroke-width="3" stroke-linecap="round"/>
      <line x1="70" y1="45" x2="88" y2="45" stroke="#6b7280" stroke-width="3" stroke-linecap="round"/>
      <line x1="70" y1="58" x2="88" y2="58" stroke="#6b7280" stroke-width="3" stroke-linecap="round"/>
      <line x1="70" y1="71" x2="84" y2="71" stroke="#6b7280" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
}

const coloresPorGenero = {
  'Novela'                : { fondo: '#fef9c3', trazo: '#854d0e' },
  'Realismo Mágico'       : { fondo: '#d1fae5', trazo: '#065f46' },
  'Fantasía'              : { fondo: '#ede9fe', trazo: '#4c1d95' },
  'Suspenso'              : { fondo: '#fce7f3', trazo: '#9d174d' },
  'Romance'               : { fondo: '#ffe4e6', trazo: '#9f1239' },
  'Ficción Inspiracional' : { fondo: '#dbeafe', trazo: '#1e40af' },
  'Distopía'              : { fondo: '#e0e7ff', trazo: '#3730a3' },
  'Fantasía Épica'        : { fondo: '#cffafe', trazo: '#164e63' },
  'Novela Familiar'       : { fondo: '#fef3c7', trazo: '#92400e' },
  'Novela Juvenil'        : { fondo: '#fce7f3', trazo: '#be185d' },
  'Ficción Filosófica'    : { fondo: '#f0fdf4', trazo: '#166534' },
  'Épica Clásica'         : { fondo: '#fdf4ff', trazo: '#7e22ce' },
  'Romance Paranormal'    : { fondo: '#fff1f2', trazo: '#9f1239' },
  'Ficción Bélica'        : { fondo: '#f1f5f9', trazo: '#334155' },
  'Novela Moderna'        : { fondo: '#f0f9ff', trazo: '#0369a1' },
  'Ciencia Ficción Épica' : { fondo: '#f0fdf4', trazo: '#15803d' },
};

function coloresDelGenero(genero) {
  return coloresPorGenero[genero] || { fondo: '#f3f4f6', trazo: '#1f2937' };
}



function cabeceraTabla() {
  return `
    <thead>
      <tr>
        <th>Título</th>
        <th>Autor</th>
        <th>Género</th>
        <th>Precio</th>
        <th>Calificación</th>
        <th>Reseñas</th>
        <th>Acciones</th>
      </tr>
    </thead>`;
}

function filaTabla(libro) {
  return `
    <tr>
      <td>${libro.titulo}</td>
      <td>${libro.autor}</td>
      <td>${libro.genero}</td>
      <td>$${libro.precio}</td>
      <td>${libro.calificacion} ⭐</td>
      <td>${libro.resenas.toLocaleString()}</td>
      <td>
        <button class="btn-ver"     onclick="abrirDetalle('${libro.id}')">Ver</button>
        <button class="btn-agregar" onclick="agregarAlCarrito('${libro.id}')">+ Carrito</button>
      </td>
    </tr>`;
}

//Destacados

function renderizarDestacados() {
  const libros = generoActivo === 'Todos'
    ? todosLosLibros.filter(l => l.destacado)
    : todosLosLibros.filter(l => l.destacado && l.genero === generoActivo);

  const el = document.getElementById('feacture-grid');
  if (!el) return;

  el.innerHTML = libros.length
    ? `<table class="tabla-libros">
        ${cabeceraTabla()}
        <tbody>${libros.map(filaTabla).join('')}</tbody>
       </table>`
    : `<p class="catalogo-vacio">No hay destacados en este género.</p>`;
}

function renderizarBestsellers() {
  const libros = todosLosLibros.filter(l => l.bestseller);
  const el = document.getElementById('bestseller-grid');
  if (!el) return;

  el.innerHTML = `
    <table class="tabla-libros">
      ${cabeceraTabla()}
      <tbody>${libros.map(filaTabla).join('')}</tbody>
    </table>`;
}

//Catalogo

function tarjetaLibro(libro) {
  const { fondo, trazo } = coloresDelGenero(libro.genero);

  return `
    <div class="libro-card" onclick="abrirDetalle('${libro.id}')">
      <div class="libro-card-icono">
        ${portadaLibro(libro, 90, 120)}
        <span class="libro-card-badge">${libro.badge}</span>
      </div>
      <div class="libro-card-info">
        <div class="libro-card-header">
          <span class="libro-card-genero">${libro.genero}</span>
          <span class="libro-card-año">${libro.año}</span>
        </div>
        <div class="libro-card-body">
          <h3 class="libro-card-titulo">${libro.titulo}</h3>
          <p class="libro-card-autor">${libro.autor} · ${libro.editorial}</p>
          <p class="libro-card-desc">${libro.descripcion}</p>
        </div>
        <div class="libro-card-footer">
          <div class="libro-card-meta">
            <span class="libro-card-precio">$${libro.precio}</span>
            <span class="libro-card-estrellas">${libro.calificacion} ⭐ (${libro.resenas.toLocaleString()})</span>
          </div>
          <div class="libro-card-acciones">
            <button class="btn-ver"
              onclick="event.stopPropagation(); abrirDetalle('${libro.id}')">Ver detalle</button>
            <button class="btn-agregar"
              onclick="event.stopPropagation(); agregarAlCarrito('${libro.id}')">+ Carrito</button>
          </div>
        </div>
      </div>
    </div>`;
}

function renderizarCatalogo() {
  const query = document.getElementById('search-input')?.value.toLowerCase() || '';

  let libros = generoActivo === 'Todos'
    ? todosLosLibros
    : todosLosLibros.filter(l => l.genero === generoActivo);

  if (query) {
    libros = libros.filter(l =>
      l.titulo.toLowerCase().includes(query) ||
      l.autor.toLowerCase().includes(query)  ||
      l.genero.toLowerCase().includes(query)
    );
  }

  const el = document.getElementById('catalog-grid');
  if (!el) return;

  el.innerHTML = libros.length
    ? `<div class="catalogo-contenedor">
        ${libros.map(tarjetaLibro).join('')}
       </div>`
    : `<p class="catalogo-vacio">No se encontraron libros.</p>`;
}

// Buscador en tiempo real
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('search-input');
  if (input) input.addEventListener('input', renderizarCatalogo);
});

//Detalle

function renderizarDetalle(id) {
  const libro = todosLosLibros.find(l => l.id === id);
  if (!libro) return;

  const { fondo, trazo } = coloresDelGenero(libro.genero);

  document.getElementById('detail-cover').innerHTML = portadaLibro(libro, 180, 240);

  document.getElementById('detail-title').innerHTML = `
    <table class="tabla-detalle">
      <tbody>
        <tr><th>Título</th>       <td>${libro.titulo}</td></tr>
        <tr><th>Autor</th>        <td>${libro.autor}</td></tr>
        <tr><th>Género</th>       <td>${libro.genero}</td></tr>
        <tr><th>Editorial</th>    <td>${libro.editorial}</td></tr>
        <tr><th>Año</th>          <td>${libro.año}</td></tr>
        <tr><th>ISBN</th>         <td>${libro.isbn}</td></tr>
        <tr><th>Páginas</th>      <td>${libro.paginas}</td></tr>
        <tr><th>Calificación</th> <td>${libro.calificacion} ⭐ (${libro.resenas.toLocaleString()} reseñas)</td></tr>
        <tr><th>Precio</th>       <td><strong>$${libro.precio}</strong></td></tr>
      </tbody>
    </table>`;

  document.getElementById('detail-desc').textContent = libro.descripcion;
  document.getElementById('detail-add-btn').onclick = () => agregarAlCarrito(libro.id);
}

//Carrito

function agregarAlCarrito(id) {
  const libro = todosLosLibros.find(l => l.id === id);
  if (!libro) return;

  const existente = carrito.find(i => i.id === id);
  if (existente) {
    existente.qty++;
  } else {
    carrito.push({ ...libro, qty: 1 });
  }

  actualizarContadorCarrito();
  showToast('"' + libro.titulo + '" agregado al carrito');
}

function cambiarCantidad(id, delta) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) carrito = carrito.filter(i => i.id !== id);
  actualizarContadorCarrito();
  renderizarCarrito();
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(i => i.id !== id);
  actualizarContadorCarrito();
  renderizarCarrito();
}

function actualizarContadorCarrito() {
  document.getElementById('cart-count').textContent =
    carrito.reduce((s, i) => s + i.qty, 0);
}

function renderizarCarrito() {
  const itemsEl   = document.getElementById('cart-items');
  const summaryEl = document.getElementById('cart-summary-box');

  if (!carrito.length) {
    itemsEl.innerHTML = `
      <div style="text-align:center; padding:2rem; color:var(--muted)">
        <p style="font-size:2rem">🛒</p>
        <p style="margin-top:0.5rem">Tu carrito está vacío.</p>
        <button class="btn-ver" style="margin-top:1rem"
                onclick="showScreen('catalog')">Ver catálogo</button>
      </div>`;
    summaryEl.innerHTML = '';
    return;
  }

  itemsEl.innerHTML = `
    <table class="tabla-libros">
      <thead>
        <tr>
          <th>Libro</th>
          <th>Precio unitario</th>
          <th>Cantidad</th>
          <th>Subtotal</th>
          <th>Eliminar</th>
        </tr>
      </thead>
      <tbody>
        ${carrito.map(item => `
          <tr>
            <td>
              <div style="display:flex;gap:10px;align-items:center">
                <div style="flex-shrink:0">${portadaLibro(item,40,54)}</div>
                <div>${item.titulo}<br><small style="color:var(--muted)">${item.autor}</small></div>
              </div>
            </td>
            <td>$${item.precio}</td>
            <td>
              <button class="btn-ver" onclick="cambiarCantidad('${item.id}', -1)">−</button>
              &nbsp;${item.qty}&nbsp;
              <button class="btn-ver" onclick="cambiarCantidad('${item.id}', 1)">+</button>
            </td>
            <td><strong>$${(item.precio * item.qty).toFixed(2)}</strong></td>
            <td>
              <button class="btn-eliminar" onclick="eliminarDelCarrito('${item.id}')">✕</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;

  const subtotal = carrito.reduce((s, i) => s + i.precio * i.qty, 0);
  const envio    = subtotal > 400 ? 0 : 59;
  const total    = subtotal + envio;

  summaryEl.innerHTML = `
    <div class="cart-summary">
      <h3>Resumen del pedido</h3>
      <div class="summary-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
      <div class="summary-row"><span>Envío</span><span>${envio === 0 ? 'Gratis ' : '$' + envio}</span></div>
      <div class="summary-total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
      <button class="checkout-btn" onclick="finalizarCompra()">Finalizar compra →</button>
    </div>`;
}
function finalizarCompra() {
  if (!usuarioActual) {
    showToast('Debes iniciar sesión o registrarte antes de pagar.');
    showScreen('login');
    return;
  }

  carrito = [];
  actualizarContadorCarrito();
  showToast('¡Compra realizada con éxito! 🎉');
  showScreen('home');
}

function showToast(mensaje) {
  const t = document.getElementById('toast');
  t.textContent = mensaje;
  t.style.display = 'block';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.style.display = 'none', 2800);
}

function portadaLibro(libro, ancho, alto) {
  ancho = ancho || 90;
  alto  = alto  || 120;
  if (libro.imagen) {
    return `<img
      src="imagenes/${libro.imagen}"
      alt="Portada de ${libro.titulo}"
      width="${ancho}"
      height="${alto}"
      style="object-fit:cover; border-radius:6px; display:block;"
      onerror="this.replaceWith(svgFallback('${libro.genero}',${ancho},${alto}))"
    >`;
  }
  return svgFallbackHtml(libro.genero, ancho, alto);
}

function svgFallbackHtml(genero, ancho, alto) {
  const el = document.createElement('div');
  el.innerHTML = svgLibro(
    coloresDelGenero(genero).trazo,
    coloresDelGenero(genero).fondo
  );
  const svg = el.querySelector('svg');
  if (svg) { svg.setAttribute('width', ancho); svg.setAttribute('height', alto); }
  return el.innerHTML;
}

let sugerencias = [];

function cargarComentariosXML() {
  fetch('comentarios.xml')
    .then(response => response.text())
    .then(xml => {
      sugerencias = parsearComentariosXML(xml);
      renderizarSugerencias();
    })
    .catch(error => {
      console.error(error);
      showToast('No se pudo leer comentarios.xml. Usa Live Server o un servidor local.');
    });
}

function parsearComentariosXML(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const nodos = doc.querySelectorAll('comentario');
  const comentarios = [];

  nodos.forEach(nodo => {
    const get = tag => nodo.querySelector(tag)?.textContent.trim() ?? '';

    comentarios.push({
      id     : nodo.getAttribute('id') || '',
      nombre : get('nombre') || 'Anónimo',
      tipo   : get('tipo') || 'otro',
      texto  : get('texto'),
      fecha  : get('fecha') || '',
      hora   : get('hora') || ''
    });
  });

  return comentarios;
}

function enviarSugerencia() {
  const nombre = document.getElementById('sug-nombre').value.trim();
  const tipo   = document.getElementById('sug-tipo').value;
  const texto  = document.getElementById('sug-texto').value.trim();

  if (!texto) {
    showToast('Escribe tu sugerencia antes de enviar.');
    return;
  }

  const nueva = {
    id     : 'simulada',
    nombre : nombre || 'Anónimo',
    tipo   : tipo || 'otro',
    texto,
    fecha  : new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    hora   : new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };

  sugerencias.unshift(nueva);

  document.getElementById('sug-nombre').value = '';
  document.getElementById('sug-tipo').value = '';
  document.getElementById('sug-texto').value = '';

  renderizarSugerencias();

  alert('Simulación de comentario.\n\nPara que este comentario quede guardado permanentemente, debes agregarlo manualmente dentro de comentarios.xml.');
}

const tipoLabel = {
  libro  : '📚 Recomendar libro',
  mejora : '✨ Mejora del sitio',
  error  : '🐞 Reportar error',
  otro   : '💬 Otro',
};

function renderizarSugerencias() {
  const lista = document.getElementById('suggestions-list');
  const count = document.getElementById('sug-count');

  if (!lista || !count) return;

  count.textContent = `(${sugerencias.length})`;

  if (!sugerencias.length) {
    lista.innerHTML = '<p class="sug-empty">Aún no hay comentarios en comentarios.xml.</p>';
    return;
  }

  lista.innerHTML = sugerencias.map((s, i) => `
    <div class="sug-card">
      <div class="sug-card-header">
        <span class="sug-autor">${s.nombre}</span>
        <span class="sug-tipo-badge">${tipoLabel[s.tipo] || '💬 Otro'}</span>
        <span class="sug-fecha">${s.fecha}${s.hora ? ' · ' + s.hora : ''}</span>
      </div>
      <p class="sug-texto">${s.texto}</p>
      <button class="sug-delete" onclick="eliminarSugerencia(${i})">✕</button>
    </div>`).join('');
}

function eliminarSugerencia(index) {
  sugerencias.splice(index, 1);
  renderizarSugerencias();
}
