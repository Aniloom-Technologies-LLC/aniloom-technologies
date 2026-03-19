const THEME_STORAGE_KEY = "aniloom-theme";
const QUALITY_STORAGE_KEY = "aniloom-quality";

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

const applyQualityState = (isLow) => {
  document.body.dataset.quality = isLow ? "low" : "high";
  window.dispatchEvent(
    new CustomEvent("aniloom:quality-change", {
      detail: { lowQuality: isLow },
    })
  );
};

const resolveInitialTheme = () => {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    return saved;
  }
  return prefersDark() ? "dark" : "light";
};

const resolveInitialQuality = () => {
  const saved = localStorage.getItem(QUALITY_STORAGE_KEY);
  return saved === "low";
};

const initHeaderControls = () => {
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const qualityToggle = document.querySelector("[data-quality-toggle]");
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

  const updateQualitySwitch = (button, isLow) => {
    if (!button) return;
    button.dataset.state = isLow ? "low" : "high";
    button.setAttribute("aria-pressed", isLow ? "true" : "false");
    button.setAttribute(
      "aria-label",
      `Switch to ${isLow ? "high" : "low"} quality`
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

  const initialLowQuality = resolveInitialQuality();
  applyQualityState(initialLowQuality);
  if (qualityToggle) {
    updateQualitySwitch(qualityToggle, initialLowQuality);
    qualityToggle.addEventListener("click", () => {
      const nextLow = qualityToggle.dataset.state !== "low";
      applyQualityState(nextLow);
      localStorage.setItem(QUALITY_STORAGE_KEY, nextLow ? "low" : "high");
      updateQualitySwitch(qualityToggle, nextLow);
    });
  }
};

document.addEventListener("DOMContentLoaded", initHeaderControls);
