import type { AxiosInstance } from 'axios';
import axios from 'axios';

import type { SPApiConfiguration } from '../../value-objects/SpApiConfig';
import type { AccessTokenResponse } from './sp-api-auth.service';
import { SPApiAuthService } from './sp-api-auth.service';

export type InventorySummary = {
  asin: string;
  fnSku: string;
  sellerSku: string;
  condition?: string;
  inventoryDetails?: {
    fulfillableQuantity: number;
    inboundWorkingQuantity?: number;
    inboundShippedQuantity?: number;
    inboundReceivingQuantity?: number;
    reservedQuantity?: {
      totalReservedQuantity: number;
      pendingCustomerOrderQuantity?: number;
      pendingTransshipmentQuantity?: number;
    };
    researchingQuantity?: number;
    unfulfillableQuantity?: {
      totalUnfulfillableQuantity: number;
      customerDamagedQuantity?: number;
      warehouseDamagedQuantity?: number;
    };
  };
};

export type InventoryResponse = {
  inventorySummaries: InventorySummary[];
  nextToken?: string | null;
};

export type AFNInventoryOptions = {
  sellerSkus?: string[];
  details?: boolean;
  nextToken?: string;
};

export type CreateReportRequest = {
  reportType: string;
  marketplaceIds: string[];
  dataStartTime?: string;
  dataEndTime?: string;
  reportOptions?: Record<string, string>;
};

export type ReportDocument = {
  reportDocumentId: string;
  url?: string;
  compressionAlgorithm?: string;
};

export type ReportStatus = {
  reportId: string;
  processingStatus: 'IN_QUEUE' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED' | 'FAILED';
  reportDocumentId?: string;
  processingStartTime?: string;
  processingEndTime?: string;
};

export type AFNInventoryReportData = {
  'seller-sku': string;
  'fulfillment-channel-sku': string;
  'asin': string;
  'condition-type': string;
  'Warehouse-Condition-code': string;
  'Quantity Available': string;
  'dataEndTime'?: string;
};

export class SPApiInventoryService {
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

  async getAFNInventory(
    marketplaceIds: string[],
    options: AFNInventoryOptions = {},
  ): Promise<InventoryResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Add marketplace IDs (required)
      marketplaceIds.forEach(id => queryParams.append('marketplaceIds', id));

      // Add optional parameters
      if (options.sellerSkus) {
        options.sellerSkus.forEach(sku => queryParams.append('sellerSkus', sku));
      }

      if (options.details) {
        queryParams.append('details', 'true');
      }

      if (options.nextToken) {
        queryParams.append('nextToken', options.nextToken);
      }

      const response = await this.client.get(`/fba/inventory/v1/summaries?${queryParams.toString()}`);
      return response.data.payload;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`SP-API Inventory request failed: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
      throw new Error(`SP-API Inventory error: ${error}`);
    }
  }

  async getAllAFNInventory(
    marketplaceIds: string[],
    options: Omit<AFNInventoryOptions, 'nextToken'> = {},
  ): Promise<InventorySummary[]> {
    const allInventory: InventorySummary[] = [];
    let nextToken: string | undefined;

    do {
      const response = await this.getAFNInventory(marketplaceIds, {
        ...options,
        nextToken,
      });

      allInventory.push(...response.inventorySummaries);
      nextToken = response.nextToken || undefined;
    } while (nextToken);

    return allInventory;
  }

  async createAFNInventoryReport(request: CreateReportRequest): Promise<{ reportId: string }> {
    try {
      const response = await this.client.post('/reports/2021-06-30/reports', request);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to create report: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
      throw new Error(`Report creation error: ${error}`);
    }
  }

  async getReportStatus(reportId: string): Promise<ReportStatus> {
    try {
      const response = await this.client.get(`/reports/2021-06-30/reports/${reportId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get report status: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
      throw new Error(`Report status error: ${error}`);
    }
  }

  async waitForReportCompletion(
    reportId: string,
    maxAttempts: number = 60,
    delayMs: number = 5000,
  ): Promise<ReportStatus> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getReportStatus(reportId);

      if (status.processingStatus === 'DONE') {
        return status;
      }

      if (status.processingStatus === 'FAILED' || status.processingStatus === 'CANCELLED') {
        throw new Error(`Report generation failed with status: ${status.processingStatus}`);
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    throw new Error('Report generation timed out');
  }

  async getReportDocument(reportDocumentId: string): Promise<ReportDocument> {
    try {
      const response = await this.client.get(`/reports/2021-06-30/documents/${reportDocumentId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get report document: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
      throw new Error(`Report document error: ${error}`);
    }
  }

  async downloadAndParseReport(reportDocumentId: string): Promise<AFNInventoryReportData[]> {
    // Get the report document URL
    const document = await this.getReportDocument(reportDocumentId);

    if (!document.url) {
      throw new Error('Report document URL not found');
    }

    // Download the report content
    const response = await axios.get(document.url, {
      responseType: 'text',
      // Don't use the authenticated client for downloading from S3
      headers: {
        'User-Agent': 'DLVInsight/1.0.0',
      },
    });

    // Parse CSV data
    const csvData = response.data;
    const lines = csvData.split('\n').filter((line: string) => line.trim());

    if (lines.length < 2) {
      return [];
    }

    // Parse headers
    const headers = lines[0].split(',').map((h: string) => h.trim());

    // Parse data rows
    const data: AFNInventoryReportData[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v: string) => v.trim());
      const row: any = {};

      headers.forEach((header: string, index: number) => {
        row[header] = values[index] || '';
      });

      data.push(row);
    }

    return data;
  }

  async syncAFNInventory(
    marketplaceIds: string[],
    pollingOptions?: { maxAttempts?: number; delayMs?: number },
  ): Promise<AFNInventoryReportData[]> {
    // Create AFN inventory report
    const { reportId } = await this.createAFNInventoryReport({
      reportType: 'GET_AFN_INVENTORY_DATA',
      marketplaceIds,
    });

    // Wait for report completion
    const reportStatus = await this.waitForReportCompletion(
      reportId,
      pollingOptions?.maxAttempts,
      pollingOptions?.delayMs,
    );

    if (!reportStatus.reportDocumentId) {
      throw new Error('Report completed but no document ID found');
    }

    // Download and parse the report
    return this.downloadAndParseReport(reportStatus.reportDocumentId);
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test with a simple inventory query
      const testMarketplaceIds = ['ATVPDKIKX0DER']; // US marketplace

      await this.getAFNInventory(testMarketplaceIds, {
        details: false,
      });

      return true;
    } catch {
      return false;
    }
  }
}
