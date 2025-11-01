import { useEffect } from 'react';

export function useCodeBlockCopyButtons(containerRef: React.RefObject<HTMLElement | null>, content?: string) {
  useEffect(() => {
    if (!containerRef.current) return;

    const addCopyButtons = () => {
      if (!containerRef.current) return;

      const codeBlocks = containerRef.current.querySelectorAll('pre code');

      codeBlocks.forEach((codeBlock) => {
        const pre = codeBlock.parentElement;
        if (!pre) return;

        // Check if button already exists
        if (pre.querySelector('.code-copy-button')) return;

        // Make pre relative for absolute positioning of button
        pre.style.position = 'relative';

        // Create the copy button
        const button = document.createElement('button');
        button.className = 'code-copy-button absolute top-2 right-2 px-3 py-1.5 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors z-10 font-medium';
        button.title = 'Copy code';
        button.textContent = 'Copy';

        // Add click handler
        button.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const code = codeBlock.textContent || '';
          await navigator.clipboard.writeText(code);
          
          // Show checkmark
          button.textContent = '✓ Copied';
          button.title = 'Copied!';
          button.className = 'code-copy-button absolute top-2 right-2 px-3 py-1.5 text-xs rounded bg-green-600 hover:bg-green-700 text-white transition-colors z-10 font-medium';
          
          // Reset after 2 seconds
          setTimeout(() => {
            button.textContent = 'Copy';
            button.title = 'Copy code';
            button.className = 'code-copy-button absolute top-2 right-2 px-3 py-1.5 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors z-10 font-medium';
          }, 2000);
        });

        pre.appendChild(button);
      });
    };

    // Initial add
    const timer = setTimeout(addCopyButtons, 100);

    // Watch for DOM changes and re-add buttons
    const observer = new MutationObserver(() => {
      addCopyButtons();
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });

    // Cleanup
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [containerRef, content]);
}
