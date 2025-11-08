# Render Deployment Guide for PomodorAI

## Prerequisites
- GitHub account
- Render account (free tier works - sign up at https://render.com)
- Your code pushed to a GitHub repository

---

## Step 1: Push Your Code to GitHub

### 1.1 Create a New GitHub Repository
1. Go to https://github.com/new
2. Repository name: `pomodorai` (or your preferred name)
3. Description: "AI-powered Pomodoro study planner for Dartmouth students"
4. Keep it **Public** (required for free Render deployment)
5. **Do NOT** initialize with README (you already have one)
6. Click "Create repository"

### 1.2 Push Your Local Code to GitHub
Open your terminal in your project directory and run:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit: PomodorAI for BuildWithClaude Hackathon"

# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/pomodorai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Verify**: Go to your GitHub repository URL and confirm all files are there.

---

## Step 2: Set Up Render Account

### 2.1 Sign Up / Log In
1. Go to https://render.com
2. Click "Get Started" or "Sign In"
3. Sign in with your GitHub account (recommended for easy integration)
4. Authorize Render to access your GitHub repositories

---

## Step 3: Deploy the Frontend (Static Site)

### 3.1 Create New Static Site
1. From Render Dashboard, click **"New +"** button (top right)
2. Select **"Static Site"**
3. Click **"Connect a repository"**
4. Find and select your `pomodorai` repository
5. Click **"Connect"**

### 3.2 Configure Build Settings

**General Settings:**
- **Name**: `pomodorai` (or your preferred name)
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Build Command**: 
  ```
  npm install && npm run build
  ```
- **Publish Directory**: 
  ```
  dist
  ```

**Environment Variables:**
Click **"Advanced"** and add these environment variables:

1. Click **"Add Environment Variable"**
2. Add each of these:

| Key | Value |
|-----|-------|
| `NODE_VERSION` | `18` |
| `SUPABASE_URL` | (copy from your Supabase project) |
| `SUPABASE_ANON_KEY` | (copy from your Supabase project) |

**To find your Supabase credentials:**
- Go to your Supabase project dashboard
- Settings → API
- Copy "Project URL" → this is your `SUPABASE_URL`
- Copy "anon public" key → this is your `SUPABASE_ANON_KEY`

### 3.3 Deploy
1. Click **"Create Static Site"** at the bottom
2. Render will automatically:
   - Clone your repository
   - Run `npm install`
   - Run `npm run build`
   - Deploy the `dist` folder

**Wait for deployment** (usually 2-5 minutes for first deploy)

### 3.4 Get Your Frontend URL
Once deployment succeeds:
- Your site URL will be: `https://pomodorai.onrender.com` (or similar)
- Click the URL to test your frontend
- **Save this URL** - you'll need it for your hackathon submission

---

## Step 4: Deploy the Backend (Supabase Edge Function)

Your backend is already deployed on Supabase! The endpoint is:
```
https://{your-project-id}.supabase.co/functions/v1/make-server-77657710/schedule-tasks
```

### 4.1 Verify Backend Environment Variables
1. Go to Supabase Dashboard
2. Project Settings → Edge Functions
3. Verify `CLAUDE_API_KEY` is set

If not set:
1. Click "Add new variable"
2. Name: `CLAUDE_API_KEY`
3. Value: Your Claude API key from Anthropic Console

### 4.2 Test Backend
Run this in your terminal (replace `YOUR_PROJECT_ID` with your actual Supabase project ID):

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-77657710/schedule-tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "userInput": "Study calculus chapter 5\nReview Spanish vocab",
    "inputType": "plain"
  }'
```

You should get a JSON response with a schedule.

---

## Step 5: Verify Full Stack Integration

### 5.1 Test the Full Application
1. Go to your Render URL: `https://pomodorai.onrender.com`
2. Enter some tasks (both plain text and structured)
3. Click "Start Study Session"
4. Verify:
   - Tasks are parsed by Claude AI
   - Schedule is generated intelligently
   - Timer works correctly
   - Task management works

### 5.2 Check Browser Console
- Open DevTools (F12)
- Check Console tab for any errors
- Should see: "Calling Claude API with input: ..."
- Should see: "Received schedule from Claude: ..."

---

## Step 6: Update README with Deployment Links

Edit your `README.md`:

```markdown
## Live Demo

🚀 **Deployed Application**: https://pomodorai.onrender.com

🔗 **GitHub Repository**: https://github.com/YOUR_USERNAME/pomodorai

📹 **Demo Video**: [Coming soon]
```

Commit and push:
```bash
git add README.md
git commit -m "Add deployment links"
git push origin main
```

---

## Step 7: Hackathon Submission Checklist

