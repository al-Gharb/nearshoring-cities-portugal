/**
 * COVER CITY LIST MODULE
 * Renders the "Explore 9 Cities of Interest" list on the cover page
 * from CITY_PROFILES.json data (coverTags, coverIcon, tagline).
 *
 * Uses _meta.coverOrder for display order, _meta.coverIcon for icons,
 * _meta.coverTags for tag bubbles, and _meta.tagline for subheadlines.
 */

import { getStore, getCityProfile, getChartConfig } from './database.js';

/**
 * Render the cover city list into the .city-list container.
 * Reads coverOrder from CITY_PROFILES._meta to determine which cities
 * to display and in what order.
 */
export function renderCoverCityList() {
  const container = document.querySelector('.city-list');
  if (!container) return;

  const store = getStore();
  const coverOrder = store.profiles?._meta?.coverOrder ?? [];
  const chartConfig = getChartConfig();

  if (!coverOrder.length) {
    console.warn('coverCityList: No coverOrder defined in CITY_PROFILES._meta');
    return;
  }

  const items = coverOrder.map(cityId => {
    const profile = getCityProfile(cityId);
    if (!profile) return '';

    const meta = profile._meta;
    const displayName = chartConfig?.cityConfig?.[cityId]?.displayName ?? meta.cityId;
    const tagline = meta.tagline ?? '';
    const icon = meta.coverIcon ?? 'fa-city';
    const tags = meta.coverTags ?? [];
    const sectionId = meta.sectionId ?? cityId;
    const isLisbon = cityId === 'lisbon';

    const tagBubbles = tags
      .map(t => `<span class="tag-bubble">${t}</span>`)
      .join('');

    return `<li${isLisbon ? ' class="liorange"' : ''}>
            <div class="city-link"><i class="fa-solid ${icon} city-icon" aria-hidden="true"></i><a href="#${sectionId}">${displayName}</a> <span class="city-subheadline">— ${tagline}</span></div>
            <div class="city-tags-bubbles">${tagBubbles}</div>
          </li>`;
  });

  container.innerHTML = items.join('\n');
}
