const footer = document.querySelector(".site-footer");
const footerStage = document.querySelector("[data-footer-stage]");
const pull = document.querySelector("[data-footer-pull]");
const quoteText = document.querySelector("[data-footer-quote-text]");
const quoteSource = document.querySelector("[data-footer-quote-source]");

if (footer && footerStage && pull && quoteText && quoteSource) {
  const quotes = [
    {
      text: "Risk comes from not knowing what you're doing.",
      source: "Warren Buffett",
    },
    {
      text: "Price is what you pay. Value is what you get.",
      source: "Warren Buffett",
    },
    {
      text: "Someone's sitting in the shade today because someone planted a tree a long time ago.",
      source: "Warren Buffett",
    },
    {
      text: "Although our form is corporate, our attitude is partnership.",
      source: "Warren Buffett",
    },
    {
      text: "We want to make money only when our partners do.",
      source: "Warren Buffett",
    },
    {
      text: "AI moves the work faster. Experienced people remain responsible for what ships.",
      source: "Aniloom Technologies",
    },
  ];

  let quoteIndex = Math.floor(Math.random() * quotes.length);
  let bottomPullCount = 0;
  quoteText.textContent = `"${quotes[quoteIndex].text}"`;
  quoteSource.textContent = quotes[quoteIndex].source;

  let pullAmount = 0;
  let pullActivated = false;
  let hideTimer = null;

  const revealHeight = () => Math.ceil(quoteText.parentElement.scrollHeight + 24);
  const hideDelayMs = 3000;
  const isScrollable = () =>
    document.documentElement.scrollHeight > window.innerHeight + 4;

  const setPull = (value, keepAtBottom = false) => {
    pullAmount = Math.max(0, Math.min(revealHeight(), value));
    footerStage.style.setProperty("--footer-pull", `${pullAmount}px`);
    pull.setAttribute("aria-hidden", pullAmount > 6 ? "false" : "true");
    if (keepAtBottom) {
      window.requestAnimationFrame(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });
    }
    if (pullAmount < 16) {
      pullActivated = false;
    }
  };

  const rotateQuote = () => {
    let nextIndex = quoteIndex;
    while (nextIndex === quoteIndex && quotes.length > 1) {
      nextIndex = Math.floor(Math.random() * quotes.length);
    }
    quoteIndex = nextIndex;
    quoteText.textContent = `"${quotes[quoteIndex].text}"`;
    quoteSource.textContent = quotes[quoteIndex].source;
  };

  const registerPull = () => {
    if (pullActivated || pullAmount < 28) return;
    pullActivated = true;
    bottomPullCount += 1;
    if (bottomPullCount % 2 === 0) {
      rotateQuote();
    }
  };

  const collapse = () => {
    setPull(0);
  };

  const scheduleHide = () => {
    if (hideTimer) {
      window.clearTimeout(hideTimer);
    }
    hideTimer = window.setTimeout(() => {
      collapse();
    }, hideDelayMs);
  };

  const atBottom = () =>
    isScrollable() &&
    window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

  const revealBy = (amount) => {
    if (!isScrollable()) return;
    setPull(pullAmount + amount, true);
    registerPull();

    if (amount > 10 || pullAmount > 52) {
      setPull(revealHeight(), true);
    }

    scheduleHide();
  };

  window.addEventListener(
    "wheel",
    (event) => {
      if (!atBottom() || event.deltaY <= 0) return;
      revealBy(event.deltaY * 0.26);
    },
    { passive: true }
  );

  let touchStartY = null;

  window.addEventListener(
    "touchstart",
    (event) => {
      if (!atBottom()) return;
      touchStartY = event.touches[0]?.clientY ?? null;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      if (!atBottom() || touchStartY === null) return;
      const currentY = event.touches[0]?.clientY ?? touchStartY;
      const delta = touchStartY - currentY;
      if (delta > 0) {
        revealBy(delta * 0.45);
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    () => {
      touchStartY = null;
    },
    { passive: true }
  );

  window.addEventListener(
    "resize",
    () => {
      if (!isScrollable()) {
        collapse();
      }
    },
    { passive: true }
  );
}
