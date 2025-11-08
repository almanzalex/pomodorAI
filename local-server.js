import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/make-server-77657710/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Claude API endpoint for task scheduling
app.post('/make-server-77657710/schedule-tasks', async (req, res) => {
  try {
    const { userInput, inputType } = req.body;
    console.log('Received request:', { userInput, inputType });

    if (!userInput || !userInput.trim()) {
      return res.status(400).json({ error: 'User input is required' });
    }

    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      console.error('CLAUDE_API_KEY not found in environment variables');
      console.error('Please set CLAUDE_API_KEY in your .env file for local development');
      return res.status(500).json({ error: 'Claude API key not configured' });
    }

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

    console.log('Calling Claude API...');

    // Retry logic for overloaded API
    let response;
    let retries = 3;
    let delay = 1000; // Start with 1 second delay

    for (let i = 0; i < retries; i++) {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 2000,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        }),
      });

      // If successful or not overloaded, break
      if (response.ok || response.status !== 529) {
        break;
      }

      // If overloaded and not last retry, wait and retry
      if (i < retries - 1) {
        console.log(`API overloaded, retrying in ${delay}ms... (attempt ${i + 2}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return res.status(response.status).json({
        error: `Claude API error: ${response.status}`,
        details: errorText,
        statusText: response.statusText,
      });
    }

    const data = await response.json();
    console.log('Claude API response received');

    // Extract the JSON from Claude's response
    const content = data.content[0].text;
    console.log('Raw Claude response:', content);

    // Try to parse JSON from the response
    let scheduleData;
    try {
      // Try different parsing strategies
      let jsonString = content;

      // Strategy 1: Remove markdown code blocks if present
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1].trim();
      }

      // Strategy 2: Find JSON object pattern
      const jsonObjectMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        jsonString = jsonObjectMatch[0];
      }

      console.log('Extracted JSON string:', jsonString);
      scheduleData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      console.error('Claude response content:', content);
      return res.status(500).json({ 
        error: 'Failed to parse task schedule from AI response',
        details: parseError.message,
        rawResponse: content
      });
    }

    res.json({ schedule: scheduleData });
  } catch (error) {
    console.error('Error in schedule-tasks endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Local backend server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/make-server-77657710/health`);
});
