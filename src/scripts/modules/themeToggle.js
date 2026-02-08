/**
 * THEME TOGGLE MODULE
 * Handles dark/light mode switching with localStorage persistence.
 * Mirrors legacy behavior: checkbox toggle sets data-theme on <html>.
 */

const STORAGE_KEY = 'theme';

/**
 * Get the user's preferred theme.
 * Priority: localStorage > system preference > light
 * @returns {'light'|'dark'}
 */
function getPreferredTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;

  // System preference
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

/**
 * Apply a theme to the document.
 * @param {'light'|'dark'} theme
 */
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

/**
 * Initialize the theme toggle.
 * Finds the #themeToggle checkbox, syncs it with current theme,
 * and listens for changes.
 */
export function initThemeToggle() {
  const theme = getPreferredTheme();
  applyTheme(theme);

  const checkbox = document.getElementById('themeToggle');
  if (!checkbox) return;

  // Sync checkbox state
  checkbox.checked = theme === 'dark';

  // Listen for toggle
  checkbox.addEventListener('change', () => {
    const newTheme = checkbox.checked ? 'dark' : 'light';
    applyTheme(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  });

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only auto-switch if user hasn't manually set a preference
    if (!localStorage.getItem(STORAGE_KEY)) {
      const systemTheme = e.matches ? 'dark' : 'light';
      applyTheme(systemTheme);
      checkbox.checked = systemTheme === 'dark';
    }
  });
}
