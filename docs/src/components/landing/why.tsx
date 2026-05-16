import { WHY_POINTS } from "./data.ts";
import { SectionHead } from "./section-head.tsx";

export function Why() {
  return (
    <section
      className="
        px-16 pb-10
        @max-[1100px]/dirA:px-10
        @max-[760px]/dirA:px-7
        @max-[480px]/dirA:px-5
      "
    >
      <SectionHead num="01" title="The problem with reading env vars directly.">
        <code>process.env</code> is a string-map of unknowns. The first time you find out a value is missing is when something
        else crashes downstream.
      </SectionHead>

      <div className="border-t border-landing-border">
        {WHY_POINTS.map((p, i) => (
          <div
            key={p.bad}
            className="
              grid items-start gap-7 border-b border-landing-border py-9
              grid-cols-[56px_1fr_40px_1fr]
              @max-[760px]/dirA:gap-x-4 @max-[760px]/dirA:gap-y-3.5 @max-[760px]/dirA:py-7
              @max-[760px]/dirA:grid-cols-[40px_1fr]
              @max-[760px]/dirA:[grid-template-areas:'idx_bad''._arrow''._good']
              @max-[480px]/dirA:grid-cols-[1fr]
              @max-[480px]/dirA:[grid-template-areas:'idx''bad''arrow''good']
              @max-[480px]/dirA:gap-2.5 @max-[480px]/dirA:py-6
            "
          >
            <div
              className="
                pt-6 font-landing-mono text-xs text-landing-dim-2
                @max-[760px]/dirA:[grid-area:idx] @max-[760px]/dirA:pt-[22px]
                @max-[480px]/dirA:pt-0 @max-[480px]/dirA:text-[10.5px]
              "
            >
              {String(i + 1).padStart(2, "0")}
            </div>

            <div
              className="
                flex flex-col gap-3
                @max-[760px]/dirA:[grid-area:bad]
              "
            >
              <span
                className="
                  self-start rounded-[3px] border border-landing-bad/30
                  px-2 py-[3px] font-landing-mono text-[10px] uppercase tracking-widest text-landing-bad
                  @max-[480px]/dirA:text-[9.5px]
                "
              >
                before
              </span>
              <p
                data-why-bad
                className="
                  m-0 text-[19px] font-normal leading-[1.4] text-landing-dim
                  @max-[760px]/dirA:text-[17px]
                  @max-[480px]/dirA:text-[15.5px]
                "
              >
                {p.bad}
              </p>
            </div>

            <div
              className="
                pt-8 text-center text-2xl text-landing-dim-2
                @max-[760px]/dirA:[grid-area:arrow] @max-[760px]/dirA:pt-0 @max-[760px]/dirA:text-left
                @max-[480px]/dirA:text-lg
              "
            >
              <span className="hidden @max-[760px]/dirA:inline">↓</span>
              <span className="@max-[760px]/dirA:hidden">→</span>
            </div>

            <div
              className="
                flex flex-col gap-3
                @max-[760px]/dirA:[grid-area:good]
              "
            >
              <span
                className="
                  self-start rounded-[3px] border border-landing-accent-dim
                  px-2 py-[3px] font-landing-mono text-[10px] uppercase tracking-widest text-landing-accent
                  @max-[480px]/dirA:text-[9.5px]
                "
              >
                after
              </span>
              <p
                className="
                  m-0 text-[21px] font-medium leading-[1.35] tracking-[-0.01em] text-landing-text
                  @max-[760px]/dirA:text-[19px]
                  @max-[480px]/dirA:text-[17.5px] @max-[480px]/dirA:tracking-normal
                "
              >
                {p.good}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
