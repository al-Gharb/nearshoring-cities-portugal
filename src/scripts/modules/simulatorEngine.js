/**
 * SIMULATOR ENGINE — Experimental v3
 *
 * Deterministic computation engine for the AI Nearshoring Simulator.
 * ALL financial math, scoring, ranking, and mode determination happens here.
 * The LLM prompt receives only pre-computed results — zero arithmetic.
 *
 * Architecture principle: LLM → reasoning & narrative.
 *                         This module → all financial computation.
 *                         LLM consumes computed outputs.
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Employer social security rate (23.75%) */
const SS_RATE = 0.2375;

/** Monthly meal allowance (€10.20/day × ~17 working days) */
const MEAL_ALLOWANCE = 175;

/** Employer cost multiplier: 1 + SS_RATE */
const EMPLOYER_MULTIPLIER = 1 + SS_RATE; // 1.2375

/** Maximum stack premium cap */
const MAX_STACK_PREMIUM = 0.60;

/** Lisbon salary index baseline */
const LISBON_INDEX = 100;

/** Budget default buffer when budget missing (10% above Lisbon baseline) */
const DEFAULT_BUDGET_BUFFER = 1.10;

/** Feasibility thresholds calibrated for OpEx-based monthly cost model */
const FEASIBILITY_THRESHOLDS = {
  verdictFeasibleBufferPct: 8,
  verdictTightBufferPct: -2,
  highBandMinWeighted: 8.3,
  highBandMinBufferPct: 6,
  mediumBandMinWeighted: 6.8,
  mediumBandMinBufferPct: -2,
};

/** Work model to seat occupancy factor */
const WORK_MODEL_OCCUPANCY = {
  'fully-remote': 0.15,
  'remote-first': 0.35,
  hybrid: 0.60,
  'office-first': 0.85,
  'fully-onsite': 1.00,
};

/** Seat area assumptions (m2 per seat) by office quality */
const OFFICE_M2_PER_SEAT = {
  budget: 8,
  standard: 10,
  premium: 12,
};

/** Utilities and office running costs as % of rent */
const UTILITIES_RATE_BY_QUALITY = {
  budget: 0.18,
  standard: 0.22,
  premium: 0.27,
};

/** Admin overhead: payroll/accounting/legal/recruiting baseline */
const ADMIN_BASE_FEE_MONTHLY = 750;
const ADMIN_PER_FTE_MONTHLY = 95;

/* ═══════════════════════════════════════════════════════════════════════════
 * CITY TIER CLASSIFICATION
 * ═══════════════════════════════════════════════════════════════════════════ */

const CITY_TIERS = {
  lisbon: 1, porto: 1,
  braga: 2, coimbra: 2, aveiro: 2,
  guimaraes: 3, evora: 3, faro: 3, setubal: 3,
  covilha: 4, vilareal: 4, vianacastelo: 4, braganca: 4,
  leiria: 4, viseu: 4, castelobranco: 4, tomar: 4,
  beja: 4, portalegre: 4, santarem: 4,
};

