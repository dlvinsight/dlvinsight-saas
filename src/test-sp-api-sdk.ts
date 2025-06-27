import 'dotenv/config';
import SellingPartnerAPI from 'amazon-sp-api';

async function testSpApiWithSDK() {
  console.log('🚀 Testing SP-API with official SDK...\n');

  const clientId = process.env.NEXT_PUBLIC_AMAZON_SANDBOX_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_AMAZON_SANDBOX_CLIENT_SECRET;
  const refreshToken = process.env.NEXT_PUBLIC_AMAZON_SANDBOX_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('❌ Missing credentials');
    process.exit(1);
  }

  try {
    // Initialize the SP-API client
    const spApi = new SellingPartnerAPI({
      region: 'na', // North America
      refresh_token: refreshToken,
      credentials: {
        SELLING_PARTNER_APP_CLIENT_ID: clientId,
        SELLING_PARTNER_APP_CLIENT_SECRET: clientSecret,
      },
      options: {
        sandbox: true, // Use sandbox environment
        debug_log: true,
      },
      endpoints_versions: {
        sellers: '2021-12-01',
        catalogItems: '2022-04-01',
      },
    });

    // Test marketplace participations first
    console.log('📋 Testing marketplace participations...\n');
    
    const marketplaceResponse = await spApi.callAPI({
      operation: 'getMarketplaceParticipations',
      endpoint: 'sellers',
    });

    console.log('✅ Marketplace Response:');
    console.log(JSON.stringify(marketplaceResponse, null, 2));

    // Test catalog item retrieval
    console.log('\n📋 Testing catalog API with ASIN B07N4M94X4...\n');
    
    const catalogResponse = await spApi.callAPI({
      operation: 'getCatalogItem',
      endpoint: 'catalogItems',
      path: {
        asin: 'B07N4M94X4',
      },
      query: {
        MarketplaceId: 'ATVPDKIKX0DER',
        includedData: 'attributes,identifiers,images,productTypes,salesRanks,summaries,variations',
      },
    });

    console.log('✅ Catalog API Response:');
    console.log(JSON.stringify(catalogResponse, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testSpApiWithSDK().catch(console.error);