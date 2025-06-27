declare module 'amazon-sp-api' {
  export type SPApiConfig = {
    region: 'na' | 'eu' | 'fe';
    refresh_token: string;
    credentials: {
      SELLING_PARTNER_APP_CLIENT_ID: string;
      SELLING_PARTNER_APP_CLIENT_SECRET: string;
    };
    endpoints_versions?: Record<string, string>;
    options?: {
      auto_request_tokens?: boolean;
      use_sandbox?: boolean;
      only_grantless_operations?: boolean;
    };
  };

  export type CallAPIParams = {
    operation: string;
    endpoint: string;
    body?: any;
    query?: any;
    path?: any;
    headers?: any;
    options?: {
      version?: string;
      restore_rate?: number;
      raw_result?: boolean;
    };
  };

  export type ReportRequest = {
    reportType: string;
    marketplaceIds: string[];
    dataStartTime?: string;
    dataEndTime?: string;
    reportOptions?: Record<string, any>;
  };

  export type ReportResponse = {
    reportId: string;
  };

  export default class SellingPartnerAPI {
    constructor(config: SPApiConfig);

    endpoints: {
      [key: string]: {
        __versions: string[];
        __operations: string[];
      };
    };

    callAPI(params: CallAPIParams): Promise<any>;

    downloadReport(params: {
      body: ReportRequest;
      version?: string;
      interval?: number;
      cancel_after?: number;
      download?: {
        json?: boolean;
        file?: string;
        charset?: string;
        unzip?: boolean;
      };
    }): Promise<any>;
  }
}
