# Fact-Check: Workforce Talent

> **Category ID:** 05 — `workforce`
> **Generator:** `generateWorkforceClaims(content, compensation)`
> **Source DBs:** `WEBSITE_CONTENT.json` + `COMPENSATION_DATA.json`
> **Correction targets:**
> - `public/data/normalized/WEBSITE_CONTENT.json` (ICT employment, EU rank, city split, EURES-backed hiring indicators)
> - `public/data/normalized/COMPENSATION_DATA.json` (salary bands, tech premiums, employer costs)
> **Current score:** 75% (↓ from 85%)

---

## What This Covers

- ICT employment numbers, Eurostat total workforce, EU27 rank, annual CAGR trend
- City workforce breakdown (official split model)
- Hiring indicators sourced from EURES + linked Eurostat tables
- Labor market: median tenure, salary trends
- **IT salary ranges** by role (10 roles × 4 seniority levels)
- **Tech stack premiums** (8 stacks, 0% to +40%)
- **Employer costs** (SS 23.75%, meal allowance, 14× salaries)
- **INE regional earnings** (7 NUTS II regions × 4 education levels)

---

## Verification Runs

### Run 1 — DeepSeek R1 — 2026-02-08

```jsonl
{"claim_id":"WRK-01","status":"SUPPORTED","verified_value":"5.2%","source":"Digital Decade report 2025 via EU Digital Skills and Jobs Platform","notes":"The claimed value of 5.1% is within the ±5% tolerance of the official 2025 figure of 5.2%."}
{"claim_id":"WRK-02","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source found to verify the total tech workforce estimate of ~250,000 from Eurostat."}
{"claim_id":"WRK-03","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source found to verify Legacy Workforce tech profiles (~165,000)."}
{"claim_id":"WRK-04","status":"PARTIALLY_SUPPORTED","verified_value":"67.7%","source":"Global Tech Talent Trends 2024 Portugal industry report","notes":"Report states Lisbon and Porto hold 67.7% of IT talent, significantly lower than claimed 79%."}
{"claim_id":"WRK-05","status":"SUPPORTED","verified_value":"25% (approx.)","source":"Eurostat 2024 data cited by Cedefop","notes":"'Only one in four ICT specialists is a woman' equating to ~25%. Claimed 26.9% within ±5%."}
{"claim_id":"WRK-06","status":"CONTRADICTED","verified_value":"61.7% without tertiary education","source":"Eurostat 'ICT education - a statistical overview' (2024 data)","notes":"Official data states 61.7% of employed persons with ICT education did NOT have tertiary education."}
{"claim_id":"WRK-07","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No authoritative source for Lisbon tech workers (~129,000)."}
{"claim_id":"WRK-08","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No authoritative source for Porto tech workers (~68,000)."}
{"claim_id":"WRK-09","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for Coimbra tech workers (~18,000)."}
{"claim_id":"WRK-10","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for Braga tech workers (~12,000)."}
{"claim_id":"WRK-11","status":"CONTRADICTED","verified_value":"Portugal: 5.2%, EU avg: 5.0%","source":"Digital Decade report 2025 and Eurostat 2024 data","notes":"Portugal (5.2%) is ABOVE EU average (5.0%). Claim's values (4.5% vs. 4.8%) contradicted by recent data."}
{"claim_id":"WRK-12","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for ICT graduates % or EU average."}
{"claim_id":"WRK-13","status":"SUPPORTED","verified_value":"Portugal: ~25%, EU avg: 19.5%","source":"Eurostat 2024 data","notes":"Both claimed values within ±5% tolerance."}
{"claim_id":"WRK-14","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for +12% growth trend since 2020."}
{"claim_id":"WRK-15","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for time-to-hire metrics."}
{"claim_id":"WRK-16","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for time-to-hire metrics."}
{"claim_id":"WRK-17","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for bachelor's+ percentage (78%)."}
{"claim_id":"WRK-18","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for median age (32)."}
{"claim_id":"WRK-19","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for under-35 percentage (58%)."}
{"claim_id":"WRK-20","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for Lisbon tenure (2.1y)."}
{"claim_id":"WRK-21","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for Porto tenure (2.8y)."}
{"claim_id":"WRK-22","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for secondary cities tenure (3.5+y)."}
{"claim_id":"WRK-23","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for startup tenure (18-24 months)."}
{"claim_id":"WRK-24","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No specific salary data found to verify Software Engineer ranges."}
{"claim_id":"WRK-25","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No specific salary data found for DevOps/SRE."}
{"claim_id":"WRK-26","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No specific salary data found for ML/Data Engineers."}
{"claim_id":"WRK-27","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No specific salary data found for Mobile Engineers."}
{"claim_id":"WRK-28","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No specific salary data found for Engineering Managers."}
{"claim_id":"WRK-29","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No specific salary data found for Product Managers."}
{"claim_id":"WRK-30","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No specific salary data found for QA/Testing."}
{"claim_id":"WRK-31","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No specific salary data found for Tech Support."}
{"claim_id":"WRK-32","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No specific salary data found for UX/Creative."}
{"claim_id":"WRK-33","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No specific salary data found for Admin/Back-office."}
{"claim_id":"WRK-34","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for tech stack premium percentages."}
{"claim_id":"WRK-35","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for tech stack premium percentages."}
{"claim_id":"WRK-36","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for tech stack premium percentages."}
{"claim_id":"WRK-37","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for tech stack premium percentages."}
{"claim_id":"WRK-38","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for tech stack premium percentages."}
{"claim_id":"WRK-39","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for tech stack premium percentages."}
{"claim_id":"WRK-40","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for tech stack premium percentages."}
{"claim_id":"WRK-41","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source for tech stack premium percentages."}
{"claim_id":"WRK-42","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source found for employer social security rate."}
{"claim_id":"WRK-43","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source found for meal allowance."}
{"claim_id":"WRK-44","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source found for 14 monthly salaries."}
{"claim_id":"WRK-45","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"INE press release does not contain earnings breakdown."}
{"claim_id":"WRK-46","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"INE data not available for Setúbal."}
{"claim_id":"WRK-47","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"INE data not available for Norte."}
{"claim_id":"WRK-48","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"INE data not available for Alentejo."}
{"claim_id":"WRK-49","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"INE data not available for Centro."}
{"claim_id":"WRK-50","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"INE data not available for Oeste/Tejo."}
{"claim_id":"WRK-51","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"INE data not available for Algarve."}
```

**Score: 4/51 SUPPORTED** (WRK-01, WRK-05, WRK-13) + 1 PARTIALLY_SUPPORTED (WRK-04). 2 CONTRADICTED (WRK-06, WRK-11). 44 UNVERIFIABLE.

### Run 2 — Perplexity AI — 2026-02-08

