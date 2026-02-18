/**
 * BUBBLE CHART MODULE
 * D3.js scatter/bubble chart: Cost Pressure Index (x) vs STEM+ Graduates (y)
 *
 * X-axis: Cost Pressure Index = COL Index + Office Rent Midpoint + Salary Index
 * Y-axis: Annual Tech STEM+ graduate output
 * Bubble size: Proportional to STEM+ graduates (sqrt scale)
 * Color: Green → Yellow → Red gradient by cost pressure
 * Inner circle: Core ICT graduates (navy, proportional to ICT/STEM ratio)
 * Click: Navigates to city profile section
 *
 * Faithfully replicates legacy renderD3BubbleChart() from app.js.
 */

import * as d3 from 'd3';
import { getChartConfig, getCity } from './database.js';

/** Fixed SVG dimensions (responsive via viewBox) */
const SVG_WIDTH = 900;
const SVG_HEIGHT = 600;
const MARGIN = { top: 50, right: 50, bottom: 70, left: 80 };

/**
 * Build chart data from MASTER.json featured cities.
 * Computes the composite Cost Pressure Index per city.
 * @returns {Array<Object>}
 */
function buildChartData() {
  const chartConfig = getChartConfig();
  const cityConfigs = chartConfig.cityConfig || {};

  return Object.entries(cityConfigs).map(([id, config]) => {
    const city = getCity(id);
    if (!city) return null;

    const grads = city.talent?.graduates || {};
    const costs = city.costs || {};

    const stemPlus = grads.digitalStemPlus?.value ?? grads.officialStem?.value ?? 0;
    const ict = grads.coreICT?.value ?? 0;
    const officialStem = grads.officialStem?.value ?? 0;
    const colIndex = costs.colIndex?.value ?? 0;
    const salaryIndex = costs.salaryIndex?.value ?? 0;
    const officeRentMin = costs.officeRent?.min ?? 0;
    const officeRentMax = costs.officeRent?.max ?? 0;
    const officeRentMid = (officeRentMin + officeRentMax) / 2;

    // Cost Pressure Index: composite of COL + office rent midpoint + salary index
    const cost = colIndex + officeRentMid + salaryIndex;

    if (stemPlus <= 0) return null;

    return {
      id,
      name: config.displayName,
      cost,
      grads: stemPlus,
      ict,
      officialStem,
      salaryIndex,
      costIndex: colIndex,
      officeRentMid,
      nutsRegion: chartConfig.cityNutsRegion?.[id] ?? '',
      labelOffset: chartConfig.labelOffsets?.[id] ?? { position: 'above', extraPad: 5, anchor: 'middle' },
    };
  }).filter(Boolean);
}

/**
 * Create the tooltip DOM element inside the chart container.
 * Uses the same structure as the original: header with region badge + body with grad counts.
 * @param {HTMLElement} container
 * @returns {{ el: HTMLElement, title: HTMLElement, body: HTMLElement }}
 */
function createTooltip(container) {
  const el = document.createElement('div');
  el.id = 'cityTooltip';
  el.className = 'region-tooltip';
  el.style.display = 'none';
  el.innerHTML = `
    <div class="region-tooltip-header">
      <i class="fa-solid fa-circle-nodes"></i>
      <span id="cityTooltipTitle"></span>
    </div>
    <div class="region-tooltip-grads" id="cityTooltipBody"></div>
  `;
  container.appendChild(el);
  return {
    el,
    title: el.querySelector('#cityTooltipTitle'),
    body: el.querySelector('#cityTooltipBody'),
  };
}

/**
 * Render the D3 bubble chart into #d3-bubble-chart.
 * Called after databases are loaded.
 */
