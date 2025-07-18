-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE http_method AS ENUM ('GET', 'POST', 'PUT', 'DELETE', 'PATCH');
CREATE TYPE project_status AS ENUM ('active', 'inactive', 'expired');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  interface_code TEXT NOT NULL,
  endpoint_id TEXT NOT NULL UNIQUE, -- Used in URL generation
  http_method http_method NOT NULL DEFAULT 'GET',
  expected_status_codes INTEGER[] NOT NULL DEFAULT '{200}',
  expires_at TIMESTAMPTZ NOT NULL,
  status project_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT projects_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 255),
  CONSTRAINT projects_interface_code_check CHECK (char_length(interface_code) >= 10),
  CONSTRAINT projects_endpoint_id_check CHECK (char_length(endpoint_id) >= 10 AND char_length(endpoint_id) <= 50)
);

-- API usage logs table
CREATE TABLE public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_method TEXT NOT NULL,
  request_path TEXT NOT NULL,
  response_status INTEGER NOT NULL,
  response_time_ms INTEGER,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project settings table for advanced configurations
CREATE TABLE public.project_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  mock_data_count INTEGER DEFAULT 1 CHECK (mock_data_count >= 1 AND mock_data_count <= 100),
  rate_limit_per_minute INTEGER DEFAULT 100 CHECK (rate_limit_per_minute >= 1 AND rate_limit_per_minute <= 1000),
  enable_analytics BOOLEAN DEFAULT TRUE,
  custom_headers JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(project_id)
);

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_endpoint_id ON public.projects(endpoint_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_expires_at ON public.projects(expires_at);
CREATE INDEX idx_api_usage_logs_project_id ON public.api_usage_logs(project_id);
CREATE INDEX idx_api_usage_logs_created_at ON public.api_usage_logs(created_at);
CREATE INDEX idx_project_settings_project_id ON public.project_settings(project_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON public.projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_settings_updated_at 
  BEFORE UPDATE ON public.project_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Allow anonymous access to active projects for mock API generation
CREATE POLICY "Anonymous users can read active projects for API generation" ON public.projects
  FOR SELECT USING (status = 'active' AND expires_at > NOW());

-- API usage logs policies
CREATE POLICY "Users can view own usage logs" ON public.api_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage logs" ON public.api_usage_logs
  FOR INSERT WITH CHECK (true); -- Allow system to log all requests

-- Project settings policies
CREATE POLICY "Users can view own project settings" ON public.project_settings
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id)
  );

CREATE POLICY "Users can insert own project settings" ON public.project_settings
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id)
  );

CREATE POLICY "Users can update own project settings" ON public.project_settings
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id)
  );

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to automatically expire projects
CREATE OR REPLACE FUNCTION public.update_expired_projects()
RETURNS void AS $$
BEGIN
  UPDATE public.projects
  SET status = 'expired'
  WHERE expires_at < NOW() AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique endpoint ID
CREATE OR REPLACE FUNCTION public.generate_endpoint_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
  is_unique BOOLEAN := FALSE;
BEGIN
  WHILE NOT is_unique LOOP
    result := '';
    FOR i IN 1..16 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    SELECT NOT EXISTS(SELECT 1 FROM public.projects WHERE endpoint_id = result) INTO is_unique;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to clean up expired projects (to be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_projects()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete projects that have been expired for more than 7 days
  DELETE FROM public.projects 
  WHERE status = 'expired' 
    AND expires_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;