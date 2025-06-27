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
    <h1>Bienvenido a nuestro blog de viajes</h1>
    <blockquote>
      <i>"El mundo es un libro y aquellos que no viajan solo leen una página." – San Agustín</i>
    </blockquote>
    <p>Explora nuestros relatos y déjate inspirar para tu próxima aventura.</p>
    <div class="scroll-container">
      <div class="card-row" id="card-row">${cards}${cards}</div>
    </div>
  `;

  window.scrollTo({ top: 0, behavior: 'smooth' });

  const scrollContainer = document.querySelector('.scroll-container');
  const cardRow = document.getElementById('card-row');
  if (scrollContainer && cardRow) {
    let scrollSpeed = 0.5;

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

function loadEntry(filename) {
  fetch(`entries/${filename}`)
    .then(response => response.text())
    .then(text => {
      const html = marked.parse(text);
      // Añadimos el botón subir arriba al final
      const scrollUpHtml = `
        <div class="scroll-up" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })" aria-label="Subir arriba" role="button" tabindex="0" 
          onkeydown="if(event.key === 'Enter' || event.key === ' ') window.scrollTo({ top: 0, behavior: 'smooth' })">
          &#8679; Volver arriba
        </div>
      `;
      document.getElementById('content').innerHTML = html + scrollUpHtml;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    })
    .catch(err => {
      document.getElementById('content').innerHTML = '<p>Error cargando la entrada.</p>';
    });
}

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
}

window.addEventListener('DOMContentLoaded', () => {
  loadYearEntries()
    .then(() => loadHome())
    .catch(() => {
      document.getElementById('content').innerHTML = '<p>Error cargando configuración.</p>';
    });
});
