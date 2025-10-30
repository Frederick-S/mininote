/**
 * Example usage of VersionHistory component
 * 
 * This component displays the version history of a page and allows users to:
 * - View all previous versions
 * - View the content of a specific version
 * - Compare two versions side-by-side
 * - Restore a previous version
 */

import { useState } from 'react';
import { VersionHistory } from './VersionHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function VersionHistoryExample() {
  const [showHistory, setShowHistory] = useState(false);
  
  // Example page data - in real usage, this would come from your page state
  const examplePageId = 'example-page-id';
  const currentVersion = 5;

  const handleVersionRestore = () => {
    console.log('Version restored! Refresh your page data.');
    // In real usage, you would refresh the page data here
    // For example: refetch the page or navigate to the updated page
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Version History Example</CardTitle>
          <CardDescription>
            This example demonstrates how to use the VersionHistory component
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Basic Usage</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click the button below to view the version history for a page.
              </p>
              <Button onClick={() => setShowHistory(!showHistory)}>
                {showHistory ? 'Hide' : 'Show'} Version History
              </Button>
            </div>

            {showHistory && (
              <div className="mt-6">
                <VersionHistory
                  pageId={examplePageId}
                  currentVersion={currentVersion}
                  onVersionRestore={handleVersionRestore}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Import the component</h4>
            <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
              {`import { VersionHistory } from '@/components/page';`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. Use in your page editor</h4>
            <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
{`<VersionHistory
  pageId={page.id}
  currentVersion={page.version}
  onVersionRestore={() => {
    // Refresh page data after restore
    refetchPage();
  }}
/>`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Features</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>View all versions in chronological order</li>
              <li>Click the eye icon to view a version's content</li>
              <li>Click the compare icon to select versions for comparison</li>
              <li>Click the restore icon to revert to a previous version</li>
              <li>Compare two versions to see line-by-line differences</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
