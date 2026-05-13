import { defineDocs } from "fumadocs-mdx/config";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    postprocess: {
      // Required so `page.data.getText('processed')` returns markdown for /llms-full.txt
      includeProcessedMarkdown: true,
    },
  },
});
