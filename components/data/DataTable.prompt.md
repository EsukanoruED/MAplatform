One-sentence: the portal's record list — workers, certificates, site visits, equipment stock.

```jsx
<DataTable
  onRowClick={openWorker}
  columns={[
    { key: 'id', header: 'Worker ID', mono: true, width: '130px' },
    { key: 'name', header: 'Name' },
    { key: 'status', header: 'Fitness', render: (r) => <Badge tone={r.tone} dot>{r.status}</Badge> },
    { key: 'expires', header: 'Certificate expires', align: 'end', numeric: true },
  ]}
  rows={workers}
/>
```

Notes
- IDs and reference numbers always get `mono`. Dates and counts always get `numeric`.
- Abbreviate long lists in mocks to 5–8 rows; never fake a scrollbar.
