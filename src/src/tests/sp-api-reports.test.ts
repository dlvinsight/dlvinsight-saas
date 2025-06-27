import path from 'node:path';

import SellingPartnerAPI from 'amazon-sp-api';
import dotenv from 'dotenv';
import { beforeAll, describe, expect, it } from 'vitest';

// Load .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

describe('SP-API Reports Test', () => {
  let spApi: any;

  beforeAll(() => {
    // Load SP-API credentials from environment variables
    const clientId = process.env.NEXT_PUBLIC_AMAZON_SANDBOX_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_AMAZON_SANDBOX_CLIENT_SECRET;
    const refreshToken = process.env.NEXT_PUBLIC_AMAZON_SANDBOX_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Missing SP-API credentials in environment variables');
    }

    // Initialize SP-API client
    spApi = new SellingPartnerAPI({
      region: 'na', // North America
      refresh_token: refreshToken,
      credentials: {
        SELLING_PARTNER_APP_CLIENT_ID: clientId,
        SELLING_PARTNER_APP_CLIENT_SECRET: clientSecret,
      },
      endpoints_versions: {
        reports: '2021-06-30',
      },
      options: {
        auto_request_tokens: true,
        use_sandbox: true,
      },
    });
  });

  it('should create a GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL report', async () => {
    try {
      // Use downloadReport wrapper method instead
      const response = await spApi.downloadReport({
        body: {
          reportType: 'GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL',
          marketplaceIds: ['ATVPDKIKX0DER'], // US marketplace
          dataStartTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          dataEndTime: new Date().toISOString(),
        },
        version: '2021-06-30',
        interval: 5000,
        download: {
          json: true
        }
      });

      // Verify response
      expect(response).toBeTruthy();
      
      return response;
    } catch (error: any) {
      // Check if it's a sandbox limitation
      if (error.code === 'INVALID_SANDBOX_PARAMETERS' || error.message?.includes('sandbox')) {
        console.log('Note: This report type may not be supported in sandbox environment');
      }
      throw error;
    }
  }, { timeout: 60000 });

  it('should test basic SP-API connectivity', async () => {
    try {
      // Test a simpler operation first - get marketplace participations
      const response = await spApi.callAPI({
        operation: 'getMarketplaceParticipations',
        endpoint: 'sellers'
      });

      expect(response).toBeTruthy();
      
      return response;
    } catch (error: any) {
      console.log('Error details:', error.message);
      throw error;
    }
  }, { timeout: 30000 });
});
