const THEME_STORAGE_KEY = "aniloom-theme";

const resolvePalette = (mode) =>
  mode === "light"
    ? { background: "#f5f8fa", text: "#15202a" }
    : { background: "#07131a", text: "#f5f8fa" };

const applyThemeClass = (mode) => {
  const palette = resolvePalette(mode);
  document.documentElement.classList.remove("theme-light", "theme-dark");
  document.documentElement.classList.add(
    mode === "light" ? "theme-light" : "theme-dark"
  );
  document.documentElement.dataset.initialTheme = mode;
  document.documentElement.style.backgroundColor = palette.background;
  document.documentElement.style.color = palette.text;
  document.documentElement.style.setProperty("--background", palette.background);
  document.documentElement.style.setProperty("--text-primary", palette.text);
  document.body.classList.remove("theme-light", "theme-dark");
  document.body.classList.add(mode === "light" ? "theme-light" : "theme-dark");
  document.body.style.backgroundColor = palette.background;
  document.body.style.color = palette.text;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", palette.background);
  window.dispatchEvent(
    new CustomEvent("aniloom:theme-change", { detail: { theme: mode } })
  );
};

const resolveInitialTheme = () => {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    return saved;
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

const initHeaderControls = () => {
  const themeToggles = document.querySelectorAll("[data-theme-toggle]");
  const updateThemeSwitch = (button, theme) => {
    if (!button) return;
    const isLight = theme === "light";
    button.dataset.state = isLight ? "day" : "night";
    button.setAttribute("aria-pressed", isLight ? "true" : "false");
    button.setAttribute(
      "aria-label",
      `Switch to ${isLight ? "night" : "day"} mode`
    );
  };

  const initialTheme = resolveInitialTheme();
  applyThemeClass(initialTheme);
  document.body.dataset.themeReady = "false";
  if (themeToggles.length) {
    themeToggles.forEach((button) => {
      updateThemeSwitch(button, initialTheme);
    });
    window.requestAnimationFrame(() => {
      themeToggles.forEach((button) => {
        button.dataset.ready = "true";
      });
      document.body.dataset.themeReady = "true";
    });
    themeToggles.forEach((button) => {
      button.addEventListener("click", () => {
        const nextTheme = document.body.classList.contains("theme-dark")
          ? "light"
          : "dark";
        document.body.dataset.themeReady = "true";
        applyThemeClass(nextTheme);
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        themeToggles.forEach((toggle) => {
          updateThemeSwitch(toggle, nextTheme);
        });
      });
    });
  }
};

document.addEventListener("DOMContentLoaded", initHeaderControls);
