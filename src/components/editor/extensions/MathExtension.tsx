import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useEffect, useRef } from 'react';

// Math node component
function MathNodeView({ node }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { content } = node.attrs;

  useEffect(() => {
    if (containerRef.current && content) {
      // Dynamically import MathJax
      import('mathjax-full/js/mathjax').then(({ mathjax }) => {
        import('mathjax-full/js/input/tex').then(({ TeX }) => {
          import('mathjax-full/js/output/svg').then(({ SVG }) => {
            import('mathjax-full/js/adaptors/liteAdaptor').then(({ liteAdaptor }) => {
              import('mathjax-full/js/core/MmlTree/SerializedMmlVisitor').then(() => {
                const adaptor = liteAdaptor();
                const tex = new TeX({ packages: ['base', 'ams', 'noerrors'] });
                const svg = new SVG({ fontCache: 'local' });
                const html = mathjax.document('', { InputJax: tex, OutputJax: svg });

                try {
                  const mathNode = html.convert(content, {
                    display: node.attrs.display || false,
                  });
                  const svgString = adaptor.innerHTML(mathNode);
                  if (containerRef.current) {
                    containerRef.current.innerHTML = svgString;
                  }
                } catch (error) {
                  console.error('MathJax rendering error:', error);
                  if (containerRef.current) {
                    containerRef.current.innerHTML = `<span style="color: red;">Error rendering math: ${content}</span>`;
                  }
                }
              });
            });
          });
        });
      });
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
