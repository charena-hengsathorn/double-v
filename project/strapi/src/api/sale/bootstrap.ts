/**
 * Bootstrap function for Sale content type
 * This ensures the content type is properly registered
 */

export default {
  register({ strapi }: { strapi: any }) {
    // Content type is auto-registered from schema.json
    // This bootstrap ensures it's available
  },

  async bootstrap({ strapi }: { strapi: any }) {
    // Verify the content type is registered
    const contentType = strapi.contentTypes['api::sale.sale'];
    if (contentType) {
      console.log('✅ Sales content type registered');
    } else {
      console.log('⚠️  Sales content type not found - may need manual registration in admin');
    }
  },
};

