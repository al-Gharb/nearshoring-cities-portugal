/**
 * MAIN ENTRY POINT
 * 
 * Imports all modules, loads databases, then initializes the application.
 * This file is referenced by index.html as type="module".
 */

import { loadDatabases, getStore } from './modules/database.js';
import { computeAllSalaryIndices, computeAllTechStemPlus } from './modules/calculations.js';
import { initThemeToggle } from './modules/themeToggle.js';
import { renderCityTable } from './modules/cityTable.js';
import { renderCityProfiles } from './modules/cityProfiles.js';
import { populateAll } from './modules/contentRenderer.js';
import { initDataFreshness } from './modules/dataFreshness.js';
import { renderCoverCityList } from './modules/coverCityList.js';

let bubbleChartRenderPromise = null;
let bubbleChartRendered = false;

let promptGeneratorModulePromise = null;
let promptGeneratorInitPromise = null;
let promptGeneratorInitialized = false;

function ensureBubbleChartRendered() {
  if (bubbleChartRendered) return Promise.resolve();
  if (bubbleChartRenderPromise) return bubbleChartRenderPromise;

  bubbleChartRenderPromise = import('./modules/bubbleChart.js')
    .then(({ renderBubbleChart }) => {
      renderBubbleChart();
      bubbleChartRendered = true;
    })
    .catch((err) => {
      console.error('Bubble chart lazy-load failed:', err);
    })
    .finally(() => {
      bubbleChartRenderPromise = null;
    });

  return bubbleChartRenderPromise;
}

function loadPromptGeneratorModule() {
  if (!promptGeneratorModulePromise) {
    promptGeneratorModulePromise = import('./modules/promptGenerator.js');
  }
  return promptGeneratorModulePromise;
}

function ensurePromptGeneratorInitialized() {
  if (promptGeneratorInitialized) return Promise.resolve();
  if (promptGeneratorInitPromise) return promptGeneratorInitPromise;

  promptGeneratorInitPromise = loadPromptGeneratorModule()
    .then(({ initSimulator }) => {
      initSimulator();
      promptGeneratorInitialized = true;
    })
    .catch((err) => {
      console.error('Prompt generator lazy-load failed:', err);
    })
    .finally(() => {
      promptGeneratorInitPromise = null;
    });

  return promptGeneratorInitPromise;
}

function initDeferredBubbleChart() {
  const section = document.getElementById('university-talent-flow');
  const chartContainer = document.getElementById('d3-bubble-chart');
  if (!section || !chartContainer) return;

  const tryRender = () => {
    if (section.open) {
      ensureBubbleChartRendered();
    }
  };

  section.addEventListener('toggle', tryRender);
  tryRender();
}

function initDeferredPromptGenerator() {
  const simulatorSection = document.getElementById('ai-simulator');

  if (simulatorSection) {
    const tryInit = () => {
      if (simulatorSection.open) {
        ensurePromptGeneratorInitialized();
      }
    };

    simulatorSection.addEventListener('toggle', tryInit);
    tryInit();
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('#generate-prompt-btn, #copy-prompt-btn, #generate-factcheck-btn, #btn-copy-factcheck');
    if (!trigger || promptGeneratorInitialized) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    ensurePromptGeneratorInitialized().then(() => {
      trigger.click();
    });
  }, true);
}

/* ═══════════════════════════════════════════════════════════════════════════
 * NAVIGATION — Back to Map / Scroll Indicator
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Show/hide floating navigation buttons based on scroll position.
 */
