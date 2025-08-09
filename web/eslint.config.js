import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    ignores: ["dist/**"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        process: "readonly",
        global: "readonly",
        chrome: "readonly",
        browser: "readonly",
        gapi: "readonly",
        BlobBuilder: "readonly",
        WebKitBlobBuilder: "readonly",
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig,
  prettierConfig,
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-case-declarations": "off",
      "no-fallthrough": "off",
    },
  },
];