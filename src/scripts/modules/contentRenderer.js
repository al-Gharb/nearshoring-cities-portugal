/**
 * CONTENT RENDERER
 * 
 * Walks all [data-db][data-field] spans in the document and populates
 * them from the loaded databases. Also handles header totals and
 * methodology dynamic values.
 * 
 * This module centralizes all "database → DOM" binding in one place.
 */

import { getStore, getCity, getCityProfile, getCompensationData } from './database.js';
import { buildConfidenceBarHTML } from '../utils/confidenceBar.js';

/**
 * Format a number with locale separators (e.g., 36840 → "36,840").
 */
function fmt(n) {
  if (n == null) return '—';
  const parsed = Number(n);
  if (Number.isNaN(parsed)) return '—';
  return parsed.toLocaleString('en-US');
}

const PROMPT_CORE_FIELDS = new Set([
  'stem-grads',
  'official-stem',
  'ict-grads',
  'salary-index',
  'col-index',
  'office-rent',
  'residential-rent',
]);

function setDbTag(element, db) {
  element.dataset.db = db;
}

function setTextAndDb(element, text, db = 'content') {
  if (!element) return;
  element.textContent = text;
  setDbTag(element, db);
}

function setHtmlAndDb(element, html, db = 'content') {
  if (!element) return;
  element.innerHTML = html;
  setDbTag(element, db);
}

function setHtmlAndDbById(id, html, db = 'content') {
  const element = document.getElementById(id);
  if (!element) return;
  setHtmlAndDb(element, html, db);
}

function setStatCardContent(container, value, label, db = 'content') {
  if (!container) return;

  const valueElement = container.querySelector('.stat-value');
  const labelElement = container.querySelector('.stat-label');

  setTextAndDb(valueElement, value, db);
  setTextAndDb(labelElement, label, db);
}

function formatMacroValue(value, formatType) {
  if (value === null || value === undefined) return 'N/A';

  if (formatType === 'percent') return `${Number(value).toFixed(1)}%`;
  if (formatType === 'currency') return `€${fmt(Math.round(value))}`;
  if (formatType === 'currency-decimal') return `€${Number(value).toFixed(1)}`;
  if (formatType === 'integer') return fmt(Math.round(value));

  return String(value);
}

function fmtCountryValue(value, year, formatType) {
  const formatted = formatMacroValue(value, formatType);
  return `
      <span class="macro-country-value">${formatted}</span>
      <div class="macro-country-year">(${year || 'n/a'})</div>
    `;
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

function getDbFieldValue(city, field) {
  const grads = city.talent?.graduates || {};
  const costs = city.costs || {};

  switch (field) {
    case 'stem-grads':
      return grads.digitalStemPlus?.value ? fmt(grads.digitalStemPlus.value) : '—';
    case 'official-stem':
      return grads.officialStem?.value ? fmt(grads.officialStem.value) : '—';
    case 'ict-grads':
      return grads.coreICT?.value ? fmt(grads.coreICT.value) : '—';
    case 'ict-pct':
      return grads.coreICT?.pctOfOfficialStem?.value
        ? `${grads.coreICT.pctOfOfficialStem.value}%`
        : '—';
    case 'salary-index':
      return costs.salaryIndex?.value ?? '—';
    case 'col-index':
      return costs.colIndex?.value ?? '—';
    case 'office-rent':
      return costs.officeRent
        ? `€${costs.officeRent.min}–€${costs.officeRent.max}`
        : '—';
    case 'residential-rent':
      return costs.residentialRent
        ? `€${costs.residentialRent.min}–€${costs.residentialRent.max}`
        : '—';
    default:
      return '—';
  }
}

function applyProvenance(span, meta) {
  if (!meta?.provider) return;

  span.dataset.source = meta.provider;
  span.dataset.sourceType = meta.type || 'data';
  if (meta.methodology) {
    span.dataset.methodology = meta.methodology;
  }
  span.classList.add('has-provenance');
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

    span.textContent = getDbFieldValue(city, field);
    setDbTag(span, 'master');

    if (PROMPT_CORE_FIELDS.has(field)) {
      span.dataset.promptCore = 'true';
    }

    applyProvenance(span, getFieldMeta(city, field));
  });
}

/**
 * Populate methodology section dynamic values.
 */
