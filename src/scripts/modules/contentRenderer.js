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
  const regionalTotals = store.master?.regionalTotals || {};
  let totalStem = 0;
  let totalICT = 0;

  for (const totals of Object.values(regionalTotals)) {
    totalStem += totals?.digitalStemPlus ?? 0;
    totalICT += totals?.coreICT ?? 0;
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
    cardStem.textContent = `~${fmt(totalStem)}/year (2026 gross est.)`;
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
    titleEl.setAttribute('data-db', 'content');
  }

  if (subtitleEl && table.subtitle) {
    subtitleEl.textContent = table.subtitle;
    subtitleEl.setAttribute('data-db', 'content');
  }

  if (noteEl && table.naNote) {
    noteEl.textContent = table.naNote;
    noteEl.setAttribute('data-db', 'content');
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
  bodyEl.setAttribute('data-db', 'content');

  function fmtCountryValue(value, year, formatType) {
    const formatted = formatMacroValue(value, formatType);
    return `
      <span class="macro-country-value">${formatted}</span>
      <div class="macro-country-year">(${year || 'n/a'})</div>
    `;
  }

  function formatMacroValue(value, formatType) {
    if (value === null || value === undefined) return 'N/A';

    if (formatType === 'percent') return `${Number(value).toFixed(1)}%`;
    if (formatType === 'currency') return `€${fmt(Math.round(value))}`;
    if (formatType === 'currency-decimal') return `€${Number(value).toFixed(1)}`;
    if (formatType === 'integer') return fmt(Math.round(value));

    return String(value);
  }
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
    const valEl = el.querySelector('.stat-value');
    const lblEl = el.querySelector('.stat-label');
    if (valEl) { valEl.textContent = data.value; valEl.setAttribute('data-db', 'content'); }
    if (lblEl) { lblEl.textContent = data.label; lblEl.setAttribute('data-db', 'content'); }
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
    sifide.innerHTML = `
      <p><strong>R&D Tax Credit:</strong> ${tax.sifideII.value}.</p>
      <p>Eligible costs include ${tax.sifideII.eligibleCosts.toLowerCase()}.</p>
      <p class="scorecard-source">${tax.sifideII.application} via <a href="#src-ani" class="source-link">ANI</a></p>
    `;
    sifide.setAttribute('data-db', 'content');
  }

  // Tech Visa
  const techvisa = document.getElementById('tax-techvisa-body');
  if (techvisa && tax.techVisa) {
    techvisa.innerHTML = `
      <p>${tax.techVisa.value}. ${tax.techVisa.detail}</p>
      <p class="scorecard-source">Managed by <a href="#src-iapmei" class="source-link">IAPMEI</a> + AIMA/SEF</p>
    `;
    techvisa.setAttribute('data-db', 'content');
  }

  // IFICI
  const ifici = document.getElementById('tax-ifici-body');
  if (ifici && tax.ifici) {
    ifici.innerHTML = `
      <p>${tax.ifici.value.replace('20%', '<strong>20%</strong>')} for qualifying research and innovation professionals.</p>
      <p class="scorecard-source">${tax.ifici.detail} <a href="#src-pwc-ifici" class="source-link">Source</a></p>
    `;
    ifici.setAttribute('data-db', 'content');
  }

  // Corporate Tax (IRC)
  const irc = document.getElementById('tax-irc-body');
  if (irc && tax.corporateTax) {
    const ct = tax.corporateTax;
    const scheduleLine = ct.standardSchedule ? `<p><strong>Rate path:</strong> ${ct.standardSchedule}.</p>` : '';
    const effectiveLine = ct.effectiveFrom ? `<p><strong>Effective:</strong> ${ct.effectiveFrom}.</p>` : '';
    irc.innerHTML = `
      <p><strong>Standard IRC:</strong> ${ct.standard}% on taxable profit. <strong>SMEs:</strong> ${ct.smeRate}% on the first ${ct.smeThreshold}; ${ct.standard}% thereafter.</p>
      ${scheduleLine}
      ${effectiveLine}
      <p>${ct.surtaxes}.</p>
      <p class="scorecard-source"><a href="#src-pwc-cit-irc" class="source-link">PwC Portugal</a></p>
    `;
    irc.setAttribute('data-db', 'content');
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
    const valEl = el.querySelector('.stat-value');
    const lblEl = el.querySelector('.stat-label');
    if (valEl) { valEl.textContent = t.value; valEl.setAttribute('data-db', 'content'); }
    if (lblEl) { lblEl.textContent = t.label; lblEl.setAttribute('data-db', 'content'); }
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

  el.innerHTML = `<strong>Note:</strong> <strong>All values are in 12× format</strong> (converted from Portugal's original 14-payment data for international comparison). *Employer Total = Gross annual × ${multiplier} (${ss}% Social Security) + meal allowance (~€${fmt(mealAnnual)}/yr), showing full range from Junior to Lead. Lead/Principal = Senior × 1.12 (40% vs 25% above midpoint). <strong>Source:</strong> <a href="#src-ine" class="source-link">INE</a> + Portuguese employer cost rules.`;
  el.setAttribute('data-db', 'compensation');
}

