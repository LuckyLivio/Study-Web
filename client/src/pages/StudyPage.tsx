import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import {
  BookOpenIcon,
  DocumentTextIcon,
  CalendarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import StudyNotes from '../components/study/StudyNotes';
import StudyMaterials from '../components/study/StudyMaterials';
import StudyPlans from '../components/study/StudyPlans';
import { studyPlansApi } from '../services/studyService';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const StudyPage: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [upcomingReminders, setUpcomingReminders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    {
      name: '学习笔记',
      icon: DocumentTextIcon,
      component: StudyNotes,
    },
    {
      name: '学习资料',
      icon: BookOpenIcon,
      component: StudyMaterials,
    },
    {
      name: '学习计划',
      icon: CalendarIcon,
      component: StudyPlans,
    },
  ];

  useEffect(() => {
    // 获取即将到期的提醒
    const fetchUpcomingReminders = async () => {
      try {
        const response = await studyPlansApi.getUpcomingReminders();
        setUpcomingReminders(response.data);
      } catch (error) {
        console.error('获取提醒失败:', error);
      }
    };

    fetchUpcomingReminders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <AcademicCapIcon className="h-8 w-8 mr-3 text-primary-600" />
                  学习区
                </h1>
                <p className="mt-2 text-gray-600">
                  管理你的学习笔记、资料和计划
                </p>
              </div>
              
              {/* 搜索框 */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索学习内容..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* 即将到期的提醒 */}
            {upcomingReminders.length > 0 && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  📅 即将到期的提醒
                </h3>
                <div className="space-y-1">
                  {upcomingReminders.slice(0, 3).map((reminder, index) => (
                    <p key={index} className="text-sm text-yellow-700">
                      <span className="font-medium">{reminder.planTitle}</span>: {reminder.reminder.message}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          {/* 标签页导航 */}
          <Tab.List className="flex space-x-1 rounded-xl bg-primary-100 p-1 mb-8">
            {tabs.map((tab, index) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-primary-700 shadow'
                      : 'text-primary-600 hover:bg-white/[0.12] hover:text-primary-700'
                  )
                }
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </div>
              </Tab>
            ))}
          </Tab.List>

          {/* 标签页内容 */}
          <Tab.Panels>
            {tabs.map((tab, index) => (
              <Tab.Panel
                key={index}
                className={classNames(
                  'rounded-xl bg-white p-6 shadow-sm border border-gray-200',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                )}
              >
                <tab.component searchTerm={searchTerm} />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default StudyPage;