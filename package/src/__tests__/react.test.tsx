import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { ENV_SCRIPT_ID } from "../lib/index.ts";
import { EnvScript } from "../react.tsx";

it("render the client env", async () => {
  const runtimeEnv = { ENV: "development" };

  const { container } = await render(<EnvScript runtimeEnv={runtimeEnv} />);

  const el = container.querySelector("#env");
  expect(el?.textContent).toBe(JSON.stringify(runtimeEnv));
});

it("renders as a script tag with type application/json", async () => {
  const runtimeEnv = { API_URL: "https://api.example.com" };

  const { container } = await render(<EnvScript runtimeEnv={runtimeEnv} />);

  const el = container.querySelector("script");
  expect(el).not.toBeNull();
  expect(el?.getAttribute("type")).toBe("application/json");
  expect(el?.getAttribute("id")).toBe(ENV_SCRIPT_ID);
});

it("renders multiple env vars as valid JSON", async () => {
  const runtimeEnv = {
    ENV: "production",
    API_URL: "https://api.example.com",
    DEBUG: "false",
  };

  const { container } = await render(<EnvScript runtimeEnv={runtimeEnv} />);

  const el = container.querySelector("#env");
  const parsed = JSON.parse(el?.textContent ?? "");
  expect(parsed).toStrictEqual(runtimeEnv);
});

it("renders an empty object when runtimeEnv is empty", async () => {
  const { container } = await render(<EnvScript runtimeEnv={{}} />);

  const el = container.querySelector("#env");
  expect(el?.textContent).toBe("{}");
});

it("renders nested values as JSON", async () => {
  const runtimeEnv = {
    DB: { HOST: "localhost", PORT: "5432" },
  };

  const { container } = await render(<EnvScript runtimeEnv={runtimeEnv} />);

  const el = container.querySelector("#env");
  const parsed = JSON.parse(el?.textContent ?? "");
  expect(parsed).toStrictEqual(runtimeEnv);
});

it("updates content when runtimeEnv changes", async () => {
  const initial = { ENV: "development" };
  const updated = { ENV: "production" };

  const { container, rerender } = await render(<EnvScript runtimeEnv={initial} />);

  const el = container.querySelector("#env");
  expect(JSON.parse(el?.textContent ?? "")).toStrictEqual(initial);

  await rerender(<EnvScript runtimeEnv={updated} />);

  expect(JSON.parse(el?.textContent ?? "")).toStrictEqual(updated);
});
