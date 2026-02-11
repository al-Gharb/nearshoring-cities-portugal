/**
 * CONTENT RENDERER
 * 
 * Walks all [data-db][data-field] spans in the document and populates
 * them from the loaded databases. Also handles header totals and
 * methodology dynamic values.
 * 
 * This module centralizes all "database → DOM" binding in one place.
 */

import { getStore, getCity, getCityProfile } from './database.js';
import { getCompensationData } from './database.js';
import { buildConfidenceBarHTML } from '../utils/confidenceBar.js';

/**
 * Format a number with locale separators (e.g., 36840 → "36,840").
 */
function fmt(n) {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toLocaleString('en-US');
}

/**
 * Get meta/source information for a field.
 * Returns object: { provider: string, type: string, methodology?: string }
 */
function getFieldMeta(city, field) {
  const grads = city.talent?.graduates || {};
  const costs = city.costs || {};

  switch (field) {
    case 'stem-grads':
      return grads.digitalStemPlus?.meta?.source;
    case 'ict-grads':
      return grads.coreICT?.meta?.source;
    case 'ict-pct':
      return grads.coreICT?.pctOfOfficialStem?.meta?.source;
    case 'salary-index':
      return costs.salaryIndex?.meta?.source;
    case 'col-index':
      return costs.colIndex?.meta?.source;
    case 'office-rent':
      return costs.officeRent?.meta?.source;
    case 'residential-rent':
      return costs.residentialRent?.meta?.source;
    default:
      return null;
  }
}

/**
 * Populate all .db-value spans that have [data-city][data-field].
 * Reads from MASTER.json cities via getCity().
 * Also attaches provenance data attributes for tooltip.
 */
function populateDbValues() {
  const spans = document.querySelectorAll('.db-value[data-city][data-field]');

  spans.forEach(span => {
    const cityId = span.dataset.city;
    const field = span.dataset.field;
    const city = getCity(cityId);
    if (!city) return;

    let value = '—';
    const grads = city.talent?.graduates || {};
    const costs = city.costs || {};

    switch (field) {
      case 'stem-grads':
        value = grads.digitalStemPlus?.value ? fmt(grads.digitalStemPlus.value) : '—';
        break;
      case 'official-stem':
        value = grads.officialStem?.value ? fmt(grads.officialStem.value) : '—';
        break;
      case 'ict-grads':
        value = grads.coreICT?.value ? fmt(grads.coreICT.value) : '—';
        break;
      case 'ict-pct':
        value = grads.coreICT?.pctOfOfficialStem?.value
          ? `${grads.coreICT.pctOfOfficialStem.value}%` : '—';
        break;
      case 'salary-index':
        value = costs.salaryIndex?.value ?? '—';
        break;
      case 'col-index':
        value = costs.colIndex?.value ?? '—';
        break;
      case 'office-rent':
        value = costs.officeRent
          ? `€${costs.officeRent.min}–€${costs.officeRent.max}` : '—';
        break;
      case 'residential-rent':
        value = costs.residentialRent
          ? `€${costs.residentialRent.min}–€${costs.residentialRent.max}` : '—';
        break;
      default:
        break;
    }

    span.textContent = value;

    // Mark database source for debug highlighting
    span.setAttribute('data-db', 'master');

    // Mark fields that feed into fact-check prompt generators
    const promptCoreFields = ['stem-grads', 'official-stem', 'ict-grads', 'salary-index', 'col-index', 'office-rent', 'residential-rent'];
    if (promptCoreFields.includes(field)) {
      span.setAttribute('data-prompt-core', 'true');
    }

    // Attach provenance data for tooltip
    const meta = getFieldMeta(city, field);
    if (meta?.provider) {
      span.setAttribute('data-source', meta.provider);
      span.setAttribute('data-source-type', meta.type || 'data');
      if (meta.methodology) {
        span.setAttribute('data-methodology', meta.methodology);
      }
      span.classList.add('has-provenance');
    }
  });
}

/**
 * Populate methodology section dynamic values.
 */
function populateMethodology() {
  const store = getStore();
  const cities = store.master?.cities || {};
  let totalStem = 0;
  let totalICT = 0;

  for (const city of Object.values(cities)) {
    totalStem += city.talent?.graduates?.digitalStemPlus?.value ?? 0;
    totalICT += city.talent?.graduates?.coreICT?.value ?? 0;
  }

  const introStem = document.getElementById('meth-intro-stem');
  const cardStem = document.getElementById('meth-card-stem');
  const cardIct = document.getElementById('meth-card-ict');
  const totalStemEl = document.getElementById('meth-total-stem');

  if (introStem) {
    introStem.textContent = `~${fmt(totalStem)}`;
    introStem.setAttribute('data-db', 'master');
  }
  if (cardStem) {
    cardStem.textContent = `~${fmt(totalStem)}/year (2026 est.)`;
    cardStem.setAttribute('data-db', 'master');
  }
  if (cardIct) {
    const pct = totalStem > 0 ? Math.round((totalICT / totalStem) * 100) : 0;
    cardIct.textContent = `~${fmt(totalICT)}/year (${pct}%)`;
    cardIct.setAttribute('data-db', 'master');
  }
  if (totalStemEl) {
    totalStemEl.textContent = `~${fmt(totalStem)}`;
    totalStemEl.setAttribute('data-db', 'master');
  }
}

