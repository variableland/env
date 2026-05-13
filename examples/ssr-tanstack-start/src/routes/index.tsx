import { createFileRoute } from "@tanstack/react-router";
import { env as publicEnv } from "../env/env.public.ts";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main>
      <h1>ssr-tanstack-start</h1>
      <dl>
        <dt>mode</dt>
        <dd data-testid="mode">{publicEnv.$name}</dd>
        <dt>APP_NAME</dt>
        <dd data-testid="app-name">{publicEnv.APP_NAME}</dd>
        <dt>API_BASE_URL</dt>
        <dd data-testid="api-base-url">{publicEnv.API_BASE_URL}</dd>
      </dl>
    </main>
  );
}
