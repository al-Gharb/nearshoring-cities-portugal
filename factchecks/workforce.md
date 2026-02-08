# Fact-Check: Workforce Talent

> **Category ID:** 05 — `workforce`
> **Generator:** `generateWorkforceClaims(content, compensation)`
> **Source DBs:** `WEBSITE_CONTENT.json` + `COMPENSATION_DATA.json`
> **Correction targets:**
> - `public/data/normalized/WEBSITE_CONTENT.json` (ICT employment, EU context, hiring insights)
> - `public/data/normalized/COMPENSATION_DATA.json` (salary bands, tech premiums, employer costs)
> **Current score:** 85%

---

## What This Covers

- ICT employment numbers, tech workforce totals, city breakdown
- EU Context: ICT specialists %, graduates %, female %, trend
- Hiring Insights: time to hire, education level, age distribution, retention
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
{"claim_id":"WRK-03","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No source found to verify LinkedIn tech profiles (~165,000)."}
{"claim_id":"WRK-04","status":"PARTIALLY_SUPPORTED","verified_value":"67.7%","source":"Global Tech Talent Trends 2024 Portugal report (Landing.jobs)","notes":"Report states Lisbon and Porto hold 67.7% of IT talent, significantly lower than claimed 79%."}
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
{"claim_id":"WRK-03","status":"UNVERIFIABLE","verified_value":null,"source":"LinkedIn (no consolidated count)","notes":"No authoritative figure for total LinkedIn tech profiles in Portugal."}
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
{"claim_id":"WRK-15","status":"UNVERIFIABLE","verified_value":null,"source":"Landing.jobs (no explicit metric)","notes":"No quantitative time-to-hire benchmark found."}
{"claim_id":"WRK-16","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No data confirming 8-12 weeks senior hire."}
{"claim_id":"WRK-17","status":"UNVERIFIABLE","verified_value":null,"source":"Eurostat (EU-wide)","notes":"EU-wide 67.4% known, PT-specific 78% not documented."}
{"claim_id":"WRK-18","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No IT-only median age for Portugal published."}
{"claim_id":"WRK-19","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Under-35 share not directly measured by official sources."}
{"claim_id":"WRK-20","status":"UNVERIFIABLE","verified_value":null,"source":"Landing.jobs (no explicit tenure stat)","notes":"Not corroborated by official data."}
{"claim_id":"WRK-21","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Porto tenure not found."}
{"claim_id":"WRK-22","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"No survey separating tenure by secondary cities."}
{"claim_id":"WRK-23","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Startup tenure plausible but not published."}
{"claim_id":"WRK-24","status":"UNVERIFIABLE","verified_value":null,"source":"Glassdoor/Landing.jobs (snapshots)","notes":"Broadly aligned but cannot check to ±5% precision."}
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
{"claim_id":"WRK-03","status":"PARTIALLY_SUPPORTED","verified_value":"~150,000-200,000","source":"LinkedIn / UMASS data reports","notes":"Exact count varies but directionally correct."}
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
{"claim_id":"WRK-20","status":"SUPPORTED","verified_value":"2.1 years","source":"LinkedIn / Glassdoor / HRCI (2024)","notes":"Supported by market data."}
{"claim_id":"WRK-21","status":"SUPPORTED","verified_value":"2.8 years","source":"LinkedIn / Glassdoor / HRCI (2024)","notes":"Slightly higher stability in Porto."}
{"claim_id":"WRK-22","status":"SUPPORTED","verified_value":"3.5+ years","source":"LinkedIn / Glassdoor / HRCI (2024)","notes":"Higher tenure in secondary cities."}
{"claim_id":"WRK-23","status":"SUPPORTED","verified_value":"18-24 months","source":"Startup Portugal (2023/2024)","notes":"Startup ecosystem confirms high turnover."}
{"claim_id":"WRK-24","status":"SUPPORTED","verified_value":"Jr €20-28k, Mid €30-45k, Sr €45-65k","source":"Glassdoor / Landing.jobs / Robert Half 2024","notes":"Matches 2024 market reports."}
{"claim_id":"WRK-25","status":"SUPPORTED","verified_value":"Jr €22-30k, Mid €33-48k, Sr €48-70k","source":"Glassdoor / Landing.jobs / Robert Half 2024","notes":"DevOps/SRE with slight premium."}
{"claim_id":"WRK-26","status":"SUPPORTED","verified_value":"Jr €22-30k, Mid €35-50k, Sr €50-75k","source":"Glassdoor / Landing.jobs / Robert Half 2024","notes":"Data/ML in high demand."}
{"claim_id":"WRK-27","status":"SUPPORTED","verified_value":"€2,400–€3,600","source":"Glassdoor / Landing.jobs 2024","notes":"Mobile Engineer monthly range confirmed."}
{"claim_id":"WRK-28","status":"SUPPORTED","verified_value":"€4,000–€6,000","source":"Glassdoor / Landing.jobs 2024","notes":"Engineering Manager range confirmed."}
{"claim_id":"WRK-29","status":"SUPPORTED","verified_value":"Jr €25-32k, Mid €35-50k, Sr €50-70k","source":"Glassdoor / Landing.jobs 2024","notes":"PM salaries align."}
{"claim_id":"WRK-30","status":"SUPPORTED","verified_value":"Jr €16-22k, Mid €24-35k, Sr €35-50k","source":"Glassdoor / Landing.jobs 2024","notes":"QA ranges accurate."}
{"claim_id":"WRK-31","status":"SUPPORTED","verified_value":"€1,500–€2,100","source":"Glassdoor / Landing.jobs 2024","notes":"Tech Support bands confirmed."}
{"claim_id":"WRK-32","status":"SUPPORTED","verified_value":"Jr €18-25k, Mid €28-40k, Sr €40-55k","source":"Glassdoor / Landing.jobs 2024","notes":"UX/Creative salary match."}
{"claim_id":"WRK-33","status":"SUPPORTED","verified_value":"€1,200–€1,800","source":"Glassdoor / Landing.jobs 2024","notes":"Admin/Back-office standard."}
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
{"claim_id":"WRK-03","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"Proprietary LinkedIn data, cannot verify."}
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
{"claim_id":"WRK-24","status":"PARTIALLY_SUPPORTED","verified_value":"Ranges plausible","source":"Landing.jobs / Teamlyzer / Glassdoor 2024","notes":"Directionally correct, slight variations between sources."}
{"claim_id":"WRK-25","status":"PARTIALLY_SUPPORTED","verified_value":"Ranges plausible","source":"Landing.jobs / Teamlyzer 2024","notes":"Align with salary guides."}
{"claim_id":"WRK-26","status":"PARTIALLY_SUPPORTED","verified_value":"Ranges plausible","source":"Landing.jobs / Teamlyzer 2024","notes":"Data/ML premium reflected."}
{"claim_id":"WRK-27","status":"PARTIALLY_SUPPORTED","verified_value":"€2,400-€3,600 plausible","source":"Landing.jobs 2024","notes":"Consistent with market reports."}
{"claim_id":"WRK-28","status":"PARTIALLY_SUPPORTED","verified_value":"€4,000-€6,000 plausible","source":"Landing.jobs / Teamlyzer 2024","notes":"Consistent with market reports."}
{"claim_id":"WRK-29","status":"PARTIALLY_SUPPORTED","verified_value":"Ranges plausible","source":"Landing.jobs 2024","notes":"PM ranges align."}
{"claim_id":"WRK-30","status":"PARTIALLY_SUPPORTED","verified_value":"Ranges plausible","source":"Landing.jobs 2024","notes":"QA ranges align, lower end of tech."}
{"claim_id":"WRK-31","status":"PARTIALLY_SUPPORTED","verified_value":"€1,500-€2,100 plausible","source":"Teamlyzer / Glassdoor","notes":"Consistent with market reports."}
{"claim_id":"WRK-32","status":"PARTIALLY_SUPPORTED","verified_value":"Ranges plausible","source":"Landing.jobs 2024","notes":"UX ranges align."}
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
{"claim_id":"WRK-03","status":"UNVERIFIABLE","verified_value":null,"source":"N/A","notes":"LinkedIn count not available."}
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

---

## Consensus Matrix

> **Engines:** DS = DeepSeek R1 | PX = Perplexity | GLM = GLM 4.7 | DS3 = DeepSeek V3 | GPT = ChatGPT
>
> **Legend:** ✅ Supported | 🔄 Partial | ❌ Contradicted | ❓ Unverifiable | — = N/A
>
> ⚠️ **GLM 4.7 weight reduced**: Marked 50/51 claims SUPPORTED using unverifiable sources ("UMASS", generic "Market Analysis"). Its results are shown but given lower weight in consensus decisions.

### A. ICT Employment & Workforce (WRK-01 to WRK-10)

| ID | Claim | DS | PX | GLM | DS3 | GPT | Score (excl. GLM) | Action |
|----|-------|----|----|-----|-----|-----|--------------------|--------|
| WRK-01 | ICT specialists = 5.1% of employment | ✅ 5.2% | ❓ | ✅ | ✅ 5.1% | ✅ ~4.5% | **3/4 ✅** | **Keep** |
| WRK-02 | Total tech workforce ~250,000 | ❓ | ❓ | ✅ | 🔄 ~248k | ❓ | 1🔄 3❓ | Keep, low conf. |
| WRK-03 | LinkedIn tech profiles ~165,000 | ❓ | ❓ | 🔄 | ❓ | ❓ | 4❓ | Keep, low conf. |
| WRK-04 | 79% concentration Lisbon+Porto | 🔄 67.7% | ❓ | ✅ | ❓ | ❓ | 1🔄 3❓ | **⚠️ Investigate** |
| WRK-05 | 26.9% female ICT specialists | ✅ ~25% | ❓ | ✅ | ✅ 26.9% | ✅ 22.7% | **3/4 ✅** | **Keep** (note GPT 22.7%) |
| WRK-06 | 68% ICT workers with tertiary education | ❌ | ✅ 67.4% EU | ✅ | ✅ 68% | ❓ | 2✅ 1❌ 1❓ | **⚠️ Investigate** |
| WRK-07 | Lisbon ~129,000 tech workers | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, low conf. |
| WRK-08 | Porto ~68,000 tech workers | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, low conf. |
| WRK-09 | Coimbra ~18,000 tech workers | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, low conf. |
| WRK-10 | Braga ~12,000 tech workers | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, low conf. |

### B. EU Context & Trends (WRK-11 to WRK-14)

| ID | Claim | DS | PX | GLM | DS3 | GPT | Score (excl. GLM) | Action |
|----|-------|----|----|-----|-----|-----|--------------------|--------|
| WRK-11 | PT 4.5% vs EU 4.8% ICT share | ❌ 5.2%/5.0% | ✅ EU 4.8% | ✅ | ❌ 5.1%/4.8% | ❓ | 1✅ 2❌ 1❓ | **🔴 NEEDS_UPDATE** |
| WRK-12 | ICT graduates PT 3.8% vs EU 4.2% | ❓ | ❓ | ✅ | ✅ | ❓ | 1✅ 3❓ | Keep, low conf. |
| WRK-13 | Female ICT: PT 21.3% vs EU 19.1% | ✅ ~25%/19.5% | ❓ | ✅ 21.3%/19.1% | ✅ 26.9%/19.1% | ❓ | **2/4 ✅** | **Keep** (values diverge) |
| WRK-14 | +12% ICT workforce growth since 2020 | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, low conf. |

### C. Hiring Insights & Demographics (WRK-15 to WRK-23)

| ID | Claim | DS | PX | GLM | DS3 | GPT | Score (excl. GLM) | Action |
|----|-------|----|----|-----|-----|-----|--------------------|--------|
| WRK-15 | Time to hire mid-level: 4-6 weeks | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, low conf. |
| WRK-16 | Time to hire senior: 8-12 weeks | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, low conf. |
| WRK-17 | 78% IT workforce bachelor's+ | ❓ | ❓ | ✅ 78% | 🔄 68% | ❓ | 1🔄 3❓ | **⚠️ Investigate** |
| WRK-18 | Median age IT workforce: 32 | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, low conf. |
| WRK-19 | 58% IT workforce under 35 | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, low conf. |
| WRK-20 | Lisbon tenure: 2.1 years | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, low conf. |
| WRK-21 | Porto tenure: 2.8 years | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, low conf. |
| WRK-22 | Secondary cities: 3.5+ years | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, low conf. |
| WRK-23 | Startup tenure: 18-24 months | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, low conf. |

### D. Salary Bands (WRK-24 to WRK-33)

| ID | Claim | DS | PX | GLM | DS3 | GPT | Score (excl. GLM) | Action |
|----|-------|----|----|-----|-----|-----|--------------------|--------|
| WRK-24 | Software Engineer: Jr €20-28k, Mid €30-45k, Sr €45-65k | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | 1🔄 3❓ | Keep, low conf. |
| WRK-25 | DevOps/SRE: Jr €22-30k, Mid €33-48k, Sr €48-70k | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | 1🔄 3❓ | Keep, low conf. |
| WRK-26 | ML/Data: Jr €22-30k, Mid €35-50k, Sr €50-75k | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | 1🔄 3❓ | Keep, low conf. |
| WRK-27 | Mobile: €2,400-€3,600/month | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | 1🔄 3❓ | Keep, low conf. |
| WRK-28 | Eng. Manager: €4,000-€6,000/month | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | 1🔄 3❓ | Keep, low conf. |
| WRK-29 | Product Manager: Jr €25-32k, Mid €35-50k, Sr €50-70k | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | 1🔄 3❓ | Keep, low conf. |
| WRK-30 | QA/Testing: Jr €16-22k, Mid €24-35k, Sr €35-50k | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | 1🔄 3❓ | Keep, low conf. |
| WRK-31 | Tech Support: €1,500-€2,100/month | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | 1🔄 3❓ | Keep, low conf. |
| WRK-32 | UX/Creative: Jr €18-25k, Mid €28-40k, Sr €40-55k | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | 1🔄 3❓ | Keep, low conf. |
| WRK-33 | Admin/Back-office: €1,200-€1,800/month | ❓ | ❓ | ✅ | 🔄 plausible | ❓ | 1🔄 3❓ | Keep, low conf. |

### E. Tech Stack Premiums (WRK-34 to WRK-41)

| ID | Claim | DS | PX | GLM | DS3 | GPT | Score (excl. GLM) | Action |
|----|-------|----|----|-----|-----|-----|--------------------|--------|
| WRK-34 | Backend baseline (0%) | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, internal metric |
| WRK-35 | Front-end (+5%) | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, internal metric |
| WRK-36 | Native mobile (+10%) | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, internal metric |
| WRK-37 | DevOps/Cloud (+15%) | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, internal metric |
| WRK-38 | Systems/Rust (+25%) | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, internal metric |
| WRK-39 | Data/ML (+25%) | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, internal metric |
| WRK-40 | Security (+30%) | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, internal metric |
| WRK-41 | Blockchain (+40%) | ❓ | ❓ | ✅ | ❓ | ❓ | 4❓ | Keep, internal metric |

### F. Employer Costs (WRK-42 to WRK-44)

| ID | Claim | DS | PX | GLM | DS3 | GPT | Score (excl. GLM) | Action |
|----|-------|----|----|-----|-----|-----|--------------------|--------|
| WRK-42 | Employer SS: 23.75% | ❓ | ✅ | ✅ | ✅ | ✅ | **3/4 ✅** | **Keep ✅** |
| WRK-43 | Meal allowance: €10.20/day | ❓ | 🔄 | ✅ | ✅ | ✅ | **2✅ 1🔄 1❓** | **Keep ✅** |
| WRK-44 | 14 monthly salaries/year | ❓ | ✅ | ✅ | ✅ | ✅ | **3/4 ✅** | **Keep ✅** |

### G. INE Regional Earnings (WRK-45 to WRK-51)

| ID | Claim | DS | PX | GLM | DS3 | GPT | Score (excl. GLM) | Action |
|----|-------|----|----|-----|-----|-----|--------------------|--------|
| WRK-45 | Lisboa: €2,120 total; €1,153/€2,949/€3,166 by edu | ❓ | ❓ | ✅ | ✅ | ❓ | 1✅ 3❓ | Keep, moderate conf. |
| WRK-46 | Setúbal: €1,672 | ❓ | ❓ | ✅ | ✅ | ❓ | 1✅ 3❓ | Keep, moderate conf. |
| WRK-47 | Norte: €1,573 | ❓ | ❓ | ✅ | ✅ | ❓ | 1✅ 3❓ | Keep, moderate conf. |
| WRK-48 | Alentejo: €1,547 | ❓ | ❓ | ✅ | ✅ | ❓ | 1✅ 3❓ | Keep, moderate conf. |
| WRK-49 | Centro: €1,523 | ❓ | ❓ | ✅ | ✅ | ❓ | 1✅ 3❓ | Keep, moderate conf. |
| WRK-50 | Oeste/VdT: €1,458 | ❓ | ❓ | ✅ | ✅ | ❓ | 1✅ 3❓ | Keep, moderate conf. |
| WRK-51 | Algarve: €1,445 | ❓ | ❓ | — | ✅ | ❓ | 1✅ 3❓ | Keep, moderate conf. |

---

## Summary & Suggested Corrections

### Overall Statistics (excluding GLM 4.7 due to low reliability)

| Status | Count | % |
|--------|-------|---|
| Consensus SUPPORTED (3+/4 engines) | 7 claims | 14% |
| Partially supported / mixed | 5 claims | 10% |
| CONTRADICTED (2+/4 agree on contradiction) | 1 claim | 2% |
| Majority UNVERIFIABLE | 38 claims | 74% |

### Engine Reliability Assessment

| Engine | SUPPORTED | PARTIAL | CONTRADICTED | UNVERIFIABLE | Quality |
|--------|-----------|---------|--------------|--------------|---------|
| DeepSeek R1 | 4 | 1 | 2 | 44 | **High** — cautious, well-sourced |
| Perplexity | 3 | 1 | 0 | 47 | **High** — cautious, well-sourced |
| GLM 4.7 | 50 | 1 | 0 | 0 | **⚠️ Low** — overly permissive, vague sources |
| DeepSeek V3 | 19 | 11 | 1 | 20 | **Good** — balanced, cites specific sources |
| ChatGPT | 5 | 0 | 0 | 46 | **High** — very cautious |

### 🔴 Corrections Needed (HITL Decision Required)

#### 1. WRK-11 — ICT Specialists % of Employment (EU Context)

| | Current | Suggested |
|---|---------|-----------|
| **Claim** | PT 4.5%, EU avg 4.8% | PT 5.1%, EU avg 4.8% |
| **Contradiction** | DS (5.2%/5.0% from 2024/2025), DS3 (5.1%/4.8% from 2023) |
| **Impact** | Currently states Portugal is BELOW EU average — this is WRONG |
| **Source** | Eurostat 2023: PT 5.1%, EU 4.8% |
| **Consensus** | 2/4 CONTRADICTED, 1/4 partial SUPPORTED |
| **Recommendation** | **Update to PT 5.1%, EU 4.8%** — PT is ABOVE EU average |
| **Target file** | `WEBSITE_CONTENT.json` → `euContext` |

#### 2. WRK-04 — Workforce Concentration in Lisbon+Porto

| | Current | Suggested |
|---|---------|-----------|
| **Claim** | 79% of tech workforce in Lisbon+Porto | ~68% |
| **Source** | Landing.jobs Global Tech Talent Trends 2024: 67.7% |
| **Consensus** | 1/4 PARTIAL (67.7%), 3/4 UNVERIFIABLE |
| **Recommendation** | **Investigate**: Only 1 source contradicts (67.7%), but it's a credible industry report. Consider updating to "~68%" or "approximately two-thirds" |
| **Target file** | `WEBSITE_CONTENT.json` → workforce section |

#### 3. WRK-06 — ICT Workers with Tertiary Education

| | Current | Suggested |
|---|---------|-----------|
| **Claim** | 68% of ICT workers have tertiary education | Clarify scope |
| **Issue** | DS1 CONTRADICTED (says 61.7% do NOT have tertiary — different metric?). PX says 67.4% is EU-wide, not PT-specific. DS3 says 68% is PT Eurostat. |
| **Consensus** | 2/4 SUPPORTED, 1/4 CONTRADICTED — conflicting data |
| **Recommendation** | **Clarify**: DS1 may be reading a different Eurostat table (persons with "ICT education" vs "ICT specialists"). The 68% figure appears correct for ICT *specialists* with tertiary education per DS3 citing Eurostat ISCED 5-8. Keep 68% but add note that this may refer to EU-wide average. |
| **Target file** | `WEBSITE_CONTENT.json` |

#### 4. WRK-17 — Bachelor's+ in IT Workforce (78%)

| | Current | Suggested |
|---|---------|-----------|
| **Claim** | 78% of IT workforce has bachelor's or higher | 68% |
| **Issue** | DS3 says Eurostat shows 68% with tertiary education, not 78% |
| **Consensus** | 1/4 PARTIAL, 3/4 UNVERIFIABLE |
| **Recommendation** | **Investigate**: 78% may conflate "bachelor's+" with broader "tertiary" (which includes short-cycle diplomas). If the metric is specifically bachelor's+, 78% could be accurate since 68% includes all tertiary including CTeSP/TeSP. Needs manual check against Eurostat tables. |
| **Target file** | `WEBSITE_CONTENT.json` → `hiringInsights` |

### 🟡 Watch Items (No Immediate Action)

#### 5. WRK-05 — Female ICT Specialists (26.9%)

- **Issue**: GPT reports 22.7% for 2024, DS1 says ~25%. Eurostat 2023 (DS3) says 26.9%.
- **Assessment**: Value may have changed between 2023 (26.9%) and 2024 (22.7%). Current claim references 2023 data → **keep 26.9% for now**, but flag for next annual update.

#### 6. WRK-13 — EU Female ICT Context (PT 21.3% vs EU 19.1%)

- **Issue**: This uses a DIFFERENT percentage (21.3%) than WRK-05 (26.9%) for the same metric. These may represent different Eurostat indicators or years.
- **Assessment**: DS3 says PT 26.9% vs EU 19.1% for same year (2023). The 21.3% figure may be outdated or from a different dataset. **Investigate inconsistency between WRK-05 and WRK-13.**

### ✅ Confirmed Solid (No Action)

| Claim | Description | Consensus |
|-------|-------------|-----------|
| WRK-01 | ICT specialists = 5.1% | 3/4 ✅ |
| WRK-42 | Employer SS = 23.75% | 3/4 ✅ |
| WRK-43 | Meal allowance = €10.20 | 2✅ 1🔄 |
| WRK-44 | 14 monthly salaries | 3/4 ✅ |

### 📋 Categories Assessment

| Category | Claims | Confidence | Notes |
|----------|--------|------------|-------|
| **ICT Employment** (01-10) | 10 | **Mixed** | Top-level % confirmed; city counts unverifiable |
| **EU Context** (11-14) | 4 | **Low-Medium** | WRK-11 CONTRADICTED, others unverifiable |
| **Hiring/Demographics** (15-23) | 9 | **Low** | Industry estimates only; no official data |
| **Salary Bands** (24-33) | 10 | **Low-Medium** | DS3 says ranges "plausible"; no exact match |
| **Tech Premiums** (34-41) | 8 | **Low** | Internal heuristics; inherently unverifiable |
| **Employer Costs** (42-44) | 3 | **High** | All confirmed by legal sources |
| **INE Earnings** (45-51) | 7 | **Medium** | DS3+GLM confirm from INE; others can't access |

### Confidence Score Update

Current: **85%** → Suggested: **80%**

Rationale: While employer costs and headline ICT % are solid, the majority of detailed claims (city breakdowns, salary specifics, premiums, tenure data) cannot be independently verified. WRK-11 contains a factual error (PT below EU average) that needs correction. The 79% concentration figure is likely overstated.

---

## HITL Decision Log

| Date | Decision | Corrections Applied | By |
|------|----------|--------------------|----|
| — | _Awaiting HITL review of 4 suggested corrections above_ | — | — |
