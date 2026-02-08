/**
 * CITY TABLE MODULE
 * Renders the city database table from MASTER.json data.
 * Groups cities by NUTS II region with summary rows.
 */

import { getStore, getCityDisplayOrder, getRegionOrder, getRegionalTotals, getCity } from './database.js';
import { calculateICTPct, formatNumber, formatRange } from './calculations.js';

/**
 * Get the region for a given city ID.
 * @param {string} cityId
 * @returns {string}
 */
function getCityRegion(cityId) {
  const city = getCity(cityId);
  return city?.basic?.region?.value ?? 'Unknown';
}

/**
 * Extract display-ready values for a city row.
 * @param {Object} city — city entry from MASTER.json
 * @returns {Object}
 */
function extractCityRowData(city) {
  const talent = city.talent || {};
  const costs = city.costs || {};
  const grads = talent.graduates || {};

  const stemValue = grads.digitalStemPlus?.value ?? grads.officialStem?.value ?? null;
  const ictValue = grads.coreICT?.value ?? null;
  const officialStem = grads.officialStem?.value ?? null;

  return {
    name: city.basic?.name?.value ?? city.basic?.id ?? '—',
    id: city.basic?.id ?? '',
    featured: city.basic?.featured ?? false,
    universities: talent.universities?.value?.join(', ') ?? '—',
    officialStem,
    officialStemApprox: grads.officialStem?.approximate === true,
    stemPlus: stemValue,
    ict: ictValue,
    ictApprox: grads.coreICT?.approximate === true,
    ictPct: officialStem && ictValue ? calculateICTPct(ictValue, officialStem) : '—',
    salaryIndex: costs.salaryIndex?.value ?? '—',
    officeRent: costs.officeRent ? formatRange(costs.officeRent.min, costs.officeRent.max, '€') : '—',
    residentialRent: costs.residentialRent ? formatRange(costs.residentialRent.min, costs.residentialRent.max, '€') : '—',
    colIndex: costs.colIndex?.value ?? '—',
  };
}

/**
 * Create a city data row <tr>.
 * Columns: City, Universities, Official STEM, ICT, ICT %, STEM+, Salary, Office, Res Rent, COL
 * @param {Object} rowData
 * @returns {HTMLTableRowElement}
 */
function createCityRow(rowData) {
  const tr = document.createElement('tr');
  tr.dataset.city = rowData.id;
  tr.dataset.db = 'master';  // Mark as MASTER.json source

  // City name
  const nameCell = document.createElement('td');
  nameCell.classList.add('city-name-cell');
  if (rowData.featured) {
    const link = document.createElement('a');
    link.href = `#${rowData.id}`;
    link.textContent = rowData.name;
    nameCell.appendChild(link);
    const star = document.createElement('a');
    star.href = '#src-digital-stemplus';
    star.classList.add('city-featured-star');
    star.textContent = '★';
    star.title = 'Featured city — see methodology';
    nameCell.appendChild(star);
  } else {
    nameCell.textContent = rowData.name;
  }
  tr.appendChild(nameCell);

  // Universities
  const uniCell = document.createElement('td');
  uniCell.classList.add('university-cell');
  uniCell.textContent = rowData.universities;
  tr.appendChild(uniCell);

  // Official STEM (red text) — prompt-core: city generators
  const officialStemCell = document.createElement('td');
  officialStemCell.classList.add('col-numeric', 'col-stem-official');
  officialStemCell.dataset.promptCore = 'true';
  if (rowData.officialStem != null) {
    officialStemCell.textContent = formatNumber(rowData.officialStem);
    if (rowData.officialStemApprox) {
      officialStemCell.title = 'Estimate — proportional share of official DGEEC regional total';
      officialStemCell.classList.add('approximate-value');
    }
  } else {
    officialStemCell.textContent = '—';
  }
  tr.appendChild(officialStemCell);

  // ICT — prompt-core: city generators
  const ictCell = document.createElement('td');
  ictCell.classList.add('col-numeric', 'col-ict');
  ictCell.dataset.promptCore = 'true';
  if (rowData.ict != null) {
    ictCell.textContent = formatNumber(rowData.ict);
    if (rowData.ictApprox) {
      ictCell.title = 'Estimate — proportional share of official DGEEC regional total';
      ictCell.classList.add('approximate-value');
    }
  } else {
    ictCell.textContent = '—';
  }
  tr.appendChild(ictCell);

  // ICT % — derived, NOT in prompts directly
  const ictPctCell = document.createElement('td');
  ictPctCell.classList.add('col-numeric', 'col-ict');
  ictPctCell.dataset.field = 'ict-pct';
  if (rowData.ictPct !== '—') {
    ictPctCell.textContent = `${rowData.ictPct}%`;
    ictPctCell.title = 'Auto-calculated: (Core ICT ÷ Official STEM) × 100';
  } else {
    ictPctCell.textContent = '—';
  }
  tr.appendChild(ictPctCell);

  // Digital STEM+ — internal calc, always approximate (≈)
  const stemCell = document.createElement('td');
  stemCell.classList.add('col-numeric', 'col-stemplus', 'approximate-value');
  if (rowData.stemPlus != null) {
    stemCell.textContent = formatNumber(rowData.stemPlus);
    stemCell.title = 'Estimate — Official STEM × 1.27 (INCoDe.2030 expansion factor)';
  } else {
    stemCell.textContent = '—';
  }
  tr.appendChild(stemCell);

  // Salary Index — prompt-core: city generators
  const salaryCell = document.createElement('td');
  salaryCell.classList.add('col-numeric');
  salaryCell.dataset.field = 'salary-index';
  salaryCell.dataset.promptCore = 'true';
  salaryCell.textContent = rowData.salaryIndex !== '—' ? rowData.salaryIndex : '—';
  salaryCell.title = 'Auto-calculated: INE regional wages ÷ Lisbon baseline, COL-adjusted';
  tr.appendChild(salaryCell);

  // Office Rent — prompt-core: rent generators + city generators
  const officeCell = document.createElement('td');
  officeCell.classList.add('col-numeric');
  officeCell.dataset.promptCore = 'true';
  officeCell.textContent = rowData.officeRent;
  officeCell.title = 'Derived from multiple sources: Cushman & Wakefield, JLL Portugal, Idealista — AI fact-checked';
  tr.appendChild(officeCell);

  // Residential Rent — prompt-core: rent generators + city generators
  const resCell = document.createElement('td');
  resCell.classList.add('col-numeric');
  resCell.dataset.promptCore = 'true';
  resCell.textContent = rowData.residentialRent;
  resCell.title = 'Derived from multiple sources: Idealista, Numbeo, C&W, JLL — 1-bedroom ~50 m², city center — AI fact-checked';
  tr.appendChild(resCell);

  // COL Index — prompt-core: city generators
  const colCell = document.createElement('td');
  colCell.classList.add('col-numeric');
  colCell.dataset.promptCore = 'true';
  colCell.textContent = rowData.colIndex;
  colCell.title = 'Source: Numbeo COL + Rent Index (NYC = 100). Where unavailable, Numbeo-style estimate — AI fact-checked';
  tr.appendChild(colCell);

  return tr;
}

