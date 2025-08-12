import React from 'react';
import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  LinkIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const features = [
    {
      title: '学习管理',
      description: '管理学习笔记、计划和材料，追踪学习进度',
      icon: AcademicCapIcon,
      link: '/study',
      color: 'bg-blue-500',
      stats: '笔记管理 • 学习计划 • 进度追踪'
    },
    {
      title: '作品集',
      description: '展示个人项目和作品，记录成长历程',
      icon: BriefcaseIcon,
      link: '/portfolio',
      color: 'bg-purple-500',
      stats: '项目展示 • 技能记录 • 成果分享'
    },
    {
      title: '博客文章',
      description: '记录思考和经验，分享知识见解',
      icon: DocumentTextIcon,
      link: '/blog',
      color: 'bg-green-500',
      stats: '文章写作 • 知识分享 • 思考记录'
    },
    {
      title: '日程安排',
      description: '管理时间安排，制定学习和工作计划',
      icon: CalendarIcon,
      link: '/schedule',
      color: 'bg-red-500',
      stats: '时间管理 • 计划制定 • 日程提醒'
    },
    {
      title: '消息中心',
      description: '处理重要消息和通知，保持沟通畅通',
      icon: ChatBubbleLeftRightIcon,
      link: '/messages',
      color: 'bg-yellow-500',
      stats: '消息管理 • 通知提醒 • 沟通记录'
    },
    {
      title: '链接收藏',
      description: '收藏有用的网站和资源，便于快速访问',
      icon: LinkIcon,
      link: '/links',
      color: 'bg-indigo-500',
      stats: '资源收藏 • 分类管理 • 快速访问'
    },
    {
      title: '实用工具',
      description: '集成多种实用工具，提高学习和工作效率',
      icon: WrenchScrewdriverIcon,
      link: '/tools',
      color: 'bg-pink-500',
      stats: '番茄钟 • AI助手 • 项目管理'
    }
  ];

  const quickStats = [
    { label: '今日学习时间', value: '2.5小时', icon: ClockIcon },
    { label: '本周完成任务', value: '12个', icon: ChartBarIcon },
    { label: '活跃项目', value: '3个', icon: SparklesIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              欢迎来到
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}学习管理平台
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              一个集学习管理、项目展示、时间规划于一体的综合平台，
              帮助你更好地组织学习生活，追踪成长进步，实现目标梦想。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/study"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                开始学习
                <AcademicCapIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/tools"
                className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                探索工具
                <WrenchScrewdriverIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
              <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">功能模块</h2>
          <p className="text-lg text-gray-600">探索平台的各项功能，找到最适合你的学习工具</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="text-sm text-gray-500 border-t pt-4">
                  {feature.stats}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              开始你的学习之旅
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              立即体验我们的学习管理平台，让学习变得更加高效有趣
            </p>
            <Link
              to="/study"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition-colors"
            >
              立即开始
              <SparklesIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;