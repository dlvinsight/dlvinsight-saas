export type SellerAccount = {
  id: string;
  name: string;
  marketplace: string;
  marketplaceCode: string;
};

export type TestStep = {
  step: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
  duration?: number;
  details?: any;
};

export type TestSummary = {
  totalSteps: number;
  successfulSteps: number;
  failedSteps: number;
  totalDuration: number;
  overallStatus: string;
};

export type TestResults = {
  timestamp: string;
  environment: string;
  endpoint: string;
  marketplaceId: string;
  steps: TestStep[];
  summary: TestSummary;
};

export type SpApiTestCase = {
  id: string;
  name: string;
  description: string;
  category: 'auth' | 'marketplace' | 'catalog' | 'rate-limit' | 'inventory' | 'orders';
  requiresAuth: boolean;
  execute: (credentials: SpApiCredentials | (SpApiCredentials & { accessToken: string })) => Promise<TestStep>;
};

export type SpApiCredentials = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  endpoint: string;
  marketplaceId: string;
  awsEnvironment: 'PRODUCTION' | 'SANDBOX';
  accessToken?: string;
};
