import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { BUILD_TIME, GIT_COMMIT_MSG } from '@/lib/buildInfo';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Read package.json for version info
let packageInfo = { version: 'N/A', dependencies: {} };
try {
  const packagePath = join(process.cwd(), 'package.json');
  const packageFile = readFileSync(packagePath, 'utf8');
  packageInfo = JSON.parse(packageFile);
} catch (error) {
  console.error('Error reading package.json:', error);
}

export async function GET() {
  const health = {
    timestamp: new Date().toISOString(),
    buildTime: BUILD_TIME || null,
    gitCommitMsg: GIT_COMMIT_MSG || null,
    version: {
      app: packageInfo.version || 'N/A',
      nextjs: packageInfo.dependencies?.next?.replace('^', '').replace('~', '') || 'N/A',
      node: process.env.NODE_ENV || 'development'
    },
    services: {},
    database: {},
    errors: []
  };

  // Test Supabase connection
  try {
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('packages')
        .select('id')
        .limit(1);
      const responseTime = Date.now() - startTime;
      
      health.services.supabase = {
        status: error ? 'error' : 'healthy',
        message: error ? error.message : 'Connected',
        responseTime
      };
    } else {
      health.services.supabase = {
        status: 'error',
        message: 'Missing environment variables',
        responseTime: 0
      };
    }
  } catch (error) {
    health.services.supabase = {
      status: 'error',
      message: error.message || 'Connection failed',
      responseTime: 0
    };
  }

  // Test webhook endpoint
  try {
    const webhookUrl = 'https://build.goproxe.com/webhook/turquoise-website-enquiry';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const startTime = Date.now();
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    health.services.webhook = {
      status: response.ok ? 'healthy' : 'error',
      message: response.ok ? 'Endpoint reachable' : `HTTP ${response.status}`,
      responseTime
    };
  } catch (error) {
    health.services.webhook = {
      status: 'error',
      message: error.name === 'AbortError' ? 'Timeout' : error.message || 'Connection failed',
      responseTime: 0
    };
  }

  // Get database stats
  try {
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Get counts
      const [packagesResult, destinationsResult, inquiriesResult] = await Promise.all([
        supabase.from('packages').select('id', { count: 'exact', head: true }),
        supabase.from('destinations').select('id', { count: 'exact', head: true }),
        supabase.from('inquiries').select('id, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(1)
      ]);

      health.database = {
        packages: packagesResult.count || 0,
        destinations: destinationsResult.count || 0,
        inquiries: inquiriesResult.count || 0,
        lastInquiry: inquiriesResult.data?.[0]?.created_at || null
      };
    }
  } catch (error) {
    health.database = {
      error: error.message || 'Failed to fetch database stats'
    };
  }

  return Response.json(health);
}
