import katex from 'katex';

/**
 * Renders LaTeX math expressions in HTML content
 * Looks for patterns like $...$ (inline) and $$...$$ (display)
 */
export function renderMathInHtml(html: string): string {
  // First, handle display math ($$...$$)
  html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_match, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: true,
        throwOnError: false,
        errorColor: '#cc0000',
      });
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      return `<span style="color: red;">Error rendering math: ${latex}</span>`;
    }
  });

  // Then handle inline math ($...$)
  html = html.replace(/\$([^\$\n]+?)\$/g, (_match, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: false,
        throwOnError: false,
        errorColor: '#cc0000',
      });
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      return `<span style="color: red;">Error rendering math: ${latex}</span>`;
    }
  });

  return html;
}
