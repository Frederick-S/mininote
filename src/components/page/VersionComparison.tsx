import { useMemo } from 'react';
import { ArrowLeftRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { PageVersionData } from '@/types/database';

interface VersionComparisonProps {
  version1: PageVersionData;
  version2: PageVersionData;
  onClose: () => void;
}

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber1?: number;
  lineNumber2?: number;
}

export function VersionComparison({ version1, version2, onClose }: VersionComparisonProps) {
  // Simple line-by-line diff algorithm
  const diff = useMemo(() => {
    const lines1 = version1.content.split('\n');
    const lines2 = version2.content.split('\n');
    const result: DiffLine[] = [];

    // Simple diff: compare line by line
    const maxLength = Math.max(lines1.length, lines2.length);
    let lineNum1 = 1;
    let lineNum2 = 1;

    for (let i = 0; i < maxLength; i++) {
      const line1 = lines1[i];
      const line2 = lines2[i];

      if (line1 === line2) {
        // Lines are the same
        if (line1 !== undefined) {
          result.push({
            type: 'unchanged',
            content: line1,
            lineNumber1: lineNum1++,
            lineNumber2: lineNum2++,
          });
        }
      } else {
        // Lines are different
        if (line1 !== undefined && line2 === undefined) {
          // Line removed in version 2
          result.push({
            type: 'removed',
            content: line1,
            lineNumber1: lineNum1++,
          });
        } else if (line1 === undefined && line2 !== undefined) {
          // Line added in version 2
          result.push({
            type: 'added',
            content: line2,
            lineNumber2: lineNum2++,
          });
        } else if (line1 !== undefined && line2 !== undefined) {
          // Line changed
          result.push({
            type: 'removed',
            content: line1,
            lineNumber1: lineNum1++,
          });
          result.push({
            type: 'added',
            content: line2,
            lineNumber2: lineNum2++,
          });
        }
      }
    }

    return result;
  }, [version1.content, version2.content]);

  const stats = useMemo(() => {
    const added = diff.filter(d => d.type === 'added').length;
    const removed = diff.filter(d => d.type === 'removed').length;
    const unchanged = diff.filter(d => d.type === 'unchanged').length;
    return { added, removed, unchanged, total: diff.length };
  }, [diff]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const titleChanged = version1.title !== version2.title;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Compare Versions
          </DialogTitle>
          <DialogDescription>
            Comparing version {version1.version} with version {version2.version}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Version Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border bg-muted/50">
              <div className="text-sm font-medium mb-1">Version {version1.version}</div>
              <div className="text-xs text-muted-foreground">{formatDate(version1.created_at)}</div>
              <div className="text-sm mt-2 font-medium truncate">{version1.title}</div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/50">
              <div className="text-sm font-medium mb-1">Version {version2.version}</div>
              <div className="text-xs text-muted-foreground">{formatDate(version2.created_at)}</div>
              <div className="text-sm mt-2 font-medium truncate">{version2.title}</div>
            </div>
          </div>

          {/* Title Comparison */}
          {titleChanged && (
            <div className="p-3 rounded-lg border bg-amber-50 dark:bg-amber-950/20">
              <div className="text-sm font-medium mb-2">Title Changed</div>
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="text-red-600 dark:text-red-400">- {version1.title}</span>
                </div>
                <div className="text-sm">
                  <span className="text-green-600 dark:text-green-400">+ {version2.title}</span>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>{stats.added} added</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>{stats.removed} removed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span>{stats.unchanged} unchanged</span>
            </div>
          </div>

          <Separator />

          {/* Content Diff */}
          <ScrollArea className="h-[400px]">
            <div className="font-mono text-xs">
              {diff.map((line, index) => {
                let bgColor = '';
                let textColor = '';
                let prefix = ' ';

                if (line.type === 'added') {
                  bgColor = 'bg-green-50 dark:bg-green-950/20';
                  textColor = 'text-green-700 dark:text-green-300';
                  prefix = '+';
                } else if (line.type === 'removed') {
                  bgColor = 'bg-red-50 dark:bg-red-950/20';
                  textColor = 'text-red-700 dark:text-red-300';
                  prefix = '-';
                }

                return (
                  <div
                    key={index}
                    className={`flex ${bgColor} ${textColor} border-l-2 ${
                      line.type === 'added'
                        ? 'border-green-500'
                        : line.type === 'removed'
                        ? 'border-red-500'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex-shrink-0 w-12 px-2 py-1 text-right text-muted-foreground select-none">
                      {line.lineNumber1 || line.lineNumber2 || ''}
                    </div>
                    <div className="flex-shrink-0 w-6 px-1 py-1 text-center select-none">
                      {prefix}
                    </div>
                    <div className="flex-1 px-2 py-1 whitespace-pre-wrap break-all">
                      {line.content || ' '}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