/**
 * Populate workforce stat heroes from WEBSITE_CONTENT.json.
 * Targets: #wf-hero-total, #wf-hero-concentration, #wf-hero-growth
 */
function populateWorkforceHeroes() {
  const store = getStore();
  const wf = store.content?.national?.workforceStatistics;
  if (!wf) return;

  const total = wf.techWorkforceTotal?.linkedin;
  const concentration = wf.concentration;
  const growth = wf.annualGrowthRate?.value;

  const targets = [
    { id: 'wf-hero-total', value: total ? `~${fmt(total)}` : '—', label: 'Total IT Professionals (LinkedIn)' },
    { id: 'wf-hero-concentration', value: concentration || '—', label: 'Lisbon + Porto Concentration' },
    { id: 'wf-hero-growth', value: growth ? `~${growth}%` : '—', label: 'Annual Growth Rate' },
  ];

  for (const t of targets) {
    const el = document.getElementById(t.id);
    if (!el) continue;
    const valEl = el.querySelector('.stat-value');
    const lblEl = el.querySelector('.stat-label');
    if (valEl) { valEl.textContent = t.value; valEl.setAttribute('data-db', 'content'); }
    if (lblEl) { lblEl.textContent = t.label; lblEl.setAttribute('data-db', 'content'); }
  }
}

/**
 * Populate workforce city breakdown bar chart from WEBSITE_CONTENT.json.
 * Target: #workforce-bar-chart
 */
function populateWorkforceBarChart() {
  const store = getStore();
  const breakdown = store.content?.national?.workforceStatistics?.cityBreakdown;
  const total = store.content?.national?.workforceStatistics?.techWorkforceTotal?.linkedin;
  if (!breakdown || !total) return;

  const container = document.getElementById('workforce-bar-chart');
  if (!container) return;

  // Color classes by tier
  const colorMap = { 0: 'bar-chart-fill-accent', 1: 'bar-chart-fill-accent', 2: 'bar-chart-fill-success', 3: 'bar-chart-fill-success', 4: 'bar-chart-fill-warning' };
  const maxVal = breakdown[0]?.linkedin || 1;

  const rows = breakdown.map((city, i) => {
    const pct = Math.round((city.linkedin / total) * 100);
    const width = Math.round((city.linkedin / maxVal) * 100);
    const colorClass = colorMap[i] || 'bar-chart-fill-muted';
    const label = city.city === 'Others' ? `Other ${20 - breakdown.length + 1} Cities` : city.city;

    return `
      <div class="bar-chart-row">
        <div class="bar-chart-header">
          <span class="bar-chart-label">${label}</span>
          <span class="bar-chart-value">~${fmt(city.linkedin)} (${pct}%)</span>
        </div>
        <div class="bar-chart-track"><div class="bar-chart-fill ${colorClass}" data-width="${width}"></div></div>
      </div>`;
  }).join('');

  container.innerHTML = rows;
  container.setAttribute('data-db', 'content');
}

/**
 * Populate EU Context section from WEBSITE_CONTENT.json.
 * Target: #eu-context-position, #eu-context-benchmarks
 */
