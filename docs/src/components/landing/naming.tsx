import { NAMING_ROWS } from "./data.ts";
import { SectionHead } from "./section-head.tsx";

export function Naming({ overrideHtml }: { overrideHtml: string }) {
  return (
    <section
      className="
        px-16 pb-10
        @max-[1100px]/dirA:px-10
        @max-[760px]/dirA:px-7
        @max-[480px]/dirA:px-5
      "
    >
      <SectionHead num="03" title="No mapping ceremony. Just dot-path → SCREAMING_SNAKE.">
        camelCase keys are converted automatically. Override the rare exception with a one-line entry in <code>vars</code>.
      </SectionHead>

      <div
        className="
          grid items-start gap-8
          grid-cols-2
          @max-[1100px]/dirA:grid-cols-1 @max-[1100px]/dirA:gap-7
        "
      >
        <table className="w-full border-collapse font-landing-mono text-sm">
          <thead>
            <tr>
              <th
                className="
                  border-b border-landing-border py-2.5 text-left
                  font-normal text-[11px] uppercase tracking-[0.08em] text-landing-dim-2
                  @max-[480px]/dirA:text-[10px]
                "
              >
                schema path
              </th>
              <th
                className="
                  border-b border-landing-border py-2.5 text-left
                  font-normal text-[11px] uppercase tracking-[0.08em] text-landing-dim-2
                  @max-[480px]/dirA:text-[10px]
                "
              >
                env var
              </th>
            </tr>
          </thead>
          <tbody>
            {NAMING_ROWS.map(([from, to]) => (
              <tr key={from}>
                <td
                  className="
                    border-b border-landing-border py-3.5
                    @max-[480px]/dirA:py-3
                  "
                >
                  <code
                    className="
                      text-[13.5px] text-landing-text
                      @max-[480px]/dirA:text-[12.5px] @max-[480px]/dirA:break-all
                    "
                  >
                    {from}
                  </code>
                </td>
                <td
                  className="
                    border-b border-landing-border py-3.5
                    @max-[480px]/dirA:py-3
                  "
                >
                  <span className="mr-2 text-landing-dim-2">→</span>
                  <code
                    className="
                      text-[13.5px] text-landing-accent
                      @max-[480px]/dirA:text-[12.5px] @max-[480px]/dirA:break-all
                    "
                  >
                    {to}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="relative">
          <div
            className="
              mb-2.5 font-landing-mono text-[10.5px] uppercase tracking-widest text-landing-dim
            "
          >
            override
          </div>
          <div
            data-shiki
            data-code-scroll
            className="
              overflow-hidden rounded-[10px] border border-landing-border bg-landing-panel
              py-4 px-2 font-landing-mono text-[12.5px] leading-[1.65] text-landing-text
              @max-[480px]/dirA:px-4 @max-[480px]/dirA:py-3.5 @max-[480px]/dirA:text-[11.5px] @max-[480px]/dirA:leading-[1.6]
            "
            dangerouslySetInnerHTML={{ __html: overrideHtml }}
          />
        </div>
      </div>
    </section>
  );
}
