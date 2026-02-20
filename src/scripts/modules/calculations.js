/**
 * CALCULATIONS MODULE
 * Graduate metrics (3-tier), salary index, and ICT percentage calculations.
 *
 * CRITICAL: ICT % uses officialStem as denominator, NOT Tech STEM+.
 * Formula: (coreICT / officialStem) × 100
 */

// NOTE: officialStem/coreICT remain source values from MASTER.json.
// Tech STEM+ is re-derived at runtime from regional totals to avoid stale city allocations.

/**
 * Allocate an integer regional total across cities by weight while preserving exact total.
 * Uses largest-remainder apportionment for deterministic rounding.
 *
 * @param {number} total
 * @param {number[]} weights
 * @returns {number[]}
 */
function allocateIntegerByWeight(total, weights) {
  const safeTotal = Number.isFinite(total) && total > 0 ? Math.round(total) : 0;
  if (safeTotal === 0 || !Array.isArray(weights) || weights.length === 0) return [];

  const safeWeights = weights.map(w => (Number.isFinite(w) && w > 0 ? w : 0));
  const weightSum = safeWeights.reduce((sum, w) => sum + w, 0);
  if (weightSum <= 0) return new Array(weights.length).fill(0);

  const raw = safeWeights.map(w => (w / weightSum) * safeTotal);
  const base = raw.map(v => Math.floor(v));
  let remainder = safeTotal - base.reduce((sum, v) => sum + v, 0);

  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v), weight: safeWeights[i] }))
    .sort((a, b) => {
      if (b.frac !== a.frac) return b.frac - a.frac;
      if (b.weight !== a.weight) return b.weight - a.weight;
      return a.i - b.i;
    });

  let cursor = 0;
  while (remainder > 0 && order.length > 0) {
    base[order[cursor % order.length].i] += 1;
    remainder -= 1;
    cursor += 1;
  }

  return base;
}

/**
 * Auto-compute city Tech STEM+ values from regional totals using city official STEM
 * as apportionment weights, then refresh pctOfDigitalStem for each city.
 *
 * This prevents stale city-level Tech STEM+ values when regional allocations change.
 *
 * @param {Object} master — MASTER.json
 */
export function computeAllTechStemPlus(master) {
  const cities = master?.cities;
  const regionalTotals = master?.regionalTotals;
  if (!cities || !regionalTotals) {
    console.warn('computeAllTechStemPlus: missing cities/regionalTotals, skipping');
    return;
  }

  const cityEntries = Object.entries(cities);

  for (const [region, totals] of Object.entries(regionalTotals)) {
    const regionTotal = totals?.digitalStemPlus;
    if (!Number.isFinite(regionTotal)) continue;

    const regionCities = cityEntries
      .map(([cityId, city]) => ({ cityId, city }))
      .filter(({ city }) => city?.basic?.region?.value === region);

    if (regionCities.length === 0) continue;

    const weights = regionCities.map(({ city }) => city?.talent?.graduates?.officialStem?.value ?? 0);
    const allocated = allocateIntegerByWeight(regionTotal, weights);

    regionCities.forEach(({ city }, idx) => {
      const grads = city?.talent?.graduates;
      if (!grads) return;

      if (!grads.digitalStemPlus) grads.digitalStemPlus = { value: 0 };
      grads.digitalStemPlus.value = allocated[idx] ?? 0;
      grads.digitalStemPlus.approximate = true;

      const coreICT = grads.coreICT?.value;
      const stemPlus = grads.digitalStemPlus?.value;
      if (Number.isFinite(coreICT) && Number.isFinite(stemPlus) && stemPlus > 0) {
        const pct = Math.round((coreICT / stemPlus) * 1000) / 10;
        if (!grads.coreICT.pctOfDigitalStem) grads.coreICT.pctOfDigitalStem = { value: pct };
        grads.coreICT.pctOfDigitalStem.value = pct;
      }
    });
  }
}

/**
 * Calculate ICT % for the table display.
 * ⚠️ CRITICAL: Uses officialStem as denominator, matching legacy behavior.
 * Legacy formula (app.js line 553): ict / officialStemGrads × 100
 *
 * @param {number} coreICT
 * @param {number} officialStem — NOT Tech STEM+
 * @returns {string} — formatted to 1 decimal place
 */
export function calculateICTPct(coreICT, officialStem) {
  if (!officialStem || officialStem === 0) return '—';
  return ((coreICT / officialStem) * 100).toFixed(1);
}

