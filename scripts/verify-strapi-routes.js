/**
 * Script to verify Strapi content types and routes
 * Run: cd project/strapi && node ../../scripts/verify-strapi-routes.js
 */

const fs = require('fs');
const path = require('path');

const strapiDir = path.join(__dirname, '../project/strapi');
const apiDir = path.join(strapiDir, 'src/api');

console.log('🔍 Verifying Strapi Content Types...\n');

// Check all content types
const contentTypes = fs.readdirSync(apiDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`Found ${contentTypes.length} content types:\n`);

contentTypes.forEach(type => {
  const typeDir = path.join(apiDir, type);
  const schemaPath = path.join(typeDir, 'content-types', type, 'schema.json');
  const controllerPath = path.join(typeDir, 'controllers', `${type}.ts`);
  const servicePath = path.join(typeDir, 'services', `${type}.ts`);
  
  // Try alternative paths
  const altControllerPath = path.join(typeDir, 'controllers', `${type.replace('-', '')}.ts`);
  const altServicePath = path.join(typeDir, 'services', `${type.replace('-', '')}.ts`);
  
  const hasSchema = fs.existsSync(schemaPath);
  const hasController = fs.existsSync(controllerPath) || fs.existsSync(altControllerPath);
  const hasService = fs.existsSync(servicePath) || fs.existsSync(altServicePath);
  
  if (hasSchema) {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const pluralName = schema.info?.pluralName || 'unknown';
    const uid = `api::${schema.info?.singularName || type}.${schema.info?.singularName || type}`;
    
    console.log(`📦 ${type} (${pluralName})`);
    console.log(`   UID: ${uid}`);
    console.log(`   Schema: ${hasSchema ? '✅' : '❌'}`);
    console.log(`   Controller: ${hasController ? '✅' : '❌'}`);
    console.log(`   Service: ${hasService ? '✅' : '❌'}`);
    
    if (!hasController || !hasService) {
      console.log(`   ⚠️  Missing files - routes may not be generated`);
    }
    console.log('');
  }
});

console.log('\n💡 If all files are ✅, routes should be auto-generated.');
console.log('   If routes still don\'t work, check Strapi console for errors.');