```jsonl
{"claim_id":"WRK-01","status":"UNVERIFIABLE","verified_value":null,"source":"Eurostat ICT specialists article (EU-level only)","notes":"EU data confirm 4.8% at EU-27 for 2023 but no Portugal-specific 5.1% in accessible detail."}
{"claim_id":"WRK-02","status":"UNVERIFIABLE","verified_value":null,"source":"Eurostat (no Portugal headcount)","notes":"EU-wide totals only; Portugal ~250k not directly stated."}
{"claim_id":"WRK-03","status":"UNVERIFIABLE","verified_value":null,"source":"Legacy Workforce (no consolidated count)","notes":"No authoritative figure for total Legacy Workforce tech profiles in Portugal."}
{"claim_id":"WRK-04","status":"UNVERIFIABLE","verified_value":null,"source":"OECD/Eurostat (no ICT-by-city)","notes":"No official statistic on share of ICT workers by city; 79% cannot be verified."}
{"claim_id":"WRK-05","status":"UNVERIFIABLE","verified_value":null,"source":"Eurostat (EU-wide gender shares only)","notes":"26.9% plausible but not directly available in country-level table."}
{"claim_id":"WRK-06","status":"SUPPORTED","verified_value":"67.4% (EU-wide, 2024)","source":"Eurostat 'ICT specialists in employment'","notes":"EU-wide figure 67.4% is within ±5% of 68%. Note: this is EU average, not Portugal-specific."}
{"claim_id":"WRK-07","status":"UNVERIFIABLE","verified_value":null,"source":"OECD (ICT tightness only)","notes":"No official source for absolute tech workers by city."}
{"claim_id":"WRK-08","status":"UNVERIFIABLE","verified_value":null,"source":"OECD","notes":"No official figure for Porto tech workers."}
{"claim_id":"WRK-09","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No accessible breakdown for Coimbra."}
{"claim_id":"WRK-10","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No data for Braga ICT headcount."}
{"claim_id":"WRK-11","status":"SUPPORTED","verified_value":"EU avg 4.8% (2023)","source":"Eurostat","notes":"EU average 4.8% confirmed. PT 4.5% plausible but not visible."}
{"claim_id":"WRK-12","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Cannot locate recent ICT graduates % for PT vs EU."}
{"claim_id":"WRK-13","status":"UNVERIFIABLE","verified_value":null,"source":"Eurostat (EU-wide gender data)","notes":"Country-specific 21.3% for PT not explicitly available."}
{"claim_id":"WRK-14","status":"UNVERIFIABLE","verified_value":null,"source":"Eurostat (growth 2013-2023 only)","notes":"Portugal-specific +12% since 2020 not checkable."}
{"claim_id":"WRK-15","status":"UNVERIFIABLE","verified_value":null,"source":"Industry salary survey (no explicit metric)","notes":"No quantitative time-to-hire benchmark found."}
{"claim_id":"WRK-16","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No data confirming 8-12 weeks senior hire."}
{"claim_id":"WRK-17","status":"UNVERIFIABLE","verified_value":null,"source":"Eurostat (EU-wide)","notes":"EU-wide 67.4% known, PT-specific 78% not documented."}
{"claim_id":"WRK-18","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No IT-only median age for Portugal published."}
{"claim_id":"WRK-19","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Under-35 share not directly measured by official sources."}
{"claim_id":"WRK-20","status":"UNVERIFIABLE","verified_value":null,"source":"Industry salary survey (no explicit tenure stat)","notes":"Not corroborated by official data."}
{"claim_id":"WRK-21","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Porto tenure not found."}
{"claim_id":"WRK-22","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No survey separating tenure by secondary cities."}
{"claim_id":"WRK-23","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Startup tenure plausible but not published."}
{"claim_id":"WRK-24","status":"UNVERIFIABLE","verified_value":null,"source":"Industry salary survey snapshots","notes":"Broadly aligned but cannot check to ±5% precision."}
{"claim_id":"WRK-25","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No consolidated 2024 DevOps/SRE bands visible."}
{"claim_id":"WRK-26","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Plausible but not precisely stated in accessible report."}
{"claim_id":"WRK-27","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Within plausible range but no authoritative 2024 table."}
{"claim_id":"WRK-28","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Consistent with some postings but no single citable benchmark."}
{"claim_id":"WRK-29","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Directionally reasonable but not traceable to specific study."}
{"claim_id":"WRK-30","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Plausible but no official 2024 publication."}
{"claim_id":"WRK-31","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Consistent with listings but no formal benchmark."}
{"claim_id":"WRK-32","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Realistic but not clearly documented."}
{"claim_id":"WRK-33","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"In line with adverts but not officially benchmarked."}
{"claim_id":"WRK-34","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Internal compensation framework, not externally documented."}
{"claim_id":"WRK-35","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"+5% premium not documented in surveys."}
{"claim_id":"WRK-36","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"+10% mobile premium not Portugal-specific data."}
{"claim_id":"WRK-37","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"+15% DevOps/Cloud not formalized in studies."}
{"claim_id":"WRK-38","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"+25% Rust/systems not benchmarked."}
{"claim_id":"WRK-39","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"+25% Data/ML not formally documented."}
{"claim_id":"WRK-40","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"+30% security not formally specified."}
{"claim_id":"WRK-41","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"+40% blockchain not supported by systematic data."}
{"claim_id":"WRK-42","status":"SUPPORTED","verified_value":"23.75%","source":"Segurança Social contribution tables 2024-2025","notes":"Standard employer rate confirmed as 23.75%."}
{"claim_id":"WRK-43","status":"PARTIALLY_SUPPORTED","verified_value":"~€10.20/day","source":"Portuguese budget/benefits summaries","notes":"Directionally correct but exact cent value not fully visible in legal text."}
{"claim_id":"WRK-44","status":"SUPPORTED","verified_value":"14 monthly payments","source":"Portuguese Labour Code (Código do Trabalho)","notes":"Holiday and Christmas bonuses mandated by law."}
{"claim_id":"WRK-45","status":"UNVERIFIABLE","verified_value":null,"source":"INE (not fully accessible)","notes":"Earnings breakdown not visible."}
{"claim_id":"WRK-46","status":"UNVERIFIABLE","verified_value":null,"source":"INE (not fully accessible)","notes":"Setúbal €1,672 cannot be confirmed."}
{"claim_id":"WRK-47","status":"UNVERIFIABLE","verified_value":null,"source":"INE (not fully accessible)","notes":"Norte €1,573 cannot be confirmed."}
{"claim_id":"WRK-48","status":"UNVERIFIABLE","verified_value":null,"source":"INE (not fully accessible)","notes":"Alentejo €1,547 cannot be confirmed."}
{"claim_id":"WRK-49","status":"UNVERIFIABLE","verified_value":null,"source":"INE (not fully accessible)","notes":"Centro €1,523 cannot be confirmed."}
{"claim_id":"WRK-50","status":"UNVERIFIABLE","verified_value":null,"source":"INE (not fully accessible)","notes":"Oeste/Tejo €1,458 not visible."}
{"claim_id":"WRK-51","status":"UNVERIFIABLE","verified_value":null,"source":"INE (not fully accessible)","notes":"Algarve €1,445 cannot be confirmed."}
```

**Score: 4/51** — 2 SUPPORTED (WRK-06, WRK-42, WRK-44) + 1 PARTIALLY_SUPPORTED (WRK-43). 1 partial SUPPORTED on EU part only (WRK-11). 46 UNVERIFIABLE.

### Run 3 — GLM 4.7 — 2026-02-08

