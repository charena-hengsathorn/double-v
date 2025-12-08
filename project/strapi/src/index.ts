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
    try {
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (publicRole) {
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

        for (const contentType of contentTypes) {
          const actions = ['find', 'findOne', 'create', 'update', 'delete'];
          
          for (const action of actions) {
            const actionName = `${contentType.uid}.${action}`;
            
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
              // Update existing permission to enable it
              await strapi
                .query('plugin::users-permissions.permission')
                .update({
                  where: { id: existing.id },
                  data: { enabled: true },
                });
            } else {
              // Create new permission and enable it
              await strapi
                .query('plugin::users-permissions.permission')
                .create({
                  data: {
                    action: actionName,
                    role: publicRole.id,
                    enabled: true, // Enable the permission
                  },
                });
            }
          }
        }

        console.log('✅ Public permissions configured for all content types');
      }
    } catch (error: any) {
      // Permissions might already be set, or this is first run
      console.log('ℹ️  Permissions setup:', error?.message || 'Skipped (may already be configured)');
    }
  },
};
