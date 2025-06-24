import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SPApiInventoryService } from './sp-api-inventory.service';

// Mock axios
vi.mock('axios');
vi.mock('./sp-api-auth.service', () => ({
  SPApiAuthService: vi.fn().mockImplementation(() => ({
    getAccessToken: vi.fn().mockResolvedValue({
      access_token: 'mock-token',
      expires_in: 3600,
    }),
  })),
}));

describe('SPApiInventoryService', () => {
  let service: SPApiInventoryService;
  let mockConfig: any;
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockConfig = {
      baseUrl: 'https://sandbox.sellingpartnerapi-na.amazon.com',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      refreshToken: 'test-refresh-token',
      appId: 'test-app-id',
      environment: 'sandbox',
      region: 'na',
      tokenUrl: 'https://api.amazon.com/auth/o2/token',
    };

    // Create mock axios instance
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      interceptors: {
        request: { use: vi.fn(fn => fn) },
        response: { use: vi.fn(() => {}) },
      },
    };

    // Mock axios.create to return our mock instance
    (axios.create as any).mockReturnValue(mockAxiosInstance);
    (axios.isAxiosError as any).mockReturnValue(true);
    (axios.get as any).mockImplementation(mockAxiosInstance.get);

    service = new SPApiInventoryService(mockConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAFNInventory', () => {
    it('should fetch AFN inventory data successfully', async () => {
      const mockInventoryData = {
        inventorySummaries: [
          {
            asin: 'B123456789',
            fnSku: 'X001234567',
            sellerSku: 'MY-SKU-001',
            condition: 'NewItem',
            inventoryDetails: {
              fulfillableQuantity: 100,
              inboundWorkingQuantity: 50,
              inboundShippedQuantity: 25,
              inboundReceivingQuantity: 10,
              reservedQuantity: {
                totalReservedQuantity: 5,
                pendingCustomerOrderQuantity: 3,
                pendingTransshipmentQuantity: 2,
              },
              researchingQuantity: 0,
              unfulfillableQuantity: {
                totalUnfulfillableQuantity: 2,
                customerDamagedQuantity: 1,
                warehouseDamagedQuantity: 1,
              },
            },
          },
        ],
        nextToken: null,
      };

      (mockAxiosInstance.get as any).mockResolvedValueOnce({
        data: { payload: mockInventoryData },
      });

      const result = await service.getAFNInventory(['ATVPDKIKX0DER']);

      expect(result).toEqual(mockInventoryData);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('/fba/inventory/v1/summaries'),
      );
    });

    it('should handle pagination with nextToken', async () => {
      const mockFirstPage = {
        inventorySummaries: [
          { asin: 'B001', sellerSku: 'SKU-001', fnSku: 'FN001' },
        ],
        nextToken: 'token-123',
      };

      const mockSecondPage = {
        inventorySummaries: [
          { asin: 'B002', sellerSku: 'SKU-002', fnSku: 'FN002' },
        ],
        nextToken: null,
      };

      (mockAxiosInstance.get as any)
        .mockResolvedValueOnce({ data: { payload: mockFirstPage } })
        .mockResolvedValueOnce({ data: { payload: mockSecondPage } });

      const result = await service.getAllAFNInventory(['ATVPDKIKX0DER']);

      expect(result).toHaveLength(2);
      expect(result[0]?.asin).toBe('B001');
      expect(result[1]?.asin).toBe('B002');
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });

    it('should handle errors gracefully', async () => {
      const errorMessage = 'API rate limit exceeded';
      (mockAxiosInstance.get as any).mockRejectedValueOnce({
        response: {
          data: {
            errors: [{ message: errorMessage }],
          },
        },
      });

      await expect(service.getAFNInventory(['ATVPDKIKX0DER'])).rejects.toThrow(
        `SP-API Inventory request failed: ${errorMessage}`,
      );
    });

    it('should support filtering by SKUs', async () => {
      const mockData = {
        inventorySummaries: [{ asin: 'B001', sellerSku: 'SKU-001' }],
        nextToken: null,
      };

      (mockAxiosInstance.get as any).mockResolvedValueOnce({
        data: { payload: mockData },
      });

      await service.getAFNInventory(['ATVPDKIKX0DER'], {
        sellerSkus: ['SKU-001', 'SKU-002'],
      });

      const callUrl = (mockAxiosInstance.get as any).mock.calls[0][0];

      expect(callUrl).toContain('sellerSkus=SKU-001');
      expect(callUrl).toContain('sellerSkus=SKU-002');
    });

    it('should support detailed inventory information', async () => {
      const mockData = {
        inventorySummaries: [
          {
            asin: 'B001',
            sellerSku: 'SKU-001',
            inventoryDetails: {
              fulfillableQuantity: 50,
              reservedQuantity: {
                totalReservedQuantity: 5,
              },
            },
          },
        ],
        nextToken: null,
      };

      (mockAxiosInstance.get as any).mockResolvedValueOnce({
        data: { payload: mockData },
      });

      await service.getAFNInventory(['ATVPDKIKX0DER'], {
        details: true,
      });

      const callUrl = (mockAxiosInstance.get as any).mock.calls[0][0];

      expect(callUrl).toContain('details=true');
    });
  });

  describe('createInventoryReport', () => {
    it('should create an AFN inventory report successfully', async () => {
      const mockReportResponse = {
        reportId: 'report-123456',
      };

      (mockAxiosInstance.post as any).mockResolvedValueOnce({
        data: mockReportResponse,
      });

      const result = await service.createAFNInventoryReport({
        reportType: 'GET_AFN_INVENTORY_DATA',
        marketplaceIds: ['ATVPDKIKX0DER'],
      });

      expect(result.reportId).toBe('report-123456');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/reports/2021-06-30/reports',
        expect.objectContaining({
          reportType: 'GET_AFN_INVENTORY_DATA',
          marketplaceIds: ['ATVPDKIKX0DER'],
        }),
      );
    });

    it('should poll report status until completion', async () => {
      const mockReportId = 'report-123';

      // Mock status checks
      (mockAxiosInstance.get as any)
        .mockResolvedValueOnce({
          data: {
            reportId: mockReportId,
            processingStatus: 'IN_QUEUE',
          },
        })
        .mockResolvedValueOnce({
          data: {
            reportId: mockReportId,
            processingStatus: 'IN_PROGRESS',
          },
        })
        .mockResolvedValueOnce({
          data: {
            reportId: mockReportId,
            processingStatus: 'DONE',
            reportDocumentId: 'doc-123',
          },
        });

      // Use a very short delay for testing
      const result = await service.waitForReportCompletion(mockReportId, 10, 1);

      expect(result.reportDocumentId).toBe('doc-123');
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3);
    });

    it('should handle report generation failure', async () => {
      (mockAxiosInstance.get as any).mockResolvedValueOnce({
        data: {
          reportId: 'report-failed',
          processingStatus: 'FAILED',
          processingEndTime: new Date(),
        },
      });

      await expect(
        service.waitForReportCompletion('report-failed', 10, 1),
      ).rejects.toThrow('Report generation failed with status: FAILED');
    });
  });

  describe('downloadReportDocument', () => {
    it('should download and parse CSV report data', async () => {
      const mockDocumentUrl = 'https://report-url.amazon.com/doc-123';
      const mockCsvData = `seller-sku,fulfillment-channel-sku,asin,condition-type,Warehouse-Condition-code,Quantity Available
SKU-001,FN-001,B001,New,SELLABLE,100
SKU-002,FN-002,B002,New,SELLABLE,50`;

      // Mock getting document URL
      (mockAxiosInstance.get as any).mockResolvedValueOnce({
        data: { url: mockDocumentUrl },
      });

      // Mock downloading CSV data (using axios.get directly for external URL)
      (axios.get as any).mockResolvedValueOnce({
        data: mockCsvData,
      });

      const result = await service.downloadAndParseReport('doc-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        'seller-sku': 'SKU-001',
        'fulfillment-channel-sku': 'FN-001',
        'asin': 'B001',
        'condition-type': 'New',
        'Warehouse-Condition-code': 'SELLABLE',
        'Quantity Available': '100',
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete AFN inventory sync flow', async () => {
      // Mock report creation
      (mockAxiosInstance.post as any).mockResolvedValueOnce({
        data: { reportId: 'report-123' },
      });

      // Mock status check
      (mockAxiosInstance.get as any).mockResolvedValueOnce({
        data: {
          processingStatus: 'DONE',
          reportDocumentId: 'doc-123',
        },
      });

      // Mock document URL
      (mockAxiosInstance.get as any).mockResolvedValueOnce({
        data: { url: 'https://report-url.com' },
      });

      // Mock CSV data
      const csvData = `seller-sku,fulfillment-channel-sku,asin,condition-type,Warehouse-Condition-code,Quantity Available
SKU-001,FN-001,B001,New,SELLABLE,100`;

      (axios.get as any).mockResolvedValueOnce({
        data: csvData,
      });

      const inventory = await service.syncAFNInventory(['ATVPDKIKX0DER']);

      expect(inventory).toHaveLength(1);
      expect(inventory[0]?.['seller-sku']).toBe('SKU-001');
      expect(inventory[0]?.['Quantity Available']).toBe('100');
    });
  });
});
