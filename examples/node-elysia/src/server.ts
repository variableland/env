import { node } from "@elysiajs/node";
import { Elysia } from "elysia";
import { env } from "./env/index.ts";

new Elysia({ adapter: node() })
  .get("/health", () => ({ ok: true, env: env.$name }))
  .get("/env", () => ({
    name: env.$name,
    isDev: env.IS_DEV,
    isProd: env.IS_PROD,
    log: env.log,
    server: { PORT: env.server.PORT, HOST: env.server.HOST },
    db: { URL: env.db.URL, LOGGING: env.db.LOGGING },
  }))
  .listen({ port: env.server.PORT, hostname: env.server.HOST }, () => {
    console.log(`[${env.$name}] listening on http://${env.server.HOST}:${env.server.PORT}`);
  });
