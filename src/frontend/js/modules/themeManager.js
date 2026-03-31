/**
 * Theme Manager Module
 * Handles dark mode theme switching, persistence, and system preference detection
 *
 * @class ThemeManager
 * @classdesc Manages application theme (light/dark) with localStorage persistence
 * and system preference detection
 */
class ThemeManager {
    /**
     * localStorage key for theme preference
     * @type {string}
     */
    static STORAGE_KEY = 'codex-docs-theme';

    /**
     * Available theme values
     * @type {Object}
     */
    static THEMES = {
        LIGHT: 'light',
        DARK: 'dark',
    };

    /**
     * Creates ThemeManager instance
     */
    constructor() {
        this.currentTheme = null;
        this.systemPreference = null;
        this.initialized = false;
    }

    /**
     * Initialize theme on application startup
     * Must be called synchronously before render to prevent FOUC (flash of unstyled content)
     *
     * @returns {void}
     */
    init() {
        if (this.initialized) {
            return;
        }

        try {
            // Determine which theme to use based on priority:
            // 1. Saved preference in localStorage (if valid)
            // 2. System preference (prefers-color-scheme)
            // 3. Default to light mode
            const saved = this.hasSavedPreference() ? this.getSavedPreference() : null;
            const theme = saved
                || (this.getSystemPreference() ? ThemeManager.THEMES.DARK : ThemeManager.THEMES.LIGHT);

            // Apply theme synchronously to prevent visual flicker
            this.applyTheme(theme);

            this.initialized = true;
        } catch (error) {
            console.error('[ThemeManager] Initialization failed:', error);
            // Fallback to light mode on error
            this.applyTheme(ThemeManager.THEMES.LIGHT);
        }
    }

    /**
     * Get current theme
     *
     * @returns {string} Current theme ('light' or 'dark')
     */
    getCurrentTheme() {
        if (!this.currentTheme) {
            this.currentTheme = document.documentElement.getAttribute('data-theme') || ThemeManager.THEMES.LIGHT;
        }
        return this.currentTheme;
    }

    /**
     * Set theme and persist to localStorage
     *
     * @param {string} theme - Theme to set ('light' or 'dark')
     * @returns {void}
     */
    setTheme(theme) {
        if (!Object.values(ThemeManager.THEMES).includes(theme)) {
            console.warn(`[ThemeManager] Invalid theme: ${theme}`);
            return;
        }

        try {
            // Apply theme to DOM
            this.applyTheme(theme);

            // Persist to localStorage
            try {
                localStorage.setItem(ThemeManager.STORAGE_KEY, theme);
            } catch (storageError) {
                console.warn('[ThemeManager] localStorage quota exceeded or unavailable:', storageError);
                // Theme is still applied, just not persisted
            }

            // Emit theme change event for other modules to listen
            this.emitThemeChange(theme);
        } catch (error) {
            console.error('[ThemeManager] Failed to set theme:', error);
        }
    }

    /**
     * Apply theme to DOM by setting data-theme attribute
     * CSS custom properties update automatically via cascade
     *
     * @private
     * @param {string} theme - Theme to apply
     * @returns {void}
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
    }

    /**
     * Get system preference for dark mode
     * Uses prefers-color-scheme media query
     *
     * @returns {boolean} True if system prefers dark mode
     */
    getSystemPreference() {
        if (this.systemPreference !== null) {
            return this.systemPreference;
        }

        try {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            this.systemPreference = darkModeQuery.matches;
            return this.systemPreference;
        } catch (error) {
            console.warn('[ThemeManager] Failed to detect system preference:', error);
            this.systemPreference = false;
            return false;
        }
    }

    /**
     * Check if user has saved theme preference in localStorage
     *
     * @returns {boolean} True if saved preference exists
     */
    hasSavedPreference() {
        try {
            return localStorage.getItem(ThemeManager.STORAGE_KEY) !== null;
        } catch (error) {
            console.warn('[ThemeManager] Failed to check saved preference:', error);
            return false;
        }
    }

    /**
     * Get saved theme preference from localStorage
     *
     * @private
     * @returns {string|null} Saved theme or null if not found
     */
    getSavedPreference() {
        try {
            const saved = localStorage.getItem(ThemeManager.STORAGE_KEY);
            return saved && Object.values(ThemeManager.THEMES).includes(saved)
                ? saved
                : null;
        } catch (error) {
            console.warn('[ThemeManager] Failed to get saved preference:', error);
            return null;
        }
    }

    /**
     * Emit theme change event for other modules to listen
     * Called internally when theme is changed
     *
     * @private
     * @param {string} theme - New theme
     * @returns {void}
     */
    emitThemeChange(theme) {
        const event = new CustomEvent('themeChange', {
            detail: { theme },
        });
        document.dispatchEvent(event);
    }
}

export default new ThemeManager();
