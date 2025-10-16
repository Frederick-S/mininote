# Editor Components

This directory contains rich text editor components built with TipTap.

## TipTapEditor

A WYSIWYG markdown editor with a formatting toolbar.

### Features

- **Rich Text Formatting**: Bold, italic, strikethrough, inline code
- **Headings**: H1, H2, H3 support
- **Lists**: Bullet lists and numbered lists
- **Code Blocks**: Syntax-highlighted code blocks
- **Blockquotes**: Quote formatting
- **Links**: Add and edit hyperlinks
- **History**: Undo/redo support
- **Typography**: Smart typography enhancements
- **Placeholder**: Customizable placeholder text

### Usage

```tsx
import { TipTapEditor } from '@/components/editor';

function MyComponent() {
  const [content, setContent] = useState('<p>Initial content</p>');

  return (
    <TipTapEditor
      content={content}
      onChange={setContent}
      placeholder="Start writing..."
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

### Styling

The editor uses Tailwind's typography plugin for prose styling. Custom styles are defined in `editor.css`.

### Extensions Used

- **StarterKit**: Core editing functionality (paragraphs, headings, lists, etc.)
- **Placeholder**: Shows placeholder text when empty
- **Typography**: Smart quotes, dashes, and other typographic enhancements
- **Link**: Hyperlink support with custom styling
