import type { SpApiCredentials, SpApiTestCase, TestResults, TestStep } from '../types';
import { testTokenExchange } from './auth.test';
import { testCatalogApi } from './catalog.test';
import { testMarketplaceParticipations } from './marketplace.test';
import { testRateLimits } from './rate-limit.test';

export const spApiTestCases: SpApiTestCase[] = [
  {
    id: 'token-exchange',
    name: 'Token Exchange',
    description: 'Test OAuth token exchange with Amazon SP-API',
    category: 'auth',
    requiresAuth: false,
    execute: testTokenExchange,
  },
  {
    id: 'marketplace-participations',
    name: 'Marketplace Participations',
    description: 'Verify marketplace access and configuration',
    category: 'marketplace',
    requiresAuth: true,
    execute: testMarketplaceParticipations as any,
  },
  {
    id: 'catalog-api',
    name: 'Catalog API',
    description: 'Test product catalog access',
    category: 'catalog',
    requiresAuth: true,
    execute: testCatalogApi as any,
  },
  {
    id: 'rate-limits',
    name: 'Rate Limit Headers',
    description: 'Check API rate limit headers',
    category: 'rate-limit',
    requiresAuth: true,
    execute: testRateLimits as any,
  },
];

export class SpApiTestRunner {
  private credentials: SpApiCredentials;
  private accessToken: string | null = null;

  constructor(credentials: SpApiCredentials) {
    this.credentials = credentials;
  }

  async runAllTests(selectedTests?: string[]): Promise<TestResults> {
    const startTime = new Date();
    const steps: TestStep[] = [];

    const testsToRun = selectedTests
      ? spApiTestCases.filter(test => selectedTests.includes(test.id))
      : spApiTestCases;

    for (const testCase of testsToRun) {
      try {
        let result: TestStep;

        if (testCase.id === 'token-exchange') {
          result = await testCase.execute(this.credentials);

          // Extract access token if successful
          if (result.status === 'success') {
            const { exchangeRefreshTokenForAccess } = await import('@/libs/amazon-sp-api');
            const tokenResult = await exchangeRefreshTokenForAccess(
              this.credentials.refreshToken,
              this.credentials.clientId,
              this.credentials.clientSecret,
            );
            this.accessToken = tokenResult.accessToken;
          }
        } else {
          // Other tests require access token
          if (!this.accessToken) {
            result = {
              step: testCase.name,
              status: 'error',
              message: 'Access token not available. Token exchange must be run first.',
            };
          } else {
            result = await testCase.execute({
              ...this.credentials,
              accessToken: this.accessToken,
            });
          }
        }

        steps.push(result);
      } catch (error) {
        steps.push({
          step: testCase.name,
          status: 'error',
          message: error instanceof Error ? error.message : 'Test execution failed',
        });
      }
    }

    const successCount = steps.filter(s => s.status === 'success').length;
    const totalDuration = steps.reduce((sum, step) => sum + (step.duration || 0), 0);

    return {
      timestamp: startTime.toISOString(),
      environment: this.credentials.awsEnvironment,
      endpoint: this.credentials.endpoint,
      marketplaceId: this.credentials.marketplaceId,
      steps,
      summary: {
        totalSteps: steps.length,
        successfulSteps: successCount,
        failedSteps: steps.length - successCount,
        totalDuration,
        overallStatus: successCount === steps.length ? 'healthy' : 'issues',
      },
    };
  }

  async runSingleTest(testId: string): Promise<TestStep | null> {
    const testCase = spApiTestCases.find(test => test.id === testId);
    if (!testCase) {
      return null;
    }

    if (testCase.id === 'token-exchange') {
      return testCase.execute(this.credentials);
    }

    if (!this.accessToken) {
      return {
        step: testCase.name,
        status: 'error',
        message: 'Access token not available. Run token exchange first.',
      };
    }

    return testCase.execute({
      ...this.credentials,
      accessToken: this.accessToken,
    });
  }
}
