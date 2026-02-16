/**
 * CITY PROFILES MODULE
 * Renders city profile sections from CITY_PROFILES.json and MASTER.json.
 * Each profile: header with image + toggle + expandable grid content.
 */

import { getStore, getCity, getCityProfile, getChartConfig } from './database.js';
import { formatNumber, formatRange } from './calculations.js';
import { buildConfidenceBarHTML } from '../utils/confidenceBar.js';

/**
 * City icons mapping (Font Awesome).
 * Matches legacy index.html icon assignments.
 */
const CITY_ICONS = {
  lisbon: 'fa-landmark',
  porto: 'fa-industry',
  braga: 'fa-shield-halved',
  guimaraes: 'fa-gears',
  coimbra: 'fa-graduation-cap',
  aveiro: 'fa-tower-broadcast',
  covilha: 'fa-mountain',
  evora: 'fa-leaf',
  faro: 'fa-umbrella-beach',
  setubal: 'fa-anchor',
};

/**
 * City Wikipedia image URLs.
 * From legacy index.html (320px thumbnails).
 */
const CITY_IMAGES = {
  lisbon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Lisboa_-_Portugal_%2852597836992%29.jpg/320px-Lisboa_-_Portugal_%2852597836992%29.jpg',
  porto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Puente_Don_Luis_I%2C_Oporto%2C_Portugal%2C_2012-05-09%2C_DD_13.JPG/320px-Puente_Don_Luis_I%2C_Oporto%2C_Portugal%2C_2012-05-09%2C_DD_13.JPG',
  braga: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Braga_Panorama.jpg/320px-Braga_Panorama.jpg',
  guimaraes: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Guimaraes-Portugal.jpg/320px-Guimaraes-Portugal.jpg',
  coimbra: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Coimbra_e_o_rio_Mondego_%286167200429%29_%28cropped%29.jpg/320px-Coimbra_e_o_rio_Mondego_%286167200429%29_%28cropped%29.jpg',
  aveiro: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Ilha_Dos_Puxadoiros_%2847261194681%29_%28cropped%29.jpg/320px-Ilha_Dos_Puxadoiros_%2847261194681%29_%28cropped%29.jpg',
  covilha: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Centrodacovilha.JPG/320px-Centrodacovilha.JPG',
  evora: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Evora_Portugal.JPG/320px-Evora_Portugal.JPG',
  faro: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/2021_12_12_arne_mueseler_08_17_0576.jpg/320px-2021_12_12_arne_mueseler_08_17_0576.jpg',
  setubal: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Set%C3%BAbal_-_Portugal_%2847992735196%29.jpg/320px-Set%C3%BAbal_-_Portugal_%2847992735196%29.jpg',
};

/**
 * Wikipedia image URLs for credit links (links directly to the image file).
 */
const CITY_WIKI_URLS = {
  lisbon: 'https://en.wikipedia.org/wiki/Lisbon#/media/File:Lisboa_-_Portugal_(52597836992).jpg',
  porto: 'https://en.wikipedia.org/wiki/Porto#/media/File:Puente_Don_Luis_I,_Oporto,_Portugal,_2012-05-09,_DD_13.JPG',
  braga: 'https://en.wikipedia.org/wiki/Braga#/media/File:Braga_Panorama.jpg',
  guimaraes: 'https://en.wikipedia.org/wiki/Guimar%C3%A3es#/media/File:Guimaraes-Portugal.jpg',
  coimbra: 'https://en.wikipedia.org/wiki/Coimbra#/media/File:Coimbra_e_o_rio_Mondego_(6167200429)_(cropped).jpg',
  aveiro: 'https://en.wikipedia.org/wiki/Aveiro,_Portugal#/media/File:Ilha_Dos_Puxadoiros_(47261194681)_(cropped).jpg',
  covilha: 'https://en.wikipedia.org/wiki/Covilh%C3%A3#/media/File:Centrodacovilha.JPG',
  evora: 'https://en.wikipedia.org/wiki/%C3%89vora#/media/File:Evora_Portugal.JPG',
  faro: 'https://en.wikipedia.org/wiki/Faro,_Portugal#/media/File:2021_12_12_arne_mueseler_08_17_0576.jpg',
  setubal: 'https://commons.wikimedia.org/wiki/File:Set%C3%BAbal_-_Portugal_(47992735196).jpg',
};

/**
 * Create the SVG markup for inline icons (print).
 */
const SVG_PRINT = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>';

