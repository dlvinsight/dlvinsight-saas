type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

type MarketplaceParticipation = {
  marketplace: {
    id: string;
    name: string;
    countryCode: string;
    defaultCurrencyCode: string;
    defaultLanguageCode: string;
    domainName: string;
  };
  participation: {
    isParticipating: boolean;
    hasSuspendedListings: boolean;
  };
}

/**
 * Exchange a refresh token for an access token using Amazon's OAuth2 endpoint
 */
export async function exchangeRefreshTokenForAccess(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<{ accessToken: string; expiresIn: number }> {
  try {
    const response = await fetch('https://api.amazon.com/auth/o2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', response.status, errorText);

      if (response.status === 400) {
        throw new Error('Invalid credentials or refresh token');
      } else if (response.status === 401) {
        throw new Error('Expired or invalid refresh token');
      } else {
        throw new Error(`Token exchange failed: ${response.status}`);
      }
    }

    const data: TokenResponse = await response.json();

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error while exchanging token');
  }
}

/**
 * Test SP-API connection by calling the marketplace participations endpoint
 */
export async function testSpApiConnection(
  accessToken: string,
  endpoint: string,
): Promise<{ success: boolean; marketplaces?: MarketplaceParticipation[]; error?: string }> {
  try {
    // Generate ISO date for x-amz-date header
    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '').replace(/T/, '');

    const response = await fetch(`${endpoint}/sellers/v1/marketplaceParticipations`, {
      method: 'GET',
      headers: {
        'x-amz-access-token': accessToken,
        'x-amz-date': amzDate,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SP-API test failed:', response.status, errorText);

      if (response.status === 403) {
        return {
          success: false,
          error: 'Access denied - check if the app has proper permissions',
        };
      } else if (response.status === 401) {
        return {
          success: false,
          error: 'Invalid or expired access token',
        };
      } else {
        return {
          success: false,
          error: `API request failed: ${response.status}`,
        };
      }
    }

    const data: { payload: MarketplaceParticipation[] } = await response.json();

    return {
      success: true,
      marketplaces: data.payload,
    };
  } catch (error) {
    console.error('SP-API connection test error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error while testing connection',
    };
  }
}
