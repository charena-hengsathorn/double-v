# Fix Sales Content Type 404 Error

## Problem
Strapi is returning 404 for `/api/sales` endpoint, even though the content type schema exists.

## Root Cause
The Sales content type exists in the filesystem but may not be properly registered in Strapi's runtime.

## Solutions

### Option 1: Restart Strapi (Recommended)
1. Stop Strapi (if running)
2. Clear cache:
   ```bash
   cd project/strapi
   rm -rf .cache .tmp
   ```
3. Restart Strapi:
   ```bash
   npm run develop
   ```

### Option 2: Verify in Strapi Admin
1. Go to http://localhost:1337/admin
2. Navigate to **Content-Type Builder**
3. Check if "Sales" appears in the list
4. If it doesn't appear, the content type needs to be manually created

### Option 3: Check Permissions
1. Go to http://localhost:1337/admin
2. Navigate to **Settings → Users & Permissions → Roles → Public**
3. Find "Sales" in the permissions list
4. Ensure all actions (find, findOne, create, update, delete) are checked
5. Save

### Option 4: Manual Content Type Creation
If the content type doesn't exist in admin:

1. Go to **Content-Type Builder**
2. Click **Create new collection type**
3. Name it "Sales" (singular: "Sale")
4. Add fields:
   - `client` (Text, required)
   - `sale_amount` (Number - Decimal, required)
   - `construction_cost` (Number - Decimal, required)
   - `project_profit` (Number - Decimal, required)
   - `status` (Enumeration: Confirmed, Pending, Closed, required)
   - `notes` (Long text, optional)
5. Save
6. Go to **Settings → Users & Permissions → Roles → Public**
7. Enable all permissions for Sales
8. Save

## Verification
After fixing, test the endpoint:
```bash
curl http://localhost:1337/api/sales
```

Should return:
```json
{"data":[],"meta":{"pagination":{"page":1,"pageSize":25,"pageCount":0,"total":0}}}
```

Instead of 404.

## Current Status
- ✅ Schema file exists: `project/strapi/src/api/sale/content-types/sale/schema.json`
- ✅ Permissions configured in bootstrap: `project/strapi/src/index.ts`
- ✅ Controller and service files exist
- ❌ Content type not recognized by Strapi runtime (404 error)

## Next Steps
1. Restart Strapi with cache cleared
2. Verify in admin panel
3. Check permissions
4. If still not working, create manually in admin

