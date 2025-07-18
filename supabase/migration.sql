-- Migration from old schema to new schema
-- This migrates existing projects (which were single APIs) to the new structure
-- where projects are folders containing multiple endpoints

BEGIN;

-- Step 1: Create new tables and types
CREATE TYPE endpoint_status AS ENUM ('active', 'inactive', 'expired');

-- Update project_status enum to remove 'expired' (projects don't expire, endpoints do)
ALTER TYPE project_status RENAME TO project_status_old;
CREATE TYPE project_status AS ENUM ('active', 'inactive', 'archived');

-- Create new endpoints table
CREATE TABLE public.endpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  interface_code TEXT NOT NULL,
  endpoint_id TEXT NOT NULL UNIQUE,
  http_method http_method NOT NULL DEFAULT 'GET',
  expected_status_codes INTEGER[] NOT NULL DEFAULT '{200}',
  expires_at TIMESTAMPTZ NOT NULL,
  status endpoint_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT endpoints_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 255),
  CONSTRAINT endpoints_interface_code_check CHECK (char_length(interface_code) >= 10),
  CONSTRAINT endpoints_endpoint_id_check CHECK (char_length(endpoint_id) >= 10 AND char_length(endpoint_id) <= 50)
);

-- Step 2: Migrate existing projects data
-- For each existing project, create a corresponding endpoint
INSERT INTO public.endpoints (
  project_id,
  name,
  description,
  interface_code,
  endpoint_id,
  http_method,
  expected_status_codes,
  expires_at,
  status,
  created_at,
  updated_at
)
SELECT 
  id as project_id,
  name || ' API' as name,  -- Give endpoint a default name
  'Migrated from original project' as description,
  interface_code,
  endpoint_id,
  http_method,
  expected_status_codes,
  expires_at,
  CASE 
    WHEN status::text = 'expired' THEN 'expired'::endpoint_status
    WHEN status::text = 'inactive' THEN 'inactive'::endpoint_status
    ELSE 'active'::endpoint_status
  END as status,
  created_at,
  updated_at
FROM public.projects;

-- Step 3: Update projects table structure
-- Remove columns that are now in endpoints table
ALTER TABLE public.projects DROP COLUMN interface_code;
ALTER TABLE public.projects DROP COLUMN endpoint_id;
ALTER TABLE public.projects DROP COLUMN http_method;
ALTER TABLE public.projects DROP COLUMN expected_status_codes;
ALTER TABLE public.projects DROP COLUMN expires_at;

-- Update status column to use new enum
ALTER TABLE public.projects ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.projects ALTER COLUMN status TYPE project_status USING 
  CASE 
    WHEN status::text = 'expired' THEN 'archived'::project_status
    WHEN status::text = 'inactive' THEN 'inactive'::project_status
    ELSE 'active'::project_status
  END;
ALTER TABLE public.projects ALTER COLUMN status SET DEFAULT 'active';

-- Drop old enum
DROP TYPE project_status_old;

-- Step 4: Update API usage logs to reference endpoints
-- Add endpoint_id column to api_usage_logs
ALTER TABLE public.api_usage_logs ADD COLUMN endpoint_uuid UUID;

-- Populate endpoint_uuid from the migrated endpoints
UPDATE public.api_usage_logs 
SET endpoint_uuid = e.id
FROM public.endpoints e
WHERE e.project_id = api_usage_logs.project_id;

-- Make endpoint_uuid NOT NULL and add foreign key
ALTER TABLE public.api_usage_logs ALTER COLUMN endpoint_uuid SET NOT NULL;
ALTER TABLE public.api_usage_logs ADD CONSTRAINT fk_api_usage_logs_endpoint 
  FOREIGN KEY (endpoint_uuid) REFERENCES public.endpoints(id) ON DELETE CASCADE;

-- Rename column for clarity
ALTER TABLE public.api_usage_logs RENAME COLUMN endpoint_uuid TO endpoint_id;

-- Step 5: Rename project_settings to endpoint_settings and update structure
-- Create new endpoint_settings table
CREATE TABLE public.endpoint_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint_id UUID NOT NULL REFERENCES public.endpoints(id) ON DELETE CASCADE,
  mock_data_count INTEGER DEFAULT 1 CHECK (mock_data_count >= 1 AND mock_data_count <= 100),
  rate_limit_per_minute INTEGER DEFAULT 100 CHECK (rate_limit_per_minute >= 1 AND rate_limit_per_minute <= 1000),
  enable_analytics BOOLEAN DEFAULT TRUE,
  custom_headers JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(endpoint_id)
);

