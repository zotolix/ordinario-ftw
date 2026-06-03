function pasearXML(xml){
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const nodos = doc.querySelectorAll('libro');
    const libros = [];

    nodos.forEach(nodo => {
        const get = tag => nodo.querySelector(tag)?.textContent ??'';

        libros.push({
            id: nodo.getAttribute('id'),
            destacado: nodo.getAttribute('destacado') === 'true',
            bestseller: nodo.getAttribute('bestseller') === 'true',
            titulo: get('titulo'),
            genero: get('genero'),
            precio: parseFloat(get('precio')),
            calificacion: parseFloat(get('calificacion')),
            resenas: parseInt(get('resenas')),
            paginas: parseInt(get('paginas')),
            editorial: get('editorial'),
            año: parseInt(get('año')),
            isbn: get('isbn'),
            descripcion: get('descripcion'),
            badge: get('badge'),
        });
    });

    return libros;

    return libros;
}

let pantallaAnterior = 'home';

function mostrarPantalla(pantalla){
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('screen-' + pantalla).classList.add('active');

    if (pantalla === 'home') {renderizarDestacados();}
}

function filaTabla(libro){
    return `
    <tr>
        <td>${libro.titulo}</td>
        <td>${libro.genero}</td>
        <td>$${libro.precio}</td>
        <td>${libro.calificacion}</td>
        <td>${libro.resenas.toLocaleString()}</td>
        <td>
            <button class="btn-ver" onclick="abrirdetalles(${libro.id})">Ver</button>
            <button class="btn-agregar" onclick="agregarAlCarrito(${libro.id})">Agregar al carrito</button>
        </td>
    </tr>`
}

function renderizarDestacados(){
    const libros = todosLosLibros.filter(l => l.destacado);

    document.getElementById('feacture-grid').innerHTML = `
        <table class="tabla-libros">
           ${cabeceraTabla()}
           <tbody>
                ${libros.map(filaTabla).join('')}
           </tbody>
        </table>`;
}
  let todosLosLibros = [];
  
  // Cargar XML al iniciar
  fetch('libro.xml')
    .then(response => response.text())
    .then(xml => {
      todosLosLibros = pasearXML(xml);
      renderizarDestacados();
    })
    .catch(error => console.error('Error cargando XML:', error));

  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + name).classList.add('active');
    if (name === 'home') {
      renderizarDestacados();
    }
  }

  function setNav(btn) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-nav'));
    btn.classList.add('active-nav');
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 2800);
  }
  
  function cabeceraTabla() {
    return `<thead>
      <tr>
        <th>Título</th>
        <th>Género</th>
        <th>Precio</th>
        <th>Calificación</th>
        <th>Reseñas</th>
        <th>Acciones</th>
      </tr>
    </thead>`;
  }