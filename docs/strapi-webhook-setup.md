# Strapi Webhook Configuration

## Overview
Strapi webhooks are configured to trigger forecast recomputation in the predictive service when pipeline deals or billings are created, updated, or deleted.

## Webhook Endpoint
- **URL**: `https://your-predictive-service.herokuapp.com/api/v1/webhooks/strapi`
- **Method**: `POST`
- **Authentication**: HMAC signature verification

## Strapi Webhook Configuration

### 1. Create Webhook in Strapi Admin

1. Navigate to **Settings** → **Webhooks** in Strapi admin panel
2. Click **Create new webhook**
3. Configure:

**Name**: `Predictive Service - Pipeline Deals`
- **URL**: `https://your-predictive-service.herokuapp.com/api/v1/webhooks/strapi`
- **Events**: 
  - ✅ `entry.create` (Pipeline Deal)
  - ✅ `entry.update` (Pipeline Deal)
  - ✅ `entry.delete` (Pipeline Deal)
- **Headers**:
  - `X-Strapi-Event`: `entry.create|entry.update|entry.delete`
  - `X-Strapi-Entity`: `pipeline-deal`
  - `X-Strapi-Signature`: `<hmac_signature>` (auto-generated)

**Name**: `Predictive Service - Billings`
- **URL**: `https://your-predictive-service.herokuapp.com/api/v1/webhooks/strapi`
- **Events**:
  - ✅ `entry.create` (Billing)
  - ✅ `entry.update` (Billing)
- **Headers**: Same as above, but `X-Strapi-Entity`: `billing`

### 2. Configure Webhook Secret

Set the `STRAPI_WEBHOOK_SECRET` environment variable in the predictive service to match Strapi's webhook secret.

**In Heroku:**
```bash
heroku config:set STRAPI_WEBHOOK_SECRET=your-secret-key -a your-predictive-service-app
```

**In Strapi:**
The webhook secret should be configured in Strapi's webhook settings.

### 3. Webhook Payload Format

Strapi sends webhooks in the following format:

```json
{
  "event": "entry.update",
  "entity": "pipeline-deal",
  "entry": {
    "id": 1,
    "data": {
      "deal_id": "DEAL-001",
      "stage": "negotiation",
      "probability": 75,
      "deal_value": 500000,
      ...
    }
  }
}
```

### 4. Security

The predictive service verifies webhook signatures using HMAC-SHA256:

1. Strapi generates signature: `HMAC-SHA256(payload, secret)`
2. Sends signature in `X-Strapi-Signature` header
3. Predictive service verifies signature matches

If signature verification fails, the webhook is rejected with `401 Unauthorized`.

## Testing Webhooks

### Test with curl

```bash
curl -X POST https://your-predictive-service.herokuapp.com/api/v1/webhooks/strapi \
  -H "Content-Type: application/json" \
  -H "X-Strapi-Event: entry.update" \
  -H "X-Strapi-Entity: pipeline-deal" \
  -H "X-Strapi-Signature: <signature>" \
  -d '{
    "event": "entry.update",
    "entity": "pipeline-deal",
    "entry": {
      "id": 1,
      "data": {
        "deal_id": "TEST-001",
        "stage": "proposal",
        "probability": 50
      }
    }
  }'
```

### Monitor Webhook Delivery

Check webhook delivery status in Strapi admin panel under **Settings** → **Webhooks** → **Recent deliveries**.

## Troubleshooting

### Webhook Not Received

1. Check webhook URL is correct and accessible
2. Verify CORS settings allow Strapi domain
3. Check predictive service logs for errors
4. Verify webhook secret matches

### Signature Verification Fails

1. Ensure `STRAPI_WEBHOOK_SECRET` is set correctly
2. Verify secret matches in Strapi webhook configuration
3. Check that payload is not modified in transit

### Forecast Not Updating

1. Check webhook handler logs
2. Verify forecast recompute is triggered
3. Check for errors in forecast computation
4. Review alert logs for issues

## Local Development

For local development, use a tool like [ngrok](https://ngrok.com/) to expose your local predictive service:

```bash
ngrok http 8000
```

Then use the ngrok URL in Strapi webhook configuration.

