import type { source } from "@/lib/source.ts";

export async function getLLMText(page: ReturnType<(typeof source)["getPage"]> & object) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title} (${page.url})

${processed}`;
}
