const MAX_YEARS = 100;
const WEEKS_PER_YEAR = 52;
const DEFAULT_BIRTH = "2000-01-01";
const DEFAULT_COUNTRY = "United States";
const LONGEVITY_INTERVAL = 5;
const LONGEVITY_START = 60;

const longevityStats = {
  "United States": {
    male: { 60: 0.87, 65: 0.79, 70: 0.68, 75: 0.56, 80: 0.43, 85: 0.28, 90: 0.15, 95: 0.06, 100: 0.02 },
    female: { 60: 0.92, 65: 0.86, 70: 0.78, 75: 0.67, 80: 0.54, 85: 0.39, 90: 0.23, 95: 0.11, 100: 0.04 },
  },
  Spain: {
    male: { 60: 0.91, 65: 0.84, 70: 0.75, 75: 0.65, 80: 0.53, 85: 0.38, 90: 0.24, 95: 0.12, 100: 0.05 },
    female: { 60: 0.95, 65: 0.9, 70: 0.83, 75: 0.75, 80: 0.66, 85: 0.52, 90: 0.35, 95: 0.18, 100: 0.08 },
  },
  Ukraine: {
    male: { 60: 0.75, 65: 0.61, 70: 0.47, 75: 0.33, 80: 0.21, 85: 0.11, 90: 0.05, 95: 0.02, 100: 0.01 },
    female: { 60: 0.88, 65: 0.78, 70: 0.65, 75: 0.5, 80: 0.35, 85: 0.22, 90: 0.11, 95: 0.05, 100: 0.02 },
  },
  Canada: {
    male: { 60: 0.9, 65: 0.83, 70: 0.73, 75: 0.62, 80: 0.49, 85: 0.34, 90: 0.2, 95: 0.09, 100: 0.03 },
    female: { 60: 0.94, 65: 0.89, 70: 0.81, 75: 0.72, 80: 0.6, 85: 0.46, 90: 0.3, 95: 0.15, 100: 0.06 },
  },
  Japan: {
    male: { 60: 0.93, 65: 0.87, 70: 0.8, 75: 0.71, 80: 0.6, 85: 0.46, 90: 0.31, 95: 0.17, 100: 0.08 },
    female: { 60: 0.97, 65: 0.94, 70: 0.89, 75: 0.83, 80: 0.74, 85: 0.6, 90: 0.43, 95: 0.26, 100: 0.12 },
  },
  Australia: {
    male: { 60: 0.92, 65: 0.85, 70: 0.76, 75: 0.65, 80: 0.52, 85: 0.36, 90: 0.21, 95: 0.1, 100: 0.04 },
    female: { 60: 0.95, 65: 0.9, 70: 0.83, 75: 0.74, 80: 0.62, 85: 0.47, 90: 0.3, 95: 0.15, 100: 0.07 },
  },
  Germany: {
    male: { 60: 0.89, 65: 0.82, 70: 0.72, 75: 0.62, 80: 0.49, 85: 0.34, 90: 0.2, 95: 0.09, 100: 0.03 },
    female: { 60: 0.94, 65: 0.88, 70: 0.8, 75: 0.71, 80: 0.6, 85: 0.45, 90: 0.29, 95: 0.14, 100: 0.06 },
  },
  "United Kingdom": {
    male: { 60: 0.9, 65: 0.83, 70: 0.74, 75: 0.64, 80: 0.51, 85: 0.35, 90: 0.2, 95: 0.09, 100: 0.03 },
    female: { 60: 0.94, 65: 0.89, 70: 0.82, 75: 0.73, 80: 0.61, 85: 0.46, 90: 0.3, 95: 0.15, 100: 0.06 },
  },
  "New Zealand": {
    male: { 60: 0.91, 65: 0.84, 70: 0.75, 75: 0.65, 80: 0.52, 85: 0.36, 90: 0.2, 95: 0.09, 100: 0.03 },
    female: { 60: 0.95, 65: 0.9, 70: 0.83, 75: 0.74, 80: 0.62, 85: 0.47, 90: 0.3, 95: 0.14, 100: 0.06 },
  },
  France: {
    male: { 60: 0.92, 65: 0.86, 70: 0.78, 75: 0.68, 80: 0.56, 85: 0.41, 90: 0.26, 95: 0.13, 100: 0.05 },
    female: { 60: 0.96, 65: 0.92, 70: 0.86, 75: 0.78, 80: 0.67, 85: 0.53, 90: 0.36, 95: 0.19, 100: 0.09 },
  },
  Italy: {
    male: { 60: 0.93, 65: 0.87, 70: 0.79, 75: 0.7, 80: 0.58, 85: 0.43, 90: 0.27, 95: 0.14, 100: 0.06 },
    female: { 60: 0.97, 65: 0.93, 70: 0.87, 75: 0.8, 80: 0.7, 85: 0.55, 90: 0.38, 95: 0.21, 100: 0.09 },
  },
  China: {
    male: { 60: 0.85, 65: 0.76, 70: 0.66, 75: 0.54, 80: 0.4, 85: 0.27, 90: 0.15, 95: 0.07, 100: 0.03 },
    female: { 60: 0.9, 65: 0.83, 70: 0.73, 75: 0.62, 80: 0.48, 85: 0.33, 90: 0.19, 95: 0.09, 100: 0.04 },
  },
  India: {
    male: { 60: 0.72, 65: 0.6, 70: 0.47, 75: 0.34, 80: 0.21, 85: 0.11, 90: 0.05, 95: 0.02, 100: 0.01 },
    female: { 60: 0.8, 65: 0.69, 70: 0.56, 75: 0.42, 80: 0.27, 85: 0.14, 90: 0.07, 95: 0.03, 100: 0.01 },
  },
  Brazil: {
    male: { 60: 0.79, 65: 0.66, 70: 0.52, 75: 0.39, 80: 0.26, 85: 0.15, 90: 0.08, 95: 0.03, 100: 0.01 },
    female: { 60: 0.86, 65: 0.75, 70: 0.62, 75: 0.49, 80: 0.34, 85: 0.19, 90: 0.1, 95: 0.04, 100: 0.02 },
  },
  Mexico: {
    male: { 60: 0.8, 65: 0.68, 70: 0.55, 75: 0.41, 80: 0.28, 85: 0.16, 90: 0.08, 95: 0.03, 100: 0.01 },
    female: { 60: 0.87, 65: 0.77, 70: 0.65, 75: 0.52, 80: 0.36, 85: 0.21, 90: 0.11, 95: 0.05, 100: 0.02 },
  },
  "South Korea": {
    male: { 60: 0.93, 65: 0.87, 70: 0.8, 75: 0.71, 80: 0.6, 85: 0.45, 90: 0.29, 95: 0.15, 100: 0.07 },
    female: { 60: 0.97, 65: 0.94, 70: 0.88, 75: 0.8, 80: 0.7, 85: 0.56, 90: 0.38, 95: 0.2, 100: 0.1 },
  },
  Singapore: {
    male: { 60: 0.94, 65: 0.89, 70: 0.82, 75: 0.73, 80: 0.62, 85: 0.47, 90: 0.31, 95: 0.17, 100: 0.08 },
    female: { 60: 0.98, 65: 0.95, 70: 0.9, 75: 0.83, 80: 0.73, 85: 0.6, 90: 0.42, 95: 0.23, 100: 0.11 },
  },
  Sweden: {
    male: { 60: 0.91, 65: 0.84, 70: 0.76, 75: 0.66, 80: 0.54, 85: 0.39, 90: 0.24, 95: 0.12, 100: 0.05 },
    female: { 60: 0.95, 65: 0.9, 70: 0.83, 75: 0.74, 80: 0.63, 85: 0.48, 90: 0.31, 95: 0.16, 100: 0.07 },
  },
  Netherlands: {
    male: { 60: 0.9, 65: 0.83, 70: 0.74, 75: 0.64, 80: 0.52, 85: 0.37, 90: 0.22, 95: 0.11, 100: 0.04 },
    female: { 60: 0.94, 65: 0.89, 70: 0.82, 75: 0.73, 80: 0.62, 85: 0.47, 90: 0.3, 95: 0.15, 100: 0.06 },
  },
};

