import React, { useState, useEffect } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  PlusIcon, 
  HeartIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { messageService, Message } from '../../services/messageService';
import MessageModal from './MessageModal';

const MessageBoard: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    search: ''
  });
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());

  const messageTypes = ['建议', '反馈', '问题', '其他'];

  useEffect(() => {
    fetchMessages();
  }, [currentPage, filters]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await messageService.getPublicMessages({
        page: currentPage,
        limit: 10,
        type: filters.type,
        search: filters.search
      });
      
      if (response.success) {
        setMessages(response.data);
        setTotalPages(response.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('获取留言失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (messageId: string) => {
    if (likedMessages.has(messageId)) return;
    
    try {
      const response = await messageService.likeMessage(messageId);
      if (response.success) {
        setMessages(messages.map(msg => 
          msg._id === messageId 
            ? { ...msg, likes: response.data.likes }
            : msg
        ));
        setLikedMessages(prev => new Set([...Array.from(prev), messageId]));
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchMessages(); // 刷新列表
  };

  const getTypeColor = (type: string) => {
    const colors = {
      '建议': 'bg-blue-100 text-blue-800',
      '反馈': 'bg-green-100 text-green-800',
      '问题': 'bg-yellow-100 text-yellow-800',
      '其他': 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors['其他'];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '待处理':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case '处理中':
        return <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />;
      case '已回复':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '今天';
    if (diffDays === 2) return '昨天';
    if (diffDays <= 7) return `${diffDays}天前`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ChatBubbleLeftRightIcon className="h-8 w-8 mr-3 text-primary-600" />
            留言建议箱
          </h1>
          <p className="text-gray-600 mt-1">分享你的想法，让我们一起改进</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>写留言</span>
        </button>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="搜索留言内容..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-field"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="input-field w-auto min-w-[120px]"
          >
            <option value="">所有类型</option>
            {messageTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 留言列表 */}
      {messages.length === 0 ? (
        <div className="text-center py-12">
          <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无留言</h3>
          <p className="mt-1 text-sm text-gray-500">成为第一个留言的人吧！</p>
          <div className="mt-6">
            <button onClick={() => setIsModalOpen(true)} className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              写留言
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              {/* 留言头部 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(message.type)}`}>
                    {message.type}
                  </span>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(message.status)}
                    <span className="text-sm text-gray-500">{message.status}</span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(message.createdAt!)}
                </span>
              </div>

              {/* 留言内容 */}
              <div className="mb-4">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>

              {/* 标签 */}
              {message.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {message.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 管理员回复 */}
              {message.reply && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-blue-800">管理员回复</span>
                    <span className="text-xs text-blue-600 ml-2">
                      {formatDate(message.reply.repliedAt)}
                    </span>
                  </div>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    {message.reply.content}
                  </p>
                </div>
              )}

              {/* 底部操作 */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(message._id!)}
                    disabled={likedMessages.has(message._id!)}
                    className={`flex items-center space-x-1 text-sm transition-colors ${
                      likedMessages.has(message._id!)
                        ? 'text-red-600 cursor-not-allowed'
                        : 'text-gray-500 hover:text-red-600'
                    }`}
                  >
                    {likedMessages.has(message._id!) ? (
                      <HeartSolidIcon className="h-4 w-4" />
                    ) : (
                      <HeartIcon className="h-4 w-4" />
                    )}
                    <span>{message.likes}</span>
                  </button>
                </div>
                <div className="text-xs text-gray-400">
                  {message.isAnonymous ? '匿名用户' : '实名用户'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          
          <span className="px-3 py-2 text-sm font-medium text-gray-700">
            {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      )}

      {/* 留言模态框 */}
      <MessageModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default MessageBoard;