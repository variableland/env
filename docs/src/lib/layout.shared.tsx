import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <span aria-hidden>🌱</span>
          <span>@vlandoss/env</span>
        </>
      ),
    },
    githubUrl: "https://github.com/variableland/env",
  };
}
