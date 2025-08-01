# ADR 004: Use React Hot Toast for Notifications

**Date:** 2025-08-01

**Status:** Accepted

## Context

The application previously lacked a consistent way to display non-blocking notifications for events like errors or successful actions. Displaying errors in the main UI can be disruptive to the user experience.

## Decision

We will use **React Hot Toast** to display non-blocking toast notifications for errors and other events.

## Rationale

*   **User Experience:** Toast notifications are a non-intrusive way to provide feedback to the user without interrupting their workflow.
*   **Simplicity:** React Hot Toast has a simple and intuitive API, making it easy to integrate and use.
*   **Customization:** It offers a high degree of customization, allowing us to match the notifications to the application's design.

## Consequences

*   All non-blocking notifications will be displayed using React Hot Toast.
*   This will improve the user experience by providing clear and consistent feedback without disrupting the user's workflow.
