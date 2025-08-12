import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  CalendarDaysIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface ExamEvent {
  id: string;
  title: string;
  subject: string;
  date: string;
  time: string;
  location?: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  type: 'exam' | 'assignment' | 'presentation' | 'other';
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const ExamCountdown: React.FC = () => {
  const [events, setEvents] = useState<ExamEvent[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ExamEvent | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filter, setFilter] = useState<'all' | 'exam' | 'assignment' | 'presentation' | 'other'>('all');

  const [newEvent, setNewEvent] = useState<Omit<ExamEvent, 'id'>>({
    title: '',
    subject: '',
    date: '',
    time: '',
    location: '',
    description: '',
    priority: 'medium',
    type: 'exam'
  });

  // 初始化示例数据
  useEffect(() => {
    const sampleEvents: ExamEvent[] = [
      {
        id: '1',
        title: '高等数学期末考试',
        subject: '数学',
        date: '2024-01-15',
        time: '09:00',
        location: '教学楼A101',
        description: '涵盖微积分、线性代数等内容',
        priority: 'high',
        type: 'exam'
      },
      {
        id: '2',
        title: '英语口语展示',
        subject: '英语',
        date: '2024-01-12',
        time: '14:30',
        location: '语言实验室',
        description: '5分钟个人演讲',
        priority: 'medium',
        type: 'presentation'
      },
      {
        id: '3',
        title: '计算机程序设计作业',
        subject: '计算机科学',
        date: '2024-01-10',
        time: '23:59',
        location: '在线提交',
        description: '完成Java项目开发',
        priority: 'high',
        type: 'assignment'
      }
    ];
    setEvents(sampleEvents);
  }, []);

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const calculateTimeRemaining = (date: string, time: string): TimeRemaining | null => {
    const eventDateTime = new Date(`${date}T${time}`);
    const now = currentTime;
    const diff = eventDateTime.getTime() - now.getTime();

    if (diff <= 0) {
      return null; // 事件已过期
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam': return '📝';
      case 'assignment': return '📋';
      case 'presentation': return '🎤';
      default: return '📅';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'text-blue-600 bg-blue-50';
      case 'assignment': return 'text-purple-600 bg-purple-50';
      case 'presentation': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;

    const event: ExamEvent = {
      ...newEvent,
      id: Date.now().toString()
    };

    setEvents([...events, event]);
    setNewEvent({
      title: '',
      subject: '',
      date: '',
      time: '',
      location: '',
      description: '',
      priority: 'medium',
      type: 'exam'
    });
    setShowAddForm(false);
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('确定要删除这个事件吗？')) {
      setEvents(events.filter(event => event.id !== id));
    }
  };

  const handleEditEvent = (event: ExamEvent) => {
    setEditingEvent(event);
    setNewEvent(event);
    setShowAddForm(true);
  };

  const handleUpdateEvent = () => {
    if (!editingEvent || !newEvent.title || !newEvent.date || !newEvent.time) return;

    setEvents(events.map(event => 
      event.id === editingEvent.id ? { ...newEvent, id: editingEvent.id } : event
    ));
    setEditingEvent(null);
    setNewEvent({
      title: '',
      subject: '',
      date: '',
      time: '',
      location: '',
      description: '',
      priority: 'medium',
      type: 'exam'
    });
    setShowAddForm(false);
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.type === filter;
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  const upcomingEvents = filteredEvents.filter(event => {
    const eventDateTime = new Date(`${event.date}T${event.time}`);
    return eventDateTime.getTime() > currentTime.getTime();
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <AcademicCapIcon className="h-6 w-6 mr-2 text-blue-600" />
          考试倒计时与安排
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          添加事件
        </button>
      </div>

      {/* 筛选器 */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {['all', 'exam', 'assignment', 'presentation', 'other'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type as any)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? '全部' : 
             type === 'exam' ? '考试' :
             type === 'assignment' ? '作业' :
             type === 'presentation' ? '展示' : '其他'}
          </button>
        ))}
      </div>

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingEvent ? '编辑事件' : '添加新事件'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="事件标题"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="科目"
              value={newEvent.subject}
              onChange={(e) => setNewEvent({ ...newEvent, subject: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="time"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="地点（可选）"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={newEvent.type}
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="exam">考试</option>
              <option value="assignment">作业</option>
              <option value="presentation">展示</option>
              <option value="other">其他</option>
            </select>
            <select
              value={newEvent.priority}
              onChange={(e) => setNewEvent({ ...newEvent, priority: e.target.value as any })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="high">高优先级</option>
              <option value="medium">中优先级</option>
              <option value="low">低优先级</option>
            </select>
            <textarea
              placeholder="描述（可选）"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingEvent(null);
                setNewEvent({
                  title: '',
                  subject: '',
                  date: '',
                  time: '',
                  location: '',
                  description: '',
                  priority: 'medium',
                  type: 'exam'
                });
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              取消
            </button>
            <button
              onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingEvent ? '更新' : '添加'}
            </button>
          </div>
        </div>
      )}

      {/* 事件列表 */}
      <div className="space-y-4">
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarDaysIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>暂无即将到来的事件</p>
          </div>
        ) : (
          upcomingEvents.map((event) => {
            const timeRemaining = calculateTimeRemaining(event.date, event.time);
            
            return (
              <div
                key={event.id}
                className={`p-4 rounded-lg border-2 ${getPriorityColor(event.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{getTypeIcon(event.type)}</span>
                      <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(event.type)}`}>
                        {event.type === 'exam' ? '考试' :
                         event.type === 'assignment' ? '作业' :
                         event.type === 'presentation' ? '展示' : '其他'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>科目:</strong> {event.subject}</p>
                      <p><strong>时间:</strong> {event.date} {event.time}</p>
                      {event.location && <p><strong>地点:</strong> {event.location}</p>}
                      {event.description && <p><strong>描述:</strong> {event.description}</p>}
                    </div>
                    
                    {timeRemaining && (
                      <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-lg">
                        <div className="flex items-center space-x-1 text-sm font-medium">
                          <ClockIcon className="h-4 w-4" />
                          <span>倒计时:</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="text-center">
                            <div className="text-xl font-bold">{timeRemaining.days}</div>
                            <div className="text-xs text-gray-600">天</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold">{timeRemaining.hours}</div>
                            <div className="text-xs text-gray-600">时</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold">{timeRemaining.minutes}</div>
                            <div className="text-xs text-gray-600">分</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold">{timeRemaining.seconds}</div>
                            <div className="text-xs text-gray-600">秒</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="编辑"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="删除"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExamCountdown;