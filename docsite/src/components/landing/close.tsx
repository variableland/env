import { ArrowRight } from "lucide-react";
import { GithubIcon } from "#src/components/github-icon.tsx";
import { LANDING_META } from "./data.ts";

export function Close() {
  return (
    <section
      data-landing-close
      className="
        relative mt-20 border-t border-landing-border
        px-16 pb-[100px] pt-40 text-center
        @max-[1100px]/dirA:px-10 @max-[1100px]/dirA:pb-20 @max-[1100px]/dirA:pt-[120px]
        @max-[760px]/dirA:px-7 @max-[760px]/dirA:pb-[72px] @max-[760px]/dirA:pt-[104px]
        @max-[480px]/dirA:mt-14 @max-[480px]/dirA:px-5 @max-[480px]/dirA:pb-14 @max-[480px]/dirA:pt-20
      "
    >
      <div className="relative">
        <h2
          className="
            mb-9 text-[56px] font-medium leading-[1.05] tracking-[-0.03em]
            @max-[760px]/dirA:text-[46px]
            @max-[480px]/dirA:mb-7 @max-[480px]/dirA:text-[34px] @max-[480px]/dirA:leading-[1.08]
          "
        >
          One schema for every environment,
          <br />
          <span className="font-medium italic text-landing-accent">validated</span> at boot.
        </h2>

        <div
          className="
            mx-auto mb-10 flex flex-wrap justify-center gap-3
            @max-[480px]/dirA:flex-col @max-[480px]/dirA:items-stretch @max-[480px]/dirA:gap-2.5
          "
        >
          <a
            href={LANDING_META.docsHref}
            className="
              group inline-flex min-w-[168px] items-center justify-center gap-2.5
              rounded-lg border border-landing-accent bg-landing-accent
              px-[22px] py-[13px] text-[14.5px] font-medium text-[#06231b] no-underline
              transition-colors hover:bg-[#4ce0a8]
            "
          >
            Read the docs
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
          </a>
          <a
            href={LANDING_META.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="
              inline-flex min-w-[168px] items-center justify-center gap-2.5
              rounded-lg border border-landing-border-strong bg-landing-panel
              px-[22px] py-[13px] text-[14.5px] font-medium text-landing-text no-underline
              transition-colors hover:border-landing-dim hover:bg-landing-panel-2
            "
          >
            <GithubIcon size={15} />
            View on GitHub
          </a>
        </div>

        <div
          className="
            flex flex-wrap justify-center gap-2.5 font-landing-mono text-xs text-landing-dim-2
            @max-[480px]/dirA:gap-1.5 @max-[480px]/dirA:text-[10.5px]
          "
        >
          <span>MIT licensed</span>
          <span className="text-landing-border-strong">·</span>
          <span>made at</span>
          <a
            href="https://variable.land"
            target="_blank"
            rel="noreferrer"
            className="text-landing-dim-2 transition-colors hover:text-landing-accent"
          >
            Variable Land
          </a>
          <span className="text-landing-border-strong">·</span>
          <span>{LANDING_META.version}</span>
          <span className="text-landing-border-strong">·</span>
          <span>{LANDING_META.publishDate}</span>
        </div>
      </div>
    </section>
  );
}
