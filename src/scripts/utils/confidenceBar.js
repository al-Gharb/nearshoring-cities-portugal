/**
 * CONFIDENCE BAR UTILITY
 *
 * Shared HTML builder for confidence/fact-check bars used across
 * city profiles and section headers.
 */

/**
 * Get human-readable confidence label based on score.
 * @param {number} score — 0-100
 * @returns {string}
 */
export function getConfidenceLabel(score) {
  if (score >= 90) return 'Excellent — verified with official sources';
  if (score >= 80) return 'Good — cross-validated with multiple sources';
  if (score >= 70) return 'Moderate — some sources may need updates';
  if (score >= 50) return 'Low — requires additional verification';
  return 'Very Low — treat as estimates only';
}

function formatFactCheckDate(checkDate) {
  if (!checkDate) return 'Pending';

  const parsed = new Date(checkDate);
  if (Number.isNaN(parsed.getTime())) return 'Pending';

  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Build HTML for a confidence bar widget.
 * @param {number|null} score — 0-100 or null
 * @param {string|null} [checkDate] — last fact-check date (ISO or parseable date)
 * @param {boolean} [compact] — use compact sizing (50px track, 6px pointer)
 * @returns {string} — HTML string for confidence bar
 * 
 * NOTE: Standard calculation assumes 80px track width and 8px pointer width.
 * Compact mode uses 50px track width and 6px pointer width.
 * All CSS overrides (.city-header, .section-confidence, .score-card)
 * must maintain these dimensions for correct pointer positioning.
 */
export function buildConfidenceBarHTML(score, checkDate = null, compact = false) {
  const compactClass = compact ? ' confidence-bar-compact' : '';
  const formattedDate = formatFactCheckDate(checkDate);
  
  if (score == null) {
    const nullPosition = compact ? 25 : 40;
    return `<span class="confidence-bar${compactClass}" title="Data confidence: not yet assessed. Last fact-check: ${formattedDate}.">
      <span class="confidence-bar-track"><span class="confidence-bar-pointer" style="left: ${nullPosition}px;"></span></span>
      <span class="confidence-bar-label">—</span>
    </span>`;
  }

  // Standard: 80px track, 8px pointer → Range = 72px, offset = 4px
  // Compact: 50px track, 6px pointer → Range = 44px, offset = 3px
  const offset = compact ? 3 : 4;
  const range = compact ? 44 : 72;
  const position = Math.round(offset + (score / 100) * range);
  const titleText = `Data confidence: ${score}%. Last fact-check: ${formattedDate}.`;

  return `<span class="confidence-bar${compactClass}" title="${titleText}">
    <span class="confidence-bar-track"><span class="confidence-bar-pointer" style="left: ${position}px;"></span></span>
    <span class="confidence-bar-label">${score}%</span>
  </span>`;
}
