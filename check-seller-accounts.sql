-- Connect to the database using:
-- psql "postgresql://postgres:yvYWVYXsrUTZyuKZn21khcKYG+8tkA18+mGCkFYuL2I=@35.241.144.115:5432/dlvinsight_prod?sslmode=disable"

-- Show last 10 seller accounts
SELECT 
    id,
    account_name,
    marketplace_name,
    seller_id,
    created_at,
    organization_id
FROM seller_accounts
ORDER BY created_at DESC
LIMIT 10;

-- Count total seller accounts
SELECT COUNT(*) as total_accounts FROM seller_accounts;

-- Show accounts created today
SELECT 
    account_name,
    created_at
FROM seller_accounts
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;