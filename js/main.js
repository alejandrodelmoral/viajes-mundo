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

function openMap() {
  if (!yearEntries.visitedCountries) {
    document.getElementById('content').innerHTML = '<p>Error: países visitados no definidos.</p>';
    return;
  }
  loadMap(yearEntries.visitedCountries);
}

function loadMap(visitedCountries) {
  document.getElementById('content').innerHTML = `
    <h1>Sitios donde hemos estado</h1>
    <div class="map-container" style="height: 500px; border-radius: 16px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
      <div id="map" style="height: 100%; width: 100%; border-radius: 16px;"></div>
    </div>
  `;

  setTimeout(() => {
    const initialView = [20, 0];
    const initialZoom = 2;

    const map = L.map('map', {
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 1.0,
      minZoom: 2,
      maxZoom: 19
    }).setView(initialView, initialZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
      noWrap: true,
    }).addTo(map);

    function style(feature) {
      const iso = feature.id;
      const isVisited = visitedCountries.includes(iso);
      return {
        fillColor: isVisited ? '#00aaff' : '#cccccc',
        weight: 1,
        opacity: 1,
        color: '#333',
        fillOpacity: isVisited ? 0.7 : 0.2,
      };
    }

    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
      .then(res => res.json())
      .then(geojson => {
        L.geoJSON(geojson, { style }).addTo(map);
      })
      .catch(err => console.error('Error cargando GeoJSON:', err));

    // Control personalizado para resetear zoom y posición
    const ResetControl = L.Control.extend({
      options: { position: 'topleft' },

      onAdd: function(map) {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.style.backgroundColor = 'white';
        container.style.width = '30px';
        container.style.height = '30px';
        container.style.cursor = 'pointer';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.fontSize = '24px';
        container.title = 'Resetear zoom y posición';
        container.innerHTML = '&#8634;';

        container.onclick = function(){
          map.setView(initialView, initialZoom);
        };

        L.DomEvent.disableClickPropagation(container);
        return container;
      }
    });

    map.addControl(new ResetControl());

  }, 100);
}

window.addEventListener('DOMContentLoaded', () => {
  loadYearEntries()
    .then(() => loadHome())
    .catch(() => {
      document.getElementById('content').innerHTML = '<p>Error cargando configuración.</p>';
    });
});
