import { config } from "@susisu/eslint-config";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import vitestPlugin from "eslint-plugin-vitest";
import globals from "globals";

export default config({}, [
  {
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      vitest: vitestPlugin,
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.es2021,
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/prop-types": "off",
    },
  },
  {
    files: ["src/**/*.spec.{ts,tsx}", "src/**/__tests__/**/*.{ts,tsx}"],
    rules: {
      ...vitestPlugin.configs.recommended.rules,
    },
  },
  {
    files: ["*.js"],
    languageOptions: {
      globals: {
        ...globals.es2021,
        ...globals.node,
      },
    },
  },
]);
