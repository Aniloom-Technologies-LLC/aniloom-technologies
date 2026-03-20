const body = document.body;
const modal = document.querySelector("[data-contact-modal]");
const modalContent = modal?.querySelector(".contact-modal__content");
const closeControls = modal?.querySelectorAll("[data-contact-close]");
const form = modal?.querySelector("[data-contact-form]");
const openTriggers = document.querySelectorAll("[data-contact-open], a[href='#contact'], a[href='/#contact']");

if (modal && modalContent && form) {
  let lastTrigger = null;

  const toggleBodyScroll = (locked) => {
    body.classList.toggle("overlay-open", locked);
  };

  const openModal = (trigger = null) => {
    lastTrigger = trigger;
    modal.hidden = false;
    modal.classList.add("is-open");
    toggleBodyScroll(true);
    window.requestAnimationFrame(() => {
      modalContent.focus();
    });
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.hidden = true;
    toggleBodyScroll(false);
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

    window.location.href = `mailto:hello@aniloom.tech?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    closeModal();
  });
}
