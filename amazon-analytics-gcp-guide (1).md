# Amazon Analytics SaaS Platform - GCP Implementation Guide

## 🎯 Project Overview

Building a multi-tenant Amazon seller analytics platform with:
- **Frontend**: Next.js 15 + React 19 + Tailwind CSS
- **Backend**: Express.js + TypeScript  
- **Databases**: PostgreSQL (Cloud SQL) + BigQuery
- **Data Pipeline**: Airbyte + Amazon SP-API
- **Infrastructure**: Google Cloud Platform

## 🏗️ Architecture on GCP

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (Cloud Run)                       │
│              Next.js 15 + React 19 + Tailwind               │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                  API Gateway / Load Balancer                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                    Backend (Cloud Run)                       │
│                 Express.js + TypeScript                      │
└─────────┬─────────────────────────┬─────────────────────────┘
          │                         │
┌─────────┴──────────┐    ┌────────┴────────────────────────┐
│  Cloud SQL         │    │      Airbyte (GKE)              │
│  PostgreSQL        │    │  ┌─────────────────────────┐    │
│  - User data       │    │  │ SP-API Connector → BQ   │    │
│  - Tenant config   │    │  └─────────────────────────┘    │
└────────────────────┘    └────────┬────────────────────────┘
                                   │
                          ┌────────┴────────────────────────┐
                          │        BigQuery                 │
                          │  ┌──────────┐ ┌──────────┐     │
                          │  │Dataset:   │ │Dataset:   │     │
                          │  │tenant_123 │ │tenant_456 │     │
                          │  └──────────┘ └──────────┘     │
                          └─────────────────────────────────┘
```

## 📦 Tech Stack Details

### Core Stack
```yaml
Frontend:
  - Framework: Next.js 15 (from ixartz/SaaS-Boilerplate)
  - UI: Tailwind CSS + Shadcn UI
  - State: React Query + Zustand
  - Auth: Clerk (from boilerplate)
  - Charts: Tremor + React Financial Charts

Backend:
  - Runtime: Node.js + Express.js
  - Language: TypeScript
  - ORM: Drizzle (from boilerplate)
  - Auth: JWT with Clerk
  - API: REST + GraphQL (optional)

Data Pipeline:
  - Integration: Airbyte (self-hosted on GKE)
  - Orchestration: Cloud Composer (Airflow) or Dagster
  - Transformation: dbt
  - Storage: BigQuery

Analytics:
  - Warehouse: BigQuery
  - Visualization: Metabase → Superset (scale)
  - Forecasting: Prophet (Cloud Functions)
```

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

#### 1.1 Clone and Setup SaaS Boilerplate
```bash
# Clone the boilerplate
git clone --depth=1 https://github.com/ixartz/SaaS-Boilerplate.git amazon-analytics-saas
cd amazon-analytics-saas

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
```

#### 1.2 GCP Project Setup
```bash
# Create GCP project
gcloud projects create amazon-analytics-platform
gcloud config set project amazon-analytics-platform

# Enable required APIs
gcloud services enable \
  cloudrun.googleapis.com \
  cloudsql.googleapis.com \
  bigquery.googleapis.com \
  container.googleapis.com \
  cloudbuild.googleapis.com
```

#### 1.3 Setup Cloud SQL PostgreSQL
```sql
-- Create multi-tenant schema
CREATE SCHEMA tenant_management;

CREATE TABLE tenant_management.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    amazon_seller_id VARCHAR(255) UNIQUE,
    amazon_refresh_token TEXT ENCRYPTED,
    airbyte_connection_id UUID,
    bigquery_dataset_id VARCHAR(255),
    subscription_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tenant_management.tenants ENABLE ROW LEVEL SECURITY;
```

### Phase 2: Data Pipeline (Week 3-4)

#### 2.1 Deploy Airbyte on GKE
```yaml
# airbyte-values.yaml
global:
  database:
    host: "your-cloud-sql-instance"
    port: "5432"
    database: "airbyte"
  logs:
    storage:
      type: "GCS"
      gcs:
        bucket: "airbyte-logs-bucket"

