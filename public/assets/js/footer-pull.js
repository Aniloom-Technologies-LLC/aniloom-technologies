const footer = document.querySelector(".site-footer");
const pull = document.querySelector("[data-footer-pull]");
const quoteText = document.querySelector("[data-footer-quote-text]");

if (footer && pull && quoteText) {
  const quotes = [
    "Risk comes from not knowing what you're doing.",
    "Price is what you pay. Value is what you get.",
    "Someone's sitting in the shade today because someone planted a tree a long time ago.",
    "Although our form is corporate, our attitude is partnership.",
    "We want to make money only when our partners do.",
  ];

  let quoteIndex = Math.floor(Math.random() * quotes.length);
  let bottomPullCount = 0;
  quoteText.textContent = `"${quotes[quoteIndex]}"`;

  let pullAmount = 0;
  let animating = false;
  let pullActivated = false;
  let hideTimer = null;

  const maxPull = 224;
  const fullRevealPull = 176;

  const setPull = (value) => {
    pullAmount = Math.max(0, Math.min(maxPull, value));
    footer.style.setProperty("--footer-pull", `${pullAmount}px`);
    pull.setAttribute("aria-hidden", pullAmount > 6 ? "false" : "true");
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
    quoteText.textContent = `"${quotes[quoteIndex]}"`;
  };

  const registerPull = () => {
    if (pullActivated || pullAmount < 28) return;
    pullActivated = true;
    bottomPullCount += 1;
    if (bottomPullCount % 2 === 0) {
      rotateQuote();
    }
  };

  const relax = () => {
    if (!animating) return;

    if (pullAmount <= 0.5) {
      setPull(0);
      animating = false;
      return;
    }

    setPull(pullAmount * 0.82);
    requestAnimationFrame(relax);
  };

  const startRelax = () => {
    if (animating) return;
    animating = true;
    requestAnimationFrame(relax);
  };

  const scheduleHide = () => {
    if (hideTimer) {
      window.clearTimeout(hideTimer);
    }
    hideTimer = window.setTimeout(() => {
      startRelax();
    }, 2000);
  };

  const atBottom = () =>
    window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

  const revealBy = (amount) => {
    animating = false;
    setPull(pullAmount + amount);
    registerPull();

    if (amount > 10 || pullAmount > 52) {
      setPull(fullRevealPull);
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
}
