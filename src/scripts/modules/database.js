/**
 * DATABASE MODULE
 * Loads all 4 normalized JSON databases and exposes them as a single store.
 *
 * Uses /data/normalized/ paths relative to the Vite base path.
 * Preloaded via <link rel="preload"> in index.html.
 */

/** @type {import('./database.types').DatabaseStore} */
let store = null;

/**
 * Get the base path for data files.
 * In dev (Vite), import.meta.env.BASE_URL gives the configured base.
 * Falls back to '/' for testing.
 */
function getBasePath() {
  try {
    return import.meta.env.BASE_URL || '/';
  } catch {
    return '/';
  }
}

/**
 * Fetch a JSON file with error handling.
 * @param {string} path — relative to site root
 * @returns {Promise<Object>}
 */
async function fetchJSON(path) {
  const base = getBasePath();
  // Remove trailing slash from base to avoid double slashes
  const url = `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Load all databases in parallel.
 * Returns the global store object. Subsequent calls return the cached store.
 *
 * @returns {Promise<DatabaseStore>}
 */
export async function loadDatabases() {
  if (store) return store;

  const [master, profiles, content, compensation] = await Promise.all([
    fetchJSON('data/normalized/MASTER.json'),
    fetchJSON('data/normalized/CITY_PROFILES.json'),
    fetchJSON('data/normalized/WEBSITE_CONTENT.json'),
    fetchJSON('data/normalized/COMPENSATION_DATA.json'),
  ]);

  store = Object.freeze({
    master,
    profiles,
    content,
    compensation,
    loaded: true,
  });

  return store;
}

/**
 * Get the already-loaded store (throws if not yet loaded).
 * @returns {DatabaseStore}
 */
export function getStore() {
  if (!store) {
    throw new Error('Databases not yet loaded. Call loadDatabases() first.');
  }
  return store;
}

/**
 * Get a city entry from MASTER.json.
 * @param {string} cityId — e.g. 'porto'
 * @returns {Object|null}
 */
export function getCity(cityId) {
  return store?.master?.cities?.[cityId] ?? null;
}

/**
 * Get all city IDs in display order.
 * @returns {string[]}
 */
export function getCityDisplayOrder() {
  return store?.master?.config?.displayOrder ?? [];
}

/**
 * Get region order for table grouping.
 * @returns {string[]}
 */
export function getRegionOrder() {
  return store?.master?.config?.regionOrder ?? [];
}

/**
 * Get regional totals.
 * @param {string} region — e.g. 'Norte'
 * @returns {Object|null}
 */
export function getRegionalTotals(region) {
  return store?.master?.regionalTotals?.[region] ?? null;
}

/**
 * Get chart configuration.
 * @returns {Object}
 */
export function getChartConfig() {
  return store?.master?.config?.chartConfig ?? {};
}

/**
 * Get city profile data from CITY_PROFILES.json.
 * @param {string} cityId
 * @returns {Object|null}
 */
export function getCityProfile(cityId) {
  return store?.profiles?.cities?.[cityId] ?? null;
}

/**
 * Get national data from WEBSITE_CONTENT.json.
 * @returns {Object}
 */
export function getNationalData() {
  return store?.content?.national ?? {};
}

/**
 * Get compensation data.
 * @returns {Object}
 */
export function getCompensationData() {
  return store?.compensation ?? {};
}
