'use server';

import { exchangeRefreshTokenForAccess } from '@/libs/amazon-sp-api';

/**
 * Test SP-API integration with minimal API calls
 * This can be used in both development and production to verify connectivity
 */
export async function testSpApiProductFetch(credentials: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  endpoint: string;
  marketplaceId: string;
  awsEnvironment: 'PRODUCTION' | 'SANDBOX';
}) {
  const testResults = {
    timestamp: new Date().toISOString(),
    environment: credentials.awsEnvironment,
    endpoint: credentials.endpoint,
    marketplaceId: credentials.marketplaceId,
    steps: [] as Array<{
      step: string;
      status: 'success' | 'error';
      message: string;
      data?: any;
      duration?: number;
    }>,
  };

  const addStep = (step: string, status: 'success' | 'error', message: string, data?: any, duration?: number) => {
    testResults.steps.push({ step, status, message, data, duration });
  };

  try {
    // Step 1: Test token exchange
    const tokenStartTime = Date.now();
    let accessToken: string;

    try {
      const tokenResult = await exchangeRefreshTokenForAccess(
        credentials.refreshToken,
        credentials.clientId,
        credentials.clientSecret,
      );
      accessToken = tokenResult.accessToken;
      const tokenDuration = Date.now() - tokenStartTime;

      addStep(
        'Token Exchange',
        'success',
        'Successfully obtained access token',
        { expiresIn: tokenResult.expiresIn },
        tokenDuration,
      );
    } catch (error) {
      addStep(
        'Token Exchange',
        'error',
        error instanceof Error ? error.message : 'Failed to exchange token',
      );
      return testResults;
    }

    // Step 2: Test marketplace participations (lightweight API call)
    const marketplaceStartTime = Date.now();
    try {
      const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '').replace(/T/, '');
      const response = await fetch(`${credentials.endpoint}/sellers/v1/marketplaceParticipations`, {
        method: 'GET',
        headers: {
          'x-amz-access-token': accessToken,
          'x-amz-date': amzDate,
          'Content-Type': 'application/json',
        },
      });

      const marketplaceDuration = Date.now() - marketplaceStartTime;

      if (response.ok) {
        const data = await response.json();
        const marketplaces = data.payload || [];
        const hasTargetMarketplace = marketplaces.some(
          (mp: any) => mp.marketplace.id === credentials.marketplaceId,
        );

        addStep(
          'Marketplace Verification',
          'success',
          `Found ${marketplaces.length} marketplace(s)`,
          {
            marketplaces: marketplaces.map((mp: any) => ({
              id: mp.marketplace.id,
              name: mp.marketplace.name,
              countryCode: mp.marketplace.countryCode,
            })),
            targetMarketplaceFound: hasTargetMarketplace,
          },
          marketplaceDuration,
        );
      } else {
        const errorText = await response.text();
        addStep(
          'Marketplace Verification',
          'error',
          `API returned ${response.status}`,
          { error: errorText },
          marketplaceDuration,
        );
      }
    } catch (error) {
      addStep(
        'Marketplace Verification',
        'error',
        error instanceof Error ? error.message : 'Failed to verify marketplace',
      );
    }

    // Step 3: Test catalog API with a single item
    const catalogStartTime = Date.now();
    try {
      // Use a known test ASIN for sandbox or a safe ASIN for production
      const testAsin = credentials.awsEnvironment === 'SANDBOX' ? 'B07DFPLXY3' : 'B07DFPLXY3';
      const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '').replace(/T/, '');

      const response = await fetch(
        `${credentials.endpoint}/catalog/2022-04-01/items/${testAsin}?marketplaceIds=${credentials.marketplaceId}&includedData=summaries`,
        {
          method: 'GET',
          headers: {
            'x-amz-access-token': accessToken,
            'x-amz-date': amzDate,
            'Content-Type': 'application/json',
          },
        },
      );

      const catalogDuration = Date.now() - catalogStartTime;

      if (response.ok) {
        const data = await response.json();
        const summary = data.summaries?.find((s: any) => s.marketplaceId === credentials.marketplaceId);

        addStep(
          'Catalog API Test',
          'success',
          'Successfully fetched catalog item',
          {
            asin: data.asin,
            itemName: summary?.itemName || 'N/A',
            brand: summary?.brand || 'N/A',
          },
          catalogDuration,
        );
      } else {
        const errorText = await response.text();
        addStep(
          'Catalog API Test',
          'error',
          `API returned ${response.status}`,
          { error: errorText },
          catalogDuration,
        );
      }
    } catch (error) {
      addStep(
        'Catalog API Test',
        'error',
        error instanceof Error ? error.message : 'Failed to test catalog API',
      );
    }

    // Step 4: Test rate limiting headers
    try {
      const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '').replace(/T/, '');
      const response = await fetch(`${credentials.endpoint}/catalog/2022-04-01/items`, {
        method: 'GET',
        headers: {
          'x-amz-access-token': accessToken,
          'x-amz-date': amzDate,
          'Content-Type': 'application/json',
        },
      });

      // Even if this fails, we can check headers
      const rateLimitInfo = {
        limit: response.headers.get('x-amzn-RateLimit-Limit'),
        remaining: response.headers.get('x-amzn-RequestId'),
        requestId: response.headers.get('x-amzn-RequestId'),
      };

      addStep(
        'Rate Limit Check',
        'success',
        'Retrieved rate limit information',
        rateLimitInfo,
      );
    } catch (error) {
      addStep(
        'Rate Limit Check',
        'error',
        'Could not check rate limits',
      );
    }
  } catch (error) {
    addStep(
      'General Error',
      'error',
      error instanceof Error ? error.message : 'Unexpected error occurred',
    );
  }

  // Calculate summary
  const successCount = testResults.steps.filter(s => s.status === 'success').length;
  const totalDuration = testResults.steps.reduce((sum, step) => sum + (step.duration || 0), 0);

  return {
    ...testResults,
    summary: {
      totalSteps: testResults.steps.length,
      successfulSteps: successCount,
      failedSteps: testResults.steps.length - successCount,
      totalDuration,
      overallStatus: successCount === testResults.steps.length ? 'healthy' : 'issues',
    },
  };
}

