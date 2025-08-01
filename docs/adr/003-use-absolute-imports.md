# ADR 003: Use Absolute Imports for Module Resolution

**Date:** 2025-08-01

**Status:** Accepted

## Context

As the project grows, using relative imports (e.g., `../../services/authService`) becomes increasingly complex and fragile. These paths are hard to manage, difficult to refactor, and can make it unclear where a module is located.

## Decision

We will use **absolute imports** with a path alias (`~/*`) for all modules within the project. For example, `import { authService } from '~/services/authService';`.

## Rationale

*   **Clarity and Readability:** Absolute imports make it immediately clear where a module is located within the project structure.
*   **Refactor-Friendly:** Moving files or components does not require updating relative import paths in other files, which is a common source of errors.
*   **Consistency:** Ensures a consistent and clean import style across the entire application.

## Consequences

*   The `tsconfig.json` and `vite.config.ts` files are configured with a path alias to support this.
*   All developers must use the `~/*` alias for internal project imports.
*   This improves the overall developer experience and reduces the cognitive load of navigating the codebase.
