/** @type { import("eslint").Linter.Config } */
module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
        ecmaVersion: "latest",
        sourceType: "module",
    },
    env: {
        es2022: true,
        node: true
    },
    plugins: [
        "@typescript-eslint",
        "drizzle"
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/stylistic-type-checked",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:drizzle/all",
        "@augu",
        "@augu/eslint-config/ts.js",
    ],
    overrides: [
        {
            files: ["**/*.{ts,tsx}"],
            plugins: ["import"],
            settings: {
                "import/resolver": {
                    node: {
                        extensions: [".ts", ".tsx"],
                    },
                    typescript: {
                        alwaysTryTypes: true,
                    },
                },
                "react/no-unescaped-entities": "off",
            },
            extends: [
                "plugin:import/recommended",
                "plugin:import/typescript",
            ],
            rules: {
                "import/order": [
                    "error",
                    {
                        alphabetize: {
                            caseInsensitive: true,
                            order: "asc",
                        },
                        groups: [
                            "builtin",
                            "external",
                            "internal",
                            "parent",
                            "sibling",
                        ],
                        "newlines-between": "always",
                    },
                ],
                "import/no-named-as-default": "off",
                "@typescript-eslint/consistent-type-imports": "error",
                "@typescript-eslint/no-unsafe-assignment": "off",
                "no-duplicate-imports": "off",
                "quotes": ["error","double"]
            },
        },
        {
            files: ["*.js", "*.config.ts"],
            extends: ["plugin:@typescript-eslint/disable-type-checked"],
        },
    ]
};
