One-sentence: the standard labelled input for intake forms, worker records and contact forms.

```jsx
<TextField label="Worker ID" required placeholder="e.g. MA-40118" hint="As printed on the site badge" />
<TextField label="Clinical notes" multiline rows={5} />
<TextField label="Email" error="Enter a valid work email" defaultValue="ops@" />
```

Notes
- Labels are sentence case and never end in a colon. Hints are one short sentence, no period needed.
- Errors say what to do, not what went wrong: "Enter a valid work email", not "Invalid input".
