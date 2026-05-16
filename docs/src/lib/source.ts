import { loader } from "fumadocs-core/source";
import { icons } from "lucide-react";
import { createElement } from "react";
import { docs } from "#collections/server.ts";
import { ZodSvg } from "#src/components/zod-icon.tsx";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  icon(icon) {
    if (!icon) return;
    if (icon === "Zod") return createElement(ZodSvg);
    if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
  },
});