/**
 * Create a region header row.
 * @param {string} regionName
 * @returns {HTMLTableRowElement}
 */
function createRegionHeaderRow(regionName) {
  const tr = document.createElement('tr');
  tr.classList.add('region-header-row');
  const td = document.createElement('td');
  td.colSpan = 10;
  td.textContent = regionName;
  tr.appendChild(td);
  return tr;
}

/**
 * Create a region summary row with totals + DGEEC source link.
 * Columns: name, uni(blank), officialStem, ict, ictPct, stemPlus, salary(blank), office(blank), res(blank), col(blank)
 * @param {string} regionName
 * @param {Object} totals — from regionalTotals
 * @returns {HTMLTableRowElement}
 */
function createRegionSummaryRow(regionName, totals) {
  const tr = document.createElement('tr');
  tr.classList.add('region-summary-row');

  // Name + DGEEC link (* = full-region DGEEC total, not sum of listed cities)
  const nameCell = document.createElement('td');
  nameCell.colSpan = 2;
  nameCell.innerHTML = `<strong>${regionName} Total</strong> <a href="https://estatisticas-educacao.dgeec.medu.pt/" target="_blank" rel="noopener" class="dgeec-source-link" title="* Full NUTS II region totals from DGEEC — includes all HEIs in region, not only the cities listed above">Official DGEEC 23/24 *</a>`;
  tr.appendChild(nameCell);

  // Official STEM total (* = official DGEEC region-wide figure)
  const officialStemCell = document.createElement('td');
  officialStemCell.classList.add('col-numeric', 'col-stem-official');
  officialStemCell.dataset.promptCore = 'true';
  officialStemCell.title = 'Full NUTS II region total (DGEEC) — includes all HEIs, not only listed cities';
  officialStemCell.textContent = totals?.officialStem != null ? `${formatNumber(totals.officialStem)}*` : '—';
  tr.appendChild(officialStemCell);

  // ICT total (* = official DGEEC region-wide figure)
  const ictCell = document.createElement('td');
  ictCell.classList.add('col-numeric', 'col-ict');
  ictCell.dataset.promptCore = 'true';
  ictCell.title = 'Full NUTS II region total (DGEEC) — includes all HEIs, not only listed cities';
  ictCell.textContent = totals?.coreICT != null ? `${formatNumber(totals.coreICT)}*` : '—';
  tr.appendChild(ictCell);

  // ICT %
  const ictPctCell = document.createElement('td');
  ictPctCell.classList.add('col-numeric', 'col-ict');
  if (totals?.coreICT && totals?.officialStem) {
    ictPctCell.textContent = `${calculateICTPct(totals.coreICT, totals.officialStem)}%`;
    ictPctCell.title = 'Auto-calculated: (Core ICT ÷ Official STEM) × 100';
  } else {
    ictPctCell.textContent = '—';
  }
  tr.appendChild(ictPctCell);

  // Digital STEM+ total — always approximate
  const stemCell = document.createElement('td');
  stemCell.classList.add('col-numeric', 'col-stemplus', 'approximate-value');
  if (totals?.digitalStemPlus != null) {
    stemCell.textContent = formatNumber(totals.digitalStemPlus);
    stemCell.title = 'Estimate — sum of city estimates (Official STEM × 1.27 INCoDe.2030 factor)';
  } else {
    stemCell.textContent = '—';
  }
  tr.appendChild(stemCell);

  // Empty cells for salary, office, residential, COL
  for (let i = 0; i < 4; i++) {
    tr.appendChild(document.createElement('td'));
  }

  return tr;
}

