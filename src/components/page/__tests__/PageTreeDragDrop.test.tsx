import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import { PageTree } from '../PageTree';
import type { PageWithChildren } from '@/types/database';
import { vi, describe, it, expect } from 'vitest';

const mockPages: PageWithChildren[] = [
  {
    id: '1',
    title: 'Parent Page',
    content: '',
    version: 1,
    notebook_id: 'nb1',
    user_id: 'u1',
    created_at: '',
    updated_at: '',
    children: [
      {
        id: '2',
        title: 'Child Page',
        content: '',
        version: 1,
        notebook_id: 'nb1',
        parent_page_id: '1',
        user_id: 'u1',
        created_at: '',
        updated_at: '',
        children: []
      }
    ]
  },
  {
    id: '3',
    title: 'Sibling Page',
    content: '',
    version: 1,
    notebook_id: 'nb1',
    user_id: 'u1',
    created_at: '',
    updated_at: '',
    children: []
  }
];

describe('PageTree Drag and Drop', () => {
  it('should handle dropping as a sibling (before)', () => {
    const onPageMove = vi.fn();
    render(<PageTree pages={mockPages} onPageMove={onPageMove} />);

    const childPageTitle = screen.getByText('Child Page');
    const draggableRow = childPageTitle.parentElement!;

    // Mock getBoundingClientRect
    vi.spyOn(draggableRow, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 140,
      left: 0,
      right: 200,
      height: 40,
      width: 200,
      x: 0,
      y: 100,
      toJSON: () => {}
    });

    // Drag over at the top 10% (y=104) -> position='before'
    const dragOverEvent = createEvent.dragOver(draggableRow);
    Object.defineProperty(dragOverEvent, 'clientY', { value: 104 });
    Object.defineProperty(dragOverEvent, 'dataTransfer', {
      value: { dropEffect: 'move' }
    });
    fireEvent(draggableRow, dragOverEvent);

    // Drop
    const dropEvent = createEvent.drop(draggableRow);
    Object.defineProperty(dropEvent, 'clientY', { value: 104 });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { getData: vi.fn(() => '3') }
    });
    fireEvent(draggableRow, dropEvent);

    // Expect 'Sibling Page' (3) to become sibling of 'Child Page' (2), so new parent is '1'
    expect(onPageMove).toHaveBeenCalledWith('3', '1', 'before');
  });

  it('should handle dropping as a sibling (after)', () => {
    const onPageMove = vi.fn();
    render(<PageTree pages={mockPages} onPageMove={onPageMove} />);

    const childPageTitle = screen.getByText('Child Page');
    const draggableRow = childPageTitle.parentElement!;

    // Mock getBoundingClientRect
    vi.spyOn(draggableRow, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 140,
      left: 0,
      right: 200,
      height: 40,
      width: 200,
      x: 0,
      y: 100,
      toJSON: () => {}
    });

    // Drag over at the bottom 10% (y=136) -> position='after'
    const dragOverEvent = createEvent.dragOver(draggableRow);
    Object.defineProperty(dragOverEvent, 'clientY', { value: 136 });
    Object.defineProperty(dragOverEvent, 'dataTransfer', {
      value: { dropEffect: 'move' }
    });
    fireEvent(draggableRow, dragOverEvent);

    // Drop
    const dropEvent = createEvent.drop(draggableRow);
    Object.defineProperty(dropEvent, 'clientY', { value: 136 });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { getData: vi.fn(() => '3') }
    });
    fireEvent(draggableRow, dropEvent);

    // Expect 'Sibling Page' (3) to become sibling of 'Child Page' (2)
    expect(onPageMove).toHaveBeenCalledWith('3', '1', 'after');
  });

  it('should handle dropping as a child', () => {
    const onPageMove = vi.fn();
    render(<PageTree pages={mockPages} onPageMove={onPageMove} />);

    const parentPageTitle = screen.getByText('Parent Page');
    const draggableRow = parentPageTitle.parentElement!;

    // Mock getBoundingClientRect
    vi.spyOn(draggableRow, 'getBoundingClientRect').mockReturnValue({
      top: 50,
      bottom: 90,
      left: 0,
      right: 200,
      height: 40,
      width: 200,
      x: 0,
      y: 50,
      toJSON: () => {}
    });

    // Drag over at the middle (y=70) -> position='child'
    const dragOverEvent = createEvent.dragOver(draggableRow);
    Object.defineProperty(dragOverEvent, 'clientY', { value: 70 });
    Object.defineProperty(dragOverEvent, 'dataTransfer', {
      value: { dropEffect: 'move' }
    });
    fireEvent(draggableRow, dragOverEvent);

    // Drop
    const dropEvent = createEvent.drop(draggableRow);
    Object.defineProperty(dropEvent, 'clientY', { value: 70 });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { getData: vi.fn(() => '3') }
    });
    fireEvent(draggableRow, dropEvent);

    // Expect 'Sibling Page' (3) to become child of 'Parent Page' (1)
    // When position is 'child', the newParentId is the target page ID itself (1)
    // The onPageMove signature is (pageId, newParentId, position)
    // But wait, look at PageTree logic for 'child' position:
    // if (position === 'child') { onPageMove?.(draggedId, targetPageId); }
    // It calls with 2 arguments!
    
    expect(onPageMove).toHaveBeenCalledWith('3', '1');
  });
});