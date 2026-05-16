export default function Home() {
  return (
    <main>
      <h1>edge-nextjs example</h1>
      <p>
        Hit <code>/api/env</code> for the resolved env, or <code>/api/health</code> for a liveness probe. Both routes run on the
        Edge runtime.
      </p>
    </main>
  );
}
