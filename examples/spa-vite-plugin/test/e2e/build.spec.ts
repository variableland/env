import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const DIST = path.join(ROOT, "dist");

function runViteBuild(mode: string, env?: Record<string, string>) {
  return spawnSync("pnpm", ["exec", "vite", "build", "--mode", mode], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 60_000,
    env: { ...process.env, ...env },
  });
}

function readAllJs(): string {
  const assets = path.join(DIST, "assets");
  const files = readdirSync(assets).filter((f) => f.endsWith(".js"));
  return files.map((f) => readFileSync(path.join(assets, f), "utf8")).join("\n");
}

test.describe("per-mode bundle isolation (envConfig plugin)", () => {
  test.beforeEach(() => {
    rmSync(DIST, { recursive: true, force: true });
  });

  test("production build embeds only production config values", () => {
    const result = runViteBuild("production");
    expect(result.status, result.stderr).toBe(0);

    const bundle = readAllJs();
    expect(bundle).toContain("prod-build-marker-b71c");
    expect(bundle).toContain("https://api.example.com");
    expect(bundle).not.toContain("dev-build-marker-9f3a");
    expect(bundle).not.toContain("/dev-api");
  });

  test("development build embeds only development config values", () => {
    const result = runViteBuild("development");
    expect(result.status, result.stderr).toBe(0);

    const bundle = readAllJs();
    expect(bundle).toContain("dev-build-marker-9f3a");
    expect(bundle).not.toContain("prod-build-marker-b71c");
  });

  test("VITE_ENV selects the env, overriding --mode", () => {
    // --mode development would normally embed the development config, but
    // VITE_ENV=production wins — proving the plugin keys off the env var.
    const result = runViteBuild("development", { VITE_ENV: "production" });
    expect(result.status, result.stderr).toBe(0);

    const bundle = readAllJs();
    expect(bundle).toContain("prod-build-marker-b71c");
    expect(bundle).not.toContain("dev-build-marker-9f3a");
  });

  test("build fails when no config file matches the env", () => {
    const result = runViteBuild("staging");
    expect(result.status).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(/no config file found for env "staging"/);
  });
});
