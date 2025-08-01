# ADR 001: Adopt Zustand for State Management

**Date:** 2025-08-01

**Status:** Accepted

## Context

The application was initially built with local state management in `App.tsx`, which was becoming a "God Component." This made the code difficult to maintain, test, and scale. We needed a global state management solution to solve this problem.

## Decision

We decided to adopt **Zustand** for global state management.

## Rationale

We chose Zustand for the following reasons:

*   **Simplicity:** Zustand has a simple, unopinionated API that is easy to learn and use.
*   **Scalability:** It scales well with the size of the application and allows us to create separate stores for each module.
*   **Performance:** Zustand is lightweight and performant, which is important for a good user experience.
*   **Developer Experience:** It has excellent developer tools and a supportive community.

## Consequences

*   **Positive:**
    *   The application is now easier to maintain, test, and scale.
    *   The code is more organized and easier to understand.
    *   The developer experience is improved.
*   **Negative:**
    *   There is a slight learning curve for developers who are not familiar with Zustand.
    *   We have added another dependency to the project.
