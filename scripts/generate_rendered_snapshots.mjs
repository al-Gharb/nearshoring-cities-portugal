import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { calculateICTPct, computeAllSalaryIndices, computeAllTechStemPlus } from '../src/scripts/modules/calculations.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const MASTER_PATH = path.join(REPO_ROOT, 'public/data/normalized/MASTER.json');
const COMPENSATION_PATH = path.join(REPO_ROOT, 'public/data/normalized/COMPENSATION_DATA.json');
const CITY_TABLE_PATH = path.join(REPO_ROOT, 'public/data/rendered/city_table.json');
const BUBBLE_CHART_PATH = path.join(REPO_ROOT, 'public/data/rendered/bubble_chart.json');

const CHECK_MODE = process.argv.includes('--check');

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function assertNumber(value, label) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`Invalid number for ${label}`);
  }
  return value;
}

function assertString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`Invalid string for ${label}`);
  }
  return value;
}

function formatRange(min, max) {
  if (min == null || max == null) return '-';
  return `${min}-${max}`;
}

function buildCityTable(master) {
  const generatedAt = assertString(master?._meta?.lastUpdated, 'MASTER._meta.lastUpdated');
  const displayOrder = master?.config?.displayOrder;
  const regionOrder = master?.config?.regionOrder;
  const cities = master?.cities;

  if (!Array.isArray(displayOrder) || displayOrder.length === 0) {
    throw new Error('MASTER.config.displayOrder is missing or empty');
  }
  if (!Array.isArray(regionOrder) || regionOrder.length === 0) {
    throw new Error('MASTER.config.regionOrder is missing or empty');
  }
  if (!cities || typeof cities !== 'object') {
    throw new Error('MASTER.cities is missing');
  }

  const rows = displayOrder.map((cityId) => {
    const city = cities[cityId];
    if (!city) throw new Error(`City not found in MASTER.cities: ${cityId}`);

    const grads = city?.talent?.graduates || {};
    const costs = city?.costs || {};

    const name = assertString(city?.basic?.name?.value, `${cityId}.basic.name.value`);
    const region = assertString(city?.basic?.region?.value, `${cityId}.basic.region.value`);
    const nutsCode = assertString(city?.basic?.region?.nutsCode, `${cityId}.basic.region.nutsCode`);

    const stemGrads = assertNumber(
      grads?.digitalStemPlus?.value ?? grads?.officialStem?.value,
      `${cityId}.graduates.digitalStemPlus.value`
    );
    const ictGrads = assertNumber(grads?.coreICT?.value, `${cityId}.graduates.coreICT.value`);
    const officialStem = assertNumber(grads?.officialStem?.value, `${cityId}.graduates.officialStem.value`);

    return {
      id: cityId,
      name,
      region,
      nutsCode,
      featured: city?.basic?.featured === true,
      universities: Array.isArray(city?.talent?.universities?.value)
        ? city.talent.universities.value
        : [],
      stemGrads,
      ictGrads,
      ictPct: Number(calculateICTPct(ictGrads, officialStem)),
      salaryIndex: assertNumber(costs?.salaryIndex?.value, `${cityId}.costs.salaryIndex.value`),
      officeRent: formatRange(costs?.officeRent?.min, costs?.officeRent?.max),
      residentialRent: formatRange(costs?.residentialRent?.min, costs?.residentialRent?.max),
      colIndex: assertNumber(costs?.colIndex?.value, `${cityId}.costs.colIndex.value`),
    };
  });

  const regionSummaries = regionOrder.map((region) => {
    const regionRows = rows.filter((row) => row.region === region);
    const stemTotal = regionRows.reduce((sum, row) => sum + row.stemGrads, 0);
    const ictTotal = regionRows.reduce((sum, row) => sum + row.ictGrads, 0);

    return {
      region,
      cityCount: regionRows.length,
      stemTotal,
      ictTotal,
      ictPct: stemTotal > 0 ? Number(((ictTotal / stemTotal) * 100).toFixed(1)) : 0,
    };
  });

  const totals = {
    cities: rows.length,
    stemGrads: rows.reduce((sum, row) => sum + row.stemGrads, 0),
    ictGrads: rows.reduce((sum, row) => sum + row.ictGrads, 0),
  };

  return {
    _meta: {
      generatedAt,
      source: 'MASTER.json',
    },
    regionOrder,
    regionSummaries,
    rows,
    totals,
  };
}

