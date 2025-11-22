import mermaid from 'mermaid';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

/**
 * Renders Mermaid diagrams in HTML content
 * Looks for div[data-type="mermaid"] elements from TipTap
 */
export async function renderMermaidInHtml(html: string): Promise<string> {
  // Find all mermaid divs from TipTap
  const mermaidRegex = /<div[^>]*data-type="mermaid"[^>]*data-content="([^"]*)"[^>]*>[\s\S]*?<\/div>/g;
  
  const matches = Array.from(html.matchAll(mermaidRegex));
  
  if (matches.length === 0) {
    return html;
  }

  let result = html;
  
  for (const match of matches) {
    const mermaidCode = match[1]
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    try {
      const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
      const { svg } = await mermaid.render(id, mermaidCode);
      
      const wrappedSvg = `<div class="mermaid-wrapper border rounded-lg p-4 my-4 bg-muted/30"><div class="flex justify-center">${svg}</div></div>`;
      result = result.replace(match[0], wrappedSvg);
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      const errorHtml = `<div class="mermaid-wrapper border rounded-lg p-4 my-4 bg-muted/30"><div class="text-red-500 text-sm">Error rendering Mermaid diagram</div></div>`;
      result = result.replace(match[0], errorHtml);
    }
  }
  
  return result;
}

/**
 * Synchronous version that returns a placeholder and renders async
 * Use this when you need immediate rendering
 */
export function renderMermaidInHtmlSync(html: string, onRendered?: (html: string) => void): string {
  renderMermaidInHtml(html).then((rendered) => {
    onRendered?.(rendered);
  });
  
  // Return original HTML with placeholders
  return html.replace(
    /<div[^>]*data-type="mermaid"[^>]*>[\s\S]*?<\/div>/g,
    '<div class="mermaid-wrapper border rounded-lg p-4 my-4 bg-muted/30"><div class="text-muted-foreground text-sm">Rendering diagram...</div></div>'
  );
}
