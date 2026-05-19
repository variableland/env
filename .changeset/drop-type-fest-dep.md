---
"@vlandoss/env": patch
---

Drop the `type-fest` dependency. `PartialDeep` is now defined locally in `src/lib/types.ts` with an equivalent shape, so the public surface of `Config<S>` and `Defaults<S>` is unchanged. One fewer transitive dep for consumers.
