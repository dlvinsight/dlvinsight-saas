import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/libs/DB';
import { userSchema, organizationSchema, userOrganizationSchema, clerkWebhookEventSchema } from '@/models/Schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '@/libs/Logger';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    logger.error('Missing CLERK_WEBHOOK_SECRET');
    return new Response('Server configuration error', { status: 500 });
  }

  // Get headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    logger.error('Missing svix headers');
    return new Response('Missing headers', { status: 400 });
  }

  // Get body
  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // In development, optionally bypass signature verification
  if (process.env.NODE_ENV === 'development' && svix_signature === 'test-signature') {
    logger.warn('⚠️  Bypassing webhook signature verification in development');
    try {
      evt = JSON.parse(body) as WebhookEvent;
    } catch (err) {
      logger.error('Failed to parse webhook body', err);
      return new Response('Invalid JSON', { status: 400 });
    }
  } else {
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      logger.error('Webhook verification failed', err);
      return new Response('Verification failed', { status: 400 });
    }
  }

  // Log the webhook event
  const eventType = evt.type;
  logger.info(`Processing webhook: ${eventType}`, { id: evt.data.id });

  // Store webhook event in database
  try {
    await db.insert(clerkWebhookEventSchema).values({
      eventType: eventType,
      eventId: svix_id,
      payload: evt as any,
      processedAt: null,
    });
  } catch (error) {
    logger.warn('Failed to store webhook event', error);
  }

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      
      case 'organization.created':
        await handleOrganizationCreated(evt.data);
        break;
      
      case 'organization.updated':
        await handleOrganizationUpdated(evt.data);
        break;
      
      case 'organization.deleted':
        await handleOrganizationDeleted(evt.data);
        break;
      
      case 'organizationMembership.created':
        await handleMembershipCreated(evt.data);
        break;
      
      case 'organizationMembership.updated':
        await handleMembershipUpdated(evt.data);
        break;
      
      case 'organizationMembership.deleted':
        await handleMembershipDeleted(evt.data);
        break;
      
      default:
        logger.warn(`Unhandled webhook type: ${eventType}`);
    }

    // Mark webhook as processed
    await db.update(clerkWebhookEventSchema)
      .set({ processedAt: new Date() })
      .where(eq(clerkWebhookEventSchema.eventId, svix_id));

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    logger.error(`Error processing webhook ${eventType}`, error);
    return new Response('Internal server error', { status: 500 });
  }
}

// User handlers
async function handleUserCreated(userData: any) {
  logger.info('Creating user', { userId: userData.id });
  
  await db.insert(userSchema).values({
    clerkUserId: userData.id,
    email: userData.email_addresses[0].email_address,
    firstName: userData.first_name || null,
    lastName: userData.last_name || null,
    imageUrl: userData.image_url || null,
    createdAt: new Date(userData.created_at),
    updatedAt: new Date(userData.updated_at),
  }).onConflictDoNothing();
}

async function handleUserUpdated(userData: any) {
  logger.info('Updating user', { userId: userData.id });
  
  const result = await db.update(userSchema)
    .set({
      email: userData.email_addresses[0].email_address,
      firstName: userData.first_name || null,
      lastName: userData.last_name || null,
      imageUrl: userData.image_url || null,
      updatedAt: new Date(userData.updated_at),
    })
    .where(eq(userSchema.clerkUserId, userData.id))
    .returning();

  if (result.length === 0) {
    // User doesn't exist yet, create it
    await handleUserCreated(userData);
  }
}

async function handleUserDeleted(userData: any) {
  logger.info('Deleting user', { userId: userData.id });
  
  await db.delete(userSchema).where(eq(userSchema.clerkUserId, userData.id));
}

// Organization handlers
async function handleOrganizationCreated(orgData: any) {
  logger.info('Creating organization', { orgId: orgData.id });
  
  await db.insert(organizationSchema).values({
    clerkOrgId: orgData.id,
    name: orgData.name,
    createdAt: new Date(orgData.created_at),
    updatedAt: new Date(orgData.updated_at),
  }).onConflictDoNothing();
}