-- Migrate data from project_settings to endpoint_settings
INSERT INTO public.endpoint_settings (
  endpoint_id,
  mock_data_count,
  rate_limit_per_minute,
  enable_analytics,
  custom_headers,
  created_at,
  updated_at
)
SELECT 
  e.id as endpoint_id,
  ps.mock_data_count,
  ps.rate_limit_per_minute,
  ps.enable_analytics,
  ps.custom_headers,
  ps.created_at,
  ps.updated_at
FROM public.project_settings ps
JOIN public.endpoints e ON e.project_id = ps.project_id;

-- Drop old table
DROP TABLE public.project_settings;

-- Step 6: Create new indexes
CREATE INDEX idx_endpoints_project_id ON public.endpoints(project_id);
CREATE INDEX idx_endpoints_endpoint_id ON public.endpoints(endpoint_id);
CREATE INDEX idx_endpoints_status ON public.endpoints(status);
CREATE INDEX idx_endpoints_expires_at ON public.endpoints(expires_at);
CREATE INDEX idx_api_usage_logs_endpoint_id ON public.api_usage_logs(endpoint_id);
CREATE INDEX idx_endpoint_settings_endpoint_id ON public.endpoint_settings(endpoint_id);

-- Remove old indexes that are no longer needed
DROP INDEX IF EXISTS idx_projects_endpoint_id;
DROP INDEX IF EXISTS idx_projects_expires_at;
DROP INDEX IF EXISTS idx_project_settings_project_id;

-- Step 7: Create new triggers
CREATE TRIGGER update_endpoints_updated_at 
  BEFORE UPDATE ON public.endpoints 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_endpoint_settings_updated_at 
  BEFORE UPDATE ON public.endpoint_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Update RLS policies
-- Drop old policies
DROP POLICY IF EXISTS "Anonymous users can read active projects for API generation" ON public.projects;

-- Create new endpoint policies
CREATE POLICY "Users can view own endpoints" ON public.endpoints
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id)
  );

CREATE POLICY "Users can insert own endpoints" ON public.endpoints
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id)
  );

CREATE POLICY "Users can update own endpoints" ON public.endpoints
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id)
  );

CREATE POLICY "Users can delete own endpoints" ON public.endpoints
  FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id)
  );

-- Allow anonymous access to active endpoints for mock API generation
CREATE POLICY "Anonymous users can read active endpoints for API generation" ON public.endpoints
  FOR SELECT USING (status = 'active' AND expires_at > NOW());

-- Endpoint settings policies
CREATE POLICY "Users can view own endpoint settings" ON public.endpoint_settings
  FOR SELECT USING (
    auth.uid() = (SELECT p.user_id FROM public.projects p 
                   JOIN public.endpoints e ON e.project_id = p.id 
                   WHERE e.id = endpoint_id)
  );

CREATE POLICY "Users can insert own endpoint settings" ON public.endpoint_settings
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT p.user_id FROM public.projects p 
                   JOIN public.endpoints e ON e.project_id = p.id 
                   WHERE e.id = endpoint_id)
  );

CREATE POLICY "Users can update own endpoint settings" ON public.endpoint_settings
  FOR UPDATE USING (
    auth.uid() = (SELECT p.user_id FROM public.projects p 
                   JOIN public.endpoints e ON e.project_id = p.id 
                   WHERE e.id = endpoint_id)
  );

-- Enable RLS on new tables
ALTER TABLE public.endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endpoint_settings ENABLE ROW LEVEL SECURITY;

-- Step 9: Update utility functions
-- Update function to expire endpoints instead of projects
CREATE OR REPLACE FUNCTION public.update_expired_endpoints()
RETURNS void AS $$
BEGIN
  UPDATE public.endpoints
  SET status = 'expired'
  WHERE expires_at < NOW() AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update function to clean up expired endpoints
CREATE OR REPLACE FUNCTION public.cleanup_expired_endpoints()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.endpoints 
  WHERE status = 'expired' 
    AND expires_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create project stats view
CREATE OR REPLACE VIEW public.project_stats AS
SELECT 
  p.id AS project_id,
  p.user_id,
  p.name AS project_name,
  COUNT(e.id) AS total_endpoints,
  COUNT(CASE WHEN e.status = 'active' AND e.expires_at > NOW() THEN 1 END) AS active_endpoints,
  COUNT(CASE WHEN e.status = 'expired' OR e.expires_at <= NOW() THEN 1 END) AS expired_endpoints,
  COUNT(CASE WHEN e.status = 'inactive' THEN 1 END) AS inactive_endpoints,
  MAX(e.created_at) AS last_endpoint_created,
  p.created_at AS project_created_at,
  p.updated_at AS project_updated_at
FROM public.projects p
LEFT JOIN public.endpoints e ON e.project_id = p.id
WHERE p.status = 'active'
GROUP BY p.id, p.user_id, p.name, p.created_at, p.updated_at;

COMMIT;