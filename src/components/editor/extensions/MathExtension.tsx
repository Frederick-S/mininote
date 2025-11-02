import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

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
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ 'data-type': 'math' }, HTMLAttributes)];
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
});