```jsonl
{"claim_id":"WRK-01","status":"SUPPORTED","verified_value":"5.1%","source":"Eurostat (2023)","notes":"Matches Eurostat 2023 data."}
{"claim_id":"WRK-02","status":"SUPPORTED","verified_value":"~250,000","source":"Eurostat / INE Estimates (2023)","notes":"Consistent with aggregated estimates."}
{"claim_id":"WRK-03","status":"PARTIALLY_SUPPORTED","verified_value":"~150,000-200,000","source":"Legacy Workforce / UMASS data reports","notes":"Exact count varies but directionally correct."}
{"claim_id":"WRK-04","status":"SUPPORTED","verified_value":"~79%","source":"UMASS / Deveres Portugal","notes":"High concentration supported by regional data."}
{"claim_id":"WRK-05","status":"SUPPORTED","verified_value":"26.9%","source":"Eurostat (2023)","notes":"Matches 2023 Eurostat figure."}
{"claim_id":"WRK-06","status":"SUPPORTED","verified_value":"68%","source":"Eurostat (2023)","notes":"Matches ICT specialists with tertiary education."}
{"claim_id":"WRK-07","status":"SUPPORTED","verified_value":"~129,000","source":"UMASS / INE Regional Data (2023)","notes":"Aligns with Lisbon metro estimates."}
{"claim_id":"WRK-08","status":"SUPPORTED","verified_value":"~68,000","source":"UMASS / INE Regional Data (2023)","notes":"Aligns with Porto metro estimates."}
{"claim_id":"WRK-09","status":"SUPPORTED","verified_value":"~18,000","source":"UMASS / INE Regional Data (2023)","notes":"Aligns with Coimbra estimates."}
{"claim_id":"WRK-10","status":"SUPPORTED","verified_value":"~12,000","source":"UMASS / INE Regional Data (2023)","notes":"Aligns with Braga estimates."}
{"claim_id":"WRK-11","status":"SUPPORTED","verified_value":"PT 4.5%, EU 4.8%","source":"Eurostat (2023)","notes":"2023 data confirms values."}
{"claim_id":"WRK-12","status":"SUPPORTED","verified_value":"PT 3.8%, EU 4.2%","source":"Eurostat (2022/2023)","notes":"Aligns with education statistics."}
{"claim_id":"WRK-13","status":"SUPPORTED","verified_value":"PT 21.3%, EU 19.1%","source":"Eurostat (2023)","notes":"Confirmed by 2023 dataset."}
{"claim_id":"WRK-14","status":"SUPPORTED","verified_value":"+12%","source":"Eurostat / INE Trends (2020-2023)","notes":"ICT specialist employment grew ~12%."}
{"claim_id":"WRK-15","status":"SUPPORTED","verified_value":"4-6 weeks","source":"HRCI / Randstad / Michael Page (2024)","notes":"Standard benchmark for mid-level."}
{"claim_id":"WRK-16","status":"SUPPORTED","verified_value":"8-12 weeks","source":"HRCI / Randstad / Michael Page (2024)","notes":"Standard for senior/niche roles."}
{"claim_id":"WRK-17","status":"SUPPORTED","verified_value":"78%","source":"INE / Eurostat (2023)","notes":"Consistent with high educational attainment."}
{"claim_id":"WRK-18","status":"SUPPORTED","verified_value":"32","source":"UMASS / ACS (2023)","notes":"Aligns with demographic studies."}
{"claim_id":"WRK-19","status":"SUPPORTED","verified_value":"58%","source":"UMASS / ACS (2023)","notes":"Consistent with youth bulge in tech."}
{"claim_id":"WRK-20","status":"SUPPORTED","verified_value":"2.1 years","source":"Legacy Workforce / industry HR benchmarks (2024)","notes":"Supported by market data."}
{"claim_id":"WRK-21","status":"SUPPORTED","verified_value":"2.8 years","source":"Legacy Workforce / industry HR benchmarks (2024)","notes":"Slightly higher stability in Porto."}
{"claim_id":"WRK-22","status":"SUPPORTED","verified_value":"3.5+ years","source":"Legacy Workforce / industry HR benchmarks (2024)","notes":"Higher tenure in secondary cities."}
{"claim_id":"WRK-23","status":"SUPPORTED","verified_value":"18-24 months","source":"Startup Portugal (2023/2024)","notes":"Startup ecosystem confirms high turnover."}
{"claim_id":"WRK-24","status":"SUPPORTED","verified_value":"Jr €20-28k, Mid €30-45k, Sr €45-65k","source":"Industry salary surveys / Robert Half 2024","notes":"Matches 2024 market reports."}
{"claim_id":"WRK-25","status":"SUPPORTED","verified_value":"Jr €22-30k, Mid €33-48k, Sr €48-70k","source":"Industry salary surveys / Robert Half 2024","notes":"DevOps/SRE with slight premium."}
{"claim_id":"WRK-26","status":"SUPPORTED","verified_value":"Jr €22-30k, Mid €35-50k, Sr €50-75k","source":"Industry salary surveys / Robert Half 2024","notes":"Data/ML in high demand."}
{"claim_id":"WRK-27","status":"SUPPORTED","verified_value":"€2,400–€3,600","source":"Industry salary surveys 2024","notes":"Mobile Engineer monthly range confirmed."}
{"claim_id":"WRK-28","status":"SUPPORTED","verified_value":"€4,000–€6,000","source":"Industry salary surveys 2024","notes":"Engineering Manager range confirmed."}
{"claim_id":"WRK-29","status":"SUPPORTED","verified_value":"Jr €25-32k, Mid €35-50k, Sr €50-70k","source":"Industry salary surveys 2024","notes":"PM salaries align."}
{"claim_id":"WRK-30","status":"SUPPORTED","verified_value":"Jr €16-22k, Mid €24-35k, Sr €35-50k","source":"Industry salary surveys 2024","notes":"QA ranges accurate."}
{"claim_id":"WRK-31","status":"SUPPORTED","verified_value":"€1,500–€2,100","source":"Industry salary surveys 2024","notes":"Tech Support bands confirmed."}
{"claim_id":"WRK-32","status":"SUPPORTED","verified_value":"Jr €18-25k, Mid €28-40k, Sr €40-55k","source":"Industry salary surveys 2024","notes":"UX/Creative salary match."}
{"claim_id":"WRK-33","status":"SUPPORTED","verified_value":"€1,200–€1,800","source":"Industry salary surveys 2024","notes":"Admin/Back-office standard."}
{"claim_id":"WRK-34","status":"SUPPORTED","verified_value":"Baseline (0%)","source":"Market Analysis (Recruitment Reports)","notes":"Backend stacks are baseline."}
{"claim_id":"WRK-35","status":"SUPPORTED","verified_value":"+5%","source":"Market Analysis","notes":"Front-end small premium."}
{"claim_id":"WRK-36","status":"SUPPORTED","verified_value":"+10%","source":"Market Analysis","notes":"Native Mobile premium."}
{"claim_id":"WRK-37","status":"SUPPORTED","verified_value":"+15%","source":"Market Analysis","notes":"DevOps/Cloud demand premium."}
{"claim_id":"WRK-38","status":"SUPPORTED","verified_value":"+25%","source":"Market Analysis","notes":"Rust/systems scarce and high value."}
{"claim_id":"WRK-39","status":"SUPPORTED","verified_value":"+25%","source":"Market Analysis","notes":"Data/ML top-tier premium."}
{"claim_id":"WRK-40","status":"SUPPORTED","verified_value":"+30%","source":"Market Analysis","notes":"Security among highest paid."}
{"claim_id":"WRK-41","status":"SUPPORTED","verified_value":"+40%","source":"Market Analysis","notes":"Blockchain significant premium."}
{"claim_id":"WRK-42","status":"SUPPORTED","verified_value":"23.75%","source":"Segurança Social (2024)","notes":"Standard employer rate confirmed."}
{"claim_id":"WRK-43","status":"SUPPORTED","verified_value":"€10.20","source":"OE 2025","notes":"State Budget 2025 confirms limit."}
{"claim_id":"WRK-44","status":"SUPPORTED","verified_value":"2 extra salaries","source":"Código do Trabalho","notes":"Holiday + Christmas subsidies mandatory."}
{"claim_id":"WRK-45","status":"SUPPORTED","verified_value":"Total €2,120; Primary €1,153; Bach €2,949; Master €3,166","source":"INE Quadros de Pessoal 2023","notes":"Matches INE 2023 data for Lisbon."}
{"claim_id":"WRK-46","status":"SUPPORTED","verified_value":"Total €1,672","source":"INE Quadros de Pessoal 2023","notes":"Matches INE 2023 for Setúbal."}
{"claim_id":"WRK-47","status":"SUPPORTED","verified_value":"Total €1,573","source":"INE Quadros de Pessoal 2023","notes":"Matches INE 2023 for Norte."}
{"claim_id":"WRK-48","status":"SUPPORTED","verified_value":"Total €1,547","source":"INE Quadros de Pessoal 2023","notes":"Matches INE 2023 for Alentejo."}
{"claim_id":"WRK-49","status":"SUPPORTED","verified_value":"Total €1,523","source":"INE Quadros de Pessoal 2023","notes":"Matches INE 2023 for Centro."}
{"claim_id":"WRK-50","status":"SUPPORTED","verified_value":"Oeste/VdT €1,458","source":"INE Quadros de Pessoal 2023","notes":"Matches INE 2023."}
{"claim_id":"WRK-51","status":"SUPPORTED","verified_value":"Algarve €1,445","source":"INE Quadros de Pessoal 2023","notes":"Matches INE 2023 for Algarve."}
```

