import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen.ts";

// TanStack Start expects `getRouter` exported from src/router.tsx.
export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
