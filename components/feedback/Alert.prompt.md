One-sentence: a persistent message anchored in the page — expiring certificates, incomplete records, regulatory notices.

```jsx
<Alert tone="warning" title="4 certificates expire this month"
  icon={<Icon name="calendar-clock" size={18} />}
  actions={<Button size="sm" variant="secondary">Review schedule</Button>}>
  Jazan Site 4 and Yanbu Terminal have workers due for periodic examination.
</Alert>
```

Use Toast for transient confirmations; Alert for anything that should still be there on reload.
