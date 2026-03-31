import ThemeManager from './themeManager';

/**
 * @class ThemeToggle
 * @classdesc Class for theme toggle module - handles theme switching UI interactions
 */
export default class ThemeToggle {
    /**
     * CSS classes used in the theme toggle
     *
     * @returns {Record<string, string>}
     */
    static get CSS() {
        return {
            themeToggle: 'theme-toggle',
            themeToggleIconLight: 'theme-toggle__icon--light',
            themeToggleIconDark: 'theme-toggle__icon--dark',
        };
    }

    /**
     * Called by ModuleDispatcher to initialize module from DOM
     */
    init() {
        const themeToggleButton = document.querySelector(`.${ThemeToggle.CSS.themeToggle}`);

        if (!themeToggleButton) {
            console.warn('Theme toggle button not found in DOM');
            return;
        }

        /**
         * Add click event listener
         */
        themeToggleButton.addEventListener('click', (event) => {
            this.handleThemeToggleClick(event);
        });

        /**
         * Update button icon when theme changes
         */
        document.addEventListener('themeChange', (event) => {
            const theme = event.detail?.theme;
            if (theme) {
                this.updateButtonIcon(themeToggleButton, theme);
            }
        });

        /**
         * Set initial button state based on current theme
         */
        const currentTheme = ThemeManager.getCurrentTheme();
        this.updateButtonIcon(themeToggleButton, currentTheme);
    }

    /**
     * Handle theme toggle button click
     *
     * @param {Event} event - Click event
     */
    handleThemeToggleClick(event) {
        event.preventDefault();

        const currentTheme = ThemeManager.getCurrentTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        ThemeManager.setTheme(newTheme);
    }

    /**
     * Update button icon visibility based on current theme
     *
     * @param {HTMLElement} button - The theme toggle button element
     * @param {string} theme - Current theme ('light' or 'dark')
     */
    updateButtonIcon(button, theme) {
        const lightIcon = button.querySelector(`.${ThemeToggle.CSS.themeToggleIconLight}`);
        const darkIcon = button.querySelector(`.${ThemeToggle.CSS.themeToggleIconDark}`);

        if (!lightIcon || !darkIcon) {
            console.warn('Theme toggle icons not found');
            return;
        }

        if (theme === 'dark') {
            // In dark mode, show light mode icon (to indicate what will happen on click)
            lightIcon.style.display = 'none';
            darkIcon.style.display = 'block';
        } else {
            // In light mode, show dark mode icon
            lightIcon.style.display = 'block';
            darkIcon.style.display = 'none';
        }
    }
}
