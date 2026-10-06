# Aniloom Technologies Website

Static marketing website for Aniloom Technologies, built around the positioning and public-claim rules maintained in the separate Aniloom Brand System project.

## Stack

- Astro for static routing, layouts, SEO, and content collections
- React islands for the retained interactive visual effects
- Three.js for the retained flowing-line effect
- Markdown content in `src/content/blog`
- GitHub Pages deployment through GitHub Actions
- Separate Cloudflare Worker, Turnstile, and Resend for contact submissions

## Site structure

- `/` - company overview
- `/capabilities/` - four capability groups
- `/playable-ads/` - playable-ad development and quality direction
- `/quality-engineering/` - quality-engineering entry points and deliverables
- `/how-we-work/` - engagement models and delivery approach
- `/about/` - company principles and confirmed leadership information
- `/insights/` - content-driven Notes index and article routes
- `/contact/` - project inquiry form and direct email
- `/privacy-policy/` and `/terms-of-use/` - legal pages

## Commands

- `npm install` - install dependencies
- `npm run dev` - start the local development server
- `npm run check` - validate Astro and TypeScript
- `npm run build` - generate the production site in `dist/`
- `npm run preview` - preview the production build
- `npm run test:contact` - run focused server validation, delivery, and abuse-limit tests
- `npm run contact:deploy -- --dry-run` - validate the Worker bundle without deploying

Contact service setup and activation are documented in [docs/contact-form.md](docs/contact-form.md). Static builds do not embed email-provider or Turnstile secrets. Do not publish the new contact flow until the service and recipient mailbox have been verified.

## Content and claims

Public positioning, capability claims, people information, and website-copy rules come from the separate `Aniloom Brand System` project. Unknown facts must not be inferred in this repository.
