'use server';

import { eq } from 'drizzle-orm';

import { exchangeRefreshTokenForAccess, testSpApiConnection } from '@/libs/amazon-sp-api';
import { getAuthContext } from '@/libs/auth-helpers';
import { db } from '@/libs/DB';
import { decryptSpApiCredentials, encryptSpApiCredentials } from '@/libs/encryption';
import { sellerAccountSchema } from '@/models/Schema';

export async function saveSellerAccount(accountData: {
  name: string;
  marketplace: string;
  marketplaceCode: string;
  marketplaceId: string;
  apiType: string;
  status: string;
  currency: string;
  currencySymbol: string;
  credentials: {
    awsEnvironment: 'PRODUCTION' | 'SANDBOX';
    accountType: 'Seller' | 'Vendor';
    lwaClientId: string;
    lwaClientSecret: string;
    refreshToken: string;
    endpoint: string;
  };
}) {
  try {
    const { user, organization } = await getAuthContext();

    if (!user || !organization) {
      return {
        success: false,
        error: 'User or organization not found',
      };
    }

    // Get encryption password from environment variable
    const encryptionPassword = process.env.ENCRYPTION_PASSWORD || 'dev-encryption-password';

    // Encrypt the sensitive credentials
    const encryptedCredentials = encryptSpApiCredentials({
      clientId: accountData.credentials.lwaClientId,
      clientSecret: accountData.credentials.lwaClientSecret,
      refreshToken: accountData.credentials.refreshToken,
    }, encryptionPassword);

    // Extract marketplace data
    const marketplaceData = {
      region: accountData.marketplaceCode === 'US'
        ? 'NA'
        : ['DE', 'ES', 'FR', 'UK', 'IT'].includes(accountData.marketplaceCode) ? 'EU' : 'OTHER',
    };

    // Create the seller account
    const result = await db.insert(sellerAccountSchema).values({
      organizationId: organization.id,
      userId: user.id,
      accountName: accountData.name,
      marketplaceId: accountData.marketplaceId,
      marketplaceCode: accountData.marketplaceCode,
      marketplaceName: accountData.marketplace,
      region: marketplaceData.region,
      currency: accountData.currency,
      currencySymbol: accountData.currencySymbol,
      endpoint: accountData.credentials.endpoint,
      sellerId: `SELLER_${Date.now()}`, // Temporary - will be fetched from Amazon API
      awsEnvironment: accountData.credentials.awsEnvironment,
      accountType: accountData.credentials.accountType,
      lwaClientId: encryptedCredentials.lwaClientId,
      lwaClientSecret: encryptedCredentials.lwaClientSecret,
      refreshToken: encryptedCredentials.refreshToken,
      isActive: 1,
    }).returning();

    const newAccount = result[0];
    if (!newAccount) {
      return {
        success: false,
        error: 'Failed to create account',
      };
    }

    // Return the created account (excluding sensitive data)
    return {
      success: true,
      account: {
        id: newAccount.id,
        name: newAccount.accountName,
        marketplace: newAccount.marketplaceName,
        marketplaceCode: newAccount.marketplaceCode,
        marketplaceId: newAccount.marketplaceId,
        status: 'active' as const,
        apiType: 'sp-api' as const,
        lastSync: newAccount.lastSyncAt,
        createdAt: newAccount.createdAt,
      },
    };
  } catch (error) {
    console.error('Error creating seller account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save seller account',
    };
  }
}

export async function fetchSellerAccounts() {
  try {
    const { organization } = await getAuthContext();

    if (!organization) {
      return {
        success: false,
        error: 'Organization not found',
        accounts: [],
      };
    }

    // Fetch all seller accounts for the organization
    const accounts = await db
      .select({
        id: sellerAccountSchema.id,
        name: sellerAccountSchema.accountName,
        marketplace: sellerAccountSchema.marketplaceName,
        marketplaceCode: sellerAccountSchema.marketplaceCode,
        marketplaceId: sellerAccountSchema.marketplaceId,
        status: sellerAccountSchema.isActive,
        lastSync: sellerAccountSchema.lastSyncAt,
        createdAt: sellerAccountSchema.createdAt,
      })
      .from(sellerAccountSchema)
      .where(eq(sellerAccountSchema.organizationId, organization.id));

    // Transform the accounts to match the expected format
    const transformedAccounts = accounts.map(account => ({
      id: account.id,
      name: account.name,
      marketplace: account.marketplace,
      marketplaceCode: account.marketplaceCode,
      marketplaceId: account.marketplaceId,
      apiType: 'sp-api' as const,
      status: account.status === 1 ? 'active' as const : 'inactive' as const,
      lastSync: account.lastSync,
      createdAt: account.createdAt,
    }));

    return {
      success: true,
      accounts: transformedAccounts,
    };
  } catch (error) {
    console.error('Error fetching seller accounts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch seller accounts',
      accounts: [],
    };
  }
}

