/**
 * SIMULATOR ENGINE — V5.0
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

const TIER_BASE_SCORES = { 1: 9, 2: 7, 3: 6, 4: 5 };

/* ═══════════════════════════════════════════════════════════════════════════
 * SCORING LOOKUP TABLES
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * MODE A: buffer_pct → financial score
 * @param {number} bufferPct
 * @returns {number} score 1–10
 */
function getFinancialScoreModeA(bufferPct) {
  if (bufferPct >= 30) return 10;
  if (bufferPct >= 20) return 9;
  if (bufferPct >= 10) return 8;
  if (bufferPct >= 5) return 6;
  if (bufferPct >= 0) return 5;
  if (bufferPct >= -10) return 3;
  return 1;
}

/**
 * MODE B: max_feasible ratio → financial score
 * @param {number} ratio — maxFeasible / requestedTeamSize
 * @returns {number} score 1–10
 */
function getFinancialScoreModeB(ratio) {
  if (ratio >= 1.25) return 10;
  if (ratio >= 1.00) return 8;
  if (ratio >= 0.90) return 5;
  if (ratio >= 0.75) return 3;
  if (ratio >= 0.65) return 2;
  return 1;
}

/**
 * hiring_pressure_pct → talent score
 * @param {number} pressure — percentage
 * @returns {number} score 3–10
 */
