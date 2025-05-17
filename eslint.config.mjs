import pluginNext from "@next/eslint-plugin-next";

export default [
  {
    plugins: {
      "@next/next": pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
    },
  },
];
