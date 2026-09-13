One-sentence: interrupts for a decision that can't be deferred — issuing a certificate, confirming an unfit outcome.

```jsx
<Modal open={open} onClose={close} title="Issue fitness certificate"
  description="This record will be locked once the certificate is issued."
  footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button>Issue certificate</Button></>}>
  Worker MA-40118 · Periodic examination · 12 Sep 2026
</Modal>
```

Never nest modals. Never put a form longer than six fields in one.
