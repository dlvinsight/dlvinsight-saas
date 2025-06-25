import { exchangeRefreshTokenForAccess } from '@/libs/amazon-sp-api';

import type { SpApiCredentials, TestStep } from '../types';

export async function testTokenExchange(credentials: SpApiCredentials): Promise<TestStep> {
  const startTime = Date.now();

  try {
    const tokenResult = await exchangeRefreshTokenForAccess(
      credentials.refreshToken,
      credentials.clientId,
      credentials.clientSecret,
    );

    const duration = Date.now() - startTime;

    return {
      step: 'Token Exchange',
      status: 'success',
      message: 'Successfully obtained access token',
      data: {
        expiresIn: tokenResult.expiresIn,
        tokenType: 'Bearer',
      },
      duration,
    };
  } catch (error) {
    return {
      step: 'Token Exchange',
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to exchange token',
      duration: Date.now() - startTime,
    };
  }
}
