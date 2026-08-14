export type SuiteTheme = "dark" | "light";

/**
 * Tiny first-paint bootstrap. Electron main owns the persisted value and
 * nativeTheme.themeSource drives this media query in every WebContentsView.
 */
export const STUDIO_THEME_BOOTSTRAP = `(function(){try{try{localStorage.removeItem("theme");localStorage.removeItem("suite-theme");}catch(e){}var m=window.matchMedia("(prefers-color-scheme: dark)"),a=function(){var d=document.documentElement;d.classList.toggle("dark",m.matches);d.style.colorScheme=m.matches?"dark":"light";},bound=false,attempts=0,sync=function(){a();if(attempts++<40)setTimeout(sync,25);},bind=function(){if(bound)return;if(window.electronAPI&&typeof window.electronAPI.onThemeChange==="function"){bound=true;window.electronAPI.onThemeChange(function(){a();if(window.requestAnimationFrame)window.requestAnimationFrame(a);});a();return;}if(attempts++<40)setTimeout(bind,25);};sync();if(m.addEventListener)m.addEventListener("change",a);else if(m.addListener)m.addListener(a);bind();}catch(e){}})();`;

export const SUITE_THEME_STORAGE_KEY = "theme";
export const SUITE_THEME_CHANGE_EVENT = "suite-theme-change";

export function requestSuiteTheme(theme: SuiteTheme): void {
  const api = (
    window as Window & {
      electronAPI?: { setTheme?: (next: SuiteTheme) => Promise<void> };
    }
  ).electronAPI;
  if (api?.setTheme) {
    void api.setTheme(theme);
    return;
  }
  try {
    window.localStorage.setItem(SUITE_THEME_STORAGE_KEY, theme);
  } catch {}
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  window.dispatchEvent(new Event(SUITE_THEME_CHANGE_EVENT));
}
