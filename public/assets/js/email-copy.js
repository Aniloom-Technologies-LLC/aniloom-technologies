const copyButton = document.querySelector("[data-copy-email]");
const copyStatus = document.querySelector("[data-copy-status]");

if (copyButton && copyStatus && navigator.clipboard?.writeText) {
  copyButton.hidden = false;
  copyButton.addEventListener("click", async () => {
    copyButton.disabled = true;
    try {
      await navigator.clipboard.writeText("support@aniloom.tech");
      copyButton.textContent = "Copied";
      copyStatus.textContent = "Email copied.";
    } catch {
      copyButton.textContent = "Copy email";
      copyStatus.textContent = "Select the email address to copy it.";
    } finally {
      copyButton.disabled = false;
    }
  });
}
