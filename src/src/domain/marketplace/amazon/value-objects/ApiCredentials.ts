export class ApiCredentials {
  private constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly refreshToken: string,
    private readonly region: 'NA' | 'EU' | 'FE', // North America, Europe, Far East
  ) {
    this.validate();
  }

  static create(params: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    region: 'NA' | 'EU' | 'FE';
  }): ApiCredentials {
    return new ApiCredentials(
      params.clientId,
      params.clientSecret,
      params.refreshToken,
      params.region,
    );
  }

  private validate(): void {
    if (!this.clientId || this.clientId.trim().length === 0) {
      throw new Error('Client ID is required');
    }

    if (!this.clientSecret || this.clientSecret.trim().length === 0) {
      throw new Error('Client Secret is required');
    }

    if (!this.refreshToken || this.refreshToken.trim().length === 0) {
      throw new Error('Refresh Token is required');
    }

    // Basic format validation for AWS LWA client ID
    if (!this.clientId.startsWith('amzn1.application-oa2-client.')) {
      throw new Error('Invalid Client ID format');
    }
  }

  getClientId(): string {
    return this.clientId;
  }

  getRegion(): 'NA' | 'EU' | 'FE' {
    return this.region;
  }

  // Don't expose secret and refresh token directly
  getSecuredCredentials(): {
    clientId: string;
    region: 'NA' | 'EU' | 'FE';
    hasClientSecret: boolean;
    hasRefreshToken: boolean;
  } {
    return {
      clientId: this.clientId,
      region: this.region,
      hasClientSecret: !!this.clientSecret,
      hasRefreshToken: !!this.refreshToken,
    };
  }

  // For secure internal use only
  getFullCredentials(): {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    region: 'NA' | 'EU' | 'FE';
  } {
    return {
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      refreshToken: this.refreshToken,
      region: this.region,
    };
  }

  equals(other: ApiCredentials): boolean {
    return (
      this.clientId === other.clientId
      && this.clientSecret === other.clientSecret
      && this.refreshToken === other.refreshToken
      && this.region === other.region
    );
  }
}
