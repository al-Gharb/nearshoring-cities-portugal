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
 * City profile images — self-hosted from public/assets/images/cities/.
 * Originals from Wikimedia Commons (see CREDITS.md and CITY_CREDITS for attribution).
 */
const CITY_IMAGES = {
  lisbon:    `${import.meta.env.BASE_URL}assets/images/cities/lisbon.jpg`,
  porto:     `${import.meta.env.BASE_URL}assets/images/cities/porto.jpg`,
  braga:     `${import.meta.env.BASE_URL}assets/images/cities/braga.jpg`,
  guimaraes: `${import.meta.env.BASE_URL}assets/images/cities/guimaraes.jpg`,
  coimbra:   `${import.meta.env.BASE_URL}assets/images/cities/coimbra.jpg`,
  aveiro:    `${import.meta.env.BASE_URL}assets/images/cities/aveiro.jpg`,
  covilha:   `${import.meta.env.BASE_URL}assets/images/cities/covilha.jpg`,
  evora:     `${import.meta.env.BASE_URL}assets/images/cities/evora.jpg`,
  faro:      `${import.meta.env.BASE_URL}assets/images/cities/faro.jpg`,
  setubal:   `${import.meta.env.BASE_URL}assets/images/cities/setubal.jpg`,
};

/**
 * Wikimedia Commons file pages — used as credit link targets.
 */
const CITY_WIKI_URLS = {
  lisbon:    'https://commons.wikimedia.org/wiki/File:+_Abends_mit_dem_Tuck-Tuck_durch_Lissabon._03.jpg',
  porto:     'https://commons.wikimedia.org/wiki/File:View_of_Porto_from_Marginal_de_Gaia,_20250605_1614_9870.jpg',
  braga:     'https://commons.wikimedia.org/wiki/File:Braga_Panorama.jpg',
  guimaraes: 'https://commons.wikimedia.org/wiki/File:Largo_do_Toural_(reabilitado).jpg',
  coimbra:   'https://commons.wikimedia.org/wiki/File:Coimbra_tozu.JPG',
  aveiro:    'https://commons.wikimedia.org/wiki/File:Ria_de_Aveiro.jpg',
  covilha:   'https://commons.wikimedia.org/wiki/File:Centrodacovilha.JPG',
  evora:     'https://commons.wikimedia.org/wiki/File:Évora_-_Praça_do_Giraldo.jpg',
  faro:      'https://commons.wikimedia.org/wiki/File:Faro_2.jpg',
  setubal:   'https://commons.wikimedia.org/wiki/File:Forte_de_Santa_Maria_da_Arrábida_by_Juntas_4.jpg',
};

/**
 * Photo credit metadata — author name and license for each city image.
 * Source: Wikimedia Commons file pages (verified March 2026).
 */
