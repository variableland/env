---
"@vlandoss/env": minor
---

Add `json` primitive to `@vlandoss/env/zod`: `e.json(schema)` decodes a
JSON-string env var into a validated object and also accepts the decoded
object from config files / defaults (codec `.or(schema)`, same dual-source
pattern as `e.bool`).
