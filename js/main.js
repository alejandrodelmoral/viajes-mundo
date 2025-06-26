let lastScrollTop = 0;
const navbar = document.getElementById('navbar');

// Mostrar/ocultar barra según scroll
window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop > lastScrollTop) {
    navbar.style.top = '-60px';
  } else {
    navbar.style.top = '0';
  }
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

function loadHome() {
  document.getElementById('content').innerHTML = `
    <h1>Bienvenido a mi blog de viajes</h1>
    <p>Selecciona un destino en la barra superior para leer sobre esa aventura.</p>
  `;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Cargar entradas Markdown
function loadEntry(filename) {
  fetch(`entries/${filename}`)
    .then(response => response.text())
    .then(text => {
      const html = marked.parse(text);
      document.getElementById('content').innerHTML = html;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    })
    .catch(err => {
      document.getElementById('content').innerHTML = '<p>Error cargando la entrada.</p>';
    });
}
