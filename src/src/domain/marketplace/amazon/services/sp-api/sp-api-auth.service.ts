import axios from 'axios';

import type { SPApiConfiguration } from '../../value-objects/SpApiConfig';

export type AccessTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
};

export class SPApiAuthService {
  constructor(private config: SPApiConfiguration) {}

  async getAccessToken(): Promise<AccessTokenResponse> {
    try {
      const response = await axios.post(
        this.config.tokenUrl,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.config.refreshToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`SP-API authentication failed: ${error.response?.data?.error_description || error.message}`);
      }
      throw new Error(`SP-API authentication error: ${error}`);
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      return false;
    }
  }
}
