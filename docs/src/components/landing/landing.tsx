import { Close } from "./close.tsx";
import { Entrypoints } from "./entrypoints.tsx";
import { Hero } from "./hero.tsx";
import type { LandingSnippets } from "./highlight.ts";
import { Naming } from "./naming.tsx";
import { LandingNav } from "./nav.tsx";
import { Why } from "./why.tsx";

export function Landing({ snippets }: { snippets: LandingSnippets }) {
  return (
    <div className="dir-a @container/dirA flex-1">
      <LandingNav />
      <Hero snippets={{ schemaHtml: snippets.schemaHtml, wireHtml: snippets.wireHtml }} />
      <Why />
      <Entrypoints />
      <Naming overrideHtml={snippets.overrideHtml} />
      <Close />
    </div>
  );
}
