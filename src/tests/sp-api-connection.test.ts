// Load environment variables
import 'dotenv/config';

import { beforeAll, describe, expect, it } from 'vitest';

import { SpApiTestRunner } from '@/src/app/[locale]/(auth)/dashboard/test-api/tests';
import type { SpApiCredentials } from '@/src/app/[locale]/(auth)/dashboard/test-api/types';

describe('SP-API Connection Test', () => {
  let credentials: SpApiCredentials;

  beforeAll(() => {
    // Use sandbox credentials from .env.local
    const clientId = process.env.NEXT_PUBLIC_AMAZON_SANDBOX_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_AMAZON_SANDBOX_CLIENT_SECRET;
    const refreshToken = process.env.NEXT_PUBLIC_AMAZON_SANDBOX_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Missing SP-API credentials in environment variables');
    }

    credentials = {
      clientId,
      clientSecret,
      refreshToken,
      endpoint: 'https://sandbox.sellingpartnerapi-na.amazon.com',
      marketplaceId: 'ATVPDKIKX0DER', // US marketplace
      awsEnvironment: 'SANDBOX',
    };
  });

  it('should successfully exchange refresh token for access token', async () => {
    console.log('\n🔄 Testing token exchange...\n');

    const testRunner = new SpApiTestRunner(credentials);
    const result = await testRunner.runSingleTest('token-exchange');

    console.log('Token Exchange Result:', JSON.stringify(result, null, 2));

    expect(result).toBeTruthy();
    expect(result?.status).toBe('success');
    expect(result?.message).toContain('Successfully exchanged refresh token');
  }, { timeout: 10000 });

  it('should verify marketplace access', async () => {
    console.log('\n🌐 Testing marketplace access...\n');

    const testRunner = new SpApiTestRunner(credentials);

    // First get the access token
    await testRunner.runSingleTest('token-exchange');

    // Then test marketplace access
    const result = await testRunner.runSingleTest('marketplace-participations');

    console.log('Marketplace Access Result:', JSON.stringify(result, null, 2));

    expect(result).toBeTruthy();
    expect(result?.status).toBe('success');
  }, { timeout: 15000 });

  it('should run all SP-API health checks', async () => {
    console.log('\n🏥 Running full SP-API health check...\n');

    const testRunner = new SpApiTestRunner(credentials);
    const results = await testRunner.runAllTests();

    console.log('=== FULL TEST RESULTS ===');
    console.log('Environment:', results.environment);
    console.log('Endpoint:', results.endpoint);
    console.log('Marketplace ID:', results.marketplaceId);
    console.log('\n📊 Summary:');
    console.log(`  Overall Status: ${results.summary.overallStatus}`);
    console.log(`  Total Steps: ${results.summary.totalSteps}`);
    console.log(`  Successful: ${results.summary.successfulSteps}`);
    console.log(`  Failed: ${results.summary.failedSteps}`);
    console.log(`  Total Duration: ${results.summary.totalDuration}ms`);

    console.log('\n📝 Individual Test Results:');
    results.steps.forEach((step, index) => {
      console.log(`\n${index + 1}. ${step.step}`);
      console.log(`   Status: ${step.status === 'success' ? '✅' : '❌'} ${step.status}`);
      console.log(`   Message: ${step.message}`);
      if (step.duration) {
        console.log(`   Duration: ${step.duration}ms`);
      }
      if (step.details) {
        console.log(`   Details: ${JSON.stringify(step.details, null, 2)}`);
      }
    });

    console.log('\n========================\n');

    expect(results).toBeTruthy();
    expect(results.summary.overallStatus).toBe('healthy');
    expect(results.summary.successfulSteps).toBeGreaterThan(0);
    expect(results.steps).toHaveLength(4); // All 4 test cases
  }, { timeout: 30000 });
});