webapp:
  replicaCount: 2
  
worker:
  replicaCount: 3
```

```bash
# Deploy with Helm
helm repo add airbyte https://airbytehq.github.io/helm-charts
helm install airbyte airbyte/airbyte -f airbyte-values.yaml
```

#### 2.2 Multi-Tenant Airbyte Manager
```typescript
// services/AirbyteManager.ts
import { AirbyteApi } from '@airbyte/api';
import { BigQuery } from '@google-cloud/bigquery';

export class AirbyteMultiTenantManager {
  private airbyte: AirbyteApi;
  private bigquery: BigQuery;

  async createTenantPipeline(tenant: {
    id: string;
    amazonSellerId: string;
    refreshToken: string;
    marketplaceIds: string[];
  }) {
    // 1. Create BigQuery dataset for tenant
    const datasetId = `tenant_${tenant.id.replace(/-/g, '_')}`;
    await this.createBigQueryDataset(datasetId);

    // 2. Create Airbyte source
    const source = await this.airbyte.sources.create({
      name: `amazon_sp_${tenant.id}`,
      sourceDefinitionId: 'e55879a8-0ef8-4557-abcf-ab34c53ec460', // Amazon SP-API
      connectionConfiguration: {
        refresh_token: tenant.refreshToken,
        lwa_app_id: process.env.AMAZON_LWA_APP_ID,
        lwa_client_secret: process.env.AMAZON_LWA_CLIENT_SECRET,
        aws_access_key: process.env.AWS_ACCESS_KEY,
        aws_secret_key: process.env.AWS_SECRET_KEY,
        role_arn: process.env.AWS_ROLE_ARN,
        seller_id: tenant.amazonSellerId,
        marketplace_ids: tenant.marketplaceIds,
        start_date: '2023-01-01'
      }
    });

    // 3. Create Airbyte destination (BigQuery)
    const destination = await this.airbyte.destinations.create({
      name: `bigquery_${tenant.id}`,
      destinationDefinitionId: '22f6c74f-5699-40ff-833c-4a879ea40133', // BigQuery
      connectionConfiguration: {
        project_id: process.env.GCP_PROJECT_ID,
        dataset_id: datasetId,
        dataset_location: 'US',
        credentials_json: process.env.BIGQUERY_SERVICE_ACCOUNT_JSON
      }
    });

    // 4. Create connection
    const connection = await this.airbyte.connections.create({
      name: `sync_${tenant.id}`,
      sourceId: source.sourceId,
      destinationId: destination.destinationId,
      scheduleType: 'manual', // We'll trigger via orchestrator
      namespaceDefinition: 'destination',
      status: 'active',
      syncCatalog: {
        streams: [
          { stream: { name: 'orders' }, config: { syncMode: 'incremental' } },
          { stream: { name: 'inventory' }, config: { syncMode: 'full_refresh' } },
          { stream: { name: 'financial_events' }, config: { syncMode: 'incremental' } }
        ]
      }
    });

    return { sourceId: source.sourceId, destinationId: destination.destinationId, connectionId: connection.connectionId };
  }

  private async createBigQueryDataset(datasetId: string) {
    const dataset = this.bigquery.dataset(datasetId);
    const [exists] = await dataset.exists();
    
    if (!exists) {
      await this.bigquery.createDataset(datasetId, {
        location: 'US',
        description: `Data for tenant ${datasetId}`
      });
    }
  }
}
```

### Phase 3: Analytics & Transformations (Week 5-6)

#### 3.1 dbt Models for Amazon Data
```sql
-- models/staging/amazon/stg_orders.sql
WITH source AS (
    SELECT * FROM {{ source('amazon_sp_api', 'orders') }}
),
staged AS (
    SELECT
        order_id,
        purchase_date,
        order_status,
        fulfillment_channel,
        sales_channel,
        order_total_amount,
        order_total_currency_code,
        marketplace_id,
        buyer_email,
        _airbyte_extracted_at
    FROM source
)
SELECT * FROM staged

