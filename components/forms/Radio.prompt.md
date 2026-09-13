One-sentence: exclusive choice for short option sets — fitness outcome, shift pattern, coverage tier.

```jsx
<Radio name="outcome" value={outcome} onChange={setOutcome}
  options={[
    { value: 'fit', label: 'Fit for duty' },
    { value: 'restricted', label: 'Fit with restrictions', description: 'Record the restriction and review date' },
    { value: 'unfit', label: 'Not fit' },
  ]} />
```
