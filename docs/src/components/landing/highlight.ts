import { createServerFn } from "@tanstack/react-start";
import { highlight } from "fumadocs-core/highlight";
import { renderToString } from "react-dom/server";
import { OVERRIDE_CODE, SCHEMA_CODE, WIRE_CODE } from "./data.ts";

const THEME = "vitesse-dark";

async function toHtml(code: string): Promise<string> {
  const node = await highlight(code, {
    lang: "typescript",
    themes: { light: THEME, dark: THEME },
  });
  return renderToString(node);
}

export const getLandingSnippets = createServerFn({ method: "GET" }).handler(async () => {
  const [schemaHtml, wireHtml, overrideHtml] = await Promise.all([toHtml(SCHEMA_CODE), toHtml(WIRE_CODE), toHtml(OVERRIDE_CODE)]);
  return { schemaHtml, wireHtml, overrideHtml };
});

export type LandingSnippets = Awaited<ReturnType<typeof getLandingSnippets>>;
