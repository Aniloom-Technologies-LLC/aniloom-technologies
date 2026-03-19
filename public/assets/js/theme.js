const THEME_STORAGE_KEY = "aniloom-theme";

const prefersDark = () =>
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const applyThemeClass = (mode) => {
  document.body.classList.remove("theme-light", "theme-dark");
  document.body.classList.add(mode === "light" ? "theme-light" : "theme-dark");
  window.dispatchEvent(
    new CustomEvent("aniloom:theme-change", { detail: { theme: mode } })
  );
};

const resolveInitialTheme = () => {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    return saved;
  }
  return prefersDark() ? "dark" : "light";
};

const initHeaderControls = () => {
  const themeToggle = document.querySelector("[data-theme-toggle]");
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
  if (themeToggle) {
    updateThemeSwitch(themeToggle, initialTheme);
    themeToggle.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("theme-dark")
        ? "light"
        : "dark";
      applyThemeClass(nextTheme);
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      updateThemeSwitch(themeToggle, nextTheme);
    });
  }
};

document.addEventListener("DOMContentLoaded", initHeaderControls);
