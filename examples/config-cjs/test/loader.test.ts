import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { describe, it } from "node:test";

// A real CJS `require`, the way some tooling pulls in its config file. On Node
// ≥22.18 `require()` loads ES modules and strips TypeScript, but it still
// refuses an ES module graph that uses top-level await.
const require = createRequire(import.meta.url);

describe("config file loading in a CJS / no-top-level-await context", () => {
  it("selectConfig (sync) loads fine via require()", () => {
    const mod = require("../db.config.mts") as { default: { dialect: string; dbCredentials: { url: string } } };
    assert.equal(mod.default.dialect, "postgresql");
    assert.equal(mod.default.dbCredentials.url, "postgres://localhost/dev");
  });

  it("loadConfig + top-level await throws ERR_REQUIRE_ASYNC_MODULE via require()", () => {
    assert.throws(
      () => require("../db.config.broken.mts"),
      (err: NodeJS.ErrnoException) => err.code === "ERR_REQUIRE_ASYNC_MODULE",
    );
  });
});
