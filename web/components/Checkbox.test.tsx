import { render, screen } from '@testing-library/react';
import Checkbox from './Checkbox';
import { describe, it, expect, vi } from 'vitest';

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