export function renderBubbleChart() {
  const container = document.getElementById('d3-bubble-chart');
  if (!container) return;

  const data = buildChartData();
  if (data.length === 0) {
    container.innerHTML = '<p class="chart-empty-msg">No chart data available — populate more cities in MASTER.json</p>';
    return;
  }

  // Clear previous content
  container.innerHTML = '';

  const width = SVG_WIDTH - MARGIN.left - MARGIN.right;
  const height = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

  // Tooltip
  const tooltip = createTooltip(container);

  // ── SVG ──
  const svg = d3.select(container)
    .append('svg')
    .attr('viewBox', `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', 'auto')
    .style('font-family', 'inherit');

  const g = svg.append('g')
    .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

  // ── Scales (symlog for both axes) ──
  const costExtent = d3.extent(data, d => d.cost);

  const x = d3.scaleSymlog()
    .domain([costExtent[0] * 0.9, costExtent[1] * 1.05])
    .range([0, width])
    .constant(3);

  const y = d3.scaleSymlog()
    .domain([0, 12000])
    .range([height, 0])
    .constant(1000);

  // Color: green (low cost) → yellow (mid) → red (high cost)
  const minCost = costExtent[0];
  const maxCost = costExtent[1];
  const midCost = (minCost + maxCost) / 2;

  const color = d3.scaleLinear()
    .domain([minCost, midCost, maxCost])
    .range(['#4CAF50', '#FFD700', '#FF5722']);

  // Bubble radius by STEM+ graduates
  const radius = d3.scaleSqrt()
    .domain([0, d3.max(data, d => d.grads)])
    .range([6, 28]);

  // ── Grid lines ──
  g.append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10).tickSize(-height).tickFormat(''))
    .selectAll('line')
    .attr('stroke', 'var(--border-color, #e2e8f0)')
    .attr('stroke-opacity', 0.5)
    .attr('stroke-dasharray', '3,3');

  g.append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(y).ticks(10).tickSize(-width).tickFormat(''))
    .selectAll('line')
    .attr('stroke', 'var(--border-color, #e2e8f0)')
    .attr('stroke-opacity', 0.5)
    .attr('stroke-dasharray', '3,3');

  // Remove grid domain lines
  g.selectAll('.grid .domain').remove();

  // ── X axis ──
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format('.0f')))
    .selectAll('text')
    .attr('fill', 'var(--text-color, #1e293b)')
    .attr('font-size', '11px');

  g.append('text')
    .attr('x', width / 2)
    .attr('y', height + 45)
    .attr('fill', 'var(--text-color, #1e293b)')
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px')
    .attr('font-weight', '700')
    .text('Cost Pressure Index → (symlog scale)');

  g.append('text')
    .attr('x', width / 2)
    .attr('y', height + 60)
    .attr('fill', 'var(--secondary-color, #64748b)')
    .attr('text-anchor', 'middle')
    .attr('font-size', '10px')
    .attr('font-style', 'italic')
    .text('COL + Rent Index + Office Rent Midpoint + Salary Index');

  // ── Y axis ──
  g.append('g')
    .call(d3.axisLeft(y).ticks(10).tickFormat(d => d >= 1000 ? (d / 1000) + 'k' : d))
    .selectAll('text')
    .attr('fill', 'var(--text-color, #1e293b)')
    .attr('font-size', '11px');

  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -60)
    .attr('fill', 'var(--text-color, #1e293b)')
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px')
    .attr('font-weight', '700')
    .text('Annual Tech STEM+ Output (symlog scale) →');

  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -45)
    .attr('fill', 'var(--secondary-color, #64748b)')
    .attr('text-anchor', 'middle')
    .attr('font-size', '10px')
    .attr('font-style', 'italic')
    .text('Tech STEM+ graduates entering the job market');

  // ── Tooltip functions ──
  const showTooltip = (event, d) => {
    if (!tooltip.el || !tooltip.title || !tooltip.body) return;

    const gradsLabel = d.grads.toLocaleString('en-US');
    const ictLabel = d.ict ? d.ict.toLocaleString('en-US') : '0';
    const costLabel = !isNaN(d.cost) ? d3.format('.0f')(d.cost) : '—';
    const officialStemLabel = d.officialStem ? d.officialStem.toLocaleString('en-US') : '—';
    const ictPct = d.officialStem > 0 ? ((d.ict / d.officialStem) * 100).toFixed(1) : '0.0';
    const regionBadge = d.nutsRegion
      ? `<span class="nuts-badge">${d.nutsRegion}</span>`
      : '';

    tooltip.title.innerHTML = `
      ${regionBadge}
      ${d.name}
      <span class="tooltip-cost-label">· Cost Pressure Index ${costLabel}</span>
    `;
    tooltip.body.innerHTML = `
      <span class="tooltip-grad-line"><i class="fa-solid fa-user-graduate"></i><i class="fa-solid fa-user"></i>
        ${gradsLabel} Tech STEM+ / yr</span>
      <span class="tooltip-grad-line tooltip-official"><i class="fa-solid fa-user-graduate"></i>${officialStemLabel} Official STEM</span>
      <span class="tooltip-grad-line tooltip-ict"><i class="fa-solid fa-user-graduate"></i><span class="ict-highlight">(${ictLabel} ICT · ${ictPct}%)</span></span>
    `;

    const containerRect = container.getBoundingClientRect();
    const xPos = event.clientX - containerRect.left;
    const yPos = event.clientY - containerRect.top;

    tooltip.el.style.left = `${xPos}px`;
    tooltip.el.style.top = `${yPos - 70}px`;
    tooltip.el.style.transform = 'translateX(-50%) translateY(0) scale(1)';
    tooltip.el.style.display = 'block';
    tooltip.el.classList.add('visible');
  };

  const hideTooltip = () => {
    if (!tooltip.el) return;
    tooltip.el.classList.remove('visible');
    tooltip.el.style.display = 'none';
  };

  // ── Draw bubbles as clickable groups ──
  const cityGroups = g.selectAll('.city')
    .data(data)
    .enter()
    .append('a')
    .attr('href', d => `#${d.id}`)
    .attr('class', 'city-bubble-link')
    .style('cursor', 'pointer')
    .append('g')
    .attr('class', 'city')
    .attr('transform', d => `translate(${x(d.cost)},${y(d.grads)})`);

  // Outer bubble = total Tech STEM+
  cityGroups.append('circle')
    .attr('class', 'outer-bubble')
    .attr('r', d => radius(d.grads))
    .attr('fill', d => color(d.cost))
    .attr('opacity', 0.7)
    .attr('stroke', 'white')
    .attr('stroke-width', 2.5)
    .style('transition', 'all 0.2s ease');

  // Inner core = Core ICT, proportional to outer bubble size
  cityGroups.append('circle')
    .attr('class', 'inner-bubble')
    .attr('r', d => {
      const outer = radius(d.grads) || 0;
      const ratio = d.officialStem > 0 ? Math.max(d.ict / d.officialStem, 0) : 0;
      // sqrt of ratio so small shares stay visible
      const inner = outer * Math.sqrt(ratio);
      return Math.max(4, inner);
    })
    .attr('fill', 'var(--ict-color, #22c55e)')
    .attr('opacity', 0.95)
    .attr('stroke', 'white')
    .attr('stroke-width', 1.5);

  // Hover on whole city group (so inner circle also triggers tooltip)
  cityGroups
    .on('mouseenter', function (event, d) {
      d3.select(this).select('.outer-bubble')
        .attr('opacity', 0.95)
        .attr('stroke-width', 3.5);
      showTooltip(event, d);
    })
    .on('mousemove', function (event, d) {
      showTooltip(event, d);
    })
    .on('mouseleave', function () {
      d3.select(this).select('.outer-bubble')
        .attr('opacity', 0.7)
        .attr('stroke-width', 2.5);
      hideTooltip();
    });

  // ── City name labels with per-city offset positioning ──
  cityGroups.append('text')
    .attr('x', d => {
      const off = d.labelOffset;
      if (off.position === 'right') return radius(d.grads) + (off.extraPad || 3);
      if (off.position === 'left') return -(radius(d.grads) + (off.extraPad || 3));
      return off.dx || 0;
    })
    .attr('y', d => {
      const off = d.labelOffset;
      if (off.position === 'above') return -(radius(d.grads) + (off.extraPad || 6));
      if (off.position === 'below') return radius(d.grads) + (off.extraPad || 12);
      return 4;
    })
    .attr('text-anchor', d => d.labelOffset.anchor || 'middle')
    .attr('fill', 'var(--text-color, #1e293b)')
    .attr('font-size', '13px')
    .attr('font-weight', '700')
    .attr('pointer-events', 'none')
    .style('text-shadow', '0 0 3px var(--card-bg, #fff), 0 0 5px var(--card-bg, #fff)')
    .text(d => d.name);
}
