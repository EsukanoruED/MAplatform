One-sentence: renders a Lucide glyph at the brand's 2px stroke weight — the only icon source in the system.

```jsx
<Icon name="stethoscope" size={20} />
<Icon name="shield-check" size={24} style={{ color: 'var(--text-brand)' }} />
<Icon name="siren" size={18} title="Emergency response" />
```

Notes
- Sizes: 16 inline with body text, 18–20 in controls, 24 in nav, 32–40 as a feature glyph.
- Icons inherit `currentColor`. Never fill them; never mix in a second icon family or emoji.
- Core Medical Alliance glyph set: `stethoscope`, `heart-pulse`, `activity`, `siren`, `ambulance`, `shield-check`, `clipboard-check`, `file-badge`, `hard-hat`, `building-2`, `map-pin`, `graduation-cap`, `users`, `package`, `microscope`, `syringe`, `calendar-check`, `phone-call`.
