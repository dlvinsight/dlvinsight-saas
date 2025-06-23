import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';

import { db } from '@/libs/DB';
import { organizationSchema, userOrganizationSchema, userSchema } from '@/models/Schema';

export type AuthUser = {
  id: string;
  clerkUserId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
};

export type AuthOrganization = {
  id: string;
  clerkOrgId: string;
  name: string | null;
  role?: string | null;
};

/**
 * Get the current authenticated user from the database
 * Returns null if user is not authenticated or not found in database
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const [user] = await db
    .select()
    .from(userSchema)
    .where(eq(userSchema.clerkUserId, userId))
    .limit(1);

  if (!user) {
    // User exists in Clerk but not in our database
    // This could happen if webhook hasn't processed yet
    console.warn(`User ${userId} not found in database`);
    return null;
  }

  return user;
}

/**
 * Get the current authenticated organization from the database
 * Returns null if no organization is selected or not found in database
 */
export async function getCurrentOrganization(): Promise<AuthOrganization | null> {
  const { orgId, userId } = await auth();

  if (!orgId || !userId) {
    return null;
  }

  const [org] = await db
    .select()
    .from(organizationSchema)
    .where(eq(organizationSchema.clerkOrgId, orgId))
    .limit(1);

  if (!org) {
    // Organization exists in Clerk but not in our database
    console.warn(`Organization ${orgId} not found in database`);
    return null;
  }

  // Get user's role in the organization
  const [user] = await db
    .select()
    .from(userSchema)
    .where(eq(userSchema.clerkUserId, userId))
    .limit(1);

  if (user) {
    const [membership] = await db
      .select()
      .from(userOrganizationSchema)
      .where(
        and(
          eq(userOrganizationSchema.userId, user.id),
          eq(userOrganizationSchema.organizationId, org.id),
        ),
      )
      .limit(1);

    return {
      ...org,
      role: membership?.role || 'member',
    };
  }

  return org;
}

/**
 * Get both user and organization in one call
 */
export async function getAuthContext() {
  const [user, organization] = await Promise.all([
    getCurrentUser(),
    getCurrentOrganization(),
  ]);

  return { user, organization };
}

/**
 * Ensure user and organization exist in database
 * Useful for protecting routes that require both
 */
export async function requireAuthContext() {
  const { user, organization } = await getAuthContext();

  if (!user || !organization) {
    throw new Error('Unauthorized: User or organization not found');
  }

  return { user, organization };
}

/**
 * Get all organizations for the current user
 */
export async function getUserOrganizations(): Promise<AuthOrganization[]> {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const orgs = await db
    .select({
      id: organizationSchema.id,
      clerkOrgId: organizationSchema.clerkOrgId,
      name: organizationSchema.name,
      role: userOrganizationSchema.role,
    })
    .from(organizationSchema)
    .innerJoin(
      userOrganizationSchema,
      eq(userOrganizationSchema.organizationId, organizationSchema.id),
    )
    .where(eq(userOrganizationSchema.userId, user.id));

  return orgs;
}
