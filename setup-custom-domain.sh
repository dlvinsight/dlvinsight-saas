#!/bin/bash

# Setup custom domain for Cloud Run using Load Balancer
# This works with all regions including europe-central2

echo "Setting up custom domain app.dlvinsight.com for Cloud Run service..."

# 1. Reserve a static IP address
echo "1. Reserving static IP address..."
gcloud compute addresses create dlv-saas-ip \
    --global \
    --ip-version IPV4

# Get the IP address
IP_ADDRESS=$(gcloud compute addresses describe dlv-saas-ip --global --format="get(address)")
echo "Reserved IP: $IP_ADDRESS"

# 2. Create a backend service (NEG) for Cloud Run
echo "2. Creating backend service..."
gcloud compute network-endpoint-groups create dlv-saas-neg \
    --region=europe-central2 \
    --network-endpoint-type=serverless \
    --cloud-run-service=dlv-saas-d

# 3. Create backend service
gcloud compute backend-services create dlv-saas-backend \
    --global \
    --load-balancing-scheme=EXTERNAL_MANAGED

# 4. Add the NEG to backend service
gcloud compute backend-services add-backend dlv-saas-backend \
    --global \
    --network-endpoint-group=dlv-saas-neg \
    --network-endpoint-group-region=europe-central2

# 5. Create URL map
gcloud compute url-maps create dlv-saas-lb \
    --default-service=dlv-saas-backend

# 6. Create HTTPS proxy
gcloud compute target-https-proxies create dlv-saas-https-proxy \
    --url-map=dlv-saas-lb

# 7. Create forwarding rule
gcloud compute forwarding-rules create dlv-saas-https-rule \
    --global \
    --target-https-proxy=dlv-saas-https-proxy \
    --address=dlv-saas-ip \
    --ports=443

echo ""
echo "✅ Load balancer setup complete!"
echo ""
echo "📌 NEXT STEPS:"
echo "1. Add an A record in your DNS provider:"
echo "   Host: app"
echo "   Type: A"
echo "   Value: $IP_ADDRESS"
echo ""
echo "2. Wait for DNS propagation (5-10 minutes)"
echo ""
echo "3. Create SSL certificate:"
echo "   gcloud compute ssl-certificates create dlv-saas-cert \\"
echo "       --domains=app.dlvinsight.com \\"
echo "       --global"
echo ""
echo "4. Update HTTPS proxy with certificate:"
echo "   gcloud compute target-https-proxies update dlv-saas-https-proxy \\"
echo "       --ssl-certificates=dlv-saas-cert \\"
echo "       --global"
echo ""
echo "Your site will be available at: https://app.dlvinsight.com"