-- models/marts/finance/profit_by_sku.sql
WITH order_items AS (
    SELECT * FROM {{ ref('stg_order_items') }}
),
fees AS (
    SELECT * FROM {{ ref('stg_financial_events') }}
),
profit_calc AS (
    SELECT
        oi.sku,
        oi.marketplace_id,
        DATE_TRUNC(oi.purchase_date, MONTH) as month,
        SUM(oi.item_price) as gross_revenue,
        SUM(f.fba_fees + f.referral_fee + f.variable_closing_fee) as total_fees,
        SUM(oi.item_price) - SUM(f.fba_fees + f.referral_fee + f.variable_closing_fee) as net_profit
    FROM order_items oi
    LEFT JOIN fees f ON oi.order_id = f.order_id AND oi.sku = f.sku
    GROUP BY 1, 2, 3
)
SELECT * FROM profit_calc
```

#### 3.2 API Endpoints for Analytics
```typescript
// routes/analytics.ts
import { Router } from 'express';
import { BigQuery } from '@google-cloud/bigquery';

const router = Router();
const bigquery = new BigQuery();

router.get('/tenant/:tenantId/profit-summary', async (req, res) => {
  const { tenantId } = req.params;
  const { startDate, endDate, groupBy = 'month' } = req.query;

  // Ensure user has access to this tenant
  if (!req.user.tenants.includes(tenantId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const datasetId = `tenant_${tenantId.replace(/-/g, '_')}`;
  
  const query = `
    SELECT 
      DATE_TRUNC(purchase_date, ${groupBy}) as period,
      marketplace_id,
      SUM(gross_revenue) as total_revenue,
      SUM(total_fees) as total_fees,
      SUM(net_profit) as net_profit,
      COUNT(DISTINCT sku) as unique_skus
    FROM \`${process.env.GCP_PROJECT_ID}.${datasetId}.profit_by_sku\`
    WHERE purchase_date BETWEEN @startDate AND @endDate
    GROUP BY period, marketplace_id
    ORDER BY period DESC
  `;

  const [rows] = await bigquery.query({
    query,
    params: { startDate, endDate }
  });

  res.json({ data: rows });
});

export default router;
```

### Phase 4: Frontend Integration (Week 7-8)

#### 4.1 Dashboard Component
```tsx
// components/dashboard/ProfitDashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { Card, Title, AreaChart, Grid, Flex, Metric, Text } from '@tremor/react';

export function ProfitDashboard({ tenantId }: { tenantId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['profit-summary', tenantId],
    queryFn: () => fetchProfitSummary(tenantId)
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Grid numItemsSm={2} numItemsLg={3} className="gap-6">
      <Card>
        <Text>Total Revenue</Text>
        <Metric>${data?.totalRevenue.toLocaleString()}</Metric>
      </Card>
      <Card>
        <Text>Net Profit</Text>
        <Metric>${data?.netProfit.toLocaleString()}</Metric>
      </Card>
      <Card>
        <Text>Profit Margin</Text>
        <Metric>{data?.profitMargin.toFixed(2)}%</Metric>
      </Card>
      
      <Card className="col-span-full">
        <Title>Profit Trend</Title>
        <AreaChart
          data={data?.monthlyData}
          index="month"
          categories={["revenue", "profit"]}
          colors={["blue", "green"]}
          valueFormatter={(value) => `$${value.toLocaleString()}`}
        />
      </Card>
    </Grid>
  );
}
```

## 💰 GCP Cost Estimates

### Starting Phase (1-10 tenants)
- Cloud SQL (2 vCPU, 7.5GB): $80/month
- GKE cluster (Airbyte): $150/month
- Cloud Run (API + Frontend): $50/month
- BigQuery storage (1TB): $20/month
- BigQuery queries (1TB): $5/month
- **Total: ~$305/month**

### Growth Phase (100 tenants)
- Cloud SQL (4 vCPU, 15GB): $160/month
- GKE cluster (scaled): $400/month
- Cloud Run (autoscaled): $200/month
- BigQuery storage (50TB): $1,000/month
- BigQuery queries (10TB): $50/month
- **Total: ~$1,810/month**

## 🔒 Security Considerations

### 1. Tenant Isolation
- Separate BigQuery datasets per tenant
- Row-level security in PostgreSQL
- API-level access controls
- Encrypted SP-API credentials

### 2. Data Protection
```javascript
// Encrypt sensitive data
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

class CredentialManager {
  async storeAmazonCredentials(tenantId: string, credentials: AmazonCredentials) {
    const secretId = `amazon-creds-${tenantId}`;
    await this.secretManager.createSecret({
      parent: `projects/${PROJECT_ID}`,
      secretId,
      secret: {
        replication: { automatic: {} }
      }
    });
    
    await this.secretManager.addSecretVersion({
      parent: `projects/${PROJECT_ID}/secrets/${secretId}`,
      payload: {
        data: Buffer.from(JSON.stringify(credentials))
      }
    });
  }
}
```

## 🚀 Deployment Guide

### 1. Build and Deploy Frontend
```bash
# Build Next.js app
npm run build

# Deploy to Cloud Run
gcloud run deploy amazon-analytics-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 2. Deploy Backend API
```bash
# Build Docker image
docker build -t gcr.io/$PROJECT_ID/api:latest .
docker push gcr.io/$PROJECT_ID/api:latest

# Deploy to Cloud Run
gcloud run deploy amazon-analytics-api \
  --image gcr.io/$PROJECT_ID/api:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars "DATABASE_URL=$DATABASE_URL"
```

### 3. Setup CI/CD with Cloud Build
```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/npm'
    args: ['install']
  
  - name: 'gcr.io/cloud-builders/npm'
    args: ['run', 'test']
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/app:$COMMIT_SHA', '.']
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/app:$COMMIT_SHA']
  
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'amazon-analytics'
      - '--image=gcr.io/$PROJECT_ID/app:$COMMIT_SHA'
      - '--region=us-central1'
```

## 📋 Launch Checklist

- [ ] GCP project created and APIs enabled
- [ ] ixartz/SaaS-Boilerplate cloned and configured
- [ ] Cloud SQL PostgreSQL instance running
- [ ] Airbyte deployed on GKE
- [ ] First tenant created with SP-API connection
- [ ] BigQuery datasets configured
- [ ] dbt models created and tested
- [ ] API endpoints implemented
- [ ] Frontend dashboard components built
- [ ] Metabase connected for quick analytics
- [ ] Cloud Run deployments configured
- [ ] Monitoring and alerts setup
- [ ] Backup and disaster recovery planned
- [ ] Security audit completed
- [ ] Documentation written

## 🎯 Next Steps

1. **MVP Features**
   - Basic profit/loss dashboard
   - Inventory tracking
   - Sales performance by SKU
   - Excel export functionality

2. **Advanced Features**
   - Prophet forecasting integration
   - Competitor analysis
   - Automated alerts
   - Custom report builder

3. **Scale Preparation**
   - Implement caching layer (Redis)
   - Add CDN for static assets
   - Optimize BigQuery queries
   - Implement rate limiting

## 📚 Resources

- [ixartz/SaaS-Boilerplate](https://github.com/ixartz/SaaS-Boilerplate)
- [Airbyte Documentation](https://docs.airbyte.com/)
- [BigQuery Best Practices](https://cloud.google.com/bigquery/docs/best-practices)
- [Amazon SP-API Documentation](https://developer-docs.amazon.com/sp-api/)
- [dbt Documentation](https://docs.getdbt.com/)

---

Ready to build! 🚀 Remember: Start simple with one tenant, validate the data flow, then scale.