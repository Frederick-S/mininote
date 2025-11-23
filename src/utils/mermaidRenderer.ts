import mermaid from 'mermaid';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

/**
 * Renders Mermaid diagrams in HTML content
 * Looks for code blocks with class="language-mermaid" (from markdown rendering)
 */
export async function renderMermaidInHtml(html: string): Promise<string> {
  // Find all mermaid code blocks - both from markdown and TipTap
  // Pattern 1: <pre><code class="language-mermaid">...</code></pre> (from markdown)
  // Pattern 2: <pre data-language="mermaid"><code>...</code></pre> (from TipTap)
  const mermaidRegex1 = /<pre[^>]*><code[^>]*class="[^"]*language-mermaid[^"]*"[^>]*>([\s\S]*?)<\/code><\/pre>/g;
  const mermaidRegex2 = /<pre[^>]*data-language="mermaid"[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/g;
  
  let result = html;
  
  // Process both patterns
  const patterns = [mermaidRegex1, mermaidRegex2];
  
  for (const pattern of patterns) {
    const matches = Array.from(result.matchAll(pattern));
    
    for (const match of matches) {
      const mermaidCode = match[1]
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
      
      if (!mermaidCode) continue;
      
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
  
  // Return original HTML with placeholders for both patterns
  let result = html;
  result = result.replace(
    /<pre[^>]*><code[^>]*class="[^"]*language-mermaid[^"]*"[^>]*>[\s\S]*?<\/code><\/pre>/g,
    '<div class="mermaid-wrapper border rounded-lg p-4 my-4 bg-muted/30"><div class="text-muted-foreground text-sm">Rendering diagram...</div></div>'
  );
  result = result.replace(
    /<pre[^>]*data-language="mermaid"[^>]*><code[^>]*>[\s\S]*?<\/code><\/pre>/g,
    '<div class="mermaid-wrapper border rounded-lg p-4 my-4 bg-muted/30"><div class="text-muted-foreground text-sm">Rendering diagram...</div></div>'
  );
  return result;
}
