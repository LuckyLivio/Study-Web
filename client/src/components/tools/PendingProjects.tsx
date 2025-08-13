import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  EyeIcon,
  CalendarIcon,
  TagIcon,
  PhotoIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
  screenshot?: string;
  startDate?: string;
  endDate?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

const PendingProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  // 模拟项目数据
  const mockProjects: Project[] = [
    {
      id: '1',
      title: '个人博客系统',
      description: '基于React和Node.js的全栈博客平台，支持Markdown编辑、评论系统和用户管理',
      status: 'in-progress',
      progress: 75,
      screenshot: '/api/placeholder/400/200',
      startDate: '2024-01-15',
      tags: ['React', 'Node.js', 'MongoDB'],
      priority: 'high'
    },
    {
      id: '2',
      title: '在线学习平台',
      description: '集成视频播放、作业提交、进度跟踪的综合学习管理系统',
      status: 'pending',
      progress: 0,
      startDate: '2024-02-01',
      tags: ['Vue.js', 'Express', 'MySQL'],
      priority: 'medium'
    },
    {
      id: '3',
      title: '移动端天气应用',
      description: '基于React Native开发的跨平台天气预报应用，支持定位和多城市管理',
      status: 'completed',
      progress: 100,
      screenshot: '/api/placeholder/400/200',
      startDate: '2023-11-01',
      endDate: '2023-12-15',
      tags: ['React Native', 'API集成'],
      priority: 'low'
    },
    {
      id: '4',
      title: 'AI聊天机器人',
      description: '集成DeepSeek API的智能对话系统，支持多轮对话和上下文理解',
      status: 'in-progress',
      progress: 45,
      startDate: '2024-01-20',
      tags: ['AI', 'API', 'WebSocket'],
      priority: 'high'
    }
  ];

  useEffect(() => {
    setProjects(mockProjects);
  }, []);

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'in-progress':
        return <PlayIcon className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'pending':
        return '待定';
      case 'in-progress':
        return '进行中';
      case 'completed':
        return '已完成';
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'high':
        return 'bg-red-100 text-red-800';
    }
  };

  const getPriorityText = (priority: Project['priority']) => {
    switch (priority) {
      case 'low':
        return '低';
      case 'medium':
        return '中';
      case 'high':
        return '高';
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const handleAddProject = (newProject: Omit<Project, 'id'>) => {
    const project: Project = {
      ...newProject,
      id: Date.now().toString()
    };
    setProjects([...projects, project]);
    setShowAddForm(false);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setEditingProject(null);
  };

  const handleViewProject = (project: Project) => {
    setViewingProject(project);
  };

  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* 项目截图 */}
      {project.screenshot ? (
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <PhotoIcon className="h-12 w-12 text-gray-400" />
          <span className="ml-2 text-gray-500 text-sm">项目截图</span>
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <PhotoIcon className="h-12 w-12 text-gray-400" />
          <span className="ml-2 text-gray-500 text-sm">暂无截图</span>
        </div>
      )}

      <div className="p-6">
        {/* 项目标题和状态 */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">{project.title}</h3>
          <div className="flex items-center space-x-2 ml-4">
            {getStatusIcon(project.status)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {getStatusText(project.status)}
            </span>
          </div>
        </div>

        {/* 项目描述 */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

        {/* 进度条 */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">进度</span>
            <span className="text-sm text-gray-500">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 项目信息 */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>{project.startDate}</span>
            {project.endDate && (
              <>
                <span className="mx-2">-</span>
                <span>{project.endDate}</span>
              </>
            )}
          </div>
          <div className="flex items-center">
            <TagIcon className="h-4 w-4 mr-1" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
              {getPriorityText(project.priority)}优先级
            </span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-2">
          <button 
            onClick={() => handleViewProject(project)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            查看详情
          </button>
          <button
            onClick={() => setEditingProject(project)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteProject(project.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">正在开发的项目</h1>
        <p className="text-gray-600">管理和跟踪你的开发项目进度</p>
      </div>

      {/* 过滤器和添加按钮 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex space-x-2">
          {(['all', 'pending', 'in-progress', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? '全部' : getStatusText(status)}
              <span className="ml-2 text-xs opacity-75">
                ({status === 'all' ? projects.length : projects.filter(p => p.status === status).length})
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          添加项目
        </button>
      </div>

      {/* 项目统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">总项目</p>
              <p className="text-2xl font-semibold text-gray-900">{projects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">待定</p>
              <p className="text-2xl font-semibold text-gray-900">
                {projects.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PlayIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">进行中</p>
              <p className="text-2xl font-semibold text-gray-900">
                {projects.filter(p => p.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">已完成</p>
              <p className="text-2xl font-semibold text-gray-900">
                {projects.filter(p => p.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 项目列表 */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无项目</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' ? '还没有任何项目' : `没有${getStatusText(filter)}的项目`}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              添加第一个项目
            </button>
          </div>
        </div>
      )}

      {/* 添加项目表单模态框 */}
      {showAddForm && (
        <ProjectFormModal
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddProject}
        />
      )}

      {/* 编辑项目表单模态框 */}
      {editingProject && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSubmit={(project: Project | Omit<Project, "id">) => {
            if ('id' in project) {
              handleUpdateProject(project as Project);
            }
          }}
        />
      )}

      {/* 项目详情模态框 */}
      {viewingProject && (
        <ProjectDetailModal
          project={viewingProject}
          onClose={() => setViewingProject(null)}
        />
      )}
    </div>
  );
};

// 项目表单模态框组件
const ProjectFormModal: React.FC<{
  project?: Project;
  onClose: () => void;
  onSubmit: (project: Project | Omit<Project, 'id'>) => void;
}> = ({ project, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'pending' as Project['status'],
    progress: project?.progress || 0,
    startDate: project?.startDate || '',
    endDate: project?.endDate || '',
    tags: project?.tags.join(', ') || '',
    priority: project?.priority || 'medium' as Project['priority']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    if (project) {
      onSubmit({ ...projectData, id: project.id });
    } else {
      onSubmit(projectData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{project ? '编辑项目' : '添加项目'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">项目标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">项目描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">待定</option>
                <option value="in-progress">进行中</option>
                <option value="completed">已完成</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Project['priority'] })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">进度 ({formData.progress}%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签 (用逗号分隔)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="React, Node.js, MongoDB"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              {project ? '更新' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 项目详情模态框组件
const ProjectDetailModal: React.FC<{
  project: Project;
  onClose: () => void;
}> = ({ project, onClose }) => {
  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'in-progress':
        return <PlayIcon className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'pending':
        return '待定';
      case 'in-progress':
        return '进行中';
      case 'completed':
        return '已完成';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
    }
  };

  const getPriorityText = (priority: Project['priority']) => {
    switch (priority) {
      case 'low':
        return '低';
      case 'medium':
        return '中';
      case 'high':
        return '高';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {project.screenshot && (
          <div className="mb-6">
            <img
              src={project.screenshot}
              alt={project.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">项目描述</h3>
            <p className="text-gray-600">{project.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">状态</h4>
              <div className="flex items-center">
                {getStatusIcon(project.status)}
                <span className="ml-2 text-gray-600">{getStatusText(project.status)}</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">优先级</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                {getPriorityText(project.priority)}优先级
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">进度</h4>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{project.progress}% 完成</p>
          </div>

          {(project.startDate || project.endDate) && (
            <div>
              <h4 className="font-medium text-gray-900 mb-1">时间安排</h4>
              <div className="flex items-center text-gray-600">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>{project.startDate}</span>
                {project.endDate && (
                  <>
                    <span className="mx-2">-</span>
                    <span>{project.endDate}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {project.tags.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">技术标签</h4>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingProjects;