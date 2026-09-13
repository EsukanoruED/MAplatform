One-sentence: the only approved way to place the brand mark — it points at the supplied artwork so the lockup is never redrawn or retyped.

```jsx
<Logo lockup="horizontal" tone="dark" height={34} assetBase="../../assets/logo" />
<Logo lockup="stacked" mark="s" tone="white" height={96} assetBase="../../assets/logo" />
<Logo lockup="mark" tone="maroon" height={28} assetBase="../../assets/logo" />
```

Notes
- Clear space = the height of the crescent on every side. Minimum horizontal lockup height: 24px screen / 14mm print.
- Use `tone="white"` on maroon, ink, and photography. Never place the dark lockup on maroon.
- `assetBase` must be a path that resolves from the consuming page.
