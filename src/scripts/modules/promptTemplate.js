/**
 * PROMPT TEMPLATE — Experimental v3
 *
 * Three-phase prompt: Data → Advisory → Output.
 * All financial math is pre-computed by simulatorEngine.js.
 * The LLM performs ZERO arithmetic — only reasoning & narrative.
 *
 * Architecture: LLM → reasoning & narrative
 *               simulatorEngine.js → all financial computation
 *               LLM consumes computed outputs
 */

import { formatAllCitiesTable, buildJSONSummary } from './simulatorEngine.js';

/**
 * Build the Experimental v3 prompt from pre-computed results + city data.
 * @param {Object} ctx
 * @param {Object} ctx.inputs — Form input values
 * @param {Object} ctx.computed — Pre-computed results from simulatorEngine
 * @param {Array}  ctx.cityData — Slim city array (MASTER.json fields)
 * @param {string} ctx.todayDate — ISO date string
 * @returns {string} Complete prompt text
 */
export function buildPromptTemplate(ctx) {
  const { inputs, computed, cityData, todayDate } = ctx;

  // Pre-format computed tables
  const allCitiesTable = formatAllCitiesTable(computed);
  const jsonSummary = buildJSONSummary(computed);

  // Team size magnitude label
  const ts = computed.teamSize;
  const magnitude = ts <= 5 ? 'MICRO' : ts <= 15 ? 'SMALL' : ts <= 50 ? 'MEDIUM' : 'LARGE';
  const outputStyle = (inputs.outputStyle || 'detailed').toLowerCase() === 'executive' ? 'executive' : 'detailed';
  const outputWordTarget = outputStyle === 'executive' ? '<1,300 words (excluding JSON)' : '<2,200 words (excluding JSON)';

  return `
PORTUGAL NEARSHORING ADVISOR — Experimental v3
═════════════════════════════════

You are a Senior Nearshoring Advisor (15+ years placing teams in Portugal).
All financial data below is PRE-COMPUTED and VERIFIED. Do NOT recalculate any numbers.
Your job: strategic reasoning, narrative analysis, and actionable recommendations.

RULES:
• ONE-PASS: Analyze once. No re-runs, no "on re-evaluation" blocks.
• Do NOT alter scores, recalculate salary, recalculate EMC, or change rankings.
• Do NOT invent numbers. Every financial figure comes from the tables below.
• If a number looks wrong → flag confidence=LOW. Do NOT attempt to fix it.
• Use prompt data as primary source. External context is optional and must be clearly prefixed as [External context].
• Never introduce external numeric values that conflict with or replace prompt-provided figures.
• Double-check every referenced city metric against the CITY REFERENCE DATABASE JSON before finalizing.
• For cities discussed in recommendations, explicitly validate salaryIndex, stemGrads, ictGrads, and rent ranges from JSON.
• Tables first, prose second. Target ${outputWordTarget}.
• Section formatting is strict: where template says "table only", output only markdown table rows for that section.
• Section 3 deep-dives must cover 2 or 3 cities only (not more).
• Output sections in order: 1 → 2 → 3 → 4 → 5 → 6 → 7.

COMPLIANCE GATE (run silently before final answer):
1) Sections 1–7 exist, in order, exactly once.
2) Section 2 is table-only (no prose before/after table).
2a) Section 2 includes a mandatory "DataCheck" row for all five cities in format: "salaryIdx/stemGrads/ictGrads/officeRent(min-max)".
3) Section 3 includes 2–3 deep-dives, max 120 words each.
4) Section 5 contains exactly two tables (Risk table + Phase table).
5) Section 6 JSON is valid and all numeric values remain unchanged.
6) If final Top 5 departs from strict weighted order due to qualitative fit, advisor_override is required.
7) Any city mentioned in recommendations uses salaryIndex/stemGrads/ictGrads/rent values consistent with CITY REFERENCE DATABASE.
If any check fails, self-correct once before returning final output.

═══════════════════════════════════════════════════════════════════════════════
PHASE A — PRE-COMPUTED RESULTS (READ ONLY — DO NOT MODIFY)
═══════════════════════════════════════════════════════════════════════════════

MODE: ${computed.mode}${computed.budgetAssumed ? ' (Budget assumed: Lisbon baseline × 1.10 — no budget provided)' : ''}
Role: ${computed.roleLabel} | Midpoint: €${computed.roleMidpoint}/mo | Tier: ×${computed.tierMultiplier} | Stack: +${Math.round(computed.stackPremium * 100)}%
Team: ${computed.teamSize} (${magnitude}) | Budget: €${computed.effectiveBudget.toLocaleString()}/mo
Weights: Strategic ${Math.round(computed.weights.strategic * 100)}% | Financial ${Math.round(computed.weights.financial * 100)}% | Talent ${Math.round(computed.weights.talent * 100)}%

LISBON BASELINE:
EMC monthly: €${computed.lisbonBaseline.emcMonthly.toLocaleString()} | Annual: €${computed.lisbonBaseline.emcAnnual.toLocaleString()} | Team annual: €${computed.lisbonBaseline.teamAnnual.toLocaleString()}

FULL 20-CITY RANKING:
${allCitiesTable}

${computed.riskFlags.length > 0 ? `RISK FLAGS:\n${computed.riskFlags.map(f => `⚠️ ${f.city}: ${f.flag}${f.note ? ' — ' + f.note : ''}${f.confidence ? ' [confidence=' + f.confidence + ']' : ''}`).join('\n')}` : 'No risk flags.'}

Salary note: Portugal pays 14× yearly (12 regular + 2 subsidies). All figures above use 12× format for international comparison. EMC includes 23.75% employer SS + €175/mo meal allowance.

─────────────────────────────────────────────────────────────────────────────
CITY REFERENCE DATABASE (${cityData.length} cities)
─────────────────────────────────────────────────────────────────────────────

\`\`\`json
${JSON.stringify(cityData)}
\`\`\`

FIELD KEY: stemGrads=Digital STEM+ pool | ictGrads=Core ICT subset | salaryIndex=vs Lisbon(100) | colIndex=CoL excl. rent (NYC=100) | officeRent=€/m²/mo | residentialRent=€/mo T1
ADJACENT METRO: Setúbal taps Lisbon pool (45min), Guimarães taps Porto pool (40min)

═══════════════════════════════════════════════════════════════════════════════
PHASE B — CLIENT REQUEST + ADVISORY TASK
═══════════════════════════════════════════════════════════════════════════════

CLIENT REQUEST:
Mission: ${inputs.purpose || 'Build nearshore team in Portugal'}
Industry: ${inputs.companyFocus || 'General Technology'} | HQ Timezone: ${inputs.timezone || 'CET'}
Team: ${inputs.teamSize || '5-10'} people | Role: ${computed.roleLabel}
Timeline: ${inputs.timeline || '6-12 months'} | Growth: ${inputs.scaling || 'stable'}
Tech Stack: ${inputs.searchedStack || 'Not specified'}
Budget: OpEx €${inputs.opexBudget || 'unspecified'}/mo | CapEx €${inputs.capexBudget || 'unspecified'}
Work Model: ${inputs.workModel || 'hybrid'} | Office: ${inputs.officeQuality || 'standard'} | Strategy: ${inputs.officeStrategy || 'no-preference'}
Hiring: ${inputs.hiringStrategy || 'balanced-practical'}
Entity: ${inputs.entity || 'undecided'}
Lifestyle: ${inputs.lifestyle || 'any'}
Dealbreakers: ${inputs.dealbreakers || 'None stated'}
Primary objective: ${(inputs.primaryObjective || 'balanced').toUpperCase()}

YOUR TASK AS ADVISOR:
1. Review the full 20-city ranking and risk flags in context of the client request above.
2. Consider: work model, lifestyle keywords, domain fit, team size, scaling plans, and dealbreaker penalties.
3. Produce a final ranked **Top 5 recommendations** after considering all 20 cities. If your final Top 5 departs from strict weighted order, you MUST explain why.
4. Provide deep-dives for the best 2–3 cities from your final Top 5. Do NOT change any numeric score or financial figure.

STRATEGY LABELS (use in deep-dives):
A: TIER 1 HUB (Lisbon, Porto) → Fast ramp, deep pool, cost creep risk
B: REGIONAL ARBITRAGE (Braga, Aveiro, Guimarães, Leiria) → University pipeline, lower turnover
C: SPECIALIST CLUSTER (Coimbra Bio, Aveiro Telecom, Évora Aero) → Niche domain quality
D: LIFESTYLE HUB (Faro, Setúbal, Évora) → Remote-first retention, teams ≤15
E: SATELLITE (Covilhã, Vila Real, Bragança) → Very high loyalty, isolation risk

HIRING LANGUAGE (match to team size magnitude = ${magnitude}):
${ magnitude === 'MICRO' ? 'Post on local boards, network with universities, hire through referrals.'
 : magnitude === 'SMALL' ? 'Partner with 1-2 universities, attend career fairs, build professor relationships.'
 : magnitude === 'MEDIUM' ? 'Establish internship programs, campus ambassador network, talent pipeline strategy.'
 : 'Dedicated recruiting team, hackathon sponsorships, bootcamp partnerships, talent academies.'}

═══════════════════════════════════════════════════════════════════════════════
PHASE C — OUTPUT TEMPLATE (Sections 1–7)
═══════════════════════════════════════════════════════════════════════════════

## 1. ASSUMPTIONS & PRE-FLIGHT
State: MODE, role, seniority, stack, budget (note if assumed), team size.
Then confirm all-city deterministic ranking is the only ranking input (no precomputed candidate Top 5 provided).

## 2. ALL-CITY REVIEW + FINAL TOP 5
| Factor | City 1 | City 2 | City 3 | City 4 | City 5 |
Include your final Top 5 after considering all 20 cities. Use rows for: Weighted, Financial, Talent, Strategic, EMC, verdict, hiring pressure, dealbreaker penalty.
Add one mandatory row named **DataCheck** with per-city values in this exact compact format:
"salaryIdx=<n>; stem=<n>; ict=<n>; officeRent=<min>-<max>€/m²"
Table only — no prose.

## 3. ADVISORY COMMENTARY + DEEP-DIVES (2–3 picks)

State which cities you're recommending and why, considering the client context.
Then for each pick:

### 🏙️ [CITY NAME] — Strategy [A/B/C/D/E]
**The Numbers:** Weighted [X.XX] | [VERDICT] | Buffer [X]% | Max team [N]
**Why It Works:** [2–3 sentences, specific to this client's needs]
**How to Execute:** [Concrete hiring approach matching ${magnitude} magnitude]
**Watch Out For:** [1–2 specific risks]
**Best For:** [One sentence]

Max 120 words per city deep-dive.
Do not include deep-dives for cities beyond the selected 2–3 picks.

## 4. DECISION FRAMEWORK
| If Your Priority Is... | Consider | Because |
3–5 rows only.

## 5. RISKS + IMPLEMENTATION
| Risk | Impact | Mitigation |
3–5 risks, table only.

| Phase | Timeframe | Actions |
3–4 phases, table only.

## 6. JSON SUMMARY
The JSON below has all financial values pre-filled. You MUST:
- Fill "advisor_picks" with your final ranked Top 5 recommendations (add strategy, best_if, lifestyle_tag)
- Fill "passed_over" with notable cities not included in final Top 5 (add reason)
- Set advisor_override to your reasoning if your final Top 5 departs from raw weighted ordering after your all-city qualitative assessment
- Do NOT modify any numerical values — they are authoritative
- Return valid JSON syntax (double quotes, no trailing commas)

\`\`\`json
${jsonSummary}
\`\`\`

## 7. ADVISOR DIALOGUE

💬 **Let's Talk**

**Questions for You:**
1. [ONE question about their actual priority — cost vs speed vs lifestyle]
2. [ONE question about team culture or work style]
3. [ONE question that would change the recommendation if answered differently]

**I Can Also Help With:**
| If you want... | Just ask |
|----------------|----------|
| 💰 Budget breakdown | "Break down the full budget for [City]" |
| 🏢 Office estimate | "Office setup cost in [City]?" |
| 📅 Timeline | "90-day launch plan" |
| ⚖️ Legal contacts | "Entity setup help?" |
| 🌍 Comparison | "How does this compare to [Spain/Poland]?" |

**Confidence:** [HIGH / MEDIUM / LOW] — [one sentence on what drives this]

*${todayDate} | ${(inputs.primaryObjective || 'balanced').toUpperCase()} | ${computed.roleLabel} | Experimental v3*

Begin analysis. Output sections 1–7 in order.
`;
}

