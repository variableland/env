import { createFileRoute, notFound } from "@tanstack/react-router";
import { getLLMText } from "#src/lib/get-llm-text.ts";
import { source } from "#src/lib/source.ts";

export const Route = createFileRoute("/raw/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = params._splat?.split("/").filter(Boolean) ?? [];
        // `/index.mdx` and `/{folder}/index.mdx` map to the directory index page.
        const slugs = raw.at(-1) === "index" ? raw.slice(0, -1) : raw;
        const page = source.getPage(slugs);
        if (!page) throw notFound();

        return new Response(await getLLMText(page), {
          headers: { "Content-Type": "text/markdown; charset=utf-8" },
        });
      },
    },
  },
});
