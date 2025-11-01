import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { useState } from 'react';
import { ChevronDown, Copy, Check } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'scss', label: 'SCSS' },
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'xml', label: 'XML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash' },
    { value: 'shell', label: 'Shell' },
    { value: 'powershell', label: 'PowerShell' },
    { value: 'dockerfile', label: 'Dockerfile' },
    { value: 'plaintext', label: 'Plain Text' },
];

function CodeBlockComponent(props: any) {
    const [searchTerm, setSearchTerm] = useState('');
    const [copied, setCopied] = useState(false);
    const language = props.node.attrs.language || 'plaintext';

    const filteredLanguages = LANGUAGES.filter((lang) =>
        lang.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentLanguage = LANGUAGES.find((lang) => lang.value === language);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const code = props.node.textContent;
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <NodeViewWrapper className="code-block-wrapper relative">
            <div className="flex items-center justify-between bg-gray-800 px-3 py-1 rounded-t-lg">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                            {currentLanguage?.label || 'Plain Text'}
                            <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px] max-h-[300px] overflow-auto">
                        <div className="px-2 py-1.5">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full px-2 py-1 text-sm border rounded"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        {filteredLanguages.map((lang) => (
                            <DropdownMenuItem
                                key={lang.value}
                                onClick={() => {
                                    props.updateAttributes({ language: lang.value });
                                    setSearchTerm('');
                                }}
                            >
                                {lang.label}
                            </DropdownMenuItem>
                        ))}
                        {filteredLanguages.length === 0 && (
                            <div className="px-2 py-1.5 text-sm text-gray-500">No results</div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-gray-300 hover:text-white hover:bg-gray-700"
                    onClick={handleCopy}
                    title={copied ? 'Copied!' : 'Copy code'}
                >
                    {copied ? (
                        <>
                            <Check className="h-3 w-3 mr-1" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                        </>
                    )}
                </Button>
            </div>
            <pre className="rounded-t-none">
                <NodeViewContent as="div">
                    <code className="block" />
                </NodeViewContent>
            </pre>
        </NodeViewWrapper>
    );
}

export const CodeBlockWithLanguage = CodeBlockLowlight.extend({
    addNodeView() {
        return ReactNodeViewRenderer(CodeBlockComponent);
    },
});
