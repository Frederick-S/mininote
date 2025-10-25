import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Table,
  Sigma,
  Network,
  Type,
  CheckSquare,
  Minus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CommandItem {
  title: string;
  description: string;
  icon: string;
  command: (props: any) => void;
  searchTerms?: string[];
}

const iconMap: Record<string, LucideIcon> = {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code2,
  Minus,
  Table,
  Sigma,
  Network,
};

interface SlashCommandMenuProps {
  items?: CommandItem[];
  command: (item: CommandItem) => void;
  editor: any;
  range: any;
  query?: string;
}

export const SlashCommandMenu = forwardRef((props: SlashCommandMenuProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const defaultItems: CommandItem[] = [
    {
      title: 'Text',
      description: 'Start writing with plain text',
      icon: 'Type',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
      },
      searchTerms: ['text', 'paragraph', 'p'],
    },
    {
      title: 'Heading 1',
      description: 'Large section heading',
      icon: 'Heading1',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
      },
      searchTerms: ['h1', 'heading', 'title'],
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: 'Heading2',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
      },
      searchTerms: ['h2', 'heading', 'subtitle'],
    },
    {
      title: 'Heading 3',
      description: 'Small section heading',
      icon: 'Heading3',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run();
      },
      searchTerms: ['h3', 'heading', 'subheading'],
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bullet list',
      icon: 'List',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
      searchTerms: ['ul', 'list', 'bullet', 'unordered'],
    },
    {
      title: 'Numbered List',
      description: 'Create a numbered list',
      icon: 'ListOrdered',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
      searchTerms: ['ol', 'list', 'numbered', 'ordered'],
    },
    {
      title: 'Task List',
      description: 'Create a task list with checkboxes',
      icon: 'CheckSquare',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
      searchTerms: ['todo', 'task', 'checkbox', 'check'],
    },
    {
      title: 'Quote',
      description: 'Insert a blockquote',
      icon: 'Quote',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
      searchTerms: ['blockquote', 'quote', 'citation'],
    },
    {
      title: 'Code Block',
      description: 'Insert a code block with syntax highlighting',
      icon: 'Code2',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
      searchTerms: ['code', 'codeblock', 'pre', 'programming'],
    },
    {
      title: 'Divider',
      description: 'Insert a horizontal divider',
      icon: 'Minus',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
      searchTerms: ['hr', 'divider', 'line', 'separator'],
    },
    {
      title: 'Table',
      description: 'Insert a table',
      icon: 'Table',
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run();
      },
      searchTerms: ['table', 'grid', 'spreadsheet'],
    },
    {
      title: 'Math Formula',
      description: 'Insert a mathematical expression',
      icon: 'Sigma',
      command: ({ editor, range }) => {
        const formula = window.prompt('Enter LaTeX formula (e.g., E = mc^2):');
        if (formula) {
          editor.chain().focus().deleteRange(range).run();
          (editor.commands as any).insertMath({ content: formula });
        }
      },
      searchTerms: ['math', 'latex', 'formula', 'equation'],
    },
    {
      title: 'Mermaid Diagram',
      description: 'Insert a Mermaid diagram',
      icon: 'Network',
      command: ({ editor, range }) => {
        const diagram = window.prompt(
          'Enter Mermaid diagram code:',
          'graph TD\n  A[Start] --> B[End]'
        );
        if (diagram) {
          editor.chain().focus().deleteRange(range).run();
          (editor.commands as any).insertMermaid(diagram);
        }
      },
      searchTerms: ['mermaid', 'diagram', 'flowchart', 'chart', 'graph'],
    },
  ];

  const allItems = props.items || defaultItems;

  // Filter items based on query
  const items = allItems.filter((item) => {
    const query = (props.query || '').toLowerCase();
    if (!query) return true;

    const titleMatch = item.title.toLowerCase().includes(query);
    const descriptionMatch = item.description.toLowerCase().includes(query);
    const searchTermsMatch = item.searchTerms?.some((term) =>
      term.toLowerCase().includes(query)
    );

    return titleMatch || descriptionMatch || searchTermsMatch;
  });

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + items.length - 1) % items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="slash-command-menu bg-popover border rounded-lg shadow-lg p-2 max-h-[400px] overflow-y-auto min-w-[300px]">
      {items.length > 0 ? (
        items.map((item, index) => {
          const Icon = iconMap[item.icon];
          return (
            <button
              key={index}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${index === selectedIndex
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent/50'
                }`}
              onClick={() => selectItem(index)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {Icon ? (
                <div className="flex-shrink-0 w-4 h-4 text-foreground">
                  <Icon className="w-full h-full" size={16} />
                </div>
              ) : null}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            </button>
          );
        })
      ) : (
        <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
      )}
    </div>
  );
});

SlashCommandMenu.displayName = 'SlashCommandMenu';