**Score: 50/51 SUPPORTED** + 1 PARTIALLY_SUPPORTED (WRK-03).

> ⚠️ **Reliability Warning:** GLM 4.7 marked nearly all claims as SUPPORTED, often citing vague
> or unverifiable sources ("UMASS", "Market Analysis (Recruitment Reports)", "ACS").
> These sources cannot be independently located for Portuguese labour market data.
> **Weight this engine's results lower** than DeepSeek, Perplexity, and ChatGPT.

### Run 4 — DeepSeek V3 — 2026-02-08

```jsonl
{"claim_id":"WRK-01","status":"SUPPORTED","verified_value":"5.1%","source":"Eurostat (2023)","notes":"Eurostat 2023 data confirms 5.1%."}
{"claim_id":"WRK-02","status":"PARTIALLY_SUPPORTED","verified_value":"~248,000","source":"Eurostat (2023) - Information and communication sector","notes":"Sector-wide proxy (~248k), not pure tech workforce count."}
{"claim_id":"WRK-03","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Proprietary Legacy Workforce data, cannot verify."}
{"claim_id":"WRK-04","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Exact 79% not found in official statistics."}
{"claim_id":"WRK-05","status":"SUPPORTED","verified_value":"26.9%","source":"Eurostat (2023)","notes":"Eurostat 2023 confirms 26.9% female ICT specialists."}
{"claim_id":"WRK-06","status":"SUPPORTED","verified_value":"68%","source":"Eurostat (2023) - ICT specialists by education","notes":"68% with tertiary education (ISCED 5-8) confirmed."}
{"claim_id":"WRK-07","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No granular regional breakdown of tech workers."}
{"claim_id":"WRK-08","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No regional breakdown found."}
{"claim_id":"WRK-09","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No regional breakdown found."}
{"claim_id":"WRK-10","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No regional breakdown found."}
{"claim_id":"WRK-11","status":"CONTRADICTED","verified_value":"5.1% (PT) vs 4.8% (EU)","source":"Eurostat (2023)","notes":"PT is 5.1%, not 4.5% as claimed. EU average 4.8% correct."}
{"claim_id":"WRK-12","status":"SUPPORTED","verified_value":"PT 3.8%, EU 4.2%","source":"Eurostat (2023)","notes":"Confirmed by education statistics."}
{"claim_id":"WRK-13","status":"SUPPORTED","verified_value":"PT 26.9%, EU 19.1%","source":"Eurostat (2023)","notes":"Both values confirmed."}
{"claim_id":"WRK-14","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Cannot verify +12% for 2020-2023 period specifically."}
{"claim_id":"WRK-15","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Private recruitment survey data."}
{"claim_id":"WRK-16","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Private recruitment survey data."}
{"claim_id":"WRK-17","status":"PARTIALLY_SUPPORTED","verified_value":"68%","source":"Eurostat (2023)","notes":"Eurostat shows 68% tertiary, not 78% bachelor's+."}
{"claim_id":"WRK-18","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No IT-specific median age in official stats."}
{"claim_id":"WRK-19","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No IT-specific age breakdown in official stats."}
{"claim_id":"WRK-20","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No official tenure data by city/sector."}
{"claim_id":"WRK-21","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No official tenure data."}
{"claim_id":"WRK-22","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No official tenure data."}
{"claim_id":"WRK-23","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Cannot verify from official sources."}
{"claim_id":"WRK-24","status":"PARTIALLY_SUPPORTED","verified_value":"Ranges plausible","source":"Industry salary surveys / Teamlyzer 2024","notes":"Directionally correct, slight variations between sources."}
{"claim_id":"WRK-25","status":"PARTIALLY_SUPPORTED","verified_value":"Ranges plausible","source":"Industry salary surveys / Teamlyzer 2024","notes":"Align with salary guides."}
{"claim_id":"WRK-26","status":"PARTIALLY_SUPPORTED","verified_value":"Ranges plausible","source":"Industry salary surveys / Teamlyzer 2024","notes":"Data/ML premium reflected."}
{"claim_id":"WRK-27","status":"PARTIALLY_SUPPORTED","verified_value":"€2,400-€3,600 plausible","source":"Industry salary survey 2024","notes":"Consistent with market reports."}
{"claim_id":"WRK-28","status":"PARTIALLY_SUPPORTED","verified_value":"€4,000-€6,000 plausible","source":"Industry salary surveys / Teamlyzer 2024","notes":"Consistent with market reports."}
{"claim_id":"WRK-29","status":"PARTIALLY_SUPPORTED","verified_value":"Ranges plausible","source":"Industry salary survey 2024","notes":"PM ranges align."}
{"claim_id":"WRK-30","status":"PARTIALLY_SUPPORTED","verified_value":"Ranges plausible","source":"Industry salary survey 2024","notes":"QA ranges align, lower end of tech."}
{"claim_id":"WRK-31","status":"PARTIALLY_SUPPORTED","verified_value":"€1,500-€2,100 plausible","source":"Teamlyzer / industry salary survey","notes":"Consistent with market reports."}
{"claim_id":"WRK-32","status":"PARTIALLY_SUPPORTED","verified_value":"Ranges plausible","source":"Industry salary survey 2024","notes":"UX ranges align."}
{"claim_id":"WRK-33","status":"PARTIALLY_SUPPORTED","verified_value":"€1,200-€1,800 plausible","source":"INE (2023)","notes":"Consistent with lower-wage admin roles."}
{"claim_id":"WRK-34","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Recruiter estimates, not official statistics."}
{"claim_id":"WRK-35","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Recruiter estimates."}
{"claim_id":"WRK-36","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Recruiter estimates."}
{"claim_id":"WRK-37","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Recruiter estimates."}
{"claim_id":"WRK-38","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Recruiter estimates."}
{"claim_id":"WRK-39","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Recruiter estimates."}
{"claim_id":"WRK-40","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Recruiter estimates."}
{"claim_id":"WRK-41","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Recruiter estimates."}
{"claim_id":"WRK-42","status":"SUPPORTED","verified_value":"23.75%","source":"Segurança Social (2025)","notes":"Standard TSU rate confirmed."}
{"claim_id":"WRK-43","status":"SUPPORTED","verified_value":"€10.20/day","source":"OE 2025, Artigo 6.º","notes":"Confirmed by State Budget."}
{"claim_id":"WRK-44","status":"SUPPORTED","verified_value":"14 months","source":"Código do Trabalho, Artigo 265.º","notes":"Holiday + Christmas allowances mandated."}
{"claim_id":"WRK-45","status":"SUPPORTED","verified_value":"Lisboa: €2,120; €1,153; €2,949; €3,166","source":"INE Quadros de Pessoal 2023","notes":"Matches INE 2023 for Lisbon by education level."}
{"claim_id":"WRK-46","status":"SUPPORTED","verified_value":"Setúbal: €1,672","source":"INE Quadros de Pessoal 2023","notes":"Matches INE 2023."}
{"claim_id":"WRK-47","status":"SUPPORTED","verified_value":"Norte: €1,573","source":"INE Quadros de Pessoal 2023","notes":"Matches INE 2023."}
{"claim_id":"WRK-48","status":"SUPPORTED","verified_value":"Alentejo: €1,547","source":"INE Quadros de Pessoal 2023","notes":"Matches INE 2023."}
{"claim_id":"WRK-49","status":"SUPPORTED","verified_value":"Centro: €1,523","source":"INE Quadros de Pessoal 2023","notes":"Matches INE 2023."}
{"claim_id":"WRK-50","status":"SUPPORTED","verified_value":"Oeste/VdT: €1,458","source":"INE Quadros de Pessoal 2023","notes":"Matches INE 2023."}
{"claim_id":"WRK-51","status":"SUPPORTED","verified_value":"Algarve: €1,445","source":"INE Quadros de Pessoal 2023","notes":"Matches INE 2023."}
```

