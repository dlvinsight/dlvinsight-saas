'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { fetchSellerAccounts } from '../../sources/actions';
import { useSpApiTests } from '../hooks/useSpApiTests';
import { AccountSelector } from './AccountSelector';
import { TestResultsDisplay } from './TestResultsDisplay';

export function SpApiTestRunner() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [hasAccounts, setHasAccounts] = useState<boolean | null>(null);
  const { isRunningTest, testResults, error, runTest } = useSpApiTests();

  useEffect(() => {
    const checkAccounts = async () => {
      const result = await fetchSellerAccounts();
      setHasAccounts(result.success && result.accounts.length > 0);
    };
    checkAccounts();
  }, []);

  const handleRunTest = async () => {
    if (selectedAccountId) {
      await runTest(selectedAccountId);
    }
  };

  if (hasAccounts === null) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (!hasAccounts) {
    return (
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <AlertCircle className="size-5 text-orange-500" />
          <div>
            <h3 className="font-semibold">No accounts found</h3>
            <p className="text-sm text-muted-foreground">
              Please add an Amazon seller account first from the Sources page.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>
            Select an account to test its SP-API connectivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <AccountSelector
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
              disabled={isRunningTest}
            />
            <Button
              onClick={handleRunTest}
              disabled={!selectedAccountId || isRunningTest}
            >
              {isRunningTest
                ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Running Test...
                    </>
                  )
                : (
                    'Run Health Check'
                  )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="flex items-center gap-4 pt-6">
            <AlertCircle className="size-5 text-red-500" />
            <div>
              <h3 className="font-semibold">Test Failed</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {testResults && <TestResultsDisplay testResults={testResults} />}
    </div>
  );
}
