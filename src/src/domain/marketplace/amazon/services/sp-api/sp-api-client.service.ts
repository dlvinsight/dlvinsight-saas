import type { AxiosInstance } from 'axios';
import axios from 'axios';

import type { SPApiConfiguration } from '../../value-objects/SpApiConfig';
import type { AccessTokenResponse } from './sp-api-auth.service';
import { SPApiAuthService } from './sp-api-auth.service';

export type OrdersApiParams = {
  marketplace_ids: string[];
  created_after?: string;
  created_before?: string;
  last_updated_after?: string;
  last_updated_before?: string;
  order_statuses?: string[];
  fulfillment_channels?: string[];
  payment_methods?: string[];
  buyer_email?: string;
  seller_order_id?: string;
  max_results_per_page?: number;
  easy_ship_shipment_statuses?: string[];
  next_token?: string;
};

export type Order = {
  AmazonOrderId: string;
  PurchaseDate: string;
  LastUpdateDate: string;
  OrderStatus: string;
  FulfillmentChannel: string;
  SalesChannel: string;
  OrderChannel?: string;
  ShipServiceLevel: string;
  OrderTotal?: {
    CurrencyCode: string;
    Amount: string;
  };
  NumberOfItemsShipped?: number;
  NumberOfItemsUnshipped?: number;
  PaymentExecutionDetail?: any[];
  PaymentMethod?: string;
  PaymentMethodDetails?: string[];
  MarketplaceId: string;
  ShipmentServiceLevelCategory?: string;
  OrderType?: string;
  EarliestShipDate?: string;
  LatestShipDate?: string;
  EarliestDeliveryDate?: string;
  LatestDeliveryDate?: string;
  IsBusinessOrder?: boolean;
  IsPrime?: boolean;
  IsPremiumOrder?: boolean;
  IsGlobalExpressEnabled?: boolean;
  ReplacedOrderId?: string;
  IsReplacementOrder?: boolean;
  PromiseResponseDueDate?: string;
  IsEstimatedShipDateSet?: boolean;
};

export type OrdersResponse = {
  Orders: Order[];
  NextToken?: string;
  LastUpdatedBefore?: string;
  CreatedBefore?: string;
};

export class SPApiClientService {
  private client: AxiosInstance;
  private authService: SPApiAuthService;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: SPApiConfiguration) {
    this.authService = new SPApiAuthService(config);
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DLVInsight/1.0.0 (Language=TypeScript; Platform=Node.js)',
      },
    });

    // Add request interceptor to handle authentication
    this.client.interceptors.request.use(async (config) => {
      await this.ensureValidToken();
      if (this.accessToken) {
        config.headers['x-amz-access-token'] = this.accessToken;
      }
      return config;
    });

    // Add response interceptor to handle errors
    this.client.interceptors.response.use(
      response => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token might be expired, clear it and retry once
          this.accessToken = null;
          this.tokenExpiry = null;

          const originalRequest = error.config;
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            await this.ensureValidToken();
            if (this.accessToken) {
              originalRequest.headers['x-amz-access-token'] = this.accessToken;
            }
            return this.client(originalRequest);
          }
        }
        return Promise.reject(error);
      },
    );
  }

  private async ensureValidToken(): Promise<void> {
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

    if (!this.accessToken || !this.tokenExpiry || now.getTime() >= (this.tokenExpiry.getTime() - bufferTime)) {
      try {
        const tokenResponse: AccessTokenResponse = await this.authService.getAccessToken();
        this.accessToken = tokenResponse.access_token;
        this.tokenExpiry = new Date(now.getTime() + (tokenResponse.expires_in * 1000));
      } catch (error) {
        throw new Error(`Failed to obtain access token: ${error}`);
      }
    }
  }

  async getOrders(params: OrdersApiParams): Promise<OrdersResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Add marketplace IDs (required)
      params.marketplace_ids.forEach(id => queryParams.append('MarketplaceIds', id));

      // Add optional parameters
      if (params.created_after) {
        queryParams.append('CreatedAfter', params.created_after);
      }
      if (params.created_before) {
        queryParams.append('CreatedBefore', params.created_before);
      }
      if (params.last_updated_after) {
        queryParams.append('LastUpdatedAfter', params.last_updated_after);
      }
      if (params.last_updated_before) {
        queryParams.append('LastUpdatedBefore', params.last_updated_before);
      }
      if (params.order_statuses) {
        params.order_statuses.forEach(status => queryParams.append('OrderStatuses', status));
      }
      if (params.fulfillment_channels) {
        params.fulfillment_channels.forEach(channel => queryParams.append('FulfillmentChannels', channel));
      }
      if (params.max_results_per_page) {
        queryParams.append('MaxResultsPerPage', params.max_results_per_page.toString());
      }
      if (params.next_token) {
        queryParams.append('NextToken', params.next_token);
      }

      const response = await this.client.get(`/orders/v0/orders?${queryParams.toString()}`);
      return response.data.payload;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`SP-API Orders request failed: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
      throw new Error(`SP-API Orders error: ${error}`);
    }
  }

  async getOrdersForLastMonth(marketplaceIds: string[]): Promise<Order[]> {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const params: OrdersApiParams = {
      marketplace_ids: marketplaceIds,
      created_after: lastMonth.toISOString(),
      created_before: endOfLastMonth.toISOString(),
      order_statuses: ['Shipped', 'Unshipped', 'PartiallyShipped', 'Canceled', 'Unfulfillable'],
      max_results_per_page: 100,
    };

    const allOrders: Order[] = [];
    let nextToken: string | undefined;

    do {
      if (nextToken) {
        params.next_token = nextToken;
      }

      const response = await this.getOrders(params);
      allOrders.push(...response.Orders);
      nextToken = response.NextToken;
    } while (nextToken);

    return allOrders;
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test with US marketplace ID using sandbox test case
      const testMarketplaceIds = ['ATVPDKIKX0DER']; // US marketplace

      // Use the special sandbox test case value
      const params: OrdersApiParams = {
        marketplace_ids: testMarketplaceIds,
        created_after: 'TEST_CASE_200', // Special sandbox test case
        max_results_per_page: 1,
      };

      await this.getOrders(params);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getSandboxTestOrders(): Promise<Order[]> {
    try {
      const testMarketplaceIds = ['ATVPDKIKX0DER']; // US marketplace

      // Use the special sandbox test case that returns mock order data
      const params: OrdersApiParams = {
        marketplace_ids: testMarketplaceIds,
        created_after: 'TEST_CASE_200',
        max_results_per_page: 100,
      };

      const response = await this.getOrders(params);
      return response.Orders;
    } catch (error) {
      throw error;
    }
  }
}
