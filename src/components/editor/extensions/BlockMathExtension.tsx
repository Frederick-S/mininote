import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { MarkdownNodeSpec } from 'tiptap-markdown';

// Block Math node component with edit capability
function BlockMathNodeView({ node, updateAttributes, deleteNode }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.attrs.content);
  const { content } = node.attrs;

  useEffect(() => {
    if (containerRef.current && content && !isEditing) {
      try {
        katex.render(content, containerRef.current, {
          displayMode: true,
          throwOnError: false,
          errorColor: '#cc0000',
        });
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div style="color: red;">Error rendering math: ${content}</div>`;
        }
      }
    }
  }, [content, isEditing]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
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
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(content);
    }
  };

  if (isEditing) {
    return (
      <NodeViewWrapper className="block-math-node-editing">
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="block-math-input"
          placeholder="Enter LaTeX formula..."
          rows={3}
        />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="block-math-node-wrapper" style={{ display: 'block' }}>
      <div className="block-math-node-container">
        <div
          ref={containerRef}
          className="block-math-content"
          onClick={handleDoubleClick}
          style={{ display: 'block', textAlign: 'center' }}
        />
        <button
          onClick={handleDoubleClick}
          className="block-math-edit-button"
          title="Edit formula"
        >
          ✎
        </button>
      </div>
    </NodeViewWrapper>
  );
}

export const BlockMathExtension = Node.create({
  name: 'blockMath',
  group: 'block',
  content: '',
  atom: true,
  draggable: false,

  addAttributes() {
    return {
      content: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="block-math"]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const element = node as HTMLElement;
          return {
            content: element.getAttribute('data-content') || element.textContent || '',
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        {
          'data-type': 'block-math',
          'data-content': node.attrs.content,
        },
        HTMLAttributes
      ),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlockMathNodeView);
  },

  addCommands() {
    return {
      insertBlockMath:
        (attrs: { content: string }) =>
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
          state.write('$$\n' + node.attrs.content + '\n$$');
          state.closeBlock(node);
        },
        parse: {
          setup(markdownit: any) {
            markdownit.block.ruler.before('fence', 'math_block', (state: any, startLine: any, endLine: any, silent: any) => {
              const start = state.bMarks[startLine] + state.tShift[startLine];
              const max = state.eMarks[startLine];
              
              if (start + 2 > max) return false;
              if (state.src.slice(start, start + 2) !== '$$') return false;
              
              let nextLine = startLine;
              let foundEnd = false;
              
              while (nextLine < endLine) {
                nextLine++;
                if (nextLine >= endLine) break;
                
                const lineStart = state.bMarks[nextLine] + state.tShift[nextLine];
                const lineMax = state.eMarks[nextLine];
                const lineText = state.src.slice(lineStart, lineMax);
                
                if (lineText.trim() === '$$') {
                  foundEnd = true;
                  break;
                }
              }
              
              if (!foundEnd) return false;
              
              const content = state.getLines(startLine + 1, nextLine, 0, false).trim();
              
              if (!silent) {
                const token = state.push('math_block', 'div', 0);
                token.content = content;
                token.markup = '$$';
                token.map = [startLine, nextLine + 1];
              }
              
              state.line = nextLine + 1;
              return true;
            });
            
            markdownit.renderer.rules.math_block = (tokens: any, idx: any) => {
              return `<div data-type="block-math" data-content="${tokens[idx].content}"></div>`;
            };
          },
        },
      } as MarkdownNodeSpec,
    };
  },
});
