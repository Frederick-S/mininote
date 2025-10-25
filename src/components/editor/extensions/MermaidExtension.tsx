import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

// Mermaid node component
function MermaidNodeView({ node }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { content } = node.attrs;

  useEffect(() => {
    if (containerRef.current && content) {
      const renderDiagram = async () => {
        try {
          setError(null);
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, content);
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        } catch (err) {
          console.error('Mermaid rendering error:', err);
          setError('Error rendering diagram');
        }
      };

      renderDiagram();
    }
  }, [content]);

  return (
    <NodeViewWrapper className="mermaid-node">
      <div className="mermaid-wrapper border rounded-lg p-4 my-4 bg-muted/30">
        {error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : (
          <div ref={containerRef} className="mermaid-content" />
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const MermaidExtension = Node.create({
  name: 'mermaid',
  group: 'block',
  atom: true,

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
        tag: 'div[data-type="mermaid"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'mermaid' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidNodeView);
  },

  addCommands() {
    return {
      insertMermaid:
        (content: string) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: { content },
          });
        },
    } as any;
  },
});
