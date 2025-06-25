import type { SpApiCredentials, TestStep } from '../types';

const TEST_ASINS = {
  PRODUCTION: 'B07DFPLXY3',
  SANDBOX: 'B07DFPLXY3',
};

export async function testCatalogApi(
  credentials: SpApiCredentials & { accessToken: string },
): Promise<TestStep> {
  const startTime = Date.now();

  try {
    const testAsin = TEST_ASINS[credentials.awsEnvironment];
    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '').replace(/T/, '');

    const response = await fetch(
      `${credentials.endpoint}/catalog/2022-04-01/items/${testAsin}?marketplaceIds=${credentials.marketplaceId}&includedData=summaries`,
      {
        method: 'GET',
        headers: {
          'x-amz-access-token': credentials.accessToken,
          'x-amz-date': amzDate,
          'Content-Type': 'application/json',
        },
      },
    );

    const duration = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      const summary = data.summaries?.find((s: any) => s.marketplaceId === credentials.marketplaceId);

      return {
        step: 'Catalog API Test',
        status: 'success',
        message: 'Successfully fetched catalog item',
        data: {
          asin: data.asin,
          itemName: summary?.itemName || 'N/A',
          brand: summary?.brand || 'N/A',
        },
        duration,
      };
    } else {
      const errorText = await response.text();
      return {
        step: 'Catalog API Test',
        status: 'error',
        message: `API returned ${response.status}`,
        data: { error: errorText },
        duration,
      };
    }
  } catch (error) {
    return {
      step: 'Catalog API Test',
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to test catalog API',
      duration: Date.now() - startTime,
    };
  }
}
