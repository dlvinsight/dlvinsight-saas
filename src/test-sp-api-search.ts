import 'dotenv/config';
import type { SpApiCredentials } from './src/app/[locale]/(auth)/dashboard/test-api/types';

async function testSpApiCatalogSearch() {
  console.log('🚀 Testing SP-API Catalog Search with Samsung TV keywords...\n');
  
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

    // Step 2: Search catalog with keywords
    console.log('📋 Step 2: Searching catalog for "samsung tv"...\n');
    
    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '').replace(/T/, '');
    
    // Build the search URL with all included data parameters
    const includedData = [
      'classifications',
      'dimensions', 
      'identifiers',
      'images',
      'productTypes',
      'relationships',
      'salesRanks',
      'summaries',
      'vendorDetails'
    ];
    
    const searchParams = new URLSearchParams({
      keywords: 'samsung tv',
      marketplaceIds: credentials.marketplaceId,
    });
    
    // Add each includedData parameter separately
    includedData.forEach(data => {
      searchParams.append('includedData', data);
    });
    
    const searchUrl = `${credentials.endpoint}/catalog/2022-04-01/items?${searchParams.toString()}`;
    
    console.log('🔍 Search URL:', searchUrl);
    console.log('\n📦 Request Parameters:');
    console.log('   Keywords: samsung tv');
    console.log('   Marketplace: ATVPDKIKX0DER (US)');
    console.log('   Included Data:', includedData.join(', '));
    console.log('');

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'x-amz-access-token': tokenResult.accessToken,
        'x-amz-date': amzDate,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      
      console.log('\n✅ Search Results:');
      console.log(`   Total items found: ${data.numberOfResults || 0}`);
      
      if (data.items && data.items.length > 0) {
        console.log('\n📺 Products Found:');
        data.items.forEach((item: any, index: number) => {
          console.log(`\n   ${index + 1}. ASIN: ${item.asin}`);
          
          // Extract title from summaries
          const summary = item.summaries?.find((s: any) => s.marketplaceId === credentials.marketplaceId);
          if (summary) {
            console.log(`      Title: ${summary.itemName || 'N/A'}`);
            console.log(`      Brand: ${summary.brand || 'N/A'}`);
          }
          
          // Show classifications
          const classification = item.classifications?.find((c: any) => c.marketplaceId === credentials.marketplaceId);
          if (classification?.classifications?.[0]) {
            console.log(`      Category: ${classification.classifications[0].displayName}`);
          }
          
          // Show dimensions
          const dimensions = item.dimensions?.find((d: any) => d.marketplaceId === credentials.marketplaceId);
          if (dimensions?.item) {
            console.log(`      Dimensions: ${dimensions.item.width?.value || 'N/A'}" x ${dimensions.item.height?.value || 'N/A'}" x ${dimensions.item.length?.value || 'N/A'}" ${dimensions.item.width?.unit || ''}`);
          }
          
          // Show main image
          const images = item.images?.find((i: any) => i.marketplaceId === credentials.marketplaceId);
          if (images?.images?.[0]) {
            console.log(`      Main Image: ${images.images[0].link}`);
          }
          
          // Show sales rank
          const salesRanks = item.salesRanks?.find((s: any) => s.marketplaceId === credentials.marketplaceId);
          if (salesRanks?.classificationRanks?.[0]) {
            console.log(`      Sales Rank: #${salesRanks.classificationRanks[0].rank} in ${salesRanks.classificationRanks[0].title}`);
          }
        });
      }
      
      console.log('\n📄 Full Response (first 2000 chars):');
      console.log(JSON.stringify(data, null, 2).substring(0, 2000) + '...');
      
    } else {
      console.log('\n❌ Search failed');
      console.log('   Error Response:', responseText);
      
      // Try to parse error details
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.errors) {
          console.log('\n📋 Error Details:');
          errorData.errors.forEach((err: any) => {
            console.log(`   - ${err.code}: ${err.message}`);
            if (err.details) console.log(`     Details: ${err.details}`);
          });
        }
      } catch (e) {
        // Response wasn't JSON
      }
    }
    
    console.log('\n✅ Test completed!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testSpApiCatalogSearch().catch(console.error);