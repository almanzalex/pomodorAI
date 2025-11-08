import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-77657710/health", (c) => {
  return c.json({ status: "ok" });
});

// Claude API endpoint for task scheduling
app.post("/make-server-77657710/schedule-tasks", async (c) => {
  try {
    const body = await c.req.json();
    console.log("Received request body:", JSON.stringify(body));
    
    const { userInput, inputType } = body;
    console.log("userInput:", userInput);
    console.log("userInput type:", typeof userInput);
    console.log("userInput length:", userInput?.length);

    if (!userInput || !userInput.trim()) {
      console.log("Error: User input is empty or whitespace-only");
      return c.json({ error: "User input is required" }, 400);
    }

    const apiKey = Deno.env.get("CLAUDE_API_KEY") || "";
    if (!apiKey) {
      console.log("Error: CLAUDE_API_KEY environment variable is not set");
      return c.json({ error: "Claude API key not configured" }, 500);
    }
    console.log("API key found, length:", apiKey.length);

    // Construct the prompt for Claude
    const systemPrompt = `You are a task scheduling assistant that helps users organize their tasks using the Pomodoro method. 
Your job is to analyze the user's tasks and create an optimized schedule based on priority, difficulty, and the Pomodoro technique principles.

Return a JSON object with this exact structure:
{
  "name": "Study Session",
  "timeframe": "estimated total time like '2 hours' or '3 hours 30 minutes'",
  "tasklist": [
    {
      "name": "task name",
      "expected_time": "number of 25-minute pomodoros needed (e.g., '1', '2', '3')",
      "difficulty": "easy, medium, or hard",
      "priority": "low, medium, or high",
      "description": "brief description of the task"
    }
  ]
}

Guidelines for ordering tasks:
- Start with high-priority tasks when energy is fresh
- Alternate between difficult and easier tasks to prevent burnout
- Group similar tasks together when possible
- Consider the user's explicit preferences and notes
- Estimate pomodoros realistically (1 pomodoro = 25 minutes of focused work)`;

    const userPrompt = inputType === 'structured' 
      ? `I have a list of tasks with the following details:

${userInput}

Please organize these tasks into an optimal Pomodoro study schedule.`
      : `Here are my tasks and notes in plain text:

${userInput}

Please parse these tasks, understand my priorities and preferences, and organize them into an optimal Pomodoro study schedule.`;

    console.log("Calling Claude API for task scheduling...");
    
    const claudePayload = {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    };
    
    console.log("Claude API request being sent");
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(claudePayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Claude API error response:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return c.json({ 
        error: `Claude API error: ${response.status}`, 
        details: errorText,
        statusText: response.statusText 
      }, response.status);
    }

    const data = await response.json();
    console.log("Claude API response received");

    // Extract the JSON from Claude's response
    const content = data.content[0].text;
    
    // Try to parse JSON from the response
    let scheduleData;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      const jsonString = jsonMatch[1].trim();
      scheduleData = JSON.parse(jsonString);
    } catch (parseError) {
      console.log(`Error parsing Claude response as JSON: ${parseError}`);
      console.log(`Claude response content: ${content}`);
      return c.json({ error: "Failed to parse task schedule from AI response" }, 500);
    }

    return c.json({ schedule: scheduleData });

  } catch (error) {
    console.log(`Error in schedule-tasks endpoint: ${error}`);
    return c.json({ error: `Server error: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);
