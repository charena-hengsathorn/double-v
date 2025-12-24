export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Set up public permissions for all content types
    // This allows API access without authentication for development
    // NOTE: You don't need to manually edit permissions in admin panel - this script handles it automatically
    try {
      console.log('🔧 Setting up public permissions for content types...');
      
      // Wait for Strapi to be fully initialized
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify content types are loaded
      const loadedContentTypes = strapi.contentTypes;
      console.log(`📋 Found ${Object.keys(loadedContentTypes).length} content types in Strapi`);
      
      // Check if sale content type exists
      if (loadedContentTypes['api::sale.sale']) {
        console.log('✅ Sale content type is loaded');
      } else {
        console.log('⚠️  Sale content type not found in Strapi contentTypes');
      }
      
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (!publicRole) {
        console.log('⚠️  Public role not found, skipping permission setup');
        return;
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
        // Branch-specific content types
        { uid: 'api::construction-sale.construction-sale', name: 'construction-sale' },
        { uid: 'api::construction-billing.construction-billing', name: 'construction-billing' },
        { uid: 'api::loose-furniture-sale.loose-furniture-sale', name: 'loose-furniture-sale' },
        { uid: 'api::loose-furniture-billing.loose-furniture-billing', name: 'loose-furniture-billing' },
        { uid: 'api::interior-design-sale.interior-design-sale', name: 'interior-design-sale' },
        { uid: 'api::interior-design-billing.interior-design-billing', name: 'interior-design-billing' },
      ];

      let totalConfigured = 0;
      let totalErrors = 0;

      for (const contentType of contentTypes) {
        const actions = ['find', 'findOne', 'create', 'update', 'delete'];
        
        for (const action of actions) {
          const actionName = `${contentType.uid}.${action}`;
          
          try {
            // Check if permission already exists
            const existing = await strapi
              .query('plugin::users-permissions.permission')
              .findOne({
                where: {
                  action: actionName,
                  role: publicRole.id,
                },
              });

            if (existing) {
              // Always update to ensure it's enabled
              await strapi
                .query('plugin::users-permissions.permission')
                .update({
                  where: { id: existing.id },
                  data: { enabled: true },
                });
              if (!existing.enabled) {
                totalConfigured++;
                console.log(`  ✅ Enabled: ${contentType.name}.${action}`);
              }
            } else {
              // Create new permission and enable it
              await strapi
                .query('plugin::users-permissions.permission')
                .create({
                  data: {
                    action: actionName,
                    role: publicRole.id,
                    enabled: true,
                  },
                });
              totalConfigured++;
              console.log(`  ✅ Created: ${contentType.name}.${action}`);
            }
          } catch (error: any) {
            totalErrors++;
            console.error(`  ❌ Error setting ${contentType.name}.${action}:`, error?.message || error);
          }
        }
      }

      if (totalConfigured > 0) {
        console.log(`✅ Public permissions configured: ${totalConfigured} permissions enabled/created`);
      } else {
        console.log('ℹ️  All public permissions already configured');
      }
      
      if (totalErrors > 0) {
        console.log(`⚠️  Encountered ${totalErrors} errors while setting permissions`);
      }

      console.log('✅ All API endpoints are now publicly accessible (no auth required)');
      console.log('💡 You do NOT need to manually edit permissions in the admin panel');
    } catch (error: any) {
      console.error('❌ Error setting up public permissions:', error?.message || error);
      console.error('   Full error:', error);
    }
  },
};
