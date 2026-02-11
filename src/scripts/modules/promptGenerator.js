/**
 * PROMPT GENERATOR MODULE
 * AI Nearshoring Simulator — collects form inputs + database data,
 * generates V4.8.1 prompt, handles UI (generate, copy, conditional fields).
 *
 * Reads from 4 normalized databases instead of legacy 3-DB system.
 */

import { getStore, getCity, getCityProfile, getNationalData, getCompensationData, getCityDisplayOrder, getChartConfig, getRegionalTotals } from './database.js';
import { buildPromptTemplate } from './promptTemplate.js';

/* ═══════════════════════════════════════════════════════════════════════════
 * DATA COLLECTION — Build portugalData from normalized databases
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Get regional STEM+ graduate pool for a city by looking up its NUTS region
 * in MASTER.json → city.basic.region.value → regionalTotals.
 * @param {string} cityId
 * @param {Object} cityData — city entry from MASTER.json
 * @returns {number} Digital STEM+ regional total
 */
function getRegionalPool(cityId, cityData) {
  const region = cityData?.basic?.region?.value;
  if (!region) return 500; // safe fallback
  const totals = getRegionalTotals(region);
  return totals?.digitalStemPlus ?? 500;
}

/**
 * Extract city metadata (climate, QoL, coworking, airport) from CITY_PROFILES.json.
 * Replaces the former hardcoded CITY_METADATA object.
 * @param {string} cityId
 * @returns {Object} { climate, qolScore, coworking, airportHub, timezone }
 */
function getCityMeta(cityId) {
  const profile = getCityProfile(cityId);
  if (!profile) {
    return { climate: null, qolScore: null, coworking: null, airportHub: null, timezone: 'WET (UTC+0), 1h behind CET' };
  }

  // Climate from culture.climate
  const climateData = profile.culture?.climate;
  const climate = climateData?.value ?? null;

  // Quality of life from culture.retention + culture.qualityOfLife
  const retention = profile.culture?.retention;
  const qolData = profile.culture?.qualityOfLife;
  const qolScore = qolData?.walkability
    ? `${qolData.walkability}${qolData.culture ? `, ${qolData.culture}` : ''}`
    : (retention?.narrative?.substring(0, 80) ?? null);

  // Coworking from ecosystem.coworking
  const coworkingData = profile.ecosystem?.coworking;
  let coworking = null;
  if (coworkingData) {
    const names = (coworkingData.spaces || []).map(s => s.name).slice(0, 3).join(', ');
    const total = coworkingData.totalSpaces || coworkingData.description || '';
    coworking = names ? `${total ? total + '+ spaces' : 'Available'} (${names})` : (coworkingData.description ?? null);
  }

  // Airport from infrastructure.airport
  const airportData = profile.infrastructure?.airport;
  let airportHub = null;
  if (airportData) {
    airportHub = airportData.iataCode
      ? `${airportData.iataCode}${airportData.driveTime ? ` — ${airportData.driveTime}` : ''}`
      : airportData.name ?? null;
  }

  return {
    climate,
    qolScore,
    coworking,
    airportHub,
    timezone: 'WET (UTC+0), 1h behind CET',
  };
}

/**
 * Parse rent string "€12–€18" into { min, max, mid } object.
 */
function parseRent(rentStr) {
  if (!rentStr) return { min: 12, max: 18, mid: 15 };
  const match = rentStr.match(/€?(\d+)[–-]€?(\d+)/);
  if (match) {
    const min = parseInt(match[1]);
    const max = parseInt(match[2]);
    return { min, max, mid: (min + max) / 2 };
  }
  return { min: 12, max: 18, mid: 15 };
}

/**
 * Parse percentage string "19.1%" into number 19.1.
 */
function parsePct(pctStr) {
  if (!pctStr && pctStr !== 0) return 15;
  return parseFloat(String(pctStr).replace('%', '')) || 15;
}

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
    };
  }

  // Add mixed/blended if not present
  if (!bands['mixed']) {
    bands['mixed'] = { min: 2800, mid: 3200, max: 3600, label: 'Mixed roles (blended)' };
  }

  return bands;
}

/**
 * Build tier multipliers from COMPENSATION_DATA.json.
 */
function buildTierMultipliers(compData) {
  if (!compData?.seniorityMultipliers) {
    return { junior: 0.85, mid: 1.00, senior: 1.25, lead: 1.40 };
  }
  const tiers = {};
  for (const [key, tier] of Object.entries(compData.seniorityMultipliers)) {
    // Normalize keys: midLevel→mid, leadPrincipal→lead
    const normKey = key === 'midLevel' ? 'mid' : key === 'leadPrincipal' ? 'lead' : key;
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
      'core-backend': 0, frontend: 0.05, 'mobile-native': 0.10,
      'devops-cloud': 0.15, 'systems-rust': 0.25, 'ml-mlops': 0.25,
      security: 0.30, blockchain: 0.40,
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
 * Reads from MASTER.json and CITY_PROFILES.json.
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
    const meta = getCityMeta(cityId);

    cities.push({
      id: cityId,
      name: city.basic?.name?.value ?? cityId,
      featured: city.basic?.featured ?? false,
      universities: city.talent?.universities?.value ?? [],
      stemGrads: grads.digitalStemPlus?.value ?? 0,
      ictGrads: grads.coreICT?.value ?? 0,
      ictPct: grads.coreICT?.pctOfOfficialStem?.value ?? parsePct(null),
      regionalPool: getRegionalPool(cityId, city),
      colIndex: costs.colIndex?.value ?? 35,
      salaryIndex: costs.salaryIndex?.value ?? 80,
      officeRent: costs.officeRent ? { min: costs.officeRent.min, max: costs.officeRent.max, mid: ((costs.officeRent.min || 12) + (costs.officeRent.max || 18)) / 2 } : parseRent(null),
      residentialRent: costs.residentialRent ? { min: costs.residentialRent.min, max: costs.residentialRent.max, mid: ((costs.residentialRent.min || 800) + (costs.residentialRent.max || 1200)) / 2 } : parseRent(null),
      coworking: meta.coworking ?? profile?.ecosystem?.coworking?.description ?? null,
      climate: meta.climate ?? profile?.qualityOfLife?.climate?.value ?? null,
      tags: profile?.ecosystem?.domains?.value ?? [],
      majorCompanies: (profile?.ecosystem?.techCompanies?.value ?? []).map(c => c.name),
      checkScore: profile?.verification?.checkScore ?? null,
      checkDate: profile?.verification?.checkDate ?? null,
    });
  }

  return cities;
}

/**
 * Collect all scraped data into optimized Data Contract format for AI.
 * @returns {Object} Complete Portugal data object
 */
