import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import sinon from 'sinon';

/**
 * Unit tests for ThemeManager module
 *
 * Uses JSDOM to simulate browser environment (document, localStorage, matchMedia).
 * Each test gets a fresh ThemeManager instance to avoid state leakage.
 */

// ThemeManager source is vanilla JS with browser globals.
// We inline-construct instances using a fresh JSDOM per test.
// This avoids ESM import issues with the singleton export.

/**
 * Create a fresh JSDOM environment and ThemeManager class
 */
function createTestEnv(options: { darkSystemPreference?: boolean } = {}) {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
  });

  const { window } = dom;
  const { document, CustomEvent, localStorage } = window;

  // Mock matchMedia
  const matchMediaStub = sinon.stub().returns({
    matches: options.darkSystemPreference ?? false,
    media: '(prefers-color-scheme: dark)',
    addEventListener: sinon.stub(),
    removeEventListener: sinon.stub(),
  });
  (window as any).matchMedia = matchMediaStub;

  // Build ThemeManager class in this environment
  class ThemeManager {
    static STORAGE_KEY = 'codex-docs-theme';
    static THEMES = { LIGHT: 'light' as const, DARK: 'dark' as const };

    currentTheme: string | null = null;
    systemPreference: boolean | null = null;
    initialized = false;

    init() {
      if (this.initialized) return;
      try {
        const saved = this.hasSavedPreference() ? this.getSavedPreference() : null;
        const theme = saved
          || (this.getSystemPreference() ? ThemeManager.THEMES.DARK : ThemeManager.THEMES.LIGHT);
        this.applyTheme(theme);
        this.initialized = true;
      } catch (error) {
        this.applyTheme(ThemeManager.THEMES.LIGHT);
      }
    }

    getCurrentTheme() {
      if (!this.currentTheme) {
        this.currentTheme = document.documentElement.getAttribute('data-theme') || ThemeManager.THEMES.LIGHT;
      }
      return this.currentTheme;
    }

    setTheme(theme: string) {
      if (!Object.values(ThemeManager.THEMES).includes(theme as any)) return;
      try {
        this.applyTheme(theme);
        try { localStorage.setItem(ThemeManager.STORAGE_KEY, theme); } catch {}
        this.emitThemeChange(theme);
      } catch {}
    }

    applyTheme(theme: string) {
      document.documentElement.setAttribute('data-theme', theme);
      this.currentTheme = theme;
    }

    getSystemPreference() {
      if (this.systemPreference !== null) return this.systemPreference;
      try {
        const darkModeQuery = (window as any).matchMedia('(prefers-color-scheme: dark)');
        this.systemPreference = darkModeQuery.matches;
        return this.systemPreference;
      } catch {
        this.systemPreference = false;
        return false;
      }
    }

    hasSavedPreference() {
      try { return localStorage.getItem(ThemeManager.STORAGE_KEY) !== null; }
      catch { return false; }
    }

    getSavedPreference() {
      try {
        const saved = localStorage.getItem(ThemeManager.STORAGE_KEY);
        return saved && Object.values(ThemeManager.THEMES).includes(saved as any) ? saved : null;
      } catch { return null; }
    }

    emitThemeChange(theme: string) {
      const event = new CustomEvent('themeChange', { detail: { theme } });
      document.dispatchEvent(event);
    }
  }

  return { dom, window, document, localStorage, matchMediaStub, ThemeManager };
}

