import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: { '/admin/setup': ['./supabase/SETUP_ALL.sql'], '/admin/setup/sql': ['./supabase/SETUP_ALL.sql'] },
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
};
export default config;
