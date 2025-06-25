import type { SpApiCredentials, TestStep } from '../types';

export async function testMarketplaceParticipations(
  credentials: SpApiCredentials & { accessToken: string },
): Promise<TestStep> {
  const startTime = Date.now();

  try {
    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '').replace(/T/, '');
    const response = await fetch(`${credentials.endpoint}/sellers/v1/marketplaceParticipations`, {
      method: 'GET',
      headers: {
        'x-amz-access-token': credentials.accessToken,
        'x-amz-date': amzDate,
        'Content-Type': 'application/json',
      },
    });

    const duration = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      const marketplaces = data.payload || [];
      const hasTargetMarketplace = marketplaces.some(
        (mp: any) => mp.marketplace.id === credentials.marketplaceId,
      );

      return {
        step: 'Marketplace Verification',
        status: 'success',
        message: `Found ${marketplaces.length} marketplace(s)`,
        data: {
          marketplaces: marketplaces.map((mp: any) => ({
            id: mp.marketplace.id,
            name: mp.marketplace.name,
            countryCode: mp.marketplace.countryCode,
          })),
          targetMarketplaceFound: hasTargetMarketplace,
        },
        duration,
      };
    } else {
      const errorText = await response.text();
      return {
        step: 'Marketplace Verification',
        status: 'error',
        message: `API returned ${response.status}`,
        data: { error: errorText },
        duration,
      };
    }
  } catch (error) {
    return {
      step: 'Marketplace Verification',
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to verify marketplace',
      duration: Date.now() - startTime,
    };
  }
}
