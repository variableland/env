import type { ReactNode } from "react";

export function SectionHead({ num, title, children }: { num: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div
      className="
        relative max-w-[920px]
        mx-0 mb-14 mt-[120px] px-16
        @max-[1100px]/dirA:mb-12 @max-[1100px]/dirA:mt-24 @max-[1100px]/dirA:px-10
        @max-[760px]/dirA:mb-10 @max-[760px]/dirA:mt-[88px] @max-[760px]/dirA:px-7
        @max-[480px]/dirA:mb-8 @max-[480px]/dirA:mt-[72px] @max-[480px]/dirA:px-5
      "
    >
      <span
        className="
          mb-[18px] inline-block rounded-[4px]
          border border-landing-accent-dim
          px-[9px] py-1 font-landing-mono text-[11px] uppercase tracking-[0.12em] text-landing-accent
          @max-[480px]/dirA:px-[7px] @max-[480px]/dirA:py-[3px] @max-[480px]/dirA:text-[10px]
        "
      >
        {num}
      </span>
      <h2
        className="
          mb-[18px] max-w-[18ch] text-balance text-[42px] font-medium leading-[1.08] tracking-tight
          @max-[760px]/dirA:text-[34px]
          @max-[480px]/dirA:text-[28px] @max-[480px]/dirA:leading-[1.12] @max-[480px]/dirA:tracking-[-0.02em]
        "
      >
        {title}
      </h2>
      {children ? (
        <p
          className="
            m-0 max-w-[64ch] text-base leading-[1.55] text-landing-dim
            @max-[480px]/dirA:text-[14.5px]
            [&_code]:rounded-[4px] [&_code]:border [&_code]:border-landing-border
            [&_code]:bg-landing-panel [&_code]:px-1.5 [&_code]:py-0.5
            [&_code]:font-landing-mono [&_code]:text-[13px] [&_code]:text-landing-text
            @max-[480px]/dirA:[&_code]:text-[12px]
          "
        >
          {children}
        </p>
      ) : null}
    </div>
  );
}
