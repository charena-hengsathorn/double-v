/**
 * Script to manually set public permissions for all content types
 * Run this when Strapi is running to configure permissions programmatically
 * 
 * Usage (in Strapi console or via Strapi CLI):
 * node scripts/set-public-permissions.js
 */

const strapi = require('@strapi/strapi');

async function setPublicPermissions() {
  try {
    console.log('🚀 Starting Strapi to set public permissions...');
    
    const app = await strapi({ distDir: './dist' }).load();
    
    console.log('📋 Fetching public role...');
    const publicRole = await app
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) {
      console.error('❌ Public role not found!');
      await app.destroy();
      process.exit(1);
    }

    console.log(`✅ Found public role (ID: ${publicRole.id})`);

    const contentTypes = [
      { uid: 'api::client.client', name: 'client' },
      { uid: 'api::project.project', name: 'project' },
      { uid: 'api::pipeline-deal.pipeline-deal', name: 'pipeline-deal' },
      { uid: 'api::deal-milestone.deal-milestone', name: 'deal-milestone' },
      { uid: 'api::forecast-snapshot.forecast-snapshot', name: 'forecast-snapshot' },
      { uid: 'api::billing.billing', name: 'billing' },
      { uid: 'api::risk-flag.risk-flag', name: 'risk-flag' },
      { uid: 'api::user-profile.user-profile', name: 'user-profile' },
      { uid: 'api::sale.sale', name: 'sales' },
    ];

    console.log(`\n📝 Configuring permissions for ${contentTypes.length} content types...`);

    let totalUpdated = 0;
    let totalCreated = 0;

    for (const contentType of contentTypes) {
      const actions = ['find', 'findOne', 'create', 'update', 'delete'];
      
      for (const action of actions) {
        const actionName = `${contentType.uid}.${action}`;
        
        try {
          // Check if permission already exists
          const existing = await app
            .query('plugin::users-permissions.permission')
            .findOne({
              where: {
                action: actionName,
                role: publicRole.id,
              },
            });

          if (existing) {
            // Update existing permission to enable it
            if (!existing.enabled) {
              await app
                .query('plugin::users-permissions.permission')
                .update({
                  where: { id: existing.id },
                  data: { enabled: true },
                });
              console.log(`  ✅ Updated: ${contentType.name}.${action}`);
              totalUpdated++;
            } else {
              console.log(`  ⏭️  Already enabled: ${contentType.name}.${action}`);
            }
          } else {
            // Create new permission and enable it
            await app
              .query('plugin::users-permissions.permission')
              .create({
                data: {
                  action: actionName,
                  role: publicRole.id,
                  enabled: true,
                },
              });
            console.log(`  ✅ Created: ${contentType.name}.${action}`);
            totalCreated++;
          }
        } catch (error) {
          console.error(`  ❌ Error setting ${contentType.name}.${action}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Permissions configuration complete!`);
    console.log(`   - Created: ${totalCreated} permissions`);
    console.log(`   - Updated: ${totalUpdated} permissions`);
    console.log(`\n🎯 Public API endpoints should now be accessible without authentication.`);

    await app.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setPublicPermissions();

