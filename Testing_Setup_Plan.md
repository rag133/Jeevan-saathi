# Testing Setup Plan: Vitest and React Testing Library

## Objective
To establish a robust testing environment for the Jeevan Saathi application, enabling automated unit and integration tests for React components and utility functions. This will reduce manual testing effort and improve code quality and maintainability.

## Tools
*   **Vitest:** A fast unit test framework powered by Vite.
*   **React Testing Library:** A set of utilities for testing React components in a user-centric way.
*   **jsdom:** A JavaScript implementation of the DOM, used by Vitest to simulate a browser environment.
*   **@testing-library/jest-dom:** Provides custom Jest matchers for more declarative DOM assertions.

## Installation Steps

1.  **Install Development Dependencies:**
    ```bash
    npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
    ```

## Configuration Steps

1.  **Update `vite.config.ts`:**
    Add a `test` property to the `defineConfig` object to configure Vitest. This will include:
    *   `globals: true`: Makes Vitest APIs globally available (like `describe`, `it`, `expect`).
    *   `environment: 'jsdom'`: Specifies the test environment to simulate a browser.
    *   `setupFiles: './vitest.setup.ts'`: A setup file for global configurations (e.g., extending Jest DOM matchers).

    ```typescript
    // vite.config.ts
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';

    export default defineConfig({
      plugins: [react()],
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts',
      },
    });
    ```

2.  **Create `vitest.setup.ts`:**
    This file will import `@testing-library/jest-dom/extend-expect` to provide additional matchers for DOM assertions.

    ```typescript
    // vitest.setup.ts
    import '@testing-library/jest-dom/extend-expect';
    ```

3.  **Update `tsconfig.json`:**
    Add `vitest/globals` to the `types` array in `compilerOptions` to ensure proper TypeScript support for Vitest's global APIs.

    ```json
    // tsconfig.json
    {
      "compilerOptions": {
        // ... existing options
        "types": ["vitest/globals", "node"] // Add "vitest/globals" and "node" if not present
      }
    }
    ```

## First Test: `components/Checkbox.test.tsx`

We will create a simple test file for `components/Checkbox.tsx` to verify that the testing setup is working correctly.

1.  **Create the file:** `components/Checkbox.test.tsx`
2.  **Add test code:**

    ```typescript
    // components/Checkbox.test.tsx
    import { render, screen } from '@testing-library/react';
    import Checkbox from './Checkbox'; // Adjust path if necessary
    import { describe, it, expect } from 'vitest';

    describe('Checkbox', () => {
      it('renders with a label', () => {
        render(<Checkbox label="My Checkbox" checked={false} onChange={() => {}} />);
        expect(screen.getByLabelText('My Checkbox')).toBeInTheDocument();
      });

      it('is checked when checked prop is true', () => {
        render(<Checkbox label="My Checkbox" checked={true} onChange={() => {}} />);
        expect(screen.getByLabelText('My Checkbox')).toBeChecked();
      });

      it('calls onChange when clicked', async () => {
        const handleChange = vi.fn(); // Mock function
        render(<Checkbox label="My Checkbox" checked={false} onChange={handleChange} />);
        await screen.getByLabelText('My Checkbox').click();
        expect(handleChange).toHaveBeenCalledTimes(1);
      });
    });
    ```

## Running Tests

To run the tests, add a `test` script to your `package.json`:

```json
// package.json
{
  "scripts": {
    // ... existing scripts
    "test": "vitest"
  }
}
```

Then, run the command:

```bash
npm test
```

## Next Steps (After successful setup)

Once the basic testing setup is verified, we can proceed with writing tests for other components and functions, gradually increasing test coverage.
