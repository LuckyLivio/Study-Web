import React from 'react';
import { Portfolio } from '../services/portfolioService';
// 暂时移除react-icons导入，使用简单的文本替代

interface PortfolioCardProps {
  portfolio: Portfolio;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ portfolio, viewMode, onClick }) => {
  const mainImage = portfolio.images.find(img => img.isMain) || portfolio.images[0];
  
  const getCategoryColor = (category: string) => {
    const colors = {
      '插画': 'bg-purple-100 text-purple-800',
      '贴纸': 'bg-pink-100 text-pink-800',
      '编程项目': 'bg-blue-100 text-blue-800',
      '设计作品': 'bg-green-100 text-green-800',
      '其他': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors['其他'];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      '已完成': 'bg-green-100 text-green-800',
      '进行中': 'bg-yellow-100 text-yellow-800',
      '暂停': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors['进行中'];
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer p-4"
        onClick={onClick}
      >
        <div className="flex gap-4">
          {/* 图片 */}
          <div className="flex-shrink-0">
            {mainImage ? (
              <img
                src={mainImage.url}
                alt={portfolio.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-sm">无图片</span>
              </div>
            )}
          </div>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {portfolio.title}
                  </h3>
                  {portfolio.featured && (
                    <span>*</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                  {portfolio.description}
                </p>
              </div>
            </div>

            {/* 标签和分类 */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(portfolio.category)}`}>
                {portfolio.category}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(portfolio.status)}`}>
                {portfolio.status}
              </span>
              {portfolio.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  #{tag}
                </span>
              ))}
              {portfolio.tags.length > 3 && (
                <span className="text-gray-500 text-xs">+{portfolio.tags.length - 3}</span>
              )}
            </div>

            {/* 底部信息 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <span>👁</span>
                  <span>{portfolio.viewCount || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>♥</span>
                  <span>{portfolio.likeCount || 0}</span>
                </div>
                {portfolio.createdAt && (
                  <span>{new Date(portfolio.createdAt).toLocaleDateString()}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {portfolio.projectUrl && (
                  <a
                    href={portfolio.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-500 hover:text-blue-600 transition-colors"
                    title="查看项目"
                  >
                    <span>↗</span>
                  </a>
                )}
                {portfolio.githubUrl && (
                  <a
                    href={portfolio.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                    title="查看代码"
                  >
                    <span>⚡</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 网格视图
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
      onClick={onClick}
    >
      {/* 图片 */}
      <div className="relative aspect-video bg-gray-200">
        {mainImage ? (
          <img
            src={mainImage.url}
            alt={portfolio.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400">无图片</span>
          </div>
        )}
        
        {/* 精选标识 */}
        {portfolio.featured && (
          <div className="absolute top-2 right-2">
            <span>*</span>
          </div>
        )}
        
        {/* 状态标识 */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(portfolio.status)}`}>
            {portfolio.status}
          </span>
        </div>

        {/* 悬停时显示的链接 */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            {portfolio.projectUrl && (
              <a
                href={portfolio.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-all"
                title="查看项目"
              >
                <span>↗</span>
              </a>
            )}
            {portfolio.githubUrl && (
              <a
                href={portfolio.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-all"
                title="查看代码"
              >
                <span>⚡</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="p-4">
        {/* 标题和分类 */}
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {portfolio.title}
          </h3>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(portfolio.category)}`}>
            {portfolio.category}
          </span>
        </div>

        {/* 描述 */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {portfolio.description}
        </p>

        {/* 标签 */}
        {portfolio.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {portfolio.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                #{tag}
              </span>
            ))}
            {portfolio.tags.length > 3 && (
              <span className="text-gray-500 text-xs self-center">+{portfolio.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* 技术栈 */}
        {portfolio.technologies && portfolio.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {portfolio.technologies.slice(0, 3).map((tech, index) => (
              <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                {tech}
              </span>
            ))}
            {portfolio.technologies.length > 3 && (
              <span className="text-gray-500 text-xs self-center">+{portfolio.technologies.length - 3}</span>
            )}
          </div>
        )}

        {/* 底部信息 */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              👁
              <span>{portfolio.viewCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              ♥
              <span>{portfolio.likeCount || 0}</span>
            </div>
          </div>
          {portfolio.createdAt && (
            <span>{new Date(portfolio.createdAt).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioCard;