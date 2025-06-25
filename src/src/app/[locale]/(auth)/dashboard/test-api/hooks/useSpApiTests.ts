import { useCallback, useState } from 'react';

import { runSpApiHealthCheck } from '../actions';
import type { TestResults } from '../types';

export function useSpApiTests() {
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = useCallback(async (accountId: string) => {
    if (!accountId) {
      setError('No account selected');
      return;
    }

    setIsRunningTest(true);
    setError(null);
    setTestResults(null);

    try {
      const result = await runSpApiHealthCheck(accountId);

      if (result.success && result.testResults) {
        setTestResults(result.testResults as TestResults);
      } else {
        setError(result.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run test');
    } finally {
      setIsRunningTest(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setTestResults(null);
    setError(null);
  }, []);

  return {
    isRunningTest,
    testResults,
    error,
    runTest,
    clearResults,
  };
}
