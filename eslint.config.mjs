import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Apply to all files
    rules: {
      // Keep rules permissive for non-generated code
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-unsafe-finally": "off",
      "no-unsafe-optional-chaining": "off",
      "no-implicit-globals": "off",
      "no-shadow": "off",
      "no-use-before-define": "off",
      "@next/next/no-html-link-for-pages": "off",
      "prefer-const": "off",
      "no-console": "off",
    },
  },
  {
    // Ignore all files in prisma/generated/
    files: ["prisma/generated/**"],
    ignores: ["prisma/generated/**"],
    rules: {
      // Disable all rules for generated files
      "all": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-wrapper-object-types": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;