"use strict";

module.exports = {
  plugins: ["react", "react-hooks", "jest", "jest-formatting"],
  overrides: [
    {
      files: ["*.{ts,tsx}"],
      extends: [
        "@susisu/eslint-config/preset/ts-types",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:eslint-comments/recommended",
        "prettier",
        "prettier/@typescript-eslint",
        "prettier/react",
      ],
      parserOptions: {
        ecmaVersion: 2019,
        sourceType: "module",
        project: "./tsconfig.json",
      },
      env: {
        es6: true,
        browser: true,
      },
      settings: {
        react: {
          version: "detect",
        },
      },
      rules: {
        "react/jsx-uses-react": "off",
        "react/prop-types": "off",
        "react/react-in-jsx-scope": "off",
        "eslint-comments/no-unused-disable": "error",
      },
    },
    {
      files: ["*.{test,spec}.{ts,tsx}", "src/**/__tests__/**/*.{ts,tsx}"],
      extends: ["plugin:jest/recommended", "plugin:jest-formatting/recommended"],
      env: {
        "jest/globals": true,
      },
      rules: {
        "@typescript-eslint/no-floating-promises": "off",
      },
    },
    {
      files: ["*.js"],
      extends: [
        "@susisu/eslint-config/preset/es",
        "plugin:eslint-comments/recommended",
        "prettier",
      ],
      parserOptions: {
        ecmaVersion: 2019,
        sourceType: "script",
      },
      env: {
        es6: true,
        node: true,
      },
      rules: {
        "eslint-comments/no-unused-disable": "error",
      },
    },
  ],
};
