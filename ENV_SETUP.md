# Setting up Environment Variables

## For Supabase Edge Functions (Production) ✅ CONFIGURED

The Claude API key has been set in Supabase. The Edge Function is deployed and ready to use.

### To update the key in the future:

#### Option 1: Supabase Dashboard
1. Go to https://supabase.com/dashboard/project/nybbpmsbjaofoklgyyor
2. Click **Edge Functions** in the sidebar
3. Click **Settings** or **Secrets**
4. Update the `CLAUDE_API_KEY` secret

#### Option 2: Supabase CLI
```bash
# Set the secret
supabase secrets set CLAUDE_API_KEY=your_new_key_here --project-ref nybbpmsbjaofoklgyyor
```

### Deploy the Edge Function
```bash
# Link your project
supabase link --project-ref nybbpmsbjaofoklgyyor

# Deploy the function
supabase functions deploy make-server-77657710 --project-ref nybbpmsbjaofoklgyyor
```

## For Local Development

Create a `.env` file in the project root with your Claude API key:

```bash
CLAUDE_API_KEY=your_claude_api_key_here
```

The local server will read this file when running `npm run server`.

## Current Setup

- **Local development**: 
  - Uses `local-server.js` on port 3333 
  - Requires `.env` file with `CLAUDE_API_KEY`
  - Set `VITE_API_URL=http://localhost:3333` in `.env.local` to use local backend
  
- **Production**: 
  - Uses Supabase Edge Functions (✅ deployed)
  - Claude API key configured in Supabase secrets (✅ set)
  - No environment variables needed in Render
  
- **Frontend**: Automatically detects environment via `VITE_API_URL` env variable
