# Fact-Check Verification Archive

> **Process:** For each category, generate the prompt from the website's Verification Archive,
> run it through 5–6 independent AI engines, then paste all JSONL results here.
> The agent builds a consensus matrix and proposes corrections. **HITL approves before any DB changes.**

---

## Workflow

```
1. Generate prompt   → Website → Verification Archive → Select Category → Generate
2. Run 5–6 engines   → Perplexity, Gemini Deep Research, ChatGPT-4/5, DeepSeek R1, Claude, Grok
3. Paste results      → Into the matching README in this folder
4. Agent builds       → Consensus matrix + suggested corrections
5. HITL reviews       → Approves ("GO") or rejects individual corrections
6. Agent implements   → Updates source JSON database(s)
7. Rebuild            → npm run build → verify on site
```

---

## Categories

### Data Categories (National / Sectoral)

| # | Category | File | Generator | Source DB(s) |
|---|----------|------|-----------|-------------|
| 01 | [Macroeconomic](macroeconomic.md) | `macroeconomic.md` | `generateMacroeconomicClaims(content)` | WEBSITE_CONTENT |
| 02 | [Digital Infrastructure](digital-infra.md) | `digital-infra.md` | `generateDigitalInfraClaims(content)` | WEBSITE_CONTENT |
| 03 | [Office Rent](office-rent.md) | `office-rent.md` | `generateOfficeRentClaims(master)` | MASTER |
| 04 | [Residential Rent](residential-rent.md) | `residential-rent.md` | `generateResidentialRentClaims(master)` | MASTER |
| 05 | [Workforce Talent](workforce.md) | `workforce.md` | `generateWorkforceClaims(content, compensation)` | WEBSITE_CONTENT + COMPENSATION_DATA |
| 06 | [Strategic & Tax](strategic-tax.md) | `strategic-tax.md` | `generateStrategicClaims(content)` | WEBSITE_CONTENT |
| 07 | [University Talent](university-talent.md) | `university-talent.md` | `generateUniversityTalentClaims(content)` | WEBSITE_CONTENT |
| 08 | [City Database (All)](city-database.md) | `city-database.md` | `generateCityDatabaseClaims(master)` | MASTER |

### City Profiles (10 Featured Cities)

| # | City | File | Generator | Source DB(s) |
|---|------|------|-----------|-------------|
| C1 | [Lisbon](city-lisbon.md) | `city-lisbon.md` | `generateCityClaimsFromSource('lisbon')` | CITY_PROFILES + MASTER |
| C2 | [Porto](city-porto.md) | `city-porto.md` | `generateCityClaimsFromSource('porto')` | CITY_PROFILES + MASTER |
| C3 | [Braga](city-braga.md) | `city-braga.md` | `generateCityClaimsFromSource('braga')` | CITY_PROFILES + MASTER |
| C4 | [Guimarães](city-guimaraes.md) | `city-guimaraes.md` | `generateCityClaimsFromSource('guimaraes')` | CITY_PROFILES + MASTER |
| C5 | [Coimbra](city-coimbra.md) | `city-coimbra.md` | `generateCityClaimsFromSource('coimbra')` | CITY_PROFILES + MASTER |
| C6 | [Aveiro](city-aveiro.md) | `city-aveiro.md` | `generateCityClaimsFromSource('aveiro')` | CITY_PROFILES + MASTER |
| C7 | [Covilhã](city-covilha.md) | `city-covilha.md` | `generateCityClaimsFromSource('covilha')` | CITY_PROFILES + MASTER |
| C8 | [Évora](city-evora.md) | `city-evora.md` | `generateCityClaimsFromSource('evora')` | CITY_PROFILES + MASTER |
| C9 | [Faro](city-faro.md) | `city-faro.md` | `generateCityClaimsFromSource('faro')` | CITY_PROFILES + MASTER |
| C10 | [Setúbal](city-setubal.md) | `city-setubal.md` | `generateCityClaimsFromSource('setubal')` | CITY_PROFILES + MASTER |

---

## Matrix Legend

| Status | Meaning |
|--------|---------|
| ✅ SUPPORTED | Value confirmed (within ±5%) |
| 🔄 NEEDS_UPDATE | Value outdated or incorrect — correction suggested |
| ❌ CONTRADICTED | Multiple sources contradict the claim |
| ❓ UNVERIFIABLE | Engine could not find a source to verify |

### Consensus Rules

- **4/5+ agree SUPPORTED** → Keep current value
- **3/5+ agree NEEDS_UPDATE** → Propose correction (HITL decides)
- **Mixed results** → Flag for manual research
- **All UNVERIFIABLE** → Keep but lower confidence score