const OBJECTIVE_WEIGHT_PROFILES = {
  cost: { strategic: 0.15, financial: 0.60, talent: 0.25 },
  quality: { strategic: 0.40, financial: 0.20, talent: 0.40 },
  speed: { strategic: 0.20, financial: 0.35, talent: 0.45 },
  balanced: { strategic: 0.25, financial: 0.40, talent: 0.35 },
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function resolveRentPerM2(officeRent, officeStrategy) {
  const minRent = Number.isFinite(officeRent?.min) ? officeRent.min : 12;
  const maxRent = Number.isFinite(officeRent?.max) ? officeRent.max : 18;

  if (officeStrategy === 'city-center') return maxRent;
  if (officeStrategy === 'business-park') return minRent;
  if (officeStrategy === 'university-adjacent') return Math.round((minRent * 0.6 + maxRent * 0.4) * 100) / 100;
  if (officeStrategy === 'low-profile') return Math.round((minRent * 0.85 + maxRent * 0.15) * 100) / 100;

  return Math.round(((minRent + maxRent) / 2) * 100) / 100;
}

function computeOperatingCostComponents({
  emcMonthly,
  teamSize,
  officeRent,
  workModel,
  officeQuality,
  officeStrategy,
}) {
  const occupancyFactor = WORK_MODEL_OCCUPANCY[workModel] ?? WORK_MODEL_OCCUPANCY.hybrid;
  const m2PerSeat = OFFICE_M2_PER_SEAT[officeQuality] ?? OFFICE_M2_PER_SEAT.standard;
  const utilitiesRate = UTILITIES_RATE_BY_QUALITY[officeQuality] ?? UTILITIES_RATE_BY_QUALITY.standard;
  const rentPerM2 = resolveRentPerM2(officeRent, officeStrategy);

  const occupiedSeats = Math.max(1, Math.ceil(teamSize * occupancyFactor));
  const officeRentMonthly = Math.round(occupiedSeats * m2PerSeat * rentPerM2);
  const utilitiesMonthly = Math.round(officeRentMonthly * utilitiesRate);
  const adminMonthly = Math.round(ADMIN_BASE_FEE_MONTHLY + (teamSize * ADMIN_PER_FTE_MONTHLY));
  const peopleCostMonthly = emcMonthly * teamSize;
  const totalOperatingCostMonthly = peopleCostMonthly + officeRentMonthly + utilitiesMonthly + adminMonthly;

  return {
    occupancyFactor,
    occupiedSeats,
    m2PerSeat,
    rentPerM2,
    peopleCostMonthly,
    officeRentMonthly,
    utilitiesMonthly,
    adminMonthly,
    totalOperatingCostMonthly,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * SCORING LOOKUP TABLES
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * MODE A: buffer_pct → financial score
 * @param {number} bufferPct
 * @returns {number} score 1–10
 */
function getFinancialScoreModeA(bufferPct) {
  const raw = 5 + (bufferPct / 6);
  return Math.round(clamp(raw, 1, 10) * 100) / 100;
}

/**
 * MODE B: max_feasible ratio → financial score
 * @param {number} ratio — maxFeasible / requestedTeamSize
 * @returns {number} score 1–10
 */
function getFinancialScoreModeB(ratio) {
  const raw = 1 + ((ratio - 0.50) / 1.0) * 9;
  return Math.round(clamp(raw, 1, 10) * 100) / 100;
}

/**
 * hiring_pressure_pct → talent score
 * @param {number} pressure — percentage
 * @returns {number} score 3–10
 */
function getTalentScore(pressure) {
  const raw = 10 - (pressure / 4);
  return Math.round(clamp(raw, 3, 10) * 100) / 100;
}

function getStrategicScore(city, context) {
  const {
    tier,
    industryLower,
    objectiveKey,
    workModel,
    officeStrategy,
    lifestyle,
    stemMin,
    stemMax,
    ictMin,
    ictMax,
  } = context;

  const tierBase = { 1: 7.8, 2: 7.0, 3: 6.4, 4: 5.8 };
  let score = tierBase[tier] || 5.8;

  const stemNorm = (city.stemGrads - stemMin) / Math.max(1, (stemMax - stemMin));
  const ictNorm = (city.ictGrads - ictMin) / Math.max(1, (ictMax - ictMin));
  const ecosystemDepth = Math.log10(1 + (city.majorCompanies?.length || 0));

  score += stemNorm * 0.7;
  score += ictNorm * 0.6;
  score += ecosystemDepth * 0.45;

  if (getDomainFit(city.id, industryLower)) {
    score += 0.6;
  }

  if (city.featured) {
    score += 0.2;
  }

  const onsiteHeavy = ['hybrid', 'office-first', 'fully-onsite'].includes(workModel);
  if (onsiteHeavy && city.hasAirport) {
    score += 0.2;
  }

  if (officeStrategy === 'university-adjacent' && city.stemGrads >= 1200) {
    score += 0.25;
  }

  if (officeStrategy === 'city-center' && city.officeRent?.max <= 15) {
    score += 0.15;
  }

  if (lifestyle === 'coastal-warm' && ['lisbon', 'porto', 'setubal', 'faro', 'aveiro', 'vianacastelo'].includes(city.id)) {
    score += 0.2;
  }

  if (objectiveKey === 'speed' && tier === 1) {
    score += 0.2;
  }

  if (objectiveKey === 'cost' && city.colIndex <= 34) {
    score += 0.15;
  }

  return Math.round(clamp(score, 3, 10) * 100) / 100;
}

function getTalentScoreComposite(city, context) {
  const {
    effectiveTeamSize,
    teamScaleFactor,
    pressureThreshold,
    ictMin,
    ictMax,
    stemMin,
    stemMax,
    objectiveKey,
  } = context;

  const demand = effectiveTeamSize * teamScaleFactor;
  const adjustedPressure = (demand / Math.max(1, city.ictGrads || 1)) * 100;
  const pressureScore = getTalentScore(adjustedPressure);

  const ictNorm = (city.ictGrads - ictMin) / Math.max(1, (ictMax - ictMin));
  const stemNorm = (city.stemGrads - stemMin) / Math.max(1, (stemMax - stemMin));
  const ecosystemDepth = Math.log10(1 + (city.majorCompanies?.length || 0));

  let score = (pressureScore * 0.55)
    + ((3 + ictNorm * 7) * 0.25)
    + ((3 + stemNorm * 7) * 0.15)
    + (Math.min(10, 4 + ecosystemDepth * 3.2) * 0.05);

  if (objectiveKey === 'quality' || objectiveKey === 'speed') {
    score += ictNorm * 0.25;
  }

  if (adjustedPressure > pressureThreshold) {
    score -= 0.4;
  }

  return {
    score: Math.round(clamp(score, 3, 10) * 100) / 100,
    adjustedPressure: Math.round(adjustedPressure * 10) / 10,
  };
}

function getFeasibilityBand(city) {
  if (city.verdict === 'INFEASIBLE') return 'LOW';
  if (city.dealbreakerPenalty >= 2.5) return 'LOW';
  if (city.weighted >= FEASIBILITY_THRESHOLDS.highBandMinWeighted
    && city.bufferPct >= FEASIBILITY_THRESHOLDS.highBandMinBufferPct) return 'HIGH';
  if (city.weighted >= FEASIBILITY_THRESHOLDS.mediumBandMinWeighted
    && city.bufferPct >= FEASIBILITY_THRESHOLDS.mediumBandMinBufferPct) return 'MEDIUM';
  return 'LOW';
}

/* ═══════════════════════════════════════════════════════════════════════════
 * CORE COMPUTATION
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Compute Employer Monthly Cost for a city.
 * Single canonical formula path — no alternatives.
 *
 * @param {number} midpoint — role base midpoint (Lisbon, 12x monthly gross)
 * @param {number} tierMultiplier — seniority multiplier (e.g., 1.25 for senior)
 * @param {number} stackPremium — tech stack premium (e.g., 0.25 for ML)
 * @param {number} salaryIndex — city salary index (Lisbon = 100)
 * @returns {{ grossMonthly: number, emcMonthly: number, emcAnnual: number }}
 */
function computeEMC(midpoint, tierMultiplier, stackPremium, salaryIndex) {
  const tieredGross = midpoint * tierMultiplier;
  const cappedPremium = Math.min(stackPremium, MAX_STACK_PREMIUM);
  const stackAdjusted = tieredGross * (1 + cappedPremium);
  const cityGrossMonthly = Math.round(stackAdjusted * (salaryIndex / 100));
  const emcMonthly = Math.round((cityGrossMonthly * EMPLOYER_MULTIPLIER) + MEAL_ALLOWANCE);
  const emcAnnual = emcMonthly * 12;

  return { grossMonthly: cityGrossMonthly, emcMonthly, emcAnnual };
}

/**
 * Run the full deterministic analysis for all cities.
 *
 * @param {Object} params
 * @param {Object} params.currentBand — { min, mid, max, label }
 * @param {number} params.tierMultiplier — resolved seniority multiplier
 * @param {number} params.stackPremium — resolved tech stack premium
 * @param {number|null} params.teamSize — requested headcount (lower bound)
 * @param {number|null} params.budget — monthly OpEx budget in EUR
 * @param {Array} params.cities — city data array from prepareCityDataForAI()
 * @param {string} params.industry — client industry for domain fit
 * @param {number} params.teamSizeRaw — raw team size for weight adjustment
 * @param {string} params.officeQuality — budget/standard/premium
 * @returns {Object} Complete analysis results
 */
export function computeAnalysis({
  currentBand,
  tierMultiplier,
  stackPremium,
  teamSize,
  budget,
  cities,
  industry = '',
  teamSizeRaw = null,
  primaryObjective = 'balanced',
  dealbreakers = '',
  workModel = '',
  officeQuality = 'standard',
  officeStrategy = '',
  lifestyle = '',
}) {
  const effectiveTeamSize = teamSize || 5;
  const headcount = teamSizeRaw || effectiveTeamSize;

  // ── Budget default (OpEx-aware) ────────────────────────────────────────
  // If budget missing → assume Lisbon total OpEx × teamSize context × 1.10
  const lisbonEMC = computeEMC(currentBand.mid, tierMultiplier, stackPremium, LISBON_INDEX);
  const lisbonCity = cities.find(c => c.id === 'lisbon') || cities[0] || { officeRent: { min: 12, max: 18 } };
  const lisbonOpEx = computeOperatingCostComponents({
    emcMonthly: lisbonEMC.emcMonthly,
    teamSize: effectiveTeamSize,
    officeRent: lisbonCity.officeRent,
    workModel,
    officeQuality,
    officeStrategy,
  });
  let effectiveBudget = budget;
  let budgetAssumed = false;

  if (!budget || budget <= 0) {
    effectiveBudget = Math.round(lisbonOpEx.totalOperatingCostMonthly * DEFAULT_BUDGET_BUFFER);
    budgetAssumed = true;
  }

  // ── Per-city computation ────────────────────────────────────────────────
  const cityResults = cities.map(city => {
    const emc = computeEMC(currentBand.mid, tierMultiplier, stackPremium, city.salaryIndex);
    const opEx = computeOperatingCostComponents({
      emcMonthly: emc.emcMonthly,
      teamSize: effectiveTeamSize,
      officeRent: city.officeRent,
      workModel,
      officeQuality,
      officeStrategy,
    });

    // Budget feasibility (total monthly OpEx, not salary-only)
    const teamTotalMonthly = opEx.totalOperatingCostMonthly;
    const teamTotalAnnual = teamTotalMonthly * 12;
    const teamPeopleAnnual = emc.emcAnnual * effectiveTeamSize;
    const bufferPct = ((effectiveBudget - teamTotalMonthly) / teamTotalMonthly) * 100;
    const perHeadOperating = Math.max(1, teamTotalMonthly / effectiveTeamSize);
    const maxFeasible = Math.floor(effectiveBudget / perHeadOperating);

    // Verdict
    let verdict;
    if (bufferPct >= FEASIBILITY_THRESHOLDS.verdictFeasibleBufferPct) verdict = 'FEASIBLE';
    else if (bufferPct >= FEASIBILITY_THRESHOLDS.verdictTightBufferPct) verdict = 'TIGHT';
    else verdict = 'INFEASIBLE';

    // Hiring pressure
    const ictGrads = city.ictGrads || 1;
    const hiringPressure = (effectiveTeamSize / ictGrads) * 100;

    // Savings vs Lisbon (salary-only + total OpEx view)
    const savingsAnnual = (lisbonEMC.emcAnnual - emc.emcAnnual) * effectiveTeamSize;
    const lisbonTeamOperatingAnnual = lisbonOpEx.totalOperatingCostMonthly * 12;
    const teamOperatingAnnual = teamTotalMonthly * 12;
    const operatingSavingsAnnual = lisbonTeamOperatingAnnual - teamOperatingAnnual;

    return {
      id: city.id,
      name: city.name,
      featured: city.featured,
      region: city.region,
      salaryIndex: city.salaryIndex,
      colIndex: city.colIndex,
      ictGrads,
      stemGrads: city.stemGrads || 0,
      regionalStemPool: city.regionalStemPool ?? city.regionalPool ?? 0,
      tags: city.tags || [],
      majorCompanies: city.majorCompanies || [],
      hasAirport: city.hasAirport ?? false,
      airportAccessMinutes: city.airportAccessMinutes ?? null,
      officeRent: city.officeRent || { min: 12, max: 18 },
      residentialRent: city.residentialRent || { min: 800, max: 1200 },

      // Financial
      grossMonthly: emc.grossMonthly,
      emcMonthly: emc.emcMonthly,
      emcAnnual: emc.emcAnnual,
      teamTotalMonthly,
      teamTotalAnnual,
      operatingCostMonthly: teamTotalMonthly,
      operatingCostAnnual: teamOperatingAnnual,
      peopleCostMonthly: opEx.peopleCostMonthly,
      peopleCostAnnual: teamPeopleAnnual,
      officeRentMonthly: opEx.officeRentMonthly,
      utilitiesMonthly: opEx.utilitiesMonthly,
      adminMonthly: opEx.adminMonthly,
      occupiedSeats: opEx.occupiedSeats,
      occupancyFactor: Math.round(opEx.occupancyFactor * 100) / 100,
      rentPerM2: opEx.rentPerM2,
      bufferPct: Math.round(bufferPct * 10) / 10,
      maxFeasible,
      verdict,
      savingsAnnual,
      operatingSavingsAnnual,

      // Talent
      hiringPressure: Math.round(hiringPressure * 10) / 10,
    };
  });

  // ── Mode determination (critique #4 — single authoritative block) ──────
  const anyFeasible = cityResults.some(c => c.maxFeasible >= effectiveTeamSize);
  const mode = anyFeasible ? 'MODE_A' : 'MODE_B';

  // ── Scoring ────────────────────────────────────────────────────────────
  const industryLower = (industry || '').toLowerCase();
  const dealbreakersLower = (dealbreakers || '').toLowerCase();
  const isLargeTeam = headcount >= 50;

  const objectiveKey = ['cost', 'quality', 'speed', 'balanced'].includes(primaryObjective)
    ? primaryObjective
    : 'balanced';

  const ictValues = cityResults.map(c => c.ictGrads || 0);
  const stemValues = cityResults.map(c => c.stemGrads || 0);
  const ictMin = Math.min(...ictValues);
  const ictMax = Math.max(...ictValues);
  const stemMin = Math.min(...stemValues);
  const stemMax = Math.max(...stemValues);

  const teamScaleFactor = objectiveKey === 'speed' ? 1.1 : objectiveKey === 'cost' ? 0.95 : 1.0;
  const pressureThreshold = headcount <= 15 ? 20 : headcount <= 30 ? 15 : 10;

  const baseWeights = OBJECTIVE_WEIGHT_PROFILES[objectiveKey];
  const weights = isLargeTeam
    ? {
        strategic: Math.min(baseWeights.strategic + 0.05, 0.50),
        financial: Math.max(baseWeights.financial - 0.05, 0.15),
        talent: baseWeights.talent,
      }
    : { ...baseWeights };

  // normalize to sum=1 after large-team adjustment
  const totalWeight = weights.strategic + weights.financial + weights.talent;
  weights.strategic = weights.strategic / totalWeight;
  weights.financial = weights.financial / totalWeight;
  weights.talent = weights.talent / totalWeight;

  const scoredCities = cityResults.map(city => {
    // Strategic score
    const tier = CITY_TIERS[city.id] || 4;
    const strategicScore = getStrategicScore(city, {
      tier,
      industryLower,
      objectiveKey,
      workModel,
      officeStrategy,
      lifestyle,
      stemMin,
      stemMax,
      ictMin,
      ictMax,
    });

    // Financial score
    const financialScore = mode === 'MODE_A'
      ? getFinancialScoreModeA(city.bufferPct)
      : getFinancialScoreModeB(city.maxFeasible / effectiveTeamSize);

    // Talent score (composite + adjusted pressure)
    const talentComposite = getTalentScoreComposite(city, {
      effectiveTeamSize,
      teamScaleFactor,
      pressureThreshold,
      ictMin,
      ictMax,
      stemMin,
      stemMax,
      objectiveKey,
    });
    const talentScore = talentComposite.score;

    // Dealbreaker penalty (heavy, deterministic)
    const dealbreaker = evaluateDealbreakerPenalty(city, {
      dealbreakersLower,
      workModel,
      officeStrategy,
      lifestyle,
    });

    // Weighted score (before/after penalties)
    const weightedRaw = Math.round(
      ((strategicScore * weights.strategic) +
       (financialScore * weights.financial) +
       (talentScore * weights.talent)) * 100
    ) / 100;

    const weighted = Math.max(1, Math.round((weightedRaw - dealbreaker.penalty) * 100) / 100);

    return {
      ...city,
      tier,
      strategicBase: strategicScore,
      domainFit: getDomainFit(city.id, industryLower) ? 1 : 0,
      strategicScore,
      financialScore,
      talentScore,
      hiringPressure: talentComposite.adjustedPressure,
      dealbreakerPenalty: dealbreaker.penalty,
      dealbreakerHits: dealbreaker.hits,
      weightedRaw,
      weighted,
      feasibilityBand: 'MEDIUM',
    };
  });

  scoredCities.forEach((city) => {
    city.feasibilityBand = getFeasibilityBand(city);
  });

  // ── Ranking (critique #5 — simplified tie-break) ──────────────────────
  scoredCities.sort((a, b) => {
    // Primary: higher weighted score
    const wDiff = b.weighted - a.weighted;
    if (Math.abs(wDiff) >= 0.005) return wDiff;

    // Tie-break R1: lower EMC
    if (a.emcMonthly !== b.emcMonthly) return a.emcMonthly - b.emcMonthly;

    // Tie-break R2: larger ICT pool
    if (a.ictGrads !== b.ictGrads) return b.ictGrads - a.ictGrads;

    // Tie-break R3: higher strategic
    return b.strategicScore - a.strategicScore;
  });

  // Assign ranks
  scoredCities.forEach((city, i) => { city.rank = i + 1; });

  // ── Confidence flags (critique #7 — flag, don't recalculate) ──────────
  const riskFlags = [];

  scoredCities.forEach(city => {
    // Savings cross-check
    const expectedSavingsPerHead = (lisbonEMC.emcAnnual - city.emcAnnual);
    const actualSavingsPerHead = city.savingsAnnual / effectiveTeamSize;
    if (Math.abs(expectedSavingsPerHead - actualSavingsPerHead) > 500) {
      riskFlags.push({ city: city.id, flag: 'savings_mismatch', confidence: 'LOW' });
    }

    // Infeasible city
    if (city.verdict === 'INFEASIBLE') {
      riskFlags.push({ city: city.id, flag: 'infeasible_city' });
    }

    if (city.dealbreakerPenalty > 0) {
      riskFlags.push({ city: city.id, flag: 'dealbreaker_penalty', note: city.dealbreakerHits.join(', ') });
    }

  });

  // ── Assemble results ──────────────────────────────────────────────────
  return {
    version: 'experimental-v3',
    mode,
    objective: objectiveKey,
    budgetAssumed,
    effectiveBudget,
    lisbonBaseline: {
      grossMonthly: lisbonEMC.grossMonthly,
      emcMonthly: lisbonEMC.emcMonthly,
      emcAnnual: lisbonEMC.emcAnnual,
      teamAnnual: lisbonEMC.emcAnnual * effectiveTeamSize,
      operatingMonthly: lisbonOpEx.totalOperatingCostMonthly,
      operatingAnnual: lisbonOpEx.totalOperatingCostMonthly * 12,
      peopleCostMonthly: lisbonOpEx.peopleCostMonthly,
      officeRentMonthly: lisbonOpEx.officeRentMonthly,
      utilitiesMonthly: lisbonOpEx.utilitiesMonthly,
      adminMonthly: lisbonOpEx.adminMonthly,
      occupiedSeats: lisbonOpEx.occupiedSeats,
    },
    weights,
    teamSize: effectiveTeamSize,
    roleLabel: currentBand.label,
    roleMidpoint: currentBand.mid,
    tierMultiplier,
    stackPremium,
    allCities: scoredCities,
    riskFlags,
  };
}

function evaluateDealbreakerPenalty(city, context) {
  const { dealbreakersLower = '', workModel = '', officeStrategy = '', lifestyle = '' } = context;
  const hits = [];
  let penalty = 0;

  if (!dealbreakersLower) {
    return { penalty, hits };
  }

  const requiresAirport = /airport|direct\s*flight|international\s*flight/.test(dealbreakersLower);
  const thresholdMatch = dealbreakersLower.match(/(?:within|under|<=?|max(?:imum)?|up\s*to)?\s*(\d{1,2})\s*(?:hours?|hrs?|h)(?:\s*(\d{1,2}))?/);
  const minuteThresholdMatch = dealbreakersLower.match(/(?:within|under|<=?|max(?:imum)?|up\s*to)?\s*(\d{1,3})\s*(?:min|mins|minutes)/);

  let requiredAirportMinutes = null;
  if (thresholdMatch) {
    const hours = Number.parseInt(thresholdMatch[1], 10);
    const minutes = thresholdMatch[2] ? Number.parseInt(thresholdMatch[2], 10) : 0;
    requiredAirportMinutes = (Number.isFinite(hours) ? hours * 60 : 0) + (Number.isFinite(minutes) ? minutes : 0);
  } else if (minuteThresholdMatch) {
    const minutes = Number.parseInt(minuteThresholdMatch[1], 10);
    requiredAirportMinutes = Number.isFinite(minutes) ? minutes : null;
  }

  if (requiresAirport) {
    const airportAccessMinutes = Number.isFinite(city.airportAccessMinutes) ? city.airportAccessMinutes : null;

    if (requiredAirportMinutes !== null) {
      const withinTimeWindow = city.hasAirport || (airportAccessMinutes !== null && airportAccessMinutes <= requiredAirportMinutes);
      if (!withinTimeWindow) {
        penalty += 1.6;
        hits.push('airport-time-window-fail');
      }
    } else if (!city.hasAirport) {
      penalty += 1.6;
      hits.push('no-airport');
    }
  }

  const requiresUniversity = /university|graduate\s*pipeline|campus/.test(dealbreakersLower);
  const regionalStemPool = city.regionalStemPool ?? city.regionalPool ?? 0;
  if (requiresUniversity && (city.stemGrads < 1000 && regionalStemPool < 2500)) {
    penalty += 1.2;
    hits.push('weak-university-pipeline');
  }

  const requiresLargePool = /large\s*talent|big\s*pool|deep\s*pool|high\s*volume/.test(dealbreakersLower);
  if (requiresLargePool && city.ictGrads < 800) {
    penalty += 1.1;
    hits.push('limited-ict-pool');
  }

  const requiresTechHub = /tech\s*hub|office\s*hub|cowork(?:ing)?|startup\s*ecosystem|innovation\s*hub/.test(dealbreakersLower);
  if (requiresTechHub && (city.majorCompanies?.length || 0) < 3) {
    penalty += 1.0;
    hits.push('weak-tech-hub-signal');
  }

  const requiresCoastal = /coastal|beach|seaside|warm/.test(dealbreakersLower) || lifestyle === 'coastal-warm';
  if (requiresCoastal && !['lisbon', 'porto', 'setubal', 'faro', 'aveiro', 'vianacastelo'].includes(city.id)) {
    penalty += 1.0;
    hits.push('non-coastal-fit');
  }

  const lowCostPriority = /low\s*cost|budget|cost\s*first|cost\s*sensitive/.test(dealbreakersLower) || lifestyle === 'low-cost';
  if (lowCostPriority && city.colIndex > 42) {
    penalty += 1.0;
    hits.push('high-col-for-low-cost-priority');
  }

  const officeCentric = ['hybrid', 'office-first', 'fully-onsite'].includes(workModel);
  const requiresCityCenter = officeStrategy === 'city-center' || /city\s*center|city\s*centre|central\s*office/.test(dealbreakersLower);
  if (officeCentric && requiresCityCenter && city.officeRent?.max > 24) {
    penalty += 1.1;
    hits.push('high-central-office-cost');
  }

  const remoteFirst = ['fully-remote', 'remote-first'].includes(workModel);
  const heavyOfficeDependency = /must\s*be\s*onsite|onsite\s*mandatory|office\s*every\s*day/.test(dealbreakersLower);
  if (remoteFirst && heavyOfficeDependency) {
    penalty += 0.8;
    hits.push('remote-vs-onsite-constraint-conflict');
  }

  return {
    penalty: Math.min(Math.round(penalty * 100) / 100, 4.0),
    hits,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * DOMAIN FIT LOOKUP
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Check if a city has domain fit for the client's industry.
 * @param {string} cityId
 * @param {string} industryLower — lowercased industry string
 * @returns {boolean}
 */
function getDomainFit(cityId, industryLower) {
  if (!industryLower) return false;

  const DOMAIN_MAP = {
    lisbon: ['biotech', 'pharma', 'life', 'fintech', 'banking', 'ai', 'ml', 'data', 'gaming', 'graphics', 'aerospace'],
    porto: ['biotech', 'pharma', 'automotive', 'mobility', 'fintech', 'banking', 'ai', 'ml', 'data', 'gaming'],
    braga: ['automotive', 'mobility'],
    coimbra: ['biotech', 'pharma', 'life', 'ai', 'ml', 'data', 'agritech', 'cleantech'],
    aveiro: ['telecom', '5g', 'networks', 'iot'],
    evora: ['aerospace', 'defense', 'agritech', 'cleantech'],
    faro: [],
    setubal: [],
    guimaraes: [],
    covilha: [],
  };

  const cityDomains = DOMAIN_MAP[cityId] || [];
  return cityDomains.some(domain => industryLower.includes(domain));
}

/* ═══════════════════════════════════════════════════════════════════════════
 * FORMATTING HELPERS (for prompt injection)
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Format the all-cities scoring table (full 20 cities).
 * @param {Object} results — from computeAnalysis()
 * @returns {string} Markdown table
 */
export function formatAllCitiesTable(results) {
  const header = '| # | City | Idx | EMC/mo | Salary/mo | Rent/mo | Utilities/mo | Admin/mo | OpEx/mo | Buffer% | Fin | Talent | Strat | Dbreak | Band | Weighted | Verdict |';
  const sep = '|---|------|-----|--------|-----------|---------|--------------|----------|---------|---------|-----|--------|-------|--------|------|----------|---------|';

  const rows = results.allCities.map(c =>
    `| ${c.rank} | ${c.name} | ${c.salaryIndex} | €${c.emcMonthly.toLocaleString()} | €${c.peopleCostMonthly.toLocaleString()} | €${c.officeRentMonthly.toLocaleString()} | €${c.utilitiesMonthly.toLocaleString()} | €${c.adminMonthly.toLocaleString()} | €${c.operatingCostMonthly.toLocaleString()} | ${c.bufferPct}% | ${c.financialScore} | ${c.talentScore} | ${c.strategicScore} | ${c.dealbreakerPenalty} | ${c.feasibilityBand} | ${c.weighted} | ${c.verdict} |`
  );

  return [header, sep, ...rows].join('\n');
}

/**
 * Build the pre-filled JSON summary with all computed values.
 * LLM only adds qualitative fields: strategy, best_if, lifestyle_tag, risk narrative.
 * @param {Object} results — from computeAnalysis()
 * @returns {string} JSON string
 */
export function buildJSONSummary(results) {
  const scores = {};
  results.allCities.forEach(c => {
    scores[c.id] = {
      weighted: c.weighted,
      weighted_raw: c.weightedRaw,
      financial_score: c.financialScore,
      talent_score: c.talentScore,
      strategic_score: c.strategicScore,
      dealbreaker_penalty: c.dealbreakerPenalty,
      dealbreaker_hits: c.dealbreakerHits,
      feasibility_band: c.feasibilityBand,
      buffer_pct: c.bufferPct,
      emc_monthly: c.emcMonthly,
      emc_annual: c.emcAnnual,
      operating_cost_monthly: c.operatingCostMonthly,
      operating_cost_annual: c.operatingCostAnnual,
      people_cost_monthly: c.peopleCostMonthly,
      people_cost_annual: c.peopleCostAnnual,
      office_rent_monthly: c.officeRentMonthly,
      utilities_monthly: c.utilitiesMonthly,
      admin_monthly: c.adminMonthly,
      team_cost_monthly: c.teamTotalMonthly,
      team_cost_annual: c.teamTotalAnnual,
      savings_vs_lisbon_annual: c.savingsAnnual,
      operating_savings_vs_lisbon_annual: c.operatingSavingsAnnual,
    };
  });

  return JSON.stringify({
    version: results.version,
    mode: results.mode,
    budget_assumed: results.budgetAssumed,
    effective_budget_monthly: results.effectiveBudget,
    primary_objective: results.objective,
    team_size: results.teamSize,
    role: results.roleLabel,
    lisbon_baseline_emc_annual: results.lisbonBaseline.emcAnnual,
    lisbon_team_annual: results.lisbonBaseline.teamAnnual,
    lisbon_baseline_operating_monthly: results.lisbonBaseline.operatingMonthly,
    lisbon_team_operating_annual: results.lisbonBaseline.operatingAnnual,
    considered_cities: results.allCities.map(c => c.id),
    weighted_order_all_cities: results.allCities.map(c => c.id),
    scores,
    risk_flags: results.riskFlags,
    // LLM fills these:
    advisor_picks: '«LLM: return final ranked Top 5 after considering all 20, with strategy/best_if/lifestyle_tag»',
    passed_over: '«LLM: list notable cities not in final Top 5 and why»',
    advisor_override: null,
  }, null, 2);
}

