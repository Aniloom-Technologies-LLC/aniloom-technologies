const body = document.body;
const modal = document.querySelector("[data-contact-modal]");
const modalContent = modal?.querySelector(".contact-modal__content");
const closeControls = modal?.querySelectorAll("[data-contact-close]");
const form = modal?.querySelector("[data-contact-form]");
const openTriggers = document.querySelectorAll("[data-contact-open], a[href='#contact'], a[href='/#contact']");

if (modal && modalContent && form) {
  const CLOSE_DURATION_MS = 500;
  let lastTrigger = null;
  let closeTimer = null;

  const toggleBodyScroll = (locked) => {
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

  const openModal = (trigger = null) => {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
    lastTrigger = trigger;
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("is-open");
    toggleBodyScroll(true);
    window.requestAnimationFrame(() => {
      modalContent.focus();
    });
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    toggleBodyScroll(false);
    closeTimer = window.setTimeout(() => {
      closeTimer = null;
    }, CLOSE_DURATION_MS);
    if (lastTrigger instanceof HTMLElement) {
      lastTrigger.focus();
    }
    lastTrigger = null;
  };

  openTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(trigger);
    });
  });

  closeControls?.forEach((control) => {
    control.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const project = String(formData.get("project") || "").trim();

    const subject = encodeURIComponent(`Project inquiry from ${name}`);
    const bodyText = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      "Project outline:",
      project,
    ].join("\n");

    window.location.href = `mailto:support@aniloom.tech?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    closeModal();
  });
}
