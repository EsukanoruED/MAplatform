One-sentence: the workhorse content surface for service listings, dashboard panels and record summaries.

```jsx
<Card eyebrow="Remote site" title="On-site clinic management" interactive
      footer="24/7 coverage · 4 active sites">
  <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-secondary)' }}>
    Staffing, medication stock control and equipment readiness for industrial sites.
  </p>
</Card>
```

Notes
- `tone="ink"` cards are for dark sections; wrap the section in `className="ma-ink"` so nested components follow.
- Never combine `tone="brand"` with a maroon button inside — use `variant="ink"`.
