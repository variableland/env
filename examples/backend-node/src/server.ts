import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { env } from "./env/index.ts";

// biome-ignore format: I prefer to keep the code as is for better readability
const app = new Hono()
  .get("/health", (c) => c.json({ ok: true }))
  .get("/env", (c) => c.json({ env }));

serve({ fetch: app.fetch, port: env.server.PORT, hostname: env.server.HOST }, () => {
  console.log(`[${env.$name}] listening on http://${env.server.HOST}:${env.server.PORT}`);
});
