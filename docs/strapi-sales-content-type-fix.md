# Fix Strapi Sales Content Type - Step by Step

## Current Issue
- GET `/api/sales` → 404 (Not Found)
- POST `/api/sales` → 405 (Method Not Allowed)
- Content type schema exists but not recognized by Strapi

## Solution: Register Content Type in Strapi Admin

The Sales content type needs to be manually registered in Strapi admin because it's not being auto-detected.

### Step 1: Access Strapi Admin
1. Go to http://localhost:1337/admin
2. Log in with your admin credentials

### Step 2: Check if Sales Exists
1. Go to **Content-Type Builder** (left sidebar)
2. Look for "Sales" in the collection types list
3. If it exists, skip to Step 4
4. If it doesn't exist, continue to Step 3

### Step 3: Create Sales Content Type
1. Click **"Create new collection type"**
2. Display name: `Sales`
3. API ID (singular): `sale`
4. API ID (plural): `sales`
5. Click **Continue**

### Step 4: Add Fields
Add these fields in order:

1. **client** (Text)
   - Name: `client`
   - Type: Text
   - Required: ✅ Yes

2. **sale_amount** (Number)
   - Name: `sale_amount`
   - Type: Number
   - Format: Decimal
   - Required: ✅ Yes

3. **construction_cost** (Number)
   - Name: `construction_cost`
   - Type: Number
   - Format: Decimal
   - Required: ✅ Yes

4. **project_profit** (Number)
   - Name: `project_profit`
   - Type: Number
   - Format: Decimal
   - Required: ✅ Yes

5. **status** (Enumeration)
   - Name: `status`
   - Type: Enumeration
   - Values:
     - `Confirmed`
     - `Pending`
     - `Closed`
   - Default value: `Pending`
   - Required: ✅ Yes

6. **notes** (Long text)
   - Name: `notes`
   - Type: Long text
   - Required: ❌ No

7. Click **Save**

### Step 5: Set Permissions
1. Go to **Settings** → **Users & Permissions** → **Roles**
2. Click on **Public** role
3. Scroll down to find **Sales** section
4. Check all permissions:
   - ✅ find
   - ✅ findOne
   - ✅ create
   - ✅ update
   - ✅ delete
5. Click **Save**

### Step 6: Restart Strapi
```bash
# Stop Strapi (Ctrl+C in terminal)
# Then restart:
cd project/strapi
npm run develop
```

### Step 7: Verify
Test the endpoint:
```bash
curl http://localhost:1337/api/sales
```

Should return:
```json
{"data":[],"meta":{"pagination":{"page":1,"pageSize":25,"pageCount":0,"total":0}}}
```

## Alternative: Delete and Recreate

If the content type exists but isn't working:

1. Go to **Content-Type Builder**
2. Find **Sales**
3. Click the **...** menu → **Delete**
4. Follow Steps 3-7 above to recreate

## Why This Happens

Strapi requires content types to be registered in the admin panel. Even though the schema file exists, Strapi needs to:
1. Load the schema into its database
2. Register the routes
3. Set up permissions

The bootstrap script sets permissions, but the content type itself must be registered in admin.

## After Fixing

Once the content type is registered:
- ✅ GET `/api/sales` will return data (empty array if no entries)
- ✅ POST `/api/sales` will create new entries
- ✅ PUT `/api/sales/:id` will update entries
- ✅ DELETE `/api/sales/:id` will delete entries

