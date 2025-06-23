'use client';

import { AlertCircle, CheckCircle, Clock, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { fetchSellerAccounts } from '../../sources/actions';
import { runSpApiHealthCheck } from '../actions';

type SellerAccount = {
  id: string;
  name: string;
  marketplace: string;
  marketplaceCode: string;
};

type TestStep = {
  step: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
  duration?: number;
};

type TestResults = {
  timestamp: string;
  environment: string;
  endpoint: string;
  marketplaceId: string;
  steps: TestStep[];
  summary: {
    totalSteps: number;
    successfulSteps: number;
    failedSteps: number;
    totalDuration: number;
    overallStatus: string;
  };
};

export function SpApiTestRunner() {
  const [accounts, setAccounts] = useState<SellerAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAccounts = async () => {
      setIsLoadingAccounts(true);
      const result = await fetchSellerAccounts();
      if (result.success) {
        setAccounts(result.accounts);
        if (result.accounts.length > 0) {
          const firstAccount = result.accounts[0];
          if (firstAccount) {
            setSelectedAccountId(firstAccount.id);
          }
        }
      }
      setIsLoadingAccounts(false);
    };

    loadAccounts();
  }, []);

  const runTest = async () => {
    if (!selectedAccountId) return;

    setIsRunningTest(true);
    setError(null);
    setTestResults(null);

    try {
      const result = await runSpApiHealthCheck(selectedAccountId);
      
      if (result.success && result.testResults) {
        // TypeScript workaround - we know the structure has summary
        setTestResults(result.testResults as TestResults);
      } else {
        setError(result.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run test');
    } finally {
      setIsRunningTest(false);
    }
  };

  const getStepIcon = (status: 'success' | 'error') => {
    if (status === 'success') {
      return <CheckCircle className="size-5 text-green-500" />;
    }
    return <XCircle className="size-5 text-red-500" />;
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '';
    return `${ms}ms`;
  };

  if (isLoadingAccounts) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (accounts.length === 0) {
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
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - {account.marketplace} ({account.marketplaceCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={runTest}
              disabled={!selectedAccountId || isRunningTest}
            >
              {isRunningTest ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Running Test...
                </>
              ) : (
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

      {testResults && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
              <CardDescription>
                Environment: {testResults.environment} | Tested at: {new Date(testResults.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-muted p-4">
                  <div className="text-2xl font-bold">{testResults.summary.totalSteps}</div>
                  <div className="text-sm text-muted-foreground">Total Steps</div>
                </div>
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {testResults.summary.successfulSteps}
                  </div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </div>
                <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {testResults.summary.failedSteps}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <div className="text-2xl font-bold">{testResults.summary.totalDuration}ms</div>
                  <div className="text-sm text-muted-foreground">Total Duration</div>
                </div>
              </div>
              
              <div className="mt-4">
                <Card className={testResults.summary.overallStatus === 'healthy' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'}>
                  <CardContent className="flex items-center gap-4 pt-6">
                    <AlertCircle className={`size-5 ${testResults.summary.overallStatus === 'healthy' ? 'text-green-500' : 'text-red-500'}`} />
                    <div>
                      <h3 className="font-semibold">
                        Overall Status: {testResults.summary.overallStatus === 'healthy' ? 'Healthy' : 'Issues Detected'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {testResults.summary.overallStatus === 'healthy' 
                          ? 'All API endpoints are responding correctly.'
                          : 'Some API endpoints encountered issues. Check the detailed results below.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Test Results</CardTitle>
              <CardDescription>
                Step-by-step results of the API health check
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.steps.map((step, index) => (
                  <div key={index} className="border-l-4 border-muted pl-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStepIcon(step.status)}
                        <div>
                          <h4 className="font-semibold">{step.step}</h4>
                          <p className="text-sm text-muted-foreground">{step.message}</p>
                          {step.data && (
                            <pre className="mt-2 max-w-2xl overflow-auto rounded bg-muted p-2 text-xs">
                              {JSON.stringify(step.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                      {step.duration && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 size-3" />
                          {formatDuration(step.duration)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connection Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Endpoint</dt>
                  <dd className="mt-1 text-sm">{testResults.endpoint}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Marketplace ID</dt>
                  <dd className="mt-1 text-sm">{testResults.marketplaceId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Environment</dt>
                  <dd className="mt-1 text-sm">{testResults.environment}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Test Timestamp</dt>
                  <dd className="mt-1 text-sm">{testResults.timestamp}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}