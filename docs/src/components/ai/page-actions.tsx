import { CheckIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";
import { useState } from "react";

interface PageActionsProps {
  markdownUrl: string;
  githubUrl?: string;
}

export function LLMCopyButton({ markdownUrl }: { markdownUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const res = await fetch(markdownUrl);
    const text = await res.text();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-md border bg-fd-secondary/50 px-2.5 py-1 text-xs text-fd-secondary-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
    >
      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
      Copy as Markdown
    </button>
  );
}

export function ViewOptions({ markdownUrl, githubUrl }: PageActionsProps) {
  return (
    <div className="inline-flex items-center gap-1">
      <a
        href={markdownUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md border bg-fd-secondary/50 px-2.5 py-1 text-xs text-fd-secondary-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
      >
        <ExternalLinkIcon className="size-3.5" />
        View as Markdown
      </a>
      {githubUrl ? (
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border bg-fd-secondary/50 px-2.5 py-1 text-xs text-fd-secondary-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
        >
          <ExternalLinkIcon className="size-3.5" />
          Edit on GitHub
        </a>
      ) : null}
    </div>
  );
}
