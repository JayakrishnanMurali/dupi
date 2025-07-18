# Supabase Setup Guide

This guide will help you set up Supabase for the Dupi mock API generator with authentication and a proper database schema.

## Prerequisites

- A Supabase account (https://supabase.com)
- Node.js and pnpm installed
- The Dupi project cloned locally

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `dupi-mock-api`
   - **Database Password**: Generate a strong password
   - **Region**: Choose the closest to your users
5. Click "Create new project"

## Step 2: Set Up Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. In your Supabase project dashboard, go to **Settings** → **API**

3. Copy the following values to your `.env.local` file:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="your-project-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   NEXT_PUBLIC_APP_URL="http://localhost:3001"
   ```

## Step 3: Set Up the Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Copy the entire contents of `supabase/schema.sql`
3. Paste it into the SQL Editor and click "Run"
4. This will create:
   - Custom types (`http_method`, `project_status`)
   - Tables (`profiles`, `projects`, `api_usage_logs`, `project_settings`)
   - Indexes for performance
   - Row Level Security (RLS) policies
   - Trigger functions
   - Helper functions

## Step 4: Configure Authentication

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Configure the following settings:

### Site URL Configuration
- **Site URL**: `http://localhost:3001` (for development)
- **Redirect URLs**: Add `http://localhost:3001/auth/callback`

### Email Templates (Optional)
You can customize the email templates for:
- Confirm signup
- Reset password
- Magic link

### OAuth Providers (Optional)
To enable Google OAuth:
1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - **Client ID** and **Client Secret** from Google Console
   - **Redirect URL**: Use the one provided by Supabase

## Step 5: Set Up Row Level Security

The schema already includes RLS policies, but here's what they do:

### Profiles Table
- Users can only view/edit their own profile
- Profiles are automatically created when users sign up

### Projects Table
- Users can only access their own projects
- Anonymous users can read active projects for mock API generation

### API Usage Logs
- Users can view their own usage logs
- System can insert logs for all requests

### Project Settings
- Users can only access settings for their own projects

## Step 6: Test the Setup

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Go to `http://localhost:3001`
3. Try signing up with a new account
4. Create a test project
5. Verify the mock API works

## Step 7: Production Setup

For production deployment:

1. Update environment variables:
   ```bash
   NEXT_PUBLIC_APP_URL="https://your-domain.com"
   ```

2. Update Supabase Auth settings:
   - **Site URL**: `https://your-domain.com`
   - **Redirect URLs**: Add `https://your-domain.com/auth/callback`

3. Set up database backups in Supabase dashboard

## Database Schema Overview

### Tables

1. **profiles** - User profile information
   - Linked to Supabase auth.users
   - Stores additional user data

2. **projects** - Mock API projects
   - Contains TypeScript interface code
   - Tracks expiration and status
   - Uses unique endpoint_id for URLs

3. **api_usage_logs** - API usage analytics
   - Tracks all requests to mock APIs
   - Includes response times and metadata

4. **project_settings** - Advanced project configuration
   - Rate limiting settings
   - Custom headers
   - Analytics preferences

### Security Features

- **Row Level Security**: Ensures users can only access their own data
- **Anonymous access**: Allows mock API calls without authentication
- **Automatic cleanup**: Expired projects are automatically managed
- **Audit logging**: All API usage is tracked

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Ensure `.env.local` exists and has correct values
   - Restart the development server

2. **Authentication not working**
   - Check Site URL and Redirect URLs in Supabase
   - Verify environment variables are correct

3. **Database errors**
   - Ensure the schema.sql was executed successfully
   - Check RLS policies are enabled

4. **Mock API not working**
   - Verify projects table has data
   - Check endpoint_id is correctly generated

### Getting Help

- Check Supabase documentation: https://supabase.com/docs
- Review the Dupi codebase for implementation details
- Check browser console for error messages