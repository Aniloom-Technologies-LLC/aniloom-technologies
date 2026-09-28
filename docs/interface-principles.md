# Interface principles

## Prefer recognized icons over labels

When an action has a widely accepted, immediately recognizable icon, use the icon without a visible text label. Do not make the interface explain something the control can communicate intuitively on its own.

Examples include theme, close, menu, search, play, pause, previous, and next controls.

Requirements:

- Keep an accessible name with `aria-label` even when no text is visible.
- Use icons consistently across the product.
- Preserve a clear active, hover, focus, and pressed state.
- Do not add a tooltip by default. Add one only if testing shows that the icon is ambiguous.
- Keep a visible text label when the icon is unfamiliar, domain-specific, or could reasonably mean more than one action.
