# PomodorAI - Quick Start Guide

## ✅ You're Ready to Deploy! Here's What You Have:

### 🎯 Complete Features
- ✅ Claude API fully integrated
- ✅ Frontend with dual input modes (plain text + structured)
- ✅ Backend with Supabase Edge Functions
- ✅ Full Pomodoro timer functionality
- ✅ Mid-session task management
- ✅ Beautiful Claude-inspired UI
- ✅ Documentation ready

### 🚀 Next Steps: Deploy in 15 Minutes

## Step 1: Push to GitHub (5 minutes)

```bash
# In your project directory
git init
git add .
git commit -m "PomodorAI - BuildWithClaude Hackathon Submission"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/pomodorai.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Render (10 minutes)

**Full instructions**: See [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)

**Quick version**:
1. Go to https://render.com → Sign in with GitHub
2. New + → Static Site → Connect your `pomodorai` repo
3. Settings:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Add environment variables:
     - `NODE_VERSION`: `18`
     - `SUPABASE_URL`: (from your Supabase project)
     - `SUPABASE_ANON_KEY`: (from your Supabase project)
4. Click "Create Static Site"
5. Wait ~3 minutes for deployment
6. Your app is live! 🎉

## Step 3: Test Everything (2 minutes)

Visit your deployed URL and test:
1. ✅ Add tasks (plain text + structured)
2. ✅ Click "Start Study Session"
3. ✅ Verify AI scheduling works (check browser console for "Calling Claude API")
4. ✅ Test Pomodoro timer
5. ✅ Try mid-session task management

## Step 4: Submit to Hackathon

Submit these links:
- 📦 GitHub: `https://github.com/YOUR_USERNAME/pomodorai`
- 🚀 Live Demo: `https://pomodorai.onrender.com` (or your Render URL)
- 📄 Documentation: Link to your repo's README.md

---

## 🎤 Your 30-Second Demo Pitch

> "PomodorAI helps Dartmouth students manage study time using Claude AI and the Pomodoro Technique. Students dump their to-do list in plain English—like 'Study calculus, difficult' or 'Quick Spanish review'—and Claude intelligently schedules it into focused 25-minute sessions, balancing hard and easy tasks to prevent burnout. Mid-session, you can check off tasks, add urgent assignments, or reorder priorities. It's AI-powered time management that actually understands student workloads."

---

## 🐛 Quick Troubleshooting

### "Cannot connect to Claude API"
- Check Supabase Edge Functions have `CLAUDE_API_KEY` set
- Verify API key in Anthropic Console has credits

### "Build failed on Render"
- Ensure `package.json` is in your repo
- Set `NODE_VERSION` to `18` in Render environment variables

### "Frontend loads but scheduling doesn't work"
- Check browser console for errors
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in Render
- Test backend directly: See [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)

---

## 📁 What's in This Repo

```
├── App.tsx                          # Main app component
├── components/
│   ├── TaskInputScreen.tsx          # Task entry with Claude API
│   ├── PomodoroSession.tsx          # Timer and task management
│   └── SessionSummary.tsx           # Completion stats
├── supabase/functions/server/
│   └── index.tsx                    # Backend with Claude integration
├── README.md                        # Full documentation
├── RENDER_DEPLOYMENT_GUIDE.md       # Detailed deployment steps
├── HACKATHON_CHECKLIST.md           # Feature checklist
└── QUICK_START.md                   # This file!
```

---

## 🎯 Category & Problem Statement

**Category**: Academic Tools

**Problem**: Dartmouth students struggle with managing multiple assignments, estimating task duration, and maintaining focus during study sessions.

**Solution**: PomodorAI uses Claude to intelligently schedule tasks based on difficulty and priority, then guides students through focused 25-minute Pomodoro sessions with adaptive task management.

**Who it helps**: Dartmouth students, especially those with ADHD, heavy course loads, or preparing for exams.

---

## ✨ Key Differentiators

1. **Dual Input**: Plain text OR structured—students choose their workflow
2. **True AI Intelligence**: Claude analyzes context, not just keywords
3. **Mid-Session Flexibility**: Real student workflows aren't rigid
4. **Pomodoro Best Practices**: Scientifically proven focus technique
5. **Beautiful UX**: Claude-inspired design that students actually want to use

---

## 🏆 You're Ready!

Everything is implemented and documented. Just deploy and submit!

**Questions?** Check:
- Detailed deployment: [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)
- Feature checklist: [HACKATHON_CHECKLIST.md](./HACKATHON_CHECKLIST.md)
- Full docs: [README.md](./README.md)

**Good luck at the hackathon! 🚀**