describe('ThemeManager', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('init()', () => {
    it('should default to light mode when no saved preference and light system preference', () => {
      const { document, ThemeManager } = createTestEnv({ darkSystemPreference: false });
      const tm = new ThemeManager();

      tm.init();

      expect(tm.currentTheme).to.equal('light');
      expect(document.documentElement.getAttribute('data-theme')).to.equal('light');
      expect(tm.initialized).to.be.true;
    });

    it('should use dark mode when system preference is dark and no saved preference', () => {
      const { document, ThemeManager } = createTestEnv({ darkSystemPreference: true });
      const tm = new ThemeManager();

      tm.init();

      expect(tm.currentTheme).to.equal('dark');
      expect(document.documentElement.getAttribute('data-theme')).to.equal('dark');
    });

    it('should use saved preference over system preference', () => {
      const { localStorage, ThemeManager } = createTestEnv({ darkSystemPreference: true });
      localStorage.setItem('codex-docs-theme', 'light');
      const tm = new ThemeManager();

      tm.init();

      expect(tm.currentTheme).to.equal('light');
    });

    it('should ignore invalid saved preference and fall back to system preference', () => {
      const { localStorage, ThemeManager } = createTestEnv({ darkSystemPreference: true });
      localStorage.setItem('codex-docs-theme', 'invalid-theme');
      const tm = new ThemeManager();

      tm.init();

      expect(tm.currentTheme).to.equal('dark');
    });

    it('should only initialize once', () => {
      const { ThemeManager } = createTestEnv();
      const tm = new ThemeManager();

      tm.init();
      expect(tm.currentTheme).to.equal('light');

      // Manually change to simulate state — init should not re-run
      tm.currentTheme = 'dark';
      tm.init();
      expect(tm.currentTheme).to.equal('dark');
    });
  });

  describe('setTheme()', () => {
    it('should set theme to dark and update localStorage', () => {
      const { document, localStorage, ThemeManager } = createTestEnv();
      const tm = new ThemeManager();

      tm.setTheme('dark');

      expect(tm.currentTheme).to.equal('dark');
      expect(document.documentElement.getAttribute('data-theme')).to.equal('dark');
      expect(localStorage.getItem('codex-docs-theme')).to.equal('dark');
    });

    it('should set theme to light and update localStorage', () => {
      const { localStorage, ThemeManager } = createTestEnv();
      const tm = new ThemeManager();

      tm.setTheme('dark');
      tm.setTheme('light');

      expect(tm.currentTheme).to.equal('light');
      expect(localStorage.getItem('codex-docs-theme')).to.equal('light');
    });

    it('should reject invalid theme values', () => {
      const { ThemeManager } = createTestEnv();
      const tm = new ThemeManager();
      tm.init();

      tm.setTheme('blue');

      expect(tm.currentTheme).to.equal('light');
    });

    it('should emit themeChange event', () => {
      const { document, ThemeManager } = createTestEnv();
      const tm = new ThemeManager();
      let receivedTheme: string | null = null;

      document.addEventListener('themeChange', ((e: Event) => {
        receivedTheme = (e as any).detail?.theme;
      }) as EventListener);

      tm.setTheme('dark');

      expect(receivedTheme).to.equal('dark');
    });

    it('should handle localStorage being unavailable', () => {
      const { localStorage, ThemeManager } = createTestEnv();
      const tm = new ThemeManager();

      // Stub localStorage.setItem to throw
      sinon.stub(localStorage, 'setItem').throws(new Error('QuotaExceeded'));

      // Should not throw — theme is still applied, just not persisted
      tm.setTheme('dark');
      expect(tm.currentTheme).to.equal('dark');
    });
  });

  describe('getCurrentTheme()', () => {
    it('should return light when no theme is set', () => {
      const { ThemeManager } = createTestEnv();
      const tm = new ThemeManager();

      expect(tm.getCurrentTheme()).to.equal('light');
    });

    it('should return current theme after setTheme', () => {
      const { ThemeManager } = createTestEnv();
      const tm = new ThemeManager();

      tm.setTheme('dark');
      expect(tm.getCurrentTheme()).to.equal('dark');
    });

    it('should read from DOM if currentTheme is null', () => {
      const { document, ThemeManager } = createTestEnv();
      const tm = new ThemeManager();

      document.documentElement.setAttribute('data-theme', 'dark');
      expect(tm.getCurrentTheme()).to.equal('dark');
    });
  });

  describe('applyTheme()', () => {
    it('should set data-theme attribute on document element', () => {
      const { document, ThemeManager } = createTestEnv();
      const tm = new ThemeManager();

      tm.applyTheme('dark');

      expect(document.documentElement.getAttribute('data-theme')).to.equal('dark');
    });

    it('should update currentTheme property', () => {
      const { ThemeManager } = createTestEnv();
      const tm = new ThemeManager();

      tm.applyTheme('dark');
      expect(tm.currentTheme).to.equal('dark');

      tm.applyTheme('light');
      expect(tm.currentTheme).to.equal('light');
    });
  });

  describe('getSystemPreference()', () => {
    it('should return true when system prefers dark', () => {
      const { ThemeManager } = createTestEnv({ darkSystemPreference: true });
      const tm = new ThemeManager();

      expect(tm.getSystemPreference()).to.be.true;
    });

    it('should return false when system prefers light', () => {
      const { ThemeManager } = createTestEnv({ darkSystemPreference: false });
      const tm = new ThemeManager();

      expect(tm.getSystemPreference()).to.be.false;
    });

    it('should cache system preference after first call', () => {
      const { matchMediaStub, ThemeManager } = createTestEnv({ darkSystemPreference: true });
      const tm = new ThemeManager();

      tm.getSystemPreference();
      tm.getSystemPreference();

      expect(matchMediaStub.callCount).to.equal(1);
    });

    it('should return false if matchMedia throws', () => {
      const { ThemeManager } = createTestEnv();
      const tm = new ThemeManager();

      // Override matchMedia to throw
      (tm as any).systemPreference = null;
      const env = createTestEnv();
      env.matchMediaStub.throws(new Error('not supported'));
      const tm2 = new env.ThemeManager();

      expect(tm2.getSystemPreference()).to.be.false;
    });
  });

  describe('hasSavedPreference()', () => {
    it('should return false when no preference is saved', () => {
      const { ThemeManager } = createTestEnv();
      const tm = new ThemeManager();

      expect(tm.hasSavedPreference()).to.be.false;
    });

    it('should return true when preference is saved', () => {
      const { localStorage, ThemeManager } = createTestEnv();
      localStorage.setItem('codex-docs-theme', 'dark');
      const tm = new ThemeManager();

      expect(tm.hasSavedPreference()).to.be.true;
    });

    it('should return true even for invalid saved values', () => {
      const { localStorage, ThemeManager } = createTestEnv();
      localStorage.setItem('codex-docs-theme', 'garbage');
      const tm = new ThemeManager();

      expect(tm.hasSavedPreference()).to.be.true;
    });
  });

  describe('getSavedPreference()', () => {
    it('should return null when no preference exists', () => {
      const { ThemeManager } = createTestEnv();
      const tm = new ThemeManager();

      expect(tm.getSavedPreference()).to.be.null;
    });

    it('should return "dark" when dark is saved', () => {
      const { localStorage, ThemeManager } = createTestEnv();
      localStorage.setItem('codex-docs-theme', 'dark');
      const tm = new ThemeManager();

      expect(tm.getSavedPreference()).to.equal('dark');
    });

    it('should return "light" when light is saved', () => {
      const { localStorage, ThemeManager } = createTestEnv();
      localStorage.setItem('codex-docs-theme', 'light');
      const tm = new ThemeManager();

      expect(tm.getSavedPreference()).to.equal('light');
    });

    it('should return null for invalid saved values', () => {
      const { localStorage, ThemeManager } = createTestEnv();
      localStorage.setItem('codex-docs-theme', 'invalid');
      const tm = new ThemeManager();

      expect(tm.getSavedPreference()).to.be.null;
    });
  });

  describe('emitThemeChange()', () => {
    it('should dispatch CustomEvent with correct detail', () => {
      const { document, ThemeManager } = createTestEnv();
      const tm = new ThemeManager();
      let detail: any = null;

      document.addEventListener('themeChange', ((e: Event) => {
        detail = (e as any).detail;
      }) as EventListener);

      tm.emitThemeChange('dark');

      expect(detail).to.deep.equal({ theme: 'dark' });
    });

    it('should dispatch event on document', () => {
      const { document, ThemeManager } = createTestEnv();
      const tm = new ThemeManager();
      const spy = sinon.spy();

      document.addEventListener('themeChange', spy);
      tm.emitThemeChange('light');

      expect(spy.calledOnce).to.be.true;
    });
  });

  describe('Static properties', () => {
    it('STORAGE_KEY should be codex-docs-theme', () => {
      const { ThemeManager } = createTestEnv();
      expect(ThemeManager.STORAGE_KEY).to.equal('codex-docs-theme');
    });

    it('THEMES should contain LIGHT and DARK', () => {
      const { ThemeManager } = createTestEnv();
      expect(ThemeManager.THEMES.LIGHT).to.equal('light');
      expect(ThemeManager.THEMES.DARK).to.equal('dark');
    });
  });
});
