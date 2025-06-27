import SellingPartnerAPI from 'amazon-sp-api';

export interface SpApiConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  region?: 'na' | 'eu' | 'fe';
  sandbox?: boolean;
}

export class SpApiClient {
  private client: SellingPartnerAPI;

  constructor(config: SpApiConfig) {
    this.client = new SellingPartnerAPI({
      region: config.region || 'na',
      refresh_token: config.refreshToken,
      credentials: {
        SELLING_PARTNER_APP_CLIENT_ID: config.clientId,
        SELLING_PARTNER_APP_CLIENT_SECRET: config.clientSecret,
      },
      options: {
        sandbox: config.sandbox || false,
        debug_log: false,
      },
    });
  }

  async getCatalogItem(asin: string, marketplaceId: string) {
    try {
      const response = await this.client.callAPI({
        operation: 'getCatalogItem',
        endpoint: 'catalog',
        path: { asin },
        query: {
          MarketplaceId: marketplaceId,
          includedData: ['attributes', 'summaries', 'variations'],
        },
      });
      return { success: true, data: response };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch catalog item',
        details: error.response?.data,
      };
    }
  }

  async getMarketplaceParticipations() {
    try {
      const response = await this.client.callAPI({
        operation: 'getMarketplaceParticipations',
        endpoint: 'sellers',
      });
      return { success: true, data: response };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to fetch marketplace participations',
        details: error.response?.data,
      };
    }
  }

  async searchCatalogItems(keywords: string, marketplaceId: string) {
    try {
      const response = await this.client.callAPI({
        operation: 'searchCatalogItems',
        endpoint: 'catalog',
        query: {
          keywords,
          marketplaceIds: [marketplaceId],
          includedData: ['attributes', 'summaries'],
        },
      });
      return { success: true, data: response };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to search catalog items',
        details: error.response?.data,
      };
    }
  }
}