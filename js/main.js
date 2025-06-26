// let lastScrollTop = 0;
// const navbar = document.getElementById('navbar');

// // Mostrar/ocultar barra según scroll
// window.addEventListener('scroll', () => {
//   const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
//   if (scrollTop > lastScrollTop) {
//     navbar.style.top = '-60px';
//   } else {
//     navbar.style.top = '0';
//   }
//   lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
// });

let yearEntries = {};

function loadYearEntries() {
  return fetch('js/config.json')
    .then(response => {
      if (!response.ok) throw new Error('No se pudo cargar config.json');
      return response.json();
    })
    .then(data => {
      yearEntries = data;
    })
    .catch(error => {
      console.error('Error cargando yearEntries:', error);
      yearEntries = {};
    });
}

function loadHome() {
  if (!yearEntries['2024'] || !yearEntries['2025']) {
    document.getElementById('content').innerHTML = '<p>Error: entradas no cargadas.</p>';
    return;
  }

  const allEntries = [...yearEntries['2024'], ...yearEntries['2025']];

  const cards = allEntries.map(entry => `
    <div class="card" onclick="loadEntry('${entry.file}')">
      <div class="card-image" style="background-image: url('${entry.image}')">
        <div class="card-title">${entry.name}</div>
      </div>
      <div class="card-date">${entry.date}</div>
    </div>
  `).join('');

  document.getElementById('content').innerHTML = `
    <h1>Bienvenido a mi blog de viajes</h1>
    <p>Selecciona un destino en la barra superior para leer sobre esa aventura.</p>
    <div class="scroll-container">
      <div class="card-row" id="card-row">${cards}${cards}</div>
      <!-- Duplicamos el contenido para efecto cinta infinita -->
    </div>
  `;

  window.scrollTo({ top: 0, behavior: 'smooth' });

  const scrollContainer = document.querySelector('.scroll-container');
  const cardRow = document.getElementById('card-row');
  if (scrollContainer && cardRow) {
    let scrollSpeed = 0.7; // px por frame

    function autoScroll() {
      scrollContainer.scrollLeft += scrollSpeed;
      if (scrollContainer.scrollLeft >= cardRow.scrollWidth / 2) {
        scrollContainer.scrollLeft = 0;
      }
      requestAnimationFrame(autoScroll);
    }
    autoScroll();
  }
}

// Cargar entradas Markdown
function loadEntry(filename) {
  fetch(`entries/${filename}`)
    .then(response => response.text())
    .then(text => {
      const html = marked.parse(text);
      document.getElementById('content').innerHTML = html;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Cerrar todos los dropdowns al seleccionar destino
      document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    })
    .catch(err => {
      document.getElementById('content').innerHTML = '<p>Error cargando la entrada.</p>';
    });
}

function toggleDropdown(element) {
  // Cierra otros dropdowns
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item !== element) item.classList.remove('active');
  });

  // Alterna visibilidad del clicado
  element.classList.toggle('active');
}

// Cierra todos los dropdowns si haces clic fuera
document.addEventListener('click', function (e) {
  const isInside = e.target.closest('.nav-item');
  if (!isInside) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  }
});

function loadYear(year) {
  const entries = yearEntries[year];
  if (!entries) return;

  const html = entries.map(entry => `
    <div class="card" onclick="loadEntry('${entry.file}')">
      <div class="card-image" style="background-image: url('${entry.image}')">
        <div class="card-title">${entry.name}</div>
      </div>
      <div class="card-date">${entry.date}</div>
    </div>
  `).join('');

  document.getElementById('content').innerHTML = `
    <h1>Viajes de ${year}</h1>
    <div class="card-container">${html}</div>
  `;

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Cerrar dropdown
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
}

window.addEventListener('DOMContentLoaded', () => {
  loadYearEntries()
    .then(() => loadHome())
    .catch(() => {
      document.getElementById('content').innerHTML = '<p>Error cargando configuración.</p>';
    });
});
