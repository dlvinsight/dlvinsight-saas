export type SPApiConfig = {
  appId: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  environment: 'sandbox' | 'production';
  region: 'na' | 'eu' | 'fe';
};

export class SPApiConfiguration {
  constructor(private config: SPApiConfig) {
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.appId) {
      throw new Error('SP-API App ID is required');
    }
    if (!this.config.clientId) {
      throw new Error('SP-API Client ID is required');
    }
    if (!this.config.clientSecret) {
      throw new Error('SP-API Client Secret is required');
    }
    if (!this.config.refreshToken) {
      throw new Error('SP-API Refresh Token is required');
    }
    if (!['sandbox', 'production'].includes(this.config.environment)) {
      throw new Error('SP-API Environment must be sandbox or production');
    }
    if (!['na', 'eu', 'fe'].includes(this.config.region)) {
      throw new Error('SP-API Region must be na, eu, or fe');
    }
  }

  get appId(): string {
    return this.config.appId;
  }

  get clientId(): string {
    return this.config.clientId;
  }

  get clientSecret(): string {
    return this.config.clientSecret;
  }

  get refreshToken(): string {
    return this.config.refreshToken;
  }

  get environment(): 'sandbox' | 'production' {
    return this.config.environment;
  }

  get region(): 'na' | 'eu' | 'fe' {
    return this.config.region;
  }

  get baseUrl(): string {
    const baseUrls = {
      sandbox: {
        na: 'https://sandbox.sellingpartnerapi-na.amazon.com',
        eu: 'https://sandbox.sellingpartnerapi-eu.amazon.com',
        fe: 'https://sandbox.sellingpartnerapi-fe.amazon.com',
      },
      production: {
        na: 'https://sellingpartnerapi-na.amazon.com',
        eu: 'https://sellingpartnerapi-eu.amazon.com',
        fe: 'https://sellingpartnerapi-fe.amazon.com',
      },
    };

    return baseUrls[this.environment][this.region];
  }

  get tokenUrl(): string {
    return 'https://api.amazon.com/auth/o2/token';
  }

  toJSON(): Omit<SPApiConfig, 'clientSecret' | 'refreshToken'> {
    return {
      appId: this.config.appId,
      clientId: this.config.clientId,
      environment: this.config.environment,
      region: this.config.region,
    };
  }
}