/**
 * Idealista property search metadata per city.
 * officeSlug: Idealista URL path for office rentals
 * aptSlug: Idealista URL path for apartment rentals
 * officeAreas: short description of key office neighborhoods
 * aptAreas: short description of residential rental context
 */
const IDEALISTA_CONFIG = {
  lisbon: {
    officeUrl: 'https://www.idealista.pt/arrendar-escritorios/lisboa/com-tamanho-min_60,tamanho-max_300/mapa-google',
    aptUrl: 'https://www.idealista.pt/arrendar-casas/lisboa/com-tamanho-min_40,tamanho-max_60,arrendamento-longa-duracao/mapa-google',
    officeAreas: 'Parque das Nações · Saldanha · Avenidas Novas · Alcântara',
    aptAreas: 'Central city · Long-term rental',
  },
  porto: {
    officeUrl: 'https://www.idealista.pt/arrendar-escritorios/porto/com-tamanho-min_60,tamanho-max_300/mapa-google',
    aptUrl: 'https://www.idealista.pt/arrendar-casas/porto/com-tamanho-min_40,tamanho-max_60,arrendamento-longa-duracao/mapa-google',
    officeAreas: 'Boavista · Campanhã · Matosinhos · Maia',
    aptAreas: 'Central city · Long-term rental',
  },
  braga: {
    officeUrl: 'https://www.idealista.pt/arrendar-escritorios/braga/com-tamanho-min_60,tamanho-max_300/mapa-google',
    aptUrl: 'https://www.idealista.pt/arrendar-casas/braga/com-tamanho-min_40,tamanho-max_60,arrendamento-longa-duracao/mapa-google',
    officeAreas: 'Centro · Lamaçães · Nogueira',
    aptAreas: 'Central city · Long-term rental',
  },
  guimaraes: {
    officeUrl: 'https://www.idealista.pt/arrendar-escritorios/guimaraes/com-tamanho-min_60,tamanho-max_300/mapa-google',
    aptUrl: 'https://www.idealista.pt/arrendar-casas/guimaraes/com-tamanho-min_40,tamanho-max_60,arrendamento-longa-duracao/mapa-google',
    officeAreas: 'Centro Histórico · Azurém (UMinho campus)',
    aptAreas: 'Central city · Long-term rental',
  },
  coimbra: {
    officeUrl: 'https://www.idealista.pt/arrendar-escritorios/coimbra/com-tamanho-min_60,tamanho-max_300/mapa-google',
    aptUrl: 'https://www.idealista.pt/arrendar-casas/coimbra/com-tamanho-min_40,tamanho-max_60,arrendamento-longa-duracao/mapa-google',
    officeAreas: 'Baixa · Solum · IPN Incubator area',
    aptAreas: 'Central city · Long-term rental',
  },
  aveiro: {
    officeUrl: 'https://www.idealista.pt/arrendar-escritorios/aveiro/com-tamanho-min_60,tamanho-max_300/mapa-google',
    aptUrl: 'https://www.idealista.pt/arrendar-casas/aveiro/com-tamanho-min_40,tamanho-max_60,arrendamento-longa-duracao/mapa-google',
    officeAreas: 'Centro · Glicínias · Zona Industrial',
    aptAreas: 'Central city · Long-term rental',
  },
  covilha: {
    officeUrl: 'https://www.idealista.pt/arrendar-escritorios/covilha/com-tamanho-min_60,tamanho-max_300/mapa-google',
    aptUrl: 'https://www.idealista.pt/arrendar-casas/covilha/com-tamanho-min_40,tamanho-max_60,arrendamento-longa-duracao/mapa-google',
    officeAreas: 'Centro · UBI campus area',
    aptAreas: 'Central city · Long-term rental',
  },
  evora: {
    officeUrl: 'https://www.idealista.pt/arrendar-escritorios/evora/com-tamanho-min_60,tamanho-max_300/mapa-google',
    aptUrl: 'https://www.idealista.pt/arrendar-casas/evora/com-tamanho-min_40,tamanho-max_60,arrendamento-longa-duracao/mapa-google',
    officeAreas: 'Centro Histórico · PITE Technology Park',
    aptAreas: 'Historic center · Long-term rental',
  },
  faro: {
    officeUrl: 'https://www.idealista.pt/arrendar-escritorios/faro/com-tamanho-min_60,tamanho-max_300/mapa-google',
    aptUrl: 'https://www.idealista.pt/arrendar-casas/faro/com-tamanho-min_40,tamanho-max_60,arrendamento-longa-duracao/mapa-google',
    officeAreas: 'Centro · Montenegro · Gambelas (UAlg)',
    aptAreas: 'Central city · Long-term rental',
  },
  setubal: {
    officeUrl: 'https://www.idealista.pt/arrendar-escritorios/setubal/com-tamanho-min_60,tamanho-max_300/mapa-google',
    aptUrl: 'https://www.idealista.pt/arrendar-casas/setubal/com-tamanho-min_40,tamanho-max_60,arrendamento-longa-duracao/mapa-google',
    officeAreas: 'Centro · Praça do Bocage · Zona Industrial',
    aptAreas: 'Central city · Long-term rental',
  },
};

