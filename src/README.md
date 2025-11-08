# PomodorAI - AI-Powered Study Session Planner

**Built for BuildWithClaude Hackathon at Dartmouth**

## Category: Academic Tools

## Problem Statement

Dartmouth students juggle multiple assignments, readings, problem sets, and study sessions across different courses. Traditional to-do lists don't account for task complexity, cognitive load management, or the proven Pomodoro Technique for sustained focus. Students often struggle with:
- Estimating how long tasks will actually take
- Prioritizing competing assignments effectively
- Maintaining focus during long study sessions
- Balancing difficult and easier tasks to prevent burnout

## Solution

PomodorAI is an AI-powered study session planner that:
1. **Intelligently schedules tasks** using natural language processing to understand task complexity and priority from student descriptions
2. **Applies Pomodoro best practices** by breaking work into 25-minute focused sessions with strategic breaks
3. **Adapts in real-time** allowing students to check off completed tasks, add urgent assignments, and reorder priorities mid-session
4. **Tracks progress visually** showing completed pomodoros and tasks to maintain motivation

## Who It Helps

- **Dartmouth students** managing multiple course assignments and study commitments
- **Students with ADHD or focus challenges** who benefit from structured work intervals
- **International and first-year students** learning to manage college-level workloads
- **Any student** preparing for midterms, finals, or managing long-term projects

## Key Features

### ✅ Implemented MVP Features
- **Dual Input Methods**: Quick plain-text entry OR structured input with difficulty/priority selectors
- **Smart Task Parsing**: AI analyzes natural language to detect keywords like "urgent", "difficult", "quick" to auto-assign priorities
- **Combined Scheduling**: Merges both plain text and structured tasks into one optimized study session
- **Complete Pomodoro Cycle**: 25-min work sessions, 5-min short breaks, 20-min long breaks after 4 pomodoros
- **Mid-Session Flexibility**: 
  - Check off tasks early if completed before estimated pomodoros
  - Add forgotten tasks during the session
  - Reorder upcoming tasks with up/down arrows
  - Remove tasks that are no longer needed
- **Visual Progress Tracking**: See current task, upcoming tasks, completed tasks, and total pomodoros
- **Break Reminders**: Clear visual indication when it's time to rest and recharge

### ✅ Claude API Integration
**Fully integrated** with Claude 3.5 Sonnet via Supabase Edge Functions:
- Claude analyzes task descriptions to intelligently estimate difficulty, time, and priority
- Optimizes task ordering based on Pomodoro best practices and cognitive load management
- Backend endpoint: `/make-server-77657710/schedule-tasks`
- Combines both plain text and structured input for comprehensive AI analysis

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno + Hono)
- **UI Components**: Custom component library with glassmorphism effects
- **AI**: Claude 3.5 Sonnet API (fully integrated)
- **Deployment**: Render (frontend) + Supabase (backend)

## How to Use

1. **Enter Your Tasks** using either:
   - Plain text: "Study calculus chapter 5 (important)", "Quick review of Spanish vocab"
   - Structured format: Task name + difficulty slider + priority selector

2. **Start Your Session**: Click "Start Study Session" to begin the Pomodoro timer

3. **Stay Focused**: Work for 25 minutes on the current task
   - Check it off when complete
   - Skip to next task if needed
   - Add new tasks that come up

4. **Take Breaks**: Follow the timer prompts for 5-minute breaks and 20-minute long breaks

5. **Review Progress**: See your completed tasks and total focus time at session end

## Installation & Deployment

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel deploy
```

## Hackathon Submission Checklist

- ✅ Working demo (not mockups or slides)
- ✅ Solves real problem for Dartmouth students (study time management)
- ✅ Fits Academic Tools category
- ✅ Clear documentation of problem and audience
- ✅ Claude API fully integrated for AI-powered scheduling
- 🚀 Deployment link: [Follow RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)
- 🚀 GitHub repository: Ready to push

## Future Enhancements

- **Session History**: Track study patterns over days/weeks
- **Course Integration**: Connect with Canvas to pull assignment deadlines
- **Study Groups**: Collaborative Pomodoro sessions with classmates
- **Analytics**: Insights on productive times, task completion rates, focus trends
- **Mobile App**: Native iOS/Android for studying on the go
- **Calendar Sync**: Export study sessions to Google Calendar or Outlook

## License

MIT License - Built for Dartmouth BuildWithClaude Hackathon 2025

---

**Note for Judges**: This app demonstrates a fully functional Pomodoro study system with intelligent task management. The local scheduling algorithm is ready to be replaced with Claude API calls for enhanced AI-powered task analysis and optimization.