function buildBubbleChart(master) {
  const generatedAt = assertString(master?._meta?.lastUpdated, 'MASTER._meta.lastUpdated');

  const cityConfig = master?.config?.chartConfig?.cityConfig;
  const labelOffsets = master?.config?.chartConfig?.labelOffsets || {};
  const cities = master?.cities;

  if (!cityConfig || typeof cityConfig !== 'object') {
    throw new Error('MASTER.config.chartConfig.cityConfig is missing');
  }
  if (!cities || typeof cities !== 'object') {
    throw new Error('MASTER.cities is missing');
  }

  // Contract: rendered bubble snapshot exports featured-city set only.
  const points = Object.entries(cityConfig).map(([cityId, config]) => {
    const city = cities[cityId];
    if (!city) throw new Error(`City in chartConfig not found in MASTER.cities: ${cityId}`);

    const grads = city?.talent?.graduates || {};
    const costs = city?.costs || {};

    return {
      id: cityId,
      name: assertString(config?.displayName ?? city?.basic?.name?.value, `${cityId}.displayName`),
      region: assertString(city?.basic?.region?.value, `${cityId}.basic.region.value`),
      featured: city?.basic?.featured === true,
      x: assertNumber(costs?.salaryIndex?.value, `${cityId}.costs.salaryIndex.value`),
      y: assertNumber(grads?.digitalStemPlus?.value ?? grads?.officialStem?.value, `${cityId}.graduates.digitalStemPlus.value`),
      r: assertNumber(grads?.coreICT?.value, `${cityId}.graduates.coreICT.value`),
      col: assertNumber(costs?.colIndex?.value, `${cityId}.costs.colIndex.value`),
      labelOffset: labelOffsets?.[cityId] || {},
    };
  });

  return {
    _meta: {
      generatedAt,
      source: 'MASTER.json',
    },
    xAxis: {
      label: 'Salary Index (Lisbon = 100)',
      field: 'salaryIndex',
    },
    yAxis: {
      label: 'Tech STEM+ Graduates',
      field: 'stemGrads',
    },
    bubbleSize: {
      label: 'Core ICT Graduates',
      field: 'ictGrads',
    },
    points,
  };
}

function stringifyJson(payload) {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

function writeIfChanged(filePath, nextContent) {
  const prevContent = existsSync(filePath) ? readFileSync(filePath, 'utf8') : null;
  if (prevContent === nextContent) return false;
  writeFileSync(filePath, nextContent, 'utf8');
  return true;
}

function checkMatches(filePath, expectedContent) {
  if (!existsSync(filePath)) {
    return { ok: false, reason: 'missing' };
  }
  const current = readFileSync(filePath, 'utf8');
  if (current !== expectedContent) {
    return { ok: false, reason: 'out-of-sync' };
  }
  return { ok: true, reason: 'ok' };
}

function main() {
  const master = readJson(MASTER_PATH);
  const compensation = readJson(COMPENSATION_PATH);

  // Mirror runtime initialization order so rendered outputs match app behavior.
  computeAllTechStemPlus(master);
  computeAllSalaryIndices(master, compensation);

  const cityTable = buildCityTable(master);
  const bubbleChart = buildBubbleChart(master);

  const nextCityTable = stringifyJson(cityTable);
  const nextBubbleChart = stringifyJson(bubbleChart);

  if (CHECK_MODE) {
    const checks = [
      [CITY_TABLE_PATH, checkMatches(CITY_TABLE_PATH, nextCityTable)],
      [BUBBLE_CHART_PATH, checkMatches(BUBBLE_CHART_PATH, nextBubbleChart)],
    ];

    const failed = checks.filter(([, result]) => !result.ok);
    if (failed.length > 0) {
      for (const [filePath, result] of failed) {
        const rel = path.relative(REPO_ROOT, filePath);
        console.error(`Rendered snapshot ${result.reason}: ${rel}`);
      }
      console.error('Run: npm run gen:rendered');
      process.exitCode = 1;
      return;
    }

    console.log('Rendered snapshots are in sync.');
    return;
  }

  const changedCityTable = writeIfChanged(CITY_TABLE_PATH, nextCityTable);
  const changedBubbleChart = writeIfChanged(BUBBLE_CHART_PATH, nextBubbleChart);

  if (!changedCityTable && !changedBubbleChart) {
    console.log('Rendered snapshots already up to date.');
    return;
  }

  if (changedCityTable) {
    console.log(`Updated ${path.relative(REPO_ROOT, CITY_TABLE_PATH)}`);
  }
  if (changedBubbleChart) {
    console.log(`Updated ${path.relative(REPO_ROOT, BUBBLE_CHART_PATH)}`);
  }
}

main();
