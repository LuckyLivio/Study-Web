import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, StopIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import pomodoroService, { PomodoroSession } from '../../services/pomodoroService';

interface PomodoroTimerProps {
  className?: string;
}

type TimerType = 'work' | 'shortBreak' | 'longBreak';
type TimerStatus = 'idle' | 'running' | 'paused';

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ className = '' }) => {
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [timerType, setTimerType] = useState<TimerType>('work');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25分钟
  const [task, setTask] = useState('');
  const [category, setCategory] = useState('工作');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<any>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const pausedTimeRef = useRef(0);

  const timerSettings = {
    work: { duration: 25 * 60, label: '工作时间', color: 'bg-red-500' },
    shortBreak: { duration: 5 * 60, label: '短休息', color: 'bg-green-500' },
    longBreak: { duration: 15 * 60, label: '长休息', color: 'bg-blue-500' }
  };

  useEffect(() => {
    setTimeLeft(timerSettings[timerType].duration);
  }, [timerType]);

  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status]);

  const handleStart = async () => {
    try {
      if (status === 'idle') {
        // 开始新的会话
        const sessionData = {
          type: timerType === 'work' ? '工作' as const : timerType === 'shortBreak' ? '短休息' as const : '长休息' as const,
          duration: timerSettings[timerType].duration,
          task: task || undefined,
          category: category as '工作' | '学习' | '阅读' | '编程' | '其他'
        };
        
        const response = await pomodoroService.startSession(sessionData);
        setCurrentSession(response.data);
        startTimeRef.current = new Date();
        pausedTimeRef.current = 0;
      }
      
      setStatus('running');
    } catch (error) {
      console.error('启动番茄钟失败:', error);
    }
  };

  const handlePause = () => {
    setStatus('paused');
    if (startTimeRef.current) {
      pausedTimeRef.current += Date.now() - startTimeRef.current.getTime();
    }
  };

  const handleStop = async () => {
    try {
      if (currentSession) {
        await pomodoroService.cancelSession(currentSession._id);
      }
      
      setStatus('idle');
      setTimeLeft(timerSettings[timerType].duration);
      setCurrentSession(null);
      startTimeRef.current = null;
      pausedTimeRef.current = 0;
    } catch (error) {
      console.error('停止番茄钟失败:', error);
    }
  };

  const handleTimerComplete = async () => {
    try {
      if (currentSession) {
        const actualDuration = timerSettings[timerType].duration;
        await pomodoroService.completeSession(currentSession._id, {
          notes: `${timerSettings[timerType].label}完成`
        });
        
        if (timerType === 'work') {
          setCompletedSessions(prev => prev + 1);
          // 自动切换到休息时间
          const nextType = completedSessions > 0 && (completedSessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
          setTimerType(nextType);
        } else {
          // 休息结束，切换到工作时间
          setTimerType('work');
        }
      }
      
      setStatus('idle');
      setCurrentSession(null);
      startTimeRef.current = null;
      pausedTimeRef.current = 0;
      
      // 播放提示音
      playNotificationSound();
      
      // 显示通知
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`${timerSettings[timerType].label}完成！`, {
          body: timerType === 'work' ? '休息一下吧！' : '开始工作吧！',
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.error('完成番茄钟失败:', error);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    audio.play().catch(() => {});
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const fetchStats = async () => {
    try {
      const response = await pomodoroService.getSessions({ limit: 100 });
      const sessions = response.data.sessions;
      const totalSessions = sessions.length;
      const completedSessions = sessions.filter(s => s.isCompleted).length;
      const totalFocusTime = sessions.reduce((acc, s) => acc + (s.actualDuration || 0), 0);
      
      setStats({
        totalSessions,
        completedSessions,
        totalFocusTime
      });
      setShowStats(true);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = timerSettings[timerType].duration;
    const elapsed = total - timeLeft;
    return (elapsed / total) * 100;
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">番茄钟计时器</h2>
        <button
          onClick={fetchStats}
          className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ChartBarIcon className="h-4 w-4 mr-1" />
          统计
        </button>
      </div>

      {/* 计时器类型选择 */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {Object.entries(timerSettings).map(([type, settings]) => (
            <button
              key={type}
              onClick={() => {
                if (status === 'idle') {
                  setTimerType(type as TimerType);
                }
              }}
              disabled={status !== 'idle'}
              className={`px-4 py-2 rounded-md transition-colors ${
                timerType === type
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              } ${status !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {settings.label}
            </button>
          ))}
        </div>
      </div>

      {/* 圆形进度条和时间显示 */}
      <div className="flex justify-center mb-8">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={timerSettings[timerType].color.replace('bg-', '#')}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-gray-800">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {timerSettings[timerType].label}
            </div>
          </div>
        </div>
      </div>

      {/* 任务输入 */}
      {status === 'idle' && timerType === 'work' && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="当前任务（可选）"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="工作">工作</option>
              <option value="学习">学习</option>
              <option value="创作">创作</option>
              <option value="其他">其他</option>
            </select>
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="flex justify-center space-x-4 mb-6">
        {status === 'idle' ? (
          <button
            onClick={handleStart}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            开始
          </button>
        ) : (
          <>
            <button
              onClick={status === 'running' ? handlePause : handleStart}
              className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                status === 'running'
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {status === 'running' ? (
                <>
                  <PauseIcon className="h-5 w-5 mr-2" />
                  暂停
                </>
              ) : (
                <>
                  <PlayIcon className="h-5 w-5 mr-2" />
                  继续
                </>
              )}
            </button>
            <button
              onClick={handleStop}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <StopIcon className="h-5 w-5 mr-2" />
              停止
            </button>
          </>
        )}
      </div>

      {/* 会话统计 */}
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
          <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-blue-800">
            今日完成: {completedSessions} 个番茄钟
          </span>
        </div>
      </div>

      {/* 统计弹窗 */}
      {showStats && stats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">番茄钟统计</h3>
              <button
                onClick={() => setShowStats(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.totalSessions || 0}</div>
                  <div className="text-sm text-green-700">总会话数</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.completedSessions || 0}</div>
                  <div className="text-sm text-blue-700">已完成</div>
                </div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((stats.totalFocusTime || 0) / 60)} 分钟
                </div>
                <div className="text-sm text-purple-700">总专注时间</div>
              </div>
              
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(((stats.completedSessions || 0) / (stats.totalSessions || 1)) * 100)}%
                </div>
                <div className="text-sm text-orange-700">完成率</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;