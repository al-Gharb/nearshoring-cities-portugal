/**
 * PROMPT GENERATOR MODULE — Experimental v3
 * AI Nearshoring Simulator — collects form inputs + database data,
 * runs deterministic computation via simulatorEngine, then builds
 * a narrative-focused prompt. Handles UI (generate, copy, conditional fields).
 *
 * Architecture: simulatorEngine → all math. LLM → reasoning & narrative.
 */

import { getStore, getCity, getCityProfile, getCompensationData, getRegionalTotals } from './database.js';
import { buildPromptTemplate } from './promptTemplate.js';
import { computeAnalysis } from './simulatorEngine.js';

/* ═══════════════════════════════════════════════════════════════════════════
 * DATA COLLECTION — Build portugalData from normalized databases
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Get regional STEM+ graduate pool for a city by looking up its NUTS region
 * in MASTER.json → city.basic.region.value → regionalTotals.
 * @param {string} cityId
 * @param {Object} cityData — city entry from MASTER.json
 * @returns {number} Tech STEM+ regional total
 */
function getRegionalStemPool(cityId, cityData) {
  const region = cityData?.basic?.region?.value;
  if (!region) return 500; // safe fallback
  const totals = getRegionalTotals(region);
  return totals?.digitalStemPlus ?? 500;
}

function getCityWorkforceEstimate(cityId, cityData) {
  const breakdown = getStore()?.content?.national?.workforceStatistics?.cityBreakdown || [];
  const cityName = cityData?.basic?.name?.value;
  if (!cityName || breakdown.length === 0) {
    return null;
  }

  const match = breakdown.find((entry) => String(entry?.city || '').toLowerCase() === cityName.toLowerCase());
  if (!match) {
    return null;
  }

  return {
    official: Number.isFinite(match.official) ? match.official : null,
  };
}

function parseRangeDuration(match) {
  if (!match) return null;

  const start = Number.parseInt(match[1], 10);
  const end = Number.parseInt(match[2], 10);
  const unit = match[3] || 'min';
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;

  const maxValue = Math.max(start, end);
  return /^(h|hr|hour)/.test(unit) ? maxValue * 60 : maxValue;
}

function parseHourMinuteDuration(match) {
  if (!match) return null;

  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  return (hours * 60) + minutes;
}

function parseHourDuration(match) {
  if (!match) return null;

  const hours = Number.parseFloat(match[1].replace(',', '.'));
  if (!Number.isFinite(hours)) return null;

  return Math.round(hours * 60);
}

function parseMinuteDuration(match) {
  if (!match) return null;

  const minutes = Number.parseInt(match[1], 10);
  return Number.isFinite(minutes) ? minutes : null;
}

function parseDurationToMinutes(rawValue) {
  if (!rawValue) return null;

  const text = String(rawValue).toLowerCase().replaceAll('~', '').trim();

  const parsers = [
    {
      regex: /(\d{1,2})\s*[-–]\s*(\d{1,3})\s*(h|hr|hour|hours|min|mins|minute|minutes)?/,
      toMinutes: parseRangeDuration,
    },
    {
      regex: /(\d{1,2})\s*h\s*(\d{1,2})/,
      toMinutes: parseHourMinuteDuration,
    },
    {
      regex: /(\d{1,2}(?:[.,]\d)?)\s*(h|hr|hour|hours)/,
      toMinutes: parseHourDuration,
    },
    {
      regex: /(\d{1,3})\s*(min|mins|minute|minutes)/,
      toMinutes: parseMinuteDuration,
    },
  ];

  for (const parser of parsers) {
    const minutes = parser.toMinutes(parser.regex.exec(text));
    if (minutes !== null) {
      return minutes;
    }
  }

  return null;
}

function getAirportAccessMinutes(cityId) {
  const profile = getCityProfile(cityId);
  const driveTime = profile?.infrastructure?.airport?.driveTime;
  const fromProfile = parseDurationToMinutes(driveTime);
  if (fromProfile !== null) return fromProfile;
  // Fallback: static estimate stored in MASTER.json flags (used for secondary cities with no profile)
  const cityData = getCity(cityId);
  const staticMinutes = cityData?.flags?.airportAccessMinutes;
  return Number.isFinite(staticMinutes) ? staticMinutes : null;
}

// getCityMeta() removed in Experimental v3 — metadata (climate, coworking, airport) no longer injected into prompt.
// These are now advisory context the LLM can reference from the city database tags/companies fields.

/**
 * Build salary bands lookup from COMPENSATION_DATA.json.
 * Legacy form uses keys like 'software-engineer', 'devops-sre', etc.
 */
function buildSalaryBands(compData) {
  if (!compData?.baseBands) {
    // Fallback hardcoded bands
    return {
      'software-engineer': { min: 3680, mid: 4300, max: 4920, label: 'Software Engineer' },
      'devops-sre': { min: 3900, mid: 4600, max: 5300, label: 'DevOps / SRE' },
      'ml-data-engineer': { min: 4200, mid: 5200, max: 6200, label: 'ML / Data Engineer' },
      'mobile-engineer': { min: 3700, mid: 4200, max: 4700, label: 'Mobile Engineer (iOS/Android)' },
      'engineering-manager': { min: 5200, mid: 6500, max: 8000, label: 'Engineering Manager' },
      'product-manager': { min: 4200, mid: 5000, max: 6000, label: 'Product Manager (PM)' },
      'data-analyst': { min: 3800, mid: 4400, max: 5000, label: 'Data Analyst / BI' },
      'tech-support': { min: 1800, mid: 2100, max: 2400, label: 'Tech Support L1/L2' },
      'creative': { min: 2900, mid: 3350, max: 3800, label: 'UX / Creative' },
      'qa-testing': { min: 2300, mid: 2600, max: 2900, label: 'QA / Testing' },
      'admin-backoffice': { min: 1500, mid: 1750, max: 2000, label: 'Admin / Back-office' },
      'mixed': { min: 2800, mid: 3200, max: 3600, label: 'Mixed roles (blended)' },
    };
  }

  // Map camelCase keys to form-compatible kebab-case keys
  const keyMap = {
    softwareEngineer: 'software-engineer',
    devops: 'devops-sre',
    mlDataEngineer: 'ml-data-engineer',
    mobileEngineer: 'mobile-engineer',
    engineeringManager: 'engineering-manager',
    productManager: 'product-manager',
    dataAnalyst: 'data-analyst',
    techSupport: 'tech-support',
    uxCreative: 'creative',
    qaTesting: 'qa-testing',
    adminBackoffice: 'admin-backoffice',
  };

  const bands = {};
  for (const [jsonKey, band] of Object.entries(compData.baseBands)) {
    const formKey = keyMap[jsonKey] || jsonKey;
    bands[formKey] = {
      min: band.min,
      mid: band.midpoint,
      max: band.max,
      label: band.roleType,
      annual: band.meta?.htmlAuthoritative || {},
    };
  }

  // Add mixed/blended if not present
  if (!bands['mixed']) {
    bands['mixed'] = { min: 2800, mid: 3200, max: 3600, label: 'Mixed roles (blended)' };
  }

  return bands;
}

function normalizeTierKey(key) {
  if (key === 'midLevel') return 'mid';
  if (key === 'leadPrincipal') return 'lead';
  return key;
}

/**
 * Build tier multipliers from COMPENSATION_DATA.json.
 */
function buildTierMultipliers(compData) {
  if (!compData?.seniorityMultipliers) {
    return { junior: 0.85, mid: 1, senior: 1.25, lead: 1.4 };
  }
  const tiers = {};
  for (const [key, tier] of Object.entries(compData.seniorityMultipliers)) {
    // Normalize keys: midLevel→mid, leadPrincipal→lead
    const normKey = normalizeTierKey(key);
    tiers[normKey] = tier.multiplier;
  }
  return tiers;
}

/**
 * Build stack premiums from COMPENSATION_DATA.json.
 */
function buildStackPremiums(compData) {
  if (!compData?.techStackPremiums) {
    return {
      'core-backend': 0, frontend: 0.05, 'mobile-native': 0.1,
      'devops-cloud': 0.15, 'systems-rust': 0.25, 'ml-mlops': 0.25,
      security: 0.3, blockchain: 0.4,
    };
  }
  const keyMap = {
    coreBackend: 'core-backend',
    frontend: 'frontend',
    mobile: 'mobile-native',
    devopsCloud: 'devops-cloud',
    systemsRust: 'systems-rust',
    dataML: 'ml-mlops',
    security: 'security',
    blockchain: 'blockchain',
  };
  const premiums = {};
  for (const [jsonKey, entry] of Object.entries(compData.techStackPremiums)) {
    const normKey = keyMap[jsonKey] || jsonKey;
    premiums[normKey] = entry.premium;
  }
  return premiums;
}

/**
 * Prepare city data for AI prompt consumption.
 * Reads from MASTER.json with minimal CITY_PROFILES enrichment (tags, companies).
 * This is the ONLY data injected into the prompt as JSON.
 * @returns {Array} Array of city objects in prompt-ready format
 */
function prepareCityDataForAI() {
  const store = getStore();
  const masterCities = store.master?.cities || {};
  const displayOrder = store.master?.config?.displayOrder || [];

  const cities = [];

  for (const cityId of displayOrder) {
    const city = masterCities[cityId];
    if (!city) continue;

    const grads = city.talent?.graduates || {};
    const costs = city.costs || {};
    const profile = getCityProfile(cityId);

    const workforce = getCityWorkforceEstimate(cityId, city);
    const airportAccessMinutes = getAirportAccessMinutes(cityId);

    cities.push({
      id: cityId,
      name: city.basic?.name?.value ?? cityId,
      featured: city.basic?.featured ?? false,
      region: city.basic?.region?.value ?? 'Unknown',
      universities: city.talent?.universities?.value ?? [],
      stemGrads: grads.digitalStemPlus?.value ?? 0,
      ictGrads: grads.coreICT?.value ?? 0,
      regionalStemPool: getRegionalStemPool(cityId, city),
      itWorkforceOfficial: workforce?.official ?? null,
      airportAccessMinutes,
      colIndex: costs.colIndex?.value ?? 35,
      salaryIndex: costs.salaryIndex?.value ?? 80,
      officeRent: costs.officeRent ? { min: costs.officeRent.min, max: costs.officeRent.max } : { min: 12, max: 18 },
      residentialRent: costs.residentialRent ? { min: costs.residentialRent.min, max: costs.residentialRent.max } : { min: 800, max: 1200 },
      hasAirport: city.flags?.hasAirport ?? false,
      tags: profile?.ecosystem?.domains?.value ?? [],
      majorCompanies: (profile?.ecosystem?.techCompanies?.value ?? []).map(c => c.name),
    });
  }

  return cities;
}

// collectAllData() removed in Experimental v3 — national data no longer injected into prompt.
// Only MASTER.json city data + minimal CITY_PROFILES enrichment is used.

/* ═══════════════════════════════════════════════════════════════════════════
 * FORM INPUT READING
 * ═══════════════════════════════════════════════════════════════════════════ */

function getValue(id) {
  return document.getElementById(id)?.value.trim() || '';
}

/**
 * Sanitize free-text user input for prompt safety and consistency.
 * Removes control characters and high-risk delimiter chars used in prompt injection.
 * @param {string} value
 * @param {number} maxLen
 * @returns {string}
 */
