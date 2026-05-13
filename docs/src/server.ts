import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";

// Public `/foo.mdx` URLs and `Accept: text/markdown` requests both serve raw
// markdown via the internal `/raw/{slug}` route. We rewrite here so the route
// tree stays a vanilla splat (TanStack Router has no documented pattern that
// combines `$` splat with a literal `.mdx` suffix).
const { rewrite: stripMdxSuffix } = rewritePath("{/*path}.mdx", "/raw{/*path}");
const { rewrite: rewriteToRaw } = rewritePath("{/*path}", "/raw{/*path}");

export default createServerEntry({
  fetch(request) {
    const url = new URL(request.url);

    const explicitMdx = stripMdxSuffix(url.pathname);
    if (explicitMdx) {
      const rewritten = new Request(new URL(explicitMdx, url), request);
      return handler.fetch(rewritten);
    }

    if (isMarkdownPreferred(request)) {
      const negotiated = rewriteToRaw(url.pathname);
      if (negotiated) {
        const rewritten = new Request(new URL(negotiated, url), request);
        return handler.fetch(rewritten);
      }
    }

    return handler.fetch(request);
  },
});
