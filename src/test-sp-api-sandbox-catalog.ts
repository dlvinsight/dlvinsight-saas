import 'dotenv/config';
import type { SpApiCredentials } from './src/app/[locale]/(auth)/dashboard/test-api/types';

async function testSpApiSandboxCatalog() {
  console.log('🚀 Testing SP-API Sandbox Catalog with different approaches...\n');
  
  // Use sandbox credentials from .env.local
  const clientId = process.env.NEXT_PUBLIC_AMAZON_SANDBOX_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_AMAZON_SANDBOX_CLIENT_SECRET;
  const refreshToken = process.env.NEXT_PUBLIC_AMAZON_SANDBOX_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('❌ Missing SP-API credentials in environment variables');
    process.exit(1);
  }

  const credentials: SpApiCredentials = {
    clientId,
    clientSecret,
    refreshToken,
    endpoint: 'https://sandbox.sellingpartnerapi-na.amazon.com',
    marketplaceId: 'ATVPDKIKX0DER',
    awsEnvironment: 'SANDBOX',
  };

  try {
    // Step 1: Get access token
    console.log('📋 Step 1: Exchanging refresh token for access token...');
    
    const { exchangeRefreshTokenForAccess } = await import('./src/libs/amazon-sp-api');
    const tokenResult = await exchangeRefreshTokenForAccess(
      credentials.refreshToken,
      credentials.clientId,
      credentials.clientSecret,
    );
    
    console.log('✅ Access token obtained');
    console.log(`   Expires in: ${tokenResult.expiresIn} seconds\n`);

    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '').replace(/T/, '');
    const headers = {
      'x-amz-access-token': tokenResult.accessToken,
      'x-amz-date': amzDate,
      'Content-Type': 'application/json',
      'User-Agent': 'DLVInsight/1.0.0',
    };

    // Test 1: Try with minimal parameters
    console.log('📋 Test 1: Minimal parameters (just ASIN and marketplace)\n');
    
    let url = `${credentials.endpoint}/catalog/2022-04-01/items/B07N4M94X4?marketplaceIds=${credentials.marketplaceId}`;
    console.log(`   URL: ${url}`);
    
    let response = await fetch(url, { method: 'GET', headers });
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const error = await response.text();
      console.log(`   Error: ${error}\n`);
    } else {
      const data = await response.json();
      console.log('   ✅ Success! Response:');
      console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...\n');
    }

    // Test 2: Try with different API version
    console.log('📋 Test 2: Try older API version (2021-08-01)\n');
    
    url = `${credentials.endpoint}/catalog/2021-08-01/items/B07N4M94X4?marketplaceIds=${credentials.marketplaceId}`;
    console.log(`   URL: ${url}`);
    
    response = await fetch(url, { method: 'GET', headers });
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const error = await response.text();
      console.log(`   Error: ${error}\n`);
    } else {
      const data = await response.json();
      console.log('   ✅ Success! Response:');
      console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...\n');
    }

    // Test 3: Try search endpoint instead
    console.log('📋 Test 3: Try search endpoint without keywords\n');
    
    url = `${credentials.endpoint}/catalog/2022-04-01/items?marketplaceIds=${credentials.marketplaceId}`;
    console.log(`   URL: ${url}`);
    
    response = await fetch(url, { method: 'GET', headers });
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const error = await response.text();
      console.log(`   Error: ${error}\n`);
    } else {
      const data = await response.json();
      console.log('   ✅ Success! Response:');
      console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...\n');
    }

    // Test 4: Try with special test case values (like orders API)
    console.log('📋 Test 4: Try with TEST_CASE values\n');
    
    // Try various test case patterns
    const testCases = ['TEST_CASE_200', 'TEST_CASE_CATALOG', 'TEST_ASIN', 'B07N4M94X4'];
    
    for (const testCase of testCases) {
      console.log(`   Trying ASIN: ${testCase}`);
      url = `${credentials.endpoint}/catalog/2022-04-01/items/${testCase}?marketplaceIds=${credentials.marketplaceId}`;
      
      response = await fetch(url, { method: 'GET', headers });
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Success! Found working test case');
        console.log('   Response preview:', JSON.stringify(data, null, 2).substring(0, 200) + '...\n');
        break;
      }
    }

    // Test 5: List available operations
    console.log('📋 Test 5: Try different catalog operations\n');
    
    // Try product types endpoint
    url = `${credentials.endpoint}/definitions/2020-09-01/productTypes?marketplaceIds=${credentials.marketplaceId}`;
    console.log(`   Trying Product Types: ${url}`);
    
    response = await fetch(url, { method: 'GET', headers });
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Product Types endpoint works!');
      console.log(`   Found ${data.productTypes?.length || 0} product types\n`);
    }

    console.log('✅ All tests completed!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testSpApiSandboxCatalog().catch(console.error);