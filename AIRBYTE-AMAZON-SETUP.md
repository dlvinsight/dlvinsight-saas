# Amazon Analytics MVP with ixartz/SaaS-Boilerplate + Airbyte

## Quick Setup Guide

### Step 1: Configure the Boilerplate

```bash
cd src
npm install

# Copy environment file
cp .env.example .env.local
```

### Step 2: Database Setup for Amazon Analytics

Create a new migration for Amazon-specific tables:

```bash
npm run db:generate -- create-amazon-tables
```

### Step 3: Airbyte Configuration

#### Option A: Airbyte Cloud (Recommended for MVP)
1. Sign up at https://cloud.airbyte.com
2. Create a new connection:
   - **Source**: Amazon Seller Partner API
   - **Destination**: Postgres (your database)

#### Option B: Self-hosted Airbyte (for more control)

```bash
# Deploy Airbyte on Docker
git clone https://github.com/airbytehq/airbyte.git
cd airbyte
./run-ab-platform.sh
```

### Step 4: Multi-Tenant Airbyte Service

Create `src/services/airbyte-manager.ts`:

```typescript
import { db } from '@/libs/DB';
import { organizations } from '@/models/Schema';

export class AirbyteManager {
  private airbyteUrl = process.env.AIRBYTE_URL || 'http://localhost:8000';
  
  async createTenantConnection(organizationId: string, amazonCredentials: {
    sellerId: string;
    refreshToken: string;
    marketplaceIds: string[];
  }) {
    // Create Airbyte source for this tenant
    const source = await this.createAmazonSource(organizationId, amazonCredentials);
    
    // Create destination (shared database with tenant isolation)
    const destination = await this.getOrCreateDestination();
    
    // Create connection
    const connection = await this.createConnection(source.sourceId, destination.destinationId, organizationId);
    
    // Update organization with Airbyte connection ID
    await db.update(organizations)
      .set({ 
        airbyteConnectionId: connection.connectionId,
        amazonSellerId: amazonCredentials.sellerId 
      })
      .where(eq(organizations.id, organizationId));
    
    return connection;
  }
  
  private async createAmazonSource(tenantId: string, creds: any) {
    const response = await fetch(`${this.airbyteUrl}/api/v1/sources/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceDefinitionId: 'e55879a8-0ef8-4557-abcf-ab34c53ec460', // Amazon SP-API
        connectionConfiguration: {
          seller_id: creds.sellerId,
          refresh_token: creds.refreshToken,
          marketplace_ids: creds.marketplaceIds,
          start_date: '2024-01-01'
        },
        name: `amazon_${tenantId}`
      })
    });
    return response.json();
  }
}
```

### Step 5: Database Schema Updates

Add to `migrations/0001_add_amazon_tables.sql`:

```sql
-- Amazon credentials per organization
CREATE TABLE amazon_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  seller_id TEXT NOT NULL,
  refresh_token TEXT ENCRYPTED,
  marketplace_ids TEXT[] NOT NULL,
  airbyte_connection_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders synced from Amazon
CREATE TABLE amazon_orders (
  id TEXT PRIMARY KEY, -- Amazon Order ID
  organization_id TEXT REFERENCES organizations(id),
  purchase_date TIMESTAMP,
  order_status TEXT,
  fulfillment_channel TEXT,
  order_total DECIMAL(10,2),
  currency_code TEXT,
  marketplace_id TEXT,
  raw_data JSONB,
  synced_at TIMESTAMP DEFAULT NOW()
);

-- Products catalog
CREATE TABLE amazon_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  asin TEXT NOT NULL,
  sku TEXT,
  title TEXT,
  brand TEXT,
  category TEXT,
  list_price DECIMAL(10,2),
  raw_data JSONB,
  synced_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, asin)
);

-- Financial events
CREATE TABLE amazon_financial_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  order_id TEXT,
  event_type TEXT,
  posted_date TIMESTAMP,
  amount DECIMAL(10,2),
  currency_code TEXT,
  fee_type TEXT,
  raw_data JSONB,
  synced_at TIMESTAMP DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE amazon_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE amazon_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE amazon_financial_events ENABLE ROW LEVEL SECURITY;

-- Policies to ensure tenant isolation
CREATE POLICY "Users can only see their organization's data" ON amazon_orders
  FOR ALL USING (organization_id = current_user_organization_id());
```

### Step 6: Dashboard Components

Create `src/features/dashboard/AmazonAnalytics.tsx`:

```tsx
import { Card } from '@/components/ui/card';
import { useOrganization } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

export function AmazonAnalyticsDashboard() {
  const { organization } = useOrganization();
  
  const { data: analytics } = useQuery({
    queryKey: ['amazon-analytics', organization?.id],
    queryFn: () => fetch(`/api/analytics/overview`).then(r => r.json()),
    enabled: !!organization
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold">${analytics?.totalRevenue || 0}</p>
        </div>
      </Card>
      
      <Card>
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Orders Today</h3>
          <p className="text-2xl font-bold">{analytics?.ordersToday || 0}</p>
        </div>
      </Card>
      
      <Card>
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Active SKUs</h3>
          <p className="text-2xl font-bold">{analytics?.activeSKUs || 0}</p>
        </div>
      </Card>
      
      <Card>
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Profit Margin</h3>
          <p className="text-2xl font-bold">{analytics?.profitMargin || 0}%</p>
        </div>
      </Card>
    </div>
  );
}
```

### Step 7: API Routes

Create `src/app/api/analytics/overview/route.ts`:

```typescript
import { auth } from '@clerk/nextjs';
import { db } from '@/libs/DB';
import { sql } from 'drizzle-orm';

export async function GET() {
  const { orgId } = auth();
  
  if (!orgId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const analytics = await db.execute(sql`
    SELECT 
      SUM(order_total) as total_revenue,
      COUNT(*) FILTER (WHERE DATE(purchase_date) = CURRENT_DATE) as orders_today,
      COUNT(DISTINCT sku) as active_skus,
      AVG(profit_margin) as avg_profit_margin
    FROM amazon_orders
    WHERE organization_id = ${orgId}
      AND purchase_date >= CURRENT_DATE - INTERVAL '30 days'
  `);

  return Response.json({
    totalRevenue: analytics[0].total_revenue || 0,
    ordersToday: analytics[0].orders_today || 0,
    activeSKUs: analytics[0].active_skus || 0,
    profitMargin: analytics[0].avg_profit_margin || 0
  });
}
```

## Deployment

### 1. Deploy Database (Neon or Supabase)
```bash
# Using Neon (recommended)
npm run db:push
```

### 2. Deploy to Vercel
```bash
vercel --prod
```

### 3. Set up Airbyte Sync Schedule
- In Airbyte UI, set sync frequency (hourly/daily)
- Or trigger via API after user onboarding

## Next Steps

1. **Add Amazon OAuth Flow**: Let users connect their Amazon Seller account
2. **Implement Profit Calculations**: Add cost data and calculate margins
3. **Add Export Features**: CSV/Excel exports
4. **Build Forecasting**: Use historical data for predictions
5. **Add Subscription Tiers**: Limit features based on plan

## Cost Estimate

- **Neon Database**: Free tier (0.5 GB)
- **Airbyte Cloud**: Free (1M rows/month)
- **Vercel**: Free hobby tier
- **Total**: $0/month for MVP

Ready to scale when needed!