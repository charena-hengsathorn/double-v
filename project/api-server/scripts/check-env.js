#!/usr/bin/env node

/**
 * Script to check if environment variables are loaded in the API server
 * Run from project/api-server directory
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking API Server Environment Variables\n');
console.log('==========================================\n');

// Change to API server directory
process.chdir(__dirname + '/..');

// Check which env file exists
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), 'env.example');

let envFile = null;
if (fs.existsSync(envLocalPath)) {
  envFile = '.env.local';
  console.log('✅ Found: .env.local');
} else if (fs.existsSync(envPath)) {
  envFile = '.env';
  console.log('✅ Found: .env');
} else {
  console.log('❌ No .env.local or .env file found');
  if (fs.existsSync(envExamplePath)) {
    console.log('💡 Tip: Copy env.example to .env.local');
    console.log('   cp env.example .env.local');
  }
  process.exit(1);
}

console.log('');

// Load environment variables
require('dotenv').config({ path: envFile });
require('dotenv').config(); // Also try .env as fallback

// Expected environment variables
const expectedVars = [
  { name: 'PORT', required: false, default: '4000' },
  { name: 'NODE_ENV', required: false, default: 'development' },
  { name: 'STRAPI_URL', required: true },
  { name: 'PREDICTIVE_SERVICE_URL', required: true },
  { name: 'CORS_ORIGINS', required: false, default: 'http://localhost:3000' },
];

console.log('📋 Environment Variables Status:\n');

let allGood = true;

expectedVars.forEach(({ name, required, default: defaultValue }) => {
  const value = process.env[name];
  const isSet = !!value;
  
  if (required && !isSet) {
    console.log(`❌ ${name}: NOT SET (required)`);
    allGood = false;
  } else if (isSet) {
    // Mask sensitive values
    let displayValue = value;
    if (value.length > 60) {
      displayValue = value.substring(0, 57) + '...';
    }
    
    console.log(`✅ ${name}: ${displayValue}`);
  } else {
    const defaultMsg = defaultValue ? ` (default: ${defaultValue})` : '';
    console.log(`⚠️  ${name}: Not set${defaultMsg}`);
  }
});

console.log('');

// Show all loaded env vars (non-sensitive)
console.log('📦 All Environment Variables:\n');

const loadedVars = Object.keys(process.env)
  .filter(key => 
    key.startsWith('STRAPI_') || 
    key.startsWith('PREDICTIVE_') || 
    key.startsWith('CORS_') ||
    key === 'PORT' ||
    key === 'NODE_ENV' ||
    key === 'LOG_LEVEL'
  )
  .sort();

if (loadedVars.length > 0) {
  loadedVars.forEach(key => {
    const value = process.env[key] || '';
    let displayValue = value;
    
    if (value.length > 60) {
      displayValue = value.substring(0, 57) + '...';
    }
    
    console.log(`   ${key}=${displayValue}`);
  });
} else {
  console.log('   (No matching variables found)');
}

console.log('\n==========================================\n');

if (allGood) {
  console.log('✅ All required environment variables are set!');
  console.log('\n💡 To verify at runtime:');
  console.log('   1. Start the server: npm run dev');
  console.log('   2. Visit: http://localhost:4000/health/env');
  console.log('   3. Or check console output when server starts');
} else {
  console.log('❌ Some required environment variables are missing!');
  console.log('\n💡 Fix by editing .env.local file');
  process.exit(1);
}


