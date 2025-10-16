import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TipTapEditor } from '../TipTapEditor';

describe('TipTapEditor', () => {
  it('renders the editor component', () => {
    const mockOnChange = vi.fn();
    
    const { container } = render(
      <TipTapEditor
        content="<p>Test content</p>"
        onChange={mockOnChange}
        placeholder="Test placeholder"
      />
    );

    // Check that the editor container is rendered
    const editorContainer = container.querySelector('.ProseMirror');
    expect(editorContainer).toBeDefined();
  });

  it('renders with custom placeholder', () => {
    const mockOnChange = vi.fn();
    
    const { container } = render(
      <TipTapEditor
        content=""
        onChange={mockOnChange}
        placeholder="Custom placeholder text"
      />
    );

    // Editor should be rendered
    const editorContainer = container.querySelector('.ProseMirror');
    expect(editorContainer).toBeDefined();
    
    // Check placeholder is set
    const paragraph = container.querySelector('[data-placeholder]');
    expect(paragraph?.getAttribute('data-placeholder')).toBe('Custom placeholder text');
  });

  it('renders toolbar buttons', () => {
    const mockOnChange = vi.fn();
    
    const { container } = render(
      <TipTapEditor
        content="<p>Test</p>"
        onChange={mockOnChange}
      />
    );

    // Check that toolbar exists
    const toolbar = container.querySelector('.border-b');
    expect(toolbar).toBeDefined();
    
    // Check that formatting buttons exist
    expect(screen.getByTitle('Bold (Ctrl+B)')).toBeDefined();
    expect(screen.getByTitle('Italic (Ctrl+I)')).toBeDefined();
    expect(screen.getByTitle('Heading 1')).toBeDefined();
    expect(screen.getByTitle('Bullet List')).toBeDefined();
    expect(screen.getByTitle('Code Block')).toBeDefined();
  });
});
