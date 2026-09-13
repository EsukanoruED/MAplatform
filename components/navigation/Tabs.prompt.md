One-sentence: switches between sibling views of the same object — worker record sections, site dashboards.

```jsx
<Tabs value={tab} onChange={setTab}
  items={[
    { value: 'overview', label: 'Overview' },
    { value: 'exams', label: 'Examinations', count: 12 },
    { value: 'certs', label: 'Certificates', count: 4 },
  ]} />
```

Five tabs maximum. Never use tabs for a linear process — that's a stepper.
