# Quick Guide: Make Strapi Public

## 🚀 Fastest Way (Using Admin Panel)

### Step 1: Open Strapi Admin

```bash
# Make sure Strapi is running
cd project/strapi
npm run develop
```

Open: **http://localhost:1337/admin**

### Step 2: Configure Public Permissions

1. Go to: **Settings** (gear icon at bottom left)
2. Click: **Users & Permissions Plugin**
3. Click: **Roles** tab
4. Click: **Public** role

### Step 3: Enable Permissions

Scroll down to **Permissions** section. For each content type you want to make public:

**Find the content types:**
- `sale` (or `sales`)
- `client`
- `pipeline-deal`
- `project`
- etc.

**Check these boxes for each:**
- ✅ `find` - Allow public to list items
- ✅ `findOne` - Allow public to get single item
- ✅ `create` - Allow public to create items (optional)
- ✅ `update` - Allow public to update items (optional)
- ✅ `delete` - Allow public to delete items (optional)

**For read-only public access, check only:**
- ✅ `find`
- ✅ `findOne`

### Step 4: Save

Click the **Save** button at the top right.

### Step 5: Test

```bash
# Should work without authentication now
curl http://localhost:1337/api/sales
```

## ⚡ Automatic Method (Bootstrap Script)

The bootstrap script in `src/index.ts` will automatically enable public permissions on Strapi restart.

**To use it:**

1. The script is already in place
2. Restart Strapi:
   ```bash
   cd project/strapi
   npm run develop
   ```
3. Check console for: `✅ Public permissions configured for all content types`

## 📋 What Gets Made Public

When you make Strapi public, these endpoints become accessible without authentication:

- `GET /api/sales` - List all sales
- `GET /api/sales/:id` - Get single sale
- `POST /api/sales` - Create sale (if enabled)
- `PUT /api/sales/:id` - Update sale (if enabled)
- `DELETE /api/sales/:id` - Delete sale (if enabled)

Same for all other content types.

## 🔒 Security Considerations

### Read-Only Public (Recommended)

Only enable:
- ✅ `find`
- ✅ `findOne`

This allows viewing data but prevents modifications.

### Fully Public (Use with Caution)

Enabling all permissions allows anyone to:
- Create new records
- Update existing records
- Delete records

⚠️ **Only use in development or if you really need it!**

## 🎯 Recommended Setup

For the Double V project:

1. **Public Read Access**:
   - Enable `find` and `findOne` for:
     - Sales
     - Clients
     - Pipeline Deals
     - Projects

2. **Authenticated Write Access**:
   - Keep create/update/delete for Authenticated role only
   - This protects your data

## 🐛 Troubleshooting

### Still Getting 403 Forbidden?

1. **Check permissions are saved**:
   - Make sure you clicked "Save" button
   - Refresh the admin page

2. **Restart Strapi**:
   ```bash
   # Stop Strapi (Ctrl+C)
   # Start again
   npm run develop
   ```

3. **Clear browser cache**:
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Can't Find Content Types in Permissions?

1. **Content types might not be registered**:
   - Check Strapi console for errors
   - Restart Strapi to register content types

2. **Check content type name**:
   - Look in `src/api/` for content type folders
   - Name in permissions matches folder name

## 📚 More Information

- See `MAKE_PUBLIC_GUIDE.md` for detailed guide
- See `strapi-quick-setup.md` in docs folder

## ✅ Quick Checklist

- [ ] Strapi is running
- [ ] Opened admin panel at http://localhost:1337/admin
- [ ] Went to Settings → Roles → Public
- [ ] Enabled permissions for content types
- [ ] Clicked Save button
- [ ] Tested with `curl http://localhost:1337/api/sales`

Done! Strapi is now public. 🎉

