export type DemoParticipant = { id: string; setActive: (active: boolean) => void };

/** Silence every previous player before granting audio to the next one. */
export class DemoAudioCoordinator {
  private owner: string | null = null;
  private readonly players: readonly DemoParticipant[];
  constructor(players: readonly DemoParticipant[]) { this.players = players; }
  get activeId() { return this.owner; }
  activate(id: string) {
    const next = this.players.find(player => player.id === id);
    if (!next) return false;
    this.owner = id;
    for (const player of this.players) if (player !== next) player.setActive(false);
    next.setActive(true);
    return true;
  }
  pause() { this.owner = null; for (const player of this.players) player.setActive(false); }
}
