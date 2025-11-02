import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { MarkdownNodeSpec } from 'tiptap-markdown';

// Math node component
function MathNodeView({ node }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { content } = node.attrs;

  useEffect(() => {
    if (containerRef.current && content) {
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
  }, [content, node.attrs.display]);

  return (
    <NodeViewWrapper className="math-node">
      <div
        ref={containerRef}
        className="math-content inline-block"
        style={{ minHeight: '1em' }}
      />
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
          // Setup markdown-it plugin to recognize math syntax
          setup(markdownit: any) {
            // Add a rule to parse inline math $...$
            markdownit.inline.ruler.before('escape', 'math_inline', (state: any, silent: any) => {
              if (state.src[state.pos] !== '$') return false;
              
              const start = state.pos + 1;
              let end = start;
              let foundEnd = false;
              
              // Find closing $
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
            
            // Add renderer for math_inline token
            markdownit.renderer.rules.math_inline = (tokens: any, idx: any) => {
              return `<span data-type="math" data-content="${tokens[idx].content}"></span>`;
            };
          },
          // Update the DOM element to include the content attribute
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
