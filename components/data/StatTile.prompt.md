One-sentence: headline figures at the top of a portal view — never more than four across.

```jsx
<StatTile label="Workers cleared" value="1,284" delta="42 this week" deltaDirection="up"
  icon={<Icon name="shield-check" size={18} />} />
<StatTile tone="ink" label="Active site clinics" value="7" footnote="3 remote, 4 industrial" />
```

A downward delta is not automatically bad — set `deltaDirection` from meaning, not arithmetic.
