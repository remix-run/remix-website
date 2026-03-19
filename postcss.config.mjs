// postcss-import must run before Tailwind so `@import` is inlined and
// `@tailwind` / `@apply` in those files are expanded (not emitted raw).
export default {
  plugins: {
    "postcss-import": {},
    "tailwindcss/nesting": {},
    tailwindcss: {},
    autoprefixer: {},
    cssnano: { preset: "default" },
  },
};
