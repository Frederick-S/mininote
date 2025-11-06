import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SlashCommandMenu } from '../SlashCommandMenu';

describe('SlashCommandMenu', () => {
  const mockCommand = vi.fn();
  const mockEditor = {};
  const mockRange = { from: 0, to: 0 };

  describe('Fuzzy Search', () => {
    it('shows all items when query is empty', () => {
      render(
        <SlashCommandMenu
          command={mockCommand}
          editor={mockEditor}
          range={mockRange}
          query=""
        />
      );

      expect(screen.getByText('Text')).toBeDefined();
      expect(screen.getByText('Heading 1')).toBeDefined();
      expect(screen.getByText('Heading 2')).toBeDefined();
      expect(screen.getByText('Heading 3')).toBeDefined();
      expect(screen.getByText('Bullet List')).toBeDefined();
      expect(screen.getByText('Inline Math')).toBeDefined();
      expect(screen.getByText('Block Math')).toBeDefined();
    });

    it('filters by exact match at start', () => {
      render(
        <SlashCommandMenu
          command={mockCommand}
          editor={mockEditor}
          range={mockRange}
          query="text"
        />
      );

      expect(screen.getByText('Text')).toBeDefined();
      expect(screen.queryByText('Heading 1')).toBeNull();
    });

    it('filters by exact substring match', () => {
      render(
        <SlashCommandMenu
          command={mockCommand}
          editor={mockEditor}
          range={mockRange}
          query="heading"
        />
      );

      expect(screen.getByText('Heading 1')).toBeDefined();
      expect(screen.getByText('Heading 2')).toBeDefined();
      expect(screen.getByText('Heading 3')).toBeDefined();
      expect(screen.queryByText('Text')).toBeNull();
    });

    it('filters by word boundary match', () => {
      render(
        <SlashCommandMenu
          command={mockCommand}
          editor={mockEditor}
          range={mockRange}
          query="math"
        />
      );

      expect(screen.getByText('Inline Math')).toBeDefined();
      expect(screen.getByText('Block Math')).toBeDefined();
      expect(screen.queryByText('Heading 3')).toBeNull();
    });

    it('filters by search terms', () => {
      render(
        <SlashCommandMenu
          command={mockCommand}
          editor={mockEditor}
          range={mockRange}
          query="h1"
        />
      );

      expect(screen.getByText('Heading 1')).toBeDefined();
      expect(screen.queryByText('Heading 2')).toBeNull();
      expect(screen.queryByText('Heading 3')).toBeNull();
    });

    it('filters by fuzzy match with small gaps', () => {
      render(
        <SlashCommandMenu
          command={mockCommand}
          editor={mockEditor}
          range={mockRange}
          query="bl"
        />
      );

      expect(screen.getByText('Bullet List')).toBeDefined();
      expect(screen.getByText('Code Block')).toBeDefined();
    });

    it('rejects fuzzy match with large gaps', () => {
      render(
        <SlashCommandMenu
          command={mockCommand}
          editor={mockEditor}
          range={mockRange}
          query="ht"
        />
      );

      // "ht" should not match "Heading Three" due to large gaps
      expect(screen.queryByText('Heading 3')).toBeNull();
    });

    it('prioritizes exact matches over fuzzy matches', () => {
      const { container } = render(
        <SlashCommandMenu
          command={mockCommand}
          editor={mockEditor}
          range={mockRange}
          query="h"
        />
      );

      const buttons = container.querySelectorAll('button');
      const firstItemTitle = buttons[0]?.querySelector('.font-medium')?.textContent;
      
      // First item should be one that starts with "h" (Heading 1, 2, or 3)
      expect(firstItemTitle).toMatch(/Heading/);
    });

    it('shows no results for non-matching query', () => {
      render(
        <SlashCommandMenu
          command={mockCommand}
          editor={mockEditor}
          range={mockRange}
          query="xyz123"
        />
      );

      expect(screen.getByText('No results')).toBeDefined();
    });

    it('matches case-insensitively', () => {
      render(
        <SlashCommandMenu
          command={mockCommand}
          editor={mockEditor}
          range={mockRange}
          query="HEADING"
        />
      );

      expect(screen.getByText('Heading 1')).toBeDefined();
      expect(screen.getByText('Heading 2')).toBeDefined();
      expect(screen.getByText('Heading 3')).toBeDefined();
    });

    it('filters by description', () => {
      render(
        <SlashCommandMenu
          command={mockCommand}
          editor={mockEditor}
          range={mockRange}
          query="plain text"
        />
      );

      expect(screen.getByText('Text')).toBeDefined();
      expect(screen.queryByText('Heading 1')).toBeNull();
    });
  });

  describe('Rendering', () => {
    it('renders icons for all items', () => {
      const { container } = render(
        <SlashCommandMenu
          command={mockCommand}
          editor={mockEditor}
          range={mockRange}
          query=""
        />
      );

      const icons = container.querySelectorAll('.flex-shrink-0');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('highlights selected item', () => {
      const { container } = render(
        <SlashCommandMenu
          command={mockCommand}
          editor={mockEditor}
          range={mockRange}
          query=""
        />
      );

      const buttons = container.querySelectorAll('button');
      const firstButton = buttons[0];
      
      // First item should have selected styling
      expect(firstButton?.className).toContain('bg-accent');
    });
  });
});