- ✅ **GitHub repository link**: `https://github.com/YOUR_USERNAME/pomodorai`
- ✅ **Deployed product link**: `https://pomodorai.onrender.com`
- ✅ **Working demo**: Test all features on deployed site
- ✅ **Documentation**: README.md explains problem, solution, and target users
- ✅ **Category**: Academic Tools
- ✅ **AI Integration**: Claude API actively used for task scheduling

---

## Troubleshooting Common Issues

### Issue 1: Build Fails on Render
**Error**: "Cannot find module" or build errors

**Solution**:
1. Check your `package.json` includes all dependencies
2. Verify build command: `npm install && npm run build`
3. Check Node version is set to 18 in environment variables

### Issue 2: Frontend Loads but No AI Scheduling
**Error**: Tasks default to local heuristics instead of AI

**Solution**:
1. Check browser console for errors
2. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in Render
3. Test backend endpoint directly with curl
4. Check Supabase logs for backend errors

### Issue 3: CORS Errors
**Error**: "Access to fetch blocked by CORS policy"

**Solution**:
- Backend already has CORS enabled for all origins (`origin: "*"`)
- Check that you're using the correct Supabase URL
- Verify Authorization header is being sent

### Issue 4: Claude API Errors
**Error**: "Claude API error: 401" or "API key not configured"

**Solution**:
1. Verify `CLAUDE_API_KEY` is set in Supabase Edge Functions settings
2. Check API key is valid in Anthropic Console
3. Ensure API key has sufficient credits

### Issue 5: Slow Response Times
**Symptom**: Takes 10+ seconds to generate schedule

**Solution**:
- This is normal for Claude API (3-8 seconds)
- Consider adding a loading animation or progress indicator
- Render free tier may have cold starts (first request slow)

---

## Render-Specific Tips

### Free Tier Limitations
- **Cold starts**: If no requests for 15 minutes, next request will be slow (30-60 seconds)
- **Build minutes**: 500 free minutes/month
- **Bandwidth**: Generous for hackathon use

### Keeping Your Site "Warm"
To prevent cold starts during demo:
1. Use a service like UptimeRobot (free) to ping your site every 5 minutes
2. Or manually visit your site before judging time

### Custom Domain (Optional)
If you want a custom domain:
1. Go to your Render static site settings
2. Click "Custom Domain"
3. Add your domain (e.g., `pomodorai.com`)
4. Follow DNS configuration instructions

---

## Monitoring Your Deployment

### Render Dashboard
- View build logs: Click on your service → "Logs" tab
- Check deploy status: Green = success, Red = failed
- Monitor usage: Dashboard shows requests, bandwidth

### Supabase Dashboard
- View Edge Function logs: Functions → Select function → Logs
- Monitor API usage: Project Settings → Usage
- Check database activity: Database → Logs

---

## Post-Deployment: Prepare for Demo

### 1. Create Test Data
Prepare example tasks to show during demo:
```
Plain text:
• Study calculus chapter 5 - important exam tomorrow
• Review Spanish vocabulary - quick task
• Work on computer science essay - difficult, 3 pages
• Practice coding problems - medium priority

Structured:
- Read biology textbook (Hard, High priority)
- Group project meeting prep (Medium, High)
- Optional: Extra credit problem set (Hard, Low)
```

### 2. Screenshot Your App
Take screenshots for presentation:
- Task input screen
- Active Pomodoro timer
- Task management (adding/reordering)
- Session summary

### 3. Test Your Pitch
Practice your 30-second elevator pitch:
> "PomodorAI uses Claude AI to help Dartmouth students manage study time effectively. Just dump your to-do list in plain English, and Claude intelligently schedules it into focused 25-minute Pomodoro sessions, balancing difficulty and priority to prevent burnout. Students can adjust their plan mid-session as priorities change."

---

## Success Criteria

Your deployment is successful when:
- ✅ Site loads at `https://pomodorai.onrender.com`
- ✅ Can input tasks (both plain text and structured)
- ✅ "Start Study Session" calls Claude API
- ✅ Tasks are intelligently scheduled (not just keyword matching)
- ✅ Pomodoro timer counts down correctly
- ✅ Can add/remove/reorder tasks during session
- ✅ Session summary displays after completion
- ✅ No console errors in browser DevTools

---

## Deployment Complete! 🎉

You now have a fully deployed AI-powered Pomodoro app ready for hackathon submission!

**Your Submission Package:**
- 📦 GitHub Repo: `https://github.com/YOUR_USERNAME/pomodorai`
- 🚀 Live Demo: `https://pomodorai.onrender.com`
- 📄 Documentation: README.md in repo
- 🤖 AI Integration: Claude API actively used
- 🎯 Category: Academic Tools

**Next Steps:**
1. Submit your GitHub and Render links to hackathon organizers
2. Prepare your 2-minute demo
3. Test everything one more time before judging
4. Good luck! 🍀
