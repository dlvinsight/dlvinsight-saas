import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAuthContext } from '@/libs/auth-helpers';
import { db } from '@/libs/DB';
import { encryptSpApiCredentials } from '@/libs/encryption';
import { sellerAccountSchema } from '@/models/Schema';

// Validation schema for creating a seller account
const createSellerAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  marketplace: z.string(),
  marketplaceCode: z.string(),
  marketplaceId: z.string(),
  apiType: z.literal('sp-api'),
  status: z.literal('active'),
  credentials: z.object({
    awsEnvironment: z.enum(['PRODUCTION', 'SANDBOX']),
    accountType: z.enum(['Seller', 'Vendor']),
    lwaClientId: z.string().min(1, 'LWA Client ID is required'),
    lwaClientSecret: z.string().min(1, 'LWA Client Secret is required'),
    refreshToken: z.string().min(1, 'Refresh Token is required'),
    endpoint: z.string().url(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user and organization
    const { user, organization } = await requireAuthContext();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createSellerAccountSchema.parse(body);

    // Get encryption password from environment variable
    const encryptionPassword = process.env.ENCRYPTION_PASSWORD || 'dev-encryption-password';

    // Encrypt the sensitive credentials
    const encryptedCredentials = encryptSpApiCredentials({
      clientId: validatedData.credentials.lwaClientId,
      clientSecret: validatedData.credentials.lwaClientSecret,
      refreshToken: validatedData.credentials.refreshToken,
    }, encryptionPassword);

    // Extract marketplace data from the request
    const marketplaceData = {
      region: validatedData.marketplaceCode === 'US'
        ? 'NA'
        : ['DE', 'ES', 'FR', 'UK', 'IT'].includes(validatedData.marketplaceCode) ? 'EU' : 'OTHER',
      currency: body.currency || 'USD',
      currencySymbol: body.currencySymbol || '$',
    };

    // Create the seller account
    const newAccount = await db.insert(sellerAccountSchema).values({
      organizationId: organization.id,
      userId: user.id,
      accountName: validatedData.name,
      marketplaceId: validatedData.marketplaceId,
      marketplaceCode: validatedData.marketplaceCode,
      marketplaceName: validatedData.marketplace,
      region: marketplaceData.region,
      currency: marketplaceData.currency,
      currencySymbol: marketplaceData.currencySymbol,
      endpoint: validatedData.credentials.endpoint,
      sellerId: `SELLER_${Date.now()}`, // Temporary - will be fetched from Amazon API
      awsEnvironment: validatedData.credentials.awsEnvironment,
      accountType: validatedData.credentials.accountType,
      lwaClientId: encryptedCredentials.lwaClientId,
      lwaClientSecret: encryptedCredentials.lwaClientSecret,
      refreshToken: encryptedCredentials.refreshToken,
      isActive: 1,
    }).returning();

    // Return the created account (excluding sensitive data)
    const createdAccount = newAccount[0];
    if (!createdAccount) {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    return NextResponse.json({
      id: createdAccount.id,
      name: createdAccount.accountName,
      marketplace: createdAccount.marketplaceName,
      marketplaceCode: createdAccount.marketplaceCode,
      marketplaceId: createdAccount.marketplaceId,
      status: 'active',
      apiType: 'sp-api',
      lastSync: createdAccount.lastSyncAt,
      createdAt: createdAccount.createdAt,
    });
  } catch (error) {
    console.error('Error creating seller account:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to create seller account' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Get authenticated user and organization
    const { organization } = await requireAuthContext();

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

    return NextResponse.json(transformedAccounts);
  } catch (error) {
    console.error('Error fetching seller accounts:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch seller accounts' },
      { status: 500 },
    );
  }
}
