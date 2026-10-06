import { DurableObject } from "cloudflare:workers";
import { GateController, handleRequest } from "./app.mjs";

export class ContactGate extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.controller = new GateController(ctx.storage, env); }
  fetch(request) { return this.controller.fetch(request); }
  alarm() { return this.controller.alarm(); }
}

export default { fetch: (request, env) => handleRequest(request, env) };
