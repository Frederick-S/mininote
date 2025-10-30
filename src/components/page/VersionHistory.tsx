import { useState } from 'react';
import { Clock, RotateCcw, Eye, GitCompare, Loader2 } from 'lucide-react';
import { usePageVersions, useRestorePageVersion } from '@/hooks/usePageVersions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VersionComparison } from './VersionComparison';
import type { PageVersionData } from '@/types/database';

interface VersionHistoryProps {
  pageId: string;
  currentVersion: number;
  onVersionRestore?: () => void;
}

export function VersionHistory({ pageId, currentVersion, onVersionRestore }: VersionHistoryProps) {
  const { data: versionsData, isLoading, error } = usePageVersions(pageId);
  const versions = (versionsData || []) as PageVersionData[];
  const restoreVersion = useRestorePageVersion();

  const [selectedVersion, setSelectedVersion] = useState<PageVersionData | null>(null);
  const [viewingVersion, setViewingVersion] = useState<PageVersionData | null>(null);
  const [comparingVersions, setComparingVersions] = useState<{
    version1: PageVersionData;
    version2: PageVersionData;
  } | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<PageVersionData | null>(null);

  const handleViewVersion = (version: PageVersionData) => {
    setViewingVersion(version);
  };

  const handleCompareVersion = (version: PageVersionData) => {
    if (!selectedVersion) {
      setSelectedVersion(version);
    } else {
      // Compare the two selected versions
      setComparingVersions({
        version1: selectedVersion,
        version2: version,
      });
      setSelectedVersion(null);
    }
  };

  const handleRestoreClick = (version: PageVersionData) => {
    setVersionToRestore(version);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!versionToRestore) return;

    try {
      await restoreVersion.mutateAsync({
        page_id: pageId,
        version_id: versionToRestore.id,
      });
      setRestoreDialogOpen(false);
      setVersionToRestore(null);
      onVersionRestore?.();
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load version history</p>
        </CardContent>
      </Card>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Version History
          </CardTitle>
          <CardDescription>
            No previous versions available
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Version History
          </CardTitle>
          <CardDescription>
            {versions.length} version{versions.length !== 1 ? 's' : ''} saved
            {selectedVersion && (
              <span className="ml-2 text-primary">
                • Select another version to compare
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {versions.map((version, index) => {
                const isCurrentVersion = version.version === currentVersion;
                const isSelected = selectedVersion?.id === version.id;

                return (
                  <div key={version.id}>
                    <div
                      className={`p-4 rounded-lg border transition-colors ${isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-accent'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              Version {version.version}
                            </span>
                            {isCurrentVersion && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {formatDate(version.created_at)}
                          </p>
                          <p className="text-sm font-medium truncate">
                            {version.title}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewVersion(version)}
                            title="View version"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCompareVersion(version)}
                            title={selectedVersion ? 'Compare with selected' : 'Select for comparison'}
                          >
                            <GitCompare className="h-4 w-4" />
                          </Button>
                          {!isCurrentVersion && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRestoreClick(version)}
                              title="Restore this version"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < versions.length - 1 && <Separator className="my-2" />}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* View Version Dialog */}
      <Dialog open={!!viewingVersion} onOpenChange={(open) => !open && setViewingVersion(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Version {viewingVersion?.version} - {viewingVersion?.title}
            </DialogTitle>
            <DialogDescription>
              {viewingVersion && formatDate(viewingVersion.created_at)}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[calc(80vh-200px)] overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: viewingVersion?.content || '' }}
              />
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingVersion(null)}>
              Close
            </Button>
            {viewingVersion && viewingVersion.version !== currentVersion && (
              <Button onClick={() => {
                setViewingVersion(null);
                handleRestoreClick(viewingVersion);
              }}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore This Version
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare Versions Dialog */}
      {comparingVersions && (
        <VersionComparison
          version1={comparingVersions.version1}
          version2={comparingVersions.version2}
          onClose={() => setComparingVersions(null)}
        />
      )}

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Version?</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore version {versionToRestore?.version}?
              This will create a new version with the content from the selected version.
              Your current version will be preserved in the history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRestoreDialogOpen(false);
                setVersionToRestore(null);
              }}
              disabled={restoreVersion.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRestoreConfirm}
              disabled={restoreVersion.isPending}
            >
              {restoreVersion.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