/**
 * Create grand totals row at the bottom.
 * Includes IDs for contentRenderer to populate.
 * @param {Object} allRegionalTotals
 * @returns {HTMLTableRowElement}
 */
function createGrandTotalsRow(allRegionalTotals) {
  const tr = document.createElement('tr');
  tr.classList.add('grand-totals-row');
  tr.dataset.city = 'totals';

  let totalOfficialStem = 0;
  let totalICT = 0;
  let totalStemPlus = 0;

  for (const [, totals] of Object.entries(allRegionalTotals)) {
    totalOfficialStem += totals.officialStem ?? 0;
    totalICT += totals.coreICT ?? 0;
    totalStemPlus += totals.digitalStemPlus ?? 0;
  }

  // Name
  const nameCell = document.createElement('td');
  nameCell.colSpan = 2;
  nameCell.innerHTML = '<strong>TOTAL (20 Cities)</strong>';
  tr.appendChild(nameCell);

  // Official STEM
  const officialStemCell = document.createElement('td');
  officialStemCell.classList.add('col-numeric', 'col-stem-official');
  officialStemCell.id = 'total-official-stem';
  officialStemCell.textContent = formatNumber(totalOfficialStem);
  officialStemCell.title = 'Sum of official DGEEC regional totals (CNAEF 04+05+06+07+72)';
  tr.appendChild(officialStemCell);

  // ICT
  const ictCell = document.createElement('td');
  ictCell.classList.add('col-numeric', 'col-ict');
  ictCell.id = 'total-ict-grads';
  ictCell.textContent = formatNumber(totalICT);
  ictCell.title = 'Sum of official DGEEC regional totals (CNAEF 481+523)';
  tr.appendChild(ictCell);

  // ICT %
  const ictPctCell = document.createElement('td');
  ictPctCell.classList.add('col-numeric', 'col-ict');
  ictPctCell.textContent = 'N/A';
  tr.appendChild(ictPctCell);

  // STEM+ — always approximate
  const stemCell = document.createElement('td');
  stemCell.classList.add('col-numeric', 'col-stemplus', 'approximate-value');
  stemCell.id = 'total-stem-grads';
  stemCell.textContent = formatNumber(totalStemPlus);
  stemCell.title = 'Estimate — sum of all Digital STEM+ estimates (Official STEM × 1.27)';
  tr.appendChild(stemCell);

  // Salary — N/A
  const salaryCell = document.createElement('td');
  salaryCell.classList.add('col-numeric');
  salaryCell.textContent = 'N/A';
  tr.appendChild(salaryCell);

  // Empty cells for office, residential, COL
  for (let i = 0; i < 3; i++) {
    tr.appendChild(document.createElement('td'));
  }

  return tr;
}

/**
 * Render the full city database table.
 * Groups cities by NUTS II region with header and summary rows.
 */
export function renderCityTable() {
  const tbody = document.getElementById('city-db-body');
  if (!tbody) return;

  const displayOrder = getCityDisplayOrder();
  const regionOrder = getRegionOrder();

  // Group cities by region
  const cityRegions = new Map();
  for (const cityId of displayOrder) {
    const region = getCityRegion(cityId);
    if (!cityRegions.has(region)) {
      cityRegions.set(region, []);
    }
    cityRegions.get(region).push(cityId);
  }

  // Build table in region order
  const fragment = document.createDocumentFragment();

  for (const region of regionOrder) {
    const cities = cityRegions.get(region);
    if (!cities || cities.length === 0) continue;

    // Region header
    fragment.appendChild(createRegionHeaderRow(region));

    // City rows
    for (const cityId of cities) {
      const city = getCity(cityId);
      if (!city) continue;

      const rowData = extractCityRowData(city);
      fragment.appendChild(createCityRow(rowData));
    }

    // Region summary
    const totals = getRegionalTotals(region);
    if (totals) {
      fragment.appendChild(createRegionSummaryRow(region, totals));
    }
  }

  // Grand totals row at bottom
  const store = getStore();
  const allRegionalTotals = store.master?.regionalTotals || {};
  fragment.appendChild(createGrandTotalsRow(allRegionalTotals));

  tbody.innerHTML = '';
  tbody.appendChild(fragment);
}