function populateMethodology() {
  const store = getStore();
  const regionalTotals = store.master?.regionalTotals || {};
  let totalStem = 0;

  for (const totals of Object.values(regionalTotals)) {
    totalStem += totals?.digitalStemPlus ?? 0;
  }

  const introStem = document.getElementById('meth-intro-stem');
  const cardStem = document.getElementById('meth-card-stem');

  if (introStem) {
    introStem.textContent = `~${fmt(totalStem)}`;
    setDbTag(introStem, 'master');
  }
  if (cardStem) {
    cardStem.textContent = `~${fmt(totalStem)}/year (2026 gross est.)`;
    setDbTag(cardStem, 'master');
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
          ${buildConfidenceBarHTML(score, card.checkDate)}
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
    const cityId = container.dataset.city;
    const profile = getCityProfile(cityId);
    const tags = profile?.ecosystem?.domains?.value || [];
    if (tags.length > 0) {
      setDbTag(container, 'profiles');
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
    const sectionId = span.dataset.section;
    const section = sectionScores[sectionId];

    // Mark as content database source
    setDbTag(span, 'content');

    if (section) {
      span.innerHTML = buildConfidenceBarHTML(section.checkScore, section.checkDate);
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
    const sectionId = span.dataset.tocSection;
    const section = sectionScores[sectionId];

    // Mark as content database source
    setDbTag(span, 'content');

    const hasCheckScore = section?.checkScore !== null && section?.checkScore !== undefined;
    if (hasCheckScore) {
      // Use compact mode for TOC bars (50px track, 6px pointer)
      span.innerHTML = buildConfidenceBarHTML(section.checkScore, section.checkDate, true);
    } else {
      span.innerHTML = buildConfidenceBarHTML(null, null, true);
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
    const checkDate = section.checkDate;
    const label = section.label || id;
    const dateStr = checkDate
      ? new Date(checkDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Pending';

    return `
      <div class="score-card" data-score="${score}" data-db="content">
        <div class="score-card-header">
          <span class="score-card-name"><i class="fa-solid ${icon}"></i> ${label}</span>
          ${buildConfidenceBarHTML(score, checkDate)}
        </div>
        <div class="score-card-date">Checked: ${dateStr}</div>
      </div>
    `;
  }).filter(Boolean);

  container.innerHTML = cards.join('');
}

/**
 * Populate the INE Regional Earnings table dynamically from COMPENSATION_DATA.json.
 * Reads raw 14× values from ineRegionalEarnings, converts to 12× for display,
 * and auto-calculates % vs Lisbon from Bachelor column.
 */
function populateINETable() {
  const tbody = document.getElementById('ine-table-body');
  if (!tbody) return;

  const comp = getCompensationData();
  const ine = comp?.ineRegionalEarnings;
  if (!ine?.regions || !ine?.displayOrder) return;

  const CONV = 14 / 12; // 14× → 12× conversion factor
  const columns = ine.displayColumns || ['primary', 'profCourse', 'preBologna', 'bachelor', 'master'];
  const baselineRegion = ine.regions[ine.lisbonBaselineRegion];
  const lisbonBachelor14x = baselineRegion?.[ine.lisbonBaselineField] || 1;

  const rows = ine.displayOrder.map(regionKey => {
    const region = ine.regions[regionKey];
    if (!region || region.display === false) return '';

    const isHighlight = region.highlight === true;
    const rowClass = isHighlight ? ' class="ine-highlight ine-lisbon"' : '';
    const nameCell = isHighlight
      ? `<td><strong>${region.name}</strong></td>`
      : `<td>${region.name}</td>`;

    // Convert each column from 14× to 12× and format
    const dataCells = columns.map(col => {
      const raw14x = region[col];
      if (raw14x == null) return '<td class="col-numeric">—</td>';
      const val12x = Math.round(raw14x * CONV);
      const formatted = `€${val12x.toLocaleString('en-US')}`;
      return `<td class="col-numeric">${formatted}</td>`;
    }).join('');

    // Calculate % vs Lisbon from Bachelor column
    const bachelor14x = region[ine.lisbonBaselineField];
    let pctCell = '<td class="col-numeric">—</td>';
    if (bachelor14x != null && lisbonBachelor14x > 0) {
      const pct = ((bachelor14x / lisbonBachelor14x) * 100).toFixed(1);
      const pctFormatted = isHighlight ? `<strong>${pct}%</strong>` : `${pct}%`;
      pctCell = `<td class="col-numeric">${pctFormatted}</td>`;
    }

    return `<tr${rowClass}>${nameCell}${dataCells}${pctCell}</tr>`;
  }).filter(Boolean);

  tbody.innerHTML = rows.join('');
}

/**
 * Populate the salary benchmark table dynamically from WEBSITE_CONTENT.json.
 * Source path: national.laborMarket.damiaBenchmark.roleSeniorityTable
 */
function populateSalaryTable() {
  const tbody = document.getElementById('salary-table-body');
  if (!tbody) return;

  const store = getStore();
  const rowsData = store.content?.national?.laborMarket?.damiaBenchmark?.roleSeniorityTable;
  if (!rowsData) return;

  const rows = rowsData.map((row) => {
    return `
      <tr data-db="content" data-role="${row.role}">
        <td><strong>${row.role || '—'}</strong></td>
        <td class="col-numeric">${row.junior || '—'}</td>
        <td class="col-numeric">${row.mid || '—'}</td>
        <td class="col-numeric">${row.senior || '—'}</td>
        <td class="col-numeric">${row.lead || '—'}</td>
        <td>${row.techStack || '—'}</td>
      </tr>`;
  });

  tbody.innerHTML = rows.join('');
}

/**
 * Legacy function kept for compatibility. Premium table removed from Strategic section.
 */
function populateTechStackPremiums() {
  return;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NATIONAL CONTENT RENDERERS — Dynamize hardcoded HTML sections
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Populate macroeconomic EU comparison table from WEBSITE_CONTENT.json.
 * Targets: #macro-comparison-title, #macro-comparison-subtitle,
 *          #macro-comparison-body, #macro-comparison-na-note
 */
function populateMacroComparisonTable() {
  const store = getStore();
  const table = store.content?.national?.macroeconomicScorecard?.comparisonTable;
  if (!table?.indicators) return;

  const titleEl = document.getElementById('macro-comparison-title');
  const subtitleEl = document.getElementById('macro-comparison-subtitle');
  const noteEl = document.getElementById('macro-comparison-na-note');
  const bodyEl = document.getElementById('macro-comparison-body');

  if (titleEl && table.title) {
    titleEl.textContent = table.title;
    setDbTag(titleEl, 'content');
  }

  if (subtitleEl && table.subtitle) {
    subtitleEl.textContent = table.subtitle;
    setDbTag(subtitleEl, 'content');
  }

  if (noteEl && table.naNote) {
    noteEl.textContent = table.naNote;
    setDbTag(noteEl, 'content');
  }

  if (!bodyEl) return;

  const rows = table.indicators.map((item) => {
    const indicator = `
      <div class="macro-indicator-title">${item.label}</div>
      <div class="macro-indicator-meta">(${item.unit})</div>
    `;

    const eu = fmtCountryValue(item.values?.eu, item.years?.eu, item.format);
    const germany = fmtCountryValue(item.values?.germany, item.years?.germany, item.format);
    const portugal = fmtCountryValue(item.values?.portugal, item.years?.portugal, item.format);

    return `
      <tr>
        <td>${indicator}</td>
        <td class="col-eu">${eu}</td>
        <td class="col-de">${germany}</td>
        <td class="col-pt">${portugal}</td>
      </tr>
    `;
  });

  bodyEl.innerHTML = rows.join('');
  setDbTag(bodyEl, 'content');
}

/**
 * Populate digital infrastructure hero banner from WEBSITE_CONTENT.json.
 * Targets: #digi-hero-latency, #digi-hero-4g, #digi-hero-ftth,
 *          #digi-hero-5g, #digi-hero-cables
 */
function populateDigitalInfraHeroes() {
  const store = getStore();
  const hd = store.content?.national?.digitalInfrastructure?.heroDisplay;
  if (!hd) return;

  const entries = [
    { id: 'digi-hero-latency', data: hd.latency },
    { id: 'digi-hero-4g', data: hd.fourGCoverage },
    { id: 'digi-hero-ftth', data: hd.ftthPenetration },
    { id: 'digi-hero-5g', data: hd.fiveGStatus },
    { id: 'digi-hero-cables', data: hd.subseaCables },
  ];

  for (const { id, data } of entries) {
    const el = document.getElementById(id);
    if (!el || !data) continue;
    setStatCardContent(el, data.value, data.label);
  }
}

/**
 * Populate tax incentives cards from WEBSITE_CONTENT.json.
 * Targets: #tax-sifide-body, #tax-techvisa-body, #tax-ifici-body, #tax-irc-body
 */
function populateTaxIncentives() {
  const store = getStore();
  const tax = store.content?.national?.taxIncentives;
  if (!tax) return;

  // SIFIDE II
  const sifide = document.getElementById('tax-sifide-body');
  if (sifide && tax.sifideII) {
    setHtmlAndDb(sifide, `
      <p><strong>R&D Tax Credit:</strong> ${tax.sifideII.value}.</p>
      <p>Eligible costs include ${tax.sifideII.eligibleCosts.toLowerCase()}.</p>
      <p class="scorecard-source">${tax.sifideII.application} via <a href="#src-ani" class="source-link">ANI</a></p>
    `);
  }

  // Tech Visa
  const techvisa = document.getElementById('tax-techvisa-body');
  if (techvisa && tax.techVisa) {
    setHtmlAndDb(techvisa, `
      <p>${tax.techVisa.value}. ${tax.techVisa.detail}</p>
      <p class="scorecard-source">Managed by <a href="#src-iapmei" class="source-link">IAPMEI</a> + AIMA/SEF</p>
    `);
  }

  // IFICI
  const ifici = document.getElementById('tax-ifici-body');
  if (ifici && tax.ifici) {
    setHtmlAndDb(ifici, `
      <p>${tax.ifici.value.replace('20%', '<strong>20%</strong>')} for qualifying research and innovation professionals.</p>
      <p class="scorecard-source">${tax.ifici.detail} <a href="#src-pwc-ifici" class="source-link">Source</a></p>
    `);
  }

  // Corporate Tax (IRC)
  const irc = document.getElementById('tax-irc-body');
  if (irc && tax.corporateTax) {
    const ct = tax.corporateTax;
    const scheduleLine = ct.standardSchedule ? `<p><strong>Rate path:</strong> ${ct.standardSchedule}.</p>` : '';
    const effectiveLine = ct.effectiveFrom ? `<p><strong>Effective:</strong> ${ct.effectiveFrom}.</p>` : '';
    setHtmlAndDb(irc, `
      <p><strong>Standard IRC:</strong> ${ct.standard}% on taxable profit. <strong>SMEs:</strong> ${ct.smeRate}% on the first ${ct.smeThreshold}; ${ct.standard}% thereafter.</p>
      ${scheduleLine}
      ${effectiveLine}
      <p>${ct.surtaxes}.</p>
      <p class="scorecard-source"><a href="#src-pwc-cit-irc" class="source-link">PwC Portugal</a></p>
    `);
  }
}

/**
 * Populate Cost of Living stat heroes from WEBSITE_CONTENT.json.
 * Targets: #col-hero-essentials, #col-hero-utilities, #col-hero-comparison
 */
function populateCostOfLiving() {
  const store = getStore();
  const col = store.content?.national?.costOfLiving;
  if (!col) return;

  const targets = [
    { id: 'col-hero-essentials', value: `€${col.monthlyEssentials?.value}`, label: `Monthly essentials (single, outside Lisbon)`, note: col.monthlyEssentials?.note },
    { id: 'col-hero-utilities', value: `€${col.utilities?.value}`, label: `Utilities (${col.utilities?.includes?.toLowerCase() || 'electricity, water, internet'})` },
    { id: 'col-hero-comparison', value: col.comparisonToEurope?.value, label: col.comparisonToEurope?.label },
  ];

  for (const t of targets) {
    const el = document.getElementById(t.id);
    if (!el) continue;
    setStatCardContent(el, t.value, t.label);
  }
}

/**
 * Populate employer costs in salary table footer from COMPENSATION_DATA.json.
 * Target: #employer-costs-note
 */
function populateEmployerCosts() {
  const comp = getCompensationData();
  if (!comp?.employerCosts) return;

  const el = document.getElementById('employer-costs-note');
  if (!el) return;

  const ss = comp.employerCosts.socialSecurity.employerRate;
  const meal = comp.employerCosts.mealAllowance.cardMax;
  const mealAnnual = Math.round(meal * 220);
  const multiplier = (1 + ss / 100).toFixed(4);

  setHtmlAndDb(
    el,
    `<strong>Note:</strong> <strong>All values are in 12× format</strong> (converted from Portugal's original 14-payment data for international comparison). *Employer Total = Gross annual × ${multiplier} (${ss}% Social Security) + meal allowance (~€${fmt(mealAnnual)}/yr), showing full range from Junior to Lead. Lead/Principal = Senior × 1.12 (40% vs 25% above midpoint). <strong>Source:</strong> <a href="#src-ine" class="source-link">INE</a> + Portuguese employer cost rules.`,
    'compensation'
  );
}

/**
 * Populate workforce stat heroes from WEBSITE_CONTENT.json.
 * Targets: #wf-hero-total, #wf-hero-concentration, #wf-hero-growth
 */
function populateWorkforceHeroes() {
  const store = getStore();
  const wf = store.content?.national?.workforceStatistics;
  if (!wf) return;

  const total = wf.techWorkforceTotal?.official;
  const totalYear = wf.techWorkforceTotal?.year;
  const rank = wf.rankInEU;
  const growth = wf.annualGrowthRate?.value;
  const growthMethod = wf.annualGrowthRate?.method;
  const growthPeriod = wf.annualGrowthRate?.period;

  const rankValue = Number.isFinite(rank?.value) && Number.isFinite(rank?.totalCountries)
    ? `${rank.value}th`
    : '—';
  const growthLabel = growthMethod && growthPeriod
    ? `Annual Growth Rate (${growthMethod} ${growthPeriod})`
    : 'Annual Growth Rate';

  const targets = [
    {
      id: 'wf-hero-total',
      value: total ? `~${fmt(total)}` : '—',
      label: totalYear ? `Total IT Professionals (Eurostat ${totalYear})` : 'Total IT Professionals (Eurostat)'
    },
    {
      id: 'wf-hero-concentration',
      value: rankValue,
      label: rank?.label || 'Biggest IT workforce out of 27 EU countries'
    },
    {
      id: 'wf-hero-growth',
      value: Number.isFinite(growth) ? `~${growth}%` : '—',
      label: growthLabel
    },
  ];

  for (const t of targets) {
    const el = document.getElementById(t.id);
    if (!el) continue;
    setStatCardContent(el, t.value, t.label);
  }
}

/**
 * Populate workforce city breakdown bar chart from WEBSITE_CONTENT.json.
 * Target: #workforce-bar-chart
 */
function populateWorkforceBarChart() {
  const store = getStore();
  const breakdown = store.content?.national?.workforceStatistics?.cityBreakdown;
  const total = store.content?.national?.workforceStatistics?.techWorkforceTotal?.official;
  if (!breakdown || !total) return;

  const container = document.getElementById('workforce-bar-chart');
  if (!container) return;

  // Color classes by tier
  const colorMap = { 0: 'bar-chart-fill-accent', 1: 'bar-chart-fill-accent', 2: 'bar-chart-fill-success', 3: 'bar-chart-fill-success', 4: 'bar-chart-fill-warning' };
  const maxVal = breakdown[0]?.official || 1;

  const rows = breakdown.map((city, i) => {
    const workforce = city.official;
    const pct = Math.round((workforce / total) * 100);
    const width = Math.round((workforce / maxVal) * 100);
    const colorClass = colorMap[i] || 'bar-chart-fill-muted';
    const label = city.city === 'Others' ? `Other ${20 - breakdown.length + 1} Cities` : city.city;

    return `
      <div class="bar-chart-row">
        <div class="bar-chart-header">
          <span class="bar-chart-label">${label}</span>
          <span class="bar-chart-value">~${fmt(workforce)} (${pct}%)</span>
        </div>
        <div class="bar-chart-track"><div class="bar-chart-fill ${colorClass}" data-width="${width}"></div></div>
      </div>`;
  }).join('');

  setHtmlAndDb(container, rows);
}

/**
 * Populate hiring insights cards from WEBSITE_CONTENT.json.
 * Targets: #hiring-time, #hiring-education, #hiring-age, #hiring-retention
 */
function populateHiringInsights() {
  const store = getStore();
  const hi = store.content?.national?.hiringInsights;
  if (!hi) return;

  const targets = [
    { id: 'hiring-time', data: hi.ictShortageSignal, sourceRef: '#src-idc' },
    { id: 'hiring-education', data: hi.ictVacancyRate, sourceRef: '#src-idc' },
    { id: 'hiring-age', data: hi.remoteWorkPenetration, sourceRef: '#src-idc' },
    { id: 'hiring-retention', data: hi.regionalQualificationBaseline, sourceRef: '#src-idc' },
  ];

  for (const t of targets) {
    const el = document.getElementById(t.id);
    if (!el || !t.data?.value) continue;

    const titleEl = el.querySelector('.insight-title');
    const textEl = el.querySelector('.insight-text');
    if (titleEl && t.data.title) {
      const icon = titleEl.querySelector('i')?.outerHTML || '';
      titleEl.innerHTML = `${icon} ${t.data.title}`.trim();
      setDbTag(titleEl, 'content');
    }

    if (textEl) {
      textEl.innerHTML = `${t.data.value} <a href="${t.sourceRef}" class="source-link"><i class="fa-solid fa-circle-info"></i></a>`;
      setDbTag(textEl, 'content');
    }
  }
}

/**
 * Populate Quality of Life & Security cards from WEBSITE_CONTENT.json → qualityOfLife.
 * Targets: #qol-healthcare-public, #qol-healthcare-private, #qol-healthcare-ehci,
 *          #qol-safety-gpi, #qol-safety-crime, #qol-safety-political
 */
function populateQualityOfLife() {
  const store = getStore();
  const qol = store.content?.national?.qualityOfLife;
  if (!qol) return;

  const pub = qol.healthcare?.publicSystem;
  if (pub) {
    setHtmlAndDbById('qol-healthcare-public', `<strong>Public (${pub.name}):</strong> ${pub.description}`);
  }

  const priv = qol.healthcare?.privateInsurance;
  if (priv) {
    setHtmlAndDbById('qol-healthcare-private', `<strong>Private:</strong> ${priv.costRange} — ${priv.details}`);
  }

  const ehci = qol.healthcare?.ehci;
  if (ehci) {
    setHtmlAndDbById(
      'qol-healthcare-ehci',
      `<strong><a href="#src-ehci" class="source-link">${ehci.source}</a>:</strong> Ranked ${ehci.rank}th / ${ehci.totalCountries} ${ehci.label} (${ehci.year})`
    );
  }

  const gpi = qol.safety?.gpi;
  if (gpi) {
    setHtmlAndDbById(
      'qol-safety-gpi',
      `<strong><a href="#src-gpi" class="source-link">Global Peace Index</a>:</strong> ${gpi.rank}th ${gpi.label} (${gpi.year})`
    );
  }

  const crime = qol.safety?.crimeRate;
  if (crime) {
    setHtmlAndDbById(
      'qol-safety-crime',
      `<strong>Crime:</strong> ${crime.value} — ${crime.detail} <a href="#src-eurostat" class="source-link"><i class="fa-solid fa-circle-info"></i></a>`
    );
  }

  const pol = qol.safety?.political;
  if (pol) {
    setHtmlAndDbById(
      'qol-safety-political',
      `<strong>Political:</strong> ${pol.description}; EU member since ${pol.euMemberSince}, NATO since ${pol.natoMemberSince}`
    );
  }
}

/**
 * Master populate: runs all population passes in sequence.
 * Call once after databases are loaded and rendering is complete.
 */
export function populateAll() {
  populateDbValues();
  populateMethodology();
  populateINETable();
  populateSalaryTable();
  populateTechStackPremiums();
  renderFactCheckCards();
  renderSectionScoreCards();
  populateCityTags();
  populateSectionConfidence();
  populateTocConfidence();
  // National content renderers (previously hardcoded)
  populateMacroComparisonTable();
  populateDigitalInfraHeroes();
  populateTaxIncentives();
  populateCostOfLiving();
  populateEmployerCosts();
  populateWorkforceHeroes();
  populateWorkforceBarChart();
  populateHiringInsights();
  populateQualityOfLife();
}