const countries = [
  DEFAULT_COUNTRY,
  ...Object.keys(longevityStats)
    .filter((country) => country !== DEFAULT_COUNTRY)
    .sort(),
];

const clampDate = (value) => {
  const min = new Date("1920-01-01T00:00:00");
  const max = new Date();
  const candidate = new Date(value);
  if (Number.isNaN(candidate.getTime())) return new Date(DEFAULT_BIRTH);
  if (candidate < min) return min;
  if (candidate > max) return max;
  return candidate;
};

const buildWeekElement = (isCompleted, isCurrent) => {
  const week = document.createElement("span");
  week.className =
    "week" +
    (isCompleted ? " week--complete" : "") +
    (isCurrent ? " week--current" : "");
  return week;
};

const buildLongevityRow = (year, probability) => {
  const wrapper = document.createElement("div");
  wrapper.className = "longevity-row";
  wrapper.setAttribute("role", "presentation");
  const label = document.createElement("span");
  label.className = "longevity-label";
  label.textContent = `Age ${year} survival`;
  wrapper.appendChild(label);

  const bar = document.createElement("div");
  bar.className = "longevity-bar";
  bar.setAttribute("aria-valuemin", "0");
  bar.setAttribute("aria-valuemax", "100");
  bar.setAttribute("aria-valuenow", Math.round(probability * 100).toString());

  const fill = document.createElement("div");
  fill.className = "longevity-fill";
  fill.style.width = `${(probability * 100).toFixed(0)}%`;
  bar.appendChild(fill);

  const value = document.createElement("span");
  value.className = "longevity-value";
  value.textContent = `${Math.round(probability * 100)}%`;

  wrapper.appendChild(bar);
  wrapper.appendChild(value);
  return wrapper;
};

