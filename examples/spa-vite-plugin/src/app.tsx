import { env } from "./env/index.ts";

export function App() {
  return (
    <main>
      <h1>spa-vite-plugin</h1>
      <dl>
        <dt>mode</dt>
        <dd data-testid="mode">{env.$name}</dd>
        <dt>api.BASE_URL</dt>
        <dd data-testid="api-base-url">{env.api.BASE_URL}</dd>
        <dt>api.TIMEOUT_MS</dt>
        <dd data-testid="api-timeout">{env.api.TIMEOUT_MS}</dd>
        <dt>feature.ANALYTICS</dt>
        <dd data-testid="feature-analytics">{String(env.feature.ANALYTICS)}</dd>
        <dt>build.LABEL</dt>
        <dd data-testid="build-label">{env.build.LABEL}</dd>
      </dl>
    </main>
  );
}