function sanitizeFreeText(value, maxLen = 300) {
  if (!value) return '';
  return String(value)
    .normalize('NFKC')
    .replaceAll(/[\u0000-\u001F\u007F]/g, ' ')
    .replaceAll(/[<>`]/g, '')
    .replaceAll(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

/**
 * Parse human-entered currency/number strings safely across locale formats.
 * Examples handled:
 * - 55000
 * - 55,000
 * - 55.000
 * - €55 000
 * - 55.000,00 (drops decimal cents for budget usage)
 * @param {string} raw
 * @returns {number|null}
 */
function parseLocalizedInteger(raw) {
  if (!raw) return null;

  let cleaned = String(raw).replaceAll(/[^\d.,\s]/g, '').replaceAll(/\s+/g, '');
  if (!cleaned) return null;

  // If trailing decimal separator exists (e.g., 55.000,00), drop decimal part for integer budget logic.
  cleaned = cleaned.replaceAll(/[.,](\d{1,2})$/, '');

  const digitsOnly = cleaned.replaceAll(/[^\d]/g, '');
  if (!digitsOnly) return null;

  const parsed = Number.parseInt(digitsOnly, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Parse team size from flexible user text (e.g., "8-10 people" -> 8).
 * @param {string} raw
 * @returns {number|null}
 */
function parseTeamSize(raw) {
  if (!raw) return null;
  const match = /(\d{1,4})/.exec(String(raw));
  if (!match) return null;
  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function clampInteger(value, min, max) {
  if (!Number.isFinite(value)) return null;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function normalizeSelect(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function resolveTierKey(hiringStrategy) {
  if (!hiringStrategy) return 'mid';
  if (hiringStrategy.includes('senior')) return 'senior';
  if (hiringStrategy.includes('junior')) return 'junior';
  if (hiringStrategy.includes('lead')) return 'lead';
  return 'mid';
}

function getStackSelection() {
  const checkboxes = document.querySelectorAll('input[name="stack"]:checked');
  const selected = Array.from(checkboxes).map(cb => cb.value);
  const other = getValue('sim-searched-stack-other');
  if (other) selected.push(other);
  return selected.length > 0 ? selected.join(', ') : '';
}

function mapRoleLabelToBandKey(roleLabel) {
  const role = String(roleLabel || '').toLowerCase();

  if (role.includes('backend') || role.includes('frontend') || role.includes('fullstack')) return 'software-engineer';
  if (role.includes('android') || role.includes('ios') || role.includes('mobile')) return 'mobile-engineer';
  if (role.includes('qa')) return 'qa-testing';
  if (role.includes('machine learning') || role.includes('data scientist') || role.includes('data engineer')) return 'ml-data-engineer';
  if (role.includes('data analyst')) return 'data-analyst';
  if (role.includes('devops')) return 'devops-sre';
  if (role.includes('security')) return 'devops-sre';
  if (role.includes('product manager') || role.includes('project manager') || role.includes('business analyst') || role.includes('head of product')) return 'product-manager';
  if (role.includes('ux') || role.includes('designer')) return 'creative';
  if (role.includes('solutions architect') || role.includes('tech lead') || role.includes('engineering manager') || role.includes('engineering c-level')) return 'engineering-manager';

  return 'software-engineer';
}

function getRoleTypeSelection() {
  const checkboxes = document.querySelectorAll('input[name="roleType"]:checked');
  const selected = Array.from(checkboxes).map((cb) => ({
    label: cb.value,
    bandKey: cb.dataset.bandKey || 'software-engineer',
  }));

  if (selected.length === 0) {
    return {
      labels: ['Software Engineer (ICT/CS)'],
      bandKeys: ['software-engineer'],
    };
  }

  return {
    labels: selected.map((entry) => entry.label),
    bandKeys: selected.map((entry) => entry.bandKey),
  };
}

function readFormInputs() {
  const allowedPrimaryObjectives = ['cost', 'quality', 'speed', 'balanced'];
  const allowedWorkModels = ['fully-remote', 'remote-first', 'hybrid', 'office-first', 'fully-onsite'];
  const allowedOfficeQuality = ['budget', 'standard', 'premium'];
  const allowedOfficeStrategies = ['city-center', 'business-park', 'university-adjacent', 'low-profile', 'no-preference'];
  const allowedHiringStrategies = ['balanced-practical', 'specialized-research', 'practical-delivery', 'senior-qol', 'junior-trainable'];
  const allowedTimeline = ['asap', '3-6months', '6-12months', 'flexible'];
  const allowedScaling = ['stable', 'gradual', 'double', 'aggressive', 'hub-build', 'flexible'];
  const allowedLifestyle = ['any', 'major-metro', 'secondary-city', 'coastal-warm', 'university-town', 'low-cost', 'nature-outdoor'];
  const allowedEntity = ['undecided', 'eor', 'subsidiary', 'contractors'];
  const allowedOutputStyle = ['executive', 'detailed'];
  const roleSelection = getRoleTypeSelection();

  const rawTeamSize = sanitizeFreeText(getValue('sim-team-size'), 40);

  return {
    purpose: sanitizeFreeText(getValue('sim-purpose'), 600),
    opexBudget: sanitizeFreeText(getValue('sim-opex-budget'), 40),
    capexBudget: sanitizeFreeText(getValue('sim-capex-budget'), 40),
    teamSize: rawTeamSize || '10',
    roleType: roleSelection.bandKeys[0] || 'software-engineer',
    roleTypes: roleSelection.labels,
    roleTypeBandKeys: roleSelection.bandKeys,
    companyFocus: sanitizeFreeText(getValue('sim-company-focus'), 80),
    searchedStack: sanitizeFreeText(getStackSelection(), 300),
    dealbreakers: sanitizeFreeText(getValue('sim-dealbreakers'), 260),
    workModel: normalizeSelect(getValue('sim-work-model'), allowedWorkModels, 'hybrid'),
    officeQuality: normalizeSelect(getValue('sim-office-quality'), allowedOfficeQuality, 'standard'),
    officeStrategy: normalizeSelect(getValue('sim-office-strategy'), allowedOfficeStrategies, 'no-preference'),
    hiringStrategy: normalizeSelect(getValue('sim-hiring-strategy'), allowedHiringStrategies, 'balanced-practical'),
    timeline: normalizeSelect(getValue('sim-timeline'), allowedTimeline, '6-12months'),
    scaling: normalizeSelect(getValue('sim-scaling'), allowedScaling, 'gradual'),
    timezone: sanitizeFreeText(getValue('sim-timezone'), 120),
    lifestyle: normalizeSelect(getValue('sim-lifestyle'), allowedLifestyle, 'any'),
    entity: normalizeSelect(getValue('sim-entity'), allowedEntity, 'undecided'),
    primaryObjective: normalizeSelect(getValue('sim-primary-objective'), allowedPrimaryObjectives, 'balanced'),
    outputStyle: normalizeSelect(getValue('sim-output-style'), allowedOutputStyle, 'detailed'),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MASTER PROMPT GENERATION
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Generate the Experimental v3 master prompt.
 * Flow: read form → build compensation lookups → run deterministic engine → build prompt.
 * All arithmetic happens in simulatorEngine.js. The prompt contains zero formulas.
 * @returns {string} Complete prompt text for AI consumption
 */
export function generateMasterPrompt() {
  const inputs = readFormInputs();

  // Build compensation lookups from COMPENSATION_DATA.json
  const compData = getCompensationData();
  const salaryBands = buildSalaryBands(compData);
  const tierMultipliers = buildTierMultipliers(compData);
  const stackPremiums = buildStackPremiums(compData);

  const selectedBandKeys = Array.isArray(inputs.roleTypeBandKeys) && inputs.roleTypeBandKeys.length > 0
    ? inputs.roleTypeBandKeys
    : ['software-engineer'];

  const selectedBands = selectedBandKeys
    .map((key) => salaryBands[key])
    .filter(Boolean);

  const fallbackBand = salaryBands['software-engineer'];
  const bandsForCalc = selectedBands.length > 0 ? selectedBands : [fallbackBand];

  const currentBand = {
    min: Math.round(bandsForCalc.reduce((sum, band) => sum + (band.min || 0), 0) / bandsForCalc.length),
    mid: Math.round(bandsForCalc.reduce((sum, band) => sum + (band.mid || 0), 0) / bandsForCalc.length),
    max: Math.round(bandsForCalc.reduce((sum, band) => sum + (band.max || 0), 0) / bandsForCalc.length),
    label: Array.isArray(inputs.roleTypes) && inputs.roleTypes.length > 0
      ? inputs.roleTypes.join(', ')
      : (fallbackBand?.label || 'Software Engineer (ICT/CS)'),
  };

  // Extract raw numeric values
  const teamSize = clampInteger(parseTeamSize(inputs.teamSize), 1, 1000);
  const budget = clampInteger(parseLocalizedInteger(inputs.opexBudget), 1000, 100000000);
  const capex = clampInteger(parseLocalizedInteger(inputs.capexBudget), 0, 100000000);

  if (budget) inputs.opexBudget = String(budget);
  if (capex !== null) inputs.capexBudget = String(capex);
  if (teamSize) inputs.teamSize = String(teamSize);

  // Resolve seniority tier multiplier from form or default to mid (1.00)
  const tierKey = resolveTierKey(inputs.hiringStrategy);
  const resolvedTierMultiplier = tierMultipliers[tierKey] ?? 1;

  // Resolve stack premium — pick highest from selected stacks
  const selectedStacks = (inputs.searchedStack || '').toLowerCase();
  let resolvedStackPremium = 0;
  for (const [key, premium] of Object.entries(stackPremiums)) {
    if (selectedStacks.includes(key.replaceAll('-', ' ')) || selectedStacks.includes(key)) {
      resolvedStackPremium = Math.max(resolvedStackPremium, premium);
    }
  }

  // Prepare city data (MASTER.json + minimal CITY_PROFILES)
  const cityData = prepareCityDataForAI();

  // Run deterministic computation engine — ALL math happens here
  const computed = computeAnalysis({
    currentBand,
    tierMultiplier: resolvedTierMultiplier,
    stackPremium: resolvedStackPremium,
    teamSize,
    budget,
    cities: cityData,
    industry: inputs.companyFocus || '',
    teamSizeRaw: teamSize,
    primaryObjective: inputs.primaryObjective || 'balanced',
    dealbreakers: inputs.dealbreakers || '',
    workModel: inputs.workModel || '',
    officeQuality: inputs.officeQuality || 'standard',
    officeStrategy: inputs.officeStrategy || '',
    lifestyle: inputs.lifestyle || '',
  });

  const todayDate = new Date().toISOString().split('T')[0];

  // Delegate to prompt template builder — receives pre-computed results, no formulas
  return buildPromptTemplate({
    inputs,
    computed,
    cityData,
    todayDate,
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
 * UI HANDLERS — Generate, Copy, Form Logic
 * ═══════════════════════════════════════════════════════════════════════════ */

// Cache for fact-check claims database
let factcheckClaims = null;

/**
 * Load fact-check claims database (v2.0).
 * @returns {Promise<Object>} The FACTCHECK_CLAIMS_v2.json data
 */
async function loadFactcheckClaims() {
  if (factcheckClaims) return factcheckClaims;
  try {
    // Use Vite base path for correct GitHub Pages deployment
    const base = import.meta.env.BASE_URL || '/';
    let response = await fetch(`${base}data/normalized/FACTCHECK_CLAIMS_v2.json`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    factcheckClaims = await response.json();
    return factcheckClaims;
  } catch (err) {
    console.error('Failed to load FACTCHECK_CLAIMS_v2.json:', err);
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * DYNAMIC CLAIM GENERATORS — Pull from source databases
 * Each category has its own generator that extracts claims from the appropriate
 * database (WEBSITE_CONTENT or MASTER), ensuring single source of truth.
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Generate claims for a data category from source databases.
 * Dispatches to the appropriate category-specific generator.
 * @param {string} categoryKey - Category identifier (e.g., 'macroeconomic')
 * @returns {Array} Array of claim objects {id, claim}
 */
function generateDataCategoryClaims(categoryKey) {
  const store = getStore();
  const content = store.content?.national;
  const master = store.master;
  const compensation = store.compensation;
  
  if (!content && !master) {
    console.warn('No data loaded for claim generation');
    return [];
  }
  
  switch (categoryKey) {
    case 'macroeconomic':
      return generateMacroeconomicClaims(content);
    case 'digitalInfra':
      return generateDigitalInfraClaims(content);
    case 'officeRent':
      return generateOfficeRentClaims(master);
    case 'residentialRent':
      return generateResidentialRentClaims(master);
    case 'workforce':
      return generateWorkforceClaims(content, compensation);
    case 'strategic':
    case 'taxIncentives':  // HTML uses taxIncentives
      return generateStrategicClaims(content);
    case 'universityTalent':
    case 'graduates':  // HTML uses graduates
      return generateUniversityTalentClaims(content);
    case 'cityDatabase':
      return generateCityDatabaseClaims(master);
    default:
      console.warn(`Unknown category: ${categoryKey}`);
      return [];
  }
}

function formatClaimValue(value, formatType) {
  if (value === null || value === undefined) return 'N/A';
  if (formatType === 'percent') return `${Number(value).toFixed(1)}%`;
  if (formatType === 'currency') return `€${Math.round(value).toLocaleString()}`;
  if (formatType === 'currency-decimal') return `€${Number(value).toFixed(1)}`;
  if (formatType === 'integer') return `${Math.round(value).toLocaleString()}`;
  return String(value);
}

/**
 * Generate Macroeconomic claims from WEBSITE_CONTENT.json
 */
function generateMacroeconomicClaims(content) {
  const claims = [];
  let claimNum = 1;
  const addClaim = (text) => {
    if (!text) return;
    claims.push({ id: `MAC-${String(claimNum).padStart(2, '0')}`, claim: text.trim() });
    claimNum++;
  };

  const table = content?.macroeconomicScorecard?.comparisonTable;
  if (!table?.indicators) return claims;

  table.indicators.forEach((indicator) => {
    const unit = indicator.unit;
    const format = indicator.format;
    const label = indicator.label;

    addClaim(`European Union ${label}: ${formatClaimValue(indicator.values?.eu, format)} (${indicator.years?.eu})`);
    addClaim(`Germany ${label}: ${formatClaimValue(indicator.values?.germany, format)} (${indicator.years?.germany})`);
    addClaim(`Portugal ${label}: ${formatClaimValue(indicator.values?.portugal, format)} (${indicator.years?.portugal})`);
    addClaim(`${label} unit: ${unit}`);
  });

  if (table.naNote) {
    addClaim(`Macroeconomic comparison note: ${table.naNote}`);
  }

  return claims;
}

/**
 * Generate Digital Infrastructure claims from WEBSITE_CONTENT.json
 */
function addFtthClaims(addClaim, infra) {
  const ftth = infra.ftthPenetration;
  if (ftth?.coverage) addClaim(`FTTH network coverage: ${ftth.coverage.value}% of dwellings`);
  if (ftth?.takeUp) addClaim(`FTTH take-up rate: ${ftth.takeUp.value}% of covered households`);
  if (ftth?.fiberShare) addClaim(`Fiber share of broadband: ${ftth.fiberShare.value}% of connections`);
  if (ftth?.lisbonMetroCoverage) addClaim(`Lisbon Metro FTTH coverage: ${ftth.lisbonMetroCoverage.value}%`);
}

function addFiveGClaims(addClaim, infra) {
  const fiveG = infra.fiveGCoverage;
  if (fiveG?.populationCoverage) addClaim(`5G population coverage: ${fiveG.populationCoverage}%`);
  if (fiveG?.operators) addClaim(`5G operators: ${fiveG.operators.join(', ')}`);
}

function addFixedBroadbandClaims(addClaim, infra) {
  const bb = infra.fixedBroadband;
  if (bb?.averageTraffic) {
    addClaim(`Average fixed broadband traffic: ${bb.averageTraffic.value} ${bb.averageTraffic.unit} (${bb.averageTraffic.period})`);
  }
  if (bb?.businessGrade) {
    addClaim(`Business-grade fiber: ${bb.businessGrade.value} ${bb.businessGrade.unit} symmetric available`);
  }
  if (bb?.consumerFiber500Mbps) {
    addClaim(`Consumer fiber 500 Mbps: €${bb.consumerFiber500Mbps.value}/month`);
  }
  if (bb?.euRanking) addClaim(`EU ranking: ${bb.euRanking}`);
}

function addLatencyClaims(addClaim, infra) {
  const latency = infra.latency;
  if (latency?.toFrankfurt) {
    addClaim(`Latency to Frankfurt: ${latency.toFrankfurt.qualifier || ''} ${latency.toFrankfurt.value}ms`.trim());
  }
  if (latency?.toAmsterdam) {
    addClaim(`Latency to Amsterdam: ${latency.toAmsterdam.qualifier || ''} ${latency.toAmsterdam.value}ms`.trim());
  }
  if (latency?.toSaoPaulo) addClaim(`Latency to São Paulo: ${latency.toSaoPaulo.value}ms (EllaLink)`);
  if (latency?.toNewYork) addClaim(`Latency to New York: ${latency.toNewYork.value}ms`);
}

function addSubseaClaims(addClaim, infra) {
  if (infra.terrestrialConnectivity?.value) {
    addClaim(infra.terrestrialConnectivity.value);
  }

  const cables = infra.subseaCables;
  if (cables?.summary) {
    addClaim(`${cables.summary.operational} operational submarine cables, ${cables.summary.planned} planned`);
  }
  if (!cables?.cables) return;

  cables.cables
    .filter((cable) => cable.status === 'Active')
    .forEach((cable) => {
      let text = `${cable.name} cable: ${cable.destinations}`;
      if (cable.capacity) text += ` (${cable.capacity})`;
      addClaim(text);
    });
}

function addDataCenterClaims(addClaim, infra) {
  const dataCenters = infra.dataCenters;
  if (dataCenters?.microsoft) {
    addClaim(`Microsoft: ${dataCenters.microsoft.investment} data center investment in Sines`);
  }
  if (dataCenters?.alticeCovilha) {
    addClaim(`${dataCenters.alticeCovilha.value}`);
  }

  const sines = infra.sinesTechHub;
  if (sines?.designation) {
    addClaim(`Sines: ${sines.designation} — ${sines.description}`);
  }
}

function generateDigitalInfraClaims(content) {
  const claims = [];
  let claimNum = 1;
  const addClaim = (text) => {
    if (!text) return;
    claims.push({ id: `DIG-${String(claimNum).padStart(2, '0')}`, claim: text.trim() });
    claimNum++;
  };
  
  const infra = content?.digitalInfrastructure;
  if (!infra) return claims;

  addFtthClaims(addClaim, infra);
  addFiveGClaims(addClaim, infra);
  addFixedBroadbandClaims(addClaim, infra);
  addLatencyClaims(addClaim, infra);
  addSubseaClaims(addClaim, infra);
  addDataCenterClaims(addClaim, infra);
  
  return claims;
}

/**
 * Generate Office Rent claims from MASTER.json (all cities)
 */
function generateOfficeRentClaims(master) {
  const claims = [];
  let claimNum = 1;
  const addClaim = (text) => {
    if (!text) return;
    claims.push({ id: `OFF-${String(claimNum).padStart(2, '0')}`, claim: text.trim() });
    claimNum++;
  };
  
  if (!master?.cities) return claims;
  
  // Get cities sorted by rent (highest first) - uses min/max structure
  const citiesWithRent = Object.entries(master.cities)
    .filter(([_, data]) => data.costs?.officeRent?.min || data.costs?.officeRent?.max)
    .map(([id, data]) => ({
      name: data.basic?.name?.value || id.charAt(0).toUpperCase() + id.slice(1),
      min: data.costs.officeRent.min,
      max: data.costs.officeRent.max
    }))
    .sort((a, b) => (b.max || b.min) - (a.max || a.min));
  
  citiesWithRent.forEach(city => {
    if (city.min && city.max) {
      addClaim(`${city.name} office rent: €${city.min}-${city.max}/m²/month`);
    } else {
      addClaim(`${city.name} office rent: €${city.min || city.max}/m²/month`);
    }
  });
  
  return claims;
}

/**
 * Generate Residential Rent claims from MASTER.json (all cities)
 */
function generateResidentialRentClaims(master) {
  const claims = [];
  let claimNum = 1;
  const addClaim = (text) => {
    if (!text) return;
    claims.push({ id: `RES-${String(claimNum).padStart(2, '0')}`, claim: text.trim() });
    claimNum++;
  };
  
  if (!master?.cities) return claims;
  
  // Get cities sorted by rent (highest first) - uses min/max structure
  const citiesWithRent = Object.entries(master.cities)
    .filter(([_, data]) => data.costs?.residentialRent?.min || data.costs?.residentialRent?.max)
    .map(([id, data]) => ({
      name: data.basic?.name?.value || id.charAt(0).toUpperCase() + id.slice(1),
      min: data.costs.residentialRent.min,
      max: data.costs.residentialRent.max,
      type: data.costs.residentialRent.type || 'T1'
    }))
    .sort((a, b) => (b.max || b.min) - (a.max || a.min));
  
  citiesWithRent.forEach(city => {
    if (city.min && city.max) {
      addClaim(`${city.name} ${city.type} rent: €${city.min.toLocaleString()}-${city.max.toLocaleString()}/month`);
    } else {
      addClaim(`${city.name} ${city.type} rent: €${(city.min || city.max).toLocaleString()}/month`);
    }
  });
  
  return claims;
}

/**
 * Generate comprehensive claims for ALL cities from MASTER.json.
 * Includes both externally verifiable metrics and internal calculations.
 * v1.0 — Full city database fact-check
 */
function addCityDatabaseCostClaims(addClaim, cityName, regionTag, cityData) {
  if (cityData.costs?.officeRent) {
    const min = cityData.costs.officeRent.min;
    const max = cityData.costs.officeRent.max;
    if (min && max) {
      addClaim(`${cityName}${regionTag} office rent: \u20ac${min}-${max}/m\u00b2/month (good-quality, below-prime office space)`);
    } else if (min) {
      addClaim(`${cityName}${regionTag} office rent: from \u20ac${min}/m\u00b2/month (good-quality, below-prime office space)`);
    }
  }

  if (cityData.costs?.residentialRent) {
    const min = cityData.costs.residentialRent.min;
    const max = cityData.costs.residentialRent.max;
    if (min && max) {
      addClaim(`${cityName} residential rent: \u20ac${min}-${max}/month (1-bedroom ~50 m\u00b2, city center)`);
    } else if (min) {
      addClaim(`${cityName} residential rent: from \u20ac${min}/month (1-bedroom ~50 m\u00b2, city center)`);
    }
  }

  if (cityData.costs?.colIndex?.value) {
    addClaim(`${cityName} Cost of Living Plus Rent Index: ${cityData.costs.colIndex.value} (NYC=100, includes domestic rents; distinct from excl-rent index)`);
  }
}

function addCityDatabaseTalentClaims(addClaim, cityName, cityData) {
  const officialStem = cityData.talent?.graduates?.officialStem?.value;
  const techStemPlus = cityData.talent?.graduates?.digitalStemPlus?.value;
  const coreICT = cityData.talent?.graduates?.coreICT?.value;

  if (officialStem) {
    addClaim(`${cityName} Official STEM graduates (CNAEF 05+06+07): ${officialStem}/year`, true);
  }
  if (techStemPlus) {
    addClaim(`${cityName} Tech STEM+ graduates: ${techStemPlus}/year (internal benchmark estimate)`, true);
  }
  if (coreICT && officialStem) {
    const ictPct = ((coreICT / officialStem) * 100).toFixed(1);
    addClaim(`${cityName} Core ICT graduates (CNAEF 481+523): ${coreICT}/year (${ictPct}% of Official STEM)`, true);
  } else if (coreICT) {
    addClaim(`${cityName} Core ICT graduates (CNAEF 481+523): ${coreICT}/year`, true);
  }

  if (cityData.costs?.salaryIndex?.value) {
    addClaim(`${cityName} Salary Index: ${cityData.costs.salaryIndex.value} (Lisbon=100)`, true);
  }
}

function addCityDatabaseRegionalTotalsClaims(addClaim, regionalTotals) {
  if (!regionalTotals) return;

  for (const [regionName, totals] of Object.entries(regionalTotals)) {
    if (totals.officialStem != null) {
      addClaim(`${regionName} region total: ${totals.officialStem} Official STEM graduates (CNAEF 05+06+07, 2023/24)`);
    }
    if (totals.coreICT != null) {
      addClaim(`${regionName} region total: ${totals.coreICT} Core ICT graduates (CNAEF 481+523, 2023/24)`);
    }
    if (totals.digitalStemPlus != null) {
      addClaim(`${regionName} region total: ${totals.digitalStemPlus} Tech STEM+ graduates (internal benchmark estimate)`, true);
    }
  }
}

function generateCityDatabaseClaims(master) {
  const claims = [];
  let claimNum = 1;
  
  const addClaim = (text, internal = false) => {
    if (!text) return;
    claims.push({
      id: `CDB-${String(claimNum).padStart(2, '0')}`,
      claim: text.trim(),
      internal
    });
    claimNum++;
  };

  if (!master?.cities) return claims;

  // Get display order from config, fallback to alphabetical
  const displayOrder = master.config?.displayOrder || Object.keys(master.cities).sort((a, b) => a.localeCompare(b));
  
  for (const cityId of displayOrder) {
    const cityData = master.cities[cityId];
    if (!cityData) continue;
    
    const cityName = cityData.basic?.name?.value || 
                     cityId.charAt(0).toUpperCase() + cityId.slice(1);
    const region = cityData.basic?.region?.value || '';
    const regionTag = region ? ` [${region}]` : '';

    addCityDatabaseCostClaims(addClaim, cityName, regionTag, cityData);
    addCityDatabaseTalentClaims(addClaim, cityName, cityData);
  }

  addCityDatabaseRegionalTotalsClaims(addClaim, master.regionalTotals);

  return claims;
}

/**
 * Build the specialized City Database fact-check prompt.
 * This replaces the generic prompt template for cityDatabase with a
 * deeply-engineered prompt that forces tiered verification + reasoning.
 * @param {Array} allClaims - Claims from generateCityDatabaseClaims
 * @param {Object} methodology - Verification methodology from FACTCHECK_CLAIMS_v2
 * @returns {string} Complete fact-check prompt
 */
function buildCityDatabasePrompt(allClaims, methodology) {
  const externalClaims = allClaims.filter(c => !c.internal);
  const internalClaims = allClaims.filter(c => c.internal);
  const externalTable = externalClaims.length > 0
    ? externalClaims.map(c => `| ${c.id} | ${c.claim} |`).join('\n')
    : '| — | No external claims generated |';
  const internalTable = internalClaims.length > 0
    ? internalClaims.map(c => `| ${c.id} | ${c.claim} |`).join('\n')
    : '| — | No internal methodology claims generated |';
  const statusCodes = methodology?.statusCodes || [];

  const internalMethodSummary = internalClaims.length > 0
    ? `\nInternal methodology claims are included for reasonableness/arithmetic audit. For these, verify plausibility and formula consistency.`
    : '';

  const statusCodesTable = statusCodes.length > 0
    ? statusCodes.map(s => `| **${s.code}** | ${s.description} |`).join('\n')
    : '| **SUPPORTED** | Value confirmed within tolerance |\n| **PARTIALLY_SUPPORTED** | Directionally correct with material variance |\n| **CONTRADICTED** | Reliable source materially disagrees |\n| **UNVERIFIABLE** | No defensible verification basis |\n| **OUTDATED** | Source found but data period is stale |';

  return `# FACT-CHECK VERIFICATION PROMPT — Experimental v3
## Category: City Database (All Metrics)
> **Claims to verify:** ${allClaims.length} (${externalClaims.length} external + ${internalClaims.length} methodology)

---

## YOUR TASK

Verify every claim using independent evidence (web/official/public sources + defensible reasoning when direct sources are unavailable).
Treat claims as source-free input: do not treat prompt wording as evidence. Do not rely on any predefined source list; independently discover and evaluate evidence.${internalMethodSummary}

### RULES

1. **±5% default tolerance** for numeric checks unless claim type requires broader practical bounds.
2. **Freshness window:** prefer 2024-2026 evidence. Use OUTDATED when evidence for a current-market claim is materially older than 24 months.
3. **Reasoned fallback allowed:** if direct source is unavailable, provide best defensible estimate with explicit confidence and rationale.
4. **UNVERIFIABLE last:** use only when you genuinely have no defensible basis.
5. **Arithmetic checks required** for internal formula-style metrics (Tech STEM+, Core ICT ratios, salary-index logic checks).
6. **Practical market lens:** for office/residential ranges, judge whether a good-quality central non-prime option is realistically achievable now.

---

## CLAIMS TO VERIFY — COST METRICS (External Sources)

| ID | Claim |
|----|-------|
${externalTable}

---

## CLAIMS TO VERIFY — TALENT & SALARY (Methodology Audit)

| ID | Claim |
|----|-------|
${internalTable}

---

## REQUIRED OUTPUT FORMAT (JSONL)

Return a JSONL block first, then a short summary section.
Each JSON object MUST include:
- claim_id
- status
- verified_value
- source_url (URL if available, else "N/A")
- source_ref (publisher/report/query-snippet identifier)
- data_period (e.g., "2025", "Q1 2026", "2019-2024")
- confidence (HIGH|MEDIUM|LOW)
- practical_confidence_pct (integer 0-100)
- notes

\`\`\`jsonl
{"claim_id":"CDB-01","status":"SUPPORTED","verified_value":"€16-20/m²","source_url":"https://example.com/report","source_ref":"Independent market listing sample","data_period":"Q1 2026","confidence":"HIGH","practical_confidence_pct":87,"notes":"Range is consistent with current practical non-prime central market conditions."}
{"claim_id":"CDB-17","status":"PARTIALLY_SUPPORTED","verified_value":"~34 estimated","source_url":"N/A","source_ref":"Search snippet + regional comparable reasoning","data_period":"2026 estimate","confidence":"MEDIUM","practical_confidence_pct":64,"notes":"No direct city source found; estimate derived from rent/COL scaling."}
{"claim_id":"CDB-47","status":"CONTRADICTED","verified_value":"N/A","source_url":"N/A","source_ref":"Internal consistency audit","data_period":"Derived from claim inputs","confidence":"HIGH","practical_confidence_pct":92,"notes":"Claimed value is inconsistent with the documented internal metric definition."}
\`\`\`

### STATUS CODES (use exactly these)

| Code | When to Use |
|------|-------------|
${statusCodesTable}

---

## AFTER JSONL, PROVIDE SUMMARY

1. **Score:** X/${allClaims.length} SUPPORTED + PARTIALLY_SUPPORTED
2. **Corrections Needed:** Claims that should be updated with corrected values
3. **Arithmetic Failures:** Any internal formula checks that fail
4. **Confidence Assessment:** Overall reliability and weakest metric clusters
5. **Data Gaps:** Claims with lowest evidence availability

---

Begin verification.`;
}

/**
 * Generate Workforce/Talent claims from WEBSITE_CONTENT.json + COMPENSATION_DATA.json
 */
function addWorkforceStatisticsClaims(addClaim, content) {
  const stats = content?.workforceStatistics;
  if (!stats) return;

  if (stats.ictEmployment) {
    addClaim(`ICT specialists as % of employment: ${stats.ictEmployment.value}% (${stats.ictEmployment.year})`);
  }

  if (stats.techWorkforceTotal?.official) {
    const yearSuffix = stats.techWorkforceTotal.year ? ` (${stats.techWorkforceTotal.year})` : '';
    addClaim(`Total IT professionals (Eurostat): ~${stats.techWorkforceTotal.official.toLocaleString()}${yearSuffix}`);
  }

  if (stats.rankInEU?.value && stats.rankInEU?.totalCountries) {
    const rankYear = stats.rankInEU.year ? ` (${stats.rankInEU.year})` : '';
    addClaim(`EU rank by IT workforce size: ${stats.rankInEU.value}th of ${stats.rankInEU.totalCountries}${rankYear}`);
  }

  if (stats.annualGrowthRate?.value) {
    const method = stats.annualGrowthRate.method;
    const period = stats.annualGrowthRate.period || '';
    const methodSuffix = method ? ` (${method} ${period})` : '';
    addClaim(`Tech workforce annual growth rate: ~${stats.annualGrowthRate.value}%${methodSuffix}`.trim());
  }

  if (!stats.cityBreakdown || !stats.techWorkforceTotal?.official) return;

  const total = stats.techWorkforceTotal.official;
  stats.cityBreakdown.forEach((city) => {
    const pct = Math.round((city.official / total) * 100);
    const label = city.city === 'Others' ? 'Other cities' : city.city;
    addClaim(`${label}: ~${city.official.toLocaleString()} IT professionals (${pct}%)`);
  });
}

function addHiringInsightsClaims(addClaim, content) {
  const insights = content?.hiringInsights;
  if (!insights) return;

  if (insights.ictShortageSignal?.value) {
    addClaim(`ICT shortage signal: ${insights.ictShortageSignal.value}`);
  }

  if (insights.ictVacancyRate?.portugal?.value && insights.ictVacancyRate?.eu27?.value) {
    addClaim(`ICT vacancy rate: Portugal ${insights.ictVacancyRate.portugal.value}% vs EU27 ${insights.ictVacancyRate.eu27.value}% (${insights.ictVacancyRate.year})`);
  }

  if (insights.remoteWorkPenetration?.portugal && insights.remoteWorkPenetration?.eu27) {
    addClaim(
      `Remote work share: Portugal ${insights.remoteWorkPenetration.portugal.sometimes}% sometimes / ${insights.remoteWorkPenetration.portugal.usually}% usually; EU27 ${insights.remoteWorkPenetration.eu27.sometimes}% / ${insights.remoteWorkPenetration.eu27.usually}% (${insights.remoteWorkPenetration.year})`
    );
  }

  if (insights.regionalQualificationBaseline?.regions) {
    const regions = insights.regionalQualificationBaseline.regions;
    addClaim(`Regional tertiary education baseline: Lisbon Metro ${regions.lisbonMetropolitanArea}%, Norte ${regions.norte}%, Centro ${regions.centro}%, Algarve ${regions.algarve}% (${insights.regionalQualificationBaseline.year})`);
  }
}

function addLaborMarketClaims(addClaim, content) {
  const laborMarket = content?.laborMarket;
  if (laborMarket?.retention?.medianTenure) {
    addClaim(`Median tenure (Startup Portugal): ${laborMarket.retention.medianTenure.value} ${laborMarket.retention.medianTenure.unit}`);
  }
}

function addDamiaClaims(addClaim, content) {
  const benchmark = content?.laborMarket?.damiaBenchmark;
  if (!benchmark) return;

  if (benchmark.methodology?.window && benchmark.methodology?.sampleSize) {
    addClaim(`Damia salary benchmark methodology: ${benchmark.methodology.window} dataset with ${benchmark.methodology.sampleSize.toLocaleString()} candidates`);
  }
  if (benchmark.methodology?.basis) {
    addClaim(`Damia salary benchmark basis: ${benchmark.methodology.basis}`);
  }
  if (benchmark.methodology?.seniorityBands?.junior) {
    addClaim(`Damia seniority bands: Junior ${benchmark.methodology.seniorityBands.junior}, Mid ${benchmark.methodology.seniorityBands.mid}, Senior ${benchmark.methodology.seniorityBands.senior}`);
  }

  benchmark.roleSeniorityTable?.forEach((row) => {
    const levels = [];
    if (row.junior && row.junior !== '—') levels.push(`Junior ${row.junior}`);
    if (row.mid && row.mid !== '—') levels.push(`Mid ${row.mid}`);
    if (row.senior && row.senior !== '—') levels.push(`Senior ${row.senior}`);
    if (row.lead && row.lead !== '—') levels.push(`Lead/Management ${row.lead}`);
    if (levels.length > 0) {
      addClaim(`${row.role} salary range (annual gross): ${levels.join(', ')}`);
    }
    if (row.techStack && row.techStack !== '—') {
      addClaim(`${row.role} tech-stack context: ${row.techStack}`);
    }
  });

  benchmark.techStackSignals?.forEach((signal) => {
    addClaim(`Tech-stack market signal: ${signal}`);
  });
}

function addIneRegionalClaims(addClaim, compensation) {
  const ine = compensation?.ineRegionalEarnings;
  if (!ine?.regions || !ine?.displayOrder) return;

  const conversionFactor = 14 / 12;
  const baselineRegion = ine.regions[ine.lisbonBaselineRegion];
  const lisbonBachelor14x = baselineRegion?.[ine.lisbonBaselineField] || 1;

  ine.displayOrder.forEach((regionKey) => {
    const region = ine.regions[regionKey];
    if (!region || region.display === false) return;
    const bachelor14x = region[ine.lisbonBaselineField];
    if (bachelor14x == null) return;

    const bachelor12x = Math.round(bachelor14x * conversionFactor);
    const pctVsLisbon = ((bachelor14x / lisbonBachelor14x) * 100).toFixed(1);
    addClaim(`Average monthly earnings (12× equiv, Bachelor): ${region.name} €${bachelor12x.toLocaleString()} (${pctVsLisbon}% vs Lisbon)`);
  });
}

function generateWorkforceClaims(content, compensation) {
  const claims = [];
  let claimNum = 1;
  const addClaim = (text) => {
    if (!text) return;
    claims.push({ id: `WRK-${String(claimNum).padStart(2, '0')}`, claim: text.trim() });
    claimNum++;
  };

  addWorkforceStatisticsClaims(addClaim, content);
  addHiringInsightsClaims(addClaim, content);
  addLaborMarketClaims(addClaim, content);
  addDamiaClaims(addClaim, content);
  addIneRegionalClaims(addClaim, compensation);
  
  return claims;
}

/**
 * Generate Strategic & Tax claims from WEBSITE_CONTENT.json
 */
function addStrategicTaxClaims(addClaim, content) {
  const tax = content?.taxIncentives;
  if (!tax) return;

  if (tax.sifideII?.value) {
    addClaim(`SIFIDE II R&D Tax Credit: ${tax.sifideII.value}`);
    if (tax.sifideII.eligibleCosts) addClaim(`SIFIDE II eligible costs: ${tax.sifideII.eligibleCosts}`);
    if (tax.sifideII.application) addClaim(`SIFIDE II application: ${tax.sifideII.application}`);
  }

  if (tax.techVisa?.value) {
    addClaim(`Tech Visa (skilled immigration): ${tax.techVisa.value}`);
    if (tax.techVisa.detail) addClaim(`Tech Visa: ${tax.techVisa.detail}`);
  }

  if (tax.ifici?.value) {
    addClaim(`IFICI (scientific research & innovation tax regime): ${tax.ifici.value}`);
    if (tax.ifici.detail) addClaim(`IFICI: ${tax.ifici.detail}`);
  }

  if (!tax.corporateTax?.standard) return;
  addClaim(`Standard corporate tax rate (IRC): ${tax.corporateTax.standard}%`);
  if (tax.corporateTax.smeRate) {
    addClaim(`SME reduced IRC rate: ${tax.corporateTax.smeRate}% on first ${tax.corporateTax.smeThreshold ?? '€50,000'}`);
  }
  if (tax.corporateTax.surtaxes) {
    addClaim(`Corporate surtaxes: ${tax.corporateTax.surtaxes}`);
  }
}

function addStrategicConnectivityClaims(addClaim, content) {
  const geostrategic = content?.connectivity?.geostrategic;
  if (geostrategic?.uniquePosition) addClaim(geostrategic.uniquePosition);
  geostrategic?.reach?.forEach((reachItem) => addClaim(`Reach: ${reachItem}`));
  if (geostrategic?.latencyAdvantage) addClaim(geostrategic.latencyAdvantage);

  if (content?.connectivity?.sinesHub?.value) {
    addClaim(`Sines Hub: ${content.connectivity.sinesHub.value}`);
  }

  if (content?.connectivity?.subseaCables?.value) {
    addClaim(`Strategic subsea cables: ${content.connectivity.subseaCables.value.join(', ')}`);
  }
}

function addStrategicCostClaims(addClaim, content) {
  const col = content?.costOfLiving;
  if (!col) return;

  if (col.monthlyEssentials?.value) {
    const noteSuffix = col.monthlyEssentials.note ? ` (${col.monthlyEssentials.note})` : '';
    addClaim(`Monthly essentials (single, outside Lisbon): €${col.monthlyEssentials.value}${noteSuffix}`);
  }
  if (col.utilities?.value) {
    addClaim(`Utilities (${col.utilities.includes || 'electricity, water, internet'}): €${col.utilities.value}/month`);
  }
  if (col.comparisonToEurope?.value) {
    addClaim(`Cost of living (COL+Rent Index): ${col.comparisonToEurope.value} ${col.comparisonToEurope.label || 'cheaper than major European cities'}`);
  }
}

function addStrategicQualityOfLifeClaims(addClaim, content) {
  const qol = content?.qualityOfLife;
  if (!qol) return;

  if (qol.healthcare?.publicSystem) {
    addClaim(`Portugal: Universal public healthcare (${qol.healthcare.publicSystem.name}) — ${qol.healthcare.publicSystem.description}`);
  }
  if (qol.healthcare?.privateInsurance) {
    addClaim(`Portugal private health insurance: ${qol.healthcare.privateInsurance.costRange} — ${qol.healthcare.privateInsurance.details}`);
  }
  if (qol.healthcare?.ehci) {
    const healthcare = qol.healthcare.ehci;
    addClaim(`${healthcare.source}: Portugal ranked ${healthcare.rank}th / ${healthcare.totalCountries} ${healthcare.label} (${healthcare.year})`);
  }

  if (qol.safety?.gpi) {
    const safety = qol.safety.gpi;
    addClaim(`${safety.source}: Portugal ranked ${safety.rank}th ${safety.label} (${safety.year})`);
  }
  if (qol.safety?.crimeRate) {
    addClaim(`Portugal crime rate: ${qol.safety.crimeRate.value} — ${qol.safety.crimeRate.detail}`);
  }
  if (qol.safety?.political) {
    const political = qol.safety.political;
    addClaim(`Portugal: ${political.description}; EU member since ${political.euMemberSince}, NATO since ${political.natoMemberSince}`);
  }
}

function generateStrategicClaims(content) {
  const claims = [];
  let claimNum = 1;
  const addClaim = (text) => {
    if (!text) return;
    claims.push({ id: `STR-${String(claimNum).padStart(2, '0')}`, claim: text.trim() });
    claimNum++;
  };

  addStrategicTaxClaims(addClaim, content);
  addStrategicConnectivityClaims(addClaim, content);
  addStrategicCostClaims(addClaim, content);
  addStrategicQualityOfLifeClaims(addClaim, content);
  
  return claims;
}

/**
 * Generate University/Talent claims from WEBSITE_CONTENT.json
 */
function generateUniversityTalentClaims(content) {
  const claims = [];
  let claimNum = 1;
  const addClaim = (text) => {
    if (!text) return;
    claims.push({ id: `UNI-${String(claimNum).padStart(2, '0')}`, claim: text.trim() });
    claimNum++;
  };
  
  // Graduate flow clusters
  const gf = content?.graduateFlow;
  if (gf?.clusters?.value) {
    gf.clusters.value.forEach(cluster => {
      addClaim(`${cluster.name} cluster: ${cluster.cities} — talent sharing: ${cluster.sharing}`);
      if (cluster.note) addClaim(`${cluster.name}: ${cluster.note}`);
    });
  }
  if (gf?.lisbonPorto?.value) addClaim(`Lisbon-Porto commute: ${gf.lisbonPorto.value}`);
  
  // Labour market shortages
  const lm = content?.laborMarket;
  if (lm?.shortages?.value) addClaim(`Skills shortages: ${lm.shortages.value.join(', ')}`);
  if (lm?.competition?.value) addClaim(`Talent competition: ${lm.competition.value}`);
  if (lm?.salaryTrends?.value) addClaim(`Salary trends: ${lm.salaryTrends.value}`);
  
  // EURES-backed hiring baseline
  const hi = content?.hiringInsights?.regionalQualificationBaseline;
  if (hi?.regions) {
    addClaim(`Lisbon Metropolitan Area tertiary-educated active workforce: ${hi.regions.lisbonMetropolitanArea}% (${hi.year})`);
  }
  
  return claims;
}

/**
 * Populate claim counts dynamically from FACTCHECK_CLAIMS_v2.json.
 * Finds elements with data-category attribute and updates their text content.
 */
async function populateClaimCounts() {
  // Find all claim count elements with data-category attribute
  const countElements = document.querySelectorAll('[data-claims-category]');
  for (const el of countElements) {
    const categoryKey = el.dataset.claimsCategory;
    if (!categoryKey) continue;
    
    // For city profiles, generate claims dynamically
    if (categoryKey.startsWith('city:')) {
      const cityId = categoryKey.replace('city:', '');
      const allClaims = await generateCityClaimsFromSource(cityId);
      // Count only external (verifiable) claims
      const externalCount = allClaims.filter(c => !c.internal).length;
      el.textContent = `${externalCount} claims`;
    } else {
      // For data categories, generate claims dynamically from WEBSITE_CONTENT/MASTER
      const dynamicClaims = generateDataCategoryClaims(categoryKey);
      el.textContent = `${dynamicClaims.length} claims`;
    }
  }
}

function createCityClaimAdder(claims, prefix) {
  let claimNum = 1;

  return (text, internal = false) => {
    if (!text || text === 'undefined' || text === 'null') return;
    claims.push({
      id: `${prefix}-${String(claimNum).padStart(2, '0')}`,
      claim: text.trim(),
      internal,
    });
    claimNum++;
  };
}

function addCityMetaClaims(addClaim, profile, cityName) {
  if (profile._meta?.tagline) {
    addClaim(`${cityName}: "${profile._meta.tagline}"`);
  }
  if (profile._meta?.coverTags?.length) {
    addClaim(`${cityName} specialization domains: ${profile._meta.coverTags.join(', ')}`);
  }
}

function addCityTechCompanyClaims(addClaim, profile, cityName) {
  profile.ecosystem?.techCompanies?.value?.forEach((company) => {
    let text = `${company.name}`;
    if (company.sector) text += ` (${company.sector})`;
    if (company.description) text += `: ${company.description}`;
    if (company.notableFact) text += ` — ${company.notableFact}`;
    addClaim(text);
  });

  if (profile.ecosystem?.techCompanies?.count) {
    const note = profile.ecosystem.techCompanies.countNote || '';
    const noteSuffix = note ? ` (${note})` : '';
    addClaim(`${cityName}: ${profile.ecosystem.techCompanies.count}+ tech companies${noteSuffix}`);
  }
}

function addCityDomainClaims(addClaim, profile, cityName) {
  profile.ecosystem?.domains?.value?.forEach((domain) => {
    if (domain.name && domain.detail) {
      addClaim(`${cityName} domain: ${domain.name} — ${domain.detail}`);
    }
  });
}

function addCityCoworkingClaims(addClaim, profile, cityName) {
  profile.ecosystem?.coworking?.spaces?.forEach((space) => {
    addClaim(`${space.name} (${space.type})`);
  });

  if (profile.ecosystem?.coworking?.totalSpaces) {
    addClaim(`${profile.ecosystem.coworking.totalSpaces}+ coworking spaces in ${cityName}`);
  }
}

function addCityStudentOrgClaims(addClaim, profile) {
  profile.ecosystem?.studentOrgs?.value?.forEach((org) => {
    let text = `${org.name}`;
    if (org.description) text += `: ${org.description}`;
    if (org.url) text += ` (${org.url})`;
    addClaim(text);
  });
}

function addCityClusterClaims(addClaim, profile, cityName) {
  const clusters = profile.ecosystem?.clusters;
  if (clusters?.value) {
    addClaim(`${cityName}: ${clusters.value}`);
  }
  if (clusters?.regionalShare) {
    addClaim(`${cityName}: ${clusters.regionalShare}`);
  }
  if (clusters?.nearbyHub) {
    addClaim(`${cityName} nearby hub: ${clusters.nearbyHub}`);
  }
  if (clusters?.techClusterName) {
    addClaim(`Tech cluster: ${clusters.techClusterName}`);
  }
}

function addCityInfrastructureClaims(addClaim, profile, cityName) {
  const airport = profile.infrastructure?.airport;
  if (airport) {
    const iata = airport.iataCode || airport.iata || '';
    if (airport.name && airport.distanceKm) {
      const iataStr = iata ? ` (${iata})` : '';
      addClaim(`${airport.name}${iataStr}, ${airport.distanceKm}km from ${cityName}`);
    } else if (airport.name && airport.driveTime) {
      addClaim(`${cityName} airport access via ${airport.name}, ${airport.driveTime}`);
    }
  }

  profile.infrastructure?.commuteTimes?.routes?.forEach((route) => {
    const toCity = route.to.charAt(0).toUpperCase() + route.to.slice(1);
    addClaim(`${cityName} to ${toCity}: ${route.time} by ${route.mode}`);
  });

  const connectivity = profile.infrastructure?.connectivity;
  if (connectivity?.fiberPenetration) {
    addClaim(`${cityName} fiber penetration: ${connectivity.fiberPenetration}%`);
  }
  if (connectivity?.avgDownloadMbps) {
    addClaim(`${cityName} average download: ${connectivity.avgDownloadMbps} Mbps`);
  }
  if (connectivity?.latencyFrankfurt) {
    addClaim(`${cityName} latency to Frankfurt: ${connectivity.latencyFrankfurt}ms`);
  }
}

function addCityUniversityClaims(addClaim, profile, cityName) {
  const institutions = profile.universityDetail?.institutions;
  if (institutions) {
    institutions.forEach((institution) => {
      if (institution.type !== 'university') return;
      const parent = institution.parent ? ` — ${institution.parent}` : '';
      addClaim(`${institution.name}${parent}`);
      if (institution.programs?.length) {
        addClaim(`${institution.name} programs: ${institution.programs.join(', ')}`);
      }
    });

    institutions.forEach((institution) => {
      if (institution.type === 'research' && institution.focus) {
        addClaim(`${institution.name}: ${institution.focus.join(', ')}`);
      }
    });
  }

  if (profile.universityDetail?.talentProfile?.value) {
    addClaim(`${cityName} talent: ${profile.universityDetail.talentProfile.value}`);
  }
}

function addCityClimateClaims(addClaim, profile, cityName) {
  const climate = profile.culture?.climate;
  if (!climate) return;

  if (climate.sunshineHours && climate.type) {
    addClaim(`${cityName}: ~${climate.sunshineHours} sunshine hours/year, ${climate.type} climate`);
  }
  if (climate.avgTempSummer != null && climate.avgTempWinter != null) {
    addClaim(`${cityName} temperatures: ${climate.avgTempWinter}°C winter avg, ${climate.avgTempSummer}°C summer avg`);
  }
  if (climate.rainDays) {
    addClaim(`${cityName}: ~${climate.rainDays} rain days/year`);
  }
  if (climate.seaInfluence) {
    addClaim(`${cityName} climate influence: ${climate.seaInfluence}`);
  }
  if (climate.bestMonths?.length) {
    addClaim(`${cityName} best months: ${climate.bestMonths.join(', ')}`);
  }
}

function addCityQualityOfLifeClaims(addClaim, profile, cityName) {
  const qualityOfLife = profile.culture?.qualityOfLife;
  if (qualityOfLife?.walkability) addClaim(`${cityName} walkability: ${qualityOfLife.walkability}`);
  if (qualityOfLife?.healthcare) addClaim(`${cityName} healthcare: ${qualityOfLife.healthcare}`);
  if (qualityOfLife?.culture) addClaim(`${cityName} culture: ${qualityOfLife.culture}`);
}

function addCityRetentionClaims(addClaim, profile, cityName) {
  const retention = profile.culture?.retention;
  if (retention?.narrative) addClaim(`${cityName}: ${retention.narrative}`);
  if (retention?.strengths?.length) addClaim(`${cityName} strengths: ${retention.strengths.join(', ')}`);
  if (retention?.risks?.length) addClaim(`${cityName} risks: ${retention.risks.join(', ')}`);
}

function addCityCultureClaims(addClaim, profile, cityName) {
  addCityClimateClaims(addClaim, profile, cityName);
  addCityQualityOfLifeClaims(addClaim, profile, cityName);
  addCityRetentionClaims(addClaim, profile, cityName);
}

function addCityMasterCostClaims(addClaim, cityData, cityName) {
  if (cityData.costs?.officeRent?.min || cityData.costs?.officeRent?.max) {
    const min = cityData.costs.officeRent.min;
    const max = cityData.costs.officeRent.max;
    if (min && max) {
      addClaim(`${cityName} office rent: \u20ac${min}-${max}/m\u00b2/month (good-quality, below-prime office space)`);
    } else if (min) {
      addClaim(`${cityName} office rent: from \u20ac${min}/m\u00b2/month (good-quality, below-prime office space)`);
    }
  }

  if (cityData.costs?.residentialRent?.min || cityData.costs?.residentialRent?.max) {
    const min = cityData.costs.residentialRent.min;
    const max = cityData.costs.residentialRent.max;
    if (min && max) {
      addClaim(`${cityName} residential rent: \u20ac${min}-${max}/month (1-bedroom ~50 m\u00b2, city center)`);
    } else if (min) {
      addClaim(`${cityName} residential rent: from \u20ac${min}/month (1-bedroom ~50 m\u00b2, city center)`);
    }
  }

  if (cityData.costs?.colIndex?.value) {
    addClaim(`${cityName} Cost of Living Plus Rent Index: ${cityData.costs.colIndex.value} (NYC=100, includes domestic rents; distinct from excl-rent index)`);
  }
}

function addCityMasterMetricClaims(addClaim, cityData, cityName) {
  if (!cityData) return;

  addCityMasterCostClaims(addClaim, cityData, cityName);
  addCityDatabaseTalentClaims(addClaim, cityName, cityData);
}

/**
 * Generate claims dynamically from CITY_PROFILES.json + MASTER.json for a given city.
 * Extracts ALL displayable data for comprehensive fact-checking.
 * 
 * @param {string} cityId - City identifier (e.g., 'braga', 'lisbon')
 * @returns {Promise<Array>} Array of claim objects {id, claim, internal?}
 */
async function generateCityClaimsFromSource(cityId) {
  const profile = getCityProfile(cityId);
  const cityData = getCity(cityId);
  if (!profile) return [];

  const claims = [];
  const prefix = cityId.substring(0, 3).toUpperCase();
  const addClaim = createCityClaimAdder(claims, prefix);

  // Use proper city name with diacritics from DB
  const cityName = cityData?.basic?.name?.value || cityId.charAt(0).toUpperCase() + cityId.slice(1);

  addCityMetaClaims(addClaim, profile, cityName);
  addCityTechCompanyClaims(addClaim, profile, cityName);
  addCityDomainClaims(addClaim, profile, cityName);
  addCityCoworkingClaims(addClaim, profile, cityName);
  addCityStudentOrgClaims(addClaim, profile);
  addCityClusterClaims(addClaim, profile, cityName);
  addCityInfrastructureClaims(addClaim, profile, cityName);
  addCityUniversityClaims(addClaim, profile, cityName);
  addCityCultureClaims(addClaim, profile, cityName);
  addCityMasterMetricClaims(addClaim, cityData, cityName);

  return claims;
}

/**
 * Generate a fact-check verification prompt for the selected category.
 * v2.3 — Dynamic claims from source DBs with unified JSONL output contract.
 * @returns {Promise<string>} The formatted fact-check prompt
 */
function getFactcheckCategoryLabel(categoryKey) {
  const categoryLabels = {
    macroeconomic: 'Macroeconomic',
    digitalInfra: 'Digital Infrastructure',
    officeRent: 'Office Rent',
    residentialRent: 'Residential Rent',
    workforce: 'Workforce Talent',
    strategic: 'Strategic & Tax',
    taxIncentives: 'Strategic & Tax',
    universityTalent: 'University Talent',
    graduates: 'University Talent',
    cityDatabase: 'City Database (All Metrics)',
  };

  return categoryLabels[categoryKey] || categoryKey;
}

function getCategoryTaskContext(categoryKey) {
  if (categoryKey === 'officeRent') {
    return `

### CATEGORY CONTEXT — OFFICE RENT (Read First)

- These office-rent values are from a database pipeline based on live market observations and human review.
- Scope is **practical offices** that real SMEs and operating teams typically rent: **central locations, good-quality non-prime offices, ~60–300 m²**.
- This is **not a prime-CBD institutional benchmark** (e.g., brokerage prime series used for large corporations).
- Treat this as a **practical operating benchmark, not a scientific market index**.
- If direct city-level sources are missing, switch to **reasoning mode**: use nearby-city comparables and market structure, and estimate whether the range is realistic for practical use right now.
- Use **UNVERIFIABLE only as last resort** when you genuinely have no defensible basis for estimation.
`;
  }

  if (categoryKey === 'residentialRent') {
    return `

### CATEGORY CONTEXT — RESIDENTIAL RENT (Read First)

- These residential-rent values are from a database pipeline based on live market observations and human review.
- Scope is **practical 1-bedroom housing** that companies and hires commonly use for relocation planning: **modern 1BR units, central areas, ~40–60 m²**.
- This is intended for **real hiring/relocation budgeting**, not for luxury or investor-grade segmentation.
- Treat this as a **practical operating benchmark, not a scientific housing index**.
- If direct city-level sources are missing, switch to **reasoning mode**: use nearby-city comparables and market structure, and estimate whether the range is realistic for practical use right now.
- Use **UNVERIFIABLE only as last resort** when you genuinely have no defensible basis for estimation.
`;
  }

  return '';
}

function getInternalMethodologyWarning(internalClaims) {
  if (internalClaims.length === 0) return '';

  return `
---

## METRIC DEFINITIONS (READ CAREFULLY)

### Cost Metrics (VERIFY via independent market evidence)

| Metric | Definition | Verification Approach |
|--------|------------|----------------------|
| **Office Rent** | Good-quality central non-prime office asking rent, €/m²/month | Verify practical achievability using independent public market evidence and local comparables. |
| **Residential Rent** | T1 (1-bedroom) central apartments, €/month | Verify practical ranges from independent public evidence; account for neighborhood variance. |
| **COL Index** | Cost of Living **Plus Rent** Index (NYC = 100, includes domestic rents) | Verify index plausibility from independent comparative datasets; ensure it's the plus-rent variant. |

### Internal Calculations (VERIFY IF REASONABLE — not if they exist)

These metrics use our **internal methodology**. You cannot find these exact numbers online. Instead, verify if they are **plausible** given the city's context.

| Metric | Our Definition | How to Verify Reasonableness |
|--------|----------------|------------------------------|
| **Official STEM** | DGEEC graduates in CNAEF codes 05,06,07 | Check if city has universities offering STEM in quantitative sciences, ICT, and engineering. Compare to city size. |
| **Tech STEM+** | Internal benchmark estimate for hiring-relevant digital talent | Validate directional plausibility against university mix, local specialization, and labor-market context. |
| **Core ICT** | CNAEF 481 (CS) + 523 (Electronics) — pure IT specialists | Typically 10-20% of Tech STEM+. |
| **Salary Index** | Regional wages indexed to Lisbon=100, adjusted for cost of living | Interior cities should be 70-85. Porto/Lisbon area 90-100. |

**For internal calculations:** Mark as SUPPORTED if numbers are **reasonable given the city's profile** (university count, population, COL). Mark as CONTRADICTED if clearly implausible or mathematically inconsistent.
`;
}

async function buildCityFactcheckContext(categoryKey) {
  const cityId = categoryKey.replace('city:', '');
  const profile = getCityProfile(cityId);

  if (!profile) {
    return { error: `⚠️ City "${cityId}" not found in CITY_PROFILES database.` };
  }

  const allClaims = await generateCityClaimsFromSource(cityId);
  if (allClaims.length === 0) {
    return { error: `⚠️ No claims could be generated for ${cityId}. Check CITY_PROFILES.json data.` };
  }

  const internalClaims = allClaims.filter((claim) => claim.internal);
  const cityLabelBase = profile._meta?.cityId || cityId;

  return {
    categoryLabel: `${cityLabelBase.charAt(0).toUpperCase()}${cityLabelBase.slice(1)} City Database`,
    verifiableClaims: allClaims,
    internalWarning: getInternalMethodologyWarning(internalClaims),
    categoryTaskContext: '',
  };
}

function buildDataFactcheckContext(categoryKey, methodology) {
  const verifiableClaims = generateDataCategoryClaims(categoryKey);
  if (verifiableClaims.length === 0) {
    return { error: `⚠️ No claims could be generated for "${categoryKey}". Check WEBSITE_CONTENT.json or MASTER.json data.` };
  }

  if (categoryKey === 'cityDatabase') {
    return { specialPrompt: buildCityDatabasePrompt(verifiableClaims, methodology) };
  }

  return {
    categoryLabel: getFactcheckCategoryLabel(categoryKey),
    verifiableClaims,
    internalWarning: '',
    categoryTaskContext: getCategoryTaskContext(categoryKey),
  };
}

function buildInternalClaimsSection(internalClaimsOnly) {
  if (internalClaimsOnly.length === 0) return '';

  const internalClaimsTable = internalClaimsOnly
    .map((claim) => `| ${claim.id} | ${claim.claim} |`)
    .join('\n');

  return `

---

## INTERNAL METHODOLOGY CLAIMS (Verify if REASONABLE)

These use our internal calculations. Check if the numbers **make sense** given the city's context.

| ID | Claim |
|----|-------|
${internalClaimsTable}`;
}

async function generateFactCheckPrompt() {
  const selected = document.querySelector('input[name="factcheck-category"]:checked');
  if (!selected) {
    return '⚠️ Please select a category to fact-check.';
  }

  const categoryKey = selected.value;
  const claimsDb = await loadFactcheckClaims();
  
  // Get methodology from claims DB
  const methodology = claimsDb?.verificationMethodology;
  if (!methodology) {
    return '⚠️ Could not load verification methodology from claims database.';
  }

  const context = categoryKey.startsWith('city:')
    ? await buildCityFactcheckContext(categoryKey)
    : buildDataFactcheckContext(categoryKey, methodology);

  if (context.error) {
    return context.error;
  }

  if (context.specialPrompt) {
    return context.specialPrompt;
  }

  const {
    verifiableClaims,
    categoryLabel,
    internalWarning,
    categoryTaskContext,
  } = context;
  const categoryLabelText = typeof categoryLabel === 'string'
    ? categoryLabel
    : String(categoryLabel ?? categoryKey);

  // Build claims list — separate internal and external for city profiles
  const externalClaimsOnly = verifiableClaims.filter(c => !c.internal);
  const internalClaimsOnly = verifiableClaims.filter(c => c.internal);
  
  let claimsList = '';
  
  if (externalClaimsOnly.length > 0) {
    claimsList += externalClaimsOnly.map(c => {
      let line = `| ${c.id} | ${c.claim} |`;
      if (c.note) line += ` _(${c.note})_`;
      return line;
    }).join('\n');
  }
  
  const internalClaimsSection = buildInternalClaimsSection(internalClaimsOnly);

  // Status codes
  const statusCodes = methodology.statusCodes.map(s => 
    `| ${s.code} | ${s.description} |`
  ).join('\n');

  const prompt = `# FACT-CHECK VERIFICATION PROMPT — Experimental v3
## Category: ${categoryLabelText}
> **Claims to verify:** ${verifiableClaims.length} (${externalClaimsOnly.length} external + ${internalClaimsOnly.length} methodology)

---

## YOUR TASK

Verify each claim below using independent evidence (web/official/public sources + defensible reasoning where direct sources are unavailable). Treat claim text as source-free input; do not use prompt wording itself as proof.
${categoryTaskContext}

### RULES

1. **±5% TOLERANCE** — Values within 5% of claimed = SUPPORTED
2. **FRESHNESS WINDOW** — Prefer 2024-2026 evidence. Use OUTDATED when evidence for a current-market claim is materially older than 24 months.
3. **REASON FIRST** — If direct data is unavailable, estimate from the best available evidence (comparables, regional patterns, known market anchors). Do not stop early.
4. **UNVERIFIABLE LAST** — Use UNVERIFIABLE only when you truly have no defensible basis for estimation.
5. **PRACTICAL JUDGMENT** — Judge practical market plausibility: can a good central quality office/apartment be rented at that range now?
6. **SOURCE TRANSPARENCY** — For each claim include source_url (or N/A), source_ref, and data_period.
7. **NO PRESET SOURCES** — Do not assume any predefined source list; independently find and evaluate evidence.
${internalWarning}

---

## CLAIMS TO VERIFY (External Sources)

| ID | Claim |
|----|-------|
${claimsList}
${internalClaimsSection}

---

## REQUIRED OUTPUT FORMAT (JSONL)

Return a JSONL block first, then the summary section. Include exactly one JSON object per claim.
Each JSON object MUST include:
- claim_id
- status
- verified_value
- source_url (URL if available, else "N/A")
- source_ref
- data_period
- confidence (HIGH|MEDIUM|LOW)
- practical_confidence_pct (integer 0-100)
- notes

\`\`\`jsonl
{"claim_id":"${verifiableClaims[0]?.id || 'XXX-01'}","status":"SUPPORTED","verified_value":"<actual value you found or estimate>","source_url":"<url or N/A>","source_ref":"<publisher/report/query-snippet>","data_period":"<year/quarter/range>","confidence":"MEDIUM","practical_confidence_pct":82,"notes":"<brief explanation of evidence + practical plausibility>"}
\`\`\`

The field practical_confidence_pct is **required** for every claim and must be an integer **0-100**:
- **100** = practically certain and market-realistic now
- **0** = completely unlikely/unreasonable for practical use
- Use intermediate scores when uncertainty exists

### STATUS CODES (use exactly these)

| Code | When to Use |
|------|-------------|
${statusCodes}

---

## AFTER JSONL, PROVIDE SUMMARY

1. **Score:** X/Y SUPPORTED + PARTIALLY_SUPPORTED (e.g., "7/9 acceptable")
2. **Corrections Needed:** List any claims that need updating, with the correct value
3. **Confidence Assessment:** Based on your findings, is this category reliable?
4. **Average Practical Confidence:** Mean of all practical_confidence_pct values (0-100%)

---

Begin verification.`;

  return prompt;
}

/**
 * Validate simulator prerequisites before prompt generation.
 * Throws with actionable error messages so users never get a silent failure.
 */
function assertSimulatorReady() {
  const store = getStore();
  if (!store?.master?.cities || Object.keys(store.master.cities).length === 0) {
    throw new Error('City database not loaded yet. Please wait 1-2 seconds and try again.');
  }
  if (!store?.compensation?.baseBands) {
    throw new Error('Compensation database not loaded. Please refresh and try again.');
  }
}

function selectTextContent(element) {
  const selection = globalThis.getSelection();
  if (!selection) return false;

  const range = document.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}

function clearTextSelection() {
  globalThis.getSelection()?.removeAllRanges();
}

/**
 * Initialize the AI Simulator form and buttons.
 */
export function initSimulator() {
  const generateBtn = document.getElementById('generate-prompt-btn');
  const copyBtn = document.getElementById('copy-prompt-btn');
  const outputEl = document.getElementById('simulator-output');

  if (!generateBtn || !outputEl) {
    console.error('[Simulator] Missing required UI elements for prompt generation.');
    return;
  }

  /**
   * Harden free-text and numeric user input fields.
   * - Normalizes budget/capex/team-size to deterministic integer form on blur.
   * - Sanitizes text fields to reduce injection-style payload risk in generated prompts.
   */
  function initInputHardening() {
    const numericFieldIds = ['sim-opex-budget', 'sim-capex-budget'];
    const textFieldConfig = [
      { id: 'sim-purpose', maxLen: 600 },
      { id: 'sim-timezone', maxLen: 120 },
      { id: 'sim-searched-stack-other', maxLen: 180 },
      { id: 'sim-dealbreakers', maxLen: 260 },
    ];

    numericFieldIds.forEach((id) => {
      const field = document.getElementById(id);
      if (!field) return;

      field.addEventListener('input', () => {
        field.value = field.value.replaceAll(/[^\d.,\s€]/g, '');
      });

      field.addEventListener('blur', () => {
        const parsed = parseLocalizedInteger(field.value);
        field.value = parsed ? String(parsed) : '';
      });
    });

    const teamSizeField = document.getElementById('sim-team-size');
    if (teamSizeField) {
      teamSizeField.addEventListener('input', () => {
        teamSizeField.value = teamSizeField.value.replaceAll(/[^\d\s\-–a-z]/gi, '');
      });

      teamSizeField.addEventListener('blur', () => {
        const parsed = parseTeamSize(teamSizeField.value);
        teamSizeField.value = parsed ? String(parsed) : '';
      });
    }

    textFieldConfig.forEach(({ id, maxLen }) => {
      const field = document.getElementById(id);
      if (!field) return;
      field.addEventListener('blur', () => {
        field.value = sanitizeFreeText(field.value, maxLen);
      });
    });
  }

  /**
   * Keep role options aligned with COMPENSATION_DATA baseBands.
   * This ensures newly added salary roles appear automatically in the form.
   */
  function syncRoleTypeCheckboxes() {
    const roleGroup = document.getElementById('sim-role-type-group');
    if (!roleGroup) return;

    const roleRows = getStore()?.content?.national?.laborMarket?.damiaBenchmark?.roleSeniorityTable || [];
    const roleLabels = roleRows
      .map((row) => row?.role)
      .filter(Boolean);

    const baseRole = 'Software Engineer (ICT/CS)';
    const allRoles = roleLabels.length > 0
      ? [baseRole, ...roleLabels.filter((role) => role !== baseRole)]
      : [baseRole];

    roleGroup.innerHTML = '';
    allRoles.forEach((roleLabel) => {
      const label = document.createElement('label');
      label.className = 'checkbox-label';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'roleType';
      input.value = roleLabel;
      input.dataset.bandKey = mapRoleLabelToBandKey(roleLabel);
      input.checked = roleLabel === baseRole;

      label.appendChild(input);
      label.append(` ${roleLabel}`);
      roleGroup.appendChild(label);
    });
  }

  function validateRequiredMathInputs() {
    const validations = [
      {
        id: 'sim-opex-budget',
        label: 'Monthly OpEx Budget',
        parser: parseLocalizedInteger,
        invalidMessage: 'enter a valid positive amount (e.g., 55000, 55,000, 55.000)',
      },
      {
        id: 'sim-team-size',
        label: 'Target Team Size',
        parser: parseTeamSize,
        invalidMessage: 'enter a valid team size (e.g., 10)',
      },
    ];

    const errors = [];

    validations.forEach(({ id, label, parser, invalidMessage }) => {
      const field = document.getElementById(id);
      const rawValue = field?.value?.trim() || '';
      const parsedValue = parser(rawValue);
      const isValid = parsedValue !== null;

      if (field) {
        field.setAttribute('aria-invalid', isValid ? 'false' : 'true');
      }

      if (!isValid) {
        errors.push(`${label}: ${invalidMessage}.`);
      }
    });

    return errors;
  }

  // ── Spell-casting loading sequence ──
  const SPELL_STEPS = [
    { icon: 'fa-magnifying-glass-chart', text: 'Analysing input…' },
    { icon: 'fa-ranking-star',           text: 'Computing feasibility ranking…' },
    { icon: 'fa-user-tie',               text: 'Instructing advisor…' },
    { icon: 'fa-dragon',                 text: 'Adding snakeskin…' },
    { icon: 'fa-rotate',                 text: 'Steering 3 times clockwise…' },
    { icon: 'fa-droplet',                text: '3 drops of dragon\'s blood…' },
    { icon: 'fa-hat-wizard',             text: 'Hex hex!' },
  ];

  function runSpellSequence(prompt) {
    const loader = document.getElementById('spell-loader');
    const stepEl = document.getElementById('spell-step');
    const fillEl = document.getElementById('spell-fill');
    if (!loader || !stepEl || !fillEl) {
      // Fallback: show prompt immediately
      outputEl.textContent = prompt;
      if (copyBtn) copyBtn.disabled = false;
      outputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Fade out the button, show loader
    generateBtn.classList.add('fade-out');
    setTimeout(() => {
      generateBtn.style.display = 'none';
      loader.hidden = false;

      const totalSteps = SPELL_STEPS.length;
      const stepDuration = 6500 / totalSteps; // ~640ms each, 4.5s total
      let i = 0;

      function showStep() {
        if (i >= totalSteps) {
          // Done — reveal prompt
          loader.hidden = true;
          generateBtn.style.display = '';
          generateBtn.classList.remove('fade-out');
          outputEl.textContent = prompt;
          if (copyBtn) copyBtn.disabled = false;
          outputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        const step = SPELL_STEPS[i];
        // Re-trigger pop animation
        stepEl.style.animation = 'none';
        stepEl.getBoundingClientRect();
        stepEl.style.animation = '';
        stepEl.innerHTML = `<i class="fa-solid ${step.icon}" aria-hidden="true"></i> ${step.text}`;
        fillEl.style.width = `${((i + 1) / totalSteps) * 100}%`;
        i++;
        setTimeout(showStep, stepDuration);
      }

      fillEl.style.width = '0%';
      showStep();
    }, 350); // wait for button fade-out
  }

  // Generate prompt
  generateBtn.addEventListener('click', () => {
    try {
      assertSimulatorReady();

      const inputErrors = validateRequiredMathInputs();
      if (inputErrors.length > 0) {
        throw new Error(`Please complete required fields before generating:\n- ${inputErrors.join('\n- ')}`);
      }

      const prompt = generateMasterPrompt();
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        throw new Error('Prompt generation returned empty output.');
      }

      // Run the spell-casting loading sequence, then reveal
      runSpellSequence(prompt);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown simulator error.';
      console.error('[Simulator] Prompt generation failed:', err);
      outputEl.textContent = `❌ Simulator prompt generation failed.\n\nReason: ${msg}\n\nTry: reload the page, wait for data to finish loading, and click Generate again.`;
      if (copyBtn) copyBtn.disabled = true;
    }
  });

  // Copy to clipboard
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const originalHTML = copyBtn.innerHTML;
      try {
        await navigator.clipboard.writeText(outputEl.textContent);
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Copied!';

        // Flash AI link cards
        const aiLinks = document.querySelectorAll('.ai-link-card');
        aiLinks.forEach((link, i) => {
          setTimeout(() => {
            link.style.animation = 'none';
            link.getBoundingClientRect(); // reflow
            link.style.animation = 'ai-link-flash 0.6s ease';
          }, i * 100);
        });

        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = originalHTML;
        }, 2500);
      } catch {
        if (!selectTextContent(outputEl)) return;
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<i class="fa-solid fa-keyboard" aria-hidden="true"></i> Press Ctrl+C';
        setTimeout(() => {
          clearTextSelection();
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = originalHTML;
        }, 2500);
      }
    });
  }

  // Form conditional logic is non-critical; never block simulator if it fails
  try {
    syncRoleTypeCheckboxes();
    initInputHardening();
    initFormConditionalLogic();
  } catch (err) {
    console.warn('[Simulator] Conditional UI init failed:', err);
  }

  // Fact-check generator is independent; isolate failures from simulator button path
  try {
    initFactCheckGenerator();
  } catch (err) {
    console.warn('[Simulator] Fact-check init failed:', err);
  }
}

/**
 * Initialize the Fact-Check Prompt Generator in verification archive.
 */
function initFactCheckGenerator() {
  const generateBtn = document.getElementById('generate-factcheck-btn');
  const copyBtn = document.getElementById('btn-copy-factcheck');
  const outputEl = document.getElementById('factcheck-prompt-text');
  const outputContainer = document.getElementById('factcheck-output-container');
  const noteEl = document.getElementById('factcheck-note');

  if (!generateBtn || !outputEl) return;

  // Populate claim counts dynamically
  populateClaimCounts();

  // Generate fact-check prompt
  generateBtn.addEventListener('click', async () => {
    const prompt = await generateFactCheckPrompt();
    outputEl.textContent = prompt;
    
    // Show output container
    if (outputContainer) {
      outputContainer.style.display = 'block';
    }
    if (noteEl) {
      noteEl.style.display = 'block';
    }
    if (copyBtn) {
      copyBtn.disabled = false;
    }
    
    outputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Copy to clipboard
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const originalHTML = copyBtn.innerHTML;
      try {
        await navigator.clipboard.writeText(outputEl.textContent);
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Copied!';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = originalHTML;
        }, 2500);
      } catch {
        if (!selectTextContent(outputEl)) return;
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<i class="fa-solid fa-keyboard" aria-hidden="true"></i> Press Ctrl+C';
        setTimeout(() => {
          clearTextSelection();
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = originalHTML;
        }, 2500);
      }
    });
  }
}

/**
 * Toggle office fields visibility based on work model selection.
 */
function initFormConditionalLogic() {
  const workModelSelect = document.getElementById('sim-work-model');
  const officeQualityField = document.getElementById('office-quality-field');
  const officeStrategyField = document.getElementById('office-strategy-field');

  if (!workModelSelect || !officeQualityField || !officeStrategyField) return;

  const toggleOfficeFields = () => {
    const isRemote = workModelSelect.value === 'fully-remote';
    const opacity = isRemote ? '0.5' : '1';
    const pointerEvents = isRemote ? 'none' : 'auto';
    officeQualityField.style.opacity = opacity;
    officeQualityField.style.pointerEvents = pointerEvents;
    officeStrategyField.style.opacity = opacity;
    officeStrategyField.style.pointerEvents = pointerEvents;
  };

  workModelSelect.addEventListener('change', toggleOfficeFields);
  toggleOfficeFields(); // Init on load
}


