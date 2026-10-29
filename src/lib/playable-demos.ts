import { DemoAudioCoordinator } from "./playable-demo-protocol";
type GameHandle = { setActive(active: boolean): void; destroy(): void };
type GameModule = { mount(host: HTMLElement, options: { onReturn(): void; onError(): void }): Promise<GameHandle> };

type Phase = "idle" | "loading" | "playing" | "paused" | "complete" | "error";
type Player = {
  id: string; card: HTMLElement; stage: HTMLElement; viewport: HTMLElement;
  overlay: HTMLElement; play: HTMLButtonElement; status: HTMLElement;
  fullscreen: HTMLButtonElement; restart: HTMLButtonElement;
  moduleUrl: string; mount: HTMLElement; game?: GameHandle; module?: Promise<GameModule>;
  pending?: Promise<void>; generation: number; started: boolean; ready: boolean;
  active: boolean; complete: boolean; failed: boolean; timer?: ReturnType<typeof setTimeout>;
};

export function initializePlayableDemos(root: HTMLElement) {
  if (root.dataset.initialized) return;
  root.dataset.initialized = "true";
  const find = <T extends HTMLElement>(element: HTMLElement, selector: string) => element.querySelector<T>(selector)!;
  const players: Player[] = [...root.querySelectorAll<HTMLElement>("[data-playable-demo]")].map(card => ({
    id: card.id, card, stage: find(card, "[data-demo-stage]"), viewport: find(card, "[data-demo-viewport]"),
    overlay: find(card, "[data-demo-overlay]"), play: find(card, "[data-demo-start]"),
    status: find(card, "[data-demo-status]"), fullscreen: find(card, "[data-demo-fullscreen]"),
    restart: find(card, "[data-demo-restart]"),
    moduleUrl: card.dataset.gameModule!, mount: find(card, "[data-demo-mount]"), generation: 0, started: false, ready: false, active: false, complete: false, failed: false,
  }));
  let expanded: Player | null = null;
  let previousOverflow = "";
  const inertSiblings = new Map<HTMLElement, boolean>();

  const phase = (player: Player, value: Phase) => {
    player.card.dataset.state = value;
    player.card.dataset.active = String(player.active);
    player.overlay.hidden = value === "playing";
    player.play.hidden = value === "loading";
    player.play.disabled = false;
    player.play.textContent = value === "paused" ? "Resume" : value === "complete" ? "Play again" : value === "error" ? "Try again" : "Play";
    player.play.setAttribute("aria-label", `${player.play.textContent} ${player.card.dataset.gameName}`);
    player.status.textContent = value === "loading" ? "Loading game…" : value === "paused" ? "Paused" :
      value === "complete" ? "Demo complete" : value === "error" ? "The game could not load. Please try again." : "";
    player.stage.setAttribute("aria-busy", String(value === "loading"));
    player.restart.hidden = !player.ready;
  };
  const sendActive = (player: Player, active: boolean) => {
    player.active = active;
    if (!player.started) return;
    player.game?.setActive(active);
    phase(player, player.failed ? "error" : player.ready ? player.complete ? "complete" : active ? "playing" : "paused" : "loading");
  };
  const audio = new DemoAudioCoordinator(players.map(player => ({ id: player.id, setActive: active => sendActive(player, active) })));

  function importGame(player: Player): Promise<GameModule> {
    return player.module ??= import(/* @vite-ignore */ player.moduleUrl) as Promise<GameModule>;
  }
  function load(player: Player, retry = false) {
    const generation = ++player.generation;
    const previous = player.pending;
    if (player.timer) clearTimeout(player.timer);
    player.game?.destroy(); player.game = undefined;
    player.mount.replaceChildren();
    player.ready = false; player.complete = false; player.failed = false; player.started = true;
    if (retry) { player.module = undefined; const url = new URL(player.moduleUrl); url.searchParams.set("retry", String(generation)); player.moduleUrl = url.href; }
    phase(player, "loading");
    player.timer = setTimeout(() => { if (!player.ready && generation === player.generation) { player.failed = true; phase(player, "error"); } }, 120_000);
    player.pending = (async () => {
      // A rapid restart waits for the previous mount to clean up shared textures.
      await previous?.catch(() => {});
      if (generation !== player.generation) return;
      try {
        const module = await importGame(player);
        if (generation !== player.generation) return;
        const game = await module.mount(player.mount, {
          onReturn() {
            if (generation !== player.generation || audio.activeId !== player.id) return;
            player.complete = true; audio.pause(); phase(player, "complete");
            void exitExpanded().then(() => { player.card.scrollIntoView({ block: "nearest" }); player.play.focus({ preventScroll: true }); });
          },
          onError() { if (generation === player.generation) { player.failed = true; player.game?.setActive(false); phase(player, "error"); } },
        });
        if (generation !== player.generation) { game.destroy(); return; }
        player.game = game; player.ready = true; player.failed = false;
        clearTimeout(player.timer);
        if (audio.activeId === player.id) audio.activate(player.id);
        else sendActive(player, false);
      } catch (error) {
        if (import.meta.env.DEV) console.error("Playable demo failed to mount", error);
        if (generation === player.generation) { player.failed = true; clearTimeout(player.timer); phase(player, "error"); }
      }
    })();
  }
  function start(player: Player, restart = false) {
    if (!player.started || player.complete || player.card.dataset.state === "error" || restart) load(player, player.card.dataset.state === "error");
    audio.activate(player.id);
  }
  function restoreExpansion() {
    if (!expanded) return;
    const player = expanded;
    expanded = null;
    player.stage.classList.remove("is-expanded", "surface-dark");
    player.stage.removeAttribute("role"); player.stage.removeAttribute("aria-modal");
    player.card.style.removeProperty("--demo-player-height");
    player.fullscreen.setAttribute("aria-label", `Expand ${player.card.dataset.gameName}`);
    player.fullscreen.title = "Expand";
    player.fullscreen.setAttribute("aria-expanded", "false");

    document.body.style.overflow = previousOverflow;
    for (const [element, previous] of inertSiblings) element.inert = previous;
    inertSiblings.clear();
    player.fullscreen.focus({ preventScroll: true });
  }
  async function exitExpanded() {
    restoreExpansion();
  }
  function toggleExpanded(player: Player) {
    if (expanded === player) { void exitExpanded(); return; }
    start(player);
    player.card.style.setProperty("--demo-player-height", `${player.stage.parentElement!.getBoundingClientRect().height}px`);
    expanded = player;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    player.stage.classList.add("is-expanded", "surface-dark");
    player.stage.setAttribute("role", "dialog"); player.stage.setAttribute("aria-modal", "true");
    player.fullscreen.setAttribute("aria-label", `Close ${player.card.dataset.gameName}`);
    player.fullscreen.title = "Close";
    player.fullscreen.setAttribute("aria-expanded", "true");

    // Keep the canvas in place so entering/exiting preserves the current run.
    for (let branch: HTMLElement | null = player.stage; branch?.parentElement; branch = branch.parentElement) {
      for (const sibling of branch.parentElement.children) if (sibling !== branch && sibling instanceof HTMLElement) {
        inertSiblings.set(sibling, sibling.inert); sibling.inert = true;
      }
    }
    player.fullscreen.focus({ preventScroll: true });

  }
  const controlsObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const height = entry.contentRect.height;
      const viewport = entry.target as HTMLElement;
      viewport.style.setProperty("--demo-control-size", `${48 * height / 1080}px`);
      viewport.style.setProperty("--demo-control-gap", `${8 * height / 1080}px`);
    }
  });
  for (const player of players) {
    controlsObserver.observe(player.viewport);
    phase(player, "idle");
    player.play.addEventListener("click", () => start(player));
    player.restart.addEventListener("click", () => start(player, true));
    player.fullscreen.addEventListener("click", () => toggleExpanded(player));

  }
  document.addEventListener("keydown", event => {
    if (!expanded) return;
    if (event.key === "Escape") { event.preventDefault(); void exitExpanded(); }
    if (event.key === "Tab") {
      const controls = [...expanded.stage.querySelectorAll<HTMLElement>("button:not([hidden]):not(:disabled), canvas")];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });
  let visibleOwner: string | null = null;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { visibleOwner = audio.activeId; audio.pause(); }
    else if (visibleOwner) { audio.activate(visibleOwner); visibleOwner = null; }
  });
  window.addEventListener("pagehide", event => {
    audio.pause();
    if (!event.persisted) controlsObserver.disconnect();
    if (!event.persisted) for (const player of players) { player.generation++; clearTimeout(player.timer); player.game?.destroy(); }
  });
  // Warm the game modules only after the website has loaded, outside its critical path.
  const warm = () => {
    const run = () => { for (const player of players) void importGame(player).catch(() => { player.module = undefined; }); };
    if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 3000 });
    else setTimeout(run, 1000);
  };
  if (document.readyState === "complete") warm();
  else window.addEventListener("load", warm, { once: true });
}
