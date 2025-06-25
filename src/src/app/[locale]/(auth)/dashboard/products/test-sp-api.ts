'use server';

import { SpApiTestRunner } from '../test-api/tests';
import type { SpApiCredentials, TestResults } from '../test-api/types';

/**
 * Test SP-API integration with minimal API calls
 * This can be used in both development and production to verify connectivity
 */
export async function testSpApiProductFetch(credentials: SpApiCredentials): Promise<TestResults> {
  const testRunner = new SpApiTestRunner(credentials);
  return testRunner.runAllTests();
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
