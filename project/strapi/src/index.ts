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
      console.log('🔧 Setting up API permissions for content types (public + authenticated)...');
      
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
      const authenticatedRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'authenticated' } });

      if (!publicRole) {
        console.log('⚠️  Public role not found, skipping permission setup');
        return;
      }

      console.log(`✅ Found public role (ID: ${publicRole.id})`);
      if (authenticatedRole) {
        console.log(`✅ Found authenticated role (ID: ${authenticatedRole.id})`);
      } else {
        console.log('⚠️  Authenticated role not found; only public permissions will be set');
      }

      const rolesToConfigure = [publicRole, ...(authenticatedRole ? [authenticatedRole] : [])];

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

      for (const role of rolesToConfigure) {
        const roleLabel = role.type === 'public' ? 'public' : 'authenticated';
        for (const contentType of contentTypes) {
          const actions = ['find', 'findOne', 'create', 'update', 'delete'];

          for (const action of actions) {
            const actionName = `${contentType.uid}.${action}`;

            try {
              const existing = await strapi
                .query('plugin::users-permissions.permission')
                .findOne({
                  where: {
                    action: actionName,
                    role: role.id,
                  },
                });

              if (existing) {
                await strapi
                  .query('plugin::users-permissions.permission')
                  .update({
                    where: { id: existing.id },
                    data: { enabled: true },
                  });
                if (!existing.enabled) {
                  totalConfigured++;
                  console.log(`  ✅ Enabled [${roleLabel}]: ${contentType.name}.${action}`);
                }
              } else {
                await strapi
                  .query('plugin::users-permissions.permission')
                  .create({
                    data: {
                      action: actionName,
                      role: role.id,
                      enabled: true,
                    },
                  });
                totalConfigured++;
                console.log(`  ✅ Created [${roleLabel}]: ${contentType.name}.${action}`);
              }
            } catch (error: any) {
              totalErrors++;
              console.error(
                `  ❌ Error setting [${roleLabel}] ${contentType.name}.${action}:`,
                error?.message || error
              );
            }
          }
        }
      }

      if (totalConfigured > 0) {
        console.log(`✅ Permissions configured: ${totalConfigured} enabled/created`);
      } else {
        console.log('ℹ️  All permissions already configured');
      }
      
      if (totalErrors > 0) {
        console.log(`⚠️  Encountered ${totalErrors} errors while setting permissions`);
      }

      console.log('✅ API permissions configured for both public and authenticated roles');
      console.log('💡 You do NOT need to manually edit permissions in the admin panel');
    } catch (error: any) {
      console.error('❌ Error setting up public permissions:', error?.message || error);
      console.error('   Full error:', error);
    }
  },
};
