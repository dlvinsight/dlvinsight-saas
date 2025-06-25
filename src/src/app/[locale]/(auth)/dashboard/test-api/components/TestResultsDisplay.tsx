import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { TestResults, TestStep } from '../types';

type TestResultsDisplayProps = {
  testResults: TestResults;
};

export function TestResultsDisplay({ testResults }: TestResultsDisplayProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Test Summary</CardTitle>
          <CardDescription>
            Environment:
            {' '}
            {testResults.environment}
            {' '}
            | Tested at:
            {' '}
            {new Date(testResults.timestamp).toLocaleString()}
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
              <div className="text-2xl font-bold">
                {testResults.summary.totalDuration}
                ms
              </div>
              <div className="text-sm text-muted-foreground">Total Duration</div>
            </div>
          </div>

          <div className="mt-4">
            <Card
              className={
                testResults.summary.overallStatus === 'healthy'
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                  : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
              }
            >
              <CardContent className="flex items-center gap-4 pt-6">
                <AlertCircle
                  className={`size-5 ${
                    testResults.summary.overallStatus === 'healthy'
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                />
                <div>
                  <h3 className="font-semibold">
                    Overall Status:
                    {' '}
                    {testResults.summary.overallStatus === 'healthy'
                      ? 'Healthy'
                      : 'Issues Detected'}
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
          <CardDescription>Step-by-step results of the API health check</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.steps.map(step => (
              <TestStepDisplay key={`${step.step}-${step.status}`} step={step} />
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
  );
}

function TestStepDisplay({ step }: { step: TestStep }) {
  const getStepIcon = (status: 'success' | 'error') => {
    if (status === 'success') {
      return <CheckCircle className="size-5 text-green-500" />;
    }
    return <XCircle className="size-5 text-red-500" />;
  };

  const formatDuration = (ms?: number) => {
    if (!ms) {
      return '';
    }
    return `${ms}ms`;
  };

  return (
    <div className="border-l-4 border-muted pl-4">
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
  );
}