/**
 * Toggle city profile expand/collapse.
 * @param {HTMLElement} button
 */
function toggleCityProfile(button) {
  const section = button.closest('.city-section');
  if (!section) return;

  const expanded = section.classList.toggle('expanded');
  button.setAttribute('aria-expanded', String(expanded));
}

// Expose globally for onclick handlers
window.toggleCityProfile = toggleCityProfile;

/**
 * Print a city profile (opens print-friendly popup).
 * @param {string} cityId
 */
function printCityProfile(cityId) {
  const section = document.getElementById(cityId);
  if (!section) return;

  // Temporarily expand for printing
  const wasExpanded = section.classList.contains('expanded');
  if (!wasExpanded) section.classList.add('expanded');

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  const content = section.outerHTML;
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${cityId} — Nearshoring Profile</title>
      <style>
        body { font-family: Inter, sans-serif; max-width: 800px; margin: 0 auto; padding: 1rem; }
        .city-header { background: #0f172a; color: white; padding: 1.5rem; border-radius: 8px; }
        .city-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem 0; }
        .grid-item { padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; }
        .grid-item h3 { color: #2563eb; text-transform: uppercase; font-size: 0.8rem; }
        .city-header-nav, .city-print-btn { display: none; }
        .city-grid { max-height: none !important; opacity: 1 !important; padding: 1rem !important; }
        .grid-item.strategic, .grid-item.collaboration, .grid-item.metrics.full-width { grid-column: span 2; }
      </style>
    </head>
    <body>${content}</body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 250);

  // Restore state
  if (!wasExpanded) section.classList.remove('expanded');
}

// Expose globally
window.printCityProfile = printCityProfile;

/**
 * Build the company list HTML for a city's tech companies.
 * @param {Array} companies
 * @returns {string}
 */
function buildCompanyList(companies) {
  if (!companies?.length) return '<p>Company data pending migration.</p>';

  return `<div class="company-list">
    ${companies.map(c => {
      const nameHtml = c.url
        ? `<a href="${c.url}" target="_blank" rel="noopener">${c.name}</a>`
        : c.name;
      return `
      <div class="company-card">
        <span class="company-name">${nameHtml}</span>
        <span class="company-sector">${c.sector}</span>
        ${c.employees ? `<span class="company-employees">${c.employees} employees</span>` : ''}
      </div>
    `;
    }).join('')}
  </div>`;
}

/**
 * Build student orgs & contacts list with external links.
 * @param {Array} orgs — array of {name, url, description, icon}
 * @returns {string}
 */
function buildStudentOrgsList(orgs) {
  if (!orgs?.length) return '';

  return `<div class="student-orgs-list">
    ${orgs.map(o => {
      const nameHtml = o.url
        ? `<a href="${o.url}" target="_blank" rel="noopener">${o.name}</a>`
        : o.name;
      const icon = o.icon || 'fa-users';
      return `
      <div class="student-org-card">
        <i class="fa-solid ${icon} student-org-icon"></i>
        <span class="student-org-info">
          <span class="student-org-name">${nameHtml}</span>
          ${o.description ? `<span class="student-org-desc">${o.description}</span>` : ''}
        </span>
        ${o.url ? '<i class="fa-solid fa-arrow-up-right-from-square student-org-arrow"></i>' : ''}
      </div>
    `;
    }).join('')}
  </div>`;
}

/**
 * Build domain tags HTML with optional detail descriptions.
 * @param {Array} domains — array of strings or {name, detail} objects
 * @returns {string}
 */
function buildDomainTags(domains) {
  if (!domains?.length) return '';

  return `<div class="domain-tags">
    ${domains.map(d => {
      if (typeof d === 'string') {
        return `<span class="tag-enhanced">${d}</span>`;
      }
      const name = d.name || d.label || d;
      const detail = d.detail || '';
      if (detail) {
        return `<span class="tag-enhanced">${name} <span class="tag-detail">${detail}</span></span>`;
      }
      return `<span class="tag-enhanced">${name}</span>`;
    }).join('')}
  </div>`;
}

