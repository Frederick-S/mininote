import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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

interface CodeBlockLanguageSelectorProps {
  onSelect: (language: string) => void;
  onCancel: () => void;
}

export function CodeBlockLanguageSelector({ onSelect, onCancel }: CodeBlockLanguageSelectorProps) {
  const [open, setOpen] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const handleSelect = (language: string) => {
    setSelectedLanguage(language);
    setOpen(false);
    onSelect(language);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      onCancel();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {LANGUAGES.find((lang) => lang.value === selectedLanguage)?.label || 'Select language...'}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandEmpty>No language found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {LANGUAGES.map((language) => (
              <CommandItem
                key={language.value}
                value={language.value}
                onSelect={() => handleSelect(language.value)}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    selectedLanguage === language.value ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                {language.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
