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

interface CommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (props: any) => void;
  searchTerms?: string[];
}

interface SlashCommandMenuProps {
  items?: CommandItem[];
  command: (item: CommandItem) => void;
  editor: any;
  range: any;
}

export const SlashCommandMenu = forwardRef((props: SlashCommandMenuProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const defaultItems: CommandItem[] = [
    {
      title: 'Text',
      description: 'Start writing with plain text',
      icon: <Type className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
      },
      searchTerms: ['text', 'paragraph', 'p'],
    },
    {
      title: 'Heading 1',
      description: 'Large section heading',
      icon: <Heading1 className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
      },
      searchTerms: ['h1', 'heading', 'title'],
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: <Heading2 className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
      },
      searchTerms: ['h2', 'heading', 'subtitle'],
    },
    {
      title: 'Heading 3',
      description: 'Small section heading',
      icon: <Heading3 className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run();
      },
      searchTerms: ['h3', 'heading', 'subheading'],
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bullet list',
      icon: <List className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
      searchTerms: ['ul', 'list', 'bullet', 'unordered'],
    },
    {
      title: 'Numbered List',
      description: 'Create a numbered list',
      icon: <ListOrdered className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
      searchTerms: ['ol', 'list', 'numbered', 'ordered'],
    },
    {
      title: 'Task List',
      description: 'Create a task list with checkboxes',
      icon: <CheckSquare className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
      searchTerms: ['todo', 'task', 'checkbox', 'check'],
    },
    {
      title: 'Quote',
      description: 'Insert a blockquote',
      icon: <Quote className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
      searchTerms: ['blockquote', 'quote', 'citation'],
    },
    {
      title: 'Code Block',
      description: 'Insert a code block with syntax highlighting',
      icon: <Code2 className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
      searchTerms: ['code', 'codeblock', 'pre', 'programming'],
    },
    {
      title: 'Divider',
      description: 'Insert a horizontal divider',
      icon: <Minus className="h-4 w-4" />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
      searchTerms: ['hr', 'divider', 'line', 'separator'],
    },
    {
      title: 'Table',
      description: 'Insert a table',
      icon: <Table className="h-4 w-4" />,
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
      icon: <Sigma className="h-4 w-4" />,
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
      icon: <Network className="h-4 w-4" />,
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

  const items = props.items || defaultItems;

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
        items.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-start gap-3 px-3 py-2 rounded-md text-left transition-colors ${
              index === selectedIndex
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent/50'
            }`}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.description}</div>
            </div>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
      )}
    </div>
  );
});

SlashCommandMenu.displayName = 'SlashCommandMenu';
