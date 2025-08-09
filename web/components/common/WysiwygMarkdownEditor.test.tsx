import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WysiwygMarkdownEditor } from './WysiwygMarkdownEditor';

describe('WysiwygMarkdownEditor', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders content by default', () => {
    render(
      <WysiwygMarkdownEditor
        value="Test content"
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('shows placeholder when value is empty', () => {
    render(
      <WysiwygMarkdownEditor
        value=""
        onChange={mockOnChange}
        placeholder="Test placeholder"
      />
    );
    
    expect(screen.getByText('Test placeholder')).toBeInTheDocument();
  });

  it('switches to edit mode when clicked', () => {
    render(
      <WysiwygMarkdownEditor
        value="Test content"
        onChange={mockOnChange}
      />
    );
    
    // Click the view div to enter edit mode
    const viewDiv = screen.getByText('Test content').closest('div');
    fireEvent.click(viewDiv!);
    
    // Should now have a textarea in edit mode
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Test content');
  });

  it('calls onChange when editing is complete', async () => {
    render(
      <WysiwygMarkdownEditor
        value="Initial content"
        onChange={mockOnChange}
      />
    );
    
    // Enter edit mode
    const viewDiv = screen.getByText('Initial content').closest('div');
    fireEvent.click(viewDiv!);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Updated content' } });
    fireEvent.blur(textarea);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('Updated content');
    });
  });

  it('handles escape key to cancel editing', () => {
    render(
      <WysiwygMarkdownEditor
        value="Original content"
        onChange={mockOnChange}
      />
    );
    
    // Enter edit mode
    const viewDiv = screen.getByText('Original content').closest('div');
    fireEvent.click(viewDiv!);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Modified content' } });
    fireEvent.keyDown(textarea, { key: 'Escape' });
    
    // Should revert to original content
    expect(screen.getByText('Original content')).toBeInTheDocument();
  });

  it('handles cmd+enter to save', () => {
    render(
      <WysiwygMarkdownEditor
        value="Test content"
        onChange={mockOnChange}
      />
    );
    
    // Enter edit mode
    const viewDiv = screen.getByText('Test content').closest('div');
    fireEvent.click(viewDiv!);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });
    
    // Should exit edit mode
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('supports markdown formatting', () => {
    render(
      <WysiwygMarkdownEditor
        value="**Bold text** and *italic text*"
        onChange={mockOnChange}
      />
    );
    
    // Should render formatted content
    const boldElement = screen.getByText('Bold text');
    const italicElement = screen.getByText('italic text');
    expect(boldElement).toBeInTheDocument();
    expect(italicElement).toBeInTheDocument();
  });
}); 