// Script to check how many packages are in Supabase
// Usage: node scripts/check-packages.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPackages() {
  try {
    console.log('📊 Checking Supabase database...\n');

    // Count all packages
    const { count: totalCount, error: countError } = await supabase
      .from('packages')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting packages:', countError.message);
      return;
    }

    // Count active packages
    const { count: activeCount, error: activeError } = await supabase
      .from('packages')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (activeError) {
      console.error('Error counting active packages:', activeError.message);
      return;
    }

    // Count destinations
    const { count: destCount, error: destError } = await supabase
      .from('destinations')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (destError) {
      console.error('Error counting destinations:', destError.message);
      return;
    }

    // Get sample packages
    const { data: samplePackages, error: sampleError } = await supabase
      .from('packages')
      .select('id, title, slug, is_active')
      .limit(5);

    console.log('📦 Package Statistics:');
    console.log(`   Total packages: ${totalCount || 0}`);
    console.log(`   Active packages: ${activeCount || 0}`);
    console.log(`   Inactive packages: ${(totalCount || 0) - (activeCount || 0)}`);
    console.log(`\n📍 Active destinations: ${destCount || 0}`);

    if (samplePackages && samplePackages.length > 0) {
      console.log('\n📋 Sample packages:');
      samplePackages.forEach((pkg, index) => {
        console.log(`   ${index + 1}. ${pkg.title} (${pkg.is_active ? 'Active' : 'Inactive'})`);
      });
    } else {
      console.log('\n⚠️  No packages found in database');
      console.log('   Run "npm run seed" to add sample packages');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPackages();

