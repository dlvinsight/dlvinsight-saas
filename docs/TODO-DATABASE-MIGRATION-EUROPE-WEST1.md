# TODO: Database Migration to europe-west1

## Context
We are migrating the Cloud SQL PostgreSQL database from `europe-central2` to `europe-west1` to improve performance by having it in the same region as the Cloud Run service (`dlvinsight-app`).

### Current Status
- **Old Database**: `dlvinsight-db` in europe-central2 (Warsaw)
- **New Database**: `dlvinsight-db-west1` in europe-west1 (Belgium) - CURRENTLY BEING CREATED
- **Password**: Stored in `/tmp/db_password.txt`
- **Cloud Run Service**: `dlvinsight-app` in europe-west1

## Tasks Checklist

### 1. Database Instance Setup
- [x] Create new Cloud SQL instance `dlvinsight-db-west1` in europe-west1
- [ ] Wait for instance to be RUNNABLE (check with: `gcloud sql instances describe dlvinsight-db-west1`)
- [ ] Create the database: `gcloud sql databases create dlvinsight_prod --instance=dlvinsight-db-west1`

### 2. Database Schema Migration
- [ ] Connect to new database and create schema
  ```bash
  PGPASSWORD="$(cat /tmp/db_password.txt)" psql -h 35.241.144.115 -U postgres -d postgres -c "CREATE DATABASE dlvinsight_prod;"
  ```
- [ ] Apply schema from existing migrations:
  ```bash
  # Update .env.local temporarily to point to new database
  DATABASE_URL="postgresql://postgres:$(cat /tmp/db_password.txt)@35.241.144.115:5432/dlvinsight_prod?sslmode=disable"
  npm run db:migrate
  ```

### 3. Update Cloud Run Environment Variables
- [ ] Update DATABASE_URL in Cloud Run service:
  ```bash
  gcloud run services update dlvinsight-app \
    --region=europe-west1 \
    --update-env-vars="DATABASE_URL=postgresql://postgres:$(cat /tmp/db_password.txt)@/dlvinsight_prod?host=/cloudsql/dlvinsight-profit-analytics:europe-west1:dlvinsight-db-west1"
  ```

### 4. Update Local Development Environment
- [ ] Update `/Users/admin/Code/dlvinsight-saas/src/.env.local`:
  - For local development connecting to production: 
    ```
    DATABASE_URL="postgresql://postgres:PASSWORD@35.241.144.115:5432/dlvinsight_prod?sslmode=disable"
    ```
  - Or keep using local database for development

### 5. Update Cloud Build Configuration
- [ ] Update `cloudbuild.yaml` to reference new Cloud SQL instance:
  ```yaml
  - '--add-cloudsql-instances=dlvinsight-profit-analytics:europe-west1:dlvinsight-db-west1'
  ```

### 6. Update Documentation
- [ ] Update CLAUDE.md with new database information:
  - Instance name: `dlvinsight-db-west1`
  - Region: `europe-west1`
  - Public IP: `35.241.144.115`
  - Connection string format

### 7. Verify Everything Works
- [ ] Test Cloud Run app at https://app.dlvinsight.com
- [ ] Test local development connection
- [ ] Run database migrations: `npm run db:migrate`
- [ ] Check logs: `gcloud run services logs read dlvinsight-app --region=europe-west1`

### 8. Cleanup
- [ ] Delete old database instance `dlvinsight-db` in europe-central2 (after confirming everything works)
  ```bash
  gcloud sql instances delete dlvinsight-db --quiet
  ```

## Important Notes
- The database is currently empty, so no data migration is needed
- Password is the same as the old database (stored in `/tmp/db_password.txt`)
- Cloud SQL connection from Cloud Run uses Unix socket, not IP
- Local connections use public IP with SSL disabled

## Connection Strings Reference
- **Cloud Run**: `postgresql://postgres:PASSWORD@/dlvinsight_prod?host=/cloudsql/PROJECT:REGION:INSTANCE`
- **Local/Direct**: `postgresql://postgres:PASSWORD@PUBLIC_IP:5432/dlvinsight_prod?sslmode=disable`