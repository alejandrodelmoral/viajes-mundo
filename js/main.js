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

  const allEntries = [...yearEntries['2022'], ...yearEntries['2024'], ...yearEntries['2025']];

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
    <div class="map-container" style="height: 500px; border-radius: 16px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); margin-bottom: 1.5em;">
      <div id="map" style="height: 100%; width: 100%; border-radius: 16px;"></div>
    </div>
    <div id="progress-bars" class="progress-wrapper"></div>
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
      const iso = feature.properties.iso_a3;
      const isVisited = visitedCountries.includes(iso);
      return {
        fillColor: isVisited ? '#00aaff' : '#cccccc',
        weight: 1,
        opacity: 1,
        color: '#333',
        fillOpacity: isVisited ? 0.7 : 0.2,
      };
    }

    fetch('js/countries.json')
      .then(res => res.json())
      .then(geojson => {
        L.geoJSON(geojson, { style }).addTo(map);

        const regionMap = {
          'Africa': 'Africa',
          'Americas': 'Americas',
          'Europe': 'Europe',
          'Asia': 'Asia',
          'Oceania': 'Oceania',
          'Antarctica': 'Antarctica'
        };

        const regionStats = {
          'Africa': { visited: 0, total: 0 },
          'Americas': { visited: 0, total: 0 },
          'Asia': { visited: 0, total: 0 },
          'Europe': { visited: 0, total: 0 },
          'Oceania': { visited: 0, total: 0 },
          'Antarctica': { visited: 0, total: 0 }
        };

        const regionCountries = {
          'Africa': [],
          'Americas': [],
          'Asia': [],
          'Europe': [],
          'Oceania': []
        };

        const validIsoSet = new Set();

        geojson.features.forEach(feature => {
          const iso = feature.properties.iso_a3;
          const regionRaw = feature.properties.region_un;
          const continent = regionMap[regionRaw];

          if (!continent) return;
          if (validIsoSet.has(iso)) return;

          validIsoSet.add(iso);
          regionStats[continent].total++;
          if (visitedCountries.includes(iso)) {
            regionStats[continent].visited++;
            if (regionCountries[continent]) {
              regionCountries[continent].push(feature.properties.name);
            }
          }
        });

        const globalTotal = 195;
        const globalVisited = visitedCountries.length;

        const displayNames = {
          'Africa': 'África',
          'Americas': 'América',
          'Asia': 'Asia',
          'Europe': 'Europa',
          'Oceania': 'Oceanía'
        };

        const container = document.getElementById('progress-bars');

        const makeBar = (label, visited, total, countryList = [], regionId = null, collapsible = false) => {
          const percent = total ? Math.round((visited / total) * 100) : 0;
          const countriesHtml = countryList.map(c => `<li>${c}</li>`).join('');
          const listHtml = collapsible ? `
            <ul id="${regionId}" style="display: none; margin: 0.5em 0 0 1em; padding-left: 1em; list-style: disc;">
              ${countriesHtml}
            </ul>
          ` : '';

          const titleHtml = collapsible
            ? `<strong style="cursor: pointer;" onclick="toggleCountryList('${regionId}')">
                <span id="${regionId}-arrow">▼</span> ${label}
              </strong>`
            : `<strong>${label}</strong>`;

          return `
            <div style="margin-bottom: 0.5em;">
              ${titleHtml}
              <div class="progress-bar" style="
                background-color: #eee;
                border-radius: 12px;
                overflow: hidden;
                height: 24px;
                position: relative;
              ">
                <div class="progress-bar-fill" style="
                  background-color: #4caf50;
                  height: 100%;
                  width: ${percent}%;
                  transition: width 0.6s ease;
                "></div>
                <div style="
                  position: absolute;
                  top: 0; left: 0; right: 0; bottom: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: black;
                  font-weight: bold;
                  user-select: none;
                  pointer-events: none;
                ">
                  ${visited}/${total} (${percent}%)
                </div>
              </div>
              ${listHtml}
            </div>
          `;
        };

        container.innerHTML =
          makeBar('🌍 Global', globalVisited, globalTotal) +
          Object.entries(regionStats)
            .filter(([region, stats]) => region !== 'Antarctica' && stats.total > 0)
            .map(([region, { visited, total }]) =>
              makeBar(`${displayNames[region]}`, visited, total, regionCountries[region], `region-${region.toLowerCase()}`, true)
            ).join('');

        window.toggleCountryList = function(regionId) {
          const list = document.getElementById(regionId);
          const arrow = document.getElementById(`${regionId}-arrow`);
          if (list) {
            const isVisible = list.style.display === 'block';
            list.style.display = isVisible ? 'none' : 'block';
            if (arrow) arrow.textContent = isVisible ? '▼' : '▲';
          }
        };
      })
      .catch(err => console.error('Error cargando GeoJSON:', err));

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
        container.onclick = function() {
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
