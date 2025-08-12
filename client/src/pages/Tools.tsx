import React, { useState, Suspense } from 'react';
import { 
  ClipboardDocumentListIcon, 
  ClockIcon, 
  BellIcon, 
  SparklesIcon,
  Squares2X2Icon,
  MapPinIcon,
  CloudIcon,
  AcademicCapIcon,
  ServerIcon,
  FolderIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

// 懒加载工具组件以减少内存使用
const TodoList = React.lazy(() => import('../components/tools/TodoList'));
const PomodoroTimer = React.lazy(() => import('../components/tools/PomodoroTimer'));
const RemindersCenter = React.lazy(() => import('../components/tools/RemindersCenter'));
const EmojiGenerator = React.lazy(() => import('../components/tools/EmojiGenerator'));
const MapWidget = React.lazy(() => import('../components/tools/MapWidget'));
const WeatherWidget = React.lazy(() => import('../components/tools/WeatherWidget'));
const ExamCountdown = React.lazy(() => import('../components/tools/ExamCountdown'));
const ServerStatus = React.lazy(() => import('../components/tools/ServerStatus'));
const PendingProjects = React.lazy(() => import('../components/tools/PendingProjects'));
const AIChat = React.lazy(() => import('../components/tools/AIChat'));

type ToolType = 'overview' | 'todo' | 'pomodoro' | 'reminders' | 'emoji' | 'map' | 'weather' | 'exam' | 'server' | 'projects' | 'ai-chat';

const Tools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('overview');

  const tools = [
    {
      id: 'todo' as ToolType,
      name: 'Todo清单',
      description: '管理您的待办事项，提高工作效率',
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      id: 'pomodoro' as ToolType,
      name: '番茄钟计时器',
      description: '专注工作，合理休息，提升专注力',
      icon: ClockIcon,
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600'
    },
    {
      id: 'reminders' as ToolType,
      name: '提醒事项中心',
      description: '设置提醒，不错过重要事项',
      icon: BellIcon,
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600'
    },
    {
      id: 'emoji' as ToolType,
      name: '表情生成器与学习贴士',
      description: '随机表情、学习贴士、励志语录等小工具',
      icon: SparklesIcon,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      id: 'map' as ToolType,
      name: '校园地图',
      description: '查看校园重要地点，快速定位目标位置',
      icon: MapPinIcon,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      id: 'weather' as ToolType,
      name: '天气信息',
      description: '实时天气预报，温度湿度风速等信息',
      icon: CloudIcon,
      color: 'bg-cyan-500',
      hoverColor: 'hover:bg-cyan-600'
    },
    {
      id: 'exam' as ToolType,
      name: '考试倒计时',
      description: '管理考试安排，倒计时提醒重要事件',
      icon: AcademicCapIcon,
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600'
    },
    {
      id: 'server' as ToolType,
      name: '服务器状态',
      description: '监控服务器运行状态和系统性能指标',
      icon: ServerIcon,
      color: 'bg-gray-500',
      hoverColor: 'hover:bg-gray-600'
    },
    {
      id: 'projects' as ToolType,
      name: '正在开发的项目',
      description: '管理和跟踪开发项目进度，项目状态管理',
      icon: FolderIcon,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600'
    },
    {
      id: 'ai-chat' as ToolType,
      name: 'AI对话智能体',
      description: '基于DeepSeek API的智能聊天助手，学习辅助',
      icon: CpuChipIcon,
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            <Squares2X2Icon className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">小工具集合区</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          这里汇集了多种实用的小工具，帮助您提高工作效率、管理时间、保持专注。
          选择下方的工具开始使用吧！
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <div
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className="group cursor-pointer bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200 hover:border-gray-300"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 ${tool.color} ${tool.hoverColor} rounded-lg transition-colors group-hover:scale-110 transform duration-300`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="text-sm text-blue-600 group-hover:text-blue-700 font-medium">
                  开始使用 →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 快速统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">📋</div>
          <div className="text-sm text-blue-700 mt-1">待办管理</div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">🍅</div>
          <div className="text-sm text-red-700 mt-1">专注计时</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">⏰</div>
          <div className="text-sm text-yellow-700 mt-1">智能提醒</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">✨</div>
          <div className="text-sm text-purple-700 mt-1">创意工具</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">🗺️</div>
          <div className="text-sm text-green-700 mt-1">校园地图</div>
        </div>
        <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-cyan-600">🌤️</div>
          <div className="text-sm text-cyan-700 mt-1">天气信息</div>
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">🎓</div>
          <div className="text-sm text-indigo-700 mt-1">考试倒计时</div>
        </div>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">🖥️</div>
          <div className="text-sm text-gray-700 mt-1">服务器状态</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">📁</div>
          <div className="text-sm text-orange-700 mt-1">项目管理</div>
        </div>
        <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-pink-600">🤖</div>
          <div className="text-sm text-pink-700 mt-1">AI助手</div>
        </div>
      </div>
    </div>
  );

  const renderToolContent = () => {
    const LoadingSpinner = () => (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );

    switch (activeTool) {
      case 'todo':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <TodoList />
          </Suspense>
        );
      case 'pomodoro':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PomodoroTimer />
          </Suspense>
        );
      case 'reminders':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <RemindersCenter />
          </Suspense>
        );
      case 'emoji':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <EmojiGenerator />
          </Suspense>
        );
      case 'map':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MapWidget />
          </Suspense>
        );
      case 'weather':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <WeatherWidget />
          </Suspense>
        );
      case 'exam':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ExamCountdown />
          </Suspense>
        );
      case 'server':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ServerStatus />
          </Suspense>
        );
      case 'projects':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PendingProjects />
          </Suspense>
        );
      case 'ai-chat':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AIChat />
          </Suspense>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      {activeTool !== 'overview' && (
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveTool('overview')}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Squares2X2Icon className="h-5 w-5 mr-2" />
                  <span className="font-medium">小工具集合</span>
                </button>
                <span className="text-gray-400">/</span>
                <span className="text-gray-800 font-medium">
                  {tools.find(tool => tool.id === activeTool)?.name}
                </span>
              </div>
              
              {/* 工具切换按钮 */}
              <div className="flex items-center space-x-2">
                {tools.map((tool) => {
                  const IconComponent = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        activeTool === tool.id
                          ? `${tool.color} text-white`
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      }`}
                      title={tool.name}
                    >
                      <IconComponent className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderToolContent()}
      </div>
    </div>
  );
};

export default Tools;