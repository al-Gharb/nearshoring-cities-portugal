/**
 * CALCULATIONS MODULE
 * Graduate metrics (3-tier), salary index, and ICT percentage calculations.
 *
 * CRITICAL: ICT % uses officialStem as denominator, NOT digitalStemPlus.
 * Formula: (coreICT / officialStem) × 100
 */

/**
 * Calculate Digital STEM+ from Official STEM using the INCoDe.2030 expansion factor.
 * @param {number} officialStem
 * @param {number} [factor=1.27] — default national expansion factor
 * @returns {number}
 */
export function calculateDigitalStem(officialStem, factor = 1.27) {
  return Math.round(officialStem * factor);
}

/**
 * Calculate Core ICT from Digital STEM+.
 * National average: 16% of Digital STEM+ are pure ICT specialists.
 * @param {number} digitalStemPlus
 * @param {number} [share=0.16]
 * @returns {number}
 */
export function calculateCoreICT(digitalStemPlus, share = 0.16) {
  return Math.round(digitalStemPlus * share);
}

/**
 * Calculate ICT % for the table display.
 * ⚠️ CRITICAL: Uses officialStem as denominator, matching legacy behavior.
 * Legacy formula (app.js line 553): ict / officialStemGrads × 100
 *
 * @param {number} coreICT
 * @param {number} officialStem — NOT digitalStemPlus
 * @returns {string} — formatted to 1 decimal place
 */
export function calculateICTPct(coreICT, officialStem) {
  if (!officialStem || officialStem === 0) return '—';
  return ((coreICT / officialStem) * 100).toFixed(1);
}

/**
 * Calculate salary index from regional baseline and COL index.
 * Formula: baseline × (1 + (COL - 30) × 1.33 / 100), capped at 100
 *
 * @param {number} regionalBaseline — INE regional salary percentage (e.g., 77.1 for Porto)
 * @param {number} colIndex — Numbeo Cost-of-Living index (NYC=100)
 * @returns {number} — salary index (Lisbon = 100)
 */
export function calculateSalaryIndex(regionalBaseline, colIndex) {
  const COL_FLOOR = 30;
  const COL_SENSITIVITY = 1.33;

  const raw = regionalBaseline * (1 + ((colIndex - COL_FLOOR) * COL_SENSITIVITY) / 100);
  return Math.min(Math.round(raw * 10) / 10, 100.0);
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