function getTalentScore(pressure) {
  if (pressure < 3) return 10;
  if (pressure < 5) return 9;
  if (pressure < 8) return 8;
  if (pressure < 12) return 7;
  if (pressure < 20) return 5;
  return 3;
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
}) {
  const effectiveTeamSize = teamSize || 5;
  const headcount = teamSizeRaw || effectiveTeamSize;

  // ── Budget default (critique #10) ──────────────────────────────────────
  // If budget missing → assume Lisbon MIDPOINT EMC × teamSize × 1.10
  const lisbonEMC = computeEMC(currentBand.mid, tierMultiplier, stackPremium, LISBON_INDEX);
  let effectiveBudget = budget;
  let budgetAssumed = false;

  if (!budget || budget <= 0) {
    effectiveBudget = Math.round(lisbonEMC.emcMonthly * effectiveTeamSize * DEFAULT_BUDGET_BUFFER);
    budgetAssumed = true;
  }

  // ── Per-city computation ────────────────────────────────────────────────
  const cityResults = cities.map(city => {
    const emc = computeEMC(currentBand.mid, tierMultiplier, stackPremium, city.salaryIndex);

    // Budget feasibility
    const teamTotalMonthly = emc.emcMonthly * effectiveTeamSize;
    const teamTotalAnnual = emc.emcAnnual * effectiveTeamSize;
    const bufferPct = ((effectiveBudget - teamTotalMonthly) / teamTotalMonthly) * 100;
    const maxFeasible = Math.floor(effectiveBudget / emc.emcMonthly);

    // Verdict
    let verdict;
    if (bufferPct >= 10) verdict = 'FEASIBLE';
    else if (bufferPct >= 0) verdict = 'TIGHT';
    else verdict = 'INFEASIBLE';

    // Hiring pressure
    const ictGrads = city.ictGrads || 1;
    const hiringPressure = (effectiveTeamSize / ictGrads) * 100;

    // Savings vs Lisbon
    const savingsAnnual = (lisbonEMC.emcAnnual - emc.emcAnnual) * effectiveTeamSize;

    return {
      id: city.id,
      name: city.name,
      featured: city.featured,
      salaryIndex: city.salaryIndex,
      ictGrads,
      stemGrads: city.stemGrads || 0,
      regionalPool: city.regionalPool || 0,
      tags: city.tags || [],
      majorCompanies: city.majorCompanies || [],

      // Financial
      grossMonthly: emc.grossMonthly,
      emcMonthly: emc.emcMonthly,
      emcAnnual: emc.emcAnnual,
      teamTotalMonthly,
      teamTotalAnnual,
      bufferPct: Math.round(bufferPct * 10) / 10,
      maxFeasible,
      verdict,
      savingsAnnual,

      // Talent
      hiringPressure: Math.round(hiringPressure * 10) / 10,
    };
  });

  // ── Mode determination (critique #4 — single authoritative block) ──────
  const anyFeasible = cityResults.some(c => c.maxFeasible >= effectiveTeamSize);
  const mode = anyFeasible ? 'MODE_A' : 'MODE_B';

  // ── Scoring ────────────────────────────────────────────────────────────
  const industryLower = (industry || '').toLowerCase();
  const isLargeTeam = headcount >= 50;

  // Weight split
  const weights = isLargeTeam
    ? { strategic: 0.30, financial: 0.35, talent: 0.35 }
    : { strategic: 0.25, financial: 0.40, talent: 0.35 };

  const scoredCities = cityResults.map(city => {
    // Strategic base
    const tier = CITY_TIERS[city.id] || 4;
    let strategicBase = TIER_BASE_SCORES[tier] || 5;

    // Domain fit (+1)
    const domainFit = getDomainFit(city.id, industryLower) ? 1 : 0;

    // Strategic score (no airport penalty, no caps — moved to advisory per critique #12)
    const strategicScore = Math.min(strategicBase + domainFit, 10);

    // Financial score
    const financialScore = mode === 'MODE_A'
      ? getFinancialScoreModeA(city.bufferPct)
      : getFinancialScoreModeB(city.maxFeasible / effectiveTeamSize);

    // Talent score
    const talentScore = getTalentScore(city.hiringPressure);

    // Weighted score
    const weighted = Math.round(
      ((strategicScore * weights.strategic) +
       (financialScore * weights.financial) +
       (talentScore * weights.talent)) * 100
    ) / 100;

    return {
      ...city,
      tier,
      strategicBase,
      domainFit,
      strategicScore,
      financialScore,
      talentScore,
      weighted,
    };
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

  // Top 5
  const top5 = scoredCities.slice(0, 5);

  // ── Confidence flags (critique #7 — flag, don't recalculate) ──────────
  const riskFlags = [];

  top5.forEach(city => {
    // Savings cross-check
    const expectedSavingsPerHead = (lisbonEMC.emcAnnual - city.emcAnnual);
    const actualSavingsPerHead = city.savingsAnnual / effectiveTeamSize;
    if (Math.abs(expectedSavingsPerHead - actualSavingsPerHead) > 500) {
      riskFlags.push({ city: city.id, flag: 'savings_mismatch', confidence: 'LOW' });
    }

    // Dealbreaker-level hiring pressure
    if (city.hiringPressure >= 20) {
      riskFlags.push({ city: city.id, flag: 'high_hiring_pressure', note: `${city.hiringPressure}% of ICT pool` });
    }

    // Infeasible in top 5
    if (city.verdict === 'INFEASIBLE') {
      riskFlags.push({ city: city.id, flag: 'infeasible_in_top5' });
    }
  });

  // ── Assemble results ──────────────────────────────────────────────────
  return {
    version: '5.0',
    mode,
    budgetAssumed,
    effectiveBudget,
    lisbonBaseline: {
      grossMonthly: lisbonEMC.grossMonthly,
      emcMonthly: lisbonEMC.emcMonthly,
      emcAnnual: lisbonEMC.emcAnnual,
      teamAnnual: lisbonEMC.emcAnnual * effectiveTeamSize,
    },
    weights,
    teamSize: effectiveTeamSize,
    roleLabel: currentBand.label,
    roleMidpoint: currentBand.mid,
    tierMultiplier,
    stackPremium,
    allCities: scoredCities,
    top5,
    riskFlags,
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
 * Format the pre-computed results as a markdown table for prompt injection.
 * @param {Object} results — from computeAnalysis()
 * @returns {string} Markdown table
 */
export function formatResultsTable(results) {
  const header = '| Rank | City | salaryIdx | EMC/mo | EMC/yr | Team/yr | Buffer% | MaxFeas | FinScore | TalentSc | StratSc | Weighted | Verdict |';
  const sep = '|------|------|-----------|--------|--------|---------|---------|---------|----------|----------|---------|----------|---------|';

  const rows = results.top5.map(c =>
    `| ${c.rank} | ${c.name} | ${c.salaryIndex} | €${c.emcMonthly.toLocaleString()} | €${c.emcAnnual.toLocaleString()} | €${c.teamTotalAnnual.toLocaleString()} | ${c.bufferPct}% | ${c.maxFeasible} | ${c.financialScore} | ${c.talentScore} | ${c.strategicScore} | ${c.weighted} | ${c.verdict} |`
  );

  return [header, sep, ...rows].join('\n');
}

/**
 * Format savings comparison table.
 * @param {Object} results — from computeAnalysis()
 * @returns {string} Markdown table
 */
export function formatSavingsTable(results) {
  const header = '| City | EMC/yr | Savings vs Lisbon/yr | Savings per Head/yr |';
  const sep = '|------|--------|----------------------|---------------------|';

  const rows = results.top5.map(c => {
    const perHead = Math.round(c.savingsAnnual / results.teamSize);
    return `| ${c.name} | €${c.emcAnnual.toLocaleString()} | €${c.savingsAnnual.toLocaleString()} | €${perHead.toLocaleString()} |`;
  });

  return [header, sep, ...rows].join('\n');
}

/**
 * Format the all-cities scoring table (full 20 cities).
 * @param {Object} results — from computeAnalysis()
 * @returns {string} Markdown table
 */
export function formatAllCitiesTable(results) {
  const header = '| # | City | Idx | EMC/mo | Buffer% | Fin | Talent | Strat | Weighted | Verdict |';
  const sep = '|---|------|-----|--------|---------|-----|--------|-------|----------|---------|';

  const rows = results.allCities.map(c =>
    `| ${c.rank} | ${c.name} | ${c.salaryIndex} | €${c.emcMonthly.toLocaleString()} | ${c.bufferPct}% | ${c.financialScore} | ${c.talentScore} | ${c.strategicScore} | ${c.weighted} | ${c.verdict} |`
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
  results.top5.forEach(c => {
    scores[c.id] = {
      weighted: c.weighted,
      financial_score: c.financialScore,
      talent_score: c.talentScore,
      strategic_score: c.strategicScore,
      buffer_pct: c.bufferPct,
      emc_monthly: c.emcMonthly,
      emc_annual: c.emcAnnual,
      team_cost_monthly: c.teamTotalMonthly,
      team_cost_annual: c.teamTotalAnnual,
      savings_vs_lisbon_annual: c.savingsAnnual,
    };
  });

  return JSON.stringify({
    version: results.version,
    mode: results.mode,
    budget_assumed: results.budgetAssumed,
    effective_budget_monthly: results.effectiveBudget,
    team_size: results.teamSize,
    role: results.roleLabel,
    lisbon_baseline_emc_annual: results.lisbonBaseline.emcAnnual,
    lisbon_team_annual: results.lisbonBaseline.teamAnnual,
    top_5: results.top5.map(c => c.id),
    scores,
    risk_flags: results.riskFlags,
    // LLM fills these:
    advisor_picks: '«LLM: select 2-3 from top_5, add strategy/best_if/lifestyle_tag»',
    passed_over: '«LLM: list cities not picked with reason»',
    advisor_override: null,
  }, null, 2);
}
