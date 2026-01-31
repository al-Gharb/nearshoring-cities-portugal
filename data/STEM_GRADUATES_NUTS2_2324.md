# Portugal STEM Graduates by NUTS II Region

## Data Overview

| Field | Value |
|-------|-------|
| **Source** | DGEEC – Direção-Geral de Estatísticas da Educação e Ciência |
| **Academic Year** | 2023/24 |
| **Classification** | NUTS 2024 (Level II) |
| **Scope** | Higher Education Graduates (Diplomados do Ensino Superior) |
| **Categories** | Core STEM including ICT |

---

## Raw Data (Portuguese Original)

| Região               | Área                                                | Total |
| -------------------- | --------------------------------------------------- | ----- |
| Norte                | Ciências naturais, matemática e estatística         | 1752  |
| Norte                | Tecnologias da informação e comunicação (TICs)      | 1246  |
| Norte                | Engenharia, indústrias transformadoras e construção | 7046  |
| Centro               | Ciências naturais, matemática e estatística         | 1390  |
| Centro               | Tecnologias da informação e comunicação (TICs)      | 496   |
| Centro               | Engenharia, indústrias transformadoras e construção | 3956  |
| Oeste e Vale do Tejo | Ciências naturais, matemática e estatística         | 88    |
| Oeste e Vale do Tejo | Tecnologias da informação e comunicação (TICs)      | 149   |
| Oeste e Vale do Tejo | Engenharia, indústrias transformadoras e construção | 123   |
| Grande Lisboa        | Ciências naturais, matemática e estatística         | 1960  |
| Grande Lisboa        | Tecnologias da informação e comunicação (TICs)      | 1103  |
| Grande Lisboa        | Engenharia, indústrias transformadoras e construção | 5026  |
| Península de Setúbal | Ciências naturais, matemática e estatística         | 465   |
| Península de Setúbal | Tecnologias da informação e comunicação (TICs)      | 195   |
| Península de Setúbal | Engenharia, indústrias transformadoras e construção | 1843  |
| Alentejo             | Ciências naturais, matemática e estatística         | 171   |
| Alentejo             | Tecnologias da informação e comunicação (TICs)      | 45    |
| Alentejo             | Engenharia, indústrias transformadoras e construção | 219   |
| Algarve              | Ciências naturais, matemática e estatística         | 421   |
| Algarve              | Tecnologias da informação e comunicação (TICs)      | 33    |
| Algarve              | Engenharia, indústrias transformadoras e construção | 263   |

---

## Aggregated by Region

| NUTS II Region       | Natural Sciences | ICT   | Engineering | **Total STEM** |
|----------------------|------------------|-------|-------------|----------------|
| Norte                | 1,752            | 1,246 | 7,046       | **10,044**     |
| Grande Lisboa        | 1,960            | 1,103 | 5,026       | **8,089**      |
| Centro               | 1,390            | 496   | 3,956       | **5,842**      |
| Península de Setúbal | 465              | 195   | 1,843       | **2,503**      |
| Algarve              | 421              | 33    | 263         | **717**        |
| Alentejo             | 171              | 45    | 219         | **435**        |
| Oeste e Vale do Tejo | 88               | 149   | 123         | **360**        |
| **Portugal Total**   | **6,247**        | **3,267** | **18,476** | **27,990**    |

---

## Category Translations

| Portuguese (Original)                               | English                                          | Abbrev. |
|-----------------------------------------------------|--------------------------------------------------|---------|
| Ciências naturais, matemática e estatística         | Natural Sciences, Mathematics & Statistics       | STEM-NS |
| Tecnologias da informação e comunicação (TICs)      | Information & Communication Technologies         | ICT     |
| Engenharia, indústrias transformadoras e construção | Engineering, Manufacturing & Construction        | ENG     |

---

## NUTS II Region Mapping

| Portuguese Name      | English Name (used in app)    | Main Cities              |
|----------------------|-------------------------------|--------------------------|
| Norte                | Norte                         | Porto, Braga, Guimarães  |
| Centro               | Centro                        | Coimbra, Aveiro, Covilhã |
| Oeste e Vale do Tejo | Oeste and Vale do Tejo        | Leiria, Santarém         |
| Grande Lisboa        | Lisbon Metropolitan Area      | Lisbon                   |
| Península de Setúbal | Península de Setúbal          | Setúbal, Almada          |
| Alentejo             | Alentejo                      | Évora, Beja              |
| Algarve              | Algarve                       | Faro                     |

---

## Usage in Application

This data is used in `index.html` for the interactive Portugal map region tooltips:

```javascript
const stemGradsByRegion = {
    'Norte': { total: 10044, ict: 1246 },
    'Centro': { total: 5842, ict: 496 },
    'Oeste and Vale do Tejo': { total: 360, ict: 149 },
    'Lisbon Metropolitan Area': { total: 8089, ict: 1103 },
    'Península de Setúbal': { total: 2503, ict: 195 },
    'Alentejo': { total: 435, ict: 45 },
    'Algarve': { total: 717, ict: 33 }
};
```

---

## Notes

1. **NUTS 2024**: Nomenclature of Territorial Units for Statistics, updated classification effective 2024
2. **Excludes**: Azores (Região Autónoma dos Açores) and Madeira (Região Autónoma da Madeira) – not relevant for mainland nearshoring analysis
3. **ICT Focus**: For IT nearshoring purposes, the ICT column is most directly relevant, though Engineering graduates often transition into software roles
4. **Academic Year**: 2023/24 represents the most recent complete academic year data available

---

## Data Retrieval

- **Portal**: [DGEEC Estatísticas da Educação](https://www.dgeec.medu.pt/)
- **Dataset**: Diplomados do Ensino Superior por NUTS II e Área de Educação e Formação
- **Retrieved**: January 2026