const computeLifeProgress = (birthDate, referenceDate = new Date()) => {
  const msInWeek = 1000 * 60 * 60 * 24 * 7;
  const rawYearDiff = referenceDate.getFullYear() - birthDate.getFullYear();
  let currentYearIndex = rawYearDiff;
  const anniversaryThisYear = new Date(
    referenceDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );
  if (referenceDate < anniversaryThisYear) {
    currentYearIndex -= 1;
  }
  if (currentYearIndex < 0) currentYearIndex = 0;

  const clampedYear = Math.min(currentYearIndex, MAX_YEARS - 1);
  const yearStart = new Date(birthDate);
  yearStart.setFullYear(birthDate.getFullYear() + clampedYear);
  if (yearStart > referenceDate) {
    yearStart.setFullYear(yearStart.getFullYear() - 1);
  }

  const rawWeeksIntoYear = Math.floor(
    Math.max(0, (referenceDate - yearStart) / msInWeek)
  );
  const weeksIntoYear = Math.min(rawWeeksIntoYear, WEEKS_PER_YEAR);
  const completedWeeks = Math.min(
    clampedYear * WEEKS_PER_YEAR + weeksIntoYear,
    MAX_YEARS * WEEKS_PER_YEAR
  );
  const currentWeekIndex = Math.min(weeksIntoYear, WEEKS_PER_YEAR - 1);

  return {
    currentYear: clampedYear,
    currentWeekIndex,
    weeksIntoYear,
    completedWeeks,
  };
};

const renderLifeGrid = ({ scrollToCurrent = false } = {}) => {
  const birthInput = document.getElementById("birth-date");
  const countrySelect = document.getElementById("country");
  const sexInput = document.getElementById("life-sex");
  const lifeGrid = document.getElementById("life-grid");
  if (!birthInput || !countrySelect || !sexInput || !lifeGrid) return;

  const birthDate = clampDate(birthInput.value || DEFAULT_BIRTH);
  const now = new Date();

  const countryKey = longevityStats[countrySelect.value]
    ? countrySelect.value
    : DEFAULT_COUNTRY;
  const sexKey = sexInput.value === "male" ? "male" : "female";
  const statsGroup = longevityStats[countryKey];
  const stats = statsGroup[sexKey] || statsGroup.female;

  const progress = computeLifeProgress(birthDate, now);
  const totalCompletedWeeks = progress.completedWeeks;

  lifeGrid.innerHTML = "";

  for (let year = 0; year < MAX_YEARS; year += 1) {
    const row = document.createElement("div");
    row.className = "life-row";
    row.dataset.year = year.toString();

    const label = document.createElement("span");
    label.className = "life-year";
    label.textContent = `${year}`;
    row.appendChild(label);

    const weeksWrap = document.createElement("div");
    weeksWrap.className = "weeks-wrap";

    for (let week = 0; week < WEEKS_PER_YEAR; week += 1) {
      const weeksElapsed = year * WEEKS_PER_YEAR + week;
      const isCompleted = weeksElapsed < totalCompletedWeeks;
      const isCurrent =
        year === progress.currentYear && week === progress.currentWeekIndex;
      weeksWrap.appendChild(buildWeekElement(isCompleted, isCurrent));
    }

    row.appendChild(weeksWrap);
    lifeGrid.appendChild(row);

    if (
      year >= LONGEVITY_START &&
      (year - LONGEVITY_START) % LONGEVITY_INTERVAL === 0
    ) {
      const probability = stats[year];
      if (probability !== undefined) {
        lifeGrid.appendChild(buildLongevityRow(year, probability));
      }
    }
  }

  if (stats[100] !== undefined) {
    lifeGrid.appendChild(buildLongevityRow(100, stats[100]));
  }

  if (scrollToCurrent) {
    const targetRow = lifeGrid.querySelector(
      `.life-row[data-year="${progress.currentYear}"]`
    );
    if (targetRow) {
      targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const countrySelect = document.getElementById("country");
  const birthInput = document.getElementById("birth-date");
  const sexInput = document.getElementById("life-sex");
  const sexToggle = document.querySelector("[data-sex-toggle]");
  const form = document.getElementById("life-form");

  if (countrySelect) {
    countries.forEach((country) => {
      const option = document.createElement("option");
      option.value = country;
      option.textContent = country;
      countrySelect.appendChild(option);
    });
    countrySelect.value = DEFAULT_COUNTRY;
  }

  if (birthInput) {
    birthInput.value = DEFAULT_BIRTH;
  }

  const applySexState = (value) => {
    if (!sexInput || !sexToggle) return;
    const normalized = value === "male" ? "male" : "female";
    sexInput.value = normalized;
    sexToggle.dataset.state = normalized;
    sexToggle.setAttribute(
      "aria-pressed",
      normalized === "female" ? "true" : "false"
    );
    sexToggle.setAttribute(
      "aria-label",
      `Switch to ${normalized === "female" ? "male" : "female"}`
    );
  };

  if (sexToggle && sexInput) {
    applySexState(sexInput.value || "female");
    sexToggle.addEventListener("click", () => {
      const next = sexInput.value === "female" ? "male" : "female";
      applySexState(next);
    });
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      renderLifeGrid({ scrollToCurrent: true });
    });
  }

  renderLifeGrid();
});