async function handleOrganizationUpdated(orgData: any) {
  logger.info('Updating organization', { orgId: orgData.id });
  
  const result = await db.update(organizationSchema)
    .set({
      name: orgData.name,
      updatedAt: new Date(orgData.updated_at),
    })
    .where(eq(organizationSchema.clerkOrgId, orgData.id))
    .returning();

  if (result.length === 0) {
    // Organization doesn't exist yet, create it
    await handleOrganizationCreated(orgData);
  }
}

async function handleOrganizationDeleted(orgData: any) {
  logger.info('Deleting organization', { orgId: orgData.id });
  
  await db.delete(organizationSchema).where(eq(organizationSchema.clerkOrgId, orgData.id));
}

// Membership handlers
async function handleMembershipCreated(membershipData: any) {
  logger.info('Creating membership', { 
    userId: membershipData.public_user_data?.user_id,
    orgId: membershipData.organization.id 
  });

  // Get or create the user
  const userId = membershipData.public_user_data?.user_id;
  if (userId) {
    // Ensure user exists
    const existingUser = await db.select()
      .from(userSchema)
      .where(eq(userSchema.clerkUserId, userId))
      .limit(1);

    if (existingUser.length === 0) {
      // Create basic user record
      await db.insert(userSchema).values({
        clerkUserId: userId,
        email: membershipData.public_user_data?.identifier || 'unknown@example.com',
        firstName: membershipData.public_user_data?.first_name,
        lastName: membershipData.public_user_data?.last_name,
        imageUrl: membershipData.public_user_data?.image_url,
      }).onConflictDoNothing();
    }
  }

  // Get the internal user and org IDs
  const [user] = await db.select().from(userSchema).where(eq(userSchema.clerkUserId, userId)).limit(1);
  const [org] = await db.select().from(organizationSchema).where(eq(organizationSchema.clerkOrgId, membershipData.organization.id)).limit(1);

  if (user && org) {
    await db.insert(userOrganizationSchema).values({
      userId: user.id,
      organizationId: org.id,
      role: membershipData.role || 'member',
      createdAt: new Date(membershipData.created_at),
    }).onConflictDoNothing();
  }
}

async function handleMembershipUpdated(membershipData: any) {
  logger.info('Updating membership', { 
    userId: membershipData.public_user_data?.user_id,
    orgId: membershipData.organization.id 
  });

  const userId = membershipData.public_user_data?.user_id;
  
  // Get the internal user and org IDs
  const [user] = await db.select().from(userSchema).where(eq(userSchema.clerkUserId, userId)).limit(1);
  const [org] = await db.select().from(organizationSchema).where(eq(organizationSchema.clerkOrgId, membershipData.organization.id)).limit(1);

  if (user && org) {
    await db.update(userOrganizationSchema)
      .set({
        role: membershipData.role || 'member',
      })
      .where(
        and(
          eq(userOrganizationSchema.organizationId, org.id),
          eq(userOrganizationSchema.userId, user.id)
        )
      );
  }
}

async function handleMembershipDeleted(membershipData: any) {
  logger.info('Deleting membership', { 
    userId: membershipData.public_user_data?.user_id,
    orgId: membershipData.organization.id 
  });

  const userId = membershipData.public_user_data?.user_id;
  
  // Get the internal user and org IDs
  const [user] = await db.select().from(userSchema).where(eq(userSchema.clerkUserId, userId)).limit(1);
  const [org] = await db.select().from(organizationSchema).where(eq(organizationSchema.clerkOrgId, membershipData.organization.id)).limit(1);

  if (user && org) {
    await db.delete(userOrganizationSchema)
      .where(
        and(
          eq(userOrganizationSchema.organizationId, org.id),
          eq(userOrganizationSchema.userId, user.id)
        )
      );
  }
}