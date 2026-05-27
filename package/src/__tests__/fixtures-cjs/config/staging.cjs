// Exports an object that literally has a `default` key alongside the real
// config. `unwrapDefault` must NOT strip this object to its `default` value;
// for CJS (no `Symbol.toStringTag === "Module"`), `module.exports` IS the
// config, sibling keys included.
module.exports = {
  default: "not-the-config",
  server: { PORT: 9999, HOST: "cjs.staging" },
};
