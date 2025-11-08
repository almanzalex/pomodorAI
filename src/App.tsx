import { useState } from 'react';
import { TaskInputScreen } from './components/TaskInputScreen';
import { PomodoroSession } from './components/PomodoroSession';
import { SessionSummary } from './components/SessionSummary';
import { Toaster } from './components/ui/sonner';

interface Task {
  name: string;
  expected_time: string;
  difficulty: string;
  priority: string;
  description: string;
}

interface Schedule {
  name: string;
  timeframe: string;
  tasklist: Task[];
}

type AppState = 'input' | 'session' | 'summary';

export default function App() {
  const [appState, setAppState] = useState<AppState>('input');
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [totalPomodoros, setTotalPomodoros] = useState(0);

  const handleScheduleGenerated = (generatedSchedule: Schedule) => {
    setSchedule(generatedSchedule);
    setAppState('session');
  };

  const handleSessionComplete = (tasks: Task[], pomodoros: number) => {
    setCompletedTasks(tasks);
    setTotalPomodoros(pomodoros);
    setAppState('summary');
  };

  const handleStartNew = () => {
    setSchedule(null);
    setCompletedTasks([]);
    setTotalPomodoros(0);
    setAppState('input');
  };

  return (
    <>
      {appState === 'input' && (
        <TaskInputScreen onScheduleGenerated={handleScheduleGenerated} />
      )}

      {appState === 'session' && schedule && (
        <PomodoroSession schedule={schedule} onComplete={handleSessionComplete} />
      )}

      {appState === 'summary' && (
        <SessionSummary
          completedTasks={completedTasks}
          totalPomodoros={totalPomodoros}
          onStartNew={handleStartNew}
        />
      )}

      <Toaster />
    </>
  );
}
