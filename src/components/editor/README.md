# Editor Components

This directory contains rich text editor components built with TipTap.

## TipTapEditor

A WYSIWYG markdown editor with a formatting toolbar and advanced content features.

### Features

#### Basic Features
- **Rich Text Formatting**: Bold, italic, strikethrough, inline code
- **Headings**: H1, H2, H3 support
- **Lists**: Bullet lists and numbered lists
- **Task Lists**: Checkbox lists for todos (Task 7.3)
- **Blockquotes**: Quote formatting
- **Links**: Add and edit hyperlinks
- **History**: Undo/redo support
- **Typography**: Smart typography enhancements
- **Placeholder**: Customizable placeholder text

#### Advanced Features (Task 7.2)

##### Tables
- Insert tables with customizable rows and columns (default 3x3 with header)
- Add/delete rows and columns dynamically
- Resizable columns
- Header row support
- Full table editing capabilities
- Click the table icon to insert, use +/- buttons when table is active

##### Code Blocks with Syntax Highlighting
- Syntax highlighting powered by Lowlight
- Support for common programming languages (JavaScript, Python, Java, etc.)
- VS Code-inspired color scheme
- Proper code formatting and display
- Dark theme for better readability

##### Mathematical Expressions
- LaTeX/MathJax support for mathematical formulas
- Inline math expressions
- Proper rendering of complex mathematical notation
- Click the Σ (Sigma) icon to insert formulas
- Examples: `E = mc^2`, `\frac{a}{b}`, `\sum_{i=1}^{n} x_i`

##### Mermaid Diagrams
- Flowcharts and diagrams using Mermaid syntax
- Support for various diagram types:
  - Flowcharts (`graph TD`)
  - Sequence diagrams
  - Class diagrams
  - State diagrams
  - And more
- Real-time diagram rendering
- Click the Network icon to insert diagrams

#### Slash Commands (Task 7.3)

Type `/` anywhere in the editor to open the slash command menu for quick content insertion.

##### Available Commands

**Text Formatting:**
- `/text` - Plain text paragraph
- `/h1` or `/heading` - Heading 1 (large section heading)
- `/h2` - Heading 2 (medium section heading)
- `/h3` - Heading 3 (small section heading)

**Lists:**
- `/bullet` or `/ul` - Bullet list (unordered)
- `/numbered` or `/ol` - Numbered list (ordered)
- `/todo` or `/task` - Task list with checkboxes

**Content Blocks:**
- `/quote` - Blockquote
- `/code` - Code block with syntax highlighting
- `/divider` or `/hr` - Horizontal divider line
- `/table` - Insert 3x3 table with header row

**Advanced Content:**
- `/math` or `/formula` - Mathematical expression (LaTeX)
- `/mermaid` or `/diagram` - Mermaid diagram (flowcharts, etc.)

##### Slash Command Features
- **Keyboard Navigation**: Use Arrow Up/Down to navigate, Enter to select, Escape to close
- **Mouse Support**: Hover and click to select commands
- **Visual Feedback**: Icons and descriptions for each command
- **Smart Positioning**: Menu appears below cursor automatically

### Usage

```tsx
import { TipTapEditor } from '@/components/editor';

function MyComponent() {
  const [content, setContent] = useState('<p>Initial content</p>');

  return (
    <TipTapEditor
      content={content}
      onChange={setContent}
      placeholder="Start writing... Type / for commands"
      editable={true}
    />
  );
}
```

### Props

- `content` (string): HTML content to display in the editor
- `onChange` (function): Callback fired when content changes, receives HTML string
- `placeholder` (string, optional): Placeholder text when editor is empty
- `editable` (boolean, optional): Whether the editor is editable (default: true)

### Keyboard Shortcuts

- **Ctrl/Cmd + B**: Bold
- **Ctrl/Cmd + I**: Italic
- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Shift + Z**: Redo
- **/**: Open slash command menu

### Styling

The editor uses Tailwind's typography plugin for prose styling. Custom styles are defined in `editor.css`.

### Extensions Used

#### Core Extensions
- **StarterKit**: Core editing functionality (paragraphs, headings, lists, etc.)
- **Placeholder**: Shows placeholder text when empty
- **Typography**: Smart quotes, dashes, and other typographic enhancements
- **Link**: Hyperlink support with custom styling

#### Advanced Extensions (Task 7.2)
- **Table**: Full table support with row/column manipulation
- **TableRow**: Table row handling
- **TableCell**: Table cell editing
- **TableHeader**: Table header cells
- **CodeBlockLowlight**: Syntax-highlighted code blocks using Lowlight
- **TaskList**: Task list support (Task 7.3)
- **TaskItem**: Individual task items with checkboxes (Task 7.3)
- **MathExtension**: Custom extension for LaTeX/MathJax math rendering
- **MermaidExtension**: Custom extension for Mermaid diagram rendering

#### Slash Command Extension (Task 7.3)
- **SlashCommandExtension**: Implements slash command functionality using TipTap's suggestion plugin

### Custom Extensions

#### MathExtension
Located in `extensions/MathExtension.tsx`

Renders mathematical expressions using MathJax with LaTeX syntax support.

**Features:**
- Inline math rendering
- Error handling for invalid formulas
- SVG output for crisp rendering

#### MermaidExtension
Located in `extensions/MermaidExtension.tsx`

Renders diagrams using Mermaid syntax.

**Features:**
- Multiple diagram types
- Real-time rendering
- Error handling with user-friendly messages

#### SlashCommandExtension
Located in `extensions/SlashCommandExtension.tsx`

Implements the slash command system for quick content insertion.

**Features:**
- Triggered by typing `/` in the editor
- Integrates with TipTap's suggestion plugin
- Uses Tippy.js for positioning
- Renders SlashCommandMenu component

### Components

#### SlashCommandMenu
Located in `SlashCommandMenu.tsx`

A dropdown menu component that displays available slash commands.

**Features:**
- Keyboard navigation (Arrow keys, Enter, Escape)
- Mouse hover and click support
- Visual icons and descriptions
- Searchable command list
- Responsive design

### Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 4.3**: Table creation and editing (add/delete rows/columns)
- **Requirement 4.4**: Code block support with syntax highlighting
- **Requirement 4.5**: Mathematical expressions with MathJax rendering
- **Requirement 4.6**: Mermaid diagram support for flowcharts
- **Requirement 5.1**: Slash command menu with formatting and content options
- **Requirement 5.2**: Markdown format commands (headings, lists, tables, code blocks, quotes)
- **Requirement 5.4**: Diagram and math expression commands

