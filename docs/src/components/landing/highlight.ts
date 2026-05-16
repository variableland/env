import { createServerFn } from "@tanstack/react-start";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { OVERRIDE_CODE, SCHEMA_CODE, WIRE_CODE } from "./data.ts";

const THEME = "vitesse-dark";

const highlighterPromise = createHighlighterCore({
  themes: [import("@shikijs/themes/vitesse-dark")],
  langs: [import("@shikijs/langs/typescript")],
  engine: createJavaScriptRegexEngine(),
});

async function toHtml(code: string): Promise<string> {
  const highlighter = await highlighterPromise;
  return highlighter.codeToHtml(code, { lang: "typescript", theme: THEME });
}

export const getLandingSnippets = createServerFn({ method: "GET" }).handler(async () => {
  const [schemaHtml, wireHtml, overrideHtml] = await Promise.all([toHtml(SCHEMA_CODE), toHtml(WIRE_CODE), toHtml(OVERRIDE_CODE)]);
  return { schemaHtml, wireHtml, overrideHtml };
});

export type LandingSnippets = Awaited<ReturnType<typeof getLandingSnippets>>;