function initBackToMap() {
  const mapBtn = document.getElementById('backToMap');
  const indexBtn = document.getElementById('backToIndex');
  if (!mapBtn && !indexBtn) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      const visible = !entry.isIntersecting;
      if (mapBtn) mapBtn.classList.toggle('visible', visible);
      if (indexBtn) indexBtn.classList.toggle('visible', visible);
    },
    { threshold: 0 }
  );

  const cover = document.getElementById('cover');
  if (cover) observer.observe(cover);

  if (mapBtn) {
    mapBtn.addEventListener('click', () => {
      const target = document.getElementById('cover') || document.body;
      target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (indexBtn) {
    indexBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const tocSection = document.getElementById('index');
      const target = document.getElementById('table-of-contents') || tocSection?.closest('details') || tocSection;
      if (target) {
        // Open parent <details> if closed so the anchor is reachable
        let parent = target.closest('details');
        while (parent) {
          parent.open = true;
          parent = parent.parentElement?.closest('details');
        }
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      }
    });
  }
}


/**
 * Hide scroll indicator once user scrolls past cover.
 */
function initScrollIndicator() {
  const indicator = document.querySelector('.scroll-indicator');
  if (!indicator) return;

  const handler = () => {
    if (window.scrollY > 100) {
      indicator.style.opacity = '0';
      indicator.style.pointerEvents = 'none';
    } else {
      indicator.style.opacity = '1';
      indicator.style.pointerEvents = 'auto';
    }
  };

  window.addEventListener('scroll', handler, { passive: true });
  handler(); // Init
}

/* ═══════════════════════════════════════════════════════════════════════════
 * COLLAPSIBLE SECTIONS — Details/Summary behavior for TOC + data sections
 * ═══════════════════════════════════════════════════════════════════════════ */

function captureDetailsAnchorTop(details, anchorElement) {
  if (!details || !anchorElement) return;
  details.__preToggleSummaryTop = anchorElement.getBoundingClientRect().top;
}

function stabilizeDetailsScroll(details, anchorElement) {
  const beforeTop = details?.__preToggleSummaryTop;
  details.__preToggleSummaryTop = null;

  if (typeof beforeTop !== 'number' || !anchorElement) return;

  const afterTop = anchorElement.getBoundingClientRect().top;
  const delta = afterTop - beforeTop;
  if (Math.abs(delta) > 1) {
    window.scrollBy(0, delta);
  }
}

function getAccordionDetailsSiblings(details) {
  const parent = details.parentElement;
  if (!parent) return [];

  return Array.from(parent.children).filter((element) => {
    return element !== details
      && element.tagName === 'DETAILS'
      && element.classList.contains('deeper-dive-container');
  });
}

/**
 * Accordion behavior for top-level main collapsible details containers.
 * When one container opens, close open sibling containers in the same parent.
 * Keeps the opened summary visually anchored to avoid page-jump feeling.
 */
function initDetailsAccordion() {
  const containers = document.querySelectorAll('main#main-content > details.deeper-dive-container');
  containers.forEach((details) => {
    const summary = details.querySelector(':scope > summary');
    if (!summary) return;

    const setContainerHash = () => {
      if (!details.id) return;
      const baseUrl = `${globalThis.location.pathname}${globalThis.location.search}`;
      history.replaceState(null, '', `${baseUrl}#${details.id}`);
    };

    const markSummaryInteraction = () => {
      captureDetailsAnchorTop(details, summary);
      details.__openedFromSummaryInteraction = true;
      setContainerHash();
    };

    summary.addEventListener('click', () => {
      markSummaryInteraction();
    }, true);

    summary.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        markSummaryInteraction();
      }
    });

    details.addEventListener('toggle', () => {
      if (!details.open) {
        if (details.id === 'city-profiles' && typeof globalThis.closeAllCityProfiles === 'function') {
          globalThis.closeAllCityProfiles();
        }
        details.__preToggleSummaryTop = null;
        details.__openedFromSummaryInteraction = false;
        return;
      }

      const shouldAnchorToTop = Boolean(details.__openedFromSummaryInteraction);
      const openSiblings = getAccordionDetailsSiblings(details).filter((sibling) => sibling.open);
      if (openSiblings.length === 0) {
        details.__preToggleSummaryTop = null;
      } else {
        openSiblings.forEach((sibling) => {
          sibling.open = false;
        });

        // Avoid double movement: summary interactions already anchor to this section.
        if (shouldAnchorToTop) {
          details.__preToggleSummaryTop = null;
        } else {
          stabilizeDetailsScroll(details, summary);
        }
      }

      // Match anchor-navigation behavior when users open containers manually.
      if (shouldAnchorToTop) {
        requestAnimationFrame(() => {
          details.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }

      details.__openedFromSummaryInteraction = false;
    });
  });
}

