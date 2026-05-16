const fs = require("node:fs");
const path = require("node:path");

const SITE = "http://127.0.0.1:4173";
const DOCS_ROOT = path.join(__dirname, "content/docs");

function collectDocUrls(dir, urlPrefix = "/docs") {
  const urls = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      urls.push(...collectDocUrls(full, `${urlPrefix}/${entry.name}`));
    } else if (entry.name.endsWith(".mdx")) {
      const slug = entry.name.replace(/\.mdx$/, "");
      urls.push(slug === "index" ? urlPrefix : `${urlPrefix}/${slug}`);
    }
  }
  return urls;
}

const urls = ["/", ...collectDocUrls(DOCS_ROOT)].map((p) => `${SITE}${p}`);

module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm exec vite preview --host 127.0.0.1 --port 4173 --strictPort",
      url: urls,
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--no-sandbox",
      },
    },
    assert: {
      assertions: {
        "categories:seo": ["error", { minScore: 1.0 }],
        "categories:best-practices": ["error", { minScore: 1.0 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
        "categories:performance": ["warn", { minScore: 0.5 }],
      },
    },
  },
};
