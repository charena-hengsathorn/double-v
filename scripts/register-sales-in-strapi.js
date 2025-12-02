/**
 * Script to register Sales content type in Strapi via admin API
 * Run this after Strapi is started and you have admin access
 * 
 * Usage: node scripts/register-sales-in-strapi.js
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

async function registerSalesContentType() {
  console.log('📦 Registering Sales Content Type in Strapi');
  console.log('==========================================\n');

  // Note: Strapi doesn't have a public API to create content types programmatically
  // Content types must be created through the admin UI
  // This script provides instructions instead

  console.log('⚠️  Strapi requires content types to be created through the admin UI.');
  console.log('The schema file exists, but it needs to be registered in the database.\n');
  
  console.log('📋 Manual Steps Required:');
  console.log('========================\n');
  
  console.log('1. Open Strapi Admin:');
  console.log(`   ${STRAPI_URL}/admin\n`);
  
  console.log('2. Go to Content-Type Builder (left sidebar)\n');
  
  console.log('3. Click "Create new collection type"\n');
  
  console.log('4. Enter:');
  console.log('   - Display name: Sales');
  console.log('   - API ID (singular): sale');
  console.log('   - API ID (plural): sales');
  console.log('   - Click "Continue"\n');
  
  console.log('5. Add Fields (click "Add another field" for each):');
  console.log('   a. client');
  console.log('      - Type: Text');
  console.log('      - Required: Yes');
  console.log('');
  console.log('   b. sale_amount');
  console.log('      - Type: Number');
  console.log('      - Format: Decimal');
  console.log('      - Required: Yes');
  console.log('');
  console.log('   c. construction_cost');
  console.log('      - Type: Number');
  console.log('      - Format: Decimal');
  console.log('      - Required: Yes');
  console.log('');
  console.log('   d. project_profit');
  console.log('      - Type: Number');
  console.log('      - Format: Decimal');
  console.log('      - Required: Yes');
  console.log('');
  console.log('   e. status');
  console.log('      - Type: Enumeration');
  console.log('      - Values: Confirmed, Pending, Closed');
  console.log('      - Default value: Pending');
  console.log('      - Required: Yes');
  console.log('');
  console.log('   f. notes');
  console.log('      - Type: Long text');
  console.log('      - Required: No');
  console.log('');
  console.log('6. Click "Save"\n');
  
  console.log('7. Set Permissions:');
  console.log('   - Go to Settings → Users & Permissions → Roles');
  console.log('   - Click "Public" role');
  console.log('   - Scroll to "Sales" section');
  console.log('   - Enable: find, findOne, create, update, delete');
  console.log('   - Click "Save"\n');
  
  console.log('8. Restart Strapi (if needed)\n');
  
  console.log('9. Test:');
  console.log(`   curl ${STRAPI_URL}/api/sales\n`);
  
  console.log('✅ After completing these steps, the Sales content type will be available!');
}

registerSalesContentType().catch(console.error);