function populateEUContext() {
  const store = getStore();
  const eu = store.content?.national?.euContext;
  if (!eu) return;

  // Portugal's Position
  const posEl = document.getElementById('eu-context-position');
  if (posEl && eu.portugalsPosition) {
    const p = eu.portugalsPosition;
    posEl.innerHTML = `
      <p><strong>Portugal's Position:</strong></p>
      <ul>
        <li><strong>ICT specialists as % of employment:</strong> ${p.ictSpecialistsPctEmployment.value}% (${p.ictSpecialistsPctEmployment.year}) — EU avg ${p.ictSpecialistsPctEmployment.euAvg}% <a href="#src-eurostat" class="source-link"><i class="fa-solid fa-circle-info"></i></a></li>
        <li><strong>ICT graduates as % of all graduates:</strong> ${p.ictGraduatesPctAllGraduates.value}% — EU avg ${p.ictGraduatesPctAllGraduates.euAvg}% <a href="#src-eu-monitor" class="source-link"><i class="fa-solid fa-circle-info"></i></a></li>
        <li><strong>Female ICT specialists:</strong> ${p.femaleIctSpecialists.value}% — EU avg ${p.femaleIctSpecialists.euAvg}% <a href="#src-eurostat" class="source-link"><i class="fa-solid fa-circle-info"></i></a></li>
        <li><strong>Trend:</strong> Growing faster than EU average (${p.trend.value}) <a href="#src-eurostat" class="source-link"><i class="fa-solid fa-circle-info"></i></a></li>
      </ul>
    `;
    posEl.setAttribute('data-db', 'content');
  }

  // Competitive Benchmarks
  const benchEl = document.getElementById('eu-context-benchmarks');
  if (benchEl && eu.competitiveBenchmarks) {
    const b = eu.competitiveBenchmarks;
    benchEl.innerHTML = `
      <p><strong>Competitive Benchmarks:</strong></p>
      <ul>
        <li><strong>Romania:</strong> ${b.romania.value}</li>
        <li><strong>Poland:</strong> ${b.poland.value}</li>
        <li><strong>Spain:</strong> ${b.spain.value}</li>
        <li><strong>Portugal advantage:</strong> ${b.portugalAdvantage.value}</li>
      </ul>
    `;
    benchEl.setAttribute('data-db', 'content');
  }
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
    { id: 'hiring-time', text: hi.timeToHire?.value, sourceRef: '#src-idc' },
    { id: 'hiring-education', text: hi.educationLevel?.value, sourceRef: '#src-idc' },
    { id: 'hiring-age', text: hi.ageDistribution?.value, sourceRef: '#src-idc' },
    { id: 'hiring-retention', text: hi.retention?.value, sourceRef: '#src-idc' },
  ];

  for (const t of targets) {
    const el = document.getElementById(t.id);
    if (!el || !t.text) continue;
    const textEl = el.querySelector('.insight-text');
    if (textEl) {
      textEl.innerHTML = `${t.text} <a href="${t.sourceRef}" class="source-link"><i class="fa-solid fa-circle-info"></i></a>`;
      textEl.setAttribute('data-db', 'content');
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

  // Healthcare
  const pub = qol.healthcare?.publicSystem;
  if (pub) {
    const el = document.getElementById('qol-healthcare-public');
    if (el) {
      el.innerHTML = `<strong>Public (${pub.name}):</strong> ${pub.description}`;
      el.setAttribute('data-db', 'content');
    }
  }

  const priv = qol.healthcare?.privateInsurance;
  if (priv) {
    const el = document.getElementById('qol-healthcare-private');
    if (el) {
      el.innerHTML = `<strong>Private:</strong> ${priv.costRange} — ${priv.details}`;
      el.setAttribute('data-db', 'content');
    }
  }

  const ehci = qol.healthcare?.ehci;
  if (ehci) {
    const el = document.getElementById('qol-healthcare-ehci');
    if (el) {
      el.innerHTML = `<strong><a href="#src-ehci" class="source-link">${ehci.source}</a>:</strong> Ranked ${ehci.rank}th / ${ehci.totalCountries} ${ehci.label} (${ehci.year})`;
      el.setAttribute('data-db', 'content');
    }
  }

  // Safety
  const gpi = qol.safety?.gpi;
  if (gpi) {
    const el = document.getElementById('qol-safety-gpi');
    if (el) {
      el.innerHTML = `<strong><a href="#src-gpi" class="source-link">Global Peace Index</a>:</strong> ${gpi.rank}th ${gpi.label} (${gpi.year})`;
      el.setAttribute('data-db', 'content');
    }
  }

  const crime = qol.safety?.crimeRate;
  if (crime) {
    const el = document.getElementById('qol-safety-crime');
    if (el) {
      el.innerHTML = `<strong>Crime:</strong> ${crime.value} — ${crime.detail} <a href="#src-eurostat" class="source-link"><i class="fa-solid fa-circle-info"></i></a>`;
      el.setAttribute('data-db', 'content');
    }
  }

  const pol = qol.safety?.political;
  if (pol) {
    const el = document.getElementById('qol-safety-political');
    if (el) {
      el.innerHTML = `<strong>Political:</strong> ${pol.description}; EU member since ${pol.euMemberSince}, NATO since ${pol.natoMemberSince}`;
      el.setAttribute('data-db', 'content');
    }
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
  populateEUContext();
  populateHiringInsights();
  populateQualityOfLife();
}
