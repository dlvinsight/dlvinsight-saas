'use server';

import { eq } from 'drizzle-orm';

import { getAuthContext } from '@/libs/auth-helpers';
import { db } from '@/libs/DB';
import { sellerAccountSchema } from '@/models/Schema';

export async function fetchProducts(accountId: string) {
  try {
    const { organization } = await getAuthContext();

    if (!organization) {
      return {
        success: false,
        error: 'Organization not found',
        products: [],
      };
    }

    // Verify the account belongs to the organization
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
        products: [],
      };
    }

    // TODO: Implement actual SP-API call to fetch products
    // For now, return placeholder data
    const placeholderProducts = [
      {
        sku: 'SKU-001',
        asin: 'B08N5WRWNW',
        productName: 'Echo Dot (4th Gen)',
        brand: 'Amazon',
        status: 'Active',
        price: 49.99,
        currency: account.currency,
        imageUrl: null,
      },
      {
        sku: 'SKU-002',
        asin: 'B07PXGQC1Q',
        productName: 'Fire TV Stick 4K',
        brand: 'Amazon',
        status: 'Active',
        price: 39.99,
        currency: account.currency,
        imageUrl: null,
      },
      {
        sku: 'SKU-003',
        asin: 'B08MQZXN1X',
        productName: 'Kindle Paperwhite',
        brand: 'Amazon',
        status: 'Active',
        price: 139.99,
        currency: account.currency,
        imageUrl: null,
      },
    ];

    return {
      success: true,
      products: placeholderProducts,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products',
      products: [],
    };
  }
}
