---
"@vlandoss/env": minor
---

**BREAKING** Rename `@vlandoss/env/node` to `@vlandoss/env/fs`. The entrypoint has always been about file-system access on a Node-compatible runtime — the new name reflects that it works on Node, Bun, and Deno (not just Node), and that it does not work on Workers/Edge. The dynamic-import path resolution now uses `pathToFileURL` so Deno can load absolute paths correctly.

Migration: replace `from "@vlandoss/env/node"` with `from "@vlandoss/env/fs"`.