export async function testSellerAccountConnection(accountId: string) {
  try {
    const { organization } = await getAuthContext();

    if (!organization) {
      return {
        success: false,
        error: 'Organization not found',
      };
    }

    // Fetch the account to test
    const accounts = await db
      .select()
      .from(sellerAccountSchema)
      .where(eq(sellerAccountSchema.id, accountId))
      .limit(1);

    const account = accounts[0];
    if (!account || account.organizationId !== organization.id) {
      return {
        success: false,
        error: 'Account not found',
      };
    }

    // Get encryption password from environment variable
    const encryptionPassword = process.env.ENCRYPTION_PASSWORD || 'dev-encryption-password';
    if (!encryptionPassword) {
      return {
        success: false,
        error: 'Encryption password not configured',
      };
    }

    // Check if credentials exist
    if (!account.lwaClientId || !account.lwaClientSecret || !account.refreshToken) {
      return {
        success: false,
        error: 'SP-API credentials not found for this account',
      };
    }

    // Decrypt the SP-API credentials
    const credentials = decryptSpApiCredentials({
      lwaClientId: account.lwaClientId,
      lwaClientSecret: account.lwaClientSecret,
      refreshToken: account.refreshToken,
    }, encryptionPassword);

    // For sandbox accounts, use the sandbox endpoint
    const endpoint = account.awsEnvironment === 'SANDBOX'
      ? account.endpoint.replace('https://sellingpartnerapi', 'https://sandbox.sellingpartnerapi')
      : account.endpoint;

    // Testing connection for account with endpoint and environment

    // Exchange refresh token for access token
    const { accessToken } = await exchangeRefreshTokenForAccess(
      credentials.refreshToken,
      credentials.clientId,
      credentials.clientSecret,
    );

    // Test the connection using the access token and verify marketplace
    const connectionTest = await testSpApiConnection(accessToken, endpoint, account.marketplaceId);

    if (connectionTest.success) {
      // Check if the marketplace is valid
      if (connectionTest.marketplaceValid === false) {
        return {
          success: false,
          error: `The account does not have access to marketplace ${account.marketplaceId} (${account.marketplaceName}). Available marketplaces: ${connectionTest.marketplaces?.map(mp => mp.marketplace.id).join(', ')}`,
        };
      }

      // Update lastSyncAt on successful connection
      await db
        .update(sellerAccountSchema)
        .set({ lastSyncAt: new Date() })
        .where(eq(sellerAccountSchema.id, accountId));

      return {
        success: true,
        message: `Successfully connected to ${account.accountName}`,
        marketplaces: connectionTest.marketplaces,
      };
    } else {
      return {
        success: false,
        error: connectionTest.error || 'Connection test failed',
      };
    }
  } catch (error) {
    console.error('Connection test error:', error);

    // Return specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('Invalid credentials')) {
        return {
          success: false,
          error: 'Invalid SP-API credentials. Please check your Client ID and Client Secret.',
        };
      } else if (error.message.includes('Expired or invalid refresh token')) {
        return {
          success: false,
          error: 'Your refresh token has expired or is invalid. Please reauthorize your Amazon account.',
        };
      } else if (error.message.includes('Network error')) {
        return {
          success: false,
          error: 'Network error. Please check your internet connection and try again.',
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to test connection',
    };
  }
}

export async function removeSellerAccount(accountId: string) {
  try {
    const { organization } = await getAuthContext();

    if (!organization) {
      return {
        success: false,
        error: 'Organization not found',
      };
    }

    // First check if the account exists and belongs to the organization
    const accountToDelete = await db
      .select()
      .from(sellerAccountSchema)
      .where(eq(sellerAccountSchema.id, accountId))
      .limit(1);

    if (accountToDelete.length === 0) {
      return {
        success: false,
        error: 'Account not found',
      };
    }

    if (accountToDelete[0]?.organizationId !== organization.id) {
      return {
        success: false,
        error: 'Unauthorized to delete this account',
      };
    }

    // Delete the account
    await db
      .delete(sellerAccountSchema)
      .where(eq(sellerAccountSchema.id, accountId))
      .returning();

    // Account deleted successfully

    return {
      success: true,
      message: 'Account removed successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove account',
    };
  }
}