/**
 * Handle hash-based navigation (open relevant details).
 */
function getAnchorTarget(hash) {
  if (!hash || hash === '#') return null;
  const targetId = decodeURIComponent(hash.slice(1));
  if (!targetId) return null;
  return document.getElementById(targetId);
}

function openAncestorDetails(target) {
  let parent = target.closest('details');
  while (parent) {
    parent.open = true;
    parent = parent.parentElement?.closest('details');
  }
}

function updateHashWithoutJump(hash) {
  const baseUrl = `${globalThis.location.pathname}${globalThis.location.search}`;
  if (globalThis.location.hash === hash) {
    history.replaceState(null, '', baseUrl);
  }
  history.pushState(null, '', hash);
}

function handleInitialHash() {
  const target = getAnchorTarget(globalThis.location.hash);
  if (!target) return;

  openAncestorDetails(target);
  if (target.classList.contains('city-section') && typeof globalThis.openCityProfile === 'function') {
    globalThis.openCityProfile(target.id, { scroll: false });
  }
  setTimeout(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

/**
 * Intercept internal anchors so targets inside closed <details> become reachable.
 */
function initInternalAnchorNavigation() {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;

    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    // Let specialized handlers keep ownership where needed.
    if (hash.startsWith('#src-') || hash === '#verification-archive') return;

    const target = getAnchorTarget(hash);
    if (!target) return;

    e.preventDefault();
    openAncestorDetails(target);
    if (target.classList.contains('city-section') && typeof globalThis.openCityProfile === 'function') {
      globalThis.openCityProfile(target.id, { scroll: false });
    }
    updateHashWithoutJump(hash);

    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 90);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
 * REGION TOOLTIP — Map hover showing NUTS II region + STEM graduate counts
 * ═══════════════════════════════════════════════════════════════════════════ */

function initRegionTooltip() {
  const regions = document.querySelectorAll('.map-region');
  const tooltip = document.getElementById('regionTooltip');
  const tooltipText = document.getElementById('regionTooltipText');
  const tooltipGrads = document.getElementById('regionTooltipGrads');
  const mapWrapper = document.querySelector('.map-wrapper');

  if (!regions.length || !tooltip || !tooltipText || !mapWrapper) return;

  // Load regional totals from database
  const store = getStore();
  const regionalTotals = store.master?.regionalTotals || {};

  let tooltipTimeout = null;

  regions.forEach(region => {
    region.addEventListener('mouseenter', () => {
      const regionName = region.dataset.region;
      if (!regionName) return;

      tooltipTimeout = setTimeout(() => {
        tooltipText.innerHTML = `${regionName} <span class="nuts-label">NUTS II</span>`;
        const gradData = regionalTotals[regionName];
        if (gradData && tooltipGrads) {
          const stem = (gradData.officialStem || gradData.digitalStemPlus || 0).toLocaleString();
          const ict = (gradData.coreICT || 0).toLocaleString();
          const ictPct = (gradData.officialStem || gradData.digitalStemPlus) > 0 
            ? ((gradData.coreICT / (gradData.officialStem || gradData.digitalStemPlus)) * 100).toFixed(1) 
            : '0.0';
          tooltipGrads.innerHTML = `
            <span class="tooltip-grad-line tooltip-official"><i class="fa-solid fa-user-graduate"></i> ${stem} STEM</span>
            <span class="tooltip-grad-line tooltip-ict"><i class="fa-solid fa-user-graduate"></i> ${ict} ICT <span class="ict-highlight">(${ictPct}%)</span></span>
            <span class="tooltip-source">23/24 · DGEEC</span>`;
          tooltipGrads.style.display = 'block';
        } else if (tooltipGrads) {
          tooltipGrads.style.display = 'none';
        }
        tooltip.classList.add('visible');
      }, 100);
    });

    region.addEventListener('mousemove', (e) => {
      const wrapperRect = mapWrapper.getBoundingClientRect();
      const x = e.clientX - wrapperRect.left;
      const y = e.clientY - wrapperRect.top;
      // Position tooltip centered above cursor with offset
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
      tooltip.style.transform = 'translateX(-50%) translateY(calc(-100% - 15px))';
    });

    region.addEventListener('mouseleave', () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
      }
      tooltip.classList.remove('visible');
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
 * STAR LINKS — Methodology navigation
 * ═══════════════════════════════════════════════════════════════════════════ */

function initStarLinks() {
  // Handle all source-link clicks with #src-* targets (event delegation for dynamic content)
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a.source-link[href^="#src-"]');
    if (link) {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1); // Remove #
      const target = document.getElementById(targetId);
      
      // First open the Sources deeper-dive if closed
      const sourcesDetails = document.getElementById('sources-methodology');
      if (sourcesDetails && !sourcesDetails.open) sourcesDetails.open = true;
      
      if (target) {
        // Small delay to let details element open before scrolling
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      } else if (sourcesDetails) {
        // Fallback: scroll to sources section if specific target not found
        sourcesDetails.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
}

/**
 * Ensure key foundation anchors scroll reliably to the target container.
 */
function initFoundationAnchors() {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;

    const link = e.target.closest('a[href="#city-database"], a[href="#sources-methodology"]');
    if (!link) return;

    e.preventDefault();
    const targetId = link.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;

    // Open target if it is a <details> container.
    if (target.tagName === 'DETAILS') {
      target.open = true;
    }

    // Open parent details chain if applicable.
    let parent = target.parentElement?.closest('details');
    while (parent) {
      parent.open = true;
      parent = parent.parentElement?.closest('details');
    }

    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, null, `#${targetId}`);
    }, 30);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
 * ARCHIVE TOGGLE — Fact-check verification archive show/hide
 * ═══════════════════════════════════════════════════════════════════════════ */

function initArchiveToggle() {
  const archive = document.getElementById('verification-archive');
  const archiveToggle = document.getElementById('archive-toggle-btn');
  const archiveBadge = archiveToggle?.querySelector('.bin-badge');

  if (!archive || !archiveToggle) return;

  const setBadge = (text) => { if (archiveBadge) archiveBadge.textContent = text; };

  const openArchive = (shouldScroll = true) => {
    archive.classList.remove('hide-anim');
    archive.style.display = 'block';
    archive.style.opacity = '1';
    archive.style.transform = 'translateY(0)';
    requestAnimationFrame(() => archive.classList.add('reveal'));
    archiveToggle.classList.add('fallen');
    archiveToggle.setAttribute('aria-expanded', 'true');
    setBadge('Open');
    ensurePromptGeneratorInitialized();
    if (shouldScroll) {
      archive.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    history.pushState(null, null, '#verification-archive');
  };

  const closeArchive = () => {
    archive.classList.remove('reveal');
    archive.classList.add('hide-anim');
    archive.style.opacity = '0';
    archive.style.transform = 'translateY(-16px)';
    const onAnimEnd = () => {
      archive.style.display = 'none';
      archive.classList.remove('hide-anim');
      archive.removeEventListener('animationend', onAnimEnd);
    };
    archive.addEventListener('animationend', onAnimEnd);
    archiveToggle.classList.remove('fallen');
    archiveToggle.setAttribute('aria-expanded', 'false');
    setBadge('Archive');
    history.pushState(null, null, ' ');
  };

  globalThis.toggleVerificationArchive = (e) => {
    if (e) e.preventDefault();
    const isOpen = archive.classList.contains('reveal');
    if (isOpen) {
      closeArchive();
    } else {
      setBadge('Opening');
      openArchive();
    }
  };

  archiveToggle.addEventListener('click', globalThis.toggleVerificationArchive);

  // Intercept any click on [href="#verification-archive"] (e.g. TOC link) to auto-open
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href="#verification-archive"]');
    if (!link) return;
    e.preventDefault();
    const isOpen = archive.classList.contains('reveal');
    if (isOpen) {
      archive.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setBadge('Opening');
      openArchive();
    }
  });

  // Open archive if URL hash targets it
  if (globalThis.location.hash === '#verification-archive') {
    openArchive(false);
  }

  // Fact-check copy button handler lives in promptGenerator.js → initFactCheckGenerator()
}

/* ═══════════════════════════════════════════════════════════════════════════
 * BAR CHART INITIALIZATION
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Initialize bar charts by reading data-width attributes and setting widths.
 * This keeps inline styles out of HTML while allowing data-driven widths.
 */
function initBarCharts() {
  document.querySelectorAll('.bar-chart-fill[data-width]').forEach(el => {
    el.style.width = el.dataset.width + '%';
  });
}

/**
 * Reorder key sections to keep AI Simulator before foundation blocks,
 * and mirror that order in the Table of Contents.
 */
function reorderSectionFlow() {
  const simulator = document.getElementById('ai-simulator');
  const cityDatabase = document.getElementById('city-database');
  const sourcesMethodology = document.getElementById('sources-methodology');

  if (simulator && cityDatabase && sourcesMethodology) {
    simulator.after(cityDatabase);
    cityDatabase.after(sourcesMethodology);
  }

  const tocFoundationRow = document.querySelector('.toc-section-foundation');
  const tocSimulatorRow = document.querySelector('.toc-section-simulator');
  if (
    tocFoundationRow &&
    tocSimulatorRow &&
    tocFoundationRow.parentElement &&
    tocFoundationRow.parentElement === tocSimulatorRow.parentElement
  ) {
    tocSimulatorRow.after(tocFoundationRow);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * INITIALIZATION
 * ═══════════════════════════════════════════════════════════════════════════ */

async function init() {
  try {
    // 1. Load all databases in parallel
    await loadDatabases();

    // 1b. Auto-compute salary indices from INE baselines + COL
    const { master, compensation } = getStore();
    computeAllTechStemPlus(master);
    computeAllSalaryIndices(master, compensation);

    // 2. Initialize theme (reads localStorage, applies class)
    initThemeToggle();

    // 3. Render dynamic content from databases
    renderCoverCityList();
    renderCityTable();
    renderCityProfiles();

    // 3b. Place AI simulator before foundation sections and sync TOC order
    reorderSectionFlow();

    // 4. Populate all data-bound spans from databases
    populateAll();

    // Initialize Data Freshness UI (uses WEBSITE_CONTENT._meta.lastUpdated)
    try {
      const storeAll = getStore();
      const lastUpdatedIso = storeAll?.content?._meta?.lastUpdated || null;
      initDataFreshness('#data-freshness', lastUpdatedIso);
    } catch (err) {
      console.warn('DataFreshness init skipped:', err);
    }

    // 5. Initialize interactive components
    initBackToMap();
    initScrollIndicator();
    initDetailsAccordion();
    initArchiveToggle();
    initRegionTooltip();
    initStarLinks();
    initInternalAnchorNavigation();
    initDeferredBubbleChart();
    initDeferredPromptGenerator();
    // Normalize all visible source anchors to icon-only anchors
    initUnifiedSourceAnchors();
    initFoundationAnchors();
    initBarCharts();
    handleInitialHash();

    if (import.meta.env.DEV) console.log('Application initialized');
  } catch (err) {
    console.error('Initialization failed:', err);
  }
}

// Expose for debugging (dev only)
if (import.meta.env.DEV) {
  globalThis.generateMasterPrompt = async (...args) => {
    const { generateMasterPrompt } = await loadPromptGeneratorModule();
    return generateMasterPrompt(...args);
  };
  globalThis.getStore = getStore;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * DEBUG MODE — Database Source Highlighting
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Initialize debug mode toggle button and keyboard shortcut.
 * Ctrl+Shift+D toggles database source highlighting.
 */
function initDebugToggle() {
  const btn = document.getElementById('dbDebugToggle');
  
  // Button click toggles debug mode
  if (btn) {
    btn.addEventListener('click', () => {
      document.body.classList.toggle('debug-db-sources');
    });
  }
  
  // Keyboard shortcut: Ctrl+Shift+D
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      document.body.classList.toggle('debug-db-sources');
    }
  });
}

function bootstrap() {
  initDebugToggle();
  void init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}

function isIconOnlySourceAnchor(anchor, visibleLabel) {
  return Boolean(anchor.querySelector('i'))
    && (!visibleLabel || visibleLabel.length <= 2 || /^\W+$/.test(visibleLabel));
}

function getInternalSourceLabel(href) {
  const target = document.querySelector(href);
  if (!target) return '';
  const heading = target.querySelector('h4')?.textContent?.trim();
  const summary = target.querySelector('summary')?.textContent?.trim();
  return heading || summary || '';
}

function getFallbackSourceLabel(anchor, href) {
  const titleLabel = anchor.getAttribute('title') || '';
  if (titleLabel) return titleLabel;

  try {
    return new URL(anchor.href).hostname || anchor.href;
  } catch {
    return anchor.href || href || 'source';
  }
}

function normalizeSourceLabel(label) {
  const compact = label.replaceAll(/\s+/g, ' ').trim();
  return compact.replace(/^src:\s*/i, '');
}

function resolveSourceLabel(anchor, href, isInternal) {
  const visibleLabel = (anchor.textContent || '').trim();
  const iconOnly = isIconOnlySourceAnchor(anchor, visibleLabel);

  if (visibleLabel && !iconOnly) {
    return { label: normalizeSourceLabel(visibleLabel), iconOnly };
  }

  const internalLabel = isInternal ? getInternalSourceLabel(href) : '';
  const fallbackLabel = internalLabel || getFallbackSourceLabel(anchor, href);
  return { label: normalizeSourceLabel(fallbackLabel), iconOnly };
}

function getSourceIconHtml(anchor) {
  const iconElement = anchor.querySelector('i');
  if (iconElement) {
    return iconElement.outerHTML;
  }

  if (anchor.classList.contains('source-link-external')) {
    return '<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>';
  }

  return '<i class="fa-solid fa-circle-info" aria-hidden="true"></i>';
}

function applySourceIcon(anchor, iconOnly, iconHtml) {
  if (iconOnly) {
    anchor.innerHTML = iconHtml;
    return;
  }

  if (!anchor.querySelector('i')) {
    anchor.insertAdjacentHTML('beforeend', ` ${iconHtml}`);
  }
}

/**
 * Unify visible source anchors across the site.
 * - Prefix anchor text with `src: ` (legacy docstring — runtime now renders icon-only)
 * - Use target source entry title when anchor holds only an icon
 * - Append a small link icon for visual consistency
 */
function initUnifiedSourceAnchors() {
  const anchors = document.querySelectorAll('a.source-link, a.source-link-external');
  anchors.forEach((anchor) => {
    if (anchor.dataset.unified === 'true') return; // already processed

    const href = anchor.getAttribute('href') || '';
    const isInternal = href.startsWith('#src-');
    const { label, iconOnly } = resolveSourceLabel(anchor, href, isInternal);
    const iconHtml = getSourceIconHtml(anchor);

    applySourceIcon(anchor, iconOnly, iconHtml);

    anchor.setAttribute('aria-label', `Source: ${label}`);
    anchor.setAttribute('title', label);
    anchor.dataset.unified = 'true';
  });
}

