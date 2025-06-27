import { describe, it, expect, beforeAll } from 'vitest';
const SellingPartnerAPI = require('amazon-sp-api');
import dotenv from 'dotenv';
import path from 'path';

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
        reports: '2021-06-30'
      },
      options: {
        auto_request_tokens: true,
        use_sandbox: true
      }
    });
  });

  it('should create a GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL report', async () => {
    try {
      // Create report request
      const response = await spApi.callAPI({
        operation: 'createReport',
        endpoint: 'reports',
        body: {
          reportType: 'GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL',
          marketplaceIds: ['ATVPDKIKX0DER'], // US marketplace
          dataStartTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          dataEndTime: new Date().toISOString()
        }
      });

      // Verify response
      expect(response).toBeTruthy();
      expect(response.reportId).toBeTruthy();
      expect(typeof response.reportId).toBe('string');

      return response;
    } catch (error) {
      throw error;
    }
  }, { timeout: 30000 });

  it('should handle report creation with specific date range', async () => {
    try {
      // Create report for last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const response = await spApi.callAPI({
        operation: 'createReport',
        endpoint: 'reports',
        body: {
          reportType: 'GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL',
          marketplaceIds: ['ATVPDKIKX0DER'], // US marketplace
          dataStartTime: startDate.toISOString(),
          dataEndTime: endDate.toISOString()
        }
      });

      expect(response).toBeTruthy();
      expect(response.reportId).toBeTruthy();

      return response;
    } catch (error) {
      throw error;
    }
  }, { timeout: 30000 });
});