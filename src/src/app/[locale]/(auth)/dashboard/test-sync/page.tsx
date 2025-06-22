import { getAuthContext, getUserOrganizations } from '@/libs/auth-helpers';
import { db } from '@/libs/DB';
import { userSchema, organizationSchema, clerkWebhookEventSchema } from '@/models/Schema';
import { desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export default async function TestSyncPage() {
  const { userId, orgId } = await auth();
  const { user, organization } = await getAuthContext();
  const userOrgs = await getUserOrganizations();
  
  // Get recent webhook events
  const recentWebhooks = await db
    .select()
    .from(clerkWebhookEventSchema)
    .orderBy(desc(clerkWebhookEventSchema.createdAt))
    .limit(10);
  
  // Get all users and orgs
  const allUsers = await db.select().from(userSchema).limit(10);
  const allOrgs = await db.select().from(organizationSchema).limit(10);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Webhook Sync Test Page</h1>
      
      <div className="space-y-6">
        {/* Current Auth Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Current Auth Status</h2>
          <dl className="space-y-2">
            <div className="flex gap-2">
              <dt className="font-medium">Clerk User ID:</dt>
              <dd className="font-mono text-sm">{userId || 'Not authenticated'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium">Clerk Org ID:</dt>
              <dd className="font-mono text-sm">{orgId || 'No org selected'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium">DB User:</dt>
              <dd className="font-mono text-sm">
                {user ? `${user.email} (${user.id})` : '❌ Not synced to DB'}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium">DB Organization:</dt>
              <dd className="font-mono text-sm">
                {organization ? `${organization.name} (${organization.id})` : '❌ Not synced to DB'}
              </dd>
            </div>
          </dl>
        </div>

        {/* User Organizations */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Your Organizations</h2>
          {userOrgs.length > 0 ? (
            <ul className="space-y-2">
              {userOrgs.map((org) => (
                <li key={org.id} className="font-mono text-sm">
                  {org.name} - Role: {org.role} (ID: {org.id})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No organizations found</p>
          )}
        </div>

        {/* Recent Webhooks */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Webhook Events</h2>
          {recentWebhooks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Event Type</th>
                    <th className="text-left p-2">Event ID</th>
                    <th className="text-left p-2">Processed</th>
                    <th className="text-left p-2">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {recentWebhooks.map((event) => (
                    <tr key={event.id} className="border-b">
                      <td className="p-2 font-mono">{event.eventType}</td>
                      <td className="p-2 font-mono text-xs">{event.eventId}</td>
                      <td className="p-2">
                        {event.processedAt ? '✅' : '⏳'}
                      </td>
                      <td className="p-2 text-xs">
                        {event.createdAt.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No webhook events received yet</p>
          )}
        </div>

        {/* All Users */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">All Users in Database</h2>
          {allUsers.length > 0 ? (
            <ul className="space-y-2">
              {allUsers.map((u) => (
                <li key={u.id} className="font-mono text-sm">
                  {u.email} - {u.firstName} {u.lastName} (Clerk: {u.clerkUserId})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No users in database</p>
          )}
        </div>

        {/* All Organizations */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">All Organizations in Database</h2>
          {allOrgs.length > 0 ? (
            <ul className="space-y-2">
              {allOrgs.map((o) => (
                <li key={o.id} className="font-mono text-sm">
                  {o.name} (Clerk: {o.clerkOrgId})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No organizations in database</p>
          )}
        </div>
      </div>
    </div>
  );
}