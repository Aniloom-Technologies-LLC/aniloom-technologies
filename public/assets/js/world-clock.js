const timeFormatter = (timeZone) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone,
  });

const dateFormatter = (timeZone) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    timeZone,
  });

const resolveTimeFormatter = (timeZone) => {
  try {
    return timeFormatter(timeZone);
  } catch {
    return timeFormatter(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }
};

const resolveDateFormatter = (timeZone) => {
  try {
    return dateFormatter(timeZone);
  } catch {
    return dateFormatter(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }
};

const toggleBodyScroll = (locked) => {
  const body = document.body;

  if (locked) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.setProperty("--scrollbar-compensation", `${Math.max(scrollbarWidth, 0)}px`);
    body.style.paddingRight = `${Math.max(scrollbarWidth, 0)}px`;
    body.classList.add("overlay-open");
    return;
  }

  body.classList.remove("overlay-open");
  body.style.removeProperty("--scrollbar-compensation");
  body.style.paddingRight = "";
};

const initWorldClock = () => {
  const CLOSE_DURATION_MS = 500;
  const overlay = document.querySelector("[data-clock-overlay]");
  const overlayLabel = overlay?.querySelector("[data-overlay-label]");
  const overlayMeta = overlay?.querySelector("[data-overlay-meta]");
  const overlayTime = overlay?.querySelector("[data-overlay-time]");
  const overlayDate = overlay?.querySelector("[data-overlay-date]");
  const overlayContent = overlay?.querySelector(".clock-overlay__content");

  const localTimeEl = document.querySelector("[data-local-clock]");
  const localDateEl = document.querySelector("[data-local-date]");
  const localTrigger = document.querySelector("[data-overlay-source='local']");

  const localTimeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  if (localTrigger) {
    localTrigger.dataset.tz = localTimeZone;
  }

  const cardTriggers = Array.from(document.querySelectorAll(".clock-card"));

  const clocks = [];

  if (localTrigger && localTimeEl && localDateEl) {
    const tz = localTrigger.dataset.tz || localTimeZone;
    clocks.push({
      id: "local",
      label: localTrigger.dataset.label || "Local",
      cities: localTrigger.dataset.cities || "Current location",
      timeZone: tz,
      timeEl: localTimeEl,
      dateEl: localDateEl,
      triggerEl: localTrigger,
      timeFormatter: resolveTimeFormatter(tz),
      dateFormatter: resolveDateFormatter(tz),
    });
  }

  cardTriggers.forEach((trigger) => {
    const timeEl = trigger.querySelector(".time");
    const dateEl = trigger.querySelector(".date");
    if (!timeEl || !dateEl) return;
    const timeZone = trigger.dataset.tz || "UTC";
    clocks.push({
      id: trigger.dataset.clockItem || timeZone,
      label:
        trigger.dataset.label ||
        (trigger.dataset.clockItem || "").toUpperCase(),
      cities: trigger.dataset.cities || "",
      timeZone,
      timeEl,
      dateEl,
      triggerEl: trigger,
      timeFormatter: resolveTimeFormatter(timeZone),
      dateFormatter: resolveDateFormatter(timeZone),
    });
  });

  if (clocks.length === 0) return;

  let overlayState = null;
  let lastTrigger = null;
  let closeTimer = null;

  const applyOverlayContent = (clock, now) => {
    if (!overlay) return;
    if (overlayLabel) overlayLabel.textContent = clock.label;
    if (overlayMeta) overlayMeta.textContent = clock.cities;
    if (overlayTime) overlayTime.textContent = clock.timeFormatter.format(now);
    if (overlayDate) overlayDate.textContent = clock.dateFormatter.format(now);
  };

  const openOverlay = (clock) => {
    if (!overlay) return;
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
    overlayState = clock;
    lastTrigger = clock.triggerEl || null;
    overlay.setAttribute("aria-hidden", "false");
    overlay.classList.add("is-open");
    toggleBodyScroll(true);
    applyOverlayContent(clock, new Date());
    if (overlayContent) {
      window.requestAnimationFrame(() => {
        overlayContent.focus();
      });
    }
  };

  const closeOverlay = () => {
    if (!overlay) return;
    overlayState = null;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    toggleBodyScroll(false);
    closeTimer = window.setTimeout(() => {
      closeTimer = null;
    }, CLOSE_DURATION_MS);
    if (lastTrigger instanceof HTMLElement) {
      lastTrigger.focus();
    }
    lastTrigger = null;
  };

  if (overlay) {
    const closeElements = overlay.querySelectorAll("[data-overlay-close]");
    closeElements.forEach((element) => {
      element.addEventListener("click", closeOverlay);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlayState) {
      closeOverlay();
    }
  });

  clocks.forEach((clock) => {
    if (clock.triggerEl) {
      clock.triggerEl.addEventListener("click", () => openOverlay(clock));
    }
  });

  const update = () => {
    const now = new Date();
    clocks.forEach((clock) => {
      const timeText = clock.timeFormatter.format(now);
      const dateText = clock.dateFormatter.format(now);
      if (clock.timeEl) clock.timeEl.textContent = timeText;
      if (clock.dateEl) clock.dateEl.textContent = dateText;
      if (overlayState && overlayState.id === clock.id) {
        applyOverlayContent(clock, now);
      }
    });
  };

  update();
  const timerId = window.setInterval(update, 1000);
  window.addEventListener("beforeunload", () => clearInterval(timerId));
};

document.addEventListener("DOMContentLoaded", initWorldClock);
