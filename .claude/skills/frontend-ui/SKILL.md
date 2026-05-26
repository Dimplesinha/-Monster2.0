# Frontend UI Skill

## Purpose
Build a polished, responsive job portal UI inspired by modern job boards.

## Owned Areas
- `client/src/pages/*`
- `client/src/components/*`
- `client/src/index.css`
- CSS module files beside components/pages

## UI Requirements
- Use original Monster2.0 or JobMonster branding.
- Use a modern job board layout: header, search hero, job cards, filters, detail pages, dashboards.
- Login page should support a high-fidelity two-column layout with social buttons as placeholders.
- Do not use Monster/CareerBuilder logos, names, text, or exact visual assets.
- Keep buttons, inputs, cards, and page spacing consistent.
- Mobile layout must stack cleanly with no overlap or clipped text.

## UX States
- Loading state for API calls.
- Empty state for no jobs/applications/saved data.
- Error state for failed API calls.
- Disabled state for submitting forms.
- Clear validation messages.

## Accessibility
- Use labels for inputs.
- Keep keyboard focus visible.
- Buttons must have meaningful text or accessible labels.

## Verification
- Run `npm run dev` in `client/`.
- Test pages at `http://localhost:5173`.
- Check desktop and mobile widths.
