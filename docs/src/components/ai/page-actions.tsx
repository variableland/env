import { CheckIcon, CopyIcon, FileTextIcon, PencilIcon } from "lucide-react";
import { useState } from "react";

interface PageActionsProps {
  markdownUrl: string;
  githubUrl?: string;
}

const buttonClasses =
  "inline-flex size-11 items-center justify-center whitespace-nowrap rounded-md border bg-fd-secondary/50 text-xs text-fd-secondary-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring md:size-auto md:gap-1.5 md:px-2.5 md:py-1";

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
    <button type="button" onClick={copy} aria-label="Copy as Markdown" title="Copy as Markdown" className={buttonClasses}>
      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
      <span className="sr-only md:not-sr-only">Copy as Markdown</span>
    </button>
  );
}

export function ViewOptions({ markdownUrl, githubUrl }: PageActionsProps) {
  return (
    <div className="contents md:inline-flex md:items-center md:gap-1">
      <a
        href={markdownUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="View as Markdown"
        title="View as Markdown"
        className={buttonClasses}
      >
        <FileTextIcon className="size-3.5" />
        <span className="sr-only md:not-sr-only">View as Markdown</span>
      </a>
      {githubUrl ? (
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Edit on GitHub"
          title="Edit on GitHub"
          className={buttonClasses}
        >
          <PencilIcon className="size-3.5" />
          <span className="sr-only md:not-sr-only">Edit on GitHub</span>
        </a>
      ) : null}
    </div>
  );
}