/**
 * Render fact-check cards into #fact-check-cards container.
 * Reads checkScore/checkDate from CITY_PROFILES.json for each featured city.
 * Badge colors: ✓ 80-100 green, ⚠ 50-79 yellow, ✗ <50 red, ? null grey.
 */
export function renderFactCheckCards() {
  const container = document.getElementById('fact-check-cards');
  if (!container) return;

  const store = getStore();
  const profiles = store.profiles?.cities || {};
  const master = store.master?.cities || {};
  const chartConfig = store.master?.config?.chartConfig || {};
  const cityConfigs = chartConfig.cityConfig || {};

  // Build card list from featured cities only (no national entry)
  const cards = [];

  // City entries — use display order from chartConfig if available
  const cityIds = Object.keys(cityConfigs).length > 0
    ? Object.keys(cityConfigs)
    : Object.keys(profiles);

  for (const id of cityIds) {
    const profile = getCityProfile(id);
    const masterCity = getCity(id);
    const name = cityConfigs[id]?.displayName || masterCity?.basic?.name?.value || id;

    cards.push({
      name,
      icon: 'fa-city',
      checkScore: profile?.verification?.checkScore ?? null,
      checkDate: profile?.verification?.checkDate ?? null,
    });
  }

  // Render
  container.innerHTML = cards.map(card => {
    const score = card.checkScore;
    const dateStr = card.checkDate
      ? new Date(card.checkDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Pending';

    return `
      <div class="score-card" data-score="${score ?? 'null'}" data-db="profiles">
        <div class="score-card-header">
          <span class="score-card-name"><i class="fa-solid ${card.icon}"></i> ${card.name}</span>
          ${buildConfidenceBarHTML(score)}
        </div>
        <div class="score-card-date">Checked: ${dateStr}</div>
      </div>
    `;
  }).join('');
}

/**
 * Populate city tags on the cover page map legend.
 * Reads domains from CITY_PROFILES.json.
 */
function populateCityTags() {
  const containers = document.querySelectorAll('.city-tags-container[data-city]');
  if (!containers.length) return;

  containers.forEach(container => {
    const cityId = container.getAttribute('data-city');
    const profile = getCityProfile(cityId);
    const tags = profile?.ecosystem?.domains?.value || [];
    if (tags.length > 0) {
      container.setAttribute('data-db', 'profiles');
      container.innerHTML = tags.map(tag => `<span class="city-tag" data-db="profiles">${tag}</span>`).join(' ');
    }
  });
}

/**
 * Populate section-level confidence bars.
 * Reads from WEBSITE_CONTENT.json sectionScores.
 */
function populateSectionConfidence() {
  const store = getStore();
  const sectionScores = store.content?.sectionScores || {};

  const spans = document.querySelectorAll('.section-confidence[data-section]');

  spans.forEach(span => {
    const sectionId = span.getAttribute('data-section');
    const section = sectionScores[sectionId];

    // Mark as content database source
    span.setAttribute('data-db', 'content');

    if (section) {
      const tooltip = `${section.label}: ${section.checkScore}% confidence — ${section.methodology}`;
      span.innerHTML = buildConfidenceBarHTML(section.checkScore, tooltip);
    } else {
      span.innerHTML = buildConfidenceBarHTML(null);
    }
  });
}

/**
 * Populate TOC (table of contents) confidence bars.
 * Shows mini confidence bars floated right in main section rows.
 * For cityProfiles, uses average confidence of all cities.
 */
function populateTocConfidence() {
  const store = getStore();
  const sectionScores = store.content?.sectionScores || {};

  const spans = document.querySelectorAll('.toc-confidence[data-toc-section]');

  spans.forEach(span => {
    const sectionId = span.getAttribute('data-toc-section');
    const section = sectionScores[sectionId];

    // Mark as content database source
    span.setAttribute('data-db', 'content');

    if (section && section.checkScore != null) {
      const tooltip = `${section.label}: ${section.checkScore}% — ${section.methodology || 'Verified'}`;
      // Use compact mode for TOC bars (50px track, 6px pointer)
      span.innerHTML = buildConfidenceBarHTML(section.checkScore, tooltip, true);
    } else {
      span.innerHTML = buildConfidenceBarHTML(null, '', true);
    }
  });
}

/**
 * Render section score cards into #section-score-cards container.
 * Reads from WEBSITE_CONTENT.json sectionScores.
 */
function renderSectionScoreCards() {
  const container = document.getElementById('section-score-cards');
  if (!container) return;

  const store = getStore();
  const sectionScores = store.content?.sectionScores || {};

  // Define display order and icons
  const sectionOrder = [
    { id: 'cityDatabase', icon: 'fa-database' },
    { id: 'macroeconomic', icon: 'fa-chart-line' },
    { id: 'digitalInfra', icon: 'fa-tower-broadcast' },
    { id: 'strategic', icon: 'fa-gears' },
    { id: 'universityTalent', icon: 'fa-graduation-cap' },
    { id: 'workforce', icon: 'fa-users' },
    { id: 'cityProfiles', icon: 'fa-city' },
  ];

  const cards = sectionOrder.map(({ id, icon }) => {
    const section = sectionScores[id];
    if (!section) return '';

    const score = section.checkScore;
    const label = section.label || id;
    const methodology = section.methodology || '';

    return `
      <div class="score-card" data-score="${score}" data-db="content">
        <div class="score-card-header">
          <span class="score-card-name"><i class="fa-solid ${icon}"></i> ${label}</span>
          ${buildConfidenceBarHTML(score, methodology)}
        </div>
        <div class="score-card-methodology">${methodology}</div>
      </div>
    `;
  }).filter(Boolean);

  container.innerHTML = cards.join('');
}

/**
 * Populate the IT Salary Ranges table dynamically from COMPENSATION_DATA.json.
 * Reads htmlAuthoritative fields (hand-tuned annual ranges) for each role.
 */
function populateSalaryTable() {
  const tbody = document.getElementById('salary-table-body');
  if (!tbody) return;

  const comp = getCompensationData();
  const bands = comp?.baseBands;
  if (!bands) return;

  // Display order: which roles appear in the salary table and in what order
  const displayRoles = [
    { key: 'softwareEngineer', label: 'Software Engineer' },
    { key: 'devops', label: 'DevOps / SRE' },
    { key: 'mlDataEngineer', label: 'Data Scientist / ML' },
    { key: 'productManager', label: 'Product Manager' },
    { key: 'qaTesting', label: 'QA / Testing' },
    { key: 'uxCreative', label: 'UX/UI Designer' },
  ];

  const rows = displayRoles.map(({ key, label }) => {
    const role = bands[key];
    if (!role) return '';
    const auth = role.meta?.htmlAuthoritative || {};

    return `
      <tr data-db="compensation" data-role="${key}">
        <td><strong>${label}</strong></td>
        <td class="col-numeric">${auth.junior || '—'}</td>
        <td class="col-numeric">${auth.mid || '—'}</td>
        <td class="col-numeric">${auth.senior || '—'}</td>
        <td class="col-numeric">${auth.lead || '—'}</td>
        <td class="salary-employer col-numeric">${auth.employerTotal || '—'}</td>
      </tr>`;
  }).filter(Boolean);

  tbody.innerHTML = rows.join('');
}

/**
 * Populate the Tech Stack Salary Premiums table dynamically from COMPENSATION_DATA.json.
 * Computes the Senior SW Eng example by applying premium to the SW Eng senior range.
 */
function populateTechStackPremiums() {
  const tbody = document.getElementById('tech-stack-table-body');
  if (!tbody) return;

  const comp = getCompensationData();
  const premiums = comp?.techStackPremiums;
  const sweSenior = comp?.baseBands?.softwareEngineer?.meta?.htmlAuthoritative?.senior;
  if (!premiums) return;

  // Parse senior SW Eng range like "€55–72k" into [55, 72]
  let baseLow = 0, baseHigh = 0;
  if (sweSenior) {
    const match = sweSenior.match(/€(\d+)–(\d+)k/);
    if (match) {
      baseLow = parseInt(match[1], 10);
      baseHigh = parseInt(match[2], 10);
    }
  }

  const rows = Object.entries(premiums).map(([key, stack]) => {
    const pct = stack.premium;
    const premiumLabel = pct === 0 ? 'Baseline' : `+${Math.round(pct * 100)}%`;

    // Calculate example: apply premium to senior SW Eng range
    let example = '—';
    if (baseLow && baseHigh) {
      const low = Math.round(baseLow * (1 + pct));
      const high = Math.round(baseHigh * (1 + pct));
      example = `€${low}–${high}k`;
    }

    return `
      <tr data-db="compensation" data-stack="${key}">
        <td>${stack.stack}</td>
        <td class="col-numeric">${premiumLabel}</td>
        <td class="col-numeric">${example}</td>
      </tr>`;
  });

  tbody.innerHTML = rows.join('');
}

/**
 * Master populate: runs all population passes in sequence.
 * Call once after databases are loaded and rendering is complete.
 */
export function populateAll() {
  populateDbValues();
  populateMethodology();
  populateSalaryTable();
  populateTechStackPremiums();
  renderFactCheckCards();
  renderSectionScoreCards();
  populateCityTags();
  populateSectionConfidence();
  populateTocConfidence();
}
