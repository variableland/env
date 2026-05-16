import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { HERO_TABS } from "./data.ts";

type Snippets = {
  schemaHtml: string;
  wireHtml: string;
};

export function HeroCodeCard({ snippets }: { snippets: Snippets }) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const tabHtml: readonly string[] = [snippets.schemaHtml, snippets.wireHtml];
  const activeTab = HERO_TABS[active] ?? HERO_TABS[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(activeTab.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      data-code-card
      className="
        overflow-hidden rounded-xl border border-landing-border-strong bg-landing-panel
      "
    >
      <div
        className="
          flex items-stretch gap-0 border-b border-landing-border bg-landing-bg-2
          min-h-10.5 px-4 text-xs
          @max-[480px]/dirA:min-h-9.5 @max-[480px]/dirA:px-2 @max-[480px]/dirA:text-[11px]
        "
      >
        <div
          className="
            mr-3.5 flex items-center gap-1.5
            @max-[480px]/dirA:hidden
          "
        >
          <span className="block size-2.25 rounded-full bg-[#3a3a3f]" />
          <span className="block size-2.25 rounded-full bg-[#3a3a3f]" />
          <span className="block size-2.25 rounded-full bg-[#3a3a3f]" />
        </div>

        <div role="tablist" data-code-scroll className="flex flex-1 items-stretch gap-0.5 min-w-0">
          {HERO_TABS.map((t, i) => {
            const selected = active === i;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(i)}
                data-active={selected || undefined}
                className="
                  relative inline-flex items-center gap-2 whitespace-nowrap
                  border-0 bg-transparent px-3.5 font-landing-mono text-xs
                  text-landing-dim transition-colors
                  hover:text-landing-text
                  data-active:text-landing-text
                  data-active:bg-[linear-gradient(180deg,transparent,rgba(52,211,153,0.05))]
                  after:absolute after:-bottom-px after:left-2 after:right-2 after:h-0.5
                  after:rounded-[1px] after:bg-transparent
                  data-active:after:bg-landing-accent
                  @max-[480px]/dirA:px-2.5 @max-[480px]/dirA:gap-1.5
                "
              >
                <span
                  className="
                    flex size-4.5 flex-none items-center justify-center
                    rounded-[3px] bg-[#3178c6] text-[9px] font-bold tracking-[0.04em] text-white
                    @max-[480px]/dirA:h-4 @max-[480px]/dirA:w-4 @max-[480px]/dirA:text-[8.5px]
                  "
                  aria-hidden
                >
                  TS
                </span>
                <span>{t.file}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={copy}
          className="
            ml-2 inline-flex items-center gap-1 self-center
            font-landing-mono text-[11px] text-landing-dim-2
            transition-colors hover:text-landing-dim
            @max-[480px]/dirA:text-[10.5px] @max-[480px]/dirA:ml-1
          "
          aria-label="Copy snippet"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? "copied" : "copy"}</span>
        </button>
      </div>

      <div className="grid">
        {HERO_TABS.map((t, i) => (
          <div
            key={t.id}
            role="tabpanel"
            aria-hidden={active !== i}
            data-shiki
            data-code-scroll
            data-hidden={active !== i || undefined}
            className="
              [grid-area:1/1] m-0 bg-landing-panel py-4 px-2
              font-landing-mono text-[13.5px] leading-[1.65] text-landing-text
              [background:linear-gradient(to_bottom,transparent,rgba(0,0,0,0.15)),var(--color-landing-panel)]
              data-hidden:invisible data-hidden:pointer-events-none
              @max-[760px]/dirA:px-5.5 @max-[760px]/dirA:py-5 @max-[760px]/dirA:text-[12.5px]
              @max-[480px]/dirA:px-4 @max-[480px]/dirA:py-4 @max-[480px]/dirA:text-[11.5px] @max-[480px]/dirA:leading-[1.6]
            "
            dangerouslySetInnerHTML={{ __html: tabHtml[i] ?? "" }}
          />
        ))}
      </div>

      <div
        className="
          grid border-t border-landing-border bg-landing-bg-2
          px-4.5 py-2.5 font-landing-mono text-[11.5px] text-landing-dim
          @max-[480px]/dirA:px-3.5 @max-[480px]/dirA:py-2.25 @max-[480px]/dirA:text-[11px]
        "
      >
        {HERO_TABS.map((t, i) => (
          <div
            key={t.id}
            data-hidden={active !== i || undefined}
            className="
              [grid-area:1/1] min-w-0
              data-hidden:invisible data-hidden:pointer-events-none
            "
          >
            <span className="mr-1.5 text-landing-accent">●</span>
            {t.foot}
          </div>
        ))}
      </div>
    </div>
  );
}
