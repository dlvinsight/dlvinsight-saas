import 'dotenv/config';
import type { SpApiCredentials } from './src/app/[locale]/(auth)/dashboard/test-api/types';

async function testSpApiProductTypes() {
  console.log('🚀 Testing SP-API Product Types endpoint...\n');
  
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
    
    console.log('✅ Access token obtained\n');

    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '').replace(/T/, '');
    const headers = {
      'x-amz-access-token': tokenResult.accessToken,
      'x-amz-date': amzDate,
      'Content-Type': 'application/json',
      'User-Agent': 'DLVInsight/1.0.0',
    };

    // Step 2: Get product types
    console.log('📋 Step 2: Fetching product types...\n');
    
    let url = `${credentials.endpoint}/definitions/2020-09-01/productTypes?marketplaceIds=${credentials.marketplaceId}`;
    
    let response = await fetch(url, { method: 'GET', headers });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Product Types Response:');
      console.log(JSON.stringify(data, null, 2));
      
      // If we found product types, get details for each one
      if (data.productTypes && data.productTypes.length > 0) {
        console.log('\n📋 Getting details for each product type...\n');
        
        for (const productType of data.productTypes) {
          console.log(`\n🏷️ Product Type: ${productType.name}`);
          console.log(`   Display Name: ${productType.displayName || 'N/A'}`);
          console.log(`   Marketplace IDs: ${productType.marketplaceIds?.join(', ') || 'N/A'}`);
          
          // Get detailed schema for this product type
          const detailUrl = `${credentials.endpoint}/definitions/2020-09-01/productTypes/${productType.name}?marketplaceIds=${credentials.marketplaceId}`;
          console.log(`\n   Fetching schema from: ${detailUrl}`);
          
          const detailResponse = await fetch(detailUrl, { method: 'GET', headers });
          
          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            console.log('   ✅ Schema retrieved successfully');
            console.log('   Schema preview:', JSON.stringify(detailData, null, 2).substring(0, 1000) + '...');
            
            // Check if this product type can be used for catalog items
            if (detailData.schema) {
              console.log('\n   📊 Schema Properties:');
              const properties = detailData.schema.properties || {};
              console.log(`   - Number of properties: ${Object.keys(properties).length}`);
              console.log(`   - Property names: ${Object.keys(properties).slice(0, 10).join(', ')}...`);
            }
          } else {
            const error = await detailResponse.text();
            console.log(`   ❌ Failed to get schema: ${error}`);
          }
        }
      }
      
      // Try to list catalog items for the found product type
      if (data.productTypes && data.productTypes.length > 0) {
        const productTypeName = data.productTypes[0].name;
        console.log(`\n📋 Step 3: Trying catalog search with product type "${productTypeName}"...\n`);
        
        // Try search with product type filter
        url = `${credentials.endpoint}/catalog/2022-04-01/items?marketplaceIds=${credentials.marketplaceId}&productTypes=${productTypeName}`;
        console.log(`   URL: ${url}`);
        
        response = await fetch(url, { method: 'GET', headers });
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const searchData = await response.json();
          console.log('   ✅ Search successful!');
          console.log('   Results:', JSON.stringify(searchData, null, 2));
        } else {
          const error = await response.text();
          console.log(`   ❌ Search failed: ${error}`);
        }
      }
      
    } else {
      const error = await response.text();
      console.log('❌ Failed to get product types:', error);
    }

    console.log('\n✅ Test completed!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testSpApiProductTypes().catch(console.error);