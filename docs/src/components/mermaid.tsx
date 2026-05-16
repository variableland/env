import { useEffect, useId, useRef, useState } from "react";

export function Mermaid({ chart }: { chart: string }) {
  const reactId = useId();
  const renderId = `mermaid-${reactId.replace(/:/g, "")}`;
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        const isDark = document.documentElement.classList.contains("dark");

        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "neutral",
          securityLevel: "strict",
          fontFamily: "var(--font-sans, ui-sans-serif, system-ui)",
        });

        const { svg } = await mermaid.render(renderId, chart);
        if (cancelled || !ref.current) return;
        ref.current.innerHTML = svg;
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, renderId]);

  if (error) {
    return <pre className="text-fd-muted-foreground text-sm whitespace-pre-wrap">Failed to render diagram: {error}</pre>;
  }

  return <div ref={ref} className="not-prose my-6 flex justify-center" />;
}
