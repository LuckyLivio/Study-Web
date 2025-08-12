import React, { useState, useEffect } from 'react';
import { 
  LinkIcon, 
  ArrowTopRightOnSquareIcon,
  EyeIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { linkService, ExternalLink } from '../../services/linkService';

const ExternalLinks: React.FC = () => {
  const [links, setLinks] = useState<{ [category: string]: ExternalLink[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await linkService.getPublicLinks();
      
      if (response.success) {
        const { grouped } = response.data;
        setLinks(grouped);
        setCategories(['all', ...Object.keys(grouped)]);
      }
    } catch (error) {
      console.error('获取外部链接失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (link: ExternalLink) => {
    try {
      // 记录点击
      await linkService.recordClick(link._id!);
      
      // 打开链接
      if (link.openInNewTab) {
        window.open(link.url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = link.url;
      }
    } catch (error) {
      console.error('记录点击失败:', error);
      // 即使记录失败也要打开链接
      if (link.openInNewTab) {
        window.open(link.url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = link.url;
      }
    }
  };

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      'GitHub': '🐙',
      'Bilibili': '📺',
      'Notion': '📝',
      'Xiaohongshu': '📖',
      'Twitter': '🐦',
      'LinkedIn': '💼',
      'YouTube': '📹',
      'Instagram': '📷',
      'Facebook': '👥',
      'TikTok': '🎵',
      'WeChat': '💬',
      'Weibo': '🌐',
      'Zhihu': '🤔',
      'CSDN': '💻',
      'Juejin': '💎',
      'SegmentFault': '🔧',
      'Stack Overflow': '📚',
      'Medium': '✍️',
      'Dev.to': '👨‍💻',
      'Hashnode': '📄',
      'Personal': '🏠',
      'Blog': '📰',
      'Portfolio': '🎨',
      'Other': '🔗'
    };
    return icons[platform] || icons['Other'];
  };

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      'GitHub': 'bg-gray-900 text-white',
      'Bilibili': 'bg-pink-500 text-white',
      'Notion': 'bg-gray-800 text-white',
      'Xiaohongshu': 'bg-red-500 text-white',
      'Twitter': 'bg-blue-400 text-white',
      'LinkedIn': 'bg-blue-600 text-white',
      'YouTube': 'bg-red-600 text-white',
      'Instagram': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      'Facebook': 'bg-blue-600 text-white',
      'TikTok': 'bg-black text-white',
      'WeChat': 'bg-green-500 text-white',
      'Weibo': 'bg-orange-500 text-white',
      'Zhihu': 'bg-blue-700 text-white',
      'CSDN': 'bg-red-600 text-white',
      'Juejin': 'bg-blue-500 text-white',
      'SegmentFault': 'bg-green-600 text-white',
      'Stack Overflow': 'bg-orange-600 text-white',
      'Medium': 'bg-black text-white',
      'Dev.to': 'bg-black text-white',
      'Hashnode': 'bg-blue-600 text-white',
      'Personal': 'bg-purple-600 text-white',
      'Blog': 'bg-indigo-600 text-white',
      'Portfolio': 'bg-teal-600 text-white',
      'Other': 'bg-gray-600 text-white'
    };
    return colors[platform] || colors['Other'];
  };

  const getFilteredLinks = () => {
    if (selectedCategory === 'all') {
      return Object.entries(links).reduce((acc, [category, categoryLinks]) => {
        acc[category] = categoryLinks;
        return acc;
      }, {} as { [category: string]: ExternalLink[] });
    }
    
    return selectedCategory in links ? { [selectedCategory]: links[selectedCategory] } : {};
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredLinks = getFilteredLinks();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 头部 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center mb-4">
          <LinkIcon className="h-8 w-8 mr-3 text-primary-600" />
          外部链接导航
        </h1>
        <p className="text-gray-600">
          探索我在各个平台的内容和作品
        </p>
      </div>

      {/* 分类筛选 */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? '全部' : category}
            </button>
          ))}
        </div>
      </div>

      {/* 链接网格 */}
      {Object.keys(filteredLinks).length === 0 ? (
        <div className="text-center py-12">
          <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无链接</h3>
          <p className="mt-1 text-sm text-gray-500">该分类下暂时没有外部链接</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(filteredLinks).map(([category, categoryLinks]) => (
            <div key={category} className="">
              {selectedCategory === 'all' && (
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <TagIcon className="h-5 w-5 mr-2 text-primary-600" />
                  {category}
                </h2>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryLinks
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((link) => (
                    <div
                      key={link._id}
                      onClick={() => handleLinkClick(link)}
                      className="group cursor-pointer bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary-300 transition-all duration-200 transform hover:-translate-y-1"
                    >
                      {/* 链接头部 */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {/* 平台图标 */}
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${getPlatformColor(link.platform)}`}>
                            {link.icon || getPlatformIcon(link.platform)}
                          </div>
                          
                          {/* 标题和平台 */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                              {link.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {link.platform}
                            </p>
                          </div>
                        </div>
                        
                        {/* 外部链接图标 */}
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
                      </div>

                      {/* 描述 */}
                      {link.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {link.description}
                        </p>
                      )}

                      {/* 底部信息 */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="h-3 w-3" />
                          <span>{link.clickCount || 0} 次访问</span>
                        </div>
                        
                        {link.openInNewTab && (
                          <span className="text-primary-600">新窗口打开</span>
                        )}
                      </div>


                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 底部说明 */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500">
          点击卡片即可访问对应平台 • 数据实时更新
        </p>
      </div>
    </div>
  );
};

export default ExternalLinks;