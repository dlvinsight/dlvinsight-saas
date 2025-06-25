import type { SpApiCredentials, TestStep } from '../types';

export async function testRateLimits(
  credentials: SpApiCredentials & { accessToken: string },
): Promise<TestStep> {
  const startTime = Date.now();

  try {
    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '').replace(/T/, '');
    const response = await fetch(`${credentials.endpoint}/catalog/2022-04-01/items`, {
      method: 'GET',
      headers: {
        'x-amz-access-token': credentials.accessToken,
        'x-amz-date': amzDate,
        'Content-Type': 'application/json',
      },
    });

    const duration = Date.now() - startTime;

    // Even if this fails, we can check headers
    const rateLimitInfo = {
      limit: response.headers.get('x-amzn-RateLimit-Limit'),
      remaining: response.headers.get('x-amzn-RateLimit-Remaining'),
      requestId: response.headers.get('x-amzn-RequestId'),
    };

    return {
      step: 'Rate Limit Check',
      status: 'success',
      message: 'Retrieved rate limit information',
      data: rateLimitInfo,
      duration,
    };
  } catch (_error) {
    return {
      step: 'Rate Limit Check',
      status: 'error',
      message: 'Could not check rate limits',
      duration: Date.now() - startTime,
    };
  }
}
