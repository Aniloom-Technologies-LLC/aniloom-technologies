const footer = document.querySelector(".site-footer");
const pull = document.querySelector("[data-footer-pull]");
const handle = document.querySelector("[data-footer-handle]");
const quoteText = document.querySelector("[data-footer-quote-text]");

if (footer && pull && handle && quoteText) {
  const quotes = [
    "Although our form is corporate, our attitude is partnership.",
    "We eat our own cooking.",
    "We want to make money only when our partners do.",
    "We do not view Berkshire shareholders as faceless members of an ever-shifting crowd.",
    "I am a lucky fellow to have you as partners.",
  ];

  let quoteIndex = Math.floor(Math.random() * quotes.length);
  let bottomPullCount = 0;
  quoteText.textContent = quotes[quoteIndex];

  let pullAmount = 0;
  let dragging = false;
  let pointerStartY = 0;
  let pointerStartPull = 0;
  let animating = false;
  let pullActivated = false;

  const maxPull = 132;

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
    quoteText.textContent = quotes[quoteIndex];
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
    if (dragging) {
      animating = false;
      return;
    }

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

  const atBottom = () =>
    window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

  window.addEventListener(
    "wheel",
    (event) => {
      if (!atBottom() || event.deltaY <= 0) return;
      setPull(pullAmount + event.deltaY * 0.22);
      registerPull();
      startRelax();
    },
    { passive: true }
  );

  const beginDrag = (clientY) => {
    dragging = true;
    pointerStartY = clientY;
    pointerStartPull = pullAmount;
  };

  const moveDrag = (clientY) => {
    if (!dragging) return;
    const delta = clientY - pointerStartY;
    if (delta <= 0) {
      setPull(pointerStartPull * 0.35);
      return;
    }
    setPull(pointerStartPull + delta * 0.8);
    registerPull();
  };

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    startRelax();
  };

  handle.addEventListener("pointerdown", (event) => {
    beginDrag(event.clientY);
    handle.setPointerCapture(event.pointerId);
  });

  handle.addEventListener("pointermove", (event) => {
    moveDrag(event.clientY);
  });

  handle.addEventListener("pointerup", endDrag);
  handle.addEventListener("pointercancel", endDrag);

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
        setPull(delta * 0.45);
        registerPull();
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    () => {
      touchStartY = null;
      startRelax();
    },
    { passive: true }
  );
}