/**
 * Calculate salary index from regional baseline and COL + Rent index.
 * Formula: baseline × (1 + max(COL − 30, 0) × 1.77 / 100), capped at 100
 *
 * Calculate salary index from INE regional baseline and city COL index.
 *
 * Two-step formula:
 *   1. IT Convergence: compresses INE all-sector baseline toward 100,
 *      reflecting that IT salaries vary less between regions than the
 *      all-sector average (remote work, national competition).
 *        compressed = baseline + (100 − baseline) × IT_CONVERGENCE
 *
 *   2. COL Adjustment: shifts up/down based on local cost of living
 *      relative to the national average.
 *        salaryIndex = compressed + (COL − NATIONAL_COL_AVG) × COL_SENSITIVITY
 *
 * Capped at 100 (Lisbon = 100 by definition).
 *
 * Parameters (tuned so Porto ≈ 92, all cities ≥ 81):
 *   IT_CONVERGENCE  = 0.45  — 45% compression toward national parity
 *   NATIONAL_COL_AVG = 33   — Numbeo national average COL (NYC = 100)
 *   COL_SENSITIVITY  = 0.65 — each COL point above/below avg → ±0.65
 *
 * @param {number} regionalBaseline — INE Bachelor % vs Lisbon (e.g. 77.0 for Norte)
 * @param {number} colIndex — Numbeo Cost-of-Living index (NYC = 100)
 * @returns {number} — salary index (Lisbon = 100)
 */
export function calculateSalaryIndex(regionalBaseline, colIndex) {
  const IT_CONVERGENCE = 0.45;
  const NATIONAL_COL_AVG = 33;
  const COL_SENSITIVITY = 0.65;

  const compressed = regionalBaseline + (100 - regionalBaseline) * IT_CONVERGENCE;
  const adjusted = compressed + (colIndex - NATIONAL_COL_AVG) * COL_SENSITIVITY;
  return Math.min(Math.round(adjusted * 10) / 10, 100.0);
}

/**
 * Auto-compute salary indices for ALL cities using INE baselines + COL.
 * Reads INE region → city mapping from COMPENSATION_DATA.json,
 * reads each city's colIndex from MASTER.json,
 * writes computed salaryIndex back into the in-memory city objects.
 *
 * Call once after loadDatabases() and before any rendering.
 *
 * @param {Object} master — MASTER.json (cities, config, etc.)
 * @param {Object} compensation — COMPENSATION_DATA.json
 */
export function computeAllSalaryIndices(master, compensation) {
  const ine = compensation?.ineRegionalEarnings;
  if (!ine?.regions || !ine?.regionToCityMapping) {
    console.warn('computeAllSalaryIndices: missing INE data, skipping');
    return;
  }

  const lisbonBachelor = ine.regions[ine.lisbonBaselineRegion]?.[ine.lisbonBaselineField];
  if (!lisbonBachelor || lisbonBachelor <= 0) {
    console.warn('computeAllSalaryIndices: invalid Lisbon baseline');
    return;
  }

  // Build region → baseline % lookup
  const regionBaselines = {};
  for (const [regionKey, regionData] of Object.entries(ine.regions)) {
    const bachelor = regionData[ine.lisbonBaselineField];
    if (bachelor != null) {
      regionBaselines[regionKey] = (bachelor / lisbonBachelor) * 100;
    }
  }

  // Iterate mapping and compute each city's salary index
  for (const [regionKey, cityIds] of Object.entries(ine.regionToCityMapping)) {
    const baseline = regionBaselines[regionKey];
    if (baseline == null) continue;

    for (const cityId of cityIds) {
      const city = master?.cities?.[cityId];
      if (!city?.costs?.colIndex?.value) continue;

      const col = city.costs.colIndex.value;
      const newIndex = calculateSalaryIndex(baseline, col);

      // Write back into in-memory object
      if (city.costs.salaryIndex) {
        city.costs.salaryIndex.value = newIndex;
      } else {
        city.costs.salaryIndex = { value: newIndex, baseline: 'Lisbon = 100' };
      }
    }
  }
}

/**
 * Format a number with locale-appropriate thousands separators.
 * @param {number} value
 * @returns {string}
 */
export function formatNumber(value) {
  if (value == null || isNaN(value)) return '—';
  return value.toLocaleString('en-US');
}

/**
 * Format a range (e.g., office rent: "16–20").
 * @param {number} min
 * @param {number} max
 * @param {string} [prefix='']
 * @param {string} [suffix='']
 * @returns {string}
 */
export function formatRange(min, max, prefix = '', suffix = '') {
  if (min == null || max == null) return '—';
  return `${prefix}${formatNumber(min)}–${formatNumber(max)}${suffix}`;
}
