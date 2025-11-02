import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { MarkdownNodeSpec } from 'tiptap-markdown';

// Math node component with edit capability
function MathNodeView({ node, updateAttributes, deleteNode }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.attrs.content);
  const { content } = node.attrs;

  useEffect(() => {
    if (containerRef.current && content && !isEditing) {
      try {
        katex.render(content, containerRef.current, {
          displayMode: node.attrs.display || false,
          throwOnError: false,
          errorColor: '#cc0000',
        });
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<span style="color: red;">Error rendering math: ${content}</span>`;
        }
      }
    }
  }, [content, node.attrs.display, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(content);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      updateAttributes({ content: editValue });
      setIsEditing(false);
    } else {
      deleteNode();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(content);
    }
  };

  if (isEditing) {
    return (
      <NodeViewWrapper className="math-node-editing">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="math-input"
          placeholder="Enter LaTeX formula..."
        />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="math-node-wrapper">
      <span className="math-node-container">
        <div
          ref={containerRef}
          className="math-content"
          onClick={handleDoubleClick}
        />
        <button
          onClick={handleDoubleClick}
          className="math-edit-button"
          title="Edit formula"
        >
          ✎
        </button>
      </span>
    </NodeViewWrapper>
  );
}

export const MathExtension = Node.create({
  name: 'math',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      content: {
        default: '',
      },
      display: {
        default: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math"]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const element = node as HTMLElement;
          return {
            content: element.getAttribute('data-content') || element.textContent || '',
            display: element.getAttribute('data-display') === 'true',
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        {
          'data-type': 'math',
          'data-content': node.attrs.content,
          'data-display': node.attrs.display,
        },
        HTMLAttributes
      ),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView);
  },

  addCommands() {
    return {
      insertMath:
        (attrs: { content: string; display?: boolean }) =>
          ({ commands }: any) => {
            return commands.insertContent({
              type: this.name,
              attrs,
            });
          },
    } as any;
  },

  // Add markdown serialization and parsing support
  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          const delimiter = node.attrs.display ? '$$' : '$';
          state.write(delimiter + node.attrs.content + delimiter);
        },
        parse: {
          setup(markdownit: any) {
            markdownit.inline.ruler.before('escape', 'math_inline', (state: any, silent: any) => {
              if (state.src[state.pos] !== '$') return false;
              
              const start = state.pos + 1;
              let end = start;
              let foundEnd = false;
              
              while (end < state.src.length) {
                if (state.src[end] === '$' && state.src[end - 1] !== '\\') {
                  foundEnd = true;
                  break;
                }
                end++;
              }
              
              if (!foundEnd) return false;
              
              const content = state.src.slice(start, end);
              
              if (!silent) {
                const token = state.push('math_inline', 'span', 0);
                token.content = content;
                token.markup = '$';
              }
              
              state.pos = end + 1;
              return true;
            });
            
            markdownit.renderer.rules.math_inline = (tokens: any, idx: any) => {
              return `<span data-type="math" data-content="${tokens[idx].content}"></span>`;
            };
          },
          updateDOM(element: HTMLElement) {
            const content = element.getAttribute('data-content');
            if (content) {
              element.setAttribute('data-content', content);
            }
          },
        },
      } as MarkdownNodeSpec,
    };
  },
});
