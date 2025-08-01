# ADR 002: Adopt ESLint and Prettier for Code Quality

**Date:** 2025-08-01

**Status:** Accepted

## Context

The project was initiated without a standardized linter or code formatter. This could lead to inconsistent coding styles, hard-to-spot bugs, and increased effort in code reviews debating style instead of substance.

## Decision

We will adopt **ESLint** for identifying and reporting on patterns in JavaScript/TypeScript and **Prettier** for automatic code formatting.

## Rationale

*   **Consistency:** Enforces a single, consistent coding style across the entire codebase, improving readability.
*   **Bug Prevention:** ESLint can catch common errors and potential bugs before they make it into production.
*   **Automation:** Prettier automatically formats code on save or as a pre-commit hook, removing the manual effort of formatting and eliminating style-based arguments.
*   **Industry Standard:** These are the de-facto standard tools in the JavaScript ecosystem, with extensive documentation and community support.

## Consequences

*   All new and modified code must adhere to the defined ESLint and Prettier rules.
*   A small initial setup effort is required to configure the tools and integrate them into the development workflow.
*   The project gains long-term maintainability and a higher standard of code quality.
