# Setting up Environment Variables in Render

## For Supabase Edge Functions (Production)

Since you're deploying a static site to Render, the Claude API calls need to go through Supabase Edge Functions. You need to set the API key in Supabase:

### Option 1: Supabase Dashboard (Easiest)
1. Go to https://supabase.com/dashboard/project/nybbpmsbjaofoklgyyor
2. Click **Edge Functions** in the sidebar
3. Click **Settings** or **Secrets**
4. Add a new secret:
   - Name: `CLAUDE_API_KEY`
   - Value: `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`

### Option 2: Supabase CLI
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login
supabase login

# Set the secret
supabase secrets set CLAUDE_API_KEY=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 --project-ref nybbpmsbjaofoklgyyor
```

### Deploy the Edge Function
```bash
# Link your project
supabase link --project-ref nybbpmsbjaofoklgyyor

# Deploy the function
supabase functions deploy make-server-77657710 --project-ref nybbpmsbjaofoklgyyor
```

## For Local Development

The local server (`local-server.js`) has a fallback API key hardcoded for development purposes only. This works locally but won't be pushed to GitHub.

## Current Setup

- **Local development**: Uses `local-server.js` on port 3333 (API key has fallback)
- **Production**: Uses Supabase Edge Functions (requires API key to be set in Supabase dashboard)
- **Frontend**: Automatically detects environment via `VITE_API_URL` env variable
