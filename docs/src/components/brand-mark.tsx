export function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" aria-hidden="true">
      <text
        x="128"
        y="174"
        textAnchor="middle"
        fontSize="159"
        letterSpacing="-4.77"
        fontFamily='"Geist Mono Variable", ui-monospace, monospace'
        fontWeight="500"
      >
        <tspan fill="#8a8a92">{"{"}</tspan>
        <tspan fill="#34d399">e</tspan>
        <tspan fill="#8a8a92">{"}"}</tspan>
      </text>
    </svg>
  );
}
