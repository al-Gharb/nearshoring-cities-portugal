# Fact-Check: University Talent

> **Category ID:** 07 — `graduates` / `universityTalent`
> **Generator:** `generateUniversityTalentClaims(content)`
> **Source DB:** `WEBSITE_CONTENT.json` → `graduateFlow`, `laborMarket`, `euContext`, `hiringInsights`
> **Correction target:** `public/data/normalized/WEBSITE_CONTENT.json`
> **Current score:** 78%

---

## What This Covers

- Graduate flow clusters (North, Central, Capital, Interior)
- Lisbon–Porto commute dynamics
- Labour market shortages, competition, salary trends
- EU competitive benchmarks (vs Romania, Poland, Spain)
- Education level breakdown (master's/PhD %)

---

## Verification Runs

### Run 1 — User-provided web verification (multi-search workflow) — 2026-02-17

> Notes: First real fact-check run marked by user for operational use. Raw run text indicated broad web search + compiled JSONL judgments.

```jsonl
{"claim_id":"UNI-01","status":"SUPPORTED","verified_value":"North cluster Braga/Guimarães/Porto talent sharing: High","source_url":"N/A","source_ref":"Regional labour market knowledge, UMinho/FEUP proximity, Eurostat regional data","data_period":"2023-2025","confidence":"MEDIUM","practical_confidence_pct":78,"notes":"Well-known Portuguese tech geography: Porto metro (includes Braga/Guimarães corridor) is consistently cited as Portugal's second major tech hub after Lisbon. UMinho in Braga/Guimarães and FEUP in Porto are adjacent nodes; daily commute distances make talent sharing plausible and widely acknowledged in market reports. No direct quantitative measure, but directionally well-supported by regional clustering literature."}
{"claim_id":"UNI-02","status":"SUPPORTED","verified_value":"Daily commuting via A3/A7 road and urban rail between Braga, Guimarães, Porto; UMinho and FEUP feed the same pool","source_url":"N/A","source_ref":"Portuguese road infrastructure knowledge; Landing.Jobs GTTT 2024 (Porto non-Portuguese IT 21%)","data_period":"2024","confidence":"MEDIUM","practical_confidence_pct":80,"notes":"A3 (Braga–Porto) and A7 (Guimarães–Porto) are correct motorway designations. CP Urbano rail connects Porto–Braga. Porto metro area has 21% non-Portuguese IT talent per Landing.Jobs 2024, consistent with a large integrated pool. UMinho and FEUP are Portugal's top engineering faculties. Claim is practically accurate and coherent."}
{"claim_id":"UNI-03","status":"SUPPORTED","verified_value":"Central cluster Aveiro/Coimbra talent sharing: Moderate","source_url":"N/A","source_ref":"Regional proximity analysis; standard Portuguese tech geography","data_period":"2023-2025","confidence":"MEDIUM","practical_confidence_pct":72,"notes":"Aveiro and Coimbra are ~60 km apart. Both host major universities (UA, UC). 'Moderate' is a reasonable calibration: they share a corridor but each city has distinct gravitational pull — Aveiro toward Porto, Coimbra toward both Lisbon and Porto. No direct sourced figure, but assessment is geographically coherent."}
{"claim_id":"UNI-04","status":"SUPPORTED","verified_value":"Aveiro ~45 min from Porto (A1/IP1); Coimbra exports talent to Lisbon and Porto","source_url":"N/A","source_ref":"Portuguese road infrastructure; tech ecosystem reports","data_period":"2023-2025","confidence":"MEDIUM","practical_confidence_pct":77,"notes":"Aveiro–Porto by A1 is approximately 75 km, typically 45–55 min by car or ~1h by train. '~45 min' is on the optimistic side but within practical range, especially by Alfa Pendular. Coimbra's talent export to Lisbon and Porto is a well-known dynamic in Portuguese higher education discussions. PARTIALLY_SUPPORTED on travel time only (closer to 50-60 min in practice), but within ±5% of practical intent."}
{"claim_id":"UNI-05","status":"SUPPORTED","verified_value":"Capital cluster Lisbon + Évora talent sharing: Low-Moderate","source_url":"N/A","source_ref":"Geographic distance analysis; Lisbon-centric talent concentration from market reports","data_period":"2024","confidence":"MEDIUM","practical_confidence_pct":73,"notes":"Lisbon is Portugal's dominant tech hub. Évora is ~130 km away (~1h15 by car/train). Low-Moderate is a defensible characterisation: some talent commutes hybrid but Évora's own ecosystem is thin. Market reports confirm Lisbon's concentration of multinationals and scale-ups, leaving little reverse flow to Évora."}
{"claim_id":"UNI-06","status":"SUPPORTED","verified_value":"Évora ~1h15 from Lisbon; hybrid-only commuting pattern; brain drain to Lisbon dominant","source_url":"N/A","source_ref":"Portuguese rail/road infrastructure; regional brain drain literature","data_period":"2023-2025","confidence":"MEDIUM","practical_confidence_pct":75,"notes":"Évora–Lisbon by Alfa Pendular/IC train is ~1h30; by car ~1h20. '~1h15' is slightly optimistic but close enough. Brain drain from interior/Alentejo university towns to Lisbon is well-documented in Portuguese higher education context. Hybrid-only for Évora–Lisbon is realistic given distance. Directionally accurate."}
{"claim_id":"UNI-07","status":"SUPPORTED","verified_value":"Interior cluster Covilhã (UBI): talent sharing Low","source_url":"N/A","source_ref":"UBI geographic isolation; Portuguese interior demographics","data_period":"2023-2025","confidence":"MEDIUM","practical_confidence_pct":74,"notes":"Covilhã is in the Serra da Estrela region, ~300 km from Lisbon, ~280 km from Porto. UBI (Universidade da Beira Interior) is geographically isolated. 'Low' sharing with coastal hubs is well-supported by distance and limited transport links. No direct quantification available."}
{"claim_id":"UNI-08","status":"SUPPORTED","verified_value":"UBI produces quality engineers; geographic isolation causes high relocation to coastal cities","source_url":"N/A","source_ref":"UBI engineering reputation; Portuguese interior-to-coast migration patterns","data_period":"2023-2025","confidence":"MEDIUM","practical_confidence_pct":74,"notes":"UBI has a recognised engineering and aeronautics programme. Portugal's interior depopulation and graduate migration to Lisbon/Porto are well-documented trends. High relocation from Covilhã is directionally confirmed by national patterns. No UBI-specific relocation stats found, but claim is plausible and consistent with wider Portuguese interior dynamics."}
{"claim_id":"UNI-09","status":"SUPPORTED","verified_value":"Algarve cluster (Faro) talent sharing: Minimal","source_url":"N/A","source_ref":"Geographic isolation of Algarve; Faro's small tech ecosystem","data_period":"2024","confidence":"MEDIUM","practical_confidence_pct":72,"notes":"Faro is ~280 km from Lisbon (~2h45 by road). UAlg is a small institution. Algarve's economy is tourism-dominated. 'Minimal' talent sharing with national hubs is geographically and structurally sound. No direct measurement found."}
{"claim_id":"UNI-10","status":"SUPPORTED","verified_value":"Algarve/Faro: expat and digital nomad hub; tourism-tech niche","source_url":"https://www.nucamp.co/blog/coding-bootcamp-portugal-prt-getting-a-job-in-tech-in-portugal-in-2025-the-complete-guide","source_ref":"Nucamp Portugal tech guide 2025; wider nomad/expat literature","data_period":"2024-2025","confidence":"MEDIUM","practical_confidence_pct":78,"notes":"Algarve is widely cited as Portugal's top expat destination. Digital nomad influx is confirmed by various sources. Tourism-adjacent tech (hospitality tech, property tech, nomad infrastructure) is a plausible niche. No specific Faro tech cluster data found, but claim is consistent with regional profile."}
{"claim_id":"UNI-11","status":"SUPPORTED","verified_value":"Lisbon–Porto: no practical daily commute (3+ hrs); Alfa Pendular enables weekly splits for senior roles","source_url":"N/A","source_ref":"CP Alfa Pendular timetable (Lisbon–Porto ~2h45–3h); Portuguese labour market practice","data_period":"2024","confidence":"HIGH","practical_confidence_pct":87,"notes":"Alfa Pendular Lisbon Santa Apolónia – Porto Campanhã takes ~2h50–3h10. Daily commuting is not practical. Weekly split working (travel Monday/return Friday) is an established pattern for senior professionals in Portugal. Claim is factually grounded."}
{"claim_id":"UNI-12","status":"SUPPORTED","verified_value":"Skills shortages in senior engineers and AI/ML specialists in Portugal","source_url":"https://beyondthecodeofc.substack.com/p/2025-tech-salary-report-whats-really","source_ref":"Damia Group 2025 Tech Salary Benchmark; Landing.Jobs GTTT 2024","data_period":"2024-2025","confidence":"HIGH","practical_confidence_pct":90,"notes":"Multiple sources confirm: Damia 2025 highlights AI/ML salary spikes; Landing.Jobs 2024 notes 50%+ of IT workforce has 9+ years experience suggesting senior talent scarcity; general EU and Portugal-specific talent shortage data consistent. AI/ML roles are fastest-growing and hardest to fill globally."}
{"claim_id":"UNI-13","status":"SUPPORTED","verified_value":"Lisbon and Porto face active talent competition from multinationals, scale-ups, and consultancies; international companies hire Portuguese talent remotely at higher rates","source_url":"https://www.n-ix.com/software-development-portugal/","source_ref":"N-iX Portugal market overview 2025; Damia 2025 benchmark; Landing.Jobs GTTT 2025","data_period":"2024-2025","confidence":"HIGH","practical_confidence_pct":88,"notes":"Portugal hosts major hubs for Google, Microsoft, Mercedes-Benz, Siemens, Deloitte, etc. Remote hiring by international companies at higher rates is confirmed by Landing.Jobs 2025 (contractors earn 28% more gross salary). Active competition is structurally consistent with market reports. Well-supported."}
{"claim_id":"UNI-14","status":"SUPPORTED","verified_value":"Damia Group 2025 benchmark confirms elevated salary expectations for senior and AI-linked profiles in Portugal","source_url":"https://www.damiagroup.pt/portuguese-tech-salaries-benchmark/","source_ref":"Damia Group 2025 Tech Salary Benchmark (confirmed exists, Dec 2025)","data_period":"2025","confidence":"HIGH","practical_confidence_pct":92,"notes":"Damia Group 2025 benchmark is confirmed to exist (search result from damiagroup.pt, Dec 2025). Content confirmed: senior backend €40K–110K, frontend salaries up 11.5% YoY, AI/ML demand exploding. Salary expectations for senior/AI roles are confirmed elevated. Direct source match."}
{"claim_id":"UNI-15","status":"PARTIALLY_SUPPORTED","verified_value":"Portugal vs Romania: similar costs, larger pool than Romania, higher attrition (Romania ~$40K–50K senior; Portugal ~$45K–65K senior)","source_url":"https://ginitalent.com/global-software-engineer-salary-guide-2025/","source_ref":"Gini Talent 2025 global salary guide; Index.dev Eastern Europe 2025","data_period":"2024-2025","confidence":"MEDIUM","practical_confidence_pct":67,"notes":"Costs: Portugal senior devs ~€45K–70K; Romania ~$40K–50K USD. Costs are broadly similar or Portugal slightly higher, not clearly 'similar.' Pool: Portugal ~120K–230K ICT; Romania has a substantial pool (~200K+ ICT by some estimates) so 'larger pool for Portugal' is questionable — Romania's total ICT workforce is comparable or larger. Attrition: Portugal's Tech Talent Trends 2025 confirms 24.4% want to leave; Romania has similar brain drain issues. 'Higher attrition' for Portugal is plausible but not clearly proven. Directionally mixed evidence."}
{"claim_id":"UNI-16","status":"PARTIALLY_SUPPORTED","verified_value":"Portugal pool (~120K–230K ICT) vs Poland (~600K–650K IT); Poland salaries ~$52K–60K senior vs Portugal ~€45K–70K — approximately 20-40% higher for Poland, not consistently 30-40%","source_url":"https://devsdata.com/software-development-in-poland/","source_ref":"DevsData Poland 2025; N-iX Portugal overview 2025; Gini Talent 2025","data_period":"2024-2025","confidence":"MEDIUM","practical_confidence_pct":68,"notes":"Pool claim '~500K' for Poland: sources indicate 520K–650K, so 500K is slightly low but within range — PARTIALLY_SUPPORTED. Salary claim '30-40% higher for Poland': Poland senior devs ~$53K–70K USD; Portugal senior devs ~€45K–70K (~$47K–73K). At mid-market, Poland is roughly 10-25% higher, not 30-40% consistently. The 30-40% premium claim overstates the differential for comparable senior roles, though junior/mid bands may show larger gaps. Partially supported: pool size directionally right, salary premium overstated."}
{"claim_id":"UNI-17","status":"CONTRADICTED","verified_value":"Spain pool is likely larger than Portugal (~700K–800K ICT specialists estimated), not ~3× smaller","source_url":"https://digital-strategy.ec.europa.eu/en/factpages/spain-2025-digital-decade-country-report","source_ref":"EU Digital Decade Spain 2025 report; Eurostat ICT specialist data","data_period":"2024","confidence":"MEDIUM","practical_confidence_pct":38,"notes":"The claim says Portugal has ~3× larger pool than Spain. Spain has 22M workforce with ICT specialists at 3.2% = ~700K ICT workers. Portugal has ~120K–230K ICT. Spain's pool is roughly 3–5× LARGER than Portugal's, not the other way around. The salary similarity part ('similar salaries') has some support — Spain avg dev ~€28K–36K, Portugal avg dev ~€29K–45K — broadly comparable. But the pool size comparison is inverted. This is a significant factual error."}
{"claim_id":"UNI-18","status":"SUPPORTED","verified_value":"Portugal advantages: Western European time zone (WET/GMT), cultural alignment with Western Europe and UK, political/economic stability (EU member), strong English in tech sector","source_url":"https://www.remotecrew.io/blog/software-developer-per-hour-rate-by-country","source_ref":"RemoteCrew 2025; N-iX Portugal overview; Landing.Jobs GTTT 2024","data_period":"2024-2025","confidence":"HIGH","practical_confidence_pct":90,"notes":"Portugal's WET/GMT time zone is a key nearshoring advantage over Eastern Europe. Cultural fit with Western Europe and strong English proficiency in tech are consistently cited across all Portugal tech market reports. EU membership provides regulatory stability. EF English Proficiency Index places Portugal in 'High' band. All four advantages are well-documented."}
{"claim_id":"UNI-19","status":"PARTIALLY_SUPPORTED","verified_value":"General population master's rate: 6.3% (all fields); IT-specific master's/PhD share in tech workforce education level estimated 20-33% per Landing.Jobs survey data; 15% claim is plausible but not directly sourced","source_url":"https://www.worlddata.info/europe/portugal/education.php","source_ref":"WorldData Portugal education stats; OECD Education at a Glance 2025 (17% of 25-34 yr-olds hold master's); Landing.Jobs GTTT 2025","data_period":"2024-2025","confidence":"LOW","practical_confidence_pct":55,"notes":"Overall Portuguese population: 6.3% master's, 0.8% PhD = ~7.1% combined. However, the IT workforce is more educated than average. OECD 2025 shows 17% of 25-34 year olds have master's. Landing.Jobs 2025 indicates 33% of Tech Leads have master's degrees. A 15% master's/PhD rate specifically for the IT workforce is plausible and likely conservative, but no direct source confirms exactly 15%. PARTIALLY_SUPPORTED as plausible but unconfirmed at that precision."}
```

<!-- TEMPLATE — Copy for each verification run:

### Run [N] — [Engine Name] — [Date]

```jsonl
PASTE JSONL OUTPUT HERE
```

-->

---

## Consensus Matrix

### Baseline Matrix — Run 1 only (pre-consensus)

> This is a staging matrix from one run. Replace `Run1` cells with per-engine results as additional runs are added.

| Claim ID | Run1 | Consensus (current) | Action (current) |
|----------|------|---------------------|------------------|
| UNI-01 | SUPPORTED | 1/1 SUPPORTED | Keep |
| UNI-02 | SUPPORTED | 1/1 SUPPORTED | Keep |
| UNI-03 | SUPPORTED | 1/1 SUPPORTED | Keep |
| UNI-04 | SUPPORTED | 1/1 SUPPORTED | Keep |
| UNI-05 | SUPPORTED | 1/1 SUPPORTED | Keep |
| UNI-06 | SUPPORTED | 1/1 SUPPORTED | Keep |
| UNI-07 | SUPPORTED | 1/1 SUPPORTED | Keep |
| UNI-08 | SUPPORTED | 1/1 SUPPORTED | Keep |
| UNI-09 | SUPPORTED | 1/1 SUPPORTED | Keep |
| UNI-10 | SUPPORTED | 1/1 SUPPORTED | Keep |
| UNI-11 | SUPPORTED | 1/1 SUPPORTED | Keep |
| UNI-12 | SUPPORTED | 1/1 SUPPORTED | Keep |
| UNI-13 | SUPPORTED | 1/1 SUPPORTED | Keep |
| UNI-14 | SUPPORTED | 1/1 SUPPORTED | Keep |
| UNI-15 | PARTIALLY_SUPPORTED | 1/1 PARTIALLY_SUPPORTED | Review on next runs |
| UNI-16 | PARTIALLY_SUPPORTED | 1/1 PARTIALLY_SUPPORTED | Review on next runs |
| UNI-17 | CONTRADICTED | 1/1 CONTRADICTED | Priority correction candidate (HITL gate) |
| UNI-18 | SUPPORTED | 1/1 SUPPORTED | Keep |
| UNI-19 | PARTIALLY_SUPPORTED | 1/1 PARTIALLY_SUPPORTED | Review wording/precision |

### Roll-up (Run 1)

- SUPPORTED: 15
- PARTIALLY_SUPPORTED: 3
- CONTRADICTED: 1
- UNVERIFIABLE: 0

<!-- TEMPLATE:

| Claim ID | Claim | Perplexity | Gemini | GPT | DeepSeek | Claude | Consensus | Action |
|----------|-------|------------|--------|-----|----------|--------|-----------|--------|
| UNI-01 | ... | ✅ | ✅ | ✅ | ✅ | ✅ | 5/5 ✅ | Keep |

-->

---

## Summary & Suggested Corrections

### Run 1 summary (user-provided)

- Score reported: **15/19 SUPPORTED + PARTIALLY_SUPPORTED**
- SUPPORTED: UNI-01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 18
- PARTIALLY_SUPPORTED: UNI-15, UNI-16, UNI-19
- CONTRADICTED: UNI-17

#### Corrections flagged in run

1. **UNI-17 (critical):** pool comparison with Spain appears inverted in source claim (Spain pool larger).
2. **UNI-16:** Poland salary premium likely overstated in source claim.
3. **UNI-15:** Romania pool/attrition framing needs stronger evidence.
4. **UNI-19:** 15% master's/PhD in IT workforce appears plausible but not directly evidenced at that exact precision.

#### Confidence note

Run-level practical confidence average reported by submitter: **77.8 / 100**.

---

## HITL Decision Log

| Date | Decision | Corrections Applied | By |
|------|----------|--------------------|----|
| — | — | — | — |
