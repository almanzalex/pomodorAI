import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Trash2, Sparkles, ListTodo } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface StructuredTask {
  id: string;
  name: string;
  difficulty: string;
  importance: string;
}

interface TaskInputScreenProps {
  onScheduleGenerated: (schedule: any) => void;
}

export function TaskInputScreen({ onScheduleGenerated }: TaskInputScreenProps) {
  const [plainText, setPlainText] = useState('');
  const [structuredTasks, setStructuredTasks] = useState<StructuredTask[]>([
    { id: '1', name: '', difficulty: '', importance: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const addStructuredTask = () => {
    setStructuredTasks([
      ...structuredTasks,
      { id: Date.now().toString(), name: '', difficulty: '', importance: '' }
    ]);
  };

  const removeStructuredTask = (id: string) => {
    setStructuredTasks(structuredTasks.filter(task => task.id !== id));
  };

  const updateStructuredTask = (id: string, field: keyof StructuredTask, value: string) => {
    setStructuredTasks(structuredTasks.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  // Local task scheduler
  const generateScheduleLocally = (validStructuredTasks: StructuredTask[], plainTextInput: string) => {
    const tasks: any[] = [];

    // Parse structured tasks
    validStructuredTasks.forEach(task => {
      const difficultyMap: Record<string, string> = { easy: 'easy', medium: 'medium', hard: 'hard' };
      const importanceMap: Record<string, string> = { low: 'low', medium: 'medium', high: 'high' };
      
      // Estimate pomodoros based on difficulty
      const pomodoroEstimate = task.difficulty === 'hard' ? '3' : task.difficulty === 'medium' ? '2' : '1';
      
      tasks.push({
        name: task.name,
        expected_time: pomodoroEstimate,
        difficulty: difficultyMap[task.difficulty] || 'medium',
        priority: importanceMap[task.importance] || 'medium',
        description: `${task.difficulty ? task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1) : 'Medium'} difficulty task with ${task.importance || 'medium'} priority`
      });
    });

    // Parse plain text tasks (simple parsing)
    if (plainTextInput.trim()) {
      const lines = plainTextInput.trim().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        // Skip if it looks like metadata
        if (line.toLowerCase().includes('difficulty:') || line.toLowerCase().includes('importance:')) {
          return;
        }
        
        // Simple heuristic: look for priority keywords
        const lowerLine = line.toLowerCase();
        let priority = 'medium';
        let difficulty = 'medium';
        let pomodoros = '2';
        
        if (lowerLine.includes('urgent') || lowerLine.includes('important') || lowerLine.includes('priority')) {
          priority = 'high';
        } else if (lowerLine.includes('later') || lowerLine.includes('optional')) {
          priority = 'low';
        }
        
        if (lowerLine.includes('hard') || lowerLine.includes('difficult') || lowerLine.includes('complex')) {
          difficulty = 'hard';
          pomodoros = '3';
        } else if (lowerLine.includes('easy') || lowerLine.includes('simple') || lowerLine.includes('quick')) {
          difficulty = 'easy';
          pomodoros = '1';
        }
        
        tasks.push({
          name: line.replace(/^[-*•]\s*/, '').trim(),
          expected_time: pomodoros,
          difficulty,
          priority,
          description: 'Task from plain text input'
        });
      });
    }

    // Sort tasks: high priority first, then alternate between hard and easy
    const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    tasks.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Within same priority, alternate difficulty
      const difficultyOrder: Record<string, number> = { hard: 3, medium: 2, easy: 1 };
      return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
    });

    // Calculate total time
    const totalPomodoros = tasks.reduce((sum, task) => sum + parseInt(task.expected_time), 0);
    const totalMinutes = totalPomodoros * 25;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const timeframe = hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minutes` : ''}` : `${minutes} minutes`;

    return {
      name: 'Study Session',
      timeframe,
      tasklist: tasks
    };
  };

  const handleGenerate = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Combine both plain text and structured tasks
      const validStructuredTasks = structuredTasks.filter(task => task.name && task.name.trim().length > 0);
      
      const hasPlainText = plainText.trim().length > 0;
      const hasStructuredTasks = validStructuredTasks.length > 0;

      if (!hasPlainText && !hasStructuredTasks) {
        setError('Please enter at least one task using plain text or structured input');
        setIsLoading(false);
        return;
      }

      // Prepare input for Claude API
      let userInput = '';
      let inputType = 'plain';
      
      if (hasPlainText && hasStructuredTasks) {
        // Combine both
        userInput = `Plain text tasks:\n${plainText}\n\nStructured tasks:\n${validStructuredTasks.map(t => 
          `- ${t.name} (Difficulty: ${t.difficulty || 'medium'}, Priority: ${t.importance || 'medium'})`
        ).join('\n')}`;
        inputType = 'combined';
      } else if (hasPlainText) {
        userInput = plainText;
        inputType = 'plain';
      } else {
        userInput = validStructuredTasks.map(t => 
          `- ${t.name} (Difficulty: ${t.difficulty || 'medium'}, Priority: ${t.importance || 'medium'})`
        ).join('\n');
        inputType = 'structured';
      }

      console.log('Calling Claude API with input:', userInput);

      // Call Claude API via backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-77657710/schedule-tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ userInput, inputType }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.error || 'Failed to generate schedule');
      }

      const data = await response.json();
      console.log('Received schedule from Claude:', data.schedule);
      
      onScheduleGenerated(data.schedule);
    } catch (err: any) {
      console.error('Error generating schedule:', err);
      setError(err.message || 'Failed to generate schedule. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-orange-900 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
            PomodorAI
          </h1>
          <p className="text-orange-700 text-lg mb-2">
            AI-powered study session planner for Dartmouth students
          </p>
          <p className="text-orange-600 text-sm">
            powered by Claude
          </p>
        </div>

        {/* Combined Input Area */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Plain Text Input */}
          <Card className="p-8 bg-white/90 backdrop-blur-xl border-2 border-orange-200 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-xl">
                <ListTodo className="w-5 h-5 text-white" />
              </div>
              <div>
                <Label className="text-orange-900 text-lg">Quick Entry</Label>
                <p className="text-orange-600 text-xs">List your tasks naturally</p>
              </div>
            </div>
            <Textarea
              placeholder="Example:&#10;&#10;• Study chapter 5 (important)&#10;• Review math homework - quick task&#10;• Work on essay - difficult&#10;• Practice coding problems&#10;&#10;Add notes about priority or difficulty!"
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
              className="min-h-[280px] border-orange-200 focus:border-orange-400 focus:ring-orange-400 bg-white/80 text-orange-950 placeholder:text-orange-400 resize-none"
            />
          </Card>

          {/* Structured Input */}
          <Card className="p-8 bg-white/90 backdrop-blur-xl border-2 border-orange-200 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-xl">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Label className="text-orange-900 text-lg">Detailed Entry</Label>
                  <p className="text-orange-600 text-xs">Set difficulty & priority</p>
                </div>
              </div>
              <Button
                onClick={addStructuredTask}
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-50">
              {structuredTasks.map((task, index) => (
                <div key={task.id} className="group relative">
                  <div className="flex gap-3 items-start bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-orange-100 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="flex-1 space-y-3">
                      <Input
                        placeholder={`Task ${index + 1}`}
                        value={task.name}
                        onChange={(e) => updateStructuredTask(task.id, 'name', e.target.value)}
                        className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 bg-white/90"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-orange-800 text-xs mb-1 block">Difficulty</Label>
                          <Select
                            value={task.difficulty}
                            onValueChange={(value) => updateStructuredTask(task.id, 'difficulty', value)}
                          >
                            <SelectTrigger className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 bg-white/90">
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-orange-800 text-xs mb-1 block">Priority</Label>
                          <Select
                            value={task.importance}
                            onValueChange={(value) => updateStructuredTask(task.id, 'importance', value)}
                          >
                            <SelectTrigger className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 bg-white/90">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    {structuredTasks.length > 1 && (
                      <Button
                        onClick={() => removeStructuredTask(task.id)}
                        size="sm"
                        variant="ghost"
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-5 bg-red-50 border-2 border-red-200 rounded-xl shadow-lg animate-in fade-in slide-in-from-top duration-300">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <div className="text-center mb-8">
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            size="lg"
            className="relative group bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-12 py-8 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-70"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 rounded-lg blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                  <span>Creating Schedule...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span>Start Study Session</span>
                </>
              )}
            </div>
          </Button>
        </div>

        {/* Info Text */}
        <div className="text-center">
          <p className="text-orange-600">
            Your tasks will be organized into 25-minute Pomodoro sessions
          </p>
        </div>
      </div>
    </div>
  );
}
