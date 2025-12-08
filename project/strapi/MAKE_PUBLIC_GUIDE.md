# How to Make Strapi Public

This guide shows you how to make Strapi content types publicly accessible (without authentication).

## What "Making Strapi Public" Means

There are different levels of making Strapi public:

1. **Read-only public access** - Anyone can read/view content (GET requests)
2. **Full public access** - Anyone can create, update, delete content (all CRUD operations)
3. **Public with restrictions** - Public read, authenticated write

## Method 1: Using Strapi Admin Panel (Recommended) 🎯

This is the easiest way to configure public access:

### Step 1: Access Strapi Admin Panel

1. Start Strapi:
   ```bash
   cd project/strapi
   npm run develop
   ```

2. Open admin panel: `http://localhost:1337/admin`

3. Login with your admin credentials

### Step 2: Configure Public Role Permissions

1. Go to **Settings** → **Users & Permissions Plugin** → **Roles**

2. Click on **Public** role (the default public role)

3. For each content type you want to make public:
   - Expand the content type (e.g., "Sales", "Clients", etc.)
   - Check the permissions you want:
     - ✅ **find** - Allow public to list/get all items
     - ✅ **findOne** - Allow public to get a single item
     - ✅ **create** - Allow public to create items (optional)
     - ✅ **update** - Allow public to update items (optional)
     - ✅ **delete** - Allow public to delete items (optional)

4. Click **Save** button

### Step 3: Verify Public Access

Test public access (without authentication):

```bash
# Should work without Authorization header
curl http://localhost:1337/api/sales
curl http://localhost:1337/api/clients
```

## Method 2: Using Strapi Bootstrap Files (Programmatic) 📝

You can also configure permissions programmatically in bootstrap files.

### Create Bootstrap File

Create or edit: `project/strapi/src/index.ts`

```typescript
export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  async bootstrap({ strapi }) {
    // Make sales content type public for reading
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (publicRole) {
      // Update permissions for Sales content type
      await strapi
        .query('plugin::users-permissions.permission')
        .updateMany({
          where: {
            role: publicRole.id,
            action: {
              $in: ['api::sale.sale.find', 'api::sale.sale.findOne'],
            },
          },
          data: {
            enabled: true,
          },
        });
    }
  },
};
```

## Method 3: Configure CORS (Already Done) ✅

Your Strapi is already configured for CORS in `config/middlewares.ts`:

```typescript
{
  name: 'strapi::cors',
  config: {
    enabled: true,
    origin: ['http://localhost:3000', 'http://localhost:8000', '*'],
    headers: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With'],
  },
}
```

This allows requests from your frontend and other services.

## Common Scenarios

### Scenario 1: Public Read-Only Access

**Use case**: Anyone can view content, but only authenticated users can modify.

**Steps**:
1. Go to Settings → Roles → Public
2. Enable only:
   - ✅ `find` (list all)
   - ✅ `findOne` (get single item)
3. Leave create/update/delete unchecked

### Scenario 2: Fully Public API

**Use case**: Complete public access (be careful with this!)

**Steps**:
1. Go to Settings → Roles → Public
2. Enable all permissions:
   - ✅ `find`
   - ✅ `findOne`
   - ✅ `create`
   - ✅ `update`
   - ✅ `delete`

### Scenario 3: Public Read, Authenticated Write

**Use case**: Public can read, authenticated users can write.

**Steps**:
1. Configure Public role for read-only (as in Scenario 1)
2. Configure Authenticated role for full access:
   - Go to Settings → Roles → Authenticated
   - Enable all permissions for content types

## Content Types to Make Public

Based on your project, you might want to make these public:

- **Sales** (`api::sale.sale`) - For viewing sales data
- **Clients** (`api::client.client`) - For viewing client list
- **Pipeline Deals** (`api::pipeline-deal.pipeline-deal`) - For viewing deals
- **Projects** (`api::project.project`) - For viewing projects

## Testing Public Access

### Test Without Authentication

```bash
# Should work without Authorization header if public
curl http://localhost:1337/api/sales

# Should return data (or empty array if no data)
```

### Test With Authentication (Still Works)

```bash
# Works with or without auth when public
curl http://localhost:1337/api/sales \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Considerations ⚠️

### Before Making Content Public:

1. **Review sensitive data**:
   - Don't make content types with sensitive info public
   - Consider what data is exposed

2. **Use read-only public access**:
   - Prefer read-only (find, findOne) over full access
   - Only allow create/update/delete if absolutely necessary

3. **Monitor usage**:
   - Public APIs can be abused
   - Consider rate limiting

4. **Use API tokens for better control**:
   - Instead of making everything public, use API tokens
   - More granular control over access

## Using API Tokens (Alternative to Public Access)

Instead of making content types public, you can use API tokens:

### Create API Token

1. Go to Settings → API Tokens
2. Click **Create new API Token**
3. Set:
   - Name: "Frontend API Token"
   - Token type: "Read-only" or "Full access"
   - Token duration: "Unlimited" or set expiry
4. Copy the generated token

### Use API Token

```bash
curl http://localhost:1337/api/sales \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Quick Setup Script

Here's a quick script to check current permissions:

```bash
# Check if Strapi is running
curl http://localhost:1337/api/sales

# If 403 Forbidden, content is not public
# If 200 OK (even with empty data), content is public
```

## Troubleshooting

### Issue: Still Getting 403 Forbidden

**Solution**:
1. Check if you configured the Public role correctly
2. Restart Strapi after changing permissions
3. Clear browser cache
4. Check CORS settings

### Issue: CORS Errors

**Solution**:
- Already configured in `config/middlewares.ts`
- Verify your frontend URL is in the `origin` array

### Issue: Can't Access Admin Panel

**Solution**:
- Admin panel requires authentication (always)
- Only content API can be made public
- Admin panel is separate from content API

## Recommended Approach for Your Project

For the Double V project, I recommend:

1. **Public read access** for:
   - Sales (viewing sales data)
   - Clients (viewing client list)
   - Pipeline Deals (viewing deals)

2. **Authenticated write access** for:
   - All create/update/delete operations
   - This protects data integrity

3. **Use API tokens** for:
   - Frontend to backend communication
   - More control than full public access

## Steps to Implement

1. ✅ Start Strapi: `cd project/strapi && npm run develop`
2. ✅ Open admin: `http://localhost:1337/admin`
3. ✅ Go to Settings → Roles → Public
4. ✅ Enable `find` and `findOne` for content types you want public
5. ✅ Save and test

## Additional Resources

- [Strapi Permissions Documentation](https://docs.strapi.io/dev-docs/plugins/users-permissions)
- [Strapi Roles Documentation](https://docs.strapi.io/dev-docs/backend-customization/models#lifecycle-hooks)
- See `docs/strapi-setup-guide.md` for more setup information

