import 'dotenv/config';

import type { SpApiCredentials } from './src/app/[locale]/(auth)/dashboard/test-api/types';

async function testSpApiSpecificAsin() {
  console.log('🚀 Testing SP-API with specific ASIN B07N4M94X4...\n');

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

    // Step 2: Get catalog item with exact sandbox parameters
    console.log('📋 Step 2: Fetching catalog item B07N4M94X4...\n');

    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '').replace(/T/, '');

    // Use the exact includedData from sandbox specification
    const includedData = [
      'classifications',
      'dimensions',
      'identifiers',
      'images',
      'productTypes',
      'relationships',
      'salesRanks',
      'summaries',
      'vendorDetails',
    ];

    // Build URL with all parameters
    const searchParams = new URLSearchParams({
      marketplaceIds: credentials.marketplaceId,
    });

    // Add each includedData parameter separately (as per API spec)
    includedData.forEach((data) => {
      searchParams.append('includedData', data);
    });

    const asin = 'B07N4M94X4';
    const catalogUrl = `${credentials.endpoint}/catalog/2022-04-01/items/${asin}?${searchParams.toString()}`;

    console.log('🔍 Request Details:');
    console.log(`   URL: ${catalogUrl}`);
    console.log(`   ASIN: ${asin}`);
    console.log(`   Marketplace: ${credentials.marketplaceId} (US)`);
    console.log(`   Included Data: ${includedData.join(', ')}`);
    console.log('');

    const response = await fetch(catalogUrl, {
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

      console.log('\n✅ Product Details Retrieved Successfully!\n');
      console.log(`📦 ASIN: ${data.asin}`);

      // Extract and display summaries
      if (data.summaries) {
        const summary = data.summaries.find((s: any) => s.marketplaceId === credentials.marketplaceId);
        if (summary) {
          console.log(`\n📝 Product Summary:`);
          console.log(`   Title: ${summary.itemName || 'N/A'}`);
          console.log(`   Brand: ${summary.brand || 'N/A'}`);
          console.log(`   Manufacturer: ${summary.manufacturer || 'N/A'}`);
        }
      }

      // Extract and display classifications
      if (data.classifications) {
        const classification = data.classifications.find((c: any) => c.marketplaceId === credentials.marketplaceId);
        if (classification?.classifications?.[0]) {
          console.log(`\n🏷️ Category:`);
          let cat = classification.classifications[0];
          const categories = [];
          while (cat) {
            categories.unshift(cat.displayName);
            cat = cat.parent;
          }
          console.log(`   ${categories.join(' > ')}`);
        }
      }

      // Extract and display dimensions
      if (data.dimensions) {
        const dimensions = data.dimensions.find((d: any) => d.marketplaceId === credentials.marketplaceId);
        if (dimensions?.item) {
          console.log(`\n📏 Dimensions:`);
          const dim = dimensions.item;
          if (dim.width && dim.height && dim.length) {
            console.log(`   Size: ${dim.width.value} x ${dim.height.value} x ${dim.length.value} ${dim.width.unit}`);
          }
          if (dim.weight) {
            console.log(`   Weight: ${dim.weight.value} ${dim.weight.unit}`);
          }
        }
      }

      // Extract and display images
      if (data.images) {
        const images = data.images.find((i: any) => i.marketplaceId === credentials.marketplaceId);
        if (images?.images?.length > 0) {
          console.log(`\n🖼️ Images: ${images.images.length} found`);
          console.log(`   Main Image: ${images.images[0].link}`);
        }
      }

      // Extract and display sales ranks
      if (data.salesRanks) {
        const salesRanks = data.salesRanks.find((s: any) => s.marketplaceId === credentials.marketplaceId);
        if (salesRanks?.classificationRanks?.length > 0) {
          console.log(`\n📊 Sales Rankings:`);
          salesRanks.classificationRanks.forEach((rank: any) => {
            console.log(`   #${rank.rank} in ${rank.title}`);
          });
        }
      }

      // Extract and display identifiers
      if (data.identifiers) {
        const identifiers = data.identifiers.find((i: any) => i.marketplaceId === credentials.marketplaceId);
        if (identifiers?.identifiers?.length > 0) {
          console.log(`\n🔢 Identifiers:`);
          identifiers.identifiers.forEach((id: any) => {
            console.log(`   ${id.identifierType}: ${id.identifier}`);
          });
        }
      }

      console.log('\n📄 Full Response:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('\n❌ Request failed');
      console.log('   Error Response:', responseText);

      // Try to parse error details
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.errors) {
          console.log('\n📋 Error Details:');
          errorData.errors.forEach((err: any) => {
            console.log(`   - ${err.code}: ${err.message}`);
            if (err.details) {
              console.log(`     Details: ${err.details}`);
            }
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
testSpApiSpecificAsin().catch(console.error);
