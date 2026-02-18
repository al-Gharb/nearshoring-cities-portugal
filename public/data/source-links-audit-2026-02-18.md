# Source Link Audit — 2026-02-18

Scope: `src/index.html` source anchors (`#src-*`), source registry entries, and external source URLs.

## 1) Internal Anchor Integrity (`#src-*`)

- Unique source anchors referenced in content: **20**
- Unique source IDs defined in source registry: **29**
- Broken internal source references (referenced but not defined): **2**

### Broken references
1. `#src-linkedin` (used in workforce cards)
   - Used at `src/index.html` lines 2276, 2281, 2286
   - No matching `<div id="src-linkedin">` in source registry

2. `#src-pwc-cit-rates-reduction-2025` (used in strategic/tax card)
   - Used at `src/index.html` lines 1750, 1754
   - Existing defined ID is `#src-pwc-cit-irc` (line 749)

## 2) External Source URL Health

Validation method: HEAD request, fallback GET, redirect-follow enabled.

### Status summary
- URL-backed source entries: **24**
- Reachable (`200`): **20**
- Blocked (`403`): **2**
- Not found (`404`): **1**
- Unresolved (`ERROR`): **1**
- Internal-method entries with no external URL by design: **5** (`src-col-index`, `src-ict-pct`, `src-idc`, `src-salary-index`, `src-tech-stemplus`)

### Non-200 entries requiring attention
- `src-cloudflare` → `https://radar.cloudflare.com` → **403** (anti-bot blocking in automated checks)
- `src-idealista` → `https://www.idealista.pt` → **403** (anti-bot blocking in automated checks)
- `src-startcampus` → `https://startcampus.pt/` → **404** (wrong host variant)
- `src-ehci` → `https://healthpowerhouse.com/publications/` → **ERROR** (unreliable/unavailable at check time)

## 3) Deep-Link Quality (topic-level vs homepage)

The following source entries currently point to root/home pages (not deep topic pages):
- `src-a3es`
- `src-anacom`
- `src-ecb`
- `src-porto-sines`
- `src-startcampus`
- `src-telegeography`
- `src-cloudflare`
- `src-idealista`

## 4) Officialness Review (strict official-only standard)

If the standard is **official public institutions only**, these entries should be replaced or explicitly marked as non-official supplementary:
- `src-numbeo` (crowdsourced private)
- `src-idealista` (private marketplace)
- `src-damia-2025` (private benchmark)
- `src-idc` (private analyst)
- `src-cloudflare` (private network telemetry)
- `src-telegeography` (private map/provider)
- `src-pwc-ifici`, `src-pwc-cit-irc` (advisory interpretation, non-official legal publisher)
- `src-gpi`, `src-efepi` (institutional indexes, not Portuguese/EU official statistics offices)

## 5) Freshness / Currency Risk

- `src-ehci` cites 2018 data; this is materially stale for 2026 positioning.
- Multiple entries still state 2024 values (`GPI`, `EF EPI`, `Start Campus`, `Porto de Sines`, `IDC` references in narrative); verify if 2025/2026 releases exist before retaining current wording.

## 6) Verified Deep-Link Replacement Suggestions (tested `200`)

Below links were validated during this audit and are suitable as deeper topic-level targets.

### A3ES
- Current: `https://www.a3es.pt`
- Suggested deep official: `https://a3es.pt/pt/avaliacao-e-acreditacao/resultados-dos-processo-de-avaliacao-e-acreditacao/acreditacao-de-ciclos-de-estudos/`

### ANACOM
- Current: `https://www.anacom.pt`
- Suggested deep official (statistics): `https://www.anacom.pt/render.jsp?categoryId=520`
- Suggested deep official (electronic communications area): `https://www.anacom.pt/render.jsp?categoryId=361115`

### ECB
- Current: `https://www.ecb.europa.eu`
- Suggested deep official (policy rates): `https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html`
- Suggested deep official (yield curves): `https://www.ecb.europa.eu/stats/financial_markets_and_interest_rates/euro_area_yield_curves/html/index.en.html`

### Start Campus
- Current: `https://startcampus.pt/` (404)
- Suggested host fix + deep topic page: `https://www.startcampus.pt/sines`

### Port of Sines (APS)
- Current: `https://www.portodesines.pt/`
- Suggested deep official page: `https://www.apsinesalgarve.pt/porto-de-sines`

### TeleGeography (non-official but deep)
- Current: `https://www.submarinecablemap.com`
- Suggested deep topical page: `https://www.submarinecablemap.com/landing-point/sines-portugal`

### Workforce metrics currently linked to missing `#src-linkedin`
- Prefer official Eurostat deep tables:
  - ICT specialists in employment: `https://ec.europa.eu/eurostat/databrowser/view/isoc_sks_itspt/default/table?lang=en`
  - Female ICT specialists: `https://ec.europa.eu/eurostat/databrowser/view/isoc_sks_itsps/default/table?lang=en`
  - Graduates by field (ISCED): `https://ec.europa.eu/eurostat/databrowser/view/educ_uoe_grad04/default/table?lang=en`

### Healthcare (replace stale EHCI dependency)
- Suggested official EU source hub: `https://health.ec.europa.eu/state-health-eu/country-health-profiles_en`

## 7) Additional Consistency Issues

- There are direct external source links in content that bypass source anchor IDs:
  - EURES direct link in salary methodology paragraph (`src/index.html` line 1784)
  - Damia PDF direct link in callout (`src/index.html` line 1806)
- Recommendation: route all source links through `#src-*` entries for one-source-of-truth maintenance.

## 8) Priority Fix Order

1. Fix broken internal IDs (`src-linkedin`, `src-pwc-cit-rates-reduction-2025`)
2. Replace `src-startcampus` URL host/path with working deep URL
3. Upgrade root-level URLs to deep topic URLs (A3ES, ANACOM, ECB, Porto de Sines)
4. Decide policy on non-official sources (keep with explicit label vs replace with official alternatives)
5. Update stale healthcare claim/source (`EHCI 2018`) to an active official dataset/profile

---
Generated by automated + manual audit in workspace on 2026-02-18.
No content changes applied yet, and no push performed.
