import 'dotenv/config';

import { SpApiTestRunner } from './src/app/[locale]/(auth)/dashboard/test-api/tests';
import type { SpApiCredentials } from './src/app/[locale]/(auth)/dashboard/test-api/types';

async function runDetailedSpApiTest() {
  console.log('🚀 Starting detailed SP-API connection test...\n');

  // Use sandbox credentials from .env.local
  const clientId = process.env.NEXT_PUBLIC_AMAZON_SANDBOX_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_AMAZON_SANDBOX_CLIENT_SECRET;
  const refreshToken = process.env.NEXT_PUBLIC_AMAZON_SANDBOX_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('❌ Missing SP-API credentials in environment variables');
    process.exit(1);
  }

  console.log('📋 Configuration:');
  console.log(`  Client ID: ${clientId.substring(0, 20)}...`);
  console.log(`  Environment: SANDBOX`);
  console.log(`  Endpoint: https://sandbox.sellingpartnerapi-na.amazon.com`);
  console.log(`  Marketplace: ATVPDKIKX0DER (US)\n`);

  const credentials: SpApiCredentials = {
    clientId,
    clientSecret,
    refreshToken,
    endpoint: 'https://sandbox.sellingpartnerapi-na.amazon.com',
    marketplaceId: 'ATVPDKIKX0DER', // US marketplace
    awsEnvironment: 'SANDBOX',
  };

  try {
    const testRunner = new SpApiTestRunner(credentials);
    const results = await testRunner.runAllTests();

    console.log('\n=== 📊 DETAILED TEST RESULTS ===\n');
    console.log(`Timestamp: ${results.timestamp}`);
    console.log(`Environment: ${results.environment}`);
    console.log(`Endpoint: ${results.endpoint}`);
    console.log(`Marketplace ID: ${results.marketplaceId}`);

    console.log('\n--- 📈 Summary ---');
    console.log(`Overall Status: ${results.summary.overallStatus === 'healthy' ? '✅ HEALTHY' : '⚠️ ISSUES DETECTED'}`);
    console.log(`Total Steps: ${results.summary.totalSteps}`);
    console.log(`Successful: ${results.summary.successfulSteps} ✅`);
    console.log(`Failed: ${results.summary.failedSteps} ❌`);
    console.log(`Total Duration: ${results.summary.totalDuration}ms`);

    console.log('\n--- 📝 Detailed Test Results ---');

    results.steps.forEach((step, index) => {
      console.log(`\n${index + 1}. ${step.step}`);
      console.log(`   Status: ${step.status === 'success' ? '✅' : '❌'} ${step.status.toUpperCase()}`);
      console.log(`   Message: ${step.message}`);

      if (step.duration) {
        console.log(`   Duration: ${step.duration}ms`);
      }

      // Show the actual data returned from Amazon
      if (step.data) {
        console.log(`   📦 Response Data:`);
        console.log(JSON.stringify(step.data, null, 4).split('\n').map(line => `      ${line}`).join('\n'));
      }

      if (step.details) {
        console.log(`   📄 Additional Details:`);
        console.log(JSON.stringify(step.details, null, 4).split('\n').map(line => `      ${line}`).join('\n'));
      }
    });

    console.log('\n--- 🔍 Raw Test Results Object ---');
    console.log(JSON.stringify(results, null, 2));

    console.log('\n✅ Test completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
runDetailedSpApiTest().catch(console.error);
