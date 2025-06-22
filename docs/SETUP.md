# Setup & Deployment Guide

## Production Environment

**URLs:**
- Main App: https://app.dlvinsight.com (europe-west1)
- Legacy: https://dlv-saas-d-1017650028198.europe-central2.run.app

**Google Cloud Project:** `dlvinsight-profit-analytics`

## Authentication (Clerk)
- Instance: `advanced-alien-77` (ins_2d6vISZdkrdaKmjZZ4ixbvM776d)
- ⚠️ NEVER use keys from "open-stinkbug-8" instance - they cause auth errors!
- Keys are in `.env.local` and Cloud Run environment variables

## Database Configuration

### Local Development
- PostgreSQL running locally
- Database: `dlvinsight_dev`
- Connection: `postgresql://admin@localhost:5432/dlvinsight_dev`
- Environment: `.env.local`

### Production (Google Cloud SQL)
- Instance: `dlvinsight-db-west1` (PostgreSQL 17)
- Connection: `dlvinsight-profit-analytics:europe-west1:dlvinsight-db-west1`
- Database: `dlvinsight_prod`
- Password: Stored in `/tmp/db_password.txt` (local only, not in git)
- Public IP: `35.241.144.115`
- Cloud Run URL: `postgresql://postgres:PASSWORD@/dlvinsight_prod?host=/cloudsql/dlvinsight-profit-analytics:europe-west1:dlvinsight-db-west1`

### Database Tables
- `organization` - Multi-tenant organization management
- `seller_accounts` - Amazon seller account credentials
- `sales_data` - Amazon sales transactions
- `products` - Product catalog
- `inventory` - Inventory levels
- `financial_events` - Amazon financial data
- `report_syncs` - Data synchronization tracking
- `todo` - Application todos

## Cloud Run Service
- `dlvinsight-app` (europe-west1) - Production with custom domain app.dlvinsight.com
- Build Method: Google Cloud Buildpacks (auto-detects Node.js)
- Build Trigger: Automatic on push to main branch
- Build Time: ~10 minutes

## Domain Configuration
- Domain: `app.dlvinsight.com`
- DNS: CNAME → `ghs.googlehosted.com.`
- Managed by: Google Domains

## CI/CD Pipeline
- GitHub repo: `https://github.com/dlvinsight/dlvinsight-saas`
- Build trigger: Pushes to `main` branch
- Build process: Google Cloud Buildpacks (Node.js auto-detected)
- Build location: Global (multi-region)
- Deployment: Auto-deploys to Cloud Run in europe-west1
- Build time: ~10 minutes
- Image registry: `europe-west1-docker.pkg.dev/dlvinsight-profit-analytics/cloud-run-source-deploy/`
- Trigger ID: `8b6ba718-d811-48a6-9cc3-b388fa8c5e4d`
- Service Account: `1017650028198-compute@developer.gserviceaccount.com`

## Important Build Notes
- Source code is in `/src` directory (not root)
- Uses `project.toml` to configure buildpacks
- Environment variables are set at runtime (not build time)
- `.env` file MUST have correct Clerk keys or auth will fail

## Cloud Run Production Commands

### Check Domain Mapping Status
```bash
gcloud beta run domain-mappings describe --domain=app.dlvinsight.com --region=europe-west1
```

### View Service Details
```bash
gcloud run services describe dlvinsight-app --region=europe-west1
```

### Update Environment Variables
```bash
gcloud run services update dlvinsight-app --region=europe-west1 --update-env-vars="KEY=value"
```

### View Logs
```bash
gcloud run services logs read dlvinsight-app --region=europe-west1 --limit=50
```

### Deploy New Version (europe-west1)
```bash
# Get latest image from europe-central2 build
IMAGE=$(gcloud run services describe dlv-saas-d --region=europe-central2 --format="get(spec.template.spec.containers[0].image)")

# Deploy to europe-west1
gcloud run deploy dlvinsight-app \
  --image=$IMAGE \
  --region=europe-west1 \
  --add-cloudsql-instances=dlvinsight-profit-analytics:europe-central2:dlvinsight-db
```

## Important Notes
- Domain mappings not supported in europe-central2 - that's why we use europe-west1
- IAM binding for public access has been fixed - service is publicly accessible

## Database Connection Commands

### Production Database Access
```bash
# Using password file
PGPASSWORD="$(cat /tmp/db_password.txt)" /usr/local/opt/postgresql@15/bin/psql -h 34.116.202.95 -U postgres -d dlvinsight_prod

# Using gcloud
gcloud sql connect dlvinsight-db --user=postgres --database=dlvinsight_prod
```