import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckCircle2, Trophy, Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';

interface Task {
  name: string;
  expected_time: string;
  difficulty: string;
  priority: string;
  description: string;
}

interface SessionSummaryProps {
  completedTasks: Task[];
  totalPomodoros: number;
  onStartNew: () => void;
}

export function SessionSummary({ completedTasks, totalPomodoros, onStartNew }: SessionSummaryProps) {
  const totalMinutes = totalPomodoros * 25;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'hard': return 'bg-rose-100 text-rose-700 border-rose-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl mb-5 shadow-xl">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="mb-3 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Great Work!
          </h1>
          <p className="text-orange-700 text-lg">
            You stayed focused and completed your study session.
          </p>
        </div>

        {/* Simple Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <Card className="p-6 text-center bg-white border-2 border-emerald-200 shadow-lg">
            <div className="text-4xl mb-1 text-emerald-600">{completedTasks.length}</div>
            <p className="text-emerald-700 text-sm">Tasks</p>
          </Card>

          <Card className="p-6 text-center bg-white border-2 border-orange-200 shadow-lg">
            <div className="text-4xl mb-1 text-orange-600">{totalPomodoros}</div>
            <p className="text-orange-700 text-sm">Pomodoros</p>
          </Card>

          <Card className="p-6 text-center bg-white border-2 border-purple-200 shadow-lg">
            <div className="text-4xl mb-1 text-purple-600">
              {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
            </div>
            <p className="text-purple-700 text-sm">Focus Time</p>
          </Card>
        </div>

        {/* Completed Tasks List */}
        <Card className="p-6 bg-white border-2 border-orange-200 shadow-xl mb-8">
          <h2 className="text-orange-900 mb-5">Completed Tasks</h2>
          <div className="space-y-3">
            {completedTasks.map((task, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-emerald-900 mb-2">{task.name}</h3>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={`${getDifficultyColor(task.difficulty)} border text-xs`}>
                        {task.difficulty}
                      </Badge>
                      <Badge className="bg-orange-100 text-orange-700 border border-orange-200 text-xs">
                        {task.expected_time} pomodoros
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Call to Action */}
        <Card className="p-8 bg-gradient-to-br from-orange-100 to-amber-100 border-2 border-orange-300 shadow-xl">
          <div className="text-center mb-5">
            <h3 className="text-orange-900 mb-2">Ready for another session?</h3>
            <p className="text-orange-800">
              Keep the momentum going and plan your next study session.
            </p>
          </div>
          <Button 
            onClick={onStartNew} 
            size="lg" 
            className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Plan New Session
          </Button>
        </Card>

        {/* Simple Tip */}
        <div className="mt-8 text-center">
          <p className="text-orange-600 text-sm">
            Regular breaks help maintain focus and prevent burnout
          </p>
        </div>
      </div>
    </div>
  );
}