const CITY_CREDITS = {
  lisbon:    { author: 'Holger Uwe Schmitt',         license: 'CC BY-SA 4.0' },
  porto:     { author: 'Jakub Hałun',                license: 'CC BY 4.0' },
  braga:     { author: 'Otto Domes',                 license: 'CC BY-SA 4.0' },
  guimaraes: { author: 'PauloPinto65',               license: 'CC BY-SA 4.0' },
  coimbra:   { author: 'Olarcos',                    license: 'Public domain' },
  aveiro:    { author: 'Joaomartinho63',             license: 'CC BY-SA 3.0' },
  covilha:   { author: 'R. A. Scheridon de Moraes',  license: 'CC BY-SA 3.0' },
  evora:     { author: 'Paolo Querci',               license: 'CC BY 3.0' },
  faro:      { author: 'Joseolgon',                  license: 'CC0' },
  setubal:   { author: 'Juntas',                     license: 'CC BY-SA 4.0' },
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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function valueOrDash(value) {
  if (value == null || value === '') return '—';
  return value;
}

/**
 * Print a city profile (opens print-friendly popup).
 * @param {string} cityId
 */
function printCityProfile(cityId) {
  const section = document.getElementById(cityId);
  if (!section) return;

  const masterCity = getCity(cityId);
  if (!masterCity) return;

  const profile = getCityProfile(cityId) ?? {};

  // Temporarily expand for printing
  const wasExpanded = section.classList.contains('expanded');
  if (!wasExpanded) section.classList.add('expanded');

  const printWindow = window.open('', '_blank', 'width=1100,height=900');
  if (!printWindow) return;

  const cityName = masterCity.basic?.name?.value ?? cityId;
  const region = masterCity.basic?.region?.value ?? 'Portugal';
  const tagline = profile?._meta?.tagline ?? 'Nearshoring profile summary';

  const imageUrl = CITY_IMAGES[cityId] ?? '';
  const wikiUrl = CITY_WIKI_URLS[cityId] ?? '';
  const cityCredit = CITY_CREDITS[cityId] ?? null;

  const climate = profile?.culture?.climate?.value ?? 'Not specified';
  const airport = profile?.infrastructure?.airport;
  const connectivity = profile?.infrastructure?.connectivity;

  const grads = masterCity?.talent?.graduates ?? {};
  const costs = masterCity?.costs ?? {};

  const techStemPlus = grads?.digitalStemPlus?.value ? formatNumber(grads.digitalStemPlus.value) : '—';
  const officialStem = grads?.officialStem?.value ? formatNumber(grads.officialStem.value) : '—';
  const coreICT = grads?.coreICT?.value ? formatNumber(grads.coreICT.value) : '—';
  const ictPct = grads?.coreICT?.pctOfOfficialStem?.value != null
    ? `${grads.coreICT.pctOfOfficialStem.value.toFixed(1)}%`
    : '—';

  const salaryIndex = valueOrDash(costs?.salaryIndex?.value);
  const colIndex = valueOrDash(costs?.colIndex?.value);
  const officeRent = costs?.officeRent
    ? formatRange(costs.officeRent.min, costs.officeRent.max, '€', '/m²')
    : '—';
  const residentialRent = costs?.residentialRent
    ? formatRange(costs.residentialRent.min, costs.residentialRent.max, '€', '/mo')
    : '—';

  const companies = profile?.ecosystem?.techCompanies?.value ?? [];
  const companyItems = companies.slice(0, 12).map((company) => {
    const name = escapeHtml(company?.name ?? 'Unknown');
    const sector = company?.sector ? ` — ${escapeHtml(company.sector)}` : '';
    return `<li><strong>${name}</strong>${sector}</li>`;
  }).join('') || '<li>Company list not available.</li>';

  const institutions = profile?.universityDetail?.institutions ?? [];
  const universityItems = institutions
    .filter((i) => i?.type !== 'research')
    .slice(0, 10)
    .map((institution) => {
      const name = escapeHtml(institution?.name ?? 'Unknown institution');
      const parent = institution?.parent ? ` (${escapeHtml(institution.parent)})` : '';
      return `<li><strong>${name}</strong>${parent}</li>`;
    }).join('') || '<li>University data not available.</li>';

  const researchItems = institutions
    .filter((i) => i?.type === 'research')
    .slice(0, 8)
    .map((institution) => `<li>${escapeHtml(institution?.name ?? 'Research institution')}</li>`)
    .join('') || '<li>No dedicated research institutions listed.</li>';

  const domains = profile?.ecosystem?.domains?.value ?? [];
  const domainItems = domains.slice(0, 10).map((domain) => {
    if (typeof domain === 'string') {
      return `<li>${escapeHtml(domain)}</li>`;
    }
    const name = escapeHtml(domain?.name ?? domain?.label ?? 'Domain');
    const detail = domain?.detail ? ` — ${escapeHtml(domain.detail)}` : '';
    return `<li>${name}${detail}</li>`;
  }).join('') || '<li>Domain data not available.</li>';

  const strengths = profile?.culture?.retention?.strengths ?? [];
  const risks = profile?.culture?.retention?.risks ?? [];
  const retentionNarrative = profile?.culture?.retention?.narrative ?? '';

  const strengthItems = strengths.map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li>No strengths listed.</li>';
  const riskItems = risks.map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li>No risks listed.</li>';

  const qualityOfLife = profile?.culture?.qualityOfLife ?? {};
  const qualityItems = [
    qualityOfLife.walkability ? `Walkability: ${qualityOfLife.walkability}` : null,
    qualityOfLife.healthcare ? `Healthcare: ${qualityOfLife.healthcare}` : null,
    qualityOfLife.culture ? `Culture: ${qualityOfLife.culture}` : null,
  ].filter(Boolean).map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li>Quality-of-life details not available.</li>';

  const commuteRoutes = profile?.infrastructure?.commuteTimes?.routes ?? [];
  const commuteItems = commuteRoutes.map((route) => {
    const to = escapeHtml(route?.to ?? 'destination');
    const time = escapeHtml(route?.time ?? 'n/a');
    const mode = route?.mode ? ` · ${escapeHtml(route.mode)}` : '';
    return `<li>${to}: ${time}${mode}</li>`;
  }).join('') || '<li>No commute routes listed.</li>';

  const photoCreditHtml = (imageUrl && wikiUrl && cityCredit)
    ? `<a class="photo-credit" href="${escapeHtml(wikiUrl)}" target="_blank" rel="noopener noreferrer">Photo: ${escapeHtml(cityCredit.author)} · ${escapeHtml(cityCredit.license)} · Wikimedia Commons</a>`
    : '';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(cityName)} — Nearshoring City Profile</title>
      <style>
        @page {
          size: A4;
          margin: 14mm;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
          color: #111827;
          background: #ffffff;
          line-height: 1.45;
          font-size: 11pt;
        }

        .pdf-wrap {
          max-width: 180mm;
          margin: 0 auto;
        }

        .hero {
          display: grid;
          grid-template-columns: 42% 58%;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 14px;
          break-inside: avoid;
        }

        .hero-image {
          min-height: 220px;
          background: #f3f4f6;
        }

        .hero-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .hero-content {
          padding: 14px 16px;
        }

        h1 {
          margin: 0 0 6px;
          font-size: 21pt;
          line-height: 1.2;
          color: #0f172a;
        }

        .tagline {
          margin: 0 0 8px;
          font-size: 11pt;
          color: #1f2937;
          font-weight: 600;
        }

        .meta {
          margin: 0;
          color: #4b5563;
          font-size: 9.5pt;
        }

        .snapshot {
          margin-top: 10px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .snapshot-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px;
          background: #f9fafb;
        }

        .snapshot-card .label {
          display: block;
          font-size: 8.5pt;
          color: #6b7280;
          margin-bottom: 2px;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .snapshot-card .value {
          font-size: 11.5pt;
          color: #111827;
          font-weight: 700;
        }

        .section {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 11px 12px;
          margin-bottom: 10px;
          break-inside: avoid;
        }

        .section h2 {
          margin: 0 0 8px;
          font-size: 11pt;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #1d4ed8;
        }

        .section p {
          margin: 0 0 8px;
        }

        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .subhead {
          margin: 8px 0 5px;
          font-size: 9.5pt;
          color: #111827;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        ul {
          margin: 0;
          padding-left: 16px;
        }

        li {
          margin: 0 0 3px;
        }

        .photo-credit,
        .footer-note {
          display: block;
          margin-top: 8px;
          color: #6b7280;
          font-size: 8.5pt;
          text-decoration: none;
        }

        .footer-note {
          margin-top: 10px;
        }

        @media print {
          .hero,
          .section {
            break-inside: avoid;
          }

          a {
            color: inherit;
            text-decoration: none;
          }
        }
      </style>
    </head>
    <body>
      <main class="pdf-wrap">
        <section class="hero">
          <div class="hero-image">
            ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(cityName)} city view">` : ''}
          </div>
          <div class="hero-content">
            <h1>${escapeHtml(cityName)}</h1>
            <p class="tagline">${escapeHtml(tagline)}</p>
            <p class="meta">${escapeHtml(region)} · Portugal · City Profile Export</p>
            <div class="snapshot">
              <div class="snapshot-card"><span class="label">Tech STEM+</span><span class="value">${escapeHtml(String(techStemPlus))}</span></div>
              <div class="snapshot-card"><span class="label">Core ICT</span><span class="value">${escapeHtml(String(coreICT))}</span></div>
              <div class="snapshot-card"><span class="label">Salary Index</span><span class="value">${escapeHtml(String(salaryIndex))}</span></div>
              <div class="snapshot-card"><span class="label">COL + Rent</span><span class="value">${escapeHtml(String(colIndex))}</span></div>
            </div>
            ${photoCreditHtml}
          </div>
        </section>

        <section class="section">
          <h2>1. Strategic Snapshot</h2>
          <p><strong>Climate:</strong> ${escapeHtml(String(climate))}</p>
          <p><strong>Profile:</strong> ${escapeHtml(retentionNarrative || 'Narrative not available.')}</p>
        </section>

        <div class="two-col">
          <section class="section">
            <h2>2. Talent & Education</h2>
            <p><strong>Official STEM:</strong> ${escapeHtml(String(officialStem))}</p>
            <p><strong>ICT % of STEM:</strong> ${escapeHtml(String(ictPct))}</p>
            <p class="subhead">Universities</p>
            <ul>${universityItems}</ul>
            <p class="subhead">Research Institutions</p>
            <ul>${researchItems}</ul>
          </section>

          <section class="section">
            <h2>3. Industry Presence</h2>
            <p class="subhead">Leading Companies</p>
            <ul>${companyItems}</ul>
            <p class="subhead">Tech Domains</p>
            <ul>${domainItems}</ul>
          </section>
        </div>

        <div class="two-col">
          <section class="section">
            <h2>4. Cost Structure</h2>
            <p><strong>Office rent:</strong> ${escapeHtml(String(officeRent))}</p>
            <p><strong>Residential rent:</strong> ${escapeHtml(String(residentialRent))}</p>
            <p><strong>Salary index:</strong> ${escapeHtml(String(salaryIndex))} (Lisbon = 100)</p>
            <p><strong>COL + Rent index:</strong> ${escapeHtml(String(colIndex))} (NYC = 100)</p>
          </section>

          <section class="section">
            <h2>5. Infrastructure</h2>
            <p><strong>Airport:</strong> ${escapeHtml(airport?.name ?? 'Not specified')} (${escapeHtml(airport?.iataCode ?? '—')})</p>
            <p><strong>Drive time:</strong> ${escapeHtml(airport?.driveTime ?? 'Not specified')}</p>
            <p><strong>Fiber penetration:</strong> ${escapeHtml(String(valueOrDash(connectivity?.fiberPenetration)))}%</p>
            <p><strong>Average download:</strong> ${escapeHtml(String(valueOrDash(connectivity?.avgDownloadMbps)))} Mbps</p>
            <p><strong>Latency to Frankfurt:</strong> ${escapeHtml(String(valueOrDash(connectivity?.latencyFrankfurt)))} ms</p>
            <p class="subhead">Typical Commute Routes</p>
            <ul>${commuteItems}</ul>
          </section>
        </div>

        <div class="two-col">
          <section class="section">
            <h2>6. Retention Strengths</h2>
            <ul>${strengthItems}</ul>
          </section>
          <section class="section">
            <h2>7. Retention Risks</h2>
            <ul>${riskItems}</ul>
          </section>
        </div>

        <section class="section">
          <h2>8. Quality of Life Notes</h2>
          <ul>${qualityItems}</ul>
          <span class="footer-note">Generated from Nearshoring Cities Portugal v0.95.0 · ${new Date().toISOString().slice(0, 10)}</span>
        </section>
      </main>
    </body>
    </html>
  `);
  printWindow.document.close();

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  const images = Array.from(printWindow.document.images || []);
  if (images.length === 0) {
    setTimeout(triggerPrint, 180);
  } else {
    Promise.all(images.map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise((resolve) => {
        image.onload = resolve;
        image.onerror = resolve;
      });
    })).finally(() => {
      setTimeout(triggerPrint, 120);
    });
  }

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
      <span class="db-value">${costs.salaryIndex?.value ?? '—'}${costs.salaryIndex?.value != null ? ' <a href="#src-salary-index" class="source-link" title="Experimental salary proxy methodology"><i class="fa-solid fa-circle-info"></i></a>' : ''}</span>
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
  const cityCredit = CITY_CREDITS[cityId] ?? null;
  const tagline = profile?._meta?.tagline ?? '';
  const checkScore = profile?.verification?.checkScore ?? null;
  const checkDate = profile?.verification?.checkDate ?? null;

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
          <img src="${imageUrl}" alt="${name} cityscape" loading="eager" decoding="async" width="330" height="220">
          ${wikiUrl && cityCredit ? `<a href="${wikiUrl}" target="_blank" rel="noopener noreferrer" class="image-credit">\u00A9 ${cityCredit.author} \u00B7 ${cityCredit.license} \u00B7 Wikimedia Commons</a>` : ''}
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
        ${buildConfidenceBarHTML(checkScore, checkDate)}
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
            <span class="graduate-label">Tech STEM+ <a href="#src-tech-stemplus" class="source-link"><i class="fa-solid fa-circle-info"></i></a></span>
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
        <p><strong>Salary Index:</strong> <span class="db-value" data-city="${cityId}" data-field="salary-index" data-db="master">${masterCity.costs?.salaryIndex?.value ?? '—'}${masterCity.costs?.salaryIndex?.value != null ? ' <a href="#src-salary-index" class="source-link" title="Experimental salary proxy methodology"><i class="fa-solid fa-circle-info"></i></a>' : ''}</span> (Lisbon = 100) <a href="#src-salary-index" class="source-link"><i class="fa-solid fa-circle-info"></i></a></p>
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


