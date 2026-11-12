# CMS form conventions

All website content editors use the globally loaded `cms-forms.css` foundation.
Reuse `Field` from `ContentFields.tsx` for structured content; its labels and
placeholders are presentation only and must not change persisted keys.

For custom editors, group related controls with `cms-fields` and label each
control with `cms-field`. Add a width variant: `cms-field--short` for short
values, `cms-field--link` for paths/URLs, `cms-field--standard` for names and
headings, or `cms-field--long` for descriptions. Long fields span the grid;
mobile groups stack. Do not force every control to full page width.

Keep visible labels, helpful example placeholders, existing validation rules,
and inline errors (`role="alert"`). Associate field errors with controls using
`aria-describedby` and `aria-invalid`. Preserve relative URLs and existing
date/number formats; do not add restrictive input types without checking the
API contract. Keep upload controls, disabled states, and save feedback intact.

New modules must reuse these styles rather than copy Home-specific CSS.
