/**
 * Example: Page Editor with Version History Integration
 * 
 * This example shows how to integrate the VersionHistory component
 * into a page editing interface with tabs or a sidebar.
 */

import { useState } from 'react';
import { PageEditor } from './PageEditor';
import { VersionHistory } from './VersionHistory';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileEdit, Clock } from 'lucide-react';
import type { PageData } from '@/types/database';

interface PageEditorWithVersionsProps {
  page: PageData;
  onPageUpdate?: () => void;
}

export function PageEditorWithVersions({ page, onPageUpdate }: PageEditorWithVersionsProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');

  const handleVersionRestore = () => {
    // After restoring a version, switch back to editor and refresh
    setActiveTab('editor');
    onPageUpdate?.();
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <Card className="p-2">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'editor' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('editor')}
            className="flex-1"
          >
            <FileEdit className="mr-2 h-4 w-4" />
            Editor
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('history')}
            className="flex-1"
          >
            <Clock className="mr-2 h-4 w-4" />
            Version History
          </Button>
        </div>
      </Card>

      <Separator />

      {/* Content Area */}
      <div>
        {activeTab === 'editor' && (
          <PageEditor
            page={page}
            onSuccess={onPageUpdate}
          />
        )}

        {activeTab === 'history' && (
          <VersionHistory
            pageId={page.id}
            currentVersion={page.version}
            onVersionRestore={handleVersionRestore}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Alternative Layout: Side-by-Side
 * 
 * This layout shows the editor and version history side-by-side
 * on larger screens, useful for comparing while editing.
 */
export function PageEditorWithVersionsSideBySide({ page, onPageUpdate }: PageEditorWithVersionsProps) {
  const handleVersionRestore = () => {
    onPageUpdate?.();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Editor - Takes 2/3 of space on large screens */}
      <div className="lg:col-span-2">
        <PageEditor
          page={page}
          onSuccess={onPageUpdate}
        />
      </div>

      {/* Version History - Takes 1/3 of space on large screens */}
      <div className="lg:col-span-1">
        <VersionHistory
          pageId={page.id}
          currentVersion={page.version}
          onVersionRestore={handleVersionRestore}
        />
      </div>
    </div>
  );
}

/**
 * Alternative Layout: Collapsible Sidebar
 * 
 * This layout shows the editor with a collapsible version history sidebar
 */
export function PageEditorWithVersionsCollapsible({ page, onPageUpdate }: PageEditorWithVersionsProps) {
  const [showHistory, setShowHistory] = useState(false);

  const handleVersionRestore = () => {
    onPageUpdate?.();
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <div className="absolute top-0 right-0 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
        >
          <Clock className="mr-2 h-4 w-4" />
          {showHistory ? 'Hide' : 'Show'} History
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex gap-4">
        {/* Editor */}
        <div className={`flex-1 transition-all ${showHistory ? 'lg:w-2/3' : 'w-full'}`}>
          <PageEditor
            page={page}
            onSuccess={onPageUpdate}
          />
        </div>

        {/* Collapsible History Sidebar */}
        {showHistory && (
          <div className="w-full lg:w-1/3 animate-in slide-in-from-right">
            <VersionHistory
              pageId={page.id}
              currentVersion={page.version}
              onVersionRestore={handleVersionRestore}
            />
          </div>
        )}
      </div>
    </div>
  );
}