**Score: 19/51 SUPPORTED** + 11 PARTIALLY_SUPPORTED + 1 CONTRADICTED (WRK-11). 20 UNVERIFIABLE.

### Run 5 — ChatGPT — 2026-02-08

```jsonl
{"claim_id":"WRK-01","status":"SUPPORTED","verified_value":"~4.5%","source":"Eurostat / Digital Skills & Jobs Platform / Digital Decade reports","notes":"Portugal's ICT specialist share is around 4.5% in 2023/2024."}
{"claim_id":"WRK-02","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Total tech workforce ~250k not available."}
{"claim_id":"WRK-03","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Legacy Workforce count not available."}
{"claim_id":"WRK-04","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"City distribution not verifiable."}
{"claim_id":"WRK-05","status":"SUPPORTED","verified_value":"22.7%","source":"Eurostat / Digital Decade 2025","notes":"Female ICT share ~22.7% in 2024, claim of 26.9% seems high."}
{"claim_id":"WRK-06","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"ICT workers with tertiary education % not found."}
{"claim_id":"WRK-07","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-08","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-09","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-10","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-11","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"EU comparisons not verifiable."}
{"claim_id":"WRK-12","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-13","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-14","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-15","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-16","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-17","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-18","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-19","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-20","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-21","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-22","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-23","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-24","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-25","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-26","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-27","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-28","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-29","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-30","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-31","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-32","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-33","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-34","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-35","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-36","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-37","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-38","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-39","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-40","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-41","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-42","status":"SUPPORTED","verified_value":"23.75%","source":"PwC Portugal / Social Security Guide 2025","notes":"Employer SS rate confirmed."}
{"claim_id":"WRK-43","status":"SUPPORTED","verified_value":"€10.20/day","source":"BridgeIn / meal allowance guidance 2025","notes":"Tax-exempt if paid via meal card."}
{"claim_id":"WRK-44","status":"SUPPORTED","verified_value":"14 salaries","source":"Portuguese employment tradition & national sources","notes":"Holiday + Christmas subsidies confirmed."}
{"claim_id":"WRK-45","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"INE regional earnings not accessible."}
{"claim_id":"WRK-46","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-47","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-48","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-49","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-50","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
{"claim_id":"WRK-51","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Not available."}
```

**Score: 5/51 SUPPORTED** (WRK-01, WRK-05, WRK-42, WRK-43, WRK-44). 46 UNVERIFIABLE.

### Run 6 — Gemini Deep Research — 2026-02-11

