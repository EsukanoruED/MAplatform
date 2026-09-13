One-sentence: the standard action control — use `primary` once per view for the single most important action, `secondary` for everything alongside it, `ghost` for tertiary/inline actions.

```jsx
<Button variant="primary" size="lg" iconEnd={<Icon name="arrow-right" size={18} />}>
  Request a site assessment
</Button>
<Button variant="secondary">Download capability statement</Button>
<Button variant="ghost" size="sm">Cancel</Button>
```

Notes
- `ink` is for placing a button on maroon or on photography, where `primary` would disappear.
- Labels are sentence case, verb-first, never ending in a period. Keep them under five words.
- 4px radius, 0.04em tracking, 1px downward press — no scale or bounce.