function collectAllData() {
  const preparedCities = prepareCityDataForAI();
  const nationalData = getNationalData();

  // Top 5 cities by STEM+ grads
  const topCities = [...preparedCities]
    .filter(c => c.stemGrads > 0)
    .sort((a, b) => b.stemGrads - a.stemGrads)
    .slice(0, 5)
    .map(c => ({ city: c.name, stemGrads: c.stemGrads }));

  // Regional breakdown — auto-build from each city's NUTS region
  const store = getStore();
  const masterCities2 = store.master?.cities || {};
  const regionMap = {};
  for (const cId of Object.keys(masterCities2)) {
    const region = masterCities2[cId]?.basic?.region?.value;
    if (region) {
      if (!regionMap[region]) regionMap[region] = [];
      regionMap[region].push(cId);
    }
  }
  const regionalBreakdown = {};
  for (const [region, ids] of Object.entries(regionMap)) {
    regionalBreakdown[region] = preparedCities.filter(c => ids.includes(c.id)).reduce((s, c) => s + c.stemGrads, 0);
  }

  return {
    cities: preparedCities,
    national: nationalData ?? null,
    connectivity: nationalData?.connectivity ?? null,
    geostrategic: nationalData?.connectivity?.geostrategic ?? null,
    taxIncentives: nationalData?.taxIncentives ?? null,
    laborMarket: nationalData?.laborMarket ?? null,
    techWorkforce: nationalData?.workforceStatistics ?? null,
    hiringInsights: nationalData?.hiringInsights ?? null,
    euContext: nationalData?.euContext ?? null,
    salaryByRegion: nationalData?.salaryByRegion ?? null,
    graduateFlow: nationalData?.graduateFlow ?? null,
    costOfLiving: nationalData?.costOfLiving ?? null,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * FORM INPUT READING
 * ═══════════════════════════════════════════════════════════════════════════ */

function getValue(id) {
  return document.getElementById(id)?.value.trim() || '';
}

function getStackSelection() {
  const checkboxes = document.querySelectorAll('input[name="stack"]:checked');
  const selected = Array.from(checkboxes).map(cb => cb.value);
  const other = getValue('sim-searched-stack-other');
  if (other) selected.push(other);
  return selected.length > 0 ? selected.join(', ') : '';
}

function readFormInputs() {
  return {
    purpose: getValue('sim-purpose'),
    opexBudget: getValue('sim-opex-budget'),
    capexBudget: getValue('sim-capex-budget'),
    teamSize: getValue('sim-team-size'),
    roleType: getValue('sim-role-type'),
    companyFocus: getValue('sim-company-focus'),
    searchedStack: getStackSelection(),
    dealbreakers: getValue('sim-dealbreakers'),
    workModel: getValue('sim-work-model'),
    officeQuality: getValue('sim-office-quality'),
    officeStrategy: getValue('sim-office-strategy'),
    hiringStrategy: getValue('sim-hiring-strategy'),
    timeline: getValue('sim-timeline'),
    scaling: getValue('sim-scaling'),
    timezone: getValue('sim-timezone'),
    lifestyle: getValue('sim-lifestyle'),
    entity: getValue('sim-entity'),
    primaryObjective: getValue('sim-primary-objective'),
    outputStyle: getValue('sim-output-style'),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MASTER PROMPT GENERATION
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Generate the V4.8.1 master prompt.
 * @returns {string} Complete prompt text for AI consumption
 */
export function generateMasterPrompt() {
  const inputs = readFormInputs();

  // Build compensation lookups from COMPENSATION_DATA.json
  const compData = getCompensationData();
  const salaryBands = buildSalaryBands(compData);
  const tierMultipliers = buildTierMultipliers(compData);
  const stackPremiums = buildStackPremiums(compData);

  const currentBand = salaryBands[inputs.roleType] || salaryBands['software-engineer'];

  // Extract raw numeric values
  const teamSizeMatch = inputs.teamSize.match(/(\d+)/);
  const teamSize = teamSizeMatch ? parseInt(teamSizeMatch[1]) : null;
  const budgetMatch = inputs.opexBudget.match(/[\d,]+/);
  const budget = budgetMatch ? parseInt(budgetMatch[0].replace(/,/g, '')) : null;

  // Collect all data from databases
  const portugalData = collectAllData();
  const todayDate = new Date().toISOString().split('T')[0];

  // Delegate to prompt template builder
  return buildPromptTemplate({
    inputs,
    currentBand,
    salaryBands,
    tierMultipliers,
    stackPremiums,
    teamSize,
    budget,
    portugalData,
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
  
  const macro = content?.macroeconomicScorecard;
  if (!macro) return claims;
  
  // Hero metrics
  const hero = macro.heroMetrics;
  if (hero?.gdpNominal) addClaim(`GDP Nominal ${hero.gdpNominal.year}: €${hero.gdpNominal.value}B`);
  if (hero?.population) addClaim(`Population ${hero.population.year}: ${hero.population.value}M`);
  if (hero?.gdpPerCapita) addClaim(`GDP Per Capita ${hero.gdpPerCapita.year}: €${hero.gdpPerCapita.value.toLocaleString()}`);
  if (hero?.publicDebt) addClaim(`Public Debt ${hero.publicDebt.year}: €${hero.publicDebt.value}B (${hero.publicDebt.pctGdp}% GDP)`);
  if (hero?.tradeSurplus) addClaim(`Trade Surplus ${hero.tradeSurplus.year}: +${hero.tradeSurplus.value}% GDP (goods+services)`);
  
  // Economic Activity
  const econ = macro.economicActivity;
  if (econ?.realGdpGrowth?.values) {
    econ.realGdpGrowth.values.forEach(v => {
      const type = v.type === 'forecast' ? ' forecast' : '';
      addClaim(`Real GDP Growth ${v.year}: ${v.value}%${type}`);
    });
  }
  if (econ?.privateConsumption?.values) {
    econ.privateConsumption.values.forEach(v => {
      const type = v.type === 'forecast' ? ' forecast' : '';
      addClaim(`Private Consumption Growth ${v.year}: ${v.value}%${type}`);
    });
  }
  if (econ?.grossFixedCapitalFormation?.values) {
    econ.grossFixedCapitalFormation.values.forEach(v => {
      const type = v.type === 'forecast' ? ' forecast' : '';
      addClaim(`Gross Fixed Capital Formation ${v.year}: ${v.value}%${type}`);
    });
  }
  
  // Labour & Costs
  const labour = macro.labourAndCosts;
  if (labour?.unemploymentRate?.values) {
    labour.unemploymentRate.values.forEach(v => {
      const type = v.type === 'forecast' ? ' forecast' : '';
      addClaim(`Unemployment Rate ${v.year}: ${v.value}%${type}`);
    });
  }
  if (labour?.employmentRate20to64?.values) {
    labour.employmentRate20to64.values.forEach(v => {
      const type = v.type === 'forecast' ? ' forecast' : '';
      addClaim(`Employment Rate (20-64) ${v.year}: ${v.value}%${type}`);
    });
  }
  if (labour?.tertiaryAttainment25to34) {
    addClaim(`Tertiary Attainment (25-34): ${labour.tertiaryAttainment25to34.value}%`);
  }
  if (labour?.gdpDeflator?.values) {
    labour.gdpDeflator.values.forEach(v => {
      const type = v.type === 'forecast' ? ' forecast' : '';
      addClaim(`GDP Deflator ${v.year}: ${v.value}%${type}`);
    });
  }
  
  // Fiscal, Prices, Markets
  const fiscal = macro.fiscalPricesMarkets;
  if (fiscal?.hicpInflation?.values) {
    fiscal.hicpInflation.values.forEach(v => {
      const type = v.type === 'forecast' ? ' forecast' : '';
      addClaim(`HICP Inflation ${v.year}: ${v.value}%${type}`);
    });
  }
  if (fiscal?.publicDebtToGdp?.values) {
    fiscal.publicDebtToGdp.values.forEach(v => {
      const type = v.type === 'forecast' ? ' forecast' : '';
      addClaim(`Public Debt ${v.year}: ${v.value}% GDP${type}`);
    });
  }
  if (fiscal?.netLending?.values) {
    fiscal.netLending.values.forEach(v => {
      const type = v.type === 'forecast' ? ' forecast' : '';
      addClaim(`Net Lending (Budget) ${v.year}: +${v.value}% GDP${type}`);
    });
  }
  if (fiscal?.sovereignYield10Y?.values) {
    fiscal.sovereignYield10Y.values.slice(0, 2).forEach(v => {
      const type = v.type === 'forecast' ? ' forecast' : '';
      addClaim(`Sovereign Yield (10Y) ${v.year}: ${v.value}%${type}`);
    });
  }
  
  return claims;
}

/**
 * Generate Digital Infrastructure claims from WEBSITE_CONTENT.json
 */
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
  
  // FTTH
  const ftth = infra.ftthPenetration;
  if (ftth?.coverage) addClaim(`FTTH network coverage: ${ftth.coverage.value}% of dwellings`);
  if (ftth?.takeUp) addClaim(`FTTH take-up rate: ${ftth.takeUp.value}% of covered households`);
  if (ftth?.fiberShare) addClaim(`Fiber share of broadband: ${ftth.fiberShare.value}% of connections`);
  if (ftth?.lisbonMetroCoverage) addClaim(`Lisbon Metro FTTH coverage: ${ftth.lisbonMetroCoverage.value}%`);
  
  // 5G
  const fiveG = infra.fiveGCoverage;
  if (fiveG?.populationCoverage) addClaim(`5G population coverage: ${fiveG.populationCoverage}%`);
  if (fiveG?.operators) addClaim(`5G operators: ${fiveG.operators.join(', ')}`);
  
  // Fixed broadband
  const bb = infra.fixedBroadband;
  if (bb?.averageTraffic) addClaim(`Average fixed broadband traffic: ${bb.averageTraffic.value} ${bb.averageTraffic.unit} (${bb.averageTraffic.period})`);
  if (bb?.businessGrade) addClaim(`Business-grade fiber: ${bb.businessGrade.value} ${bb.businessGrade.unit} symmetric available`);
  if (bb?.consumerFiber500Mbps) addClaim(`Consumer fiber 500 Mbps: €${bb.consumerFiber500Mbps.value}/month`);
  if (bb?.euRanking) addClaim(`EU ranking: ${bb.euRanking}`);
  
  // Latency
  const lat = infra.latency;
  if (lat?.toFrankfurt) addClaim(`Latency to Frankfurt: ${lat.toFrankfurt.qualifier || ''} ${lat.toFrankfurt.value}ms`.trim());
  if (lat?.toAmsterdam) addClaim(`Latency to Amsterdam: ${lat.toAmsterdam.qualifier || ''} ${lat.toAmsterdam.value}ms`.trim());
  if (lat?.toSaoPaulo) addClaim(`Latency to São Paulo: ${lat.toSaoPaulo.value}ms (EllaLink)`);
  if (lat?.toNewYork) addClaim(`Latency to New York: ${lat.toNewYork.value}ms`);
  
  // Terrestrial
  if (infra.terrestrialConnectivity?.value) {
    addClaim(infra.terrestrialConnectivity.value);
  }
  
  // Subsea cables
  const cables = infra.subseaCables;
  if (cables?.summary) {
    addClaim(`${cables.summary.operational} operational submarine cables, ${cables.summary.planned} planned`);
  }
  if (cables?.cables) {
    cables.cables.filter(c => c.status === 'Active').forEach(c => {
      let text = `${c.name} cable: ${c.destinations}`;
      if (c.capacity) text += ` (${c.capacity})`;
      addClaim(text);
    });
  }
  
  // Data centers
  const dc = infra.dataCenters;
  if (dc?.microsoft) addClaim(`Microsoft: ${dc.microsoft.investment} data center investment in Sines`);
  if (dc?.alticeCovilha) addClaim(`${dc.alticeCovilha.value}`);
  
  // Sines Tech Hub
  const sines = infra.sinesTechHub;
  if (sines?.designation) addClaim(`Sines: ${sines.designation} — ${sines.description}`);
  
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
      max: data.costs.officeRent.max,
      source: data.costs.officeRent.meta?.source?.provider || 'Est.'
    }))
    .sort((a, b) => (b.max || b.min) - (a.max || a.min));
  
  citiesWithRent.forEach(city => {
    if (city.min && city.max) {
      addClaim(`${city.name} office rent: €${city.min}-${city.max}/m²/month (${city.source})`);
    } else {
      addClaim(`${city.name} office rent: €${city.min || city.max}/m²/month (${city.source})`);
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
      type: data.costs.residentialRent.type || 'T1',
      source: data.costs.residentialRent.meta?.source?.provider || 'Est.'
    }))
    .sort((a, b) => (b.max || b.min) - (a.max || a.min));
  
  citiesWithRent.forEach(city => {
    if (city.min && city.max) {
      addClaim(`${city.name} ${city.type} rent: €${city.min.toLocaleString()}-${city.max.toLocaleString()}/month (${city.source})`);
    } else {
      addClaim(`${city.name} ${city.type} rent: €${(city.min || city.max).toLocaleString()}/month (${city.source})`);
    }
  });
  
  return claims;
}

/**
 * Generate comprehensive claims for ALL cities from MASTER.json.
 * Includes both externally verifiable metrics and internal calculations.
 * v1.0 — Full city database fact-check
 */
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
  const displayOrder = master.config?.displayOrder || Object.keys(master.cities).sort();
  
  for (const cityId of displayOrder) {
    const cityData = master.cities[cityId];
    if (!cityData) continue;
    
    const cityName = cityData.basic?.name?.value || 
                     cityId.charAt(0).toUpperCase() + cityId.slice(1);
    const region = cityData.basic?.region?.value || '';
    const regionTag = region ? ` [${region}]` : '';
    
    // ─── COST METRICS (EXTERNALLY VERIFIABLE) ───
    
    // Office Rent: Good-quality below-prime office space
    if (cityData.costs?.officeRent) {
      const min = cityData.costs.officeRent.min;
      const max = cityData.costs.officeRent.max;
      if (min && max) {
        addClaim(`${cityName}${regionTag} office rent: \u20ac${min}-${max}/m\u00b2/month (good-quality, below-prime office space)`);
      } else if (min) {
        addClaim(`${cityName}${regionTag} office rent: from \u20ac${min}/m\u00b2/month (good-quality, below-prime office space)`);
      }
    }
    
    // Residential Rent: 1-bedroom ~50 m², city center
    if (cityData.costs?.residentialRent) {
      const min = cityData.costs.residentialRent.min;
      const max = cityData.costs.residentialRent.max;
      if (min && max) {
        addClaim(`${cityName} residential rent: \u20ac${min}-${max}/month (1-bedroom ~50 m\u00b2, city center)`);
      } else if (min) {
        addClaim(`${cityName} residential rent: from \u20ac${min}/month (1-bedroom ~50 m\u00b2, city center)`);
      }
    }
    
    // COL Index: Numbeo (externally verifiable)
    if (cityData.costs?.colIndex?.value) {
      addClaim(`${cityName} Cost of Living Index (excl. rent): ${cityData.costs.colIndex.value} (Numbeo, NYC=100)`);
    }
    
    // ─── TALENT & SALARY METRICS (METHODOLOGY CHECKS) ───
    
    const officialStem = cityData.talent?.graduates?.officialStem?.value;
    const digitalStemPlus = cityData.talent?.graduates?.digitalStemPlus?.value;
    const coreICT = cityData.talent?.graduates?.coreICT?.value;
    
    if (officialStem) {
      addClaim(`${cityName} Official STEM graduates (DGEEC, CNAEF 04+05+06+07+72): ${officialStem}/year`, true);
    }
    if (digitalStemPlus && officialStem) {
      const expected = Math.round(officialStem * 1.27);
      addClaim(`${cityName} Digital STEM+ graduates: ${digitalStemPlus}/year (formula: Official STEM ${officialStem} \u00d7 1.27 = ${expected})`, true);
    } else if (digitalStemPlus) {
      addClaim(`${cityName} Digital STEM+ graduates: ${digitalStemPlus}/year (= Official STEM \u00d7 1.27)`, true);
    }
    if (coreICT && officialStem) {
      const ictPct = ((coreICT / officialStem) * 100).toFixed(1);
      addClaim(`${cityName} Core ICT graduates (CNAEF 481+523): ${coreICT}/year (${ictPct}% of Official STEM)`, true);
    } else if (coreICT) {
      addClaim(`${cityName} Core ICT graduates (CNAEF 481+523): ${coreICT}/year`, true);
    }
    
    // Salary Index
    if (cityData.costs?.salaryIndex?.value) {
      addClaim(`${cityName} Salary Index: ${cityData.costs.salaryIndex.value} (Lisbon=100, INE regional wages)`, true);
    }
  }

  // ─── REGIONAL TOTALS (DGEEC AGGREGATES) ───
  if (master.regionalTotals) {
    for (const [regionName, totals] of Object.entries(master.regionalTotals)) {
      if (totals.officialStem != null) {
        addClaim(`${regionName} region total: ${totals.officialStem} Official STEM graduates (DGEEC 23/24, CNAEF 04+05+06+07+72)`);
      }
      if (totals.coreICT != null) {
        addClaim(`${regionName} region total: ${totals.coreICT} Core ICT graduates (DGEEC 23/24, CNAEF 481+523)`);
      }
      if (totals.digitalStemPlus != null && totals.officialStem != null) {
        const expected = Math.round(totals.officialStem * 1.27);
        addClaim(`${regionName} region total: ${totals.digitalStemPlus} Digital STEM+ graduates (formula: ${totals.officialStem} × 1.27 = ${expected})`, true);
      }
    }
  }

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

  const externalTable = externalClaims.map(c =>
    `| ${c.id} | ${c.claim} |`
  ).join('\n');

  const internalTable = internalClaims.map(c =>
    `| ${c.id} | ${c.claim} |`
  ).join('\n');

  return `# FACT-CHECK: City Database (All Metrics) — v3.0
> **${allClaims.length} claims** across 20 Portuguese cities: ${externalClaims.length} cost metrics (external) + ${internalClaims.length} talent/salary metrics (methodology audit)

---

## YOUR TASK

You are verifying a **comparative city database** used in a business analysis of IT nearshoring locations in Portugal. The database covers 20 cities — from major metros (Lisbon, Porto) to small interior university towns (Covilh\u00e3, Bragan\u00e7a).

**Your job is to verify every claim.** Use web search, training data, reasoning from comparable data, or any other method. We need your expert judgment on ALL claims, not just the ones with obvious sources.

---

## ⚠️ CRITICAL: WEB SEARCH STRATEGY (Read This First!)

**Most Portuguese real estate and data sites (Idealista, JLL, Savills, Imovirtual, CustoJusto, DGEEC portals) BLOCK automated page reads.** Do NOT waste your context window trying to open pages that fail.

**The 2-Strike Rule:**
1. When you search, **read the search result snippets/titles/meta descriptions first** — they often contain the numbers you need (e.g., "Prime rents at €21/sqm" or "T1 centro €850-1100").
2. If you must open a page, try **at most 2 pages per search query**. If both fail → STOP trying to open pages for that query.
3. **Switch immediately** to one of these fallback approaches:
   - **Search snippet extraction** — Search results often show prices, statistics, and summaries in the preview text. Use those numbers directly as sources (cite as "search result snippet: [query]").
   - **Training data** — You have extensive knowledge of Portuguese real estate markets, university systems, and regional economics. State what you know and cite "training data, [year]".
   - **Cross-referencing** — Use a verified value from one city to estimate another (e.g., Porto prime rent confirmed at €21 → below-prime is €13-17).
   - **Ratio-based reasoning** — Office-to-residential rent ratios (1.0-1.8×), city cost scaling from Lisbon, salary-to-COL consistency checks.
   - **Numbeo** — numbeo.com pages may load; try those first for COL index. But if they fail too, estimate from known city patterns.

**Efficient batch strategy for 140 claims:**
- Do NOT verify one city at a time end-to-end. Instead, batch by metric type:
  1. First pass: COL index — search Numbeo for all cities that have pages (Lisbon, Porto, Braga, Coimbra, Faro, maybe 2-3 more). Estimate the rest.
  2. Second pass: Office rent — search for JLL/CBRE Portugal market reports (one search covers Lisbon + Porto prime rents). Derive below-prime. For smaller cities, use residential rent ratios.
  3. Third pass: Residential rent — one search for "average rent T1 Portugal cities 2024" or "Idealista rent prices Portugal" may give you a comparison table.
  4. Fourth pass: Arithmetic checks — Digital STEM+ and Core ICT are pure math. No web search needed. Calculate directly.
  5. Fifth pass: Salary index — check INE regional wage data. One search may cover all regions.
  6. Sixth pass: STEM graduates — plausibility check against known university sizes.

**Remember: A reasoned estimate with MEDIUM confidence citing training data is infinitely more useful than 50 failed page-open attempts followed by UNVERIFIABLE.**

---

## CITY TIERS (data availability guide)

| Tier | Cities | What to expect |
|------|--------|----------------|
| **1 \u2014 Major metros** | Lisbon, Porto | JLL/C&W/CBRE quarterly reports, Numbeo, Idealista. Direct verification expected. |
| **2 \u2014 Regional hubs** | Braga, Coimbra, Aveiro, Faro, Leiria, Set\u00fabal | Some broker mentions, Idealista listings, partial Numbeo. Mix of direct + reasoned. |
| **3 \u2014 Small/university towns** | Guimar\u00e3es, \u00c9vora, Covilh\u00e3, Viseu, Viana do Castelo, Santar\u00e9m, Castelo Branco, Vila Real, Tomar, Bragan\u00e7a, Beja, Portalegre | Idealista may have listings. Office data rare. Numbeo sparse. Reasoning required. |

---

## METRIC-BY-METRIC VERIFICATION GUIDE

### 1. OFFICE RENT (\u20ac/m\u00b2/month)
**What this is:** Good-quality, modern office space suitable for a tech team (business parks, renovated commercial buildings, coworking-grade). This is **NOT prime Class A CBD** \u2014 it is the tier below: lower specification, peripheral locations, or smaller cities where "Class A" does not exist. Expect these values to be **20\u201340% below prime CBD rates** in cities where prime data exists.

**Verification approach:**
- **Tier 1:** Search \`JLL Portugal office rent prime 2024\` or \`CBRE Lisbon Porto office market\`. The search snippets usually quote prime CBD rent (Lisbon ~\u20ac28-30, Porto ~\u20ac21-24). Our below-prime figures should be 20-40% below those.
- **Tier 2-3:** Search \`office rent [city] Portugal \u20ac/m\u00b2\` \u2014 check if any snippet quotes a range. If not, estimate from the city\u2019s residential rent: office rent per m\u00b2 \u2248 1.0\u20131.8\u00d7 residential rent per m\u00b2.
- **Scaling shortcut:** A city 50km from Porto is typically 30-50% cheaper for office space. Interior cities can be 50-70% below Lisbon prime.
- **Do NOT repeatedly try to open idealista/JLL/Savills pages** \u2014 they block bots. Use search snippets or training data.
- **Tolerance:** \u00b115% for Tier 3 cities, \u00b110% for Tier 2, \u00b15% for Tier 1.

### 2. RESIDENTIAL RENT (\u20ac/month)
**What this is:** A **1-bedroom apartment (~50 m\u00b2) in or near the city center**. Standard professional quality \u2014 not luxury, not student housing.

**Verification approach:**
- **Best single search:** \`average rent 1 bedroom Portugal cities 2024\` or \`pre\u00e7o renda T1 cidades Portugal\` \u2014 look for comparison tables or city rankings in the search snippets.
- **Per-city:** Search \`rent 1 bedroom [city] Portugal \u20ac\` \u2014 Numbeo snippets often show the figure directly ("Apartment 1 bedroom City Centre: \u20acXXX").
- **Do NOT try to open idealista listing pages** \u2014 they block automated access. The search snippet may quote a price range; that\u2019s sufficient.
- **Cross-check logic:** Lisbon T1 center ~\u20ac1200-1800, Porto ~\u20ac800-1200. Other cities scale down proportionally by COL. Interior cities are typically 40-60% of Lisbon.
- **Tolerance:** \u00b110% for all tiers.

### 3. COST OF LIVING INDEX (Numbeo, NYC=100, excl. rent)
**What this is:** Numbeo's "Cost of Living Index" excluding rent, where New York City = 100. Most Portuguese cities score 28\u201350.

**Verification approach:**
- **Best search:** \`Numbeo cost of living index Portugal cities\` \u2014 look for the comparison/ranking page snippet. It often lists multiple cities\u2019 indices in one result.
- **Per-city:** Search \`Numbeo [city] Portugal cost of living\` \u2014 the snippet typically shows the index value directly (e.g., "Cost of Living Index: 42.3"). You usually do NOT need to open the page.
- **IMPORTANT:** Numbeo only covers cities with enough contributors. Many Tier 3 cities are NOT on Numbeo. If not listed:
  - Estimate from the city\u2019s residential rent relative to Lisbon. If rent is 50% of Lisbon\u2019s, COL is roughly 60\u201370% of Lisbon\u2019s index.
  - Portugal\u2019s national COL range: interior towns 28\u201333, mid-size cities 33\u201340, Lisbon metro 45\u201355.
  - Mark with confidence MEDIUM or LOW and show your reasoning.
- **Tolerance:** \u00b110% for Tier 2-3, \u00b15% for Tier 1.

### 4. OFFICIAL STEM GRADUATES (DGEEC data) \u2014 CAN be verified
**What this is:** Annual graduates (conclus\u00f5es) from higher education institutions IN THIS CITY, across CNAEF classification areas:
- **04** \u2014 Business, Administration & Law (management/business informatics programs)
- **05** \u2014 Natural Sciences, Mathematics & Statistics
- **06** \u2014 Information & Communication Technologies
- **07** \u2014 Engineering, Manufacturing & Construction
- **72** \u2014 Health Technologies (biomedical engineering, medical imaging, etc.)

**How to verify (search-first approach):**
- **Search:** \`DGEEC diplomados ensino superior [city] 2023\` or \`site:dgeec.mec.pt diplomados CNAEF\` \u2014 snippets may show aggregate tables or PDF links with totals.
- **InfoCursos:** Search \`infocursos [university name] diplomados\` \u2014 snippets sometimes show graduate counts.
- **Do NOT spend time trying to navigate dgeec.mec.pt or infocursos.mec.pt interactively** \u2014 use search snippets + your training data about Portuguese university sizes.
- **Known institution sizes (use for plausibility):**
  - Lisbon: ULisboa (incl. IST, FCUL), NOVA (FCT, NOVA IMS), ISCTE, IPL, Universidade Lus\u00f3fona
  - Porto: U.Porto (FEUP, FCUP), ISEP (IPP), Universidade Lus\u00f3fona Porto
  - Coimbra: Universidade de Coimbra (FCTUC, DEI), IPC
  - Braga/Guimar\u00e3es: Universidade do Minho (main campus Braga, engineering campus Guimar\u00e3es)
  - Aveiro: Universidade de Aveiro (strong engineering)
  - Covilh\u00e3: Universidade da Beira Interior (UBI \u2014 engineering, textile, CS)
  - Set\u00fabal: IPS + nearby NOVA FCT (Almada campus counts toward Lisbon metro)
  - Faro: Universidade do Algarve
  - \u00c9vora: Universidade de \u00c9vora
  - Vila Real: UTAD (agriculture + engineering)
  - Leiria: Polit\u00e9cnico de Leiria (ESTG \u2014 large engineering school)
  - Beja, Bragan\u00e7a, Castelo Branco, Portalegre, Santar\u00e9m, Tomar, Viseu, Viana do Castelo: Polytechnic institutes
- **Plausibility check:** Larger universities = more grads. Lisbon 7000+, Porto 5000+, Coimbra 1500+. Small polytechnic cities: 100\u2013600.
- **CRITICAL: Verify the number makes sense for the institutions in that city.**

### 5. DIGITAL STEM+ (calculated metric) \u2014 AUDIT THE MATH
**What this is:** An expanded graduate count. Formula: \`Official STEM \u00d7 1.27\`

The 1.27 multiplier accounts for:
- **CTeSP** (Cursos T\u00e9cnicos Superiores Profissionais) \u2014 2-year vocational higher ed programs in tech fields (~15% addition)
- **Adjacent digital fields** \u2014 CNAEF areas not in our STEM core but with digital relevance (digital design, digital media, etc. ~12% addition)

**How to verify:** The claim text includes the formula. Check: \`Does value \u2248 Official STEM \u00d7 1.27?\` If the deviation is >8%, mark NEEDS_UPDATE. This is a pure arithmetic check.

### 6. CORE ICT (subset metric) \u2014 CHECK THE PROPORTION
**What this is:** Graduates from CNAEF 481 (Computer Science / Inform\u00e1tica) + CNAEF 523 (Electronics & Automation) only. The purest IT-relevant subset.

**How to verify:** The claim text shows the percentage of Digital STEM+. Check:
- Core ICT should be **8\u201322% of Digital STEM+**
- Cities with strong CS departments (Porto FEUP/ISEP, Lisbon IST, Braga U.Minho): higher end (15\u201322%)
- Agriculture/tourism-focused cities (Beja, Faro, \u00c9vora): lower end (8\u201313%)
- If outside this range, mark NEEDS_UPDATE.

### 7. SALARY INDEX (Lisbon=100) \u2014 VERIFY REGIONAL LOGIC
**What this is:** Derived from INE (Statistics Portugal) "Ganho M\u00e9dio Mensal" (average monthly earnings) by NUTS III region, indexed so Lisbon Metropolitan Area = 100.

**How to verify:**
- Lisbon = 100 by definition (baseline)
- Expected ranges: Porto metro 85\u201392, dynamic secondary cities 75\u201385, interior towns 68\u201378
- **Red flags:** Any value below 65 (Portugal has a national minimum wage floor) or above 95 (outside Lisbon metro)
- **Cross-check:** INE publishes regional wage tables (Quadros de Pessoal / Ganho m\u00e9dio). Also check if the salary index is internally consistent: a city with COL index 30 should not have salary index 90.

---

## ABSOLUTE RULES

1. **DO NOT default to UNVERIFIABLE.** You have training data covering Portuguese real estate markets, university systems, and regional economics. Use it.
2. **UNVERIFIABLE is a last resort** \u2014 only valid when you genuinely have zero basis for estimation (not even comparable cities). You must still explain WHY in your notes.
3. **Reasoning counts.** If you can\u2019t find a direct source, you MUST reason from the best available evidence (comparable city, residential-to-office ratio, university enrollment, regional patterns) and give a **confidence level**.
4. **\u00b15% tolerance for Tier 1, \u00b110% for Tier 2, \u00b115% for Tier 3** cost metrics.
5. **Arithmetic checks are mandatory** for Digital STEM+ (must \u2248 Official STEM \u00d7 1.27) and Core ICT (must be 8-22% of STEM+).
6. **2023\u20132025 data preferred.** Flag anything relying on pre-2023 data as OUTDATED.

---

## CLAIMS TO VERIFY \u2014 COST METRICS (External Sources)

| ID | Claim |
|----|-------|
${externalTable}

---

## CLAIMS TO VERIFY \u2014 TALENT & SALARY (Methodology Audit)

For these claims, verify: (a) the base number is plausible for the city\u2019s institutions, (b) the arithmetic is correct, (c) the proportions make sense.

| ID | Claim |
|----|-------|
${internalTable}

---

## REQUIRED OUTPUT FORMAT

**One JSON object per line (JSONL).** Include ALL fields. No text outside the JSONL block except the summary at the end.

\`\`\`jsonl
{"claim_id":"CDB-01","status":"SUPPORTED","verified_value":"\u20ac16-20/m\u00b2","source":"JLL Porto Q3 2024 (-30% from prime \u20ac24)","confidence":"HIGH","notes":"Prime is \u20ac24; below-prime at \u20ac16-20 is consistent"}
{"claim_id":"CDB-17","status":"PARTIALLY_SUPPORTED","verified_value":"~34 estimated","source":"Reasoning: Guimar\u00e3es rent is ~70% of Porto; Porto COL is 45; 45\u00d70.75\u224834","confidence":"MEDIUM","notes":"Numbeo has no page for Guimar\u00e3es; estimate based on rent ratio to Porto"}
{"claim_id":"CDB-47","status":"NEEDS_UPDATE","verified_value":"1915","source":"Arithmetic check: 1508\u00d71.27=1915","confidence":"HIGH","notes":"Claimed 1775 but formula gives 1915; \u0394=7.3% exceeds 5% tolerance"}
\`\`\`

### STATUS CODES

| Code | When to Use |
|------|-------------|
| **SUPPORTED** | Value confirmed within tolerance (direct source OR strong reasoning) |
| **PARTIALLY_SUPPORTED** | Directionally correct but outside tolerance, or estimated with medium confidence |
| **NEEDS_UPDATE** | Value appears wrong \u2014 contradicted by source data or failed arithmetic check |
| **CONTRADICTED** | Directly contradicted by a reliable primary source (>15% off) |
| **OUTDATED** | Source found but data is from before 2023 |
| **UNVERIFIABLE** | Genuinely zero basis for estimation \u2014 MUST explain why in notes |

### CONFIDENCE LEVELS (required for every claim)

| Level | Meaning |
|-------|---------|
| **HIGH** | Direct source found, or arithmetic check with known inputs |
| **MEDIUM** | Estimated from comparable cities, regional data, or known patterns |
| **LOW** | Rough estimate; limited evidence; high uncertainty |

---

## AFTER JSONL, PROVIDE SUMMARY

1. **Score:** X/${allClaims.length} SUPPORTED or PARTIALLY_SUPPORTED
2. **Corrections Needed:** List claims that need updating, with the corrected value and source
3. **Arithmetic Failures:** List any Digital STEM+ or Core ICT claims that fail their formula checks
4. **Confidence Assessment:** Overall reliability rating for this database, and which cities/metrics are weakest
5. **Data Gaps:** Which cities or metrics had the least available verification data?

---

Begin verification. Remember: we need your assessment of EVERY claim, not just the easy ones.`;
}

/**
 * Generate Workforce/Talent claims from WEBSITE_CONTENT.json + COMPENSATION_DATA.json
 */
function generateWorkforceClaims(content, compensation) {
  const claims = [];
  let claimNum = 1;
  const addClaim = (text) => {
    if (!text) return;
    claims.push({ id: `WRK-${String(claimNum).padStart(2, '0')}`, claim: text.trim() });
    claimNum++;
  };
  
  // Workforce statistics
  const ws = content?.workforceStatistics;
  if (ws?.ictEmployment) addClaim(`ICT employment: ${ws.ictEmployment.value}${ws.ictEmployment.unit} (${ws.ictEmployment.year})`);
  if (ws?.techWorkforceTotal?.official) addClaim(`Total tech workforce: ~${ws.techWorkforceTotal.official.toLocaleString()} (Eurostat estimate)`);
  if (ws?.techWorkforceTotal?.linkedin) addClaim(`LinkedIn tech profiles: ~${ws.techWorkforceTotal.linkedin.toLocaleString()}`);
  if (ws?.concentration) addClaim(`Tech workforce concentration: ${ws.concentration}`);
  if (ws?.femaleGrowth) addClaim(`Female ICT specialists: ${ws.femaleGrowth.value}%`);
  if (ws?.tertiaryEducation) addClaim(`ICT workers with tertiary education: ${ws.tertiaryEducation.value}%`);
  
  if (ws?.cityBreakdown) {
    ws.cityBreakdown.slice(0, 4).forEach(city => {
      addClaim(`${city.city}: ~${city.official?.toLocaleString() || city.linkedin.toLocaleString()} tech workers`);
    });
  }
  
  // EU Context
  const eu = content?.euContext?.portugalsPosition;
  if (eu?.ictSpecialistsPctEmployment) {
    addClaim(`ICT specialists as % of employment: ${eu.ictSpecialistsPctEmployment.value}% (EU avg: ${eu.ictSpecialistsPctEmployment.euAvg}%)`);
  }
  if (eu?.ictGraduatesPctAllGraduates) {
    addClaim(`ICT graduates as % of all graduates: ${eu.ictGraduatesPctAllGraduates.value}% (EU avg: ${eu.ictGraduatesPctAllGraduates.euAvg}%)`);
  }
  if (eu?.femaleIctSpecialists) {
    addClaim(`Female ICT specialists: ${eu.femaleIctSpecialists.value}% (EU avg: ${eu.femaleIctSpecialists.euAvg}%)`);
  }
  if (eu?.trend) addClaim(`ICT workforce trend: ${eu.trend.value}`);
  
  // Hiring insights
  const hi = content?.hiringInsights;
  if (hi?.timeToHire?.midLevel) addClaim(`Time to hire (mid-level): ${hi.timeToHire.midLevel.value} ${hi.timeToHire.midLevel.unit}`);
  if (hi?.timeToHire?.seniorNiche) addClaim(`Time to hire (senior/niche): ${hi.timeToHire.seniorNiche.value} ${hi.timeToHire.seniorNiche.unit}`);
  if (hi?.educationLevel?.bachelorsOrHigher) addClaim(`IT workforce with bachelor's+: ${hi.educationLevel.bachelorsOrHigher.value}%`);
  if (hi?.ageDistribution?.medianAge) addClaim(`Median age of IT workforce: ${hi.ageDistribution.medianAge}`);
  if (hi?.ageDistribution?.under35Pct) addClaim(`IT workforce under 35: ${hi.ageDistribution.under35Pct.value}%`);
  if (hi?.retention?.tenure?.lisbon) addClaim(`Average tenure Lisbon: ${hi.retention.tenure.lisbon.value} ${hi.retention.tenure.lisbon.unit}`);
  if (hi?.retention?.tenure?.porto) addClaim(`Average tenure Porto: ${hi.retention.tenure.porto.value} ${hi.retention.tenure.porto.unit}`);
  if (hi?.retention?.tenure?.secondaryCities) addClaim(`Average tenure secondary cities: ${hi.retention.tenure.secondaryCities.value} ${hi.retention.tenure.secondaryCities.unit}`);
  
  // Labor market
  const lm = content?.laborMarket;
  if (lm?.retention?.medianTenure) addClaim(`Median tenure (Startup Portugal): ${lm.retention.medianTenure.value} ${lm.retention.medianTenure.unit}`);
  
  // ─── IT Salary Ranges (data-prompt-core salary-table from COMPENSATION_DATA) ───
  if (compensation?.baseBands) {
    for (const [roleKey, role] of Object.entries(compensation.baseBands)) {
      const auth = role.meta?.htmlAuthoritative;
      if (auth) {
        // Use authoritative HTML display values (hand-tuned annual ranges)
        const parts = [];
        if (auth.junior) parts.push(`Junior ${auth.junior}`);
        if (auth.mid) parts.push(`Mid ${auth.mid}`);
        if (auth.senior) parts.push(`Senior ${auth.senior}`);
        if (auth.lead) parts.push(`Lead ${auth.lead}`);
        if (parts.length > 0) {
          addClaim(`${role.roleType} salary (annual, Lisbon): ${parts.join(', ')} — ${role.meta.source?.provider || 'Glassdoor, Landing.jobs'} (2024)`);
        }
      } else if (role.min && role.max) {
        addClaim(`${role.roleType} base band (monthly, Lisbon): €${role.min.toLocaleString()}–€${role.max.toLocaleString()} — ${role.meta?.source?.provider || 'Glassdoor, Landing.jobs'}`);
      }
    }
  }
  
  // ─── Tech Stack Premiums (data-prompt-core salary-table from COMPENSATION_DATA) ───
  if (compensation?.techStackPremiums) {
    for (const [stackKey, stack] of Object.entries(compensation.techStackPremiums)) {
      if (stack.premium != null) {
        const pctStr = stack.premium === 0 ? 'Baseline (0%)' : `+${Math.round(stack.premium * 100)}%`;
        addClaim(`Tech stack premium — ${stack.stack}: ${pctStr}`);
      }
    }
  }
  
  // ─── Employer Costs (data-prompt-core from COMPENSATION_DATA) ───
  const ec = compensation?.employerCosts;
  if (ec?.socialSecurity?.employerRate) {
    addClaim(`Employer social security rate: ${ec.socialSecurity.employerRate}% — Segurança Social`);
  }
  if (ec?.mealAllowance?.cardMax) {
    addClaim(`Meal allowance (card, tax-exempt max): €${ec.mealAllowance.cardMax}/day — OE 2025`);
  }
  if (ec?.holidayAllowance?.months) {
    addClaim(`Portugal pays ${ec.holidayAllowance.months} extra monthly salaries/year (holiday + Christmas subsidy) — Código do Trabalho`);
  }
  
  // ─── INE Regional Earnings (data-prompt-core ine-earnings-card — from COMPENSATION_DATA) ───
  // INE 2023 MTSSS/GEP Personnel Tables — Bachelor earnings + % vs Lisbon only
  const ine = compensation?.ineRegionalEarnings;
  if (ine?.regions && ine?.displayOrder) {
    const CONV = 14 / 12;
    const baselineRegion = ine.regions[ine.lisbonBaselineRegion];
    const lisbonBachelor14x = baselineRegion?.[ine.lisbonBaselineField] || 1;

    ine.displayOrder.forEach(regionKey => {
      const region = ine.regions[regionKey];
      if (!region || region.display === false) return;
      const bachelor14x = region[ine.lisbonBaselineField];
      if (bachelor14x == null) return;
      const bachelor12x = Math.round(bachelor14x * CONV);
      const pctVsLisbon = ((bachelor14x / lisbonBachelor14x) * 100).toFixed(1);
      addClaim(`INE average monthly earnings (12× equiv, Bachelor): ${region.name} €${bachelor12x.toLocaleString()} (${pctVsLisbon}% vs Lisbon) — INE ${ine.year}`);
    });
  }
  
  return claims;
}

/**
 * Generate Strategic & Tax claims from WEBSITE_CONTENT.json
 */
function generateStrategicClaims(content) {
  const claims = [];
  let claimNum = 1;
  const addClaim = (text) => {
    if (!text) return;
    claims.push({ id: `STR-${String(claimNum).padStart(2, '0')}`, claim: text.trim() });
    claimNum++;
  };
  
  const tax = content?.taxIncentives;
  if (tax?.sifideII?.value) {
    addClaim(`SIFIDE II R&D Tax Credit: ${tax.sifideII.value}`);
    if (tax.sifideII.eligibleCosts) addClaim(`SIFIDE II eligible costs: ${tax.sifideII.eligibleCosts}`);
    if (tax.sifideII.application) addClaim(`SIFIDE II application: ${tax.sifideII.application}`);
  }
  if (tax?.techVisa?.value) {
    addClaim(`Tech Visa (skilled immigration): ${tax.techVisa.value}`);
    if (tax.techVisa.detail) addClaim(`Tech Visa: ${tax.techVisa.detail}`);
  }
  if (tax?.ifici?.value) {
    addClaim(`IFICI (scientific research & innovation tax regime): ${tax.ifici.value}`);
    if (tax.ifici.detail) addClaim(`IFICI: ${tax.ifici.detail}`);
  }
  if (tax?.corporateTax?.standard) {
    addClaim(`Standard corporate tax rate (IRC): ${tax.corporateTax.standard}%`);
    if (tax.corporateTax.smeRate) addClaim(`SME reduced IRC rate: ${tax.corporateTax.smeRate}% on first ${tax.corporateTax.smeThreshold ?? '€50,000'}`);
    if (tax.corporateTax.surtaxes) addClaim(`Corporate surtaxes: ${tax.corporateTax.surtaxes}`);
  }
  
  // Connectivity geostrategic
  const geo = content?.connectivity?.geostrategic;
  if (geo?.uniquePosition) addClaim(geo.uniquePosition);
  if (geo?.reach) geo.reach.forEach(r => addClaim(`Reach: ${r}`));
  if (geo?.latencyAdvantage) addClaim(geo.latencyAdvantage);
  
  // Sines
  if (content?.connectivity?.sinesHub?.value) addClaim(`Sines Hub: ${content.connectivity.sinesHub.value}`);
  
  // Cables
  if (content?.connectivity?.subseaCables?.value) {
    addClaim(`Strategic subsea cables: ${content.connectivity.subseaCables.value.join(', ')}`);
  }
  
  // ─── Cost of Living (data-prompt-core stat-heroes) ───
  const col = content?.costOfLiving;
  if (col?.monthlyEssentials?.value) {
    addClaim(`Monthly essentials (single, outside Lisbon): €${col.monthlyEssentials.value} ${col.monthlyEssentials.note ? `(${col.monthlyEssentials.note})` : ''} — Numbeo 2024`);
  }
  if (col?.utilities?.value) {
    addClaim(`Utilities (${col.utilities.includes || 'electricity, water, internet'}): €${col.utilities.value}/month — Numbeo 2024`);
  }
  // Numbeo comparison claim (hardcoded — displayed on site as stat-hero)
  addClaim('Cost of living 30–65% cheaper than London/Amsterdam/Munich — Numbeo comparison');
  
  // ─── Quality of Life & Security (data-prompt-core cards) ───
  // Healthcare card
  addClaim('Portugal: Universal public healthcare (SNS) — free at point of use with small co-pays');
  addClaim('Portugal private health insurance: €30–80/month, short wait times, English-speaking practitioners');
  addClaim('Euro Health Consumer Index (EHCI): Portugal ranked 20th / 35 European countries (2018)');
  // Safety card
  addClaim('Global Peace Index (GPI): Portugal ranked 7th safest country worldwide (2024)');
  addClaim('Portugal crime rate: Among the lowest in the EU — Lisbon safer than most European capitals');
  addClaim('Portugal: EU member since 1986, NATO member since 1949');
  
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
  
  // EU comparison
  const eu = content?.euContext?.competitiveBenchmarks;
  if (eu) {
    if (eu.romania?.value) addClaim(`vs Romania: ${eu.romania.value}`);
    if (eu.poland?.value) addClaim(`vs Poland: ${eu.poland.value}`);
    if (eu.spain?.value) addClaim(`vs Spain: ${eu.spain.value}`);
    if (eu.portugalAdvantage?.value) addClaim(`Portugal advantage: ${eu.portugalAdvantage.value}`);
  }
  
  // Education levels from hiring insights (if not in workforce)
  const hi = content?.hiringInsights?.educationLevel;
  if (hi?.mastersPhd?.value) addClaim(`IT workforce with master's/PhD: ${hi.mastersPhd.value}%`);
  
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
    const categoryKey = el.getAttribute('data-claims-category');
    
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
  let claimNum = 1;
  
  // Helper: add a verifiable claim
  const addClaim = (text, internal = false) => {
    if (!text || text === 'undefined' || text === 'null') return;
    claims.push({
      id: `${prefix}-${String(claimNum).padStart(2, '0')}`,
      claim: text.trim(),
      internal // Mark internal calculations
    });
    claimNum++;
  };

  // Capitalize city name for claim text
  const cityName = cityId.charAt(0).toUpperCase() + cityId.slice(1);

  // ═══════════════════════════════════════════════════════════════════════════
  // META: TAGLINE & COVER TAGS
  // ═══════════════════════════════════════════════════════════════════════════
  if (profile._meta?.tagline) {
    addClaim(`${cityName}: "${profile._meta.tagline}"`);
  }
  if (profile._meta?.coverTags?.length) {
    addClaim(`${cityName} specialization domains: ${profile._meta.coverTags.join(', ')}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ECOSYSTEM: TECH COMPANIES
  // ═══════════════════════════════════════════════════════════════════════════
  if (profile.ecosystem?.techCompanies?.value) {
    for (const company of profile.ecosystem.techCompanies.value) {
      let text = `${company.name}`;
      if (company.sector) text += ` (${company.sector})`;
      if (company.description) text += `: ${company.description}`;
      if (company.notableFact) text += ` — ${company.notableFact}`;
      addClaim(text);
    }
  }
  // Company count
  if (profile.ecosystem?.techCompanies?.count) {
    const note = profile.ecosystem.techCompanies.countNote || '';
    addClaim(`${cityName}: ${profile.ecosystem.techCompanies.count}+ tech companies${note ? ` (${note})` : ''}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ECOSYSTEM: DOMAINS
  // ═══════════════════════════════════════════════════════════════════════════
  if (profile.ecosystem?.domains?.value) {
    for (const domain of profile.ecosystem.domains.value) {
      if (domain.name && domain.detail) {
        addClaim(`${cityName} domain: ${domain.name} — ${domain.detail}`);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ECOSYSTEM: COWORKING
  // ═══════════════════════════════════════════════════════════════════════════
  if (profile.ecosystem?.coworking?.spaces) {
    for (const space of profile.ecosystem.coworking.spaces) {
      addClaim(`${space.name} (${space.type})`);
    }
  }
  if (profile.ecosystem?.coworking?.totalSpaces) {
    addClaim(`${profile.ecosystem.coworking.totalSpaces}+ coworking spaces in ${cityName}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ECOSYSTEM: STUDENT ORGS & CONTACTS
  // ═══════════════════════════════════════════════════════════════════════════
  if (profile.ecosystem?.studentOrgs?.value) {
    for (const org of profile.ecosystem.studentOrgs.value) {
      let text = `${org.name}`;
      if (org.description) text += `: ${org.description}`;
      if (org.url) text += ` (${org.url})`;
      addClaim(text);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ECOSYSTEM: CLUSTERS & REGIONAL CONTEXT
  // ═══════════════════════════════════════════════════════════════════════════
  if (profile.ecosystem?.clusters?.value) {
    addClaim(`${cityName}: ${profile.ecosystem.clusters.value}`);
  }
  if (profile.ecosystem?.clusters?.regionalShare) {
    addClaim(`${cityName}: ${profile.ecosystem.clusters.regionalShare}`);
  }
  if (profile.ecosystem?.clusters?.nearbyHub) {
    addClaim(`${cityName} nearby hub: ${profile.ecosystem.clusters.nearbyHub}`);
  }
  if (profile.ecosystem?.clusters?.techClusterName) {
    addClaim(`Tech cluster: ${profile.ecosystem.clusters.techClusterName}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INFRASTRUCTURE: AIRPORT
  // ═══════════════════════════════════════════════════════════════════════════
  if (profile.infrastructure?.airport) {
    const airport = profile.infrastructure.airport;
    const iata = airport.iataCode || airport.iata || '';
    if (airport.name && airport.distanceKm) {
      const iataStr = iata ? ` (${iata})` : '';
      addClaim(`${airport.name}${iataStr}, ${airport.distanceKm}km from ${cityName}`);
    } else if (airport.name && airport.driveTime) {
      addClaim(`${cityName} airport access via ${airport.name}, ${airport.driveTime}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INFRASTRUCTURE: COMMUTE TIMES
  // ═══════════════════════════════════════════════════════════════════════════
  if (profile.infrastructure?.commuteTimes?.routes) {
    for (const route of profile.infrastructure.commuteTimes.routes) {
      const toCity = route.to.charAt(0).toUpperCase() + route.to.slice(1);
      addClaim(`${cityName} to ${toCity}: ${route.time} by ${route.mode}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INFRASTRUCTURE: CONNECTIVITY
  // ═══════════════════════════════════════════════════════════════════════════
  if (profile.infrastructure?.connectivity) {
    const conn = profile.infrastructure.connectivity;
    if (conn.fiberPenetration) {
      addClaim(`${cityName} fiber penetration: ${conn.fiberPenetration}%`);
    }
    if (conn.avgDownloadMbps) {
      addClaim(`${cityName} average download: ${conn.avgDownloadMbps} Mbps`);
    }
    if (conn.latencyFrankfurt) {
      addClaim(`${cityName} latency to Frankfurt: ${conn.latencyFrankfurt}ms`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIVERSITIES & RESEARCH
  // ═══════════════════════════════════════════════════════════════════════════
  if (profile.universityDetail?.institutions) {
    for (const inst of profile.universityDetail.institutions) {
      if (inst.type === 'university') {
        const parent = inst.parent ? ` — ${inst.parent}` : '';
        addClaim(`${inst.name}${parent}`);
        // Also add programs if available
        if (inst.programs?.length) {
          addClaim(`${inst.name} programs: ${inst.programs.join(', ')}`);
        }
      }
    }
  }

  // Research centers
  if (profile.universityDetail?.institutions) {
    for (const inst of profile.universityDetail.institutions) {
      if (inst.type === 'research' && inst.focus) {
        const focusText = inst.focus.join(', ');
        addClaim(`${inst.name}: ${focusText}`);
      }
    }
  }

  // Talent profile narrative
  if (profile.universityDetail?.talentProfile?.value) {
    addClaim(`${cityName} talent: ${profile.universityDetail.talentProfile.value}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CULTURE: CLIMATE
  // ═══════════════════════════════════════════════════════════════════════════
  if (profile.culture?.climate) {
    const climate = profile.culture.climate;
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

  // ═══════════════════════════════════════════════════════════════════════════
  // CULTURE: QUALITY OF LIFE
  // ═══════════════════════════════════════════════════════════════════════════
  if (profile.culture?.qualityOfLife) {
    const qol = profile.culture.qualityOfLife;
    if (qol.walkability) {
      addClaim(`${cityName} walkability: ${qol.walkability}`);
    }
    if (qol.healthcare) {
      addClaim(`${cityName} healthcare: ${qol.healthcare}`);
    }
    if (qol.culture) {
      addClaim(`${cityName} culture: ${qol.culture}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CULTURE: RETENTION
  // ═══════════════════════════════════════════════════════════════════════════
  if (profile.culture?.retention) {
    const ret = profile.culture.retention;
    if (ret.narrative) {
      addClaim(`${cityName}: ${ret.narrative}`);
    }
    if (ret.strengths?.length) {
      addClaim(`${cityName} strengths: ${ret.strengths.join(', ')}`);
    }
    if (ret.risks?.length) {
      addClaim(`${cityName} risks: ${ret.risks.join(', ')}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MASTER.JSON METRICS — Detailed claims for fact-checking
  // ═══════════════════════════════════════════════════════════════════════════
  if (cityData) {
    // ─── COST METRICS (EXTERNALLY VERIFIABLE) ───
    // Office Rent: Good-quality below-prime office space
    if (cityData.costs?.officeRent?.min || cityData.costs?.officeRent?.max) {
      const min = cityData.costs.officeRent.min;
      const max = cityData.costs.officeRent.max;
      if (min && max) {
        addClaim(`${cityName} office rent: \u20ac${min}-${max}/m\u00b2/month (good-quality, below-prime office space)`);
      } else if (min) {
        addClaim(`${cityName} office rent: from \u20ac${min}/m\u00b2/month (good-quality, below-prime office space)`);
      }
    }
    
    // Residential Rent: 1-bedroom ~50 m², city center
    if (cityData.costs?.residentialRent?.min || cityData.costs?.residentialRent?.max) {
      const min = cityData.costs.residentialRent.min;
      const max = cityData.costs.residentialRent.max;
      if (min && max) {
        addClaim(`${cityName} residential rent: \u20ac${min}-${max}/month (1-bedroom ~50 m\u00b2, city center)`);
      } else if (min) {
        addClaim(`${cityName} residential rent: from \u20ac${min}/month (1-bedroom ~50 m\u00b2, city center)`);
      }
    }
    
    // COL Index: Numbeo (externally verifiable)
    if (cityData.costs?.colIndex?.value) {
      addClaim(`${cityName} Cost of Living Index (excl. rent): ${cityData.costs.colIndex.value} (Numbeo, NYC=100)`);
    }
    
    // ─── TALENT & SALARY METRICS (METHODOLOGY CHECKS) ───
    
    const officialStem = cityData.talent?.graduates?.officialStem?.value;
    const digitalStemPlus = cityData.talent?.graduates?.digitalStemPlus?.value;
    const coreICT = cityData.talent?.graduates?.coreICT?.value;
    
    if (officialStem) {
      addClaim(`${cityName} Official STEM graduates (DGEEC, CNAEF 04+05+06+07+72): ${officialStem}/year`, true);
    }
    if (digitalStemPlus && officialStem) {
      const expected = Math.round(officialStem * 1.27);
      addClaim(`${cityName} Digital STEM+ graduates: ${digitalStemPlus}/year (formula: Official STEM ${officialStem} \u00d7 1.27 = ${expected})`, true);
    } else if (digitalStemPlus) {
      addClaim(`${cityName} Digital STEM+ graduates: ${digitalStemPlus}/year (= Official STEM \u00d7 1.27)`, true);
    }
    if (coreICT && officialStem) {
      const ictPct = ((coreICT / officialStem) * 100).toFixed(1);
      addClaim(`${cityName} Core ICT graduates (CNAEF 481+523): ${coreICT}/year (${ictPct}% of Official STEM)`, true);
    } else if (coreICT) {
      addClaim(`${cityName} Core ICT graduates (CNAEF 481+523): ${coreICT}/year`, true);
    }
    
    // Salary Index
    if (cityData.costs?.salaryIndex?.value) {
      addClaim(`${cityName} Salary Index: ${cityData.costs.salaryIndex.value} (Lisbon=100, INE regional wages)`, true);
    }
  }

  return claims;
}

/**
 * Generate a fact-check verification prompt for the selected category.
 * v2.2 — Dynamic claims from source DBs for city profiles.
 * @returns {Promise<string>} The formatted fact-check prompt
 */
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

  let verifiableClaims;
  let categoryLabel;
  let internalWarning = '';

  // For city profiles, generate claims dynamically from CITY_PROFILES.json
  if (categoryKey.startsWith('city:')) {
    const cityId = categoryKey.replace('city:', '');
    const profile = getCityProfile(cityId);
    
    if (!profile) {
      return `⚠️ City "${cityId}" not found in CITY_PROFILES database.`;
    }
    
    const allClaims = await generateCityClaimsFromSource(cityId);
    
    // Separate internal vs external claims
    const externalClaims = allClaims.filter(c => !c.internal);
    const internalClaims = allClaims.filter(c => c.internal);
    
    // Include ALL claims for verification (external + internal methodology checks)
    verifiableClaims = allClaims;
    categoryLabel = `${profile._meta?.cityId?.charAt(0).toUpperCase()}${profile._meta?.cityId?.slice(1)} City Database`;
    
    if (verifiableClaims.length === 0) {
      return `⚠️ No claims could be generated for ${cityId}. Check CITY_PROFILES.json data.`;
    }
    
    // Add internal calculation methodology explanation
    if (internalClaims.length > 0) {
      internalWarning = `
---

## METRIC DEFINITIONS (READ CAREFULLY)

### Cost Metrics (VERIFY via real estate portals, Numbeo, JLL reports)

| Metric | Definition | Verification Approach |
|--------|------------|----------------------|
| **Office Rent** | Prime Class A CBD office space, asking rent €/m²/month | Check JLL, C&W, Savills Portugal reports. Interior cities may have estimates. |
| **Residential Rent** | T1 (1-bedroom) city center apartments, €/month | Check Idealista.pt, Numbeo. Ranges vary by neighborhood. |
| **COL Index** | Numbeo Cost of Living Index (New York City = 100) | Search "Numbeo [city] cost of living". Note: smaller cities may lack data. |

### Internal Calculations (VERIFY IF REASONABLE — not if they exist)

These metrics use our **internal methodology**. You cannot find these exact numbers online. Instead, verify if they are **plausible** given the city's context.

| Metric | Our Definition | How to Verify Reasonableness |
|--------|----------------|------------------------------|
| **Official STEM** | DGEEC graduates in CNAEF codes 04,05,06,07,72 | Check if city has universities offering STEM. Compare to city size. |
| **Digital STEM+** | Official STEM × 1.27 expansion factor (includes CTeSP, adjacent fields) | Should be ~27% higher than Official STEM. |
| **Core ICT** | CNAEF 481 (CS) + 523 (Electronics) — pure IT specialists | Typically 10-20% of Digital STEM+. |
| **Salary Index** | Regional wages indexed to Lisbon=100, adjusted for cost of living | Interior cities should be 70-85. Porto/Lisbon area 90-100. |

**For internal calculations:** Mark as SUPPORTED if the numbers are **reasonable given the city's profile** (university count, population, COL). Mark as NEEDS_UPDATE only if clearly implausible.
`;
    }
  } else {
    // For data categories, generate claims dynamically from WEBSITE_CONTENT/MASTER
    const categoryLabels = {
      'macroeconomic': 'Macroeconomic',
      'digitalInfra': 'Digital Infrastructure',
      'officeRent': 'Office Rent',
      'residentialRent': 'Residential Rent',
      'workforce': 'Workforce Talent',
      'strategic': 'Strategic & Tax',
      'taxIncentives': 'Strategic & Tax',     // HTML alias
      'universityTalent': 'University Talent',
      'graduates': 'University Talent',        // HTML alias
      'cityDatabase': 'City Database (All Metrics)'
    };
    
    verifiableClaims = generateDataCategoryClaims(categoryKey);
    categoryLabel = categoryLabels[categoryKey] || categoryKey;
    
    if (verifiableClaims.length === 0) {
      return `⚠️ No claims could be generated for "${categoryKey}". Check WEBSITE_CONTENT.json or MASTER.json data.`;
    }
    
    // cityDatabase uses a specialized prompt builder
    if (categoryKey === 'cityDatabase') {
      return buildCityDatabasePrompt(verifiableClaims, methodology);
    }
  }

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
  
  // Add internal claims section if present
  let internalClaimsSection = '';
  if (internalClaimsOnly.length > 0) {
    internalClaimsSection = `

---

## INTERNAL METHODOLOGY CLAIMS (Verify if REASONABLE)

These use our internal calculations. Check if the numbers **make sense** given the city's context.

| ID | Claim |
|----|-------|
${internalClaimsOnly.map(c => `| ${c.id} | ${c.claim} |`).join('\n')}`;
  }

  // Status codes
  const statusCodes = methodology.statusCodes.map(s => 
    `| ${s.code} | ${s.description} |`
  ).join('\n');

  const prompt = `# FACT-CHECK VERIFICATION PROMPT v2.3
## Category: ${categoryLabel}
> **Claims to verify:** ${verifiableClaims.length} (${externalClaimsOnly.length} external + ${internalClaimsOnly.length} methodology)

---

## YOUR TASK

Verify each claim below using **any method you have available** — your training knowledge, web search, or any reliable source you can access. We don't prescribe HOW you verify; we only need accurate results.

### RULES

1. **±5% TOLERANCE** — Values within 5% of claimed = SUPPORTED
2. **2023-2025 DATA** — Flag anything using data older than 2023
3. **BE HONEST** — If you can't verify a claim, mark it UNVERIFIABLE. Don't guess.
${internalWarning}

---

## CLAIMS TO VERIFY (External Sources)

| ID | Claim |
|----|-------|
${claimsList}
${internalClaimsSection}

---

## REQUIRED OUTPUT FORMAT (JSONL)

Respond with **one JSON object per line**, no other text before or after the JSONL block:

\`\`\`jsonl
{"claim_id":"${verifiableClaims[0]?.id || 'XXX-01'}","status":"SUPPORTED","verified_value":"<actual value you found>","source":"<where you found it>","notes":"<brief explanation>"}
\`\`\`

### STATUS CODES (use exactly these)

| Code | When to Use |
|------|-------------|
${statusCodes}

---

## AFTER JSONL, PROVIDE SUMMARY

1. **Score:** X/Y SUPPORTED (e.g., "7/9 claims verified")
2. **Corrections Needed:** List any claims that need updating, with the correct value
3. **Confidence Assessment:** Based on your findings, is this category reliable?

---

Begin verification.`;

  return prompt;
}

/**
 * Initialize the AI Simulator form and buttons.
 */
export function initSimulator() {
  const generateBtn = document.getElementById('generate-prompt-btn');
  const copyBtn = document.getElementById('copy-prompt-btn');
  const outputEl = document.getElementById('simulator-output');

  if (!generateBtn || !outputEl) return;

  // Generate prompt
  generateBtn.addEventListener('click', () => {
    const prompt = generateMasterPrompt();
    outputEl.textContent = prompt;
    if (copyBtn) copyBtn.disabled = false;
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

        // Flash AI link cards
        const aiLinks = document.querySelectorAll('.ai-link-card');
        aiLinks.forEach((link, i) => {
          setTimeout(() => {
            link.style.animation = 'none';
            link.offsetHeight; // reflow
            link.style.animation = 'ai-link-flash 0.6s ease';
          }, i * 100);
        });

        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = originalHTML;
        }, 2500);
      } catch {
        // Fallback: select pre content
        const range = document.createRange();
        range.selectNodeContents(outputEl);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand('copy');
        sel.removeAllRanges();
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Copied!';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = originalHTML;
        }, 2500);
      }
    });
  }

  // Form conditional logic — dim office fields when fully remote
  initFormConditionalLogic();
  
  // Initialize separate fact-check generator
  initFactCheckGenerator();
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
        // Fallback
        const range = document.createRange();
        range.selectNodeContents(outputEl);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand('copy');
        sel.removeAllRanges();
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Copied!';
        setTimeout(() => {
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
