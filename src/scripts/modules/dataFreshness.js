/**
 * Data Freshness UI
 * - Shows a small freshness/confidence bar computed from a last-updated ISO date
 * - Degrades by 0.25 points per full day since `lastUpdated`
 * - Resets to 100 when the `data-last-updated` attribute changes
 */
import { buildConfidenceBarHTML } from '../utils/confidenceBar.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function safeParseDate(iso) {
  if (!iso) return new Date();
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function computeScoreFromIso(iso) {
  const now = Date.now();
  const last = safeParseDate(iso).getTime();
  const delta = Math.max(0, now - last);
  const days = Math.floor(delta / MS_PER_DAY);
  const raw = 100 - days * 0.25; // degrade 0.25 points per day
  const score = Math.max(0, Math.min(100, Math.round(raw * 100) / 100));
  return { score, days, last: new Date(last) };
}

export function initDataFreshness(selector = '#data-freshness', initialIso = null) {
  const container = document.querySelector(selector);
  if (!container) return null;

  // Ensure dataset holds a canonical ISO value
  if (!container.dataset.lastUpdated) {
    container.dataset.lastUpdated = initialIso || new Date().toISOString();
  }

  const percentEl = container.querySelector('#freshness-percent');
  const dateEl = container.querySelector('#freshness-date');
  const barEl = container.querySelector('#freshness-bar');

  function renderFromIso(iso) {
    const { score, days, last } = computeScoreFromIso(iso);

    // Render the confidence-bar markup (compact mode to fit header)
    if (barEl) {
      barEl.innerHTML = buildConfidenceBarHTML(Math.round(score), last.toISOString(), true);

      // Make the freshly-rendered track/pointer visually distinct and reposition pointer
      const trackEl = barEl.querySelector('.confidence-bar-track');
      const pointerEl = barEl.querySelector('.confidence-bar-pointer');
      const labelEl = barEl.querySelector('.confidence-bar-label');
      if (trackEl) trackEl.classList.add('freshness-track');
      if (pointerEl) pointerEl.classList.add('freshness-pointer');
      if (labelEl) labelEl.classList.add('freshness-label');

      // Recalculate pointer position to match our wider custom track
      if (trackEl && pointerEl) {
        // Defer measurement until element is laid out
        requestAnimationFrame(() => {
          const trackWidth = trackEl.clientWidth;
          const pointerWidth = pointerEl.offsetWidth || 12;
          // Position pointer so its left edge ranges from 0 -> trackWidth - pointerWidth
          const left = Math.round((Math.max(0, Math.min(100, score)) / 100) * (trackWidth - pointerWidth));
          pointerEl.style.left = `${left}px`;
        });
      }
    }

    if (percentEl) percentEl.textContent = `${Math.round(score)}%`;
    if (dateEl) {
      const formatted = last.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      dateEl.textContent = formatted;
    }

    // Sync header last-update display if present
    const headerLast = document.getElementById('header-last-updated');
    if (headerLast) {
      const headerFormatted = last.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      headerLast.textContent = headerFormatted;
      headerLast.setAttribute('aria-label', `Last updated ${headerFormatted}`);
    }

    // Update ARIA on the rendered bar element if present
    const renderedBar = container.querySelector('.confidence-bar');
    if (renderedBar) {
      renderedBar.setAttribute('role', 'progressbar');
      renderedBar.setAttribute('aria-valuemin', '0');
      renderedBar.setAttribute('aria-valuemax', '100');
      renderedBar.setAttribute('aria-valuenow', String(Math.round(score)));
      renderedBar.setAttribute('aria-label', `Data freshness ${Math.round(score)}%`);
    }
  }

  // Initial render
  renderFromIso(container.dataset.lastUpdated);

  // Observe attribute changes to reset when `data-last-updated` changes
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'data-last-updated') {
        const iso = container.dataset.lastUpdated || new Date().toISOString();
        renderFromIso(iso);
      }
    }
  });
  mo.observe(container, { attributes: true });

  // Allow programmatic updates via custom event
  const onEvent = (e) => {
    const iso = e?.detail?.iso || new Date().toISOString();
    container.dataset.lastUpdated = iso; // triggers MutationObserver
  };
  window.addEventListener('dataFreshness:update', onEvent);

  // Schedule a daily tick at next local midnight so the bar "inches back" while open
  function scheduleNextMidnightTick() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 5, 0); // a small offset after midnight
    const ms = next.getTime() - now.getTime();
    setTimeout(() => {
      renderFromIso(container.dataset.lastUpdated);
      scheduleNextMidnightTick();
    }, ms);
  }
  scheduleNextMidnightTick();

  return {
    render: renderFromIso,
    update(iso) {
      container.dataset.lastUpdated = iso || new Date().toISOString();
    },
    destroy() {
      mo.disconnect();
      window.removeEventListener('dataFreshness:update', onEvent);
    },
  };
}