/**
 * Build an enhanced climate display with comprehensive weather info.
 * @param {Object} climateData — climate object from culture.climate
 * @returns {string}
 */
function buildClimateSection(climateData) {
  if (!climateData?.value) return '';

  const value = climateData.value;
  const type = climateData.type || '';
  const summerTemp = climateData.avgTempSummer;
  const winterTemp = climateData.avgTempWinter;
  const sunnyDays = climateData.sunnyDays;
  const rainDays = climateData.rainDays;
  const snowDays = climateData.snowDays;
  const seaInfluence = climateData.seaInfluence;
  const humidity = climateData.humidity;
  const bestMonths = climateData.bestMonths;

  // Calculate average annual temp
  const avgTemp = (summerTemp && winterTemp) ? Math.round((summerTemp + winterTemp) / 2) : null;

  // Determine climate type icon and colors based on type field
  const climateStyles = {
    mediterranean: { icon: 'fa-sun', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
    atlantic: { icon: 'fa-wind', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.08)' },
    continental: { icon: 'fa-mountain-sun', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)' },
    mountain: { icon: 'fa-mountain', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)' }
  };

  const style = climateStyles[type] || climateStyles.mediterranean;

  // Build stat cards (6 columns)
  const statCards = [];

  // Summer temperature
  if (summerTemp) {
    statCards.push(`
      <div class="climate-stat" title="Average summer high">
        <i class="fa-solid fa-sun" style="color: #f59e0b;"></i>
        <span class="climate-stat-value">${summerTemp}°</span>
        <span class="climate-stat-label">Summer</span>
      </div>
    `);
  }

  // Winter temperature
  if (winterTemp) {
    statCards.push(`
      <div class="climate-stat" title="Average winter high">
        <i class="fa-solid fa-snowflake" style="color: #0ea5e9;"></i>
        <span class="climate-stat-value">${winterTemp}°</span>
        <span class="climate-stat-label">Winter</span>
      </div>
    `);
  }

  // Sunny days
  if (sunnyDays) {
    statCards.push(`
      <div class="climate-stat" title="Sunny days per year">
        <i class="fa-solid fa-cloud-sun" style="color: #fbbf24;"></i>
        <span class="climate-stat-value">${sunnyDays}</span>
        <span class="climate-stat-label">☀️ Days</span>
      </div>
    `);
  }

  // Rain days
  if (rainDays) {
    statCards.push(`
      <div class="climate-stat" title="Rainy days per year">
        <i class="fa-solid fa-cloud-rain" style="color: #3b82f6;"></i>
        <span class="climate-stat-value">${rainDays}</span>
        <span class="climate-stat-label">🌧️ Days</span>
      </div>
    `);
  }

  // Snow days (for mountain climates)
  if (snowDays) {
    statCards.push(`
      <div class="climate-stat" title="Snow days per year">
        <i class="fa-solid fa-snowflake" style="color: #a5b4fc;"></i>
        <span class="climate-stat-value">${snowDays}</span>
        <span class="climate-stat-label">❄️ Days</span>
      </div>
    `);
  }

  // Sea influence - now in grid (always use wave icon)
  if (seaInfluence) {
    const seaColor = seaInfluence.toLowerCase().includes('strong') ? '#0891b2' :
                     seaInfluence.toLowerCase().includes('none') ? '#94a3b8' : '#22d3ee';
    const seaLabel = seaInfluence.toLowerCase().includes('strong') ? 'Strong' :
                     seaInfluence.toLowerCase().includes('none') ? 'None' : 'Moderate';
    statCards.push(`
      <div class="climate-stat" title="${seaInfluence}">
        <i class="fa-solid fa-water" style="color: ${seaColor};"></i>
        <span class="climate-stat-value">${seaLabel}</span>
        <span class="climate-stat-label">Sea</span>
      </div>
    `);
  }

  // Humidity - now in grid (skip if we already have 6 cards to keep 6x1 max)
  if (humidity && statCards.length < 6) {
    const humidityIcon = humidity === 'high' ? 'fa-droplet' : 
                         humidity === 'low' ? 'fa-sun-plant-wilt' : 'fa-droplet-slash';
    const humidityColor = humidity === 'high' ? '#3b82f6' : 
                          humidity === 'low' ? '#d97706' : '#64748b';
    const humidityLabel = humidity.charAt(0).toUpperCase() + humidity.slice(1);
    statCards.push(`
      <div class="climate-stat" title="${humidityLabel} humidity">
        <i class="fa-solid ${humidityIcon}" style="color: ${humidityColor};"></i>
        <span class="climate-stat-value">${humidityLabel}</span>
        <span class="climate-stat-label">Humidity</span>
      </div>
    `);
  }

  // Best months
  let bestMonthsHtml = '';
  if (bestMonths?.length) {
    bestMonthsHtml = `
      <div class="climate-best-months">
        <i class="fa-solid fa-calendar-check" style="color: #22c55e;"></i>
        <span class="best-months-label">Best months:</span>
        <span class="best-months-list">${bestMonths.join(', ')}</span>
      </div>
    `;
  }

  // Avg temp badge for header
  const avgTempBadge = avgTemp ? `<span class="climate-avg-temp" title="Annual average temperature"><i class="fa-solid fa-temperature-half"></i> ${avgTemp}° avg</span>` : '';

  return `
    <div class="climate-display" style="background: ${style.bg};">
      <div class="climate-header">
        <i class="fa-solid ${style.icon}" style="color: ${style.color};"></i>
        <span class="climate-type">${value}</span>
        ${avgTempBadge}
      </div>
      <div class="climate-stats-grid">
        ${statCards.join('')}
      </div>
      ${bestMonthsHtml}
    </div>
  `;
}

/**
 * Build the universities & research section HTML.
 * @param {Object} profile — city profile from CITY_PROFILES.json
 * @returns {string}
 */
function buildUniversitySection(profile) {
  const uniDetail = profile?.universityDetail;
  if (!uniDetail?.institutions?.length) {
    return '<p>University data pending migration.</p>';
  }

  // Separate universities/polytechnics from research institutions
  const universities = uniDetail.institutions.filter(i => i.type !== 'research');
  const research = uniDetail.institutions.filter(i => i.type === 'research');

  let html = '';

  // Universities & Polytechnics section
  if (universities.length) {
    html += '<p class="uni-section-label">Universities & Polytechnics</p><ul class="uni-list">';
    for (const uni of universities) {
      const nameHtml = uni.url 
        ? `<a href="${uni.url}" target="_blank" rel="noopener">${uni.name}</a>` 
        : uni.name;
      html += `<li><strong>${nameHtml}</strong>`;
      if (uni.parent) {
        html += ` <span class="uni-parent">(${uni.parent})</span>`;
      }
      if (uni.programs?.length) {
        html += `<ul class="program-list"><li>${uni.programs.join(', ')}</li></ul>`;
      }
      html += '</li>';
    }
    html += '</ul>';
  }

  // Research Institutions section
  if (research.length) {
    html += '<p class="uni-section-label research-label">Research Institutions</p><ul class="uni-list">';
    for (const inst of research) {
      const nameHtml = inst.url 
        ? `<a href="${inst.url}" target="_blank" rel="noopener">${inst.name}</a>` 
        : inst.name;
      html += `<li><strong>${nameHtml}</strong>`;
      if (inst.focus?.length) {
        html += `<ul class="program-list"><li>${inst.focus.join(', ')}</li></ul>`;
      } else if (inst.programs?.length) {
        html += `<ul class="program-list"><li>${inst.programs.join(', ')}</li></ul>`;
      }
      html += '</li>';
    }
    html += '</ul>';
  }

  return html;
}

/**
 * Build the key metrics grid for a city (styled like graduate-grid).
 * @param {Object} masterCity — from MASTER.json
 * @returns {string}
 */
function buildMetricsTable(masterCity) {
  const costs = masterCity?.costs || {};
  const grads = masterCity?.talent?.graduates || {};

  return `<div class="metrics-grid">
    <div class="metric-stat">
      <i class="fa-solid fa-user-graduate icon-stem"></i>
      <span class="db-value">${grads.officialStem?.value ? formatNumber(grads.officialStem.value) : '—'}</span>
      <span class="metric-label">Official STEM <a href="#src-dgeec" class="source-link"><i class="fa-solid fa-circle-info"></i></a></span>
    </div>
    <div class="metric-stat">
      <i class="fa-solid fa-user-graduate icon-ict"></i>
      <span class="db-value">${grads.coreICT?.value ? formatNumber(grads.coreICT.value) : '—'}</span>
      <span class="metric-label">Core ICT <a href="#src-dgeec" class="source-link"><i class="fa-solid fa-circle-info"></i></a></span>
    </div>
    <div class="metric-stat">
      <i class="fa-solid fa-chart-line icon-accent"></i>
      <span class="db-value">${costs.salaryIndex?.value ?? '—'}</span>
      <span class="metric-label">Salary Index <a href="#src-salary-index" class="source-link"><i class="fa-solid fa-circle-info"></i></a></span>
    </div>
    <div class="metric-stat">
      <i class="fa-solid fa-building icon-accent"></i>
      <span class="db-value">${costs.officeRent ? formatRange(costs.officeRent.min, costs.officeRent.max, '€', '/m²') : '—'}</span>
      <span class="metric-label">Office Rent <a href="#src-idealista" class="source-link"><i class="fa-solid fa-circle-info"></i></a></span>
    </div>
    <div class="metric-stat">
      <i class="fa-solid fa-house icon-accent"></i>
      <span class="db-value">${costs.residentialRent ? formatRange(costs.residentialRent.min, costs.residentialRent.max, '€', '/mo') : '—'}</span>
      <span class="metric-label">Residential Rent <a href="#src-idealista" class="source-link"><i class="fa-solid fa-circle-info"></i></a></span>
    </div>
    <div class="metric-stat">
      <i class="fa-solid fa-coins icon-col"></i>
      <span class="db-value">${costs.colIndex?.value ?? '—'}</span>
      <span class="metric-label">COL + Rent Index <a href="#src-col-index" class="source-link"><i class="fa-solid fa-circle-info"></i></a></span>
    </div>
  </div>`;
}

/**
 * Build Idealista property search links for a city.
 * @param {string} cityId
 * @returns {string} HTML string
 */
function buildIdealista(cityId) {
  const cfg = IDEALISTA_CONFIG[cityId];
  if (!cfg) return '';
  return `
    <div class="idealista-links">
      <a href="${cfg.officeUrl}" target="_blank" rel="noopener" class="idealista-card" title="Search office rentals on Idealista">
        <i class="fa-solid fa-building idealista-card-icon"></i>
        <span class="idealista-card-info">
          <span class="idealista-card-title">Office Rentals</span>
          <span class="idealista-card-subtitle">${cfg.officeAreas}</span>
        </span>
        <i class="fa-solid fa-arrow-up-right-from-square idealista-card-arrow"></i>
      </a>
      <a href="${cfg.aptUrl}" target="_blank" rel="noopener" class="idealista-card" title="Search apartment rentals on Idealista">
        <i class="fa-solid fa-house idealista-card-icon"></i>
        <span class="idealista-card-info">
          <span class="idealista-card-title">Apartment Rentals</span>
          <span class="idealista-card-subtitle">${cfg.aptAreas}</span>
        </span>
        <i class="fa-solid fa-arrow-up-right-from-square idealista-card-arrow"></i>
      </a>
    </div>
  `;
}

/**
 * Build a single city profile section.
 * @param {string} cityId
 * @returns {HTMLElement|null}
 */
function buildCitySection(cityId) {
  const masterCity = getCity(cityId);
  const profile = getCityProfile(cityId);

  if (!masterCity) return null;

  const name = masterCity.basic?.name?.value ?? cityId;
  const icon = CITY_ICONS[cityId] ?? 'fa-city';
  const imageUrl = CITY_IMAGES[cityId] ?? '';
  const wikiUrl = CITY_WIKI_URLS[cityId] ?? '';
  const tagline = profile?._meta?.tagline ?? '';
  const checkScore = profile?.verification?.checkScore ?? null;

  // Build section
  const section = document.createElement('section');
  section.classList.add('city-section');
  section.id = cityId;
  // Mixed sources: metadata from profiles, metrics from master
  section.dataset.dbMixed = 'master,profiles';

  // Ecosystem data
  const companies = profile?.ecosystem?.techCompanies?.value ?? [];
  const domains = profile?.ecosystem?.domains?.value ?? [];
  const studentOrgs = profile?.ecosystem?.studentOrgs?.value ?? [];
  const universities = profile?.universityDetail?.institutions?.map(i => i.name) ?? masterCity.talent?.universities?.value ?? [];
  const climateData = profile?.culture?.climate ?? null;

  section.innerHTML = `
    <div class="city-header" onclick="toggleCityProfile(this.querySelector('.city-toggle-btn'))">
      ${imageUrl ? `
        <div class="city-header-image">
          <img src="${imageUrl}" alt="${name} cityscape" loading="lazy" decoding="async" width="320" height="240">
          ${wikiUrl ? `<a href="${wikiUrl}" target="_blank" class="image-credit">\u00A9 Wikipedia</a>` : ''}
        </div>
      ` : ''}
      <div class="city-header-content">
        <h2><i class="fa-solid ${icon}"></i>${name}</h2>
        ${tagline ? `<p class="city-subtitle" data-db="profiles">${tagline}</p>` : ''}
      </div>
      <div class="city-header-nav">
        <button class="city-toggle-btn" onclick="event.stopPropagation(); toggleCityProfile(this)" aria-expanded="false">
          <span class="btn-text-expand">Show Details</span>
          <span class="btn-text-collapse">Hide Details</span>
          <i class="fa-solid fa-chevron-down toggle-icon"></i>
        </button>
        <button class="city-print-btn" onclick="event.stopPropagation(); printCityProfile('${cityId}')">${SVG_PRINT} Print as PDF</button>
        ${buildConfidenceBarHTML(checkScore)}
      </div>
    </div>
    <div class="city-grid">
      <div class="grid-item strategic" data-db="profiles" data-prompt-core="true">
        <h3><i class="fa-solid fa-info-circle"></i> Overview</h3>
        ${buildClimateSection(climateData)}
        ${profile ? `<p>${profile.culture?.retention?.narrative ?? ''}</p>` : '<p>Detailed profile data pending migration.</p>'}
      </div>
      <div class="grid-item universities" data-db="profiles" data-prompt-core="true">
        <h3><i class="fa-solid fa-university"></i> Universities & Research</h3>
        ${buildUniversitySection(profile)}
      </div>
      <div class="grid-item graduates" data-db="master,profiles" data-prompt-core="true">
        <h3><i class="fa-solid fa-users"></i> Graduate Output</h3>
        <div class="graduate-grid">
          <div class="graduate-stat">
            <span class="stat-icons"><i class="fa-solid fa-user-graduate icon-stemplus"></i><i class="fa-solid fa-user icon-stemplus"></i></span>
            <span class="db-value" data-city="${cityId}" data-field="stem-grads" data-db="master">${masterCity.talent?.graduates?.digitalStemPlus?.value ? formatNumber(masterCity.talent.graduates.digitalStemPlus.value) : '—'}</span>
            <span class="graduate-label">Digital STEM+ <a href="#src-digital-stemplus" class="source-link"><i class="fa-solid fa-circle-info"></i></a></span>
          </div>
          <div class="graduate-stat">
            <i class="fa-solid fa-user-graduate icon-stem"></i>
            <span class="db-value" data-city="${cityId}" data-field="official-stem" data-db="master">${masterCity.talent?.graduates?.officialStem?.value ? formatNumber(masterCity.talent.graduates.officialStem.value) : '—'}</span>
            <span class="graduate-label">Official STEM <a href="#src-dgeec" class="source-link"><i class="fa-solid fa-circle-info"></i></a></span>
          </div>
          <div class="graduate-stat">
            <i class="fa-solid fa-user-graduate icon-ict"></i>
            <span class="db-value" data-city="${cityId}" data-field="ict-grads" data-db="master">${masterCity.talent?.graduates?.coreICT?.value ? formatNumber(masterCity.talent.graduates.coreICT.value) : '—'}</span>
            <span class="graduate-label">Core ICT <a href="#src-dgeec" class="source-link"><i class="fa-solid fa-circle-info"></i></a></span>
          </div>
          <div class="graduate-stat">
            <i class="fa-solid fa-chart-pie icon-ict"></i>
            <span class="db-value" data-city="${cityId}" data-field="ict-pct" data-db="master">${masterCity.talent?.graduates?.coreICT?.pctOfOfficialStem?.value ? masterCity.talent.graduates.coreICT.pctOfOfficialStem.value.toFixed(1) + '%' : '—'}</span>
            <span class="graduate-label">ICT % of STEM <a href="#src-ict-pct" class="source-link"><i class="fa-solid fa-circle-info"></i></a></span>
          </div>
        </div>
        ${profile?.universityDetail?.talentProfile?.value ? `<p class="talent-insight" data-db="profiles">${profile.universityDetail.talentProfile.value}</p>` : ''}
      </div>
      <div class="grid-item collaboration" data-db="profiles" data-prompt-core="true">
        <h3><i class="fa-solid fa-building"></i> Industry Presence</h3>
        ${buildCompanyList(companies)}
      </div>
      <div class="grid-item cost" data-db="master,profiles" data-prompt-core="true">
        <h3><i class="fa-solid fa-coins"></i> Cost & Retention</h3>
        <p><strong>Salary Index:</strong> <span class="db-value" data-city="${cityId}" data-field="salary-index" data-db="master">${masterCity.costs?.salaryIndex?.value ?? '—'}</span> (Lisbon = 100) <a href="#src-salary-index" class="source-link"><i class="fa-solid fa-circle-info"></i></a></p>
        <p><strong>COL + Rent Index:</strong> <span class="db-value" data-city="${cityId}" data-field="col-index" data-db="master">${masterCity.costs?.colIndex?.value ?? '—'}</span> (NYC = 100) <a href="#src-col-index" class="source-link"><i class="fa-solid fa-circle-info"></i></a></p>
        <p><strong>Office Rent:</strong> <span class="db-value" data-city="${cityId}" data-field="office-rent" data-db="master">${masterCity.costs?.officeRent ? formatRange(masterCity.costs.officeRent.min, masterCity.costs.officeRent.max, '€', '/m²') : '—'}</span> · central, quality offices, 60-200m²</p>
        <p><strong>Residential Rent:</strong> <span class="db-value" data-city="${cityId}" data-field="residential-rent" data-db="master">${masterCity.costs?.residentialRent ? formatRange(masterCity.costs.residentialRent.min, masterCity.costs.residentialRent.max, '€', '/mo') : '—'}</span> · central, modern 1BR apartments, 40-60m²</p>
        <div class="cost-qol" data-db="profiles" data-prompt-core="true">
          <h4><i class="fa-solid fa-map-location-dot"></i> Property Search</h4>
          ${buildIdealista(cityId)}
        </div>
        ${profile?.culture?.retention ? `
        <div class="cost-retention" data-db="profiles" data-prompt-core="true">
          <h4><i class="fa-solid fa-user-check"></i> Retention Profile</h4>
          ${profile.culture.retention.strengths?.length ? `<p class="retention-strengths"><strong>Strengths:</strong> ${profile.culture.retention.strengths.join(' · ')}</p>` : ''}
          ${profile.culture.retention.risks?.length ? `<p class="retention-risks"><strong>Risks:</strong> ${profile.culture.retention.risks.join(' · ')}</p>` : ''}
        </div>
        ` : ''}
      </div>
      <div class="grid-item uses" data-db="profiles">
        ${studentOrgs.length ? `
        <h3><i class="fa-solid fa-people-group"></i> Student Orgs & Contacts</h3>
        ${buildStudentOrgsList(studentOrgs)}
        ` : ''}
        <h3><i class="fa-solid fa-tags"></i> Tech Domains</h3>
        ${buildDomainTags(domains)}
        ${profile?.culture?.qualityOfLife ? `
        <div class="cost-qol" data-db="profiles" data-prompt-core="true">
          <h4><i class="fa-solid fa-heart"></i> Quality of Life</h4>
          <ul class="qol-list">
            ${profile.culture.qualityOfLife.walkability ? `<li><i class="fa-solid fa-person-walking"></i> ${profile.culture.qualityOfLife.walkability}</li>` : ''}
            ${profile.culture.qualityOfLife.healthcare ? `<li><i class="fa-solid fa-hospital"></i> ${profile.culture.qualityOfLife.healthcare}</li>` : ''}
            ${profile.culture.qualityOfLife.culture ? `<li><i class="fa-solid fa-masks-theater"></i> ${profile.culture.qualityOfLife.culture}</li>` : ''}
          </ul>
        </div>
        ` : ''}
      </div>
      <div class="grid-item metrics full-width" data-db="master">
        <h3><i class="fa-solid fa-table"></i> Key Metrics</h3>
        ${buildMetricsTable(masterCity)}
      </div>
    </div>
  `;

  return section;
}

/**
 * Render all city profiles into the profiles container.
 * Only renders featured cities that have chartConfig entries.
 */
export function renderCityProfiles() {
  const container = document.getElementById('city-profiles-content');
  if (!container) return;

  const chartConfig = getChartConfig();
  const cityIds = Object.keys(chartConfig.cityConfig || {});

  if (cityIds.length === 0) {
    container.innerHTML = '<p class="profiles-placeholder">City profiles pending — populate CITY_PROFILES.json</p>';
    return;
  }

  // Use displayOrder to maintain consistent ordering, filtered to featured cities
  const store = getStore();
  const displayOrder = store.master?.config?.displayOrder ?? [];
  const featuredCityIds = displayOrder.filter(id => cityIds.includes(id));

  const fragment = document.createDocumentFragment();

  for (const cityId of featuredCityIds) {
    const section = buildCitySection(cityId);
    if (section) {
      fragment.appendChild(section);
    }
  }

  container.innerHTML = '';
  container.appendChild(fragment);
}
