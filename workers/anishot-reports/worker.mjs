import { DurableObject } from 'cloudflare:workers';
import { InboxController, handleRequest } from './app.mjs';
export class ReportInbox extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.controller = new InboxController(ctx.storage); }
  fetch(request) { return this.controller.fetch(request); }
  alarm() { return this.controller.alarm(); }
}
export default { fetch: (request, env) => handleRequest(request, env) };