/**
 * Run a comprehensive SP-API health check
 * This is safe to run in production as it uses minimal API calls
 */
export async function runSpApiHealthCheck(accountId: string) {
  try {
    const { eq } = await import('drizzle-orm');
    const { getAuthContext } = await import('@/libs/auth-helpers');
    const { db } = await import('@/libs/DB');
    const { decryptSpApiCredentials } = await import('@/libs/encryption');
    const { sellerAccountSchema } = await import('@/models/Schema');

    const { organization } = await getAuthContext();

    if (!organization) {
      return {
        success: false,
        error: 'Organization not found',
      };
    }

    // Fetch the account
    const accounts = await db
      .select()
      .from(sellerAccountSchema)
      .where(eq(sellerAccountSchema.id, accountId))
      .limit(1);

    const account = accounts[0];
    if (!account || account.organizationId !== organization.id) {
      return {
        success: false,
        error: 'Account not found',
      };
    }

    // Get encryption password
    const encryptionPassword = process.env.ENCRYPTION_PASSWORD || 'dev-encryption-password';

    // Check if credentials exist
    if (!account.lwaClientId || !account.lwaClientSecret || !account.refreshToken) {
      return {
        success: false,
        error: 'SP-API credentials not found for this account',
      };
    }

    // Decrypt credentials
    const credentials = decryptSpApiCredentials({
      lwaClientId: account.lwaClientId,
      lwaClientSecret: account.lwaClientSecret,
      refreshToken: account.refreshToken,
    }, encryptionPassword);

    // Prepare endpoint
    const endpoint = account.awsEnvironment === 'SANDBOX'
      ? account.endpoint.replace('https://sellingpartnerapi', 'https://sandbox.sellingpartnerapi')
      : account.endpoint;

    // Run the test
    const testResults = await testSpApiProductFetch({
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      refreshToken: credentials.refreshToken,
      endpoint,
      marketplaceId: account.marketplaceId,
      awsEnvironment: account.awsEnvironment as 'PRODUCTION' | 'SANDBOX',
    });

    return {
      success: true,
      accountName: account.accountName,
      testResults,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to run health check',
    };
  }
}
