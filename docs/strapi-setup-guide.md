# Strapi Setup Guide

## Initial Setup Required

After Strapi starts for the first time, you need to configure permissions to allow API access.

### Option 1: Manual Setup (Recommended for First Time)

1. **Access Strapi Admin Panel**
   - Open: http://localhost:1337/admin
   - Create an admin account (first time only)

2. **Configure Permissions**
   - Go to **Settings** → **Users & Permissions Plugin** → **Roles** → **Public**
   - Under **Permissions**, find each content type:
     - `client`
     - `project`
     - `pipeline-deal`
     - `deal-milestone`
     - `forecast-snapshot`
     - `billing`
     - `risk-flag`
   - For each content type, check:
     - ✅ `find` (GET /api/{content-type})
     - ✅ `findOne` (GET /api/{content-type}/:id)
     - ✅ `create` (POST /api/{content-type})
     - ✅ `update` (PUT/PATCH /api/{content-type}/:id)
     - ✅ `delete` (DELETE /api/{content-type}/:id)
   - Click **Save**

3. **Verify API Access**
   ```bash
   curl http://localhost:1337/api/pipeline-deals
   ```
   Should return data (or empty array if no data yet)

### Option 2: Automatic Setup (Bootstrap Script)

The bootstrap script in `src/index.ts` attempts to set permissions automatically, but you may still need to:

1. **First-time Admin Setup**
   - Access http://localhost:1337/admin
   - Create admin account
   - Strapi will register content types on first startup

2. **Restart Strapi**
   - The bootstrap script runs on startup
   - Check logs for permission setup messages

### Troubleshooting

#### 404 Errors on API Endpoints

**Problem**: `GET /api/pipeline-deals` returns 404

**Solutions**:
1. **Content Types Not Registered**
   - Restart Strapi to register content types from schema files
   - Check Strapi logs for schema errors

2. **Permissions Not Set**
   - Follow Option 1 above to set permissions manually
   - Or check if bootstrap script ran successfully

3. **Content Types Not Found**
   - Verify schema files exist in `src/api/{content-type}/content-types/{content-type}/schema.json`
   - Check for schema validation errors in Strapi logs

#### CORS Errors

**Problem**: Frontend can't access Strapi API

**Solution**: CORS is configured in `config/middlewares.ts` to allow:
- `http://localhost:3000` (Frontend)
- `http://localhost:8000` (Predictive Service)

If you need additional origins, update the CORS config.

#### Authentication Required

**Problem**: API returns 401 Unauthorized

**Solution**: 
- For development, use Public role permissions (Option 1)
- For production, use API tokens:
  1. Go to **Settings** → **API Tokens**
  2. Create new token
  3. Use token in `Authorization: Bearer <token>` header

### Testing API Access

```bash
# Test public access (should work after permissions are set)
curl http://localhost:1337/api/pipeline-deals

# Test with filters
curl "http://localhost:1337/api/pipeline-deals?filters[status][\$eq]=active"

# Test with populate
curl "http://localhost:1337/api/pipeline-deals?populate=project"
```

### Production Considerations

For production:
1. **Use API Tokens** instead of public permissions
2. **Set up proper authentication** for admin access
3. **Configure CORS** to only allow your frontend domain
4. **Enable rate limiting** if needed
5. **Set up proper database** (PostgreSQL) instead of SQLite




