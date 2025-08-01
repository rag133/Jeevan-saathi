# ADR 005: Implement Code Splitting with React.lazy and Suspense

**Date:** 2025-08-01

**Status:** Accepted

## Context

The application was loading all view components on the initial page load, which could lead to a slower initial load time, especially as the application grows.

## Decision

We will use **React.lazy** and **Suspense** to implement code splitting for the view components.

## Rationale

*   **Performance:** Code splitting improves the initial load time of the application by only loading the code that is needed for the current view.
*   **User Experience:** A faster initial load time leads to a better user experience.
*   **Scalability:** This approach scales well as we add more views to the application.

## Consequences

*   View components will be loaded on demand, which may introduce a small delay when switching between views.
*   We will use a `Suspense` component to display a loading indicator while the view components are being loaded.
