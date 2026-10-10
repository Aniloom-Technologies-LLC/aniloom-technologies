const form = document.querySelector("[data-contact-form]");
if (form) {
  const submit = form.querySelector("[data-contact-submit]");
  const status = form.querySelector("[data-contact-status]");
  status.hidden = false;
  const topicInput = form.elements.namedItem("topic");
  const topicLabel = form.querySelector("[data-contact-topic-label]");
  const topic = new URLSearchParams(location.search).get("topic")?.trim().slice(0, 160) || "";
  topicInput.value = topic;
  topicLabel.textContent = topic ? `Discussing: ${topic}` : "";
  topicLabel.hidden = !topic;
  let widgetId;
  let token = "";
  let busy = false;
  let ready = false;
  let retryAt = 0;
  let preserveOutcome = false;

  const announce = (message, error = false) => {
    status.textContent = message;
    status.dataset.error = String(error);
  };
  const updateButton = () => { submit.disabled = busy || !ready || !token || Date.now() < retryAt; };
  const unavailable = () => {
    ready = false;
    announce("Online messaging is unavailable right now. Email support@aniloom.tech below; your text stays here.", true);
    updateButton();
  };
  const resetVerification = () => {
    token = "";
    if (widgetId !== undefined) window.turnstile?.reset(widgetId);
    updateButton();
  };

  const initialize = async () => {
    try {
      const response = await fetch(`${form.dataset.endpoint}/config`, { signal: AbortSignal.timeout(10000), credentials: "omit" });
      const config = await response.json();
      if (!response.ok || !config.ready || !config.siteKey) return unavailable();
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      const loadTimeout = window.setTimeout(unavailable, 15000);
      script.onerror = () => { window.clearTimeout(loadTimeout); unavailable(); };
      script.onload = () => {
        window.clearTimeout(loadTimeout);
        if (!window.turnstile?.render) return unavailable();
        ready = true;
        const verification = form.querySelector("[data-contact-verification]");
        const render = () => window.turnstile.render(verification, {
          sitekey: config.siteKey,
          action: "contact",
          theme: "dark",
          size: verification.clientWidth < 300 ? "compact" : "flexible",
          callback: (value) => {
            token = value;
            if (!busy && !preserveOutcome && Date.now() >= retryAt) announce("Ready to send.");
            updateButton();
          },
          "expired-callback": () => { token = ""; updateButton(); if (!busy && !preserveOutcome) announce("Verification expired. Please complete the check again."); },
          "error-callback": () => { token = ""; updateButton(); if (!busy && !preserveOutcome) announce("Spam protection could not load. Retry the check or use the email below.", true); },
        });
        widgetId = render();
        let compact = verification.clientWidth < 300;
        new ResizeObserver(() => {
          const nextCompact = verification.clientWidth < 300;
          if (nextCompact === compact) return;
          compact = nextCompact;
          token = "";
          window.turnstile.remove(widgetId);
          widgetId = render();
          updateButton();
        }).observe(verification);
        announce("Complete the spam-protection check to send your message.");
      };
      document.head.append(script);
    } catch { unavailable(); }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || Date.now() < retryAt || !form.reportValidity()) return;
    if (!ready || !token) { announce("Complete the spam-protection check first.", true); return; }
    busy = true;
    preserveOutcome = true;
    form.setAttribute("aria-busy", "true");
    submit.textContent = "Sending…";
    updateButton();
    announce("Sending your message.");
    const submitted = {
      email: form.elements.namedItem("email").value.trim(),
      project: form.elements.namedItem("project").value.trim(),
      topic: topicInput.value,
      website: form.elements.namedItem("website").value,
      token,
    };
    try {
      const response = await fetch(`${form.dataset.endpoint}/contact`, {
        method: "POST", credentials: "omit", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitted), signal: AbortSignal.timeout(25000),
      });
      const result = await response.json();
      if (response.ok && result.accepted === true) {
        announce(`Message submitted. We will reply to ${submitted.email}.`);
        status.focus();
        // Preserve edits made while the request was in flight.
        if (form.elements.namedItem("project").value.trim() === submitted.project) form.elements.namedItem("project").value = "";
      } else if (response.status === 429) {
        const seconds = Math.min(86400, Math.max(1, Number(response.headers.get("Retry-After")) || 600));
        retryAt = Date.now() + seconds * 1000;
        const amount = seconds < 60 ? seconds : Math.ceil(seconds / 60);
        const unit = seconds < 60 ? "second" : "minute";
        const message = `Please try again in ${amount} ${unit}${amount === 1 ? "" : "s"}, or use the email below. Your message has been kept.`;
        announce(message, true);
        window.setTimeout(() => {
          updateButton();
          if (status.textContent === message) announce("You can try again now, or use the email below. Your message has been kept.", true);
        }, seconds * 1000);
      } else {
        const message = result.code === "verification" ? "Verification could not be completed. Please retry the check." : "We could not submit your message. Try again or use the email below.";
        announce(`${message} Your message has been kept.`, true);
      }
    } catch {
      announce("Delivery could not be confirmed. Retry with the same message or use the email below. Your text has been kept.", true);
    } finally {
      busy = false;
      form.removeAttribute("aria-busy");
      submit.textContent = "Send message";
      resetVerification();
    }
  });
  status.setAttribute("tabindex", "-1");
  initialize();
}
