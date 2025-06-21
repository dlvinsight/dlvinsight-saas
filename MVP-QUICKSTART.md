# Amazon Analytics MVP - Quick Start Guide

## 🎯 Goal: Launch MVP in 2-3 weeks (not 8-12 weeks)

## Tech Stack

### 1. Backend & Database: Supabase
- **Why**: Instant PostgreSQL + Auth + Real-time + Auto-generated APIs
- **Cost**: Free tier (up to 500MB database)
- **Setup Time**: 30 minutes

### 2. Frontend: ShipFast or Nextbase
- **Why**: Pre-built SaaS boilerplate with auth, payments, landing pages
- **Cost**: $169-299 one-time
- **Setup Time**: 2 hours

### 3. Data Pipeline: Airbyte Cloud
- **Why**: Has Amazon SP-API connector, managed service
- **Cost**: Free for 1M rows/month
- **Setup Time**: 1 hour

### 4. Analytics: Metabase
- **Why**: Connect to Supabase, instant dashboards
- **Cost**: Free open-source
- **Setup Time**: 1 hour

## Quick Start Steps

### Step 1: Set up Supabase (30 min)
```bash
# Create new Supabase project at supabase.com
# Get your project URL and anon key

# Install Supabase CLI
npm install -g supabase

# Initialize local project
supabase init

# Create initial schema
supabase migration new initial_schema
```

### Step 2: Database Schema
```sql
-- In supabase/migrations/[timestamp]_initial_schema.sql

-- Tenants table
CREATE TABLE tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  amazon_seller_id TEXT UNIQUE,
  amazon_refresh_token TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  asin TEXT NOT NULL,
  sku TEXT,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table (synced from Airbyte)
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  purchase_date TIMESTAMPTZ,
  order_status TEXT,
  order_total DECIMAL(10,2),
  marketplace_id TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own tenant data" ON tenants
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM tenant_users WHERE tenant_id = tenants.id
  ));
```

### Step 3: Set up Frontend Boilerplate (2 hours)

Option A: ShipFast
```bash
# Purchase and download ShipFast
# Clone the repo
git clone [shipfast-repo-url] amazon-analytics-mvp
cd amazon-analytics-mvp

# Install dependencies
npm install

# Configure Supabase
echo "NEXT_PUBLIC_SUPABASE_URL=your-project-url" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key" >> .env.local
```

Option B: Free Alternative - Supabase Starter
```bash
npx create-next-app amazon-analytics-mvp -e with-supabase
cd amazon-analytics-mvp
```

### Step 4: Airbyte Setup (1 hour)

1. Sign up for Airbyte Cloud (free tier)
2. Create Source: Amazon Seller Partner
3. Create Destination: Postgres (your Supabase connection)
4. Configure sync:
   - Orders → orders table
   - Products → products table
   - Financial Events → financial_events table

### Step 5: Basic Dashboard Component
```tsx
// app/dashboard/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies })
  
  // Get current user's tenant
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch analytics data
  const { data: stats } = await supabase
    .from('order_analytics')
    .select('*')
    .single()
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Revenue</h3>
          <p className="text-2xl font-bold">${stats?.total_revenue || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Orders This Month</h3>
          <p className="text-2xl font-bold">{stats?.orders_count || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Avg Order Value</h3>
          <p className="text-2xl font-bold">${stats?.avg_order_value || 0}</p>
        </div>
      </div>
    </div>
  )
}
```

### Step 6: Deploy Metabase (1 hour)

Using Railway (easiest):
```bash
# Click "Deploy on Railway" from Metabase docs
# Connect to your Supabase PostgreSQL
# Create dashboards through UI
```

Or Docker locally:
```bash
docker run -d -p 3000:3000 \
  -e "MB_DB_TYPE=postgres" \
  -e "MB_DB_DBNAME=metabase" \
  -e "MB_DB_PORT=5432" \
  -e "MB_DB_USER=username" \
  -e "MB_DB_PASS=password" \
  -e "MB_DB_HOST=your-db-host" \
  --name metabase metabase/metabase
```

### Step 7: Embed Metabase Charts
```tsx
// components/MetabaseEmbed.tsx
export function MetabaseChart({ dashboardId }: { dashboardId: number }) {
  const embedUrl = `${process.env.NEXT_PUBLIC_METABASE_URL}/embed/dashboard/${dashboardId}`
  
  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="600"
      frameBorder="0"
      allowTransparency
    />
  )
}
```

## 🚀 Launch Checklist

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Frontend boilerplate configured
- [ ] Airbyte connection tested
- [ ] First data sync completed
- [ ] Basic dashboard working
- [ ] Metabase connected
- [ ] Authentication flow tested
- [ ] Deploy to Vercel

## Total Time: 2-3 days of focused work

## Next Steps After MVP

1. Add more SP-API endpoints
2. Implement profit calculations
3. Add email reports
4. Build custom analytics
5. Add subscription billing

## Cost Summary

- **Supabase**: Free (up to 500MB)
- **Airbyte Cloud**: Free (1M rows/month)
- **Metabase**: Free (self-hosted)
- **Vercel**: Free (hobby tier)
- **Frontend Boilerplate**: $169-299 (or free alternative)

**Total Monthly Cost**: $0-20/month for MVP