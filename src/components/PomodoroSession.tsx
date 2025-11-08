import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Play, Pause, SkipForward, Coffee, CheckCircle2, Circle, Clock, Timer, X, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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

interface PomodoroSessionProps {
  schedule: Schedule;
  onComplete: (completedTasks: Task[], totalPomodoros: number) => void;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export function PomodoroSession({ schedule, onComplete }: PomodoroSessionProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskList, setTaskList] = useState<Task[]>(schedule.tasklist);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [currentPomodoro, setCurrentPomodoro] = useState(1);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState('medium');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const WORK_TIME = 25 * 60;
  const SHORT_BREAK = 5 * 60;
  const LONG_BREAK = 20 * 60;

  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OWhUhALT6fk8LZjHAU5k9jzzn0vBSp+zPLaizsKGGS56+mjUBELTKXh8bllHgU2jdXx0oU2Byt6yfHejjwLGGG15uyrWRQLSqPe8bxnIAU0itLx1Ic4Byx4yPDaiz4KF165qOSuWhcMSqLf8b1oIQU1jNPy1oU4By16y/HajDwKF128p+KtXBYMSaPf8L5pIgU2jtLy14Y5CDJ+y/HajjwKF1+7puOtXBcLSqLe8b5oIQU1i9Py1oU6Byx7y/DajTsLGGC24+qnVxIMSqPg8r1oIAU0jNLy14Y5By17yvHbjDwLF1+76+SrWxYMSKHf8L1pIQU1i9Py14Y6CDJ+y/DajTsLF1+76uSrWxcMSKHe8L1pIQU1i9Py1oY5By17yv');
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    if (mode === 'work') {
      const newPomodorosCompleted = pomodorosCompleted + 1;
      setPomodorosCompleted(newPomodorosCompleted);
      setCurrentPomodoro((prev) => prev + 1);

      const currentTask = taskList[currentTaskIndex];
      const expectedPomodoros = parseInt(currentTask.expected_time);
      
      if (currentPomodoro >= expectedPomodoros) {
        completeCurrentTask();
      }

      if (newPomodorosCompleted % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(LONG_BREAK);
      } else {
        setMode('shortBreak');
        setTimeLeft(SHORT_BREAK);
      }
    } else {
      setMode('work');
      setTimeLeft(WORK_TIME);
    }
  };

  const completeCurrentTask = () => {
    const currentTask = taskList[currentTaskIndex];
    const newCompletedTasks = [...completedTasks, currentTask];
    setCompletedTasks(newCompletedTasks);
    
    const remainingTasks = taskList.filter((_, idx) => idx !== currentTaskIndex);
    setTaskList(remainingTasks);
    
    if (remainingTasks.length === 0) {
      onComplete(newCompletedTasks, pomodorosCompleted);
      return;
    }
    
    if (currentTaskIndex >= remainingTasks.length) {
      setCurrentTaskIndex(Math.max(0, remainingTasks.length - 1));
    }
    
    setCurrentPomodoro(1);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const skipSession = () => {
    setIsRunning(false);
    handleTimerComplete();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = mode === 'work' ? WORK_TIME : mode === 'shortBreak' ? SHORT_BREAK : LONG_BREAK;
    return ((total - timeLeft) / total) * 100;
  };

  const removeTask = (index: number) => {
    const newTaskList = taskList.filter((_, idx) => idx !== index);
    setTaskList(newTaskList);
    if (index === currentTaskIndex && currentTaskIndex >= newTaskList.length) {
      setCurrentTaskIndex(Math.max(0, newTaskList.length - 1));
    } else if (index < currentTaskIndex) {
      setCurrentTaskIndex(currentTaskIndex - 1);
    }
  };

  const moveTask = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= taskList.length) return;
    
    const newTaskList = [...taskList];
    [newTaskList[index], newTaskList[newIndex]] = [newTaskList[newIndex], newTaskList[index]];
    setTaskList(newTaskList);
    
    if (currentTaskIndex === index) {
      setCurrentTaskIndex(newIndex);
    } else if (currentTaskIndex === newIndex) {
      setCurrentTaskIndex(index);
    }
  };

  const addNewTask = () => {
    if (!newTaskName.trim()) return;
    
    const pomodoros = newTaskDifficulty === 'hard' ? '3' : newTaskDifficulty === 'medium' ? '2' : '1';
    const newTask: Task = {
      name: newTaskName,
      expected_time: pomodoros,
      difficulty: newTaskDifficulty,
      priority: 'medium',
      description: `Added during session`
    };
    
    setTaskList([...taskList, newTask]);
    setNewTaskName('');
    setNewTaskDifficulty('medium');
    setShowAddTask(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'hard': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'medium': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const currentTask = taskList[currentTaskIndex];
  const upcomingTasks = taskList.slice(currentTaskIndex + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-400 to-amber-500 p-2.5 rounded-xl shadow-lg">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-orange-900">{schedule.name}</h2>
              <p className="text-orange-600 text-sm">{taskList.length} tasks remaining</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 px-4 py-2">
              {pomodorosCompleted} pomodoros
            </Badge>
            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 px-4 py-2">
              {completedTasks.length} completed
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main Timer Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Immersive Timer Card */}
            <Card className="relative overflow-hidden shadow-2xl border-0">
              <div className={`absolute inset-0 bg-gradient-to-br ${mode === 'work' ? 'from-orange-400/20 via-amber-400/20 to-orange-300/20' : 'from-blue-400/20 via-cyan-400/20 to-blue-300/20'} animate-pulse`}></div>
              
              <div className="relative p-12 text-center backdrop-blur-sm">
                {/* Mode Badge */}
                <div className="mb-8">
                  {mode === 'work' ? (
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl">
                      <Timer className="w-5 h-5" />
                      <span className="font-medium">Focus Time</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-xl">
                      <Coffee className="w-5 h-5" />
                      <span className="font-medium">{mode === 'shortBreak' ? 'Short Break' : 'Long Break'}</span>
                    </div>
                  )}
                </div>

                {/* Large Timer Display */}
                <div className={`text-[120px] leading-none tabular-nums font-light mb-10 bg-gradient-to-br ${mode === 'work' ? 'from-orange-600 to-amber-600' : 'from-blue-600 to-cyan-600'} bg-clip-text text-transparent drop-shadow-xl`}>
                  {formatTime(timeLeft)}
                </div>

                {/* Progress Bar */}
                <div className="mb-10 px-8">
                  <Progress 
                    value={getProgress()} 
                    className={`h-3 rounded-full ${mode === 'work' ? '[&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-amber-500' : '[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-cyan-500'}`}
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={toggleTimer} 
                    size="lg" 
                    className="w-48 h-16 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-6 h-6 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={skipSession} 
                    variant="outline" 
                    size="lg"
                    className="h-16 border-2 border-orange-300 text-orange-700 hover:bg-orange-100 hover:border-orange-400 transition-all duration-300"
                  >
                    <SkipForward className="w-5 h-5 mr-2" />
                    Skip
                  </Button>
                </div>
              </div>
            </Card>

            {/* Current Task Card */}
            {mode === 'work' && currentTask && (
              <Card className="p-6 bg-gradient-to-br from-white to-orange-50/50 border-2 border-orange-200 shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={false}
                      onCheckedChange={() => completeCurrentTask()}
                      className="w-6 h-6 border-2 border-orange-400 data-[state=checked]:bg-orange-500"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-orange-900">{currentTask.name}</h3>
                      </div>
                      <p className="text-orange-700 text-sm">{currentTask.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={`${getDifficultyColor(currentTask.difficulty)} border text-xs`}>
                      {currentTask.difficulty}
                    </Badge>
                  </div>
                </div>
                
                {/* Progress */}
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex-1">
                    <Progress 
                      value={(currentPomodoro / parseInt(currentTask.expected_time)) * 100} 
                      className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-amber-500"
                    />
                  </div>
                  <div className="text-sm text-orange-900 font-medium">
                    {currentPomodoro}/{currentTask.expected_time} pomodoros
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar - Task Management */}
          <div className="lg:col-span-2 space-y-4">
            {/* Upcoming Tasks */}
            <Card className="p-4 bg-white/95 border-2 border-amber-200 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-amber-900">Task List</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAddTask(!showAddTask)}
                  className="h-8 text-amber-700 hover:bg-amber-100"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              {showAddTask && (
                <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Input
                    placeholder="Task name..."
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNewTask()}
                    className="mb-2 border-amber-300 text-sm"
                  />
                  <div className="flex gap-2">
                    <Select value={newTaskDifficulty} onValueChange={setNewTaskDifficulty}>
                      <SelectTrigger className="text-sm border-amber-300">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy (1 pomodoro)</SelectItem>
                        <SelectItem value="medium">Medium (2 pomodoros)</SelectItem>
                        <SelectItem value="hard">Hard (3 pomodoros)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={addNewTask} className="bg-amber-500 hover:bg-amber-600">
                      Add
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {taskList.map((task, idx) => (
                  <div 
                    key={idx} 
                    className={`group p-3 rounded-lg border transition-all ${
                      idx === currentTaskIndex 
                        ? 'bg-gradient-to-br from-orange-100 to-amber-100 border-orange-300' 
                        : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {idx === currentTaskIndex && (
                            <Clock className="w-3 h-3 text-orange-600 flex-shrink-0" />
                          )}
                          <div className="text-sm text-amber-900 truncate">{task.name}</div>
                        </div>
                        <div className="text-xs text-amber-700">{task.expected_time} pomodoros</div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {idx > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveTask(idx, 'up')}
                            className="h-6 w-6 p-0 hover:bg-amber-200"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                        )}
                        {idx < taskList.length - 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveTask(idx, 'down')}
                            className="h-6 w-6 p-0 hover:bg-amber-200"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        )}
                        {idx !== currentTaskIndex && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeTask(idx)}
                            className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Completed Tasks */}
            <Card className="p-4 bg-white/95 border-2 border-emerald-200 shadow-xl">
              <h3 className="text-emerald-900 mb-3">Completed</h3>
              <div className="space-y-2">
                {completedTasks.length > 0 ? (
                  completedTasks.slice(-5).reverse().map((task, idx) => (
                    <div key={idx} className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <div className="text-sm text-emerald-900 truncate">{task.name}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-emerald-600 text-sm">No tasks completed yet</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Break Reminder */}
            {mode !== 'work' && (
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                <div className="flex items-start gap-2">
                  <Coffee className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-900 mb-1">Break time!</p>
                    <p className="text-xs text-blue-700">Step away and recharge</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