> **⚠️ v3.2 Prompt:** This run uses the regenerated v3.2 prompt (post code-fix).
> Claim IDs shifted vs. Runs 1–5. Key changes:
> - Old WRK-02 (total workforce ~250k) removed; Legacy Workforce count is now WRK-02
> - New: WRK-04 (annual growth ~8.5%), WRK-11 (Aveiro), WRK-12 (other cities)
> - Old WRK-44 (14 monthly salaries) removed from v3.2 prompt
> - City counts now use `legacy` field (lower numbers than `official`)
> - DB already updated: ICT 5.1%→5.2%, female ICT 26.9%→22.7%, EU context 4.5/4.8→5.2/5.0
> - Mapping to old IDs: see [ID Mapping](#gemini-id-mapping) below

```jsonl
{"claim_id":"WRK-01","status":"SUPPORTED","verified_value":"5.2%","source":"Digital Skills and Jobs Platform Portugal 2025, Eurostat","notes":"Exact match — Portugal ICT specialists 5.2% of total employment in 2024, above EU average of 5%"}
{"claim_id":"WRK-02","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No authoritative source found for Legacy Workforce-specific data of ~165,000 IT professionals"}
{"claim_id":"WRK-03","status":"PARTIALLY_SUPPORTED","verified_value":"67.7% in Lisbon + Porto","source":"Industry Global Tech Talent Trends 2024","notes":"67.7% concentration (not 79%). Lisbon dropped from 52.2% to 41.8%"}
{"claim_id":"WRK-04","status":"PARTIALLY_SUPPORTED","verified_value":"11% growth (female ICT)","source":"Eurostat ICT specialists 2024","notes":"Portugal 11% annual growth for female ICT (2014-2024). Overall ~8.5% directionally correct"}
{"claim_id":"WRK-05","status":"SUPPORTED","verified_value":"22.7%","source":"Digital Skills and Jobs Platform Portugal 2025, Eurostat","notes":"Exact match — Female ICT specialists 22.7% in 2024"}
{"claim_id":"WRK-06","status":"CONTRADICTED","verified_value":"38.3%","source":"Eurostat ICT education 2024","notes":"61.7% of employed with ICT education did NOT have tertiary in PT. Only 38.3% had tertiary, not 68%"}
{"claim_id":"WRK-07","status":"PARTIALLY_SUPPORTED","verified_value":"41.8% of IT workforce","source":"Industry tech talent report 2024","notes":"Lisbon at 41.8% (down from 52.2%). Absolute ~85k unverifiable"}
{"claim_id":"WRK-08","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"Porto ~45k (27%) not found in authoritative sources"}
{"claim_id":"WRK-09","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No specific Coimbra data"}
{"claim_id":"WRK-10","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No specific Braga data"}
{"claim_id":"WRK-11","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No specific Aveiro data (new in v3.2)"}
{"claim_id":"WRK-12","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No specific other cities data (new in v3.2)"}
{"claim_id":"WRK-13","status":"SUPPORTED","verified_value":"5.2% PT vs 5.0% EU","source":"Eurostat 2024","notes":"Portugal 5.2% above EU 5.0% — confirmed"}
{"claim_id":"WRK-14","status":"PARTIALLY_SUPPORTED","verified_value":"~3% (2023)","source":"Eurostat Digitalisation 2023","notes":"PT ~3% ICT graduates vs EU ~4%, close to claimed 3.8%"}
{"claim_id":"WRK-15","status":"SUPPORTED","verified_value":"22.7% PT vs 19.5% EU","source":"Eurostat 2024","notes":"Exact match — PT 22.7% female ICT, EU 19.5%"}
{"claim_id":"WRK-16","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No specific +12% since 2020 figure found"}
{"claim_id":"WRK-17","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No time-to-hire data for mid-level"}
{"claim_id":"WRK-18","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No time-to-hire data for senior/niche"}
{"claim_id":"WRK-19","status":"CONTRADICTED","verified_value":"38.3%","source":"Eurostat ICT education 2024","notes":"Only 38.3% had tertiary (bachelor's+) — claim of 78% contradicted"}
{"claim_id":"WRK-20","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No median age data"}
{"claim_id":"WRK-21","status":"PARTIALLY_SUPPORTED","verified_value":"44.3% under 35","source":"Eurostat 2024","notes":"PT 44.3% ICT specialists aged 15-34. Claim of 58% overstated"}
{"claim_id":"WRK-22","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No tenure data by city"}
{"claim_id":"WRK-23","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No tenure data by city"}
{"claim_id":"WRK-24","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No tenure data by city"}
{"claim_id":"WRK-25","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No startup tenure data"}
{"claim_id":"WRK-26","status":"PARTIALLY_SUPPORTED","verified_value":"Jr €29-44k, Mid €44-58k, Sr €46-79k","source":"Levels.fyi, industry salary survey 2024-2025","notes":"Directionally correct but upper bounds may be optimistic"}
{"claim_id":"WRK-27","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No DevOps/SRE salary data by level"}
{"claim_id":"WRK-28","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No ML/Data salary data by level"}
{"claim_id":"WRK-29","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No Mobile salary data by level"}
{"claim_id":"WRK-30","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No Eng Manager salary data by level"}
{"claim_id":"WRK-31","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No Product Manager salary data by level"}
{"claim_id":"WRK-32","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No QA/Testing salary data by level"}
{"claim_id":"WRK-33","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No Tech Support salary data by level"}
{"claim_id":"WRK-34","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No UX/Creative salary data by level"}
{"claim_id":"WRK-35","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No Admin/Back-office salary data by level"}
{"claim_id":"WRK-36","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No tech stack premium data"}
{"claim_id":"WRK-37","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No tech stack premium data"}
{"claim_id":"WRK-38","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No tech stack premium data"}
{"claim_id":"WRK-39","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No tech stack premium data"}
{"claim_id":"WRK-40","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No tech stack premium data"}
{"claim_id":"WRK-41","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No tech stack premium data"}
{"claim_id":"WRK-42","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No tech stack premium data"}
{"claim_id":"WRK-43","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"No tech stack premium data"}
{"claim_id":"WRK-44","status":"SUPPORTED","verified_value":"23.75%","source":"PwC Portugal Tax Guide 2024-2025, Trading Economics","notes":"Exact match — employer SS 23.75%"}
{"claim_id":"WRK-45","status":"SUPPORTED","verified_value":"€10.20/day (meal card)","source":"Portugal State Budget 2025, Edenred Portugal","notes":"Tax-exempt max €10.20/day via meal card"}
{"claim_id":"WRK-46","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"Regional earnings not found in accessible sources"}
{"claim_id":"WRK-47","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"Regional earnings not found"}
{"claim_id":"WRK-48","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"Regional earnings not found"}
{"claim_id":"WRK-49","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"Regional earnings not found"}
{"claim_id":"WRK-50","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"Regional earnings not found"}
{"claim_id":"WRK-51","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"Regional earnings not found"}
{"claim_id":"WRK-52","status":"UNVERIFIABLE","verified_value":"N/A","source":"N/A","notes":"Regional earnings not found"}
```

**Score: 7/52 SUPPORTED** + 5 PARTIALLY_SUPPORTED + 2 CONTRADICTED (WRK-06, WRK-19). 38 UNVERIFIABLE.

> **Key findings:** Confirms ICT 5.2% and female ICT 22.7% (DB already updated). Two strong
> contradictions: tertiary education 38.3% (not 68%) and bachelor's+ 38.3% (not 78%), both
> citing Eurostat ICT education tables. Concentration ~67.7% (not 79%) from an industry report.
> Under-35 share 44.3% (not 58%).

<a id="gemini-id-mapping"></a>

#### Gemini → Runs 1–5 ID Mapping

| Gem ID | Old ID | Notes |
|--------|--------|-------|
| G-WRK-01 | WRK-01 | ICT % (DB updated 5.1→5.2) |
| G-WRK-02 | WRK-03 | Legacy Workforce count (old WRK-02 = total workforce removed) |
| G-WRK-03 | WRK-04 | Concentration |
| G-WRK-04 | NEW | Annual growth ~8.5% |
| G-WRK-05 | WRK-05 | Female ICT (DB updated 26.9→22.7) |
| G-WRK-06 | WRK-06 | Tertiary 68% |
| G-WRK-07–08 | WRK-07–08 | Lisbon (now legacy: 85k), Porto (45k) |
| G-WRK-09–10 | WRK-09–10 | Coimbra, Braga |
| G-WRK-11–12 | NEW | Aveiro, Other cities |
| G-WRK-13 | WRK-11 | PT vs EU ICT % (DB updated 4.5/4.8→5.2/5.0) |
| G-WRK-14 | WRK-12 | ICT graduates % |
| G-WRK-15 | WRK-13 | Female ICT EU context (DB updated 21.3/19.1→22.7/19.4) |
| G-WRK-16 | WRK-14 | +12% growth trend |
| G-WRK-17–18 | WRK-15–16 | Time to hire |
| G-WRK-19 | WRK-17 | Bachelor's+ 78% |
| G-WRK-20 | WRK-18 | Median age |
| G-WRK-21 | WRK-19 | Under-35 58% |
| G-WRK-22–25 | WRK-20–23 | Tenure metrics |
| G-WRK-26–35 | WRK-24–33 | Salary bands (shifted by 2) |
| G-WRK-36–43 | WRK-34–41 | Tech premiums (shifted by 2) |
| G-WRK-44 | WRK-42 | Employer SS (old WRK-44 = 14 salaries removed) |
| G-WRK-45 | WRK-43 | Meal allowance |
| G-WRK-46–52 | WRK-45–51 | Regional earnings (shifted by 1) |

---

## Consensus Matrix

> **Engines:** DS = DeepSeek R1 | PX = Perplexity | GLM = GLM 4.7 | DS3 = DeepSeek V3 | GPT = ChatGPT | Gem = Gemini Deep Research
>
> **Legend:** ✅ Supported | 🔄 Partial | ❌ Contradicted | ❓ Unverifiable | — = N/A
>
> ⚠️ **GLM 4.7 weight reduced**: Marked 50/51 SUPPORTED with vague sources. Lower weight in consensus.
> ⚠️ **Gemini (Run 6)** tested v3.2 prompt — IDs remapped using table above. DB values already updated for some claims.

### A. ICT Employment & Workforce (WRK-01 to WRK-10)

| ID | Claim | DS | PX | GLM | DS3 | GPT | Gem | Score (excl. GLM) | Action |
|----|-------|----|----|-----|-----|-----|-----|---------------------|--------|
| WRK-01 | ICT specialists = 5.2% | ✅ 5.2% | ❓ | ✅ | ✅ 5.1% | ✅ ~4.5% | ✅ 5.2% | **4/5 ✅** | **Keep ✅** |
| WRK-02 | Total tech workforce ~250k | ❓ | ❓ | ✅ | 🔄 ~248k | ❓ | — | 1🔄 3❓ | Keep, low conf. |
| WRK-03 | Legacy Workforce tech profiles ~165k | ❓ | ❓ | 🔄 | ❓ | ❓ | ❓ | 5❓ | Keep, low conf. |
| WRK-04 | 79% concentration Lisbon+Porto | 🔄 67.7% | ❓ | ✅ | ❓ | ❓ | 🔄 67.7% | **2🔄 3❓** | **🟡 Investigate** |
| WRK-05 | Female ICT specialists (22.7%) | ✅ ~25% | ❓ | ✅ | ✅ 26.9% | ✅ 22.7% | ✅ 22.7% | **4/5 ✅** | **Keep ✅** |
| WRK-06 | 68% ICT workers tertiary edu | ❌ 38.3% | ✅ 67.4% EU | ✅ | ✅ 68% | ❓ | ❌ 38.3% | **2✅ 2❌ 1❓** | **🔴 Investigate** |
| WRK-07 | Lisbon tech workers | ❓ | ❓ | ✅ | ❓ | ❓ | 🔄 41.8% | 1🔄 4❓ | Keep, low conf. |
| WRK-08 | Porto tech workers | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, low conf. |
| WRK-09 | Coimbra tech workers | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, low conf. |
| WRK-10 | Braga tech workers | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, low conf. |

### B. EU Context & Trends (WRK-11 to WRK-14)

| ID | Claim | DS | PX | GLM | DS3 | GPT | Gem | Score (excl. GLM) | Action |
|----|-------|----|----|-----|-----|-----|-----|---------------------|--------|
| WRK-11 | PT 5.2% vs EU 5.0% ICT share | ❌ 5.2%/5.0% | ✅ EU 4.8% | ✅ | ❌ 5.1%/4.8% | ❓ | ✅ 5.2%/5.0% | **2✅ 2❌ 1❓** | **✅ RESOLVED** (DB updated) |
| WRK-12 | ICT graduates PT 3.8% vs EU 4.2% | ❓ | ❓ | ✅ | ✅ | ❓ | 🔄 ~3% | 1✅ 1🔄 3❓ | Keep, low conf. |
| WRK-13 | Female ICT: PT 22.7% vs EU 19.4% | ✅ ~25%/19.5% | ❓ | ✅ 21.3%/19.1% | ✅ 26.9%/19.1% | ❓ | ✅ 22.7%/19.5% | **3/5 ✅** | **✅ RESOLVED** (DB updated) |
| WRK-14 | +12% ICT workforce growth since 2020 | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, low conf. |

### C. Hiring Insights & Demographics (WRK-15 to WRK-23)

| ID | Claim | DS | PX | GLM | DS3 | GPT | Gem | Score (excl. GLM) | Action |
|----|-------|----|----|-----|-----|-----|-----|---------------------|--------|
| WRK-15 | Time to hire mid-level: 4-6 weeks | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, low conf. |
| WRK-16 | Time to hire senior: 8-12 weeks | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, low conf. |
| WRK-17 | 78% IT workforce bachelor's+ | ❓ | ❓ | ✅ 78% | 🔄 68% | ❓ | ❌ 38.3% | **1🔄 1❌ 3❓** | **🔴 Investigate** |
| WRK-18 | Median age IT workforce: 32 | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, low conf. |
| WRK-19 | 58% IT workforce under 35 | ❓ | ❓ | ✅ | ❓ | ❓ | 🔄 44.3% | 1🔄 4❓ | **🟡 Investigate** |
| WRK-20 | Lisbon tenure: 2.1 years | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, low conf. |
| WRK-21 | Porto tenure: 2.8 years | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, low conf. |
| WRK-22 | Secondary cities: 3.5+ years | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, low conf. |
| WRK-23 | Startup tenure: 18-24 months | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, low conf. |

### D. Salary Bands (WRK-24 to WRK-33)

| ID | Claim | DS | PX | GLM | DS3 | GPT | Gem | Score (excl. GLM) | Action |
|----|-------|----|----|-----|-----|-----|-----|---------------------|--------|
| WRK-24 | Software Eng: Jr €20-28k, Mid €30-45k, Sr €45-65k | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | 🔄 | 2🔄 3❓ | Keep, low conf. |
| WRK-25 | DevOps/SRE: Jr €22-30k, Mid €33-48k, Sr €48-70k | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | ❓ | 1🔄 4❓ | Keep, low conf. |
| WRK-26 | ML/Data: Jr €22-30k, Mid €35-50k, Sr €50-75k | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | ❓ | 1🔄 4❓ | Keep, low conf. |
| WRK-27 | Mobile: €2,400-€3,600/month | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | ❓ | 1🔄 4❓ | Keep, low conf. |
| WRK-28 | Eng. Manager: €4,000-€6,000/month | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | ❓ | 1🔄 4❓ | Keep, low conf. |
| WRK-29 | Product Manager: Jr €25-32k, Mid €35-50k, Sr €50-70k | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | ❓ | 1🔄 4❓ | Keep, low conf. |
| WRK-30 | QA/Testing: Jr €16-22k, Mid €24-35k, Sr €35-50k | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | ❓ | 1🔄 4❓ | Keep, low conf. |
| WRK-31 | Tech Support: €1,500-€2,100/month | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | ❓ | 1🔄 4❓ | Keep, low conf. |
| WRK-32 | UX/Creative: Jr €18-25k, Mid €28-40k, Sr €40-55k | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | ❓ | 1🔄 4❓ | Keep, low conf. |
| WRK-33 | Admin/Back-office: €1,200-€1,800/month | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | ❓ | 1🔄 4❓ | Keep, low conf. |

### E. Tech Stack Premiums (WRK-34 to WRK-41)

| ID | Claim | DS | PX | GLM | DS3 | GPT | Gem | Score (excl. GLM) | Action |
|----|-------|----|----|-----|-----|-----|-----|---------------------|--------|
| WRK-34 | Backend baseline (0%) | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, internal metric |
| WRK-35 | Front-end (+5%) | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, internal metric |
| WRK-36 | Native mobile (+10%) | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, internal metric |
| WRK-37 | DevOps/Cloud (+15%) | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, internal metric |
| WRK-38 | Systems/Rust (+25%) | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, internal metric |
| WRK-39 | Data/ML (+25%) | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, internal metric |
| WRK-40 | Security (+30%) | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, internal metric |
| WRK-41 | Blockchain (+40%) | ❓ | ❓ | ✅ | ❓ | ❓ | ❓ | 5❓ | Keep, internal metric |

### F. Employer Costs (WRK-42 to WRK-44)

| ID | Claim | DS | PX | GLM | DS3 | GPT | Gem | Score (excl. GLM) | Action |
|----|-------|----|----|-----|-----|-----|-----|---------------------|--------|
| WRK-42 | Employer SS: 23.75% | ❓ | ✅ | ✅ | ✅ | ✅ | ✅ | **4/5 ✅** | **Keep ✅** |
| WRK-43 | Meal allowance: €10.20/day | ❓ | 🔄 | ✅ | ✅ | ✅ | ✅ | **3✅ 1🔄 1❓** | **Keep ✅** |
| WRK-44 | 14 monthly salaries/year | ❓ | ✅ | ✅ | ✅ | ✅ | — | **3/4 ✅** | **Keep ✅** |

### G. INE Regional Earnings (WRK-45 to WRK-51)

| ID | Claim | DS | PX | GLM | DS3 | GPT | Gem | Score (excl. GLM) | Action |
|----|-------|----|----|-----|-----|-----|-----|---------------------|--------|
| WRK-45 | Lisboa: €2,120 total; €1,153/€2,949/€3,166 by edu | ❓ | ❓ | ✅ | ✅ | ❓ | ❓ | 1✅ 4❓ | Keep, moderate conf. |
| WRK-46 | Setúbal: €1,672 | ❓ | ❓ | ✅ | ✅ | ❓ | ❓ | 1✅ 4❓ | Keep, moderate conf. |
| WRK-47 | Norte: €1,573 | ❓ | ❓ | ✅ | ✅ | ❓ | ❓ | 1✅ 4❓ | Keep, moderate conf. |
| WRK-48 | Alentejo: €1,547 | ❓ | ❓ | ✅ | ✅ | ❓ | ❓ | 1✅ 4❓ | Keep, moderate conf. |
| WRK-49 | Centro: €1,523 | ❓ | ❓ | ✅ | ✅ | ❓ | ❓ | 1✅ 4❓ | Keep, moderate conf. |
| WRK-50 | Oeste/VdT: €1,458 | ❓ | ❓ | ✅ | ✅ | ❓ | ❓ | 1✅ 4❓ | Keep, moderate conf. |
| WRK-51 | Algarve: €1,445 | ❓ | ❓ | — | ✅ | ❓ | ❓ | 1✅ 4❓ | Keep, moderate conf. |

---

## Summary & Suggested Corrections

### Overall Statistics (6 engines, excluding GLM 4.7 due to low reliability)

| Status | Count | % |
|--------|-------|---|
| Consensus SUPPORTED (3+/5 engines) | 9 claims | 18% |
| Partially supported / mixed | 6 claims | 12% |
| CONTRADICTED (2+/5 agree) | 2 claims | 4% |
| Majority UNVERIFIABLE | 34 claims | 66% |

### Engine Reliability Assessment

| Engine | SUPPORTED | PARTIAL | CONTRADICTED | UNVERIFIABLE | Quality |
|--------|-----------|---------|--------------|--------------|---------|
| DeepSeek R1 | 4 | 1 | 2 | 44 | **High** — cautious, well-sourced |
| Perplexity | 3 | 1 | 0 | 47 | **High** — cautious, well-sourced |
| GLM 4.7 | 50 | 1 | 0 | 0 | **⚠️ Low** — overly permissive, vague sources |
| DeepSeek V3 | 19 | 11 | 1 | 20 | **Good** — balanced, cites specific sources |
| ChatGPT | 5 | 0 | 0 | 46 | **High** — very cautious |
| Gemini | 7 | 5 | 2 | 38 | **High** — web-grounded, cites Eurostat/industry report |

### ✅ Previously Flagged — Now Resolved

> DB values were updated between Runs 1–5 and Run 6. Gemini confirms the corrected values.

| Item | Old Value | Current DB | Gem Confirms | Status |
|------|-----------|------------|-------------|--------|
| WRK-11 (PT vs EU ICT %) | PT 4.5%, EU 4.8% | PT 5.2%, EU 5.0% | ✅ 5.2%/5.0% | **RESOLVED** |
| WRK-05 (Female ICT) | 26.9% | 22.7% | ✅ 22.7% | **RESOLVED** |
| WRK-13 (Female ICT EU) | PT 21.3%, EU 19.1% | PT 22.7%, EU 19.4% | ✅ 22.7%/19.5% | **RESOLVED** |

### 🔴 Corrections Needed (HITL Decision Required)

#### 1. WRK-06 — ICT Workers with Tertiary Education (68%)

| | Current | Suggested |
|---|---------|-----------|
| **Claim** | 68% of ICT workers have tertiary education | **Clarify scope — possibly 38.3% for PT** |
| **DS R1** | ❌ 38.3% — "61.7% did NOT have tertiary" (Eurostat "ICT education" table) |
| **Perplexity** | ✅ 67.4% — but notes this is EU-wide average |
| **DS V3** | ✅ 68% — cites "Eurostat ICT specialists by education (ISCED 5-8)" |
| **Gemini** | ❌ 38.3% — cites "Eurostat ICT education 2024" |
| **Consensus** | **2✅ 2❌ 1❓ — evenly split** |
| **Analysis** | Two different Eurostat tables give contradictory results: (a) "ICT specialists" with tertiary = ~67-68% (EU-wide or occupation-based), (b) "persons with ICT education" with tertiary = 38.3% (Portugal-specific, education-based). These are DIFFERENT populations. |
| **Recommendation** | **CRITICAL**: Manually check Eurostat tables `isoc_sks_itsps` vs `isoc_sks_ited`. If 68% is EU average (not PT-specific), this is misleading. If PT "ICT education" holders are 38.3% tertiary, our claim overstates educational attainment. |
| **Target file** | Legacy claim retired in v3.2 (official/EURES schema no longer includes `workforceStatistics.tertiaryEducation`) |

#### 2. WRK-04 — Workforce Concentration in Lisbon+Porto (79%)

| | Current | Suggested |
|---|---------|-----------|
| **Claim** | 79% of tech workforce in Lisbon + Porto | ~68% |
| **DS R1** | 🔄 67.7% — industry report 2024 |
| **Gemini** | 🔄 67.7% — industry report 2024 |
| **Other engines** | ❓ (3 unverifiable) |
| **Consensus** | **2/5 partial at 67.7%, 3/5 unverifiable** |
| **Recommendation** | Update to "~68%" — two independent runs cite the same industry report. 79% appears significantly overstated. |
| **Target file** | `WEBSITE_CONTENT.json` → `workforceStatistics.rankInEU` + `workforceStatistics.cityBreakdown` |

#### 3. WRK-17 — Bachelor's+ in IT Workforce (78%)

| | Current | Suggested |
|---|---------|-----------|
| **Claim** | 78% of IT workforce has bachelor's or higher | **Investigate — possibly 38.3% or 68%** |
| **DS V3** | 🔄 68% — Eurostat tertiary (ISCED 5-8) |
| **Gemini** | ❌ 38.3% — Eurostat ICT education 2024 |
| **Other engines** | ❓ (3 unverifiable) |
| **Consensus** | **1🔄 1❌ 3❓** |
| **Analysis** | Same Eurostat table ambiguity as WRK-06. 78% could be correct if measuring specifically bachelor's+ (excluding CTeSP/short-cycle), but no engine confirmed this exact figure. |
| **Recommendation** | **Investigate alongside WRK-06**. These two claims share the same data interpretation issue. |
| **Target file** | `WEBSITE_CONTENT.json` → `hiringInsights.regionalQualificationBaseline` |

#### 4. WRK-19 — IT Workforce Under 35 (58%)

| | Current | Suggested |
|---|---------|-----------|
| **Claim** | 58% of IT workforce is under 35 | ~44% |
| **Gemini** | 🔄 44.3% — Eurostat ICT specialists aged 15-34 (2024) |
| **Other engines** | ❓ (4 unverifiable) |
| **Consensus** | **1🔄 4❓ — only one source provides counter-value** |
| **Recommendation** | **Investigate**: Only Gemini provides a specific counter (44.3% from Eurostat). The 58% figure has no supporting evidence from any engine. Flag for manual verification against Eurostat age distribution tables. |
| **Target file** | Legacy claim retired in v3.2 (current hiring indicators use `hiringInsights.remoteWorkPenetration`) |

### ✅ Confirmed Solid (No Action)

| Claim | Description | Consensus (6 engines) |
|-------|-------------|----------------------|
| WRK-01 | ICT specialists = 5.2% | 4/5 ✅ |
| WRK-05 | Female ICT = 22.7% | 4/5 ✅ |
| WRK-42 | Employer SS = 23.75% | 4/5 ✅ |
| WRK-43 | Meal allowance = €10.20 | 3✅ 1🔄 1❓ |
| WRK-44 | 14 monthly salaries | 3/4 ✅ (Gem N/A) |

### 📋 Categories Assessment

| Category | Claims | Confidence | Notes |
|----------|--------|------------|-------|
| **ICT Employment** (01-10) | 10 | **Mixed** | Top-level % solid; city counts unverifiable; concentration overstated |
| **EU Context** (11-14) | 4 | **Medium** | WRK-11/13 resolved; graduates/trend unverifiable |
| **Hiring/Demographics** (15-23) | 9 | **Low** | WRK-17 (edu) and WRK-19 (age) newly flagged; rest unverifiable |
| **Salary Bands** (24-33) | 10 | **Low-Medium** | DS3 says plausible; Gem supports SW eng; no exact match |
| **Tech Premiums** (34-41) | 8 | **Low** | Internal heuristics; inherently unverifiable |
| **Employer Costs** (42-44) | 3 | **High** | All confirmed by legal sources |
| **INE Earnings** (45-51) | 7 | **Medium** | DS3+GLM confirm from INE; others can't access |

### Confidence Score Update

Current: **85%** → Suggested: **75%**

Rationale: Gemini's Eurostat-grounded contradictions on education metrics (WRK-06, WRK-17) and
age distribution (WRK-19) are significant. The tertiary education discrepancy (68% vs 38.3%)
indicates possible misattribution of EU-average to Portugal-specific data. The concentration
figure (79% vs ~68%) is also likely wrong. While employer costs and headline ICT% remain solid,
these education/demographic claims affect credibility of the hiring insights section.

---

## HITL Decision Log

| Date | Decision | Corrections Applied | By |
|------|----------|--------------------|----|
| Pre-Run 6 | DB already updated: ICT 5.1%→5.2%, female 26.9%→22.7%, EU context 4.5/4.8→5.2/5.0 | WRK-01, WRK-05, WRK-11, WRK-13 | Auto |
| 2026-02-11 | Run 6 (Gemini) added. 4 new corrections proposed (WRK-06, WRK-04, WRK-17, WRK-19) | _Awaiting HITL review_ | — |


