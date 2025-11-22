import { describe, it, expect } from 'vitest';
import { searchService } from '../searchService';

describe('SearchService', () => {
  describe('extractHighlights', () => {
    it('should extract matching terms from content', () => {
      const content = 'This is a test document with some test content';
      const query = 'test';
      
      // Access private method through any cast for testing
      const highlights = (searchService as any).extractHighlights(content, query);
      
      expect(highlights).toContain('test');
      expect(highlights.length).toBeGreaterThan(0);
    });

    it('should handle multiple search terms', () => {
      const content = 'React and TypeScript are great technologies';
      const query = 'React TypeScript';
      
      const highlights = (searchService as any).extractHighlights(content, query);
      
      expect(highlights).toContain('React');
      expect(highlights).toContain('TypeScript');
    });

    it('should limit highlights to 10 items', () => {
      const content = 'test '.repeat(20);
      const query = 'test';
      
      const highlights = (searchService as any).extractHighlights(content, query);
      
      expect(highlights.length).toBeLessThanOrEqual(10);
    });
  });

  describe('generateSnippet', () => {
    it('should generate snippet around first match', () => {
      const content = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. This is the important part with the search term. More content follows.';
      const query = 'important';
      
      const snippet = (searchService as any).generateSnippet(content, query);
      
      expect(snippet).toContain('important');
      expect(snippet.length).toBeLessThanOrEqual(200); // Snippet + ellipsis
    });

    it('should add ellipsis when truncating', () => {
      const content = 'A'.repeat(500) + ' search term ' + 'B'.repeat(500);
      const query = 'search term';
      
      const snippet = (searchService as any).generateSnippet(content, query);
      
      expect(snippet).toContain('...');
      expect(snippet).toContain('search');
    });

    it('should return beginning if no match found', () => {
      const content = 'This is some content without the search term';
      const query = 'nonexistent';
      
      const snippet = (searchService as any).generateSnippet(content, query);
      
      expect(snippet).toContain('This is some content');
    });
  });

  describe('parseSearchQuery', () => {
    it('should split query into terms', () => {
      const query = 'hello world test';
      
      const terms = (searchService as any).parseSearchQuery(query);
      
      expect(terms).toContain('hello');
      expect(terms).toContain('world');
      expect(terms).toContain('test');
    });

    it('should filter out short terms', () => {
      const query = 'a be cat';
      
      const terms = (searchService as any).parseSearchQuery(query);
      
      expect(terms).not.toContain('a');
      expect(terms).not.toContain('be');
      expect(terms).toContain('cat');
    });

    it('should handle special characters', () => {
      const query = 'hello, world! test?';
      
      const terms = (searchService as any).parseSearchQuery(query);
      
      expect(terms).toContain('hello');
      expect(terms).toContain('world');
      expect(terms).toContain('test');
    });
  });

  describe('highlightText', () => {
    it('should wrap matching terms in mark tags', () => {
      const text = 'This is a test document';
      const query = 'test';
      
      const highlighted = searchService.highlightText(text, query);
      
      expect(highlighted).toContain('<mark>test</mark>');
    });

    it('should handle multiple matches', () => {
      const text = 'React is great and React is powerful';
      const query = 'React';
      
      const highlighted = searchService.highlightText(text, query);
      
      expect(highlighted).toContain('<mark>React</mark>');
      expect((highlighted.match(/<mark>/g) || []).length).toBe(2);
    });

    it('should be case insensitive', () => {
      const text = 'TypeScript and typescript';
      const query = 'typescript';
      
      const highlighted = searchService.highlightText(text, query);
      
      expect(highlighted).toContain('<mark>TypeScript</mark>');
      expect(highlighted).toContain('<mark>typescript</mark>');
    });
  });

  describe('escapeRegex', () => {
    it('should escape special regex characters', () => {
      const input = 'test.*+?^${}()|[]\\';
      
      const escaped = (searchService as any).escapeRegex(input);
      
      expect(escaped).toBe('test\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    });
  });

  describe('truncateText', () => {
    it('should not truncate short text', () => {
      const text = 'Short text';
      
      const truncated = (searchService as any).truncateText(text, 100);
      
      expect(truncated).toBe('Short text');
    });

    it('should truncate long text', () => {
      const text = 'A'.repeat(200);
      
      const truncated = (searchService as any).truncateText(text, 100);
      
      expect(truncated.length).toBeLessThanOrEqual(104); // 100 + '...'
      expect(truncated).toContain('...');
    });
  });
});
