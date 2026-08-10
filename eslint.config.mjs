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
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },

  {
    files: [
      "src/features/resume/components/**/*.tsx",
      "src/features/ai-apply/components/resume/**/*.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "LogicalExpression[operator=/^(\\|\\||\\?\\?)$/] > Literal.right[value=/^[A-Z][A-Za-z]/]",
          message:
            "Placeholder text in a résumé fabricates user data. Use displayText/firstText/joinParts/dateRangeText from @/lib/utils/helpers and omit the element when empty.",
        },
      ],
    },
  },
];

export default eslintConfig;