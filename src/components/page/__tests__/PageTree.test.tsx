import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PageTree } from '../PageTree';
import type { PageWithChildren } from '@/types/database';

const mockPages: PageWithChildren[] = [
  {
    id: '1',
    title: 'Root Page 1',
    content: 'Content 1',
    version: 1,
    notebook_id: 'notebook-1',
    user_id: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    children: [
      {
        id: '1-1',
        title: 'Child Page 1-1',
        content: 'Content 1-1',
        version: 1,
        parent_page_id: '1',
        notebook_id: 'notebook-1',
        user_id: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        children: [],
      },
      {
        id: '1-2',
        title: 'Child Page 1-2',
        content: 'Content 1-2',
        version: 1,
        parent_page_id: '1',
        notebook_id: 'notebook-1',
        user_id: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        children: [],
      },
    ],
  },
  {
    id: '2',
    title: 'Root Page 2',
    content: 'Content 2',
    version: 1,
    notebook_id: 'notebook-1',
    user_id: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    children: [],
  },
];

describe('PageTree', () => {
  it('renders empty state when no pages provided', () => {
    render(<PageTree pages={[]} />);
    expect(screen.getByText(/no pages yet/i)).toBeInTheDocument();
  });

  it('renders all root pages', () => {
    render(<PageTree pages={mockPages} />);
    expect(screen.getByText('Root Page 1')).toBeInTheDocument();
    expect(screen.getByText('Root Page 2')).toBeInTheDocument();
  });

  it('renders child pages', () => {
    render(<PageTree pages={mockPages} />);
    expect(screen.getByText('Child Page 1-1')).toBeInTheDocument();
    expect(screen.getByText('Child Page 1-2')).toBeInTheDocument();
  });

  it('calls onPageSelect when page is clicked', () => {
    const onPageSelect = vi.fn();
    render(<PageTree pages={mockPages} onPageSelect={onPageSelect} />);
    
    fireEvent.click(screen.getByText('Root Page 1'));
    expect(onPageSelect).toHaveBeenCalledWith('1');
  });

  it('highlights selected page', () => {
    render(<PageTree pages={mockPages} selectedPageId="1" />);
    
    const selectedPage = screen.getByText('Root Page 1').closest('div');
    expect(selectedPage).toHaveClass('bg-accent');
  });

  it('shows expand/collapse button for pages with children', () => {
    render(<PageTree pages={mockPages} />);
    
    // Root Page 1 has children, should have expand button
    const rootPage1 = screen.getByText('Root Page 1').closest('div');
    expect(rootPage1?.querySelector('button')).toBeInTheDocument();
    
    // Root Page 2 has no children, should not have expand button
    const rootPage2 = screen.getByText('Root Page 2').closest('div');
    const buttons = rootPage2?.querySelectorAll('button');
    expect(buttons?.length).toBe(0);
  });

  it('supports drag and drop', () => {
    const onPageMove = vi.fn();
    render(<PageTree pages={mockPages} onPageMove={onPageMove} />);
    
    const draggedPage = screen.getByText('Root Page 2').closest('div');
    const dropTarget = screen.getByText('Root Page 1').closest('div');
    
    if (draggedPage && dropTarget) {
      // Simulate drag start
      fireEvent.dragStart(draggedPage, {
        dataTransfer: {
          effectAllowed: 'move',
          setData: vi.fn(),
          getData: () => '2',
        },
      });
      
      // Simulate drop
      fireEvent.drop(dropTarget, {
        dataTransfer: {
          getData: () => '2',
        },
      });
      
      expect(onPageMove).toHaveBeenCalledWith('2', '1');
    }
  });

  it('applies correct indentation for nested pages', () => {
    render(<PageTree pages={mockPages} />);
    
    const childPage = screen.getByText('Child Page 1-1').closest('div');
    expect(childPage).toHaveClass('ml-4');
  });

  it('shows drag handle on hover', () => {
    render(<PageTree pages={mockPages} />);
    
    const page = screen.getByText('Root Page 1').closest('div');
    const dragHandle = page?.querySelector('svg[class*="lucide-grip-vertical"]');
    
    expect(dragHandle).toBeInTheDocument();
  });
